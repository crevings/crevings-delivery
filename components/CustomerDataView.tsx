import React, { useState } from 'react';
import { 
  ArrowLeft, 
  Plus, 
  Search, 
  Filter, 
  ChevronRight, 
  MessageCircle, 
  MessageSquare, 
  Tag, 
  X,
  User,
  Phone,
  Mail,
  Calendar,
  ShoppingBag,
  TrendingUp,
  Award,
  Download
} from 'lucide-react';

interface Customer {
  id: string;
  name: string;
  phone: string;
  email: string;
  gender: 'Male' | 'Female' | 'Other';
  type: 'New' | 'Existing';
  source: 'Online Only' | 'Offline Only' | 'Both';
  totalOrders: number;
  revenue: number;
  lastOrderDate: string;
  tags: string[];
}

const MOCK_CUSTOMERS: Customer[] = [
  {
    id: 'CUST-001',
    name: 'Rahul Sharma',
    phone: '+91 9876543210',
    email: 'rahul.s@example.com',
    gender: 'Male',
    type: 'Existing',
    source: 'Both',
    totalOrders: 24,
    revenue: 12500,
    lastOrderDate: '12 Feb 2026',
    tags: ['High Spender', 'Frequent Buyer']
  },
  {
    id: 'CUST-002',
    name: 'Priya Patel',
    phone: '+91 9876543211',
    email: 'priya.p@example.com',
    gender: 'Female',
    type: 'Existing',
    source: 'Online Only',
    totalOrders: 2,
    revenue: 850,
    lastOrderDate: '15 Jan 2026',
    tags: ['Inactive 30 days']
  },
  {
    id: 'CUST-003',
    name: 'Amit Kumar',
    phone: '+91 9876543212',
    email: 'amit.k@example.com',
    gender: 'Male',
    type: 'New',
    source: 'Offline Only',
    totalOrders: 1,
    revenue: 450,
    lastOrderDate: '20 Mar 2026',
    tags: ['New']
  }
];

interface CustomerDataViewProps {
  onBack?: () => void;
}

