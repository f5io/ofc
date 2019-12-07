const { parser, printer, b, n, visit } = require('@ofc/parser');
const { getDefaultExport } = require('@ofc/parser/lib/utils');
const { join } = require('path');
const fs = require('fs').promises;

const nowImpl = join(__dirname, 'template.js');
const nowAST = fs.readFile(nowImpl, 'utf8')
  .then(code => parser(code, nowImpl))
  .then(ast => {
    getDefaultExport(ast);
    return ast;
  });

const injectNowHandler = async (ast, identifier) => {
  const now = await nowAST;
  ast.program.body.unshift(...now.program.body);

  const def = b.exportDefaultDeclaration(
    b.callExpression(
      b.identifier('__ofc_now'),
      [ b.identifier(identifier) ],
    )
  );
  ast.program.body.push(def);
  return ast;
};

const plugin = () => ({
  name: '@ofc/transform-now',
  async transform(code, id) {
    const moduleInfo = this.getModuleInfo(id);
    if (!moduleInfo.isEntry) return;
    const ast = parser(code, id);
    const identifier = getDefaultExport(ast);

    await injectNowHandler(ast, identifier);

    const result = printer(ast, `${id}.map`);
    return { ast, ...result };
  }
});

module.exports = plugin;
