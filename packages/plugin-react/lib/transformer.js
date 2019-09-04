const { parser, printer, b, n, visit } = require('./parser');
const { resolve, join } = require('path');

const injectImport = (identifier, source, ast) => {
  const imp = b.importDeclaration([
    b.importDefaultSpecifier(b.identifier(identifier)),
  ], b.literal(source));

  ast.program.body.unshift(imp);
  return ast;
};

const getDefaultExport = ast => {
  let result;
  visit(ast, {
    visitExportDefaultDeclaration(path) {
      const node = path.node;
      if (n.Identifier.check(node.declaration)) {
        result = node.declaration.name;
      } else {
        const hoist = b.variableDeclaration('const', [
          b.variableDeclarator(
            b.identifier('__HANDLER'),
            node.declaration,
          )
        ]);
        path.insertBefore(hoist);
        result = '__HANDLER';
      }
      path.replace(null);
      return false;
    }
  });
  return result;
};

const hasExportNamed = (identifier) => (ast) => {
  let result;
  visit(ast, {
    visitExportNamedDeclaration(path) {
      const node = path.node;
      if (node.declaration) {
        const dec = node.declaration.declarations.find(n => n.id.name === identifier);
        if (dec) {
          result = identifier;
          path.replace(node.declaration);
        }
      } else if (node.specifiers) {
        const spec = node.specifiers.find(n => n.exported.name === identifier);
        if (spec) {
          result = spec.local.name;
          path.replace(null);
        }
      }
      return false;
    }
  });
  return result;
};

const injectServerRenderer = (ast, identifier, props) => {
  injectImport('__ofc', internals.server, ast); 
  const def = b.exportDefaultDeclaration(
    b.callExpression(
      b.identifier('__ofc'),
      [
        b.identifier(identifier),
        props ? b.identifier(props) : b.literal(null)
      ]
    )
  );
  ast.program.body.push(def);
  return ast;
};

const injectBrowserRenderer = (ast, identifier) => {
  injectImport('__ofc', internals.browser, ast);
  const def = b.expressionStatement(
    b.callExpression(
      b.identifier('__ofc'),
      [ b.identifier(identifier) ],
    )
  );
  ast.program.body.push(def);
  return ast;
};


const hasInitialProps = hasExportNamed('getInitialProps');

const internals = {
  browser: resolve(join(__dirname, 'helpers/browser.js')),
  server: resolve(join(__dirname, 'helpers/server.js')),
};

const plugin = ({ node: server }) => ({
  resolveId(id) {
    if (Object.values(internals).includes(id)) {
      return { id, external: false };
    }
    return null;
  },
  transform(code, id) {
    const moduleInfo = this.getModuleInfo(id);
    if (!moduleInfo.isEntry) return;
    const ast = parser(code, id);
    const props = hasInitialProps(ast);
    const identifier = getDefaultExport(ast);

    server
      ? injectServerRenderer(ast, identifier, props)
      : injectBrowserRenderer(ast, identifier);

    const result = printer(ast, `${id}.map`);
    return { ast, ...result };
  },
});

module.exports = plugin;
