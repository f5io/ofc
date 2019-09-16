import { two } from './file';
export default async (ctx) => {
  await two();
  ctx.body = 'Oh god not again';
};
