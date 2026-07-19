const fs = require('fs');
const path = require('path');

const componentsDir = path.join(__dirname, 'components');

const filesToUpdate = [
  'OpeningHoursView.tsx',
  'InventoryView.tsx',
  'BusinessDocumentsView.tsx',
  'DigitalMenuView.tsx',
  'BankAccountView.tsx',
  'StoreAndStaffManagementView.tsx',
  'OutletInfoView.tsx',
  'UploadBannersView.tsx',
  'OwnerInfoView.tsx',
  'IntegrationsView.tsx',
  'RefundsView.tsx',
  'AnalyticsView.tsx',
  'SalesReportView.tsx',
  // 'EarningsView.tsx', // already updated
  'SubscriptionView.tsx',
  'RelationshipManagerView.tsx',
  'AdsMarketingView.tsx',
  'CustomerDataView.tsx',
  'OffersView.tsx'
];

filesToUpdate.forEach(file => {
  const filePath = path.join(componentsDir, file);
  if (fs.existsSync(filePath)) {
    let content = fs.readFileSync(filePath, 'utf8');
    // We only want to replace the FIRST occurrence of bg-slate-50 IF it's in the main wrapper.
    // Let's do a regex that replaces min-h-screen bg-slate-50 or fixed inset-0 bg-slate-50 
    content = content.replace(/min-h-screen(.+?)bg-slate-50/g, 'min-h-screen$1bg-[#FFFFFF]');
    content = content.replace(/bg-slate-50(.+?)min-h-screen/g, 'bg-[#FFFFFF]$1min-h-screen');
    content = content.replace(/fixed inset-0(.+?)bg-slate-50/g, 'fixed inset-0$1bg-[#FFFFFF]');
    content = content.replace(/fixed inset-0 bg-slate-50/g, 'fixed inset-0 bg-[#FFFFFF]');
    
    // Also AnalyticsView has "bg-[#FBFCFE] min-h-screen"
    if (file === 'AnalyticsView.tsx') {
      content = content.replace(/bg-\[#FBFCFE\] min-h-screen/g, 'bg-[#FFFFFF] min-h-screen');
    }
    
    fs.writeFileSync(filePath, content, 'utf8');
    console.log(`Updated ${file}`);
  } else {
    console.log(`Not found: ${file}`);
  }
});
