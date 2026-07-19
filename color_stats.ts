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

const colors: Record<string, number> = {};

files.forEach(file => {
  if (file.endsWith('.tsx') || file.endsWith('.ts')) {
    const content = fs.readFileSync(file, 'utf8');
    const matches = content.match(/#[0-9a-fA-F]{6}/g);
    if (matches) {
        matches.forEach(m => {
            const hex = m.toUpperCase();
            colors[hex] = (colors[hex] || 0) + 1;
        });
    }
  }
});

const sorted = Object.entries(colors).sort((a,b) => b[1] - a[1]);
console.log("Top colors:");
sorted.slice(0, 20).forEach(([c, count]) => console.log(c, count));

