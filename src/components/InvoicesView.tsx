import React, { useState } from 'react';
import { FileText, Eye, Download, ArrowLeft, Search, Filter, Calendar, FileCheck2, Receipt } from 'lucide-react';

interface InvoicesViewProps {
  onBack: () => void;
}

export const InvoicesView: React.FC<InvoicesViewProps> = ({ onBack }) => {
  const [activeInvoiceType, setActiveInvoiceType] = useState<'subscription' | 'order' | 'ads' | 'platform'>('subscription');
  const [searchQuery, setSearchQuery] = useState('');

  const invoiceData: Record<string, any[]> = {
    subscription: [
      { id: 'INV-SUB-052', date: 'May 1, 2026', amount: '₹999', status: 'Paid', downloadUrl: '#', items: 1, type: 'Monthly Plan' },
      { id: 'INV-SUB-051', date: 'Apr 1, 2026', amount: '₹999', status: 'Paid', downloadUrl: '#', items: 1, type: 'Monthly Plan' },
      { id: 'INV-SUB-050', date: 'Mar 1, 2026', amount: '₹999', status: 'Paid', downloadUrl: '#', items: 1, type: 'Monthly Plan' },
    ],
    order: [
      { id: 'INV-ORD-1045', date: 'May 3, 2026', amount: '₹120', status: 'Paid', downloadUrl: '#', items: 3, type: 'Dine-in Order' },
      { id: 'INV-ORD-1044', date: 'May 2, 2026', amount: '₹250', status: 'Paid', downloadUrl: '#', items: 5, type: 'Takeaway' },
    ],
    ads: [
       { id: 'INV-ADS-012', date: 'May 1, 2026', amount: '₹500', status: 'Paid', downloadUrl: '#', items: 1, type: 'Top Placement Ads' },
    ],
    platform: [
       { id: 'INV-PLAT-088', date: 'May 1, 2026', amount: '₹850', status: 'Paid', downloadUrl: '#', items: 42, type: 'Platform Fees' }
    ]
  };

  const tabs = [
    { id: 'subscription', label: 'Subscription' },
    { id: 'order', label: 'Orders' },
    { id: 'ads', label: 'Ads' },
    { id: 'platform', label: 'Fees' },
  ];

  const filteredInvoices = (invoiceData[activeInvoiceType] || []).filter(inv => 
    inv.id.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-[#F8FAFC] font-sans animate-in fade-in duration-300 pb-10">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-[#FFFFFF] border-b border-slate-200 h-[64px] flex items-center px-4 shadow-sm">
        <button 
          onClick={onBack}
          className="w-10 h-10 flex items-center justify-center -ml-2 text-slate-700 active:scale-95 transition-transform bg-slate-50 rounded-full hover:bg-slate-100"
        >
          <ArrowLeft size={20} />
        </button>
        <div className="ml-3 flex-1 flex items-center justify-between">
          <div>
            <h1 className="text-[17px] font-bold text-slate-900 leading-tight">Invoices</h1>
            <p className="text-[12px] font-medium text-slate-500">Manage billing history</p>
          </div>
          <div className="w-10 h-10 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center">
            <Receipt size={20} />
          </div>
        </div>
      </header>

      <div className="p-4 space-y-6">
        
        {/* Search Bar */}
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
            <Search size={18} className="text-slate-400" />
          </div>
          <input 
            type="text" 
            placeholder="Search by invoice ID..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full h-[48px] bg-[#FFFFFF] border border-slate-200 rounded-xl pl-10 pr-4 text-[14px] text-slate-900 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all shadow-sm font-medium placeholder:font-normal placeholder:text-slate-400"
          />
          <button className="absolute inset-y-0 right-1 top-1 bottom-1 px-3 flex items-center justify-center text-slate-500 hover:text-slate-700 bg-slate-50 hover:bg-slate-100 rounded-lg transition-colors border border-slate-100">
            <Filter size={16} />
          </button>
        </div>

        {/* Segmented Tabs */}
        <div className="bg-[#FFFFFF] p-1.5 rounded-xl border border-slate-200 shadow-sm flex overflow-x-auto no-scrollbar">
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveInvoiceType(tab.id as any)}
              className={`flex-1 min-w-[70px] whitespace-nowrap px-3 py-2 text-[13px] font-bold rounded-lg transition-all ${
                activeInvoiceType === tab.id 
                  ? 'bg-blue-600 text-white shadow-md' 
                  : 'text-slate-600 hover:bg-slate-50'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
        
        {/* Invoice List */}
        <div className="space-y-4">
          <div className="flex items-center justify-between px-1">
            <h2 className="text-[15px] font-bold text-slate-800">Recent Invoices</h2>
            <span className="text-[12px] font-bold text-slate-500 bg-slate-200 px-2 py-0.5 rounded-full">{filteredInvoices.length}</span>
          </div>

          {filteredInvoices.map((invoice) => (
            <div key={invoice.id} className="bg-[#FFFFFF] rounded-[20px] p-5 shadow-sm border border-slate-200 flex flex-col hover:border-blue-300 transition-all">
              {/* Header */}
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-full bg-[#F0FDF4] text-[#16A34A] flex items-center justify-center shrink-0 border border-[#DCFCE7]">
                    <FileCheck2 size={24} strokeWidth={1.5} />
                  </div>
                  <div>
                    <p className="text-[16px] font-black text-slate-900 tracking-tight">{invoice.id}</p>
                    <div className="flex items-center gap-1 mt-0.5 text-slate-500">
                      <Calendar size={13} />
                      <span className="text-[12px] font-medium">{invoice.date}</span>
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-[18px] font-black text-slate-900 leading-tight">{invoice.amount}</p>
                  <span className="inline-block px-2 py-0.5 rounded-md bg-[#F0FDF4] text-[#16A34A] text-[10px] font-bold uppercase tracking-wider mt-1 border border-[#DCFCE7]">
                    {invoice.status}
                  </span>
                </div>
              </div>

              {/* Details strip */}
              <div className="flex bg-[#F8FAFC] rounded-xl p-3 items-center justify-between mb-4 border border-slate-100">
                 <span className="text-[13px] font-bold text-slate-700">{invoice.type}</span>
                 <span className="text-[12px] font-medium text-slate-500">{invoice.items} Item{invoice.items > 1 ? 's' : ''}</span>
              </div>

              {/* Actions */}
              <div className="grid grid-cols-2 gap-3 mt-1">
                <button className="h-[44px] flex items-center justify-center gap-2 bg-[#FFFFFF] border-2 border-slate-200 text-slate-700 text-[14px] font-bold rounded-xl active:scale-[0.98] hover:border-slate-300 hover:bg-slate-50 transition-all">
                  <Eye size={18} /> View
                </button>
                <button className="h-[44px] flex items-center justify-center gap-2 bg-[#E0F2FE] text-[#0284C7] text-[14px] font-bold rounded-xl active:scale-[0.98] hover:bg-[#BAE6FD] transition-all">
                  <Download size={18} /> Download
                </button>
              </div>
            </div>
          ))}

          {filteredInvoices.length === 0 && (
            <div className="flex flex-col items-center justify-center py-12 bg-[#FFFFFF] rounded-[24px] border border-dashed border-slate-200 shadow-sm mt-4">
              <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center text-slate-300 mb-3">
                <FileText size={32} />
              </div>
              <p className="text-slate-900 font-bold text-[16px] mb-1">No invoices found</p>
              <p className="text-slate-500 font-medium text-[13px] text-center max-w-[200px]">
                {searchQuery ? "No invoices match your search query." : "You have no invoices in this category yet."}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
