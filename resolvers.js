import bcrypt from 'bcrypt';
import { PubSub } from 'graphql-subscriptions';
import _ from 'lodash';
import joinMonster from 'join-monster';

import { requiresAuth, requiresAdmin } from './permissions';
import { refreshTokens, tryLogin } from './auth';

export const pubsub = new PubSub();

const VOTE_HAPPENED = 'VOTE_HAPPENED';

export default {
  Subscription: {
    voteHappened: {
      subscribe: () => pubsub.asyncIterator(VOTE_HAPPENED),
    },
  },
  Query: {
    allUsers: requiresAuth.createResolver((parent, args, { models }) => models.User.findAll()),
    me: (parent, args, { models, user }) => {
      if (user) {
        // they are logged in
        return models.User.findOne({
          where: {
            id: user.id,
          },
        });
      }
      // not logged in user
      return null;
    },
    userBoards: (parent, { owner }, { models }) =>
      models.Board.findAll({
        where: {
          owner,
        },
      }),
    userSuggestions: (parent, { creatorId }, { models }) =>
      models.Suggestion.findAll({
        where: {
          creatorId,
        },
      }),
    getBoard: (parent, args, { models }, info) =>
      joinMonster(info, args, sql =>
        models.sequelize.query(sql, { type: models.sequelize.QueryTypes.SELECT }),
      ),
    allBoards: (parent, args, { models }, info) =>
      joinMonster(info, args, sql =>
        models.sequelize.query(sql, { type: models.sequelize.QueryTypes.SELECT }),
      ),
  },

  Mutation: {
    voteOnSuggestion: async (parent, { id }, { models, user }) => {
      await models.Vote.create({ suggestionId: id, userId: user.id });
      pubsub.publish(VOTE_HAPPENED, { voteHappened: { suggestionId: id, incrementAmount: 1 } });
      return true;
    },
    updateUser: (parent, { username, newUsername }, { models }) =>
      models.User.update({ username: newUsername }, { where: { username } }),
    deleteUser: (parent, args, { models }) => models.User.destroy({ where: args }),
    createBoard: async (parent, args, { models, user }) => {
      const board = await models.Board.create({ ...args, owner: user.id });
      return {
        ...board.dataValues,
        suggestions: [],
      };
    },
    createSuggestion: async (parent, args, { models, user }) => {
      const s = await models.Suggestion.create({ ...args, creatorId: user.id });
      return {
        ...s.dataValues,
        votes: 0,
      };
    },
    register: async (parent, args, { models }) => {
      const user = _.pick(args, 'username');
      const localAuth = _.pick(args, ['email', 'password']);
      const passwordPromise = bcrypt.hash(localAuth.password, 12);
      const createUserPromise = models.User.create(user);
      const [password, createdUser] = await Promise.all([passwordPromise, createUserPromise]);
      localAuth.password = password;
      return models.LocalAuth.create({
        ...localAuth,
        userId: createdUser.id,
      });
    },
    login: async (parent, { email, password }, { models, SECRET }) =>
      tryLogin(email, password, models, SECRET),
    refreshTokens: (parent, { token, refreshToken }, { models, SECRET }) =>
      refreshTokens(token, refreshToken, models, SECRET),
  },
};
