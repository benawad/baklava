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
    fields: {
      votes: {
        sqlExpr: () =>
          '(select count(*) from votes where "suggestion"."id" = votes."suggestionId")',
      },
    },
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
