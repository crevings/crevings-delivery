const fs = require('fs');
let content = fs.readFileSync('./components/EarningsView.tsx', 'utf8');

// remove Notice
content = content.replace(/<div className="bg-\[#FFF7ED\] rounded-\[14px\][\s\S]+?<\/div>[\s]+<\/div>/, '');

// remove Overall Revenue
content = content.replace(/<div className="mt-8 pt-6 border-t border-slate-100">[\s\S]+?<\/div>[\s]+<\/div>[\s]+<\/div>/, '</div></div>');

fs.writeFileSync('./components/EarningsView.tsx', content);
