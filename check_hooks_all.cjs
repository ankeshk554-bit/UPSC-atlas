const babel = require('@babel/core');
const fs = require('fs');

const code = fs.readFileSync('src/components/RssReaderView.tsx', 'utf-8');

const ast = babel.parseSync(code, {
  presets: ['@babel/preset-typescript', '@babel/preset-react'],
  filename: 'RssReaderView.tsx'
});

babel.traverse(ast, {
  CallExpression(path) {
    let name = null;
    if (path.node.callee.name) {
      name = path.node.callee.name;
    } else if (path.node.callee.type === 'MemberExpression' && path.node.callee.property.name) {
      if (path.node.callee.property.name.startsWith('use')) {
        name = path.node.callee.property.name;
      }
    }
    
    if (name && name.startsWith('use')) {
      const parentFunc = path.findParent(p => p.isFunction());
      if (parentFunc) {
        let funcName = "anonymous";
        if (parentFunc.node.id) {
          funcName = parentFunc.node.id.name;
        } else if (parentFunc.parent.type === 'VariableDeclarator' && parentFunc.parent.id) {
          funcName = parentFunc.parent.id.name;
        }
        console.log(`Hook ${name} called in ${funcName} at line ${path.node.loc.start.line}`);
      }
    }
  }
});
