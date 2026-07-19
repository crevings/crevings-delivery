const fs = require('fs');
const path = require('path');
const dir = './components';
fs.readdirSync(dir).forEach(file => {
  if (!file.endsWith('.tsx')) return;
  const content = fs.readFileSync(path.join(dir, file), 'utf8');
  let m;
  const regex = /const\s+\[(.*?)\]\s*=\s*(useState|useRef|useEffect)/g;
  while ((m = regex.exec(content)) !== null) {
     const before = content.substring(Math.max(0, m.index - 500), m.index);
     const funcMatches = [...before.matchAll(/const\s+([a-zA-Z0-9_]+)\s*=\s*(async\s+)?(\([^)]*\)|[a-zA-Z0-9_]+)\s*=>/g)];
     if (funcMatches.length > 0) {
        const funcName = funcMatches[funcMatches.length - 1][1];
        if (funcName[0] === funcName[0].toLowerCase()) {
           console.log(`Potential hook in lowercase function: file=${file}, func=${funcName}`);
        }
     }
  }
});
