const { ApolloServer } = require('apollo-server');
const typeDefs = require('./typedefs');
const resolvers = require('./resolvers');
const {
  FormatDateDirective,
  AuthenticationDirective,
  AuthorizationDirective,
} = require('./directives');
const { createToken, getUserFromToken } = require('./auth');
const db = require('./db');

const server = new ApolloServer({
  typeDefs,
  resolvers,
  schemaDirectives: {
    formatDate: FormatDateDirective,
    authentication: AuthenticationDirective,
    authorization: AuthorizationDirective,
  },
  context({ req, connection }) {
    const context = { ...db };
    if (connection) {
      return { ...context, ...connection.context };
    }
    const token = req.headers.authorization;
    const user = getUserFromToken(token);
    return { ...context, user, createToken };
  },
  subscriptions: {
    onConnect(params) {
      const token = params.authorization;
      const user = getUserFromToken(token);
      return { user };
    },
  },
  introspection: true,
  playground: true,
});

server.listen(4000).then(({ url }) => {
  console.log(`🚀 Server ready at ${url}`);
});
