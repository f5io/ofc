const { parser, printer, visit } = require('@ofc/parser');
const { join } = require('path');
const fs = require('fs').promises;

const fetchImpl = join(__dirname, 'template.js');
const fetchAST = fs.readFile(fetchImpl, 'utf8')
  .then(code => parser(code, fetchImpl));

const injectFetch = async (ast) => {
  let inject = false;

  visit(ast, {
    visitCallExpression(path) {
      this.traverse(path);
      if (path.node.callee.name === 'fetch') {
        inject = true;
        path.node.callee.name = '__ofc_fetch';
        path.replace(path.node);
      }
      return false;
    }
  });

  if (inject) {
    const fetch = await fetchAST;
    ast.program.body.unshift(...fetch.program.body);
  }

  return ast;
};

const plugin = () => ({
  name: '@ofc/transform-fetch',
  async transform(code, id) {
    const moduleInfo = this.getModuleInfo(id);
    if (!moduleInfo.isEntry) return;
    const ast = parser(code, id);

    await injectFetch(ast);

    const result = printer(ast, `${id}.map`);
    return { ast, ...result };
  }
});

module.exports = plugin;
