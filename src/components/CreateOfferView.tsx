import React, { useState } from 'react';
import { 
  ArrowLeft, 
  Percent, 
  Wallet, 
  Gift, 
  Package, 
  Search, 
  TrendingUp, 
  AlertTriangle, 
  CheckCircle2, 
  Info,
  X,
  Check,
  Tag,
  Loader2
} from 'lucide-react';

interface CreateOfferViewProps {
  onBack: () => void;
  onCreate?: (offer: any) => void;
}

export const CreateOfferView: React.FC<CreateOfferViewProps> = ({ onBack, onCreate }) => {
  const [offerType, setOfferType] = useState<'percentage' | 'flat' | 'bogo' | 'free_item' | 'booking'>('percentage');
  
  const [discountPercent, setDiscountPercent] = useState('');
  const [maxCap, setMaxCap] = useState('');
  const [discountAmount, setDiscountAmount] = useState('');
  
  // Free Item states
  const [freeItemName, setFreeItemName] = useState('');
  const [freeItemDescription, setFreeItemDescription] = useState('');
  const [freeItemSearchQuery, setFreeItemSearchQuery] = useState('');
  const [showFreeItemDropdown, setShowFreeItemDropdown] = useState(false);
  
  const [minOrder, setMinOrder] = useState('');
  const [perUserLimit, setPerUserLimit] = useState('');
  const [totalUsageLimit, setTotalUsageLimit] = useState('');
  
  const [startDate, setStartDate] = useState('');
  const [startTime, setStartTime] = useState('');
  const [endDate, setEndDate] = useState('');
  const [endTime, setEndTime] = useState('');
  const [customTerms, setCustomTerms] = useState('');
  
  const [promoCode, setPromoCode] = useState('');
  const [visibility, setVisibility] = useState<'public' | 'hidden'>('public');

  const [customerType, setCustomerType] = useState<'all' | 'new' | 'returning'>('all');
  const [orderTypes, setOrderTypes] = useState({ delivery: true, takeaway: true, dineIn: true });
  const [paymentMode, setPaymentMode] = useState<'all' | 'prepaid'>('all');
  const [allowClubbing, setAllowClubbing] = useState(false);
  
  const [applicableScope, setApplicableScope] = useState<'all' | 'category' | 'items'>('all');
  
  const [saveStep, setSaveStep] = useState<'input' | 'loading' | 'success'>('input');

  // Item selection states
  const [isItemSelectSheetOpen, setIsItemSelectSheetOpen] = useState(false);
  const [itemSearchQuery, setItemSearchQuery] = useState('');
  const [selectedItems, setSelectedItems] = useState<string[]>([]);

  const menuCategories = [
    { 
      id: 'c1', 
      name: 'Starters',
      items: [
        { id: 'i1', name: 'Paneer Tikka' },
        { id: 'i2', name: 'Chicken Wings' },
        { id: 'i3', name: 'Spring Rolls' }
      ]
    },
    { 
      id: 'c2', 
      name: 'Main Course',
      items: [
        { id: 'i4', name: 'Butter Chicken' },
        { id: 'i5', name: 'Dal Makhani' },
        { id: 'i6', name: 'Garlic Naan' }
      ]
    },
    { 
      id: 'c3', 
      name: 'Desserts',
      items: [
        { id: 'i7', name: 'Gulab Jamun' },
        { id: 'i8', name: 'Ice Cream' }
      ]
    }
  ];

  const allItemIds = menuCategories.flatMap(c => c.items.map(i => i.id));
  const isAllSelected = selectedItems.length === allItemIds.length && allItemIds.length > 0;

  const handleSelectAllItems = () => {
    if (isAllSelected) {
      setSelectedItems([]);
    } else {
      setSelectedItems(allItemIds);
    }
  };

  const handleSelectCategory = (categoryId: string) => {
    const category = menuCategories.find(c => c.id === categoryId);
    if (!category) return;
    
    const categoryItemIds = category.items.map(i => i.id);
    const allCategoryItemsSelected = categoryItemIds.every(id => selectedItems.includes(id));
    
    if (allCategoryItemsSelected) {
      setSelectedItems(prev => prev.filter(id => !categoryItemIds.includes(id)));
    } else {
      setSelectedItems(prev => {
        const newSelection = [...prev];
        categoryItemIds.forEach(id => {
          if (!newSelection.includes(id)) newSelection.push(id);
        });
        return newSelection;
      });
    }
  };

  const handleSelectItem = (itemId: string) => {
    setSelectedItems(prev => 
      prev.includes(itemId) ? prev.filter(id => id !== itemId) : [...prev, itemId]
    );
  };

  // Derived calculations for Cost Impact & Profit Protection
  const estimatedOrders = 150; // Mock base orders
  const avgOrderValue = 400; // Mock AOV
  
  let marginWarning = false;
  let highDiscountWarning = false;
  let expectedOrderIncrease = 0;
  let expectedRevenueBoost = 0;

  if (offerType === 'percentage' && discountPercent) {
    const pct = parseFloat(discountPercent);
    if (pct > 30) highDiscountWarning = true;
    if (pct > 40) marginWarning = true;
    
    expectedOrderIncrease = Math.min(pct * 0.8, 40);
    expectedRevenueBoost = Math.min(pct * 0.5, 25);
  } else if (offerType === 'flat' && discountAmount) {
    const amt = parseFloat(discountAmount);
    if (amt > 150) highDiscountWarning = true;
    if (amt > 200) marginWarning = true;
    
    expectedOrderIncrease = Math.min((amt / avgOrderValue) * 100 * 0.8, 40);
    expectedRevenueBoost = Math.min((amt / avgOrderValue) * 100 * 0.5, 25);
  }

  const isValid = () => {
    if (offerType === 'percentage' && !discountPercent) return false;
    if (offerType === 'flat' && !discountAmount) return false;
    if (offerType === 'free_item' && !freeItemName) return false;
    if (offerType === 'booking' && !discountPercent) return false;
    if (visibility === 'hidden' && !promoCode) return false;
    return true;
  };

  const handleInitiateSave = () => {
    if (!isValid()) return;
    setSaveStep('loading');
    setTimeout(() => {
      handleSave();
    }, 1500);
  };

  const handleSave = () => {
    const isScheduled = startDate && new Date(startDate).getTime() > Date.now();
    
    // Create new offer data
    const newOffer = {
      id: `OFF-${Math.floor(Math.random() * 900) + 100}`,
      name: `${offerType === 'percentage' ? discountPercent + '% Off' : offerType === 'flat' ? 'Flat ₹' + discountAmount + ' Off' : offerType === 'bogo' ? 'BOGO Offer' : offerType === 'booking' ? discountPercent + '% Booking Discount' : 'Free Item Offer'}`,
      type: `${offerType === 'percentage' ? 'Percentage Discount' : offerType === 'flat' ? 'Flat Discount' : offerType === 'bogo' ? 'Combo Offer' : offerType === 'booking' ? 'Table Booking' : 'Free Item'}`,
      status: isScheduled ? 'Scheduled' : 'Active',
      description: renderPreviewTitle() + '. ' + renderPreviewSubtitle(),
      validity: `${startDate ? new Date(startDate).toLocaleDateString('en-GB', { day: '2-digit', month: 'short' }) : 'Now'}${startTime ? ' ' + startTime : ''} – ${endDate ? new Date(endDate).toLocaleDateString('en-GB', { day: '2-digit', month: 'short' }) : 'Anytime'}${endTime ? ' ' + endTime : ''}`,
      usage: `0 / ${totalUsageLimit || '∞'}`,
      orders: 0,
      revenue: '₹0'
    };

    setSaveStep('success');
    setTimeout(() => {
      setSaveStep('input');
      if (onCreate) {
        onCreate(newOffer);
      }
      onBack();
    }, 2500);
  };

  const getSelectedNames = () => {
    if (applicableScope === 'all') return 'entire menu';
    if (applicableScope === 'category') {
      const selectedCats = menuCategories.filter(c => c.items.every(i => selectedItems.includes(i.id)));
      if (selectedCats.length > 0) return selectedCats.map(c => c.name).join(', ');
      return 'selected categories';
    }
    const selectedItemNames = menuCategories.flatMap(c => c.items).filter(i => selectedItems.includes(i.id)).map(i => i.name);
    if (selectedItemNames.length > 0) return selectedItemNames.join(', ');
    return 'selected items';
  };

  const renderPreviewTitle = () => {
    if (offerType === 'percentage') {
      return `Get ${discountPercent || 'X'}% off${maxCap ? ` upto ₹${maxCap}` : ''}`;
    } else if (offerType === 'flat') {
      return `Get flat ₹${discountAmount || 'X'} off`;
    } else if (offerType === 'bogo') {
      return `Buy 1 Get 1 Free`;
    } else if (offerType === 'free_item') {
      return `Free ${freeItemName || 'item'} on your order`;
    } else if (offerType === 'booking') {
      return `Get ${discountPercent || 'X'}% off on Table Booking`;
    }
    return 'Offer Title';
  };

  const renderPreviewSubtitle = () => {
    if (applicableScope === 'all') return 'On all items';
    if (applicableScope === 'category') return 'On selected categories';
    return 'On selected items';
  };

  const renderTerms = () => {
    const terms = [];
    if (minOrder) terms.push(`Minimum order value of ₹${minOrder} is required.`);
    
    if (offerType === 'percentage' || offerType === 'booking') {
      if (maxCap) terms.push(`Maximum discount is capped at ₹${maxCap}.`);
    } else if (offerType === 'bogo') {
      if (applicableScope !== 'all' && selectedItems.length > 0) {
        terms.push(`Valid only on ${getSelectedNames()}.`);
      }
      terms.push('Cheapest item in the cart will be free.');
    } else if (offerType === 'free_item') {
      if (applicableScope !== 'all' && selectedItems.length > 0) {
        terms.push(`Valid only on ${getSelectedNames()}.`);
      }
      if (freeItemName) {
        terms.push(`Free item offered is: ${freeItemName}.`);
      }
      if (freeItemDescription) {
        terms.push(`Additional item details: ${freeItemDescription}`);
      }
    } else {
      if (applicableScope !== 'all') {
         terms.push(`Valid only on ${getSelectedNames()}.`);
      }
    }
    
    if (customerType === 'new') terms.push('Valid for new customers only.');
    if (customerType === 'returning') terms.push('Valid for returning customers only.');
    if (paymentMode === 'prepaid') terms.push('Valid on prepaid online orders only.');
    if (startDate && !startTime) terms.push(`Offer starts at ${new Date(startDate).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}.`);
    else if (startDate && startTime) terms.push(`Offer starts at ${new Date(startDate).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}, ${startTime}.`);
    
    if (endDate && !endTime) terms.push(`Offer ends at ${new Date(endDate).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}.`);
    else if (endDate && endTime) terms.push(`Offer ends at ${new Date(endDate).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}, ${endTime}.`);
    
    if (!startDate && !endDate) terms.push('Offer valid for a limited time period.');
    if (perUserLimit) terms.push(`Offer can be used ${perUserLimit} time(s) per user.`);
    if (totalUsageLimit) terms.push(`Total campaign usage is capped at ${totalUsageLimit} usages.`);
    
    if (allowClubbing) terms.push('Can be clubbed with other ongoing offers.');
    else terms.push('Cannot be clubbed with any other ongoing offers.');
    
    if (promoCode) {
      if (visibility === 'hidden') {
        terms.push(`This is a hidden offer. Users must apply the promo code "${promoCode}" at checkout to avail.`);
      } else {
        terms.push(`Apply promo code "${promoCode}" at checkout to avail this offer.`);
      }
    }
    
    if (customTerms) {
      customTerms.split('\n').filter(t => t.trim()).forEach(t => terms.push(t.trim()));
    }
    
    return terms;
  };

  if (saveStep === 'loading') {
    return (
      <div className="min-h-screen bg-[#FFFFFF] flex flex-col items-center justify-center p-6 animate-in fade-in duration-300">
        <Loader2 size={48} className="text-blue-600 animate-spin mx-auto mb-6" />
        <h2 className="text-2xl font-bold text-slate-900 mb-2">Verifying...</h2>
        <p className="text-slate-500 text-center mb-8">Please wait while we process your request...</p>
      </div>
    );
  }

  if (saveStep === 'success') {
    return (
      <div className="min-h-screen bg-[#FFFFFF] flex flex-col items-center justify-center p-6 animate-in fade-in duration-300">
        <div className="w-20 h-20 bg-emerald-100 rounded-full flex items-center justify-center mb-6">
          <CheckCircle2 size={40} className="text-emerald-600" />
        </div>
        <h2 className="text-2xl font-bold text-slate-900 mb-2">Offer created successfully</h2>
        <p className="text-slate-500 text-center mb-8">Track performance in Campaign Dashboard</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FFFFFF] pb-32 font-sans overflow-y-auto w-full max-w-full">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-[#FFFFFF] border-b border-slate-100 h-[56px] flex items-center justify-between px-4">
        <div className="flex items-center gap-3">
          <button onClick={onBack} className="w-10 h-10 flex items-center justify-center -ml-2 text-slate-700 active:bg-slate-100 rounded-full transition-colors">
            <ArrowLeft size={22} />
          </button>
          <h1 className="text-[18px] font-semibold text-slate-900">Create Offer</h1>
        </div>
      </header>

      <div className="p-4 space-y-6 max-w-full overflow-hidden">
        
        {/* Live Preview Card */}
        <div className="space-y-1.5">
          <h3 className="text-[12px] font-bold text-slate-500 px-1 uppercase tracking-wider">Live Preview / Coupon</h3>
          <div className="bg-white border border-slate-200 p-3.5 rounded-[16px] flex items-center justify-between max-w-full relative overflow-hidden">
            <div className="absolute top-0 right-0 w-24 h-24 bg-slate-50 rounded-bl-[100px]" />
            <div className="overflow-hidden flex-1 mr-3 relative z-10">
              <h4 className="text-[15px] font-black text-slate-900 mb-0.5 truncate">{renderPreviewTitle()}</h4>
              <p className="text-[13px] font-medium text-slate-500 truncate tracking-wide">{renderPreviewSubtitle()}</p>
            </div>
            <button className="text-[#1E90FF] font-bold text-[13px] shrink-0 bg-blue-50 border border-blue-100 hover:bg-blue-100 px-3.5 py-1.5 rounded-full transition-all z-10">Preview</button>
          </div>
        </div>

        {/* Offer Mechanics */}
        <div className="bg-[#FFFFFF] rounded-[20px] p-5 border border-slate-200 space-y-4">
          <h3 className="text-[16px] font-bold text-slate-900 mb-2">Offer Type</h3>
          <div className="grid grid-cols-2 lg:grid-cols-3 gap-3">
            {[
              { id: 'percentage', label: 'Percentage' },
              { id: 'flat', label: 'Flat Amount' },
              { id: 'bogo', label: 'BOGO' },
              { id: 'free_item', label: 'Free Item' },
              { id: 'booking', label: 'Booking' }
            ].map((type) => (
              <button 
                key={type.id}
                onClick={() => setOfferType(type.id as any)}
                className={`h-[48px] flex justify-center items-center px-4 rounded-[12px] border transition-all ${offerType === type.id ? 'bg-blue-50 border-blue-200 text-[#1E90FF]' : 'bg-[#FFFFFF] border-slate-200 text-slate-700'}`}
              >
                <span className="text-[14px] font-bold">{type.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Value Configuration & Applicable Menu */}
        <div className="bg-[#FFFFFF] rounded-[20px] p-5 border border-slate-200 space-y-5">
          <h3 className="text-[16px] font-bold text-slate-900 mb-2">Configuration</h3>
          
          {(offerType === 'percentage' || offerType === 'booking') && (
            <div className="space-y-4 animate-in fade-in">
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className="text-[13px] font-medium text-slate-600">Discount %</label>
                  <div className="relative">
                    <input type="number" value={discountPercent} onChange={(e) => setDiscountPercent(e.target.value)} placeholder="0" className="w-full h-11 pl-4 pr-10 bg-slate-50 border border-slate-200 rounded-[12px] text-[15px] focus:bg-[#FFFFFF] inline-block font-bold text-slate-900" />
                    <span className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 font-bold">%</span>
                  </div>
                </div>
                <div className="space-y-1.5">
                  <label className="text-[13px] font-medium text-slate-600">Max Cap (₹)</label>
                  <input type="number" value={maxCap} onChange={(e) => setMaxCap(e.target.value)} placeholder="0" className="w-full h-11 px-4 bg-slate-50 border border-slate-200 rounded-[12px] text-[15px] focus:bg-[#FFFFFF] font-bold text-slate-900" />
                </div>
              </div>
            </div>
          )}

          {offerType === 'flat' && (
            <div className="space-y-4 animate-in fade-in">
              <div className="space-y-1.5">
                <label className="text-[13px] font-medium text-slate-600">Discount Amount (₹)</label>
                <input type="number" value={discountAmount} onChange={(e) => setDiscountAmount(e.target.value)} placeholder="0" className="w-full h-11 px-4 bg-slate-50 border border-slate-200 rounded-[12px] text-[15px] font-bold text-slate-900" />
              </div>
            </div>
          )}

          {offerType === 'free_item' && (
            <div className="space-y-4 animate-in fade-in">
              <div className="space-y-1.5 relative">
                <label className="text-[13px] font-medium text-slate-600">Search Free Item</label>
                <div className="relative">
                  <Search size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input 
                    type="text" 
                    value={freeItemSearchQuery} 
                    onChange={(e) => {
                      setFreeItemSearchQuery(e.target.value);
                      setShowFreeItemDropdown(true);
                      if (e.target.value === '') setFreeItemName('');
                    }} 
                    onFocus={() => setShowFreeItemDropdown(true)}
                    placeholder="Search menu items (e.g., Pizza)" 
                    className="w-full h-11 pl-10 pr-4 bg-slate-50 border border-slate-200 rounded-[12px] text-[15px] focus:bg-[#FFFFFF] inline-block font-bold text-slate-900" 
                  />
                  {freeItemName && !showFreeItemDropdown && (
                    <div className="absolute right-3.5 top-1/2 -translate-y-1/2">
                      <CheckCircle2 size={18} className="text-emerald-500" />
                    </div>
                  )}
                </div>
                {showFreeItemDropdown && freeItemSearchQuery.trim().length > 0 && (
                  <div className="absolute z-10 top-[70px] left-0 w-full bg-[#FFFFFF] border border-slate-200 rounded-[14px] shadow-lg max-h-[240px] overflow-y-auto">
                    {menuCategories.flatMap(c => c.items).filter(i => i.name.toLowerCase().includes(freeItemSearchQuery.toLowerCase())).length > 0 ? (
                      menuCategories.flatMap(c => c.items).filter(i => i.name.toLowerCase().includes(freeItemSearchQuery.toLowerCase())).map(item => (
                        <button
                          key={item.id}
                          className="w-full px-4 py-3 text-left hover:bg-slate-50 transition-colors border-b border-slate-100 last:border-0"
                          onClick={() => {
                            setFreeItemName(item.name);
                            setFreeItemSearchQuery(item.name);
                            setShowFreeItemDropdown(false);
                          }}
                        >
                          <span className="text-[14px] font-bold text-slate-900">{item.name}</span>
                        </button>
                      ))
                    ) : (
                      <div className="p-4 text-center text-slate-500 text-[14px]">No items found.</div>
                    )}
                  </div>
                )}
              </div>
              <div className="space-y-1.5">
                <label className="text-[13px] font-medium text-slate-600">Item Description (Optional)</label>
                <input 
                  type="text" 
                  value={freeItemDescription} 
                  onChange={(e) => setFreeItemDescription(e.target.value)} 
                  placeholder="e.g. valid on thin crust only" 
                  className="w-full h-11 px-4 bg-slate-50 border border-slate-200 rounded-[12px] text-[15px] font-medium text-slate-900" 
                />
              </div>
            </div>
          )}

          {offerType !== 'booking' && (
            <div className="space-y-3 pt-2">
               <label className="text-[13px] font-medium text-slate-600">Applicable On</label>
               <div className="grid grid-cols-3 gap-2">
                  <button onClick={() => setApplicableScope('all')} className={`h-10 rounded-[10px] text-[13px] font-bold transition-all ${applicableScope === 'all' ? 'bg-[#1E90FF] text-white' : 'bg-slate-50 text-slate-600 border border-slate-200'}`}>Entire Menu</button>
                  <button onClick={() => setApplicableScope('category')} className={`h-10 rounded-[10px] text-[13px] font-bold transition-all ${applicableScope === 'category' ? 'bg-[#1E90FF] text-white' : 'bg-slate-50 text-slate-600 border border-slate-200'}`}>Category</button>
                  <button onClick={() => setApplicableScope('items')} className={`h-10 rounded-[10px] text-[13px] font-bold transition-all ${applicableScope === 'items' ? 'bg-[#1E90FF] text-white' : 'bg-slate-50 text-slate-600 border border-slate-200'}`}>Items</button>
               </div>
               
               {(applicableScope === 'items' || applicableScope === 'category') && (
                 <div className="pt-2 animate-in fade-in slide-in-from-top-2">
                   <button onClick={() => setIsItemSelectSheetOpen(true)} className="w-full h-[52px] bg-slate-50 border border-slate-200 border-dashed rounded-[14px] flex items-center justify-center gap-2 text-[#1E90FF] font-bold text-[14px]">
                     <Search size={18} />
                     {selectedItems.length > 0 ? `${selectedItems.length} Selections` : `Choose ${applicableScope === 'category' ? 'Categories' : 'Items'}`}
                   </button>
                 </div>
               )}
            </div>
          )}
        </div>

        {/* Targeting */}
        <div className="bg-[#FFFFFF] rounded-[20px] p-5 border border-slate-200 space-y-5">
           <h3 className="text-[16px] font-bold text-slate-900 mb-2">Targeting</h3>
           
           <div className="space-y-3">
             <label className="text-[13px] font-medium text-slate-600">Customer Segment</label>
             <div className="grid grid-cols-3 gap-2">
               <button onClick={() => setCustomerType('all')} className={`h-10 rounded-[10px] text-[13px] font-bold transition-all ${customerType === 'all' ? 'bg-[#1E90FF] text-white' : 'bg-slate-50 text-slate-600 border border-slate-200'}`}>All</button>
               <button onClick={() => setCustomerType('new')} className={`h-10 rounded-[10px] text-[13px] font-bold transition-all ${customerType === 'new' ? 'bg-[#1E90FF] text-white' : 'bg-slate-50 text-slate-600 border border-slate-200'}`}>New</button>
               <button onClick={() => setCustomerType('returning')} className={`h-10 rounded-[10px] text-[13px] font-bold transition-all ${customerType === 'returning' ? 'bg-[#1E90FF] text-white' : 'bg-slate-50 text-slate-600 border border-slate-200'}`}>Returning</button>
             </div>
           </div>

           <div className="space-y-3">
             <label className="text-[13px] font-medium text-slate-600">Order Type</label>
             <div className="flex gap-2 flex-wrap">
               {['delivery', 'takeaway', 'dineIn'].map((type) => (
                 <button key={type} onClick={() => setOrderTypes(p => ({ ...p, [type]: !p[type as keyof typeof orderTypes] }))} className={`px-4 h-10 rounded-full text-[13px] font-bold transition-all border ${orderTypes[type as keyof typeof orderTypes] ? 'bg-blue-50 border-blue-200 text-[#1E90FF]' : 'bg-white border-slate-200 text-slate-600'}`}>
                   {type === 'dineIn' ? 'Dine-In' : type.charAt(0).toUpperCase() + type.slice(1)}
                 </button>
               ))}
             </div>
           </div>

           <div className="space-y-3">
             <label className="text-[13px] font-medium text-slate-600">Payment Mode</label>
             <div className="grid grid-cols-2 gap-2">
               <button onClick={() => setPaymentMode('all')} className={`h-10 rounded-[10px] text-[13px] font-bold transition-all ${paymentMode === 'all' ? 'bg-[#1E90FF] text-white' : 'bg-slate-50 text-slate-600 border border-slate-200'}`}>All Modes</button>
               <button onClick={() => setPaymentMode('prepaid')} className={`h-10 rounded-[10px] text-[13px] font-bold transition-all ${paymentMode === 'prepaid' ? 'bg-[#1E90FF] text-white' : 'bg-slate-50 text-slate-600 border border-slate-200'}`}>Prepaid Only</button>
             </div>
           </div>
        </div>

        {/* Visibility & Promo Code */}
        <div className="bg-[#FFFFFF] rounded-[20px] p-5 border border-slate-200 space-y-5">
           <h3 className="text-[16px] font-bold text-slate-900 mb-2">Visibility & Promo Code</h3>
           
           <div className="space-y-3">
             <label className="text-[13px] font-medium text-slate-600">Visibility</label>
             <div className="grid grid-cols-2 gap-2">
               <button onClick={() => setVisibility('public')} className={`h-10 rounded-[10px] text-[13px] font-bold transition-all ${visibility === 'public' ? 'bg-[#1E90FF] text-white' : 'bg-slate-50 text-slate-600 border border-slate-200'}`}>Public (Visible to all)</button>
               <button onClick={() => setVisibility('hidden')} className={`h-10 rounded-[10px] text-[13px] font-bold transition-all ${visibility === 'hidden' ? 'bg-[#1E90FF] text-white' : 'bg-slate-50 text-slate-600 border border-slate-200'}`}>Hidden (Promo only)</button>
             </div>
           </div>

           <div className="space-y-1.5">
             <label className="text-[13px] font-medium text-slate-600">Promo Code {visibility === 'hidden' ? <span className="text-red-500">*</span> : <span className="text-slate-400 font-normal">(Optional)</span>}</label>
             <input type="text" value={promoCode} onChange={(e) => setPromoCode(e.target.value.toUpperCase().replace(/\s/g, ''))} placeholder="e.g. SAVE50" className="w-full h-11 px-4 bg-slate-50 border border-slate-200 rounded-[12px] text-[15px] font-bold text-slate-900 focus:bg-[#FFFFFF] uppercase placeholder:normal-case font-mono" />
           </div>
        </div>

        {/* Schedule */}
        <div className="bg-[#FFFFFF] rounded-[20px] p-5 border border-slate-200 space-y-4">
          <h3 className="text-[16px] font-bold text-slate-900 mb-2">Validity Schedule</h3>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <label className="text-[13px] font-medium text-slate-600">Start Date</label>
              <input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} className="w-full h-11 px-3 bg-slate-50 border border-slate-200 rounded-[12px] text-[14px] font-bold text-slate-900 focus:bg-[#FFFFFF] focus:outline-none" />
            </div>
            <div className="space-y-1.5">
              <label className="text-[13px] font-medium text-slate-600">Start Time</label>
              <input type="time" value={startTime} onChange={(e) => setStartTime(e.target.value)} className="w-full h-11 px-3 bg-slate-50 border border-slate-200 rounded-[12px] text-[14px] font-bold text-slate-900 focus:bg-[#FFFFFF] focus:outline-none" />
            </div>
            <div className="space-y-1.5">
              <label className="text-[13px] font-medium text-slate-600">End Date</label>
              <input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} className="w-full h-11 px-3 bg-slate-50 border border-slate-200 rounded-[12px] text-[14px] font-bold text-slate-900 focus:bg-[#FFFFFF] focus:outline-none" />
            </div>
            <div className="space-y-1.5">
              <label className="text-[13px] font-medium text-slate-600">End Time</label>
              <input type="time" value={endTime} onChange={(e) => setEndTime(e.target.value)} className="w-full h-11 px-3 bg-slate-50 border border-slate-200 rounded-[12px] text-[14px] font-bold text-slate-900 focus:bg-[#FFFFFF] focus:outline-none" />
            </div>
          </div>
        </div>

        {/* Custom Terms & Conditions */}
        <div className="bg-[#FFFFFF] rounded-[20px] p-5 border border-slate-200 space-y-4">
          <label className="text-[16px] font-bold text-slate-900">Custom Terms</label>
          <textarea 
            value={customTerms} 
            onChange={(e) => setCustomTerms(e.target.value)}
            placeholder="Add any additional rules (e.g., Not valid on public holidays, max 2 uses per day)"
            className="w-full h-24 p-4 bg-slate-50 border border-slate-200 rounded-[12px] text-[15px] font-medium text-slate-900 focus:bg-[#FFFFFF] focus:outline-none resize-none"
          />
        </div>

        {/* Conditions */}
        <div className="bg-[#FFFFFF] rounded-[20px] p-5 border border-slate-200 space-y-4">
           <h3 className="text-[16px] font-bold text-slate-900 mb-2">Conditions</h3>
           <div className="space-y-4">
             <div className="space-y-1.5">
               <label className="text-[13px] font-medium text-slate-600">Min Order Value (₹)</label>
               <input type="number" value={minOrder} onChange={(e) => setMinOrder(e.target.value)} placeholder="0" className="w-full h-11 px-4 bg-slate-50 border border-slate-200 rounded-[12px] text-[15px] font-bold text-slate-900" />
             </div>
             <div className="space-y-1.5">
               <label className="text-[13px] font-medium text-slate-600">Per User Usage Limit</label>
               <input type="number" value={perUserLimit} onChange={(e) => setPerUserLimit(e.target.value)} placeholder="e.g. 1" className="w-full h-11 px-4 bg-slate-50 border border-slate-200 rounded-[12px] text-[15px] font-bold text-slate-900" />
             </div>
             <div className="space-y-1.5">
               <label className="text-[13px] font-medium text-slate-600">Total Campaign Usage</label>
               <input type="number" value={totalUsageLimit} onChange={(e) => setTotalUsageLimit(e.target.value)} placeholder="Unlimited" className="w-full h-11 px-4 bg-slate-50 border border-slate-200 rounded-[12px] text-[15px] font-bold text-slate-900" />
             </div>
             
             <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
               <div>
                  <h4 className="text-[14px] font-bold text-slate-900">Offer Clubbing</h4>
                  <p className="text-[12px] text-slate-500">Allow with other offers</p>
               </div>
               <div className="flex bg-slate-100 p-1 rounded-lg">
                 <button onClick={() => setAllowClubbing(true)} className={`px-4 py-1.5 rounded-[6px] text-[12px] font-bold transition-all ${allowClubbing ? 'bg-[#FFFFFF] shadow-sm text-slate-900' : 'text-slate-500'}`}>Yes</button>
                 <button onClick={() => setAllowClubbing(false)} className={`px-4 py-1.5 rounded-[6px] text-[12px] font-bold transition-all ${!allowClubbing ? 'bg-[#FFFFFF] shadow-sm text-slate-900' : 'text-slate-500'}`}>No</button>
               </div>
             </div>
           </div>
        </div>

        {/* Projected Impact */}
        <div className="bg-[#FFFFFF] rounded-[20px] p-5 border border-slate-200 space-y-4">
          <div className="flex items-center gap-2 mb-2">
             <TrendingUp size={18} className="text-blue-500" />
             <h3 className="text-[16px] font-bold text-slate-900">Projected Impact</h3>
          </div>
          <div className="grid grid-cols-2 gap-3">
             <div className="bg-slate-50 p-3 rounded-[16px] border border-slate-100">
               <span className="text-[12px] font-medium text-slate-500 block mb-1">Expected Orders</span>
               <span className="text-[18px] font-black text-slate-900">+{expectedOrderIncrease.toFixed(1)}%</span>
             </div>
             <div className="bg-slate-50 p-3 rounded-[16px] border border-slate-100">
               <span className="text-[12px] font-medium text-slate-500 block mb-1">Revenue Boost</span>
               <span className="text-[18px] font-black text-[#16A34A]">+{expectedRevenueBoost.toFixed(1)}%</span>
             </div>
          </div>
          {(marginWarning || highDiscountWarning) && (
            <div className="bg-amber-50 rounded-[12px] p-3 flex gap-3 text-amber-800">
              <AlertTriangle size={18} className="shrink-0 mt-0.5" />
              <p className="text-[13px] font-medium leading-snug">
                {marginWarning ? 'This high discount may negatively impact your profit margin. Ensure you have high volume to offset.' : 'High discount selected. Consider adding a max cap limit.'}
              </p>
            </div>
          )}
        </div>

        {/* Terms and Conditions Live Card */}
        <div className="bg-[#FFFFFF] rounded-[20px] p-5 border border-slate-200 space-y-3">
          <h3 className="text-[16px] font-bold text-slate-900 mb-2">Live Terms & Conditions</h3>
          <div className="bg-slate-50 rounded-xl p-4 border border-slate-100">
            <ul className="space-y-2">
              {renderTerms().map((term, idx) => (
                <li key={idx} className="flex items-start gap-2 text-[13px] text-slate-600 font-medium">
                  <div className="w-4 h-4 rounded-full bg-slate-200 shrink-0 mt-0.5 flex items-center justify-center">
                    <Check size={10} className="text-slate-500" />
                  </div>
                  {term}
                </li>
              ))}
            </ul>
          </div>
        </div>

      </div>

      {/* Save Button */}
      <div className="fixed bottom-0 left-0 right-0 p-4 bg-[#FFFFFF] border-t border-slate-100 z-40 max-w-md mx-auto">
        <button 
          onClick={handleInitiateSave} 
          disabled={!isValid()}
          className={`w-full h-[52px] rounded-[14px] font-bold text-[16px] transition-all ${isValid() ? 'bg-[#1E90FF] text-[#FFFFFF] active:scale-[0.98]' : 'bg-slate-100 text-slate-400 cursor-not-allowed'}`}
        >
          Create Offer
        </button>
      </div>

      {/* Select Items Bottom Sheet */}
      {isItemSelectSheetOpen && (
        <div className="fixed inset-0 z-[999] flex items-end justify-center bg-black/50 sm:items-center transition-opacity animate-in fade-in duration-200">
          <div className="bg-[#FFFFFF] w-full sm:max-w-md rounded-t-[24px] sm:rounded-[24px] shadow-xl animate-in slide-in-from-bottom-full sm:slide-in-from-bottom-0 sm:zoom-in-95 duration-300 flex flex-col max-h-[90vh]">
            
            <div className="p-4 border-b border-slate-100 flex items-center justify-between shrink-0">
              <h3 className="text-[18px] font-bold text-slate-900">Select {applicableScope === 'category' ? 'Categories' : 'Items'}</h3>
              <button 
                onClick={() => setIsItemSelectSheetOpen(false)}
                className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-500 hover:bg-slate-200 transition-colors"
              >
                <X size={18} />
              </button>
            </div>

            <div className="p-4 border-b border-slate-100 shrink-0">
              <div className="relative">
                <Search size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                <input 
                  type="text" 
                  value={itemSearchQuery}
                  onChange={(e) => setItemSearchQuery(e.target.value)}
                  placeholder={`Search ${applicableScope === 'category' ? 'categories' : 'items'}...`}
                  className="w-full h-11 pl-10 pr-4 bg-slate-50 border border-slate-200 rounded-[12px] text-[15px] focus:bg-[#FFFFFF] focus:border-[#1E90FF] focus:outline-none transition-colors"
                />
              </div>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-6">
              
              <div 
                className="flex items-center gap-3 cursor-pointer"
                onClick={handleSelectAllItems}
              >
                <div className={`w-5 h-5 rounded-[6px] border flex items-center justify-center transition-colors ${
                  isAllSelected ? 'bg-[#1E90FF] border-[#1E90FF]' : 'border-slate-300'
                }`}>
                  {isAllSelected && <Check size={14} className="text-white" />}
                </div>
                <span className="text-[15px] font-bold text-slate-900">Select All</span>
              </div>

              <div className="space-y-4">
                {menuCategories.filter(c => c.name.toLowerCase().includes(itemSearchQuery.toLowerCase()) || (applicableScope !== 'category' && c.items.some(i => i.name.toLowerCase().includes(itemSearchQuery.toLowerCase())))).map(category => {
                  
                  const filteredItems = applicableScope === 'category' ? [] : category.items.filter(i => i.name.toLowerCase().includes(itemSearchQuery.toLowerCase()) || category.name.toLowerCase().includes(itemSearchQuery.toLowerCase()));
                  
                  if (applicableScope !== 'category' && filteredItems.length === 0) return null;

                  const categoryItemIds = category.items.map(i => i.id);
                  const isCategoryFullySelected = categoryItemIds.every(id => selectedItems.includes(id));
                  const isCategoryPartiallySelected = categoryItemIds.some(id => selectedItems.includes(id)) && !isCategoryFullySelected;

                  return (
                    <div key={category.id} className="space-y-2">
                      <div 
                        className="flex items-center gap-3 cursor-pointer p-2 bg-slate-50 rounded-xl"
                        onClick={() => handleSelectCategory(category.id)}
                      >
                        <div className={`w-5 h-5 rounded-[6px] border flex items-center justify-center transition-colors ${
                          isCategoryFullySelected ? 'bg-[#1E90FF] border-[#1E90FF]' : 
                          isCategoryPartiallySelected ? 'bg-[#1E90FF] border-[#1E90FF]' : 'border-slate-300 bg-[#FFFFFF]'
                        }`}>
                          {isCategoryFullySelected && <Check size={14} className="text-white" />}
                          {isCategoryPartiallySelected && <div className="w-2.5 h-0.5 bg-white rounded-full" />}
                        </div>
                        <span className="text-[14px] font-bold text-slate-900">{category.name}</span>
                      </div>

                      {applicableScope !== 'category' && (
                        <div className="space-y-1 pl-3">
                          {filteredItems.map(item => {
                            const isItemSelected = selectedItems.includes(item.id);
                            return (
                              <div 
                                key={item.id} 
                                className="flex items-center gap-3 cursor-pointer py-2 pl-2 rounded-lg hover:bg-slate-50 transition-colors"
                                onClick={() => handleSelectItem(item.id)}
                              >
                                <div className={`w-4 h-4 rounded-[4px] border flex items-center justify-center transition-colors ${
                                  isItemSelected ? 'bg-[#1E90FF] border-[#1E90FF]' : 'border-slate-300'
                                }`}>
                                  {isItemSelected && <Check size={12} className="text-white" />}
                                </div>
                                <span className="text-[14px] font-medium text-slate-700">{item.name}</span>
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>

            </div>

            <div className="p-4 border-t border-slate-100 shrink-0 bg-[#FFFFFF]">
              <button 
                onClick={() => setIsItemSelectSheetOpen(false)}
                className="w-full h-[52px] bg-[#1E90FF] text-[#FFFFFF] rounded-[16px] font-bold text-[16px] active:scale-[0.98] transition-all"
              >
                Confirm Selection ({applicableScope === 'category' ? 
                  menuCategories.filter(c => c.items.every(i => selectedItems.includes(i.id))).length : 
                  selectedItems.length})
              </button>
            </div>

          </div>
        </div>
      )}
    </div>
  );
};

