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
    
    if (content.match(/#305CDE/ig)) {
        content = content.replace(/#305CDE/ig, '#1E90FF');
        changed = true;
    }
    
    if (content.match(/#FAFCFF/ig)) {
        content = content.replace(/#FAFCFF/ig, '#FAF9F6');
        changed = true;
    }

    if (content.match(/bg-\[#2563EB\]/ig)) {
        content = content.replace(/bg-\[#2563EB\]/ig, 'bg-[#1E90FF]');
        changed = true;
    }

    if (content.match(/text-\[#2563EB\]/ig)) {
        content = content.replace(/text-\[#2563EB\]/ig, 'text-[#1E90FF]');
        changed = true;
    }

    if (content.match(/border-\[#2563EB\]/ig)) {
        content = content.replace(/border-\[#2563EB\]/ig, 'border-[#1E90FF]');
        changed = true;
    }
    
    if (content.match(/ring-\[#2563EB\]/ig)) {
        content = content.replace(/ring-\[#2563EB\]/ig, 'ring-[#1E90FF]');
        changed = true;
    }


    if (changed) {
        fs.writeFileSync(file, content, 'utf8');
    }
  }
});
console.log("Colors replaced to 1E90FF and FAF9F6 successfully!");
