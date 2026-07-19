const fs = require('fs');
let code = fs.readFileSync('components/EarningsView.tsx', 'utf8');

// Replace the destructuring line and the entire switch!
const startIdx = code.indexOf('const { onlineBreakdown');
const endIdx = code.indexOf('}, [selectedFilter]);');

if (startIdx > -1 && endIdx > -1) {
  const replacement = `const { revenueBreakdown, totalEarnings } = useMemo(() => {
    switch (selectedFilter) {
      case 'Today':
        return {
          revenueBreakdown: [
            { label: 'Orders Earning', icon: ShoppingBag, amount: '₹ 800', color: 'bg-slate-50 text-slate-500' },
            { label: 'Tips', icon: Gift, amount: '₹ 200', color: 'bg-slate-50 text-slate-500' },
            { label: 'Incentive', icon: Zap, amount: '₹ 300', color: 'bg-slate-50 text-slate-500' },
            { label: 'Bonus', icon: Confetti, amount: '₹ 150', color: 'bg-slate-50 text-slate-500' },
          ],
          totalEarnings: '₹ 1,450',
        };
      case 'Last 3 days':
        return {
          revenueBreakdown: [
            { label: 'Orders Earning', icon: ShoppingBag, amount: '₹ 2,400', color: 'bg-slate-50 text-slate-500' },
            { label: 'Tips', icon: Gift, amount: '₹ 500', color: 'bg-slate-50 text-slate-500' },
            { label: 'Incentive', icon: Zap, amount: '₹ 900', color: 'bg-slate-50 text-slate-500' },
            { label: 'Bonus', icon: Confetti, amount: '₹ 250', color: 'bg-slate-50 text-slate-500' },
          ],
          totalEarnings: '₹ 4,050',
        };
      case 'Last 7 days':
        return {
          revenueBreakdown: [
            { label: 'Orders Earning', icon: ShoppingBag, amount: '₹ 5,600', color: 'bg-slate-50 text-slate-500' },
            { label: 'Tips', icon: Gift, amount: '₹ 1,200', color: 'bg-slate-50 text-slate-500' },
            { label: 'Incentive', icon: Zap, amount: '₹ 1,800', color: 'bg-slate-50 text-slate-500' },
            { label: 'Bonus', icon: Confetti, amount: '₹ 600', color: 'bg-slate-50 text-slate-500' },
          ],
          totalEarnings: '₹ 9,200',
        };
      case 'Last 14 days':
        return {
          revenueBreakdown: [
            { label: 'Orders Earning', icon: ShoppingBag, amount: '₹ 11,200', color: 'bg-slate-50 text-slate-500' },
            { label: 'Tips', icon: Gift, amount: '₹ 2,500', color: 'bg-slate-50 text-slate-500' },
            { label: 'Incentive', icon: Zap, amount: '₹ 3,500', color: 'bg-slate-50 text-slate-500' },
            { label: 'Bonus', icon: Confetti, amount: '₹ 1,200', color: 'bg-slate-50 text-slate-500' },
          ],
          totalEarnings: '₹ 18,400',
        };
      case 'Last month':
      default:
        return {
          revenueBreakdown: [
            { label: 'Orders Earning', icon: ShoppingBag, amount: '₹ 24,000', color: 'bg-slate-50 text-slate-500' },
            { label: 'Tips', icon: Gift, amount: '₹ 6,000', color: 'bg-slate-50 text-slate-500' },
            { label: 'Incentive', icon: Zap, amount: '₹ 8,000', color: 'bg-slate-50 text-slate-500' },
            { label: 'Bonus', icon: Confetti, amount: '₹ 2,000', color: 'bg-slate-50 text-slate-500' },
          ],
          totalEarnings: '₹ 40,000',
        };
    }
  `;
  code = code.substring(0, startIdx) + replacement + code.substring(endIdx);
  fs.writeFileSync('components/EarningsView.tsx', code);
}
