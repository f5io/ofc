/**
 * This symbol definition is used to determine whether the last argument
 * passed into a middleware is already a defined `next` call.
 *
 * This allows for `compose(mw1, compose(mw2, mw3))` to work as intended.
 */
const isNext = Symbol('isNext');

const isKoaNext = n => typeof n === 'function' && n.name === 'bound dispatch';

/**
 * `compose` is variadic and takes middlewares as input.
 * It returns a variadic function which is invoked with context(s) and then executes
 * the middleware, currently `left-to-right`, returning a new `async` function.
 */
const compose = (...mw) => async (...args) => {
  const last = args[args.length - 1];
  /**
   * The last `next` in the chain, should either call the `next` handler
   * passed via `args` (denoting a continuation into another composition),
   * or do a no-op.
   */
  const nxt = last[isNext] || isKoaNext(last) ? args.pop() : () => {};
  /**
   * `await` execution of all the middleware provided, by reducing each
   * supplied middleware and wrapping each function execution.
   */
  await mw.reduceRight(
    (next, curr) => async () => {
      /**
       * Decorate each `next` handler with our `isNext` symbol to facilitate
       * composition of compositions.
       */
      next[isNext] = true;
      await curr(...args.concat(next));
    },
    nxt
  )();
};

const uriToRegex = (() => {
  const cache = new Map();

  const constructRegex = uri =>
    `^${uri
      .replace(/\$([^\/]+)/g, '(?<$1>[^/]+?)')
      .replace(/\/index$/, '(?:/index)?')
      .replace(/$/, '/?')
      .replace(/\//g, '\\/')}$`;

  return uri => {
    if (!cache.has(uri)) {
      cache.set(uri, new RegExp(constructRegex(uri), 'i'));
    }
    return cache.get(uri);
  };
})();

const clearRequireCache = input =>
  Object.keys(require.cache)
    .filter(c => c.includes(`.ofc/server/${input}/`) && !c.includes('node_modules'))
    .forEach(s => delete require.cache[s]);

module.exports = {
  compose,
  clearRequireCache,
  uriToRegex
};
