export default async (ctx) => {
  ctx.body = `
    Try:

    - /api/hello/$name
    - /api/hello/$greeting/$name
  `;
};
