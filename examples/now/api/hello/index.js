export default async (ctx) => {
  console.log(ctx.headers['x-now-deployment-url']);
  ctx.body = `
    Try:

    - /api/hello/@name
    - /api/hello/@greeting/@name
  `;
};
