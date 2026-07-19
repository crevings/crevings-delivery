import * as fs from 'fs';
import * as path from 'path';

const walk = (dir: string): string[] => {
  let results: string[] = [];
  try {
    const list = fs.readdirSync(dir);
    list.forEach((file) => {
      file = path.join(dir, file);
      const stat = fs.statSync(file);
      if (stat && stat.isDirectory()) {
        results = results.concat(walk(file));
      } else {
        results.push(file);
      }
    });
  } catch (e) {
    // Ignore
  }
  return results;
};

const componentsDir = path.resolve('./components');
const files = walk(componentsDir);

files.push(path.resolve('./App.tsx'));

files.forEach(file => {
  if (file.endsWith('.tsx') || file.endsWith('.ts')) {
    let content = fs.readFileSync(file, 'utf8');
    let changed = false;
    
    if (content.match(/#FAF9F6/ig)) {
        content = content.replace(/#FAF9F6/ig, '#FFFFFF');
        changed = true;
    }
    
    if (content.match(/bg-\[#FAF9F6\]/ig)) {
        content = content.replace(/bg-\[#FAF9F6\]/ig, 'bg-white');
        changed = true;
    }

    if (changed) {
        fs.writeFileSync(file, content, 'utf8');
    }
  }
});
console.log("Colors replaced to FFFFFF (pure white) successfully!");
