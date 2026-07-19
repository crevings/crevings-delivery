const fs = require('fs');

function replaceFileContent(path) {
  let content = fs.readFileSync(path, 'utf8');

  // Dashboard replacements
  content = content.replace(/Restaurant/g, 'Rider');
  content = content.replace(/restaurant/g, 'rider');
  
  // Specific Earnings replacements
  content = content.replace(/Dine-in/g, 'Base Fare');
  content = content.replace(/Takeaway/g, 'Distance Pay');
  content = content.replace(/Booking/g, 'Surge Bonus');
  content = content.replace(/Delivery/g, 'Customer Tips');
  
  content = content.replace(/Total Orders/g, 'Deliveries');
  content = content.replace(/Offline Sales/g, 'Cash Collected');
  content = content.replace(/Online Sales/g, 'Online Earnings');
  content = content.replace(/Offline Cash/g, 'Cash on Delivery');
  content = content.replace(/GST \(Customer Tips\)/g, 'GST');
  content = content.replace(/Collected at counter/g, 'Collected from customer');

  fs.writeFileSync(path, content);
}

replaceFileContent('./components/EarningsView.tsx');
replaceFileContent('./components/Dashboard.tsx');
console.log('done replacing');
