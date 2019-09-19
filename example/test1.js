import { two } from './file';
export default async (ctx) => {
  await two();
  await fetch('/test2');
  ctx.body = 'Oh god not again';
};
