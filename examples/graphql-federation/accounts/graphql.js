import { ApolloServer, gql } from 'apollo-server-koa';
import { buildFederatedSchema } from '@apollo/federation/dist/service/buildFederatedSchema';

const users = [
  {
    id: "1",
    name: "Ada Lovelace",
    birthDate: "1815-12-10",
    username: "@ada"
  },
  {
    id: "2",
    name: "Alan Turing",
    birthDate: "1912-06-23",
    username: "@complete"
  }
];

const typeDefs = gql`
  extend type Query {
    me: User
  }

  type User @key(fields: "id") {
    id: ID!
    username: String!
  }
`;

const resolvers = {
  Query: {
    me() {
      return users[0];
    }
  },
  User: {
    __resolveReference(object) {
      return users.find(user => user.id === object.id);
    }
  }
};

export default new ApolloServer({
  schema: buildFederatedSchema({ typeDefs, resolvers }),
}).getMiddleware({ path: '/accounts/graphql' });
