const fs = require('fs');

function replaceFileContent(path) {
  let content = fs.readFileSync(path, 'utf8');

  // `INITIAL_ORDERS` replacements
  content = content.replace(/type: 'Dine-in'/g, "type: 'Delivery'");
  content = content.replace(/type: 'Offline Orders'/g, "type: 'Delivery'");
  
  // `Header` passing
  content = content.replace(/restaurantName={selectedBranch\.name}/g, "restaurantName='John Doe'");

  // Permissions texts
  content = content.replace(/find your restaurant and calculate delivery distances accurately/g, "track your location for accurate delivery routes.");
  content = content.replace(/table bookings/g, "delivery updates");

  // BottomNav visibility
  content = content.replace(/Tab\.HOME, Tab\.MENU, Tab\.ORDERS, Tab\.EARNINGS, Tab\.TABLES/g, "Tab.HOME, Tab.ORDERS, Tab.EARNINGS");

  fs.writeFileSync(path, content);
}

replaceFileContent('./App.tsx');
console.log('done replacing in App.tsx');
