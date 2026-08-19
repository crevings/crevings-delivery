
import React, { useState } from 'react';
import { 
  Plus, 
  ArrowLeft,
  TrendingUp,
  Tag,
  Clock,
  MoreVertical,
  Edit2,
  PauseCircle,
  PlayCircle,
  Trash2,
  Copy,
  Eye,
  Sparkles,
  ChevronRight,
  Wallet,
  ShoppingBag,
  Search,
  CheckCircle2,
  X,
  Share2, 
  QrCode, 
  Link
} from 'lucide-react';

interface OffersViewProps {
  offers: any[];
  setOffers: (offers: any[]) => void;
  onNavigateToCreateOffer: () => void;
  onBack?: () => void;
}

export const OffersView: React.FC<OffersViewProps> = ({ offers, setOffers, onNavigateToCreateOffer, onBack }) => {
  const [activeFilter, setActiveFilter] = useState<'All' | 'Active' | 'Paused' | 'Scheduled' | 'Expired'>('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [showToast, setShowToast] = useState('');
  const [viewDetailsOffer, setViewDetailsOffer] = useState<any | null>(null);
  const [shareOffer, setShareOffer] = useState<any | null>(null);
  
  // Mock Data
  const summary = {
    activeOffers: offers.filter(o => o.status === 'Active').length,
    totalOffers: offers.length,
    revenue: '₹12,500',
    orders: 145
  };

  const [openMenuId, setOpenMenuId] = useState<string | null>(null);

  const filteredOffers = offers.filter(o => {
    const matchesFilter = activeFilter === 'All' || o.status === activeFilter;
    const matchesSearch = o.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          o.id.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  const toggleOfferStatus = (id: string) => {
    setOffers(offers.map(o => {
      if (o.id === id) {
        if (o.status === 'Active') return { ...o, status: 'Paused' };
        if (o.status === 'Paused') return { ...o, status: 'Active' };
      }
      return o;
    }));
    setOpenMenuId(null);
  };

  const deleteOffer = (id: string) => {
    setOffers(offers.filter(o => o.id !== id));
    setOpenMenuId(null);
  };

  const duplicateOffer = (offerToDuplicate: any) => {
    const newOffer = {
      ...offerToDuplicate,
      id: `OFF-${Math.floor(Math.random() * 900) + 100}`,
      name: `${offerToDuplicate.name} (Copy)`,
      status: 'Paused',
      usage: '0 / ' + (offerToDuplicate.usage.split(' / ')[1] || '∞'),
      orders: 0,
      revenue: '₹0'
    };
    setOffers([newOffer, ...offers]);
    setOpenMenuId(null);
    setShowToast('Offer duplicated successfully');
    setTimeout(() => setShowToast(''), 2500);
  };

  const handleEdit = () => {
    // Navigate to CreateOffer with edit state or just notify
    setShowToast('Navigating to Editor...');
    setTimeout(() => {
      setShowToast('');
      onNavigateToCreateOffer();
    }, 1500);
  };

  return (
    <div className="min-h-screen bg-[#FFFFFF] pb-24 font-sans">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-[#FFFFFF] border-b border-slate-100 h-[56px] flex items-center justify-between px-4">
        <div className="flex items-center gap-3">
          <button onClick={onBack} className="w-10 h-10 flex items-center justify-center -ml-2 text-slate-700 active:bg-slate-100 rounded-full transition-colors">
            <ArrowLeft size={22} />
          </button>
          <h1 className="text-[18px] font-semibold text-slate-900">Offers</h1>
        </div>
      </header>

      <div className="p-4 space-y-6">
        {/* Metrics Grid */}
        <div className="grid grid-cols-2 gap-4">
          {/* Card 1 */}
          <div className="bg-[#FFFFFF] p-4 rounded-[20px] border border-slate-200 flex flex-col justify-between h-[110px]">
            <div>
              <div className="text-[13px] font-semibold text-slate-700 leading-tight">Active Offers</div>
              <div className="text-[11px] text-slate-500 mt-0.5">Currently running</div>
            </div>
            <div className="text-2xl font-black text-slate-900">{summary.activeOffers}</div>
          </div>
          
          {/* Card 2 */}
          <div className="bg-[#FFFFFF] p-4 rounded-[20px] border border-slate-200 flex flex-col justify-between h-[110px]">
            <div>
              <div className="text-[13px] font-semibold text-slate-700 leading-tight">Inactive Offers</div>
              <div className="text-[11px] text-slate-500 mt-0.5">Paused or expired</div>
            </div>
            <div className="text-2xl font-black text-slate-900">{summary.totalOffers - summary.activeOffers}</div>
          </div>
          
          {/* Card 3 */}
          <div className="bg-[#FFFFFF] p-4 rounded-[20px] border border-slate-200 flex flex-col justify-between h-[110px]">
            <div>
              <div className="text-[13px] font-semibold text-emerald-600 leading-tight">Revenue Impact</div>
              <div className="text-[11px] text-emerald-600/80 mt-0.5">Generated via offers</div>
            </div>
            <div className="text-2xl font-black text-emerald-600">{summary.revenue}</div>
          </div>
          
          {/* Card 4 */}
          <div className="bg-[#FFFFFF] p-4 rounded-[20px] border border-slate-200 flex flex-col justify-between h-[110px]">
            <div>
              <div className="text-[13px] font-semibold text-slate-700 leading-tight">Orders via Offers</div>
              <div className="text-[11px] text-slate-500 mt-0.5">Total orders placed</div>
            </div>
            <div className="text-2xl font-black text-slate-900">{summary.orders}</div>
          </div>
        </div>

        {/* Search Bar */}
        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-[#6B7280]" size={20} />
          <input 
            type="text" 
            placeholder="Search offers by name or ID..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full h-[52px] bg-[#FFFFFF] border border-[#E5E7EB] text-[#111827] py-4 pl-12 pr-4 rounded-[16px] focus:outline-none focus:border-blue-500 text-[15px] font-medium transition-all"
          />
        </div>

        {/* Quick Filter Tabs */}
        <div className="flex gap-[8px] overflow-x-auto no-scrollbar -mx-4 px-4 lg:mx-0 lg:px-0 lg:flex-wrap">
          {['All', 'Active', 'Paused', 'Expired'].map((filter) => (
            <button
              key={filter}
              onClick={() => setActiveFilter(filter as any)}
              className={`h-[36px] px-[16px] rounded-[18px] text-[14px] font-medium whitespace-nowrap transition-all duration-300 flex-shrink-0 ${
                activeFilter === filter 
                  ? 'bg-[#1E90FF] text-white shadow-md shadow-blue-500/20' 
                  : 'bg-[#FFFFFF] border border-[#E5E7EB] text-[#4B5563] hover:bg-slate-50'
              }`}
            >
              {filter}
            </button>
          ))}
        </div>

        {/* Offer List Section */}
        <div className="space-y-4">
          {filteredOffers.length === 0 ? (
            <div className="bg-[#FFFFFF] rounded-[20px] p-8 border border-slate-200 text-center">
              <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4 text-slate-400">
                <Tag size={24} />
              </div>
              <h3 className="text-[16px] font-bold text-slate-900 mb-2">No offers created yet</h3>
              <p className="text-[14px] text-slate-500 mb-6">Create your first offer to boost sales and attract more customers.</p>
              <button 
                onClick={onNavigateToCreateOffer}
                className="h-[44px] px-6 bg-[#1E90FF] text-white rounded-xl font-semibold text-[14px] active:scale-[0.98] transition-all inline-flex items-center gap-2"
              >
                <Plus size={18} />
                Create your first offer
              </button>
            </div>
          ) : (
            filteredOffers.map((offer) => (
              <div key={offer.id} className="bg-[#FFFFFF] rounded-[20px] p-5 border border-slate-200 relative">
                
                {/* 3 Dot Menu */}
                <div className="absolute top-4 right-4">
                  <button 
                    onClick={() => setOpenMenuId(openMenuId === offer.id ? null : offer.id)}
                    className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-slate-50 text-slate-400 transition-colors"
                  >
                    <MoreVertical size={18} />
                  </button>
                  
                  {openMenuId === offer.id && (
                    <div className="absolute right-0 top-10 w-48 bg-[#FFFFFF] rounded-xl shadow-lg border border-slate-100 py-1 z-10 animate-in fade-in zoom-in-95 duration-200">
                      <button onClick={() => duplicateOffer(offer)} className="w-full px-4 py-2.5 text-left text-[14px] font-medium text-slate-700 hover:bg-slate-50 flex items-center gap-2">
                        <Copy size={16} className="text-slate-400" /> Duplicate Offer
                      </button>
                      <button onClick={() => { setViewDetailsOffer(offer); setOpenMenuId(null); }} className="w-full px-4 py-2.5 text-left text-[14px] font-medium text-slate-700 hover:bg-slate-50 flex items-center gap-2">
                        <Eye size={16} className="text-slate-400" /> View Details
                      </button>
                      <button onClick={() => { setShareOffer(offer); setOpenMenuId(null); }} className="w-full px-4 py-2.5 text-left text-[14px] font-medium text-slate-700 hover:bg-slate-50 flex items-center gap-2">
                        <Share2 size={16} className="text-slate-400" /> Share Offer
                      </button>
                    </div>
                  )}
                </div>

                <div className="pr-10 mb-4">
                  <div className="flex items-center gap-2 mb-1.5">
                    <span className={`px-2 py-0.5 rounded-md text-[11px] font-bold uppercase tracking-wider ${
                      offer.status === 'Active' ? 'bg-emerald-50 text-emerald-600' : 
                      offer.status === 'Paused' ? 'bg-amber-50 text-amber-600' : 
                      offer.status === 'Scheduled' ? 'bg-blue-50 text-blue-600' : 
                      'bg-slate-100 text-slate-500'
                    }`}>
                      {offer.status}
                    </span>
                    <span className="text-[12px] font-medium text-slate-400">{offer.type}</span>
                  </div>
                  <h3 className="text-[18px] font-bold text-slate-900 leading-tight mb-1">{offer.name}</h3>
                  <p className="text-[13px] text-slate-600">{offer.description}</p>
                </div>

                <div className="grid grid-cols-2 gap-y-3 gap-x-4 mb-5 bg-slate-50 p-3 rounded-xl">
                  <div>
                    <p className="text-[11px] font-medium text-slate-500 mb-0.5">Validity</p>
                    <p className="text-[13px] font-semibold text-slate-900">{offer.validity}</p>
                  </div>
                  <div>
                    <p className="text-[11px] font-medium text-slate-500 mb-0.5">Usage</p>
                    <p className="text-[13px] font-semibold text-slate-900">Used {offer.usage}</p>
                  </div>
                  <div>
                    <p className="text-[11px] font-medium text-slate-500 mb-0.5">Orders Generated</p>
                    <p className="text-[13px] font-semibold text-slate-900">{offer.orders} Orders</p>
                  </div>
                  <div>
                    <p className="text-[11px] font-medium text-slate-500 mb-0.5">Revenue Generated</p>
                    <p className="text-[13px] font-semibold text-emerald-600">{offer.revenue}</p>
                  </div>
                </div>

                <div className="flex gap-2">
                  <button onClick={() => setShareOffer(offer)} className="w-[36px] h-[36px] bg-[#FFFFFF] border border-slate-200 text-slate-700 rounded-lg flex items-center justify-center hover:bg-slate-50 transition-colors">
                    <Share2 size={16} />
                  </button>
                  <button onClick={handleEdit} className="flex-1 h-[36px] bg-[#FFFFFF] border border-slate-200 text-slate-700 rounded-lg font-medium text-[13px] flex items-center justify-center gap-1.5 hover:bg-slate-50 transition-colors">
                    <Edit2 size={14} /> Edit
                  </button>
                  {offer.status !== 'Expired' && (
                    <button 
                      onClick={() => toggleOfferStatus(offer.id)}
                      className="flex-1 h-[36px] bg-[#FFFFFF] border border-slate-200 text-slate-700 rounded-lg font-medium text-[13px] flex items-center justify-center gap-1.5 hover:bg-slate-50 transition-colors"
                    >
                      {offer.status === 'Active' ? <><PauseCircle size={14} /> Pause</> : <><PlayCircle size={14} /> Resume</>}
                    </button>
                  )}
                  <button 
                    onClick={() => deleteOffer(offer.id)}
                    className="w-[36px] h-[36px] bg-[#FFFFFF] border border-slate-200 text-rose-500 rounded-lg flex items-center justify-center hover:bg-rose-50 transition-colors"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>

              </div>
            ))
          )}
        </div>
      </div>

      {/* Floating Create Button */}
      <button 
        onClick={onNavigateToCreateOffer}
        className="fixed bottom-[100px] right-6 lg:bottom-10 lg:right-10 z-50 h-14 px-6 bg-[#1E90FF] text-[#FFFFFF] rounded-full flex items-center justify-center shadow-lg active:scale-[0.98] transition-all font-semibold text-[15px]"
      >
        Create
      </button>

      {/* Details Modal */}
      {viewDetailsOffer && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 p-4 animate-in fade-in">
          <div className="bg-[#FFFFFF] w-full max-w-md rounded-2xl shadow-xl overflow-hidden animate-in zoom-in-95">
            <div className="p-4 border-b border-slate-100 flex items-center justify-between">
              <h3 className="text-[16px] font-bold text-slate-900">Offer Details</h3>
              <button 
                onClick={() => setViewDetailsOffer(null)}
                className="w-8 h-8 rounded-full bg-slate-50 flex items-center justify-center text-slate-500 hover:bg-slate-100 transition-colors"
              >
                <X size={18} />
              </button>
            </div>
            <div className="p-5 space-y-4">
              <div>
                <p className="text-[12px] text-slate-500 mb-1">Offer ID</p>
                <p className="text-[14px] font-bold text-slate-900">{viewDetailsOffer.id}</p>
              </div>
              <div>
                <p className="text-[12px] text-slate-500 mb-1">Offer Name</p>
                <p className="text-[14px] font-bold text-slate-900">{viewDetailsOffer.name}</p>
              </div>
              <div>
                <p className="text-[12px] text-slate-500 mb-1">Description</p>
                <p className="text-[14px] font-medium text-slate-700">{viewDetailsOffer.description}</p>
              </div>
              <div className="grid grid-cols-2 gap-4 pt-2">
                <div>
                  <p className="text-[12px] text-slate-500 mb-1">Status</p>
                  <p className="text-[14px] font-bold text-slate-900">{viewDetailsOffer.status}</p>
                </div>
                <div>
                  <p className="text-[12px] text-slate-500 mb-1">Type</p>
                  <p className="text-[14px] font-bold text-slate-900">{viewDetailsOffer.type}</p>
                </div>
              </div>
            </div>
            <div className="p-4 border-t border-slate-100 bg-slate-50">
              <button 
                onClick={() => setViewDetailsOffer(null)}
                className="w-full h-[44px] bg-[#FFFFFF] border border-slate-200 text-slate-700 rounded-xl font-bold text-[14px]"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Share Modal */}
      {shareOffer && (
        <div className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center bg-black/50 sm:p-4 animate-in fade-in transition-all">
          <div className="bg-[#FFFFFF] w-full sm:max-w-md rounded-t-3xl sm:rounded-2xl shadow-xl overflow-hidden animate-in slide-in-from-bottom-full sm:slide-in-from-bottom-0 sm:zoom-in-95">
            <div className="p-4 border-b border-slate-100 flex items-center justify-between">
              <h3 className="text-[16px] font-bold text-slate-900">Share Offer</h3>
              <button 
                onClick={() => setShareOffer(null)}
                className="w-8 h-8 rounded-full bg-slate-50 flex items-center justify-center text-slate-500 hover:bg-slate-100 transition-colors"
              >
                <X size={18} />
              </button>
            </div>
            <div className="p-6 flex flex-col items-center">
              <div className="w-full max-w-[200px] aspect-square bg-slate-50 border border-slate-200 rounded-2xl flex items-center justify-center mb-6 relative overflow-hidden">
                <QrCode size={120} className="text-slate-800" strokeWidth={1} />
                <div className="absolute inset-0 bg-gradient-to-tr from-white/10 to-transparent"></div>
              </div>
              <h4 className="text-[18px] font-bold text-slate-900 text-center mb-1">{shareOffer.name}</h4>
              <p className="text-[13px] text-slate-500 text-center mb-6 px-4">{shareOffer.description}</p>
              
              <div className="w-full space-y-3">
                <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl flex items-center justify-between">
                  <span className="text-[13px] font-mono text-slate-600 truncate pr-4">https://crevings.app/offer/{shareOffer.id.toLowerCase()}</span>
                  <button 
                    onClick={() => {
                      navigator.clipboard.writeText(`https://crevings.app/offer/${shareOffer.id.toLowerCase()}`);
                      setShowToast('Link copied to clipboard');
                      setTimeout(() => setShowToast(''), 2500);
                    }}
                    className="p-2 bg-white rounded-lg border border-slate-200 text-[#1E90FF] hover:bg-blue-50 transition-colors shrink-0"
                  >
                    <Copy size={16} />
                  </button>
                </div>
                
                <button 
                  onClick={() => {
                    if (navigator.share) {
                      navigator.share({
                        title: shareOffer.name,
                        text: `Check out this offer: ${shareOffer.description}`,
                        url: `https://crevings.app/offer/${shareOffer.id.toLowerCase()}`
                      }).catch(console.error);
                    } else {
                      setShowToast('Sharing not supported on this device');
                      setTimeout(() => setShowToast(''), 2500);
                    }
                  }}
                  className="w-full h-[48px] bg-[#1E90FF] text-[#FFFFFF] rounded-xl font-bold text-[15px] flex items-center justify-center gap-2 active:scale-[0.98] transition-all"
                >
                  <Share2 size={18} /> Share via Apps
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Toast */}
      {showToast && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-[100] animate-in slide-in-from-bottom-5">
          <div className="bg-slate-900 text-white px-4 py-3 rounded-xl shadow-lg flex items-center gap-2 text-[14px] font-medium">
            <CheckCircle2 size={16} className="text-emerald-400" /> {showToast}
          </div>
        </div>
      )}

    </div>
  );
};