export const CustomerDataView: React.FC<CustomerDataViewProps> = ({ onBack }) => {
  const [viewState, setViewState] = useState<'main' | 'filtered' | 'detail'>('main');
  const [selectedFilterTitle, setSelectedFilterTitle] = useState('');
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);

  const handleInsightClick = (title: string) => {
    setSelectedFilterTitle(title);
    setViewState('filtered');
  };

  const handleCustomerClick = (customer: Customer) => {
    setSelectedCustomer(customer);
    setViewState('detail');
  };

  const handleDownloadExcel = () => {
    const headers = ['ID', 'Name', 'Phone', 'Email', 'Gender', 'Type', 'Source', 'Total Orders', 'Revenue', 'Last Order Date', 'Tags'];
    
    const csvRows = MOCK_CUSTOMERS.map(c => {
      return [
        c.id,
        `"${c.name}"`,
        `"${c.phone}"`,
        `"${c.email}"`,
        c.gender,
        c.type,
        c.source,
        c.totalOrders,
        c.revenue,
        `"${c.lastOrderDate}"`,
        `"${c.tags.join(', ')}"`
      ].join(',');
    });
    
    const csvContent = [headers.join(','), ...csvRows].join('\n');
    
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', 'customers_data.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (viewState === 'filtered') {
    return (
      <FilteredCustomerList 
        title={selectedFilterTitle} 
        onBack={() => setViewState('main')} 
        onCustomerClick={handleCustomerClick}
      />
    );
  }

  if (viewState === 'detail' && selectedCustomer) {
    return (
      <CustomerDetail 
        customer={selectedCustomer} 
        onBack={() => setViewState('main')} 
      />
    );
  }

  return (
    <div className="min-h-screen bg-slate-50/50 pb-20 font-sans">
      {/* Header */}
      <header className="h-[72px] bg-[#FFFFFF] border-b border-slate-100 flex items-center justify-between px-4 sticky top-0 z-20 shadow-sm lg:px-8">
        <div className="flex items-center gap-3">
          <button onClick={onBack} className="w-10 h-10 flex items-center justify-center -ml-2 text-slate-700 hover:bg-slate-50 rounded-full active:scale-95 transition-all">
            <ArrowLeft size={24} />
          </button>
          <h1 className="text-[20px] font-bold text-slate-900 tracking-tight">Customer Info</h1>
        </div>
        <div className="flex items-center gap-2">
          <button 
            onClick={handleDownloadExcel}
            className="w-10 h-10 flex items-center justify-center text-emerald-600 hover:bg-emerald-50 rounded-full active:scale-95 transition-all"
            title="Download Excel (CSV)"
          >
            <Download size={20} />
          </button>
          <button 
            onClick={() => setShowAddModal(true)}
            className="h-10 px-4 flex items-center justify-center gap-2 bg-blue-600 text-white hover:bg-blue-700 rounded-full font-semibold text-sm active:scale-95 transition-all shadow-sm"
          >
            <Plus size={18} />
            <span className="hidden sm:inline">Add Customer</span>
          </button>
        </div>
      </header>

      <div className="p-4 space-y-6 lg:p-8 lg:max-w-7xl lg:mx-auto">
        {/* Top Insight Cards */}
        <div className="flex overflow-x-auto no-scrollbar -mx-4 px-4 gap-4 snap-x lg:mx-0 lg:px-0 lg:grid lg:grid-cols-5">
          {[
            { label: 'New Customers', value: '240', color: 'text-blue-600', bg: 'bg-blue-50/50' },
            { label: 'Repeat Customers', value: '560', color: 'text-emerald-600', bg: 'bg-emerald-50/50' },
            { label: 'Inactive Customers', value: '1,000', color: 'text-amber-600', bg: 'bg-amber-50/50' },
            { label: 'High Value Customers', value: '120', color: 'text-purple-600', bg: 'bg-purple-50/50' },
            { label: 'Lost Customers (30+ days)', value: '320', color: 'text-rose-600', bg: 'bg-rose-50/50' }
          ].map((card, idx) => (
            <button 
              key={idx}
              onClick={() => handleInsightClick(card.label)}
              className={`snap-start shrink-0 w-[160px] h-[90px] bg-[#FFFFFF] rounded-[20px] border border-slate-200/60 p-4 flex flex-col justify-center text-left hover:shadow-md hover:border-slate-300 active:scale-[0.98] transition-all relative overflow-hidden`}
            >
              <div className={`absolute right-[-10px] top-[-10px] w-16 h-16 rounded-full opacity-20 ${card.bg}`}></div>
              <span className={`text-[28px] font-black ${card.color} tracking-tight leading-none mb-1.5 z-10`}>{card.value}</span>
              <span className="text-[12px] font-medium text-slate-500 leading-tight z-10">{card.label}</span>
            </button>
          ))}
        </div>

        {/* Smart Insights & Automation Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 pt-2">
          <div className="space-y-6">
            {/* Smart Insights Banner */}
            <div className="bg-gradient-to-br from-[#111827] to-[#1F2937] rounded-[24px] p-5 shadow-lg relative overflow-hidden">
               <div className="absolute top-0 right-0 w-32 h-32 bg-rose-500/10 rounded-full blur-2xl transform translate-x-10 -translate-y-10"></div>
              <div className="flex items-start gap-4 relative z-10">
                <div className="text-2xl mt-0.5 bg-white/10 p-2 rounded-2xl w-12 h-12 flex items-center justify-center backdrop-blur-sm">🔥</div>
                <div className="flex-1">
                  <h3 className="font-bold text-white text-[15px]">320 customers haven't ordered in 30 days</h3>
                  <p className="text-[13px] text-slate-300 mt-1 mb-4 leading-relaxed">Send them a personalized offer to bring them back and increase your repeat order rate.</p>
                  <button className="h-[40px] px-5 bg-rose-500 hover:bg-rose-600 text-white rounded-full text-sm font-bold active:scale-95 transition-transform shadow-sm">
                    Create Campaign
                  </button>
                </div>
              </div>
            </div>

            {/* Revenue Insights */}
            <div className="bg-[#FFFFFF] border border-slate-200/60 rounded-[20px] p-5 shadow-sm flex items-center gap-4 hover:shadow-md transition-shadow">
               <div className="w-12 h-12 rounded-2xl bg-emerald-50 flex items-center justify-center shrink-0">
                 <TrendingUp size={24} className="text-emerald-600" />
               </div>
               <div>
                 <p className="text-[12px] text-slate-500 font-bold uppercase tracking-wider mb-0.5">Revenue Insight</p>
                 <p className="text-[15px] font-semibold text-slate-900 leading-tight mt-1">Your top 20% of customers contribute to <span className="text-emerald-600 font-bold">65%</span> of total revenue.</p>
               </div>
            </div>
          </div>

          {/* Automation Suggestions */}
          <div className="bg-[#FFFFFF] border border-slate-200/60 rounded-[24px] p-5 lg:p-6 shadow-sm">
            <h2 className="text-[16px] font-bold text-slate-900 mb-4 flex items-center gap-2">
              <span className="w-8 h-8 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center"><TrendingUp size={16}/></span>
              Automation Playbooks
            </h2>
            <div className="space-y-3">
              <div className="group bg-slate-50/50 hover:bg-slate-50 border border-slate-100 rounded-[16px] p-4 flex items-center justify-between transition-colors cursor-pointer">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-indigo-50 border border-indigo-100 flex items-center justify-center text-lg">⚡</div>
                  <div>
                    <p className="text-[14px] font-bold text-slate-900">10% discount for inactive</p>
                    <p className="text-[12px] text-slate-500">Auto-send after 30 days</p>
                  </div>
                </div>
                <button className="h-[36px] px-4 bg-white border border-slate-200 hover:border-blue-200 hover:bg-blue-50 hover:text-blue-600 text-slate-700 rounded-full text-[13px] font-bold transition-all shadow-sm">
                  Enable
                </button>
              </div>
              <div className="group bg-slate-50/50 hover:bg-slate-50 border border-slate-100 rounded-[16px] p-4 flex items-center justify-between transition-colors cursor-pointer">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-amber-50 border border-amber-100 flex items-center justify-center text-lg">🎁</div>
                  <div>
                    <p className="text-[14px] font-bold text-slate-900">Combo for high spenders</p>
                    <p className="text-[12px] text-slate-500">Auto-send on weekends</p>
                  </div>
                </div>
                <button className="h-[36px] px-4 bg-white border border-slate-200 hover:border-blue-200 hover:bg-blue-50 hover:text-blue-600 text-slate-700 rounded-full text-[13px] font-bold transition-all shadow-sm">
                  Enable
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Customer List */}
        <div className="pt-2">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-[18px] font-bold text-slate-900">Customer Directory</h2>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search size={16} className="text-slate-400" />
              </div>
              <input 
                type="text" 
                placeholder="Search..." 
                className="w-[140px] lg:w-[200px] h-[40px] pl-9 pr-4 bg-[#FFFFFF] border border-slate-200 rounded-full text-sm focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-all shadow-sm hidden sm:block"
              />
              <button className="w-[40px] h-[40px] sm:hidden flex items-center justify-center bg-[#FFFFFF] border border-slate-200 rounded-full text-slate-600 shadow-sm">
                <Search size={18} />
              </button>
            </div>
          </div>
          
          <div className="space-y-3 lg:grid lg:grid-cols-2 lg:gap-4 lg:space-y-0 xl:grid-cols-3">
            {MOCK_CUSTOMERS.map((customer) => (
              <div 
                key={customer.id}
                onClick={() => handleCustomerClick(customer)}
                className="bg-[#FFFFFF] border border-slate-200/60 rounded-[20px] p-5 shadow-sm hover:shadow-md hover:border-slate-300 active:scale-[0.98] transition-all cursor-pointer group flex flex-col justify-between"
              >
                <div>
                   <div className="flex justify-between items-start mb-3">
                     <div className="flex items-center gap-3">
                       <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center text-[18px] font-bold text-slate-500 border border-slate-200">
                         {customer.name.charAt(0)}
                       </div>
                       <div>
                         <h3 className="font-bold text-slate-900 text-[15px] group-hover:text-blue-600 transition-colors">{customer.name}</h3>
                         <p className="text-[13px] text-slate-500 mt-0.5 flex items-center gap-1">
                           <Phone size={12}/> {customer.phone}
                         </p>
                       </div>
                     </div>
                     <div className="w-8 h-8 rounded-full bg-slate-50 flex items-center justify-center text-slate-400 group-hover:bg-blue-50 group-hover:text-blue-500 transition-colors">
                       <ChevronRight size={18} />
                     </div>
                   </div>
                   
                   <div className="flex flex-wrap gap-1.5 mb-4">
                     <span className="text-[11px] font-bold text-slate-600 bg-slate-100 px-2 py-0.5 rounded-md">
                       {customer.type}
                     </span>
                     <span className="text-[11px] font-bold text-slate-600 bg-slate-100 px-2 py-0.5 rounded-md">
                       {customer.source}
                     </span>
                     {customer.tags.slice(0, 2).map((tag, i) => (
                       <span key={i} className={`text-[11px] font-bold px-2 py-0.5 rounded-md ${
                         tag === 'High Spender' ? 'bg-purple-50 text-purple-700' :
                         tag === 'Inactive 30 days' ? 'bg-rose-50 text-rose-700' :
                         tag === 'New' ? 'bg-blue-50 text-blue-700' :
                         'bg-emerald-50 text-emerald-700'
                       }`}>
                         {tag}
                       </span>
                     ))}
                   </div>
                </div>
                
                <div className="flex items-end justify-between pt-4 border-t border-slate-100 mt-auto">
                  <div>
                    <p className="text-[11px] text-slate-500 uppercase tracking-widest font-bold mb-1">Lifetime</p>
                    <p className="text-[15px] font-black text-slate-900 leading-none">₹{customer.revenue.toLocaleString()}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-[11px] text-slate-500 uppercase tracking-widest font-bold mb-1">Orders</p>
                    <p className="text-[14px] font-bold text-slate-900 leading-none">{customer.totalOrders}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-[11px] text-slate-500 uppercase tracking-widest font-bold mb-1">Last Order</p>
                    <p className="text-[13px] font-medium text-slate-700 leading-none">{customer.lastOrderDate}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {showAddModal && <AddCustomerModal onClose={() => setShowAddModal(false)} />}
    </div>
  );
};

// --- Sub Components ---

const FilteredCustomerList: React.FC<{ title: string, onBack: () => void, onCustomerClick: (c: Customer) => void }> = ({ title, onBack, onCustomerClick }) => {
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

  const toggleSelect = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const newSet = new Set(selectedIds);
    if (newSet.has(id)) newSet.delete(id);
    else newSet.add(id);
    setSelectedIds(newSet);
  };

  const selectAll = () => {
    if (selectedIds.size === MOCK_CUSTOMERS.length) {
      setSelectedIds(newSet => new Set());
    } else {
      setSelectedIds(new Set(MOCK_CUSTOMERS.map(c => c.id)));
    }
  };

  return (
    <div className="min-h-screen bg-slate-50/50 pb-32 font-sans relative">
      <header className="h-[72px] bg-[#FFFFFF] border-b border-slate-100 flex items-center justify-between px-4 sticky top-0 z-20 shadow-sm lg:px-8">
        <div className="flex items-center gap-3">
          <button onClick={onBack} className="w-10 h-10 flex items-center justify-center -ml-2 text-slate-700 hover:bg-slate-50 rounded-full active:scale-95 transition-all">
            <ArrowLeft size={24} />
          </button>
          <h1 className="text-[20px] font-bold text-slate-900 tracking-tight">{title}</h1>
        </div>
        <button className="w-10 h-10 flex items-center justify-center -mr-2 text-slate-700 hover:bg-slate-50 rounded-full active:scale-95 transition-all">
          <Filter size={20} />
        </button>
      </header>

      {/* Filters Bar */}
      <div className="bg-[#FFFFFF] border-b border-slate-100 px-4 py-3 flex gap-2 overflow-x-auto no-scrollbar sticky top-[72px] z-10 lg:px-8 shadow-sm">
        {['Customer Type', 'Order Source', 'Gender', 'Last Order Date'].map((filter, i) => (
          <button key={i} className="h-[36px] px-3 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-full text-[13px] font-semibold text-slate-700 whitespace-nowrap flex items-center gap-1 transition-colors">
            {filter} <ChevronDown size={14} className="text-slate-500"/>
          </button>
        ))}
      </div>

      <div className="p-4 lg:p-8 lg:max-w-7xl lg:mx-auto">
        <div className="flex items-center justify-between mb-4">
          <p className="text-[14px] font-bold text-slate-700">{MOCK_CUSTOMERS.length} Customers</p>
          <button onClick={selectAll} className="text-[13px] font-bold text-blue-600 hover:text-blue-700 transition-colors">
            {selectedIds.size === MOCK_CUSTOMERS.length ? 'Deselect All' : 'Select All'}
          </button>
        </div>

        <div className="space-y-3 lg:grid lg:grid-cols-2 lg:gap-4 lg:space-y-0 xl:grid-cols-3">
          {MOCK_CUSTOMERS.map((customer) => (
            <div 
              key={customer.id}
              onClick={() => onCustomerClick(customer)}
              className={`bg-[#FFFFFF] rounded-[20px] p-5 shadow-sm hover:shadow-md active:scale-[0.98] transition-all cursor-pointer relative group border ${selectedIds.has(customer.id) ? 'border-blue-500 ring-1 ring-blue-500 bg-blue-50/10' : 'border-slate-200/60'}`}
            >
              <div 
                onClick={(e) => toggleSelect(customer.id, e)}
                className={`absolute top-5 right-5 w-6 h-6 rounded-full border-2 flex items-center justify-center transition-colors z-10 ${selectedIds.has(customer.id) ? 'bg-blue-600 border-blue-600' : 'border-slate-300 bg-white group-hover:border-blue-300'}`}
              >
                {selectedIds.has(customer.id) && <Check size={14} className="text-white" strokeWidth={3} />}
              </div>

              <div className="pr-8 flex flex-col h-full">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center text-[18px] font-bold text-slate-500 border border-slate-200">
                    {customer.name.charAt(0)}
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-900 text-[15px]">{customer.name}</h3>
                    <p className="text-[13px] text-slate-500 mt-0.5 flex items-center gap-1">
                      <Phone size={12}/> {customer.phone}
                    </p>
                  </div>
                </div>
                
                <div className="flex flex-wrap gap-1.5 mb-4">
                     <span className="text-[11px] font-bold text-slate-600 bg-slate-100 px-2 py-0.5 rounded-md">
                       {customer.type}
                     </span>
                     <span className="text-[11px] font-bold text-slate-600 bg-slate-100 px-2 py-0.5 rounded-md">
                       {customer.source}
                     </span>
                </div>
                
                <div className="flex items-end justify-between pt-4 border-t border-slate-100 mt-auto">
                  <div>
                    <p className="text-[11px] text-slate-500 uppercase tracking-widest font-bold mb-1">Lifetime</p>
                    <p className="text-[15px] font-black text-slate-900 leading-none">₹{customer.revenue.toLocaleString()}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-[11px] text-slate-500 uppercase tracking-widest font-bold mb-1">Orders</p>
                    <p className="text-[14px] font-bold text-slate-900 leading-none">{customer.totalOrders}</p>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Bulk Actions Bottom Bar */}
      {selectedIds.size > 0 && (
        <div className="fixed bottom-0 left-0 right-0 bg-[#FFFFFF] border-t border-slate-200 p-4 pb-8 shadow-[0_-10px_40px_rgba(0,0,0,0.1)] z-30 animate-in slide-in-from-bottom-full">
          <div className="flex items-center justify-between mb-3 lg:max-w-7xl lg:mx-auto">
            <span className="text-[14px] font-bold text-slate-900 bg-slate-100 px-3 py-1 rounded-full">{selectedIds.size} Selected</span>
          </div>
          <div className="flex gap-2 lg:max-w-7xl lg:mx-auto">
            <button className="flex-1 h-[48px] bg-blue-50 hover:bg-blue-100 text-blue-700 rounded-2xl font-bold text-[14px] flex items-center justify-center gap-2 border border-blue-100 transition-colors shadow-sm">
              <Tag size={18} /> Send Offer
            </button>
            <button className="flex-1 h-[48px] bg-emerald-50 hover:bg-emerald-100 text-emerald-700 rounded-2xl font-bold text-[14px] flex items-center justify-center gap-2 border border-emerald-100 transition-colors shadow-sm">
              <MessageCircle size={18} /> WhatsApp
            </button>
            <button className="flex-1 h-[48px] bg-amber-50 hover:bg-amber-100 text-amber-700 rounded-2xl font-bold text-[14px] flex items-center justify-center gap-2 border border-amber-100 transition-colors shadow-sm mt-0 hidden sm:flex">
              <MessageSquare size={18} /> SMS
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

const CustomerDetail: React.FC<{ customer: Customer, onBack: () => void }> = ({ customer, onBack }) => {
  return (
    <div className="min-h-screen bg-slate-50/50 pb-20 font-sans">
      <header className="h-[72px] bg-[#FFFFFF] border-b border-slate-100 flex items-center px-4 sticky top-0 z-20 shadow-sm lg:px-8">
        <button onClick={onBack} className="w-10 h-10 flex items-center justify-center -ml-2 text-slate-700 hover:bg-slate-50 rounded-full active:scale-95 transition-all">
          <ArrowLeft size={24} />
        </button>
        <h1 className="text-[20px] font-bold text-slate-900 tracking-tight ml-2">Customer Profile</h1>
      </header>

      <div className="p-4 space-y-6 lg:p-8 lg:max-w-3xl lg:mx-auto">
        {/* Profile Card */}
        <div className="bg-[#FFFFFF] rounded-[24px] p-6 lg:p-8 text-center border border-slate-200/60 shadow-sm relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-blue-50/50 rounded-full blur-2xl transform translate-x-10 -translate-y-10"></div>
          
          <div className="w-24 h-24 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center text-[40px] font-bold mx-auto mb-4 border-4 border-white shadow-sm relative z-10">
            {customer.name.charAt(0)}
          </div>
          <h2 className="text-[24px] font-black text-slate-900 tracking-tight z-10 relative">{customer.name}</h2>
          
          <div className="flex items-center justify-center gap-4 mt-2 mb-4 z-10 relative">
            <p className="text-[14px] text-slate-500 font-medium flex items-center gap-1.5 bg-slate-50 px-3 py-1 rounded-full"><Phone size={14}/> {customer.phone}</p>
            <p className="text-[14px] text-slate-500 font-medium flex items-center gap-1.5 bg-slate-50 px-3 py-1 rounded-full"><Mail size={14}/> {customer.email}</p>
          </div>
          
          <div className="flex flex-wrap justify-center gap-2 mt-4 z-10 relative">
            {customer.tags.map((tag, i) => (
              <span key={i} className={`text-[12px] font-bold px-3 py-1 rounded-full ${
                tag === 'High Spender' ? 'bg-purple-50 hover:bg-purple-100 text-purple-700' :
                tag === 'Inactive 30 days' ? 'bg-rose-50 hover:bg-rose-100 text-rose-700' :
                tag === 'New' ? 'bg-blue-50 hover:bg-blue-100 text-blue-700' :
                'bg-emerald-50 hover:bg-emerald-100 text-emerald-700'
              } transition-colors cursor-pointer`}>
                {tag}
              </span>
            ))}
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-[#FFFFFF] rounded-[20px] p-5 border border-slate-200/60 shadow-sm hover:shadow-md transition-all">
            <div className="w-10 h-10 rounded-2xl bg-blue-50 flex items-center justify-center mb-3">
              <ShoppingBag size={20} className="text-blue-600" />
            </div>
            <p className="text-[12px] text-slate-500 font-bold uppercase tracking-wider mb-1">Total Orders</p>
            <p className="text-[24px] font-black text-slate-900 tracking-tight leading-none">{customer.totalOrders}</p>
          </div>
          <div className="bg-[#FFFFFF] rounded-[20px] p-5 border border-slate-200/60 shadow-sm hover:shadow-md transition-all">
            <div className="w-10 h-10 rounded-2xl bg-emerald-50 flex items-center justify-center mb-3">
              <TrendingUp size={20} className="text-emerald-600" />
            </div>
            <p className="text-[12px] text-slate-500 font-bold uppercase tracking-wider mb-1">Total Spend</p>
            <p className="text-[24px] font-black text-slate-900 tracking-tight leading-none">₹{customer.revenue.toLocaleString()}</p>
          </div>
          <div className="bg-[#FFFFFF] rounded-[20px] p-5 border border-slate-200/60 shadow-sm hover:shadow-md transition-all">
            <div className="w-10 h-10 rounded-2xl bg-amber-50 flex items-center justify-center mb-3">
              <Award size={20} className="text-amber-600" />
            </div>
            <p className="text-[12px] text-slate-500 font-bold uppercase tracking-wider mb-1">Avg Order</p>
            <p className="text-[24px] font-black text-slate-900 tracking-tight leading-none">₹{Math.round(customer.revenue / customer.totalOrders)}</p>
          </div>
          <div className="bg-[#FFFFFF] rounded-[20px] p-5 border border-slate-200/60 shadow-sm hover:shadow-md transition-all">
            <div className="w-10 h-10 rounded-2xl bg-purple-50 flex items-center justify-center mb-3">
              <Calendar size={20} className="text-purple-600" />
            </div>
            <p className="text-[12px] text-slate-500 font-bold uppercase tracking-wider mb-1">Last Order</p>
            <p className="text-[15px] font-bold text-slate-900 leading-tight mt-1 pt-1">{customer.lastOrderDate}</p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="grid grid-flow-col gap-3 pt-2">
          <button className="h-[52px] bg-emerald-500 hover:bg-emerald-600 text-white rounded-[16px] font-bold text-[15px] flex items-center justify-center gap-2 active:scale-95 transition-all shadow-sm">
            <MessageCircle size={20} /> WhatsApp
          </button>
          <button className="h-[52px] bg-blue-600 hover:bg-blue-700 text-white rounded-[16px] font-bold text-[15px] flex items-center justify-center gap-2 active:scale-95 transition-all shadow-sm">
            <Tag size={20} /> Send Offer
          </button>
        </div>

        {/* Order History (Mock) */}
        <div className="pt-4">
          <h3 className="text-[16px] font-bold text-slate-900 mb-4 flex items-center gap-2">
             Recent Orders
          </h3>
          <div className="bg-[#FFFFFF] border border-slate-200/60 rounded-[24px] overflow-hidden shadow-sm">
            {[1, 2, 3].map((_, i) => (
              <div key={i} className={`p-5 flex justify-between items-center hover:bg-slate-50 transition-colors cursor-pointer ${i !== 2 ? 'border-b border-slate-100' : ''}`}>
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-600">
                    <ShoppingBag size={18}/>
                  </div>
                  <div>
                    <p className="font-bold text-slate-900 text-[15px]">ORD-10{i}4</p>
                    <p className="text-[13px] text-slate-500 mt-0.5">{customer.lastOrderDate} • Delivery</p>
                  </div>
                </div>
                <div className="text-right flex items-center gap-4">
                  <div>
                    <p className="font-bold text-slate-900 text-[15px]">₹{Math.round(customer.revenue / customer.totalOrders)}</p>
                    <p className="text-[12px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full mt-1">Completed</p>
                  </div>
                  <ChevronRight size={20} className="text-slate-300"/>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

const AddCustomerModal: React.FC<{ onClose: () => void }> = ({ onClose }) => {
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    email: '',
    gender: 'Male',
    type: 'New'
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validate = () => {
    const newErrors: Record<string, string> = {};
    if (!formData.name) newErrors.name = 'Name is required';
    if (!/^\d{10}$/.test(formData.phone)) newErrors.phone = 'Phone must be 10 digits';
    if (formData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) newErrors.email = 'Invalid email format';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = () => {
    if (validate()) {
      // Save logic here
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-in fade-in">
      <div className="bg-[#FFFFFF] w-full max-w-md rounded-t-[24px] sm:rounded-[24px] overflow-hidden animate-in slide-in-from-bottom-8">
        <div className="h-[56px] border-b border-slate-100 flex items-center justify-between px-4">
          <h2 className="text-lg font-bold text-slate-900">Add Customer</h2>
          <button onClick={onClose} className="w-8 h-8 flex items-center justify-center bg-slate-100 rounded-full text-slate-600 active:scale-95">
            <X size={18} />
          </button>
        </div>

        <div className="p-4 space-y-4 max-h-[70vh] overflow-y-auto">
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5 ml-1">Customer Name</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <User size={18} className="text-slate-400" />
              </div>
              <input 
                type="text" 
                value={formData.name}
                onChange={(e) => setFormData({...formData, name: e.target.value})}
                placeholder="Enter full name"
                className={`w-full h-[48px] pl-10 pr-4 bg-slate-50 border ${errors.name ? 'border-rose-500' : 'border-slate-200'} rounded-xl text-sm focus:outline-none focus:border-blue-500 focus:bg-[#FFFFFF] transition-colors`}
              />
            </div>
            {errors.name && <p className="text-[10px] text-rose-500 mt-1 ml-1">{errors.name}</p>}
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5 ml-1">Phone Number</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Phone size={18} className="text-slate-400" />
              </div>
              <input 
                type="tel" 
                value={formData.phone}
                onChange={(e) => setFormData({...formData, phone: e.target.value.replace(/\D/g, '').slice(0, 10)})}
                placeholder="10 digit mobile number"
                className={`w-full h-[48px] pl-10 pr-4 bg-slate-50 border ${errors.phone ? 'border-rose-500' : 'border-slate-200'} rounded-xl text-sm focus:outline-none focus:border-blue-500 focus:bg-[#FFFFFF] transition-colors`}
              />
            </div>
            {errors.phone && <p className="text-[10px] text-rose-500 mt-1 ml-1">{errors.phone}</p>}
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5 ml-1">Email ID (Optional)</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Mail size={18} className="text-slate-400" />
              </div>
              <input 
                type="email" 
                value={formData.email}
                onChange={(e) => setFormData({...formData, email: e.target.value})}
                placeholder="customer@email.com"
                className={`w-full h-[48px] pl-10 pr-4 bg-slate-50 border ${errors.email ? 'border-rose-500' : 'border-slate-200'} rounded-xl text-sm focus:outline-none focus:border-blue-500 focus:bg-[#FFFFFF] transition-colors`}
              />
            </div>
            {errors.email && <p className="text-[10px] text-rose-500 mt-1 ml-1">{errors.email}</p>}
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5 ml-1">Gender</label>
              <select 
                value={formData.gender}
                onChange={(e) => setFormData({...formData, gender: e.target.value})}
                className="w-full h-[48px] px-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-blue-500 focus:bg-[#FFFFFF] transition-colors appearance-none"
              >
                <option value="Male">Male</option>
                <option value="Female">Female</option>
                <option value="Other">Other</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5 ml-1">Customer Type</label>
              <select 
                value={formData.type}
                onChange={(e) => setFormData({...formData, type: e.target.value})}
                className="w-full h-[48px] px-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-blue-500 focus:bg-[#FFFFFF] transition-colors appearance-none"
              >
                <option value="New">New</option>
                <option value="Existing">Existing</option>
              </select>
            </div>
          </div>
        </div>

        <div className="p-4 border-t border-slate-100 flex gap-3">
          <button 
            onClick={onClose}
            className="flex-1 h-[48px] bg-slate-100 text-slate-700 rounded-xl font-bold text-sm active:scale-95 transition-transform"
          >
            Cancel
          </button>
          <button 
            onClick={handleSave}
            className="flex-1 h-[48px] bg-blue-600 text-white rounded-xl font-bold text-sm active:scale-95 transition-transform shadow-sm"
          >
            Save Customer
          </button>
        </div>
      </div>
    </div>
  );
};

// Helper icon
const ChevronDown: React.FC<{size?: number, className?: string}> = ({size=24, className=""}) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="m6 9 6 6 6-6"/></svg>
);
const Check: React.FC<{size?: number, className?: string, strokeWidth?: number}> = ({size=24, className="", strokeWidth=2}) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M20 6 9 17l-5-5"/></svg>
);
