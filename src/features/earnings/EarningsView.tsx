
import React, { useState, useMemo } from 'react';
import { 
  ShoppingBag, 
  Banknote,
  Filter,
  X,
  Gift,
  Zap,
  PartyPopper as Confetti,
  Phone,
  AlertCircle,
  FileText
} from 'lucide-react';
import { usePartnerStore } from '@/app/store';
import { ComingSoonView } from '@/shared/components/ComingSoonView';
import { useEarningsSummary } from '@/api/earnings';

import { usePartnerProfile } from '@/api/profile';

export const EarningsView: React.FC = () => {
  const floatingCash = usePartnerStore(s => s.floatingCash);
  const setFloatingCash = usePartnerStore(s => s.setFloatingCash);
  const { profile } = usePartnerProfile();
  const { earnings, isLoading } = useEarningsSummary();
  const [selectedFilter, setSelectedFilter] = useState('Today');
  const [activeActionSheet, setActiveActionSheet] = useState<'floating_cash' | null>(null);
  const [comingSoonTitle, setComingSoonTitle] = useState<string | null>(null);

  React.useEffect(() => {
    if (profile?.floatingCash !== undefined) {
      setFloatingCash(Number(profile.floatingCash) || 0);
    }
  }, [profile?.floatingCash, setFloatingCash]);

  const activePeriodData = useMemo(() => {
    if (!earnings) {
      return {
        earnings: 0,
        trips: 0,
        ordersEarning: 0,
        tips: 0,
        incentive: 0,
        bonus: 0,
      };
    }

    switch (selectedFilter) {
      case 'Today':
        return earnings.today;
      case 'Last 3 days':
        return earnings.last3Days || earnings.today;
      case 'Last 7 days':
        return earnings.last7Days || earnings.week;
      case 'Last 14 days':
        return earnings.last14Days || earnings.month;
      case 'Last month':
        return earnings.lastMonth || earnings.month;
      default:
        return earnings.today;
    }
  }, [selectedFilter, earnings]);

  const { revenueBreakdown, totalEarnings } = useMemo(() => {
    const period = activePeriodData;
    const baseOrders = period.ordersEarning ?? Math.max(0, period.earnings - (period.tips ?? 0) - (period.incentive ?? 0) - (period.bonus ?? 0));

    return {
      revenueBreakdown: [
        { 
          label: 'Orders Earning', 
          icon: ShoppingBag, 
          amount: `₹ ${baseOrders.toLocaleString('en-IN')}`, 
          color: 'bg-slate-50 text-slate-500' 
        },
        { 
          label: 'Tips', 
          icon: Gift, 
          amount: `₹ ${(period.tips ?? 0).toLocaleString('en-IN')}`, 
          color: 'bg-slate-50 text-slate-500' 
        },
        { 
          label: 'Incentive', 
          icon: Zap, 
          amount: `₹ ${(period.incentive ?? 0).toLocaleString('en-IN')}`, 
          color: 'bg-slate-50 text-slate-500' 
        },
        { 
          label: 'Bonus', 
          icon: Confetti, 
          amount: `₹ ${(period.bonus ?? 0).toLocaleString('en-IN')}`, 
          color: 'bg-slate-50 text-slate-500' 
        },
      ],
      totalEarnings: `₹ ${period.earnings.toLocaleString('en-IN')}`,
    };
  }, [activePeriodData]);

  if (comingSoonTitle) {
    return <ComingSoonView title={comingSoonTitle} onBack={() => setComingSoonTitle(null)} />;
  }

  const deliveriesMonth = earnings?.month?.trips ?? 0;
  const deliveriesToday = earnings?.today?.trips ?? 0;
  const earningsMonth = (earnings?.month?.earnings ?? 0).toLocaleString('en-IN');

  return (
    <div className="pb-32 px-4 pt-4 animate-in fade-in duration-500 bg-slate-50 min-h-screen lg:px-0 lg:pt-0 lg:pb-10 max-w-xl mx-auto w-full space-y-4">
      
      {/* Deliveries & Earnings Summary */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        {/* Card 1 */}
        <div className="bg-white p-4 rounded-[20px] border border-slate-200 shadow-xs flex flex-col justify-between h-[110px]">
          <div>
            <div className="text-[13px] font-semibold text-slate-700 leading-tight">Deliveries</div>
            <div className="text-[11px] text-slate-500 mt-0.5">This Month</div>
          </div>
          <div className="text-2xl font-black text-slate-900">
            {isLoading && !earnings ? '...' : (deliveriesMonth >= 1000 ? `${(deliveriesMonth / 1000).toFixed(1)}k` : deliveriesMonth)}
          </div>
        </div>
        
        {/* Card 2 */}
        <div className="bg-white p-4 rounded-[20px] border border-slate-200 shadow-xs flex flex-col justify-between h-[110px]">
          <div>
            <div className="text-[13px] font-semibold text-slate-700 leading-tight">Deliveries</div>
            <div className="text-[11px] text-slate-500 mt-0.5">Today</div>
          </div>
          <div className="text-2xl font-black text-slate-900">
            {isLoading && !earnings ? '...' : deliveriesToday}
          </div>
        </div>
        
        {/* Card 3 */}
        <div className="bg-white p-4 rounded-[20px] border border-slate-200 shadow-xs flex flex-col justify-between h-[110px] col-span-2 sm:col-span-1">
          <div>
            <div className="text-[13px] font-semibold text-emerald-600 leading-tight">Total Earnings</div>
            <div className="text-[11px] text-emerald-600/80 mt-0.5">This Month</div>
          </div>
          <div className="text-2xl font-black text-emerald-600">
            {isLoading && !earnings ? '...' : `₹${earningsMonth}`}
          </div>
        </div>
      </div>

      {/* Filter Buttons */}
      <div className="flex gap-[8px] overflow-x-auto no-scrollbar -mx-4 px-4 py-1">
        {['Today', 'Last 3 days', 'Last 7 days', 'Last 14 days', 'Last month'].map((filter) => (
          <button
            key={filter}
            onClick={() => setSelectedFilter(filter)}
            className={`h-[36px] px-[14px] rounded-[18px] text-[14px] font-medium whitespace-nowrap transition-all duration-300 flex-shrink-0 flex items-center gap-1.5 font-sans ${
              selectedFilter === filter
                ? 'bg-blue-50 text-blue-600 border border-blue-200 font-bold' 
                : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
            }`}
          >
            {filter}
          </button>
        ))}
      </div>

      {/* Revenue Breakdown */}
      <div className="bg-white rounded-3xl p-5 border border-slate-200 shadow-xs">
        <div className="flex items-center justify-between mb-5">
          <div>
            <h3 className="text-base font-bold text-slate-900">Revenue Breakdown</h3>
            <p className="text-xs text-slate-500 mt-0.5">Where your money comes from</p>
          </div>
          <div className="text-slate-400">
            <Filter size={18} />
          </div>
        </div>

        <div className="space-y-4">
          {revenueBreakdown.map((item, idx) => (
            <div key={idx} className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className={`w-10 h-10 rounded-2xl flex items-center justify-center ${item.color}`}>
                  <item.icon size={18} />
                </div>
                <div>
                  <p className="text-sm font-semibold text-slate-900">{item.label}</p>
                </div>
              </div>
              <p className="text-sm font-bold text-emerald-600">{item.amount}</p>
            </div>
          ))}
        </div>
        
        <div className="mt-5 pt-4 border-t border-slate-100 flex items-center justify-between">
          <span className="text-sm font-semibold text-slate-600">Total Earnings</span>
          <span className="text-lg font-black text-emerald-600">{totalEarnings}</span>
        </div>
      </div>

      {/* Quick Actions Grid */}
      <div className="grid grid-cols-2 gap-3 pt-2">
        <button 
          onClick={() => setActiveActionSheet('floating_cash')} 
          className="flex items-center gap-3 p-4 bg-white border border-slate-200 rounded-2xl shadow-xs hover:bg-slate-50 active:scale-95 transition-all text-left"
        >
          <div className="w-10 h-10 bg-indigo-50 text-indigo-600 rounded-full flex items-center justify-center shrink-0">
            <Banknote size={20} strokeWidth={1.5} />
          </div>
          <span className="text-[13px] font-semibold text-slate-700 leading-tight">Floating Cash</span>
        </button>

        <button 
          onClick={() => setComingSoonTitle('Pay Fines')} 
          className="flex items-center gap-3 p-4 bg-white border border-slate-200 rounded-2xl shadow-xs hover:bg-slate-50 active:scale-95 transition-all text-left"
        >
          <div className="w-10 h-10 bg-rose-50 text-rose-600 rounded-full flex items-center justify-center shrink-0">
            <AlertCircle size={20} strokeWidth={1.5} />
          </div>
          <span className="text-[13px] font-semibold text-slate-700 leading-tight">Pay Fines</span>
        </button>

        <button 
          onClick={() => setComingSoonTitle('Statement')} 
          className="flex items-center gap-3 p-4 bg-white border border-slate-200 rounded-2xl shadow-xs hover:bg-slate-50 active:scale-95 transition-all text-left"
        >
          <div className="w-10 h-10 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center shrink-0">
            <FileText size={20} strokeWidth={1.5} />
          </div>
          <span className="text-[13px] font-semibold text-slate-700 leading-tight">Statement</span>
        </button>

        <button 
          onClick={() => setComingSoonTitle('Incentives')} 
          className="flex items-center gap-3 p-4 bg-white border border-slate-200 rounded-2xl shadow-xs hover:bg-slate-50 active:scale-95 transition-all text-left"
        >
          <div className="w-10 h-10 bg-emerald-50 text-emerald-600 rounded-full flex items-center justify-center shrink-0">
            <Gift size={20} strokeWidth={1.5} />
          </div>
          <span className="text-[13px] font-semibold text-slate-700 leading-tight">Incentives</span>
        </button>
      </div>

      {/* Floating Cash Action Sheet */}
      {activeActionSheet === 'floating_cash' && (
        <div 
          className="fixed inset-0 z-[999] flex items-end justify-center bg-black/50 sm:items-center transition-opacity"
          onClick={() => setActiveActionSheet(null)}
        >
          <div 
            className="w-full bg-white rounded-t-2xl sm:rounded-2xl sm:max-w-md p-6 animate-in slide-in-from-bottom-full sm:slide-in-from-bottom-0 sm:fade-in duration-300 relative"
            onClick={e => e.stopPropagation()}
          >
            <button 
              onClick={() => setActiveActionSheet(null)}
              className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center bg-slate-100 text-slate-500 rounded-full hover:bg-slate-200 transition-colors"
            >
              <X size={18} />
            </button>
            
            <div className="pt-2 flex flex-col max-h-[80vh]">
              <div className="w-12 h-12 bg-indigo-50 text-indigo-600 rounded-full flex items-center justify-center mb-4 shrink-0">
                <Banknote size={24} />
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-2 shrink-0">Floating Cash Limit</h3>
              
              <div className={`${floatingCash >= 2000 ? 'bg-rose-50 border-rose-200' : 'bg-slate-50 border-slate-100'} border rounded-xl p-4 mb-4 shrink-0`}>
                <div className="text-sm text-slate-700 mb-1">Current floating cash limit</div>
                <div className="text-2xl font-bold text-slate-900 mb-2">₹ 2,000</div>
                <p className={`text-xs ${floatingCash >= 2000 ? 'text-rose-700' : 'text-slate-500'} leading-relaxed`}>
                  {floatingCash >= 2000 
                    ? "You have reached the ₹2,000 limit. You cannot accept new orders until floating cash is submitted."
                    : "Total customer cash collected across all COD deliveries. New orders pause once floating cash reaches ₹2,000."}
                </p>
              </div>

              <div className="bg-slate-50 border border-slate-100 rounded-xl p-4 mb-3 shrink-0 flex items-center justify-between">
                <div className="text-sm font-medium text-slate-700">Collected Cash in Hand</div>
                <div className={`text-lg font-bold ${floatingCash >= 2000 ? 'text-rose-600' : 'text-indigo-600'}`}>
                  ₹ {floatingCash.toLocaleString('en-IN')}
                </div>
              </div>

              <div className="bg-slate-50 border border-slate-100 rounded-xl p-4 mb-4 shrink-0 flex items-center justify-between">
                <div className="text-sm font-medium text-slate-700">Remaining to limit</div>
                <div className="text-lg font-bold text-slate-900">
                  ₹ {Math.max(0, 2000 - floatingCash).toLocaleString('en-IN')}
                </div>
              </div>

              {/* Contact support to submit floating cash */}
              <div className="bg-amber-50 border border-amber-200/80 rounded-xl p-4 mb-6 shrink-0 space-y-3">
                <div className="text-xs font-semibold text-amber-900">
                  Submit Floating Cash
                </div>
                <p className="text-xs text-amber-800 leading-relaxed">
                  To deposit your collected floating cash and resume order alerts, please contact our support team:
                </p>
                <a
                  href="tel:+919369797768"
                  className="flex items-center justify-center gap-2 bg-amber-600 hover:bg-amber-700 text-white font-bold text-sm py-2.5 px-4 rounded-xl transition-all shadow-xs active:scale-[0.98]"
                >
                  <Phone size={15} />
                  Call +91 9369797768
                </a>
              </div>

              <button 
                onClick={() => setActiveActionSheet(null)} 
                className="w-full h-[52px] bg-[#1E90FF] text-white rounded-[16px] font-semibold text-[16px] flex items-center justify-center active:scale-[0.98] transition-all shrink-0"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

