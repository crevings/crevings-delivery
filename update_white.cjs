const fs = require('fs');
const path = require('path');

function replaceIteratively(dir) {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const fullPath = path.join(dir, file);
    if (fs.statSync(fullPath).isDirectory()) {
      if (file !== 'node_modules' && file !== 'dist' && file !== '.git') {
        replaceIteratively(fullPath);
      }
    } else if (fullPath.endsWith('.tsx') || fullPath.endsWith('.ts')) {
      let content = fs.readFileSync(fullPath, 'utf8');
      
      let initial = content;

      content = content.replace(/(min-h-screen[^>]*?)\b(?:bg-slate-50|bg-\[#F9FAFB\]|bg-\[#F8FAFC\]|bg-\[#F4F7FB\]|bg-\[#F6F8FA\])\b/g, '$1bg-[#FFFFFF]');
      content = content.replace(/\b(?:bg-slate-50|bg-\[#F9FAFB\]|bg-\[#F8FAFC\]|bg-\[#F4F7FB\]|bg-\[#F6F8FA\])\b([^>]*?min-h-screen)/g, 'bg-[#FFFFFF]$1');

      if (content !== initial) {
        fs.writeFileSync(fullPath, content);
        console.log('Updated ' + fullPath);
      }
    }
  }
}

replaceIteratively('./components');
replaceIteratively('./src');
replaceIteratively('.');
