export default async (ctx) => {
  ctx.body = `${ctx.params.greeting}, ${ctx.params.name}!`;
};
