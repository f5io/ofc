export default async (ctx) => {
  ctx.body = `Hello ${ctx.params.name}!`;
};
