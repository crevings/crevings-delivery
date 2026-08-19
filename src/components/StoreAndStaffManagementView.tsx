import React, { useState } from 'react';
import { ArrowLeft, Store, Users, MapPin, Phone, Receipt, ShieldCheck, ChevronRight, Plus, Building2, UserPlus, Settings2, Banknote, Clock, MenuSquare, Landmark } from 'lucide-react';
import { OutletManagementView } from './OutletManagementView';
import { StaffManagementView } from './StaffManagementView';
import { ManageBillingView } from './ManageBillingView';
import { OpeningHoursView } from './OpeningHoursView';
import { DigitalMenuView } from './DigitalMenuView';
import { BankAccountView } from './BankAccountView';

export const StoreAndStaffManagementView: React.FC<{ onBack: () => void }> = ({ onBack }) => {
  const [activeView, setActiveView] = useState<'hub' | 'outlets' | 'staff' | 'billing' | 'customCharges' | 'openingHours' | 'digitalMenu' | 'bankAccounts'>('hub');

  if (activeView === 'outlets') {
    return <OutletManagementView onBack={() => setActiveView('hub')} isEmbedded={false} />;
  }
  
  if (activeView === 'staff') {
    return <StaffManagementView onBack={() => setActiveView('hub')} isEmbedded={false} />;
  }

  if (activeView === 'billing') {
    return <ManageBillingView onBack={() => setActiveView('hub')} viewType="details" />;
  }

  if (activeView === 'customCharges') {
    return <ManageBillingView onBack={() => setActiveView('hub')} viewType="charges" />;
  }

  if (activeView === 'openingHours') {
    return <OpeningHoursView onBack={() => setActiveView('hub')} />;
  }

  if (activeView === 'digitalMenu') {
    return <DigitalMenuView onBack={() => setActiveView('hub')} />;
  }

  if (activeView === 'bankAccounts') {
    return <BankAccountView onBack={() => setActiveView('hub')} />;
  }

  return (
    <div className="min-h-screen bg-[#F8FAFC] pb-20 font-sans animate-in fade-in duration-300">
      <header className="sticky top-0 z-40 bg-[#FFFFFF] border-b border-slate-100 h-[56px] flex items-center justify-between px-4">
        <div className="flex items-center gap-3">
          <button 
            onClick={onBack}
            className="w-10 h-10 flex items-center justify-center -ml-2 text-slate-700 hover:bg-slate-50 rounded-full active:scale-95 transition-all"
          >
            <ArrowLeft size={24} />
          </button>
          <h1 className="text-[18px] font-semibold text-slate-900">Outlet Settings</h1>
        </div>
      </header>
      
      <div className="p-4 space-y-4 lg:p-8 lg:max-w-3xl lg:mx-auto">
        <div className="bg-[#FFFFFF] rounded-2xl border border-slate-100/80 overflow-hidden shadow-sm">
          {/* Outlets Module */}
          <button 
            onClick={() => setActiveView('outlets')}
            className="w-full p-4 flex gap-4 items-center group hover:bg-slate-50 active:bg-slate-100 transition-colors text-left border-b border-slate-50"
          >
            <div className="w-11 h-11 rounded-full bg-blue-50 flex items-center justify-center shrink-0 border border-blue-100/50 group-hover:scale-105 transition-transform duration-300">
              <Store className="text-blue-600" size={20} strokeWidth={2} />
            </div>
            <div className="flex-1">
              <h4 className="text-[15px] font-semibold text-slate-900 leading-tight mb-0.5">Outlets & Locations</h4>
              <p className="text-[13px] text-slate-500 leading-snug">Manage branches & operating hours</p>
            </div>
            <ChevronRight className="text-slate-300 group-hover:text-blue-600 transition-colors" size={20} />
          </button>
          
          {/* Opening Hours Module */}
          <button 
            onClick={() => setActiveView('openingHours')}
            className="w-full p-4 flex gap-4 items-center group hover:bg-slate-50 active:bg-slate-100 transition-colors text-left border-b border-slate-50"
          >
            <div className="w-11 h-11 rounded-full bg-blue-50 flex items-center justify-center shrink-0 border border-blue-100/50 group-hover:scale-105 transition-transform duration-300">
              <Clock className="text-blue-600" size={20} strokeWidth={2} />
            </div>
            <div className="flex-1">
              <h4 className="text-[15px] font-semibold text-slate-900 leading-tight mb-0.5">Opening Hours</h4>
              <p className="text-[13px] text-slate-500 leading-snug">Configure your service timings</p>
            </div>
            <ChevronRight className="text-slate-300 group-hover:text-blue-600 transition-colors" size={20} />
          </button>
          
          {/* Digital Menu Module */}
          <button 
            onClick={() => setActiveView('digitalMenu')}
            className="w-full p-4 flex gap-4 items-center group hover:bg-slate-50 active:bg-slate-100 transition-colors text-left border-b border-slate-50"
          >
            <div className="w-11 h-11 rounded-full bg-blue-50 flex items-center justify-center shrink-0 border border-blue-100/50 group-hover:scale-105 transition-transform duration-300">
              <MenuSquare className="text-blue-600" size={20} strokeWidth={2} />
            </div>
            <div className="flex-1">
              <h4 className="text-[15px] font-semibold text-slate-900 leading-tight mb-0.5">Digital Menu</h4>
              <p className="text-[13px] text-slate-500 leading-snug">Manage your online menu</p>
            </div>
            <ChevronRight className="text-slate-300 group-hover:text-blue-600 transition-colors" size={20} />
          </button>
          
          {/* Staff Module */}
          <button 
            onClick={() => setActiveView('staff')}
            className="w-full p-4 flex gap-4 items-center group hover:bg-slate-50 active:bg-slate-100 transition-colors text-left border-b border-slate-50"
          >
            <div className="w-11 h-11 rounded-full bg-blue-50 flex items-center justify-center shrink-0 border border-blue-100/50 group-hover:scale-105 transition-transform duration-300">
              <Users className="text-blue-600" size={20} strokeWidth={2} />
            </div>
            <div className="flex-1">
              <h4 className="text-[15px] font-semibold text-slate-900 leading-tight mb-0.5">Staff & Permissions</h4>
              <p className="text-[13px] text-slate-500 leading-snug">Add team members and roles</p>
            </div>
            <ChevronRight className="text-slate-300 group-hover:text-blue-600 transition-colors" size={20} />
          </button>
          
          {/* Billing Details Module */}
          <button 
            onClick={() => setActiveView('billing')}
            className="w-full p-4 flex gap-4 items-center group hover:bg-slate-50 active:bg-slate-100 transition-colors text-left border-b border-slate-50"
          >
            <div className="w-11 h-11 rounded-full bg-blue-50 flex items-center justify-center shrink-0 border border-blue-100/50 group-hover:scale-105 transition-transform duration-300">
              <Receipt className="text-blue-600" size={20} strokeWidth={2} />
            </div>
            <div className="flex-1">
              <h4 className="text-[15px] font-semibold text-slate-900 leading-tight mb-0.5">Billing Details</h4>
              <p className="text-[13px] text-slate-500 leading-snug">Update restaurant info on receipts</p>
            </div>
            <ChevronRight className="text-slate-300 group-hover:text-blue-600 transition-colors" size={20} />
          </button>
          
          {/* Custom Charges Module */}
          <button 
            onClick={() => setActiveView('customCharges')}
            className="w-full p-4 flex gap-4 items-center group hover:bg-slate-50 active:bg-slate-100 transition-colors text-left border-b border-slate-50"
          >
            <div className="w-11 h-11 rounded-full bg-blue-50 flex items-center justify-center shrink-0 border border-blue-100/50 group-hover:scale-105 transition-transform duration-300">
              <Banknote className="text-blue-600" size={20} strokeWidth={2} />
            </div>
            <div className="flex-1">
              <h4 className="text-[15px] font-semibold text-slate-900 leading-tight mb-0.5">Custom Charges</h4>
              <p className="text-[13px] text-slate-500 leading-snug">Configure extra service fees</p>
            </div>
            <ChevronRight className="text-slate-300 group-hover:text-blue-600 transition-colors" size={20} />
          </button>
          
          {/* Bank Accounts Module */}
          <button 
            onClick={() => setActiveView('bankAccounts')}
            className="w-full p-4 flex gap-4 items-center group hover:bg-slate-50 active:bg-slate-100 transition-colors text-left"
          >
            <div className="w-11 h-11 rounded-full bg-blue-50 flex items-center justify-center shrink-0 border border-blue-100/50 group-hover:scale-105 transition-transform duration-300">
              <Landmark className="text-blue-600" size={20} strokeWidth={2} />
            </div>
            <div className="flex-1">
              <h4 className="text-[15px] font-semibold text-slate-900 leading-tight mb-0.5">Bank DB</h4>
              <p className="text-[13px] text-slate-500 leading-snug">Manage payouts and accounts</p>
            </div>
            <ChevronRight className="text-slate-300 group-hover:text-blue-600 transition-colors" size={20} />
          </button>
        </div>
      </div>
    </div>
  );
};

