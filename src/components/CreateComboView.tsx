import React, { useState } from 'react';
import { 
  ArrowLeft, 
  Image as ImageIcon,
  Check,
  Info,
  Search
} from 'lucide-react';
import { MenuItem } from './MenuView';

export const CreateComboView: React.FC<{
  onBack: () => void;
  allItems: MenuItem[];
  categories: string[];
  onSave: (item: any) => void;
}> = ({ onBack, allItems, categories, onSave }) => {
  const [comboType, setComboType] = useState<'fixed' | 'choice' | 'build'>('fixed');
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('');
  const [image, setImage] = useState<string | null>(null);
  const [subCategory, setSubCategory] = useState(categories.length > 0 ? categories[0] : '');
  
  // States specific to Combo Rules
  const [selectedFixedItems, setSelectedFixedItems] = useState<{itemId: number, variantId?: string}[]>([]);
  
  // For Choice based: Groups of choices
  const [choiceGroups, setChoiceGroups] = useState<{id: string, name: string, required: boolean, limit: number, items: {itemId: number, variantId?: string}[]}[]>([
    { id: '1', name: 'Choose Beverage', required: true, limit: 1, items: [] }
  ]);
  
  // For Build your own: Category pools with limits
  const [buildPools, setBuildPools] = useState<{id: string, category: string, limit: number}[]>([
    { id: '1', category: 'Pizza', limit: 1 }
  ]);

  const [searchQuery, setSearchQuery] = useState('');
  const [showInactive, setShowInactive] = useState(false);

  const filteredItems = allItems.filter(item => {
    if (item.category === 'Combos' || item.category === 'Toppings') return false;
    if (!showInactive && !item.isAvailable) return false;
    if (searchQuery && !item.name.toLowerCase().includes(searchQuery.toLowerCase())) return false;
    return true;
  });

  const toggleFixedItem = (itemId: number, variantId?: string) => {
    setSelectedFixedItems(prev => {
      const existsIndex = prev.findIndex(i => i.itemId === itemId && i.variantId === variantId);
      if (existsIndex >= 0) {
        return prev.filter((_, idx) => idx !== existsIndex);
      } else {
        return [...prev, { itemId, variantId }];
      }
    });
  };

  const isFixedItemSelected = (itemId: number, variantId?: string) => {
    return selectedFixedItems.some(i => i.itemId === itemId && i.variantId === variantId);
  }

  const toggleChoiceGroupItem = (groupId: string, itemId: number, variantId?: string) => {
    setChoiceGroups(groups => groups.map(g => {
      if (g.id !== groupId) return g;
      const existsIndex = g.items.findIndex(i => i.itemId === itemId && i.variantId === variantId);
      let newItems;
      if (existsIndex >= 0) {
        newItems = g.items.filter((_, idx) => idx !== existsIndex);
      } else {
        newItems = [...g.items, { itemId, variantId }];
      }
      return { ...g, items: newItems };
    }));
  };

  const isChoiceGroupItemSelected = (group: any, itemId: number, variantId?: string) => {
    return group.items.some((i: any) => i.itemId === itemId && i.variantId === variantId);
  }

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const imgUrl = URL.createObjectURL(e.target.files[0]);
      setImage(imgUrl);
    }
  };

  const handleSave = () => {
    // Generate combo specific structure
    const comboData = {
      name,
      description,
      price: parseFloat(price) || 0,
      image: image || '',
      category: 'Combos',
      subCategory: subCategory || 'Combos',
      isAvailable: true,
      isVeg: true,
      badges: ['Combo'],
      comboType,
      comboDetails: comboType === 'fixed' 
        ? { items: selectedFixedItems }
        : comboType === 'choice'
        ? { groups: choiceGroups }
        : { pools: buildPools }
    };
    onSave(comboData);
  };

  return (
    <div className="fixed inset-0 z-[500] flex items-end justify-center bg-black/50 sm:items-center transition-opacity" onClick={onBack}>
      <div className="w-full h-[90vh] bg-[#FFFFFF] rounded-t-2xl sm:rounded-2xl sm:max-w-2xl flex flex-col animate-in slide-in-from-bottom-full sm:slide-in-from-bottom-0 sm:fade-in duration-300 relative overflow-hidden" onClick={e => e.stopPropagation()}>
      
      {/* Header */}
      <div className="px-4 py-4 flex items-center gap-3 bg-[#FFFFFF] border-b border-slate-100 sticky top-0 z-40 shrink-0">
        <button onClick={onBack} className="w-10 h-10 flex items-center justify-center text-slate-700 active:bg-slate-50 rounded-full transition-colors">
          <ArrowLeft size={24} />
        </button>
        <h2 className="text-[20px] font-[600] text-slate-900">Create Combo</h2>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-6 pb-32 lg:pb-6">
        
        {/* Basic Details */}
        <div className="space-y-4">
          {/* Image Upload Section */}
          <div 
            onClick={() => {
              const el = document.getElementById('combo-image-upload');
              if (el) el.click();
            }}
            className="h-[180px] rounded-[16px] border border-dashed border-[#D1D5DB] bg-[#F9FAFB] flex flex-col items-center justify-center gap-3 relative overflow-hidden active:bg-slate-50 transition-colors cursor-pointer"
          >
            {image ? (
              <img src={image} alt="Preview" className="w-full h-full object-cover" />
            ) : (
              <>
                <div className="w-12 h-12 bg-[#FFFFFF] rounded-full shadow-sm flex items-center justify-center text-slate-400">
                  <ImageIcon size={24} />
                </div>
                <span className="text-sm font-medium text-slate-600">Upload Combo Image</span>
              </>
            )}
            <input id="combo-image-upload" type="file" className="hidden" accept="image/*" onChange={handleImageUpload} />
          </div>

          {/* Combo Name */}
          <div className="space-y-2 mt-4">
            <label className="text-sm font-medium text-slate-700">Combo Name</label>
            <input 
              type="text" 
              placeholder="Enter combo name" 
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full h-[44px] rounded-[10px] border border-[#E5E7EB] px-[12px] text-sm focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all font-medium"
            />
          </div>

          {/* Description */}
          <div className="space-y-2 mt-4">
            <label className="text-sm font-medium text-slate-700">Description</label>
            <textarea 
              placeholder="Write a short description about the combo" 
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full h-[90px] rounded-[10px] border border-[#E5E7EB] p-[12px] text-sm focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all resize-none"
            />
          </div>

          {/* Category */}
          <div className="space-y-2 mt-4">
            <label className="text-sm font-medium text-slate-700">Category</label>
            <select
              value={subCategory}
              onChange={(e) => setSubCategory(e.target.value)}
              className="w-full h-[44px] rounded-[10px] border border-[#E5E7EB] px-[12px] text-sm focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all bg-[#FFFFFF]"
            >
              <option value="">Select a category</option>
              {categories.map(cat => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Combo Type Selector */}
        <div className="bg-[#FFFFFF] p-5 rounded-[16px] border border-[#E5E7EB] shadow-sm">
          <h2 className="text-[16px] font-bold text-[#111827] mb-4">Combo Structure</h2>
          <div className="flex flex-col gap-3">
            {[
              { id: 'fixed', title: 'Fixed Combo', desc: 'Pre-set items. User gets exactly what is defined (e.g. Burger + Fries + Coke)' },
              { id: 'choice', title: 'Choice Based', desc: 'User chooses from specific groups (e.g. Choose 1 Burger, Choose 1 Drink)' },
              { id: 'build', title: 'Build Your Own', desc: 'User builds freely from categories with limits (e.g. Any 2 Pizzas, Any 1 Starter)' }
            ].map(type => (
              <button 
                key={type.id}
                onClick={() => setComboType(type.id as any)}
                className={`flex gap-3 p-4 rounded-xl border text-left transition-colors ${
                  comboType === type.id ? 'border-[#1E90FF] bg-blue-50/50' : 'border-slate-200 hover:border-slate-300'
                }`}
              >
                <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 mt-0.5 ${
                  comboType === type.id ? 'border-[#1E90FF]' : 'border-slate-300'
                }`}>
                  {comboType === type.id && <div className="w-2.5 h-2.5 rounded-full bg-[#1E90FF]" />}
                </div>
                <div>
                  <h3 className={`text-sm font-semibold ${comboType === type.id ? 'text-[#1E90FF]' : 'text-slate-700'}`}>{type.title}</h3>
                  <p className="text-xs text-slate-500 mt-1">{type.desc}</p>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Configuration Sections based on Type */}
        <div className="bg-[#FFFFFF] p-5 rounded-[16px] border border-[#E5E7EB] shadow-sm">
          {comboType === 'fixed' && (
            <div>
               <h2 className="text-[16px] font-bold text-[#111827] mb-1">Select Items</h2>
               <p className="text-xs text-slate-500 mb-4">Choose the items included in this fixed combo</p>
               
               <div className="flex flex-col gap-3 mb-4">
                 <div className="relative">
                   <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                   <input
                     type="text"
                     placeholder="Search food items..."
                     value={searchQuery}
                     onChange={(e) => setSearchQuery(e.target.value)}
                     className="w-full h-10 pl-9 pr-4 rounded-xl border border-slate-200 text-sm focus:outline-none focus:border-blue-500 bg-slate-50 focus:bg-white transition-colors"
                   />
                 </div>
                 <div className="flex items-center justify-between">
                   <label className="text-sm font-medium text-slate-700">Show Inactive Items</label>
                   <button 
                     onClick={() => setShowInactive(!showInactive)}
                     className={`w-10 h-5.5 rounded-full p-0.5 transition-colors duration-300 relative shrink-0 ${showInactive ? 'bg-[#1E90FF]' : 'bg-[#D1D5DB]'}`}
                   >
                     <div className={`w-4.5 h-4.5 bg-[#FFFFFF] rounded-full transform transition-transform duration-300 shadow-sm ${showInactive ? 'translate-x-[18px]' : 'translate-x-0'}`} />
                   </button>
                 </div>
               </div>

               <div className="space-y-2 max-h-[300px] overflow-y-auto no-scrollbar border border-slate-100 rounded-xl p-2 bg-slate-50">
                 {filteredItems.map(item => (
                   <div key={item.id} className="bg-white rounded-lg border border-slate-100 overflow-hidden relative">
                     <div onClick={() => !item.variants?.length && toggleFixedItem(item.id)} className={`flex items-center gap-3 p-2 cursor-pointer hover:border-blue-200 transition-colors ${item.variants?.length ? 'cursor-default' : ''}`}>
                       {!item.variants?.length && (
                         <div className={`w-5 h-5 rounded border flex items-center justify-center shrink-0 ${
                           isFixedItemSelected(item.id) ? 'bg-[#1E90FF] border-[#1E90FF]' : 'bg-white border-slate-300'
                         }`}>
                           {isFixedItemSelected(item.id) && <Check size={14} className="text-white" />}
                         </div>
                       )}
                       <div className="flex-1">
                         <p className="text-sm font-medium text-slate-700">{item.name} {!item.variants?.length && <span className="text-xs text-slate-400 font-normal ml-1">(₹{item.price})</span>}</p>
                       </div>
                     </div>
                     {item.variants && item.variants.length > 0 && (
                       <div className="bg-slate-50 px-3 py-2 border-t border-slate-100 space-y-2">
                         <p className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider mb-1">Select Variant</p>
                         {item.variants.map(v => (
                           <div key={v.id} onClick={() => toggleFixedItem(item.id, v.id)} className="flex items-center gap-2 cursor-pointer hover:bg-slate-100 p-1.5 rounded -mx-1.5 transition-colors">
                             <div className={`w-4 h-4 rounded border flex items-center justify-center shrink-0 ${
                               isFixedItemSelected(item.id, v.id) ? 'bg-[#1E90FF] border-[#1E90FF]' : 'bg-white border-slate-300'
                             }`}>
                               {isFixedItemSelected(item.id, v.id) && <Check size={10} className="text-white" />}
                             </div>
                             <p className="text-xs text-slate-600 font-medium">{v.name} <span className="text-slate-400 font-normal ml-1">(₹{v.price})</span></p>
                           </div>
                         ))}
                       </div>
                     )}
                   </div>
                 ))}
               </div>
            </div>
          )}

          {comboType === 'choice' && (
            <div>
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h2 className="text-[16px] font-bold text-[#111827]">Choice Groups</h2>
                  <p className="text-xs text-slate-500 mt-0.5">Define groups for users to pick from</p>
                </div>
                <button 
                  onClick={() => setChoiceGroups([...choiceGroups, { id: Date.now().toString(), name: `Group ${choiceGroups.length + 1}`, required: true, limit: 1, items: [] }])}
                  className="px-3 py-1.5 bg-[#1E90FF] text-white text-xs font-semibold rounded-lg"
                >
                  Add Group
                </button>
              </div>

              <div className="flex flex-col gap-3 mb-4">
                <div className="relative">
                  <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="text"
                    placeholder="Search food items..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full h-10 pl-9 pr-4 rounded-xl border border-slate-200 text-sm focus:outline-none focus:border-blue-500 bg-slate-50 focus:bg-white transition-colors"
                  />
                </div>
                <div className="flex items-center justify-between">
                  <label className="text-sm font-medium text-slate-700">Show Inactive Items</label>
                  <button 
                    onClick={() => setShowInactive(!showInactive)}
                    className={`w-10 h-5.5 rounded-full p-0.5 transition-colors duration-300 relative shrink-0 ${showInactive ? 'bg-[#1E90FF]' : 'bg-[#D1D5DB]'}`}
                  >
                    <div className={`w-4.5 h-4.5 bg-[#FFFFFF] rounded-full transform transition-transform duration-300 shadow-sm ${showInactive ? 'translate-x-[18px]' : 'translate-x-0'}`} />
                  </button>
                </div>
              </div>
              
              <div className="space-y-4">
                {choiceGroups.map((group) => (
                  <div key={group.id} className="p-4 border border-slate-200 rounded-xl bg-slate-50 relative space-y-3">
                    <button 
                      onClick={() => setChoiceGroups(choiceGroups.filter(g => g.id !== group.id))}
                      className="absolute top-3 right-3 text-red-500 text-xs font-semibold hover:bg-red-50 px-2 py-1 rounded"
                    >
                      Remove
                    </button>
                    
                    <div className="flex gap-3">
                      <div className="flex-1 space-y-1">
                        <label className="text-[11px] font-semibold text-slate-500 uppercase">Group Name</label>
                        <input 
                          type="text" 
                          value={group.name}
                          onChange={(e) => setChoiceGroups(choiceGroups.map(g => g.id === group.id ? {...g, name: e.target.value} : g))}
                          className="w-full h-[36px] rounded-lg border border-slate-200 px-3 text-sm focus:outline-none focus:border-blue-500"
                        />
                      </div>
                      <div className="w-[80px] space-y-1">
                        <label className="text-[11px] font-semibold text-slate-500 uppercase">Pick Lmt</label>
                        <input 
                          type="number" 
                          value={group.limit}
                          onChange={(e) => setChoiceGroups(choiceGroups.map(g => g.id === group.id ? {...g, limit: parseInt(e.target.value) || 1} : g))}
                          className="w-full h-[36px] rounded-lg border border-slate-200 px-3 text-sm focus:outline-none focus:border-blue-500"
                        />
                      </div>
                    </div>
                    
                    <div className="space-y-1">
                      <label className="text-[11px] font-semibold text-slate-500 uppercase">Items in Group ({group.items.length} Selected)</label>
                      <div className="max-h-[180px] overflow-y-auto border border-slate-200 rounded-lg p-2 bg-white space-y-2">
                        {filteredItems.map(item => (
                          <div key={item.id} className="border border-slate-100 rounded-lg overflow-hidden">
                            <div 
                              onClick={() => !item.variants?.length && toggleChoiceGroupItem(group.id, item.id)}
                              className={`flex items-center justify-between p-2 hover:bg-slate-50 cursor-pointer ${item.variants?.length ? 'cursor-default' : ''}`}
                            >
                              <span className="text-xs text-slate-700 font-medium">{item.name}</span>
                              {!item.variants?.length && (
                                <div className={`w-4 h-4 rounded-sm border flex items-center justify-center shrink-0 ${isChoiceGroupItemSelected(group, item.id) ? 'bg-[#1E90FF] border-[#1E90FF]' : 'border-slate-300'}`}>
                                  {isChoiceGroupItemSelected(group, item.id) && <Check size={12} className="text-white" />}
                                </div>
                              )}
                            </div>
                            {item.variants && item.variants.length > 0 && (
                              <div className="bg-slate-50 px-2 py-1.5 border-t border-slate-100 divide-y divide-slate-100">
                                {item.variants.map(v => (
                                  <div key={v.id} onClick={() => toggleChoiceGroupItem(group.id, item.id, v.id)} className="flex items-center justify-between py-1.5 cursor-pointer group-hover:bg-slate-100 px-1">
                                    <span className="text-[11px] text-slate-600">{v.name}</span>
                                    <div className={`w-3.5 h-3.5 rounded-sm border flex items-center justify-center shrink-0 ${isChoiceGroupItemSelected(group, item.id, v.id) ? 'bg-[#1E90FF] border-[#1E90FF]' : 'border-slate-300 bg-white'}`}>
                                      {isChoiceGroupItemSelected(group, item.id, v.id) && <Check size={10} className="text-white" />}
                                    </div>
                                  </div>
                                ))}
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {comboType === 'build' && (
            <div>
               <div className="flex items-center justify-between mb-4">
                <div>
                  <h2 className="text-[16px] font-bold text-[#111827]">Category Pools</h2>
                  <p className="text-xs text-slate-500 mt-0.5">Let users pick Any X from Category Y</p>
                </div>
                <button 
                  onClick={() => setBuildPools([...buildPools, { id: Date.now().toString(), category: 'Pizza', limit: 1 }])}
                  className="px-3 py-1.5 bg-[#1E90FF] text-white text-xs font-semibold rounded-lg"
                >
                  Add Pool
                </button>
              </div>

              <div className="space-y-3">
                {buildPools.map(pool => (
                  <div key={pool.id} className="flex items-end gap-3 p-3 border border-slate-200 rounded-xl bg-slate-50 relative">
                     <button 
                      onClick={() => setBuildPools(buildPools.filter(p => p.id !== pool.id))}
                      className="absolute top-2 right-2 text-slate-400 hover:text-red-500"
                    >
                      ✕
                    </button>
                    
                    <div className="flex-1 space-y-1">
                      <label className="text-[11px] font-semibold text-slate-500 uppercase">Category</label>
                      <select 
                        value={pool.category}
                        onChange={(e) => setBuildPools(buildPools.map(p => p.id === pool.id ? {...p, category: e.target.value} : p))}
                        className="w-full h-[36px] rounded-lg border border-slate-200 px-2 text-sm focus:outline-none"
                      >
                         {Array.from(new Set(allItems.map(i => i.category))).filter(c => c !== 'Combos' && c !== 'Toppings').map(cat => (
                           <option key={cat} value={cat}>{cat}</option>
                         ))}
                      </select>
                    </div>

                    <div className="w-[100px] space-y-1">
                      <label className="text-[11px] font-semibold text-slate-500 uppercase">Limit</label>
                      <input 
                        type="number" 
                        value={pool.limit}
                        onChange={(e) => setBuildPools(buildPools.map(p => p.id === pool.id ? {...p, limit: parseInt(e.target.value) || 1} : p))}
                        className="w-full h-[36px] rounded-lg border border-slate-200 px-3 text-sm focus:outline-none"
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Pricing & Publish */}
        <div className="bg-[#FFFFFF] p-5 rounded-[16px] border border-[#E5E7EB] shadow-sm space-y-4">
           <div className="space-y-2">
            <label className="text-sm font-medium text-slate-700">Combo Price</label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 font-medium">₹</span>
              <input 
                type="number" 
                placeholder="0" 
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                className="w-full h-[44px] rounded-[10px] border border-[#E5E7EB] pl-[28px] pr-[12px] text-[15px] font-medium focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all"
              />
            </div>
            {comboType !== 'fixed' && (
              <div className="mt-2 flex items-start gap-1.5 bg-blue-50 text-blue-700 p-2.5 rounded-lg border border-blue-100">
                <Info size={14} className="mt-0.5 shrink-0" />
                <p className="text-[11px] leading-relaxed">For Choice and Build Your Own combos, this price is the base price. Items may still have add-ons that change the final price.</p>
              </div>
            )}
          </div>
        </div>

      </div>

      <div className="p-4 bg-[#FFFFFF] border-t border-slate-100 flex gap-3 shrink-0">
        <button 
          onClick={onBack}
          className="flex-1 h-[52px] rounded-[16px] font-semibold text-[16px] flex items-center justify-center transition-all bg-slate-100 text-slate-700 active:scale-[0.98]"
        >
          Cancel
        </button>
        <button 
          onClick={handleSave}
          disabled={!name || !price || (comboType === 'fixed' && selectedFixedItems.length === 0) || (comboType === 'choice' && choiceGroups.length === 0)}
          className="flex-1 h-[52px] rounded-[16px] font-semibold text-[16px] flex items-center justify-center transition-all bg-[#1E90FF] text-[#FFFFFF] disabled:opacity-50 disabled:cursor-not-allowed active:scale-[0.98]"
        >
          Publish Combo
        </button>
      </div>
    </div>
  </div>
  );
};
