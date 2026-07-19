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

files.forEach(file => {
  if (file.endsWith('.tsx') || file.endsWith('.ts')) {
    const content = fs.readFileSync(file, 'utf8');
    if (content.includes('#00bd6f') || content.includes('#00BD6F')) {
        console.log(`Found green in ${file}`);
    }
    if (content.includes('blue-500') || content.includes('blue-600') || content.includes('text-blue')) {
        console.log(`Found blue utility in ${file}`);
    }
  }
});
