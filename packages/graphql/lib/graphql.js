import { compose } from '@ofc/middleware';
import { ApolloServer, gql } from 'apollo-server-koa';
import { ApolloGateway } from '@apollo/gateway';
import { RemoteGraphQLDataSource } from '@apollo/gateway/dist/datasources/RemoteGraphQLDataSource'; 
import { buildFederatedSchema } from '@apollo/federation/dist/service/buildFederatedSchema';
import { join } from 'path';

export const gateway = serviceList => {
  let gateway, middleware, deployment;

  class DynamicURLDataSource extends RemoteGraphQLDataSource {
    willSendRequest({ request, context }) {
      request.http.url = deployment.protocol + join(deployment.prefix, request.http.url);
    }
  }

  const ensureDeployment = async (ctx, next) => {
    if (!deployment) deployment = ctx.deployment;
    await next();
  };

  const inner = async (ctx, next) => {
    if (!gateway) {
      gateway = new ApolloGateway({
        serviceList,
        buildService: ({ name, url }) => new DynamicURLDataSource({ url }),
      });
      middleware = new ApolloServer({
        gateway,
        subscriptions: false,
        playground: true,
        introspection: true,
      }).getMiddleware();
    }
    await middleware(ctx, next);
  };

  return compose(
    ensureDeployment,
    inner,
  );
};

export const federated = ({ typeDefs, resolvers, ...rest }) => {
  return new ApolloServer({
    schema: buildFederatedSchema({ typeDefs, resolvers }),
  }).getMiddleware(rest);
};

export { gql };


