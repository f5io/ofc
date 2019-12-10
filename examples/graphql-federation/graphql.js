import { ApolloServer } from 'apollo-server-koa';
import { ApolloGateway } from '@apollo/gateway';

const gateway = new ApolloGateway({
  serviceList: [
    { name: 'accounts', url: 'http://localhost:3000/accounts/graphql' },
    { name: 'products', url: 'http://localhost:3000/products/graphql' },
    { name: 'reviews', url: 'http://localhost:3000/reviews/graphql' }
  ]
});

export default new ApolloServer({ gateway, subscriptions: false }).getMiddleware();
