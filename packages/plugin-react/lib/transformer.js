const { parser, printer, b, n, visit } = require('./parser');
const { resolve, join } = require('path');
const fs = require('fs').promises;

const serverImpl = join(__dirname, 'helpers/server.js');
const serverAST = fs.readFile(serverImpl, 'utf8')
  .then(code => parser(code, serverImpl))
  .then(ast => {
    getDefaultExport(ast);
    return ast;
  });

const browserImpl = join(__dirname, 'helpers/browser.js');
const browserAST = fs.readFile(browserImpl, 'utf8')
  .then(code => parser(code, browserImpl))
  .then(ast => {
    getDefaultExport(ast);
    return ast;
  });

const removeNamedImport = (local, ast) => {
  visit(ast, {
    visitImportDefaultSpecifier(path) {
      if (path.node.local.name === local) {
        path.replace(null);
      }
      return false;
    }
  });
  return ast;
}

const hasDefaultImport = (local, ast) => {
  let result = false;
  visit(ast, {
    visitImportDefaultSpecifier(path) {
      if (path.node.local.name === local)
        result = true;
      return false;
    }
  });
  return result;
};

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

const injectServerRenderer = async (ast, identifier, props) => {
  const server = await serverAST;
  ast.program.body.unshift(...server.program.body);

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

const injectBrowserRenderer = async (ast, identifier) => {
  const browser = await browserAST;
  ast.program.body.unshift(...browser.program.body);
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

const plugin = ({ node: server }) => ({
  name: '@ofc/plugin-react',
  async transform(code, id) {
    const moduleInfo = this.getModuleInfo(id);
    if (!moduleInfo.isEntry) return;
    const ast = parser(code, id);
    const props = hasInitialProps(ast);
    const identifier = getDefaultExport(ast);

    await (server
      ? injectServerRenderer(ast, identifier, props)
      : injectBrowserRenderer(ast, identifier));

    const result = printer(ast, `${id}.map`);
    return { ast, ...result };
  },
});

module.exports = plugin;
