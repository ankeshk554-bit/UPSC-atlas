const babel = require('@babel/core');
const fs = require('fs');

const code = fs.readFileSync('src/components/RssReaderView.tsx', 'utf-8');

const ast = babel.parseSync(code, {
  presets: ['@babel/preset-typescript', '@babel/preset-react'],
  filename: 'RssReaderView.tsx'
});

babel.traverse(ast, {
  CallExpression(path) {
    if (path.node.callee.name && path.node.callee.name.startsWith('use')) {
      const parentFunc = path.findParent(p => p.isFunction());
      if (parentFunc) {
        let name = "anonymous";
        if (parentFunc.node.id) {
          name = parentFunc.node.id.name;
        } else if (parentFunc.parent.type === 'VariableDeclarator' && parentFunc.parent.id) {
          name = parentFunc.parent.id.name;
        }
        console.log(`Hook ${path.node.callee.name} called in ${name} at line ${path.node.loc.start.line}`);
      }
    }
  }
});
