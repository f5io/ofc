const { parser, printer, visit, b } = require('@ofc/parser');
const { getDefaultExport } = require('@ofc/parser/lib/utils');
const { join } = require('path');
const fs = require('fs').promises;

const fetchImpl = join(__dirname, 'template.js');
const fetchAST = fs.readFile(fetchImpl, 'utf8')
  .then(code => parser(code, fetchImpl))
  .then(ast => {
    getDefaultExport(ast);
    return ast;
  });

const injectFetch = async (ast) => {
  visit(ast, {
    visitCallExpression(path) {
      this.traverse(path);
      if (path.node.callee.name === 'fetch') {
        path.node.callee.name = '__ofc_fetch';
        path.replace(path.node);
      }
      return false;
    }
  });

  const fetch = await fetchAST;
  ast.program.body.unshift(...fetch.program.body);

  return ast;
};

const injectMiddleware = (ast, identifier) => {
  const def = b.exportDefaultDeclaration(
    b.callExpression(
      b.identifier('__ofc_fetch_compose'),
      [
        b.identifier('__ofc_fetch_middleware'),
        b.identifier(identifier),
      ],
    )
  );
  ast.program.body.push(def);
  return ast;
};

const plugin = () => ({
  name: '@ofc/transform-fetch',
  async transform(code, id) {
    const moduleInfo = this.getModuleInfo(id);
    if (!moduleInfo.isEntry) return;
    const ast = parser(code, id);
    const identifier = getDefaultExport(ast);
  
    await injectFetch(ast);
    injectMiddleware(ast, identifier);

    const result = printer(ast, `${id}.map`);
    return { ast, ...result };
  }
});

module.exports = plugin;
