import React, { useState } from 'react';
import { FileText, Eye, Download, ArrowLeft, Search, Filter, Calendar, FileCheck2, Receipt } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

import { useEarningsSummary } from '@/api/earnings';

interface InvoicesViewProps {
  onBack?: () => void;
}

export const InvoicesView: React.FC<InvoicesViewProps> = ({ onBack }) => {
  const navigate = useNavigate();
  const handleBack = () => {
    if (onBack) onBack();
    else if (window.history.length > 1) navigate(-1);
    else navigate('/');
  };

  const { earnings, isLoading } = useEarningsSummary();
  const [searchQuery, setSearchQuery] = useState('');

  const statements = [
    {
      id: 'PAY-STMT-CURR',
      period: 'Current Week',
      date: new Date().toLocaleDateString('en-IN', { month: 'short', day: 'numeric', year: 'numeric' }),
      amount: `₹ ${(earnings?.week?.earnings ?? 0).toLocaleString('en-IN')}`,
      trips: earnings?.week?.trips ?? 0,
      status: 'In Progress',
      type: 'Weekly Payout Statement',
    },
    {
      id: 'PAY-STMT-PREV',
      period: 'Last Month',
      date: new Date(Date.now() - 30 * 86400000).toLocaleDateString('en-IN', { month: 'short', day: 'numeric', year: 'numeric' }),
      amount: `₹ ${(earnings?.lastMonth?.earnings ?? earnings?.month?.earnings ?? 0).toLocaleString('en-IN')}`,
      trips: earnings?.lastMonth?.trips ?? earnings?.month?.trips ?? 0,
      status: 'Settled',
      type: 'Monthly Settlement Summary',
    },
  ];

  const filteredInvoices = statements.filter(inv => 
    inv.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
    inv.period.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-[#F8FAFC] font-sans animate-in fade-in duration-300 pb-10">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-[#FFFFFF] border-b border-slate-200 h-[64px] flex items-center px-4 shadow-sm">
        <button 
          onClick={handleBack}
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

        {/* Statement List */}
        <div className="space-y-4">
          <div className="flex items-center justify-between px-1">
            <h2 className="text-[15px] font-bold text-slate-800">Weekly Payout Statements</h2>
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
                 <span className="text-[12px] font-medium text-slate-500">{invoice.trips} Trips Completed</span>
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
