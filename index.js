import express from 'express';
import bodyParser from 'body-parser';
import { graphiqlExpress, graphqlExpress } from 'graphql-server-express';
import { makeExecutableSchema } from 'graphql-tools';
import cors from 'cors';
import jwt from 'jsonwebtoken';
import { createServer } from 'http';
import { execute, subscribe } from 'graphql';
import { SubscriptionServer } from 'subscriptions-transport-ws';
import joinMonsterAdapt from 'join-monster-graphql-tools-adapter';

import typeDefs from './schema';
import resolvers from './resolvers';
import models from './models';
import { refreshTokens } from './auth';
import joinMonsterMetadata from './joinMonsterMetadata';

const schema = makeExecutableSchema({
  typeDefs,
  resolvers,
});

joinMonsterAdapt(schema, joinMonsterMetadata);

const SECRET = 'aslkdjlkaj10830912039jlkoaiuwerasdjflkasd';

const app = express();

const addUser = async (req, res, next) => {
  const token = req.headers['x-token'];
  console.log(token);
  if (token) {
    try {
      const { user } = jwt.verify(token, SECRET);
      req.user = user;
    } catch (err) {
      const refreshToken = req.headers['x-refresh-token'];
      const newTokens = await refreshTokens(token, refreshToken, models, SECRET);
      if (newTokens.token && newTokens.refreshToken) {
        res.set('Access-Control-Expose-Headers', 'x-token, x-refresh-token');
        res.set('x-token', newTokens.token);
        res.set('x-refresh-token', newTokens.refreshToken);
      }
      req.user = newTokens.user;
    }
  }
  next();
};

app.use(cors('*'));
app.use(addUser);

app.use(
  '/graphiql',
  graphiqlExpress({
    endpointURL: '/graphql',
    subscriptionsEndpoint: 'ws://localhost:3030/subscriptions',
  }),
);

app.use(
  '/graphql',
  bodyParser.json(),
  graphqlExpress(req => ({
    schema,
    context: {
      models,
      SECRET,
      user: req.user,
    },
  })),
);

const server = createServer(app);

models.sequelize.sync().then(() =>
  server.listen(3030, () => {
    new SubscriptionServer(
      {
        execute,
        subscribe,
        schema,
      },
      {
        server,
        path: '/subscriptions',
      },
    );
  }),
);
