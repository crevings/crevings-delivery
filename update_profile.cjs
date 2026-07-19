const fs = require('fs');

function replaceFileContent(path) {
  let content = fs.readFileSync(path, 'utf8');

  // `ProfileView` replacements
  content = content.replace(/Restaurant Profile/g, "Rider Profile");
  content = content.replace(/Gourmet Kitchen/g, "John Doe");
  content = content.replace(/Civil Lines, Prayagraj/g, "Prayagraj Zone");
  content = content.replace(/North Indian, Chinese, Fast Food/g, "Active since Jan 2024");
  content = content.replace(/₹800 for two/g, "4.8 ★ Rating");
  content = content.replace(/Restaurant QR Code/g, "Rider ID Plate");
  content = content.replace(/For Dine-in & Orders/g, "Scan to tip or review");
  content = content.replace(/Manage Outlet/g, "Manage Profile");
  content = content.replace(/Current Outlet Card/g, "Current Vehicle");
  content = content.replace(/Switch Outlet/g, "Switch Vehicle");

  fs.writeFileSync(path, content);
}

replaceFileContent('./components/ProfileView.tsx');
console.log('done replacing in ProfileView.tsx');
