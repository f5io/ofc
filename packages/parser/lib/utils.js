const { b, n, visit } = require('./parser');

const getDefaultExport = ast => {
  let result;
  const handler = `__ofc_${Math.random().toString(36).slice(2)}`;
  visit(ast, {
    visitExportDefaultDeclaration(path) {
      const node = path.node;
      if (n.Identifier.check(node.declaration)) {
        result = node.declaration.name;
      } else if (n.FunctionDeclaration.check(node.declaration) && node.declaration.id) {
        result = node.declaration.id.name;
        path.insertBefore(node.declaration);
      } else if (n.FunctionDeclaration.check(node.declaration)) {
        const hoist = b.variableDeclaration('const', [
          b.variableDeclarator(
            b.identifier(handler),
            b.functionExpression(
              null,
              node.declaration.params,
              node.declaration.body,
            ),
          )
        ]);
        path.insertBefore(hoist);
        result = handler;
      } else {
        const hoist = b.variableDeclaration('const', [
          b.variableDeclarator(
            b.identifier(handler),
            node.declaration,
          )
        ]);
        path.insertBefore(hoist);
        result = handler;
      }
      path.replace(null);
      return false;
    }
  });
  return result;
};

module.exports = { getDefaultExport };
