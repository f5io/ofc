const recast = require('recast');
const { visit, types: { namedTypes: n, builders: b } } = recast;

const { default: babelOpts } = require('recast/parsers/_babel_options');
const { parser: babelParser } = require('recast/parsers/babel');

module.exports = {
  parser: (code, file) =>
    recast.parse(code, {
      sourceFileName: file,
      parser: {
        parse(code) {
          const opts = babelOpts({ sourceType: 'module' }); 
          opts.plugins.push('jsx', 'typescript');
          return babelParser.parse(code, opts);
        }
      }
    }),
  printer: (ast, map) =>
    recast.print(ast, { sourceMapName: map }),
  b,
  n,
  visit,
};
