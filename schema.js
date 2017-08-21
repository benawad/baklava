export default `

  type NewVoteCount {
    suggestionId: Int!
    incrementAmount: Int!
  }

  type Subscription {
    voteHappened: NewVoteCount!
  }

  type Suggestion {
    id: Int!
    text: String!
    votes: Int!
    creator: User!
  }

  type Board {
    id: Int!
    name: String!
    suggestions: [Suggestion!]!
    owner: Int!
  }

  type User {
    id: Int!
    username: String
    email: String
    createdAt: String!
    updatedAt: String! 
    boards: [Board!]!
    suggestions: [Suggestion!]!
    isAdmin: Boolean!
  }

  type AuthPayload {
    token: String!
    refreshToken: String!
  }

  type Query {
    allUsers: [User!]!
    me: User
    userBoards(owner: Int!): [Board!]!
    userSuggestions(creatorId: String!): [Suggestion!]!
    getBoard(boardId: Int!): Board
    allBoards: [Board!]!
  }

  type Mutation {
    voteOnSuggestion(id: Int!): Boolean!
    updateUser(username: String!, newUsername: String!): [Int!]!
    deleteUser(username: String!): Int!
    createBoard(name: String): Board!
    createSuggestion(text: String, boardId: Int!): Suggestion!
    register(username: String!, email: String!, password: String!): User!
    login(email: String!, password: String!): AuthPayload!
    createUser(username: String!): User!
    refreshTokens(token: String!, refreshToken: String!): AuthPayload!
  }

  schema {
    query: Query
    mutation: Mutation
    subscription: Subscription
  }
`;
