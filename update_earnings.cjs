const fs = require('fs');
let content = fs.readFileSync('./components/EarningsView.tsx', 'utf8');

// Replace the entire return of EarningsView to match the simple Rider Payout UI
// Too complex to use regex for the whole file, let's just rewrite the important parts using simple string replacements.

content = content.replace("import { \n  Wallet, \n  ArrowUpRight, \n  ArrowDownRight,\n  ShoppingBag, \n  Utensils, \n  Bike, \n  Calendar, \n  Clock, \n  CheckCircle2, \n  ChevronDown,\n  ChevronLeft,\n  ChevronRight,\n  ChevronUp,\n  Banknote,\n  Receipt,\n  Megaphone,\n  RotateCcw,\n  MoreHorizontal,\n  ArrowRight,\n  Filter,\n  Info,\n  Loader2,\n  X,\n  Search,\n  HelpCircle,\n  AlertCircle,\n  FileText,\n  Gift,\n  Eye,\n  Download\n} from 'lucide-react';", 
`import { 
  Wallet, 
  ArrowUpRight, 
  ArrowDownRight,
  ShoppingBag, 
  Utensils, 
  Bike, 
  Calendar, 
  Clock, 
  CheckCircle2, 
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  ChevronUp,
  Banknote,
  Receipt,
  Megaphone,
  RotateCcw,
  MoreHorizontal,
  ArrowRight,
  Filter,
  Info,
  Loader2,
  X,
  Search,
  HelpCircle,
  AlertCircle,
  FileText,
  Gift,
  Eye,
  Download,
  Zap,
  PartyPopper as Confetti
} from 'lucide-react';`);

content = content.replace("const { onlineBreakdown, offlineBreakdown, offlinePaymentBreakdown, deductionsData, grossRevenue, totalDeductions, netEarnings, overallRevenue } = useMemo(() => {", "const { revenueBreakdown, totalEarnings } = useMemo(() => {");

const startIdx = content.indexOf("switch (selectedFilter) {");
const endIdx = content.indexOf("}, [selectedFilter]);");

const newSwitch = `switch (selectedFilter) {
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

content = content.substring(0, startIdx) + newSwitch + content.substring(endIdx);

fs.writeFileSync('./components/EarningsView.tsx', content);
