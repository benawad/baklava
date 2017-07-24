export default {
  Query: {
    fields: {
      getBoard: {
        where: (table, empty, { boardId }) => `${table}.id = ${boardId}`,
      },
    },
  },
  Suggestion: {
    sqlTable: 'suggestions',
    uniqueKey: 'id',
  },
  Board: {
    sqlTable: 'boards',
    uniqueKey: 'id',
    fields: {
      suggestions: {
        sqlJoin: (boardTable, suggestionTable) => `${boardTable}.id = ${suggestionTable}."boardId"`,
      },
    },
  },
};
