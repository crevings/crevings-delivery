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
    
    if (content.includes('#2563EB')) {
        content = content.replace(/#2563EB/ig, '#305CDE');
        changed = true;
    }

    if (content.includes('bg-white')) {
        content = content.replace(/bg-white/g, 'bg-[#FAFCFF]');
        changed = true;
    }
    
    if (content.includes('#FFFFFF')) {
        content = content.replace(/#FFFFFF/g, '#FAFCFF');
        changed = true;
    }
    
    if (content.includes('#ffffff')) {
        content = content.replace(/#ffffff/g, '#fafcff');
        changed = true;
    }
    
    if (content.includes('bg-[#F8FAFC]')) {
        // if they were using slate-50 already, maybe make it slightly colder
        content = content.replace(/bg-\[#F8FAFC\]/g, 'bg-[#F4F7FB]');
        changed = true;
    }

    if (changed) {
        fs.writeFileSync(file, content, 'utf8');
    }
  }
});
console.log("Colors replaced successfully!");
