import { gateway } from '@ofc/graphql';

export default gateway([
  { name: 'accounts', url: '/accounts/graphql' },
  { name: 'products', url: '/products/graphql' },
  { name: 'reviews', url: '/reviews/graphql' },
]);
