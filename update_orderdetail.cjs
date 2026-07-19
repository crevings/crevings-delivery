const fs = require('fs');

function replaceFileContent(path) {
  let content = fs.readFileSync(path, 'utf8');

  content = content.replace(/Print KOT/g, "Navigate to Outlet");
  content = content.replace(/Preparation Time/g, "Expected Pickup Time");
  content = content.replace(/Delay Order/g, "Issue With Pickup");

  fs.writeFileSync(path, content);
}

replaceFileContent('./components/OrderDetailView.tsx');
console.log('done replacing in OrderDetailView.tsx');
