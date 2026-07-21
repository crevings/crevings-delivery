import React, { useState, useRef, useEffect } from 'react';
import { ArrowLeft, ChefHat, Search, Plus, Trash2, Check, Package, Scale, ChevronRight, X } from 'lucide-react';
import { SAMPLE_ITEMS, MenuItem } from './MenuView';
import { INITIAL_INVENTORY, InventoryItem } from './InventoryView';

interface RecipeIngredient {
  id: string;
  name: string;
  quantity: string;
  unit: string;
}

interface RecipeVariant {
  name: string;
  ingredients: RecipeIngredient[];
}

const INVENTORY_MATERIALS = INITIAL_INVENTORY.map(item => ({
  id: item.id,
  name: item.name,
  unit: item.unit,
  stock: item.stock
}));

interface RecipeViewProps {
  onBack: () => void;
}

export const RecipeView: React.FC<RecipeViewProps> = ({ onBack }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedItem, setSelectedItem] = useState<MenuItem | null>(null);
  const [activeCategory, setActiveCategory] = useState('All Categories');
  
  const categories = ['All Categories', ...Array.from(new Set(SAMPLE_ITEMS.map(i => i.category || 'Other')))];
  const subCategories = ['All Sub Categories', 'Pizza', 'Sides', 'Beverages', 'Combos'];

  
  // Recipes data stored by item ID mapping to an array of variants
  const [recipes, setRecipes] = useState<Record<string, RecipeVariant[]>>({
    '1': [ // Margherita Pizza
      {
        name: 'Regular',
        ingredients: [
          { id: 'INV-002', name: 'Mozzarella Cheese', quantity: '100', unit: 'kg' },
          { id: 'INV-001', name: 'Pizza Dough', quantity: '200', unit: 'kg' },
          { id: 'INV-003', name: 'Tomato Sauce', quantity: '50', unit: 'liters' }
        ]
      }
    ]
  });

  const [editingVariants, setEditingVariants] = useState<RecipeVariant[]>([]);
  const [activeVariantIndex, setActiveVariantIndex] = useState(0);

  // Raw material selection
  const [materialSearch, setMaterialSearch] = useState('');
  const [showMaterialDropdown, setShowMaterialDropdown] = useState(false);

  const filteredItems = SAMPLE_ITEMS.filter(item => {
    const matchesCategory = activeCategory === 'All Categories' || activeCategory === 'All Sub Categories' || item.subCategory === activeCategory || item.category === activeCategory;
    const matchesSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          (item.itemCode && item.itemCode.toLowerCase().includes(searchQuery.toLowerCase())) ||
                          item.category.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const currentVariant = editingVariants[activeVariantIndex];

  const availableMaterials = INVENTORY_MATERIALS.filter(m => 
    m.name.toLowerCase().includes(materialSearch.toLowerCase()) &&
    !(currentVariant?.ingredients || []).some(ing => ing.id === m.id)
  );

  const handleSelectItem = (item: MenuItem) => {
    setSelectedItem(item);
    setEditingVariants(recipes[item.id.toString()] || [{ name: 'Regular', ingredients: [] }]);
    setActiveVariantIndex(0);
  };

  const handleBackToList = () => {
    setSelectedItem(null);
    setEditingVariants([]);
  };

  const handleSaveRecipe = () => {
    if (selectedItem) {
      setRecipes(prev => ({
        ...prev,
        [selectedItem.id.toString()]: editingVariants
      }));
      handleBackToList();
    }
  };

  const addIngredient = (material: { id: string, name: string, unit: string }) => {
    setEditingVariants(prev => {
      const newVariants = [...prev];
      if (!newVariants[activeVariantIndex]) return prev;
      const updatedVariant = { ...newVariants[activeVariantIndex] };
      updatedVariant.ingredients = [
        ...updatedVariant.ingredients,
        { ...material, quantity: '' }
      ];
      newVariants[activeVariantIndex] = updatedVariant;
      return newVariants;
    });
    setMaterialSearch('');
    setShowMaterialDropdown(false);
  };

  const updateIngredientQuantity = (id: string, quantity: string) => {
    setEditingVariants(prev => {
      const newVariants = [...prev];
      if (!newVariants[activeVariantIndex]) return prev;
      const updatedVariant = { ...newVariants[activeVariantIndex] };
      updatedVariant.ingredients = updatedVariant.ingredients.map(ing => 
        ing.id === id ? { ...ing, quantity } : ing
      );
      newVariants[activeVariantIndex] = updatedVariant;
      return newVariants;
    });
  };

  const removeIngredient = (id: string) => {
    setEditingVariants(prev => {
      const newVariants = [...prev];
      if (!newVariants[activeVariantIndex]) return prev;
      const updatedVariant = { ...newVariants[activeVariantIndex] };
      updatedVariant.ingredients = updatedVariant.ingredients.filter(ing => ing.id !== id);
      newVariants[activeVariantIndex] = updatedVariant;
      return newVariants;
    });
  };

  const addVariant = () => {
    const variantName = prompt('Enter variant name (e.g., Small, Medium, Large):');
    if (variantName) {
      setEditingVariants(prev => [...prev, { name: variantName, ingredients: [] }]);
      setActiveVariantIndex(editingVariants.length);
    }
  };


  if (selectedItem) {
    return (
      <div className="bg-[#FFFFFF] min-h-screen font-sans w-full relative flex flex-col">
        {/* Mobile Header */}
        <header className="sticky top-0 z-40 bg-[#FFFFFF] border-b border-slate-100 h-[60px] flex items-center px-4 justify-between lg:hidden">
          <div className="flex items-center gap-3">
            <button onClick={handleBackToList} className="w-10 h-10 flex items-center justify-center -ml-2 text-slate-700 active:bg-slate-100 rounded-full transition-colors">
              <ArrowLeft size={22} />
            </button>
            <h1 className="text-[18px] font-bold text-slate-900 truncate pr-4">{selectedItem.name}</h1>
          </div>
        </header>

        <div className="flex-1 overflow-y-auto pb-32 lg:pb-0">
          <div className="hidden lg:flex items-center max-w-2xl mx-auto mb-4 gap-4 px-8 pt-8">
             <button onClick={handleBackToList} className="w-10 h-10 flex items-center justify-center rounded-full bg-slate-100 hover:bg-slate-200 text-slate-700 active:scale-95 transition-all">
               <ArrowLeft size={20} />
             </button>
             <div>
               <h1 className="text-[28px] font-bold text-slate-900 leading-tight">{selectedItem.name}</h1>
               <h2 className="text-[14px] font-bold text-slate-500 uppercase tracking-wider">{selectedItem.category}</h2>
             </div>
          </div>

          <div className="p-4 md:p-6 lg:p-8 max-w-2xl mx-auto space-y-6">
            <div className="flex gap-2 overflow-x-auto pb-2 [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
              {editingVariants.map((v, idx) => (
                <button 
                  key={idx}
                  onClick={() => setActiveVariantIndex(idx)}
                  className={`px-4 py-2 rounded-full whitespace-nowrap text-sm font-bold transition-colors border ${activeVariantIndex === idx ? 'bg-[#1E90FF] text-[#FFFFFF] border-[#1E90FF]' : 'bg-[#FFFFFF] text-slate-600 border-slate-200 hover:bg-slate-50'}`}
                >
                  {v.name}
                </button>
              ))}
              <button 
                onClick={addVariant}
                className="px-4 py-2 rounded-full whitespace-nowrap text-sm font-bold transition-colors border border-dashed border-slate-300 text-slate-500 hover:bg-slate-50 hover:text-slate-700 flex items-center gap-1 bg-[#FFFFFF]"
              >
                <Plus size={16} /> Variant
              </button>
            </div>
            
            {/* Add Raw Material at the top */}
            <div className="relative">
              <div className="p-5 border border-slate-200 bg-slate-50 rounded-[16px] relative">
                <h4 className="text-[15px] font-bold text-slate-900 flex items-center gap-2 mb-4">
                  <Plus size={18} strokeWidth={2.5} className="text-[#1E90FF]" /> Add Raw Material to {currentVariant?.name}
                </h4>
                
                <div className="relative">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} strokeWidth={2.5} />
                  <input
                    type="text"
                    value={materialSearch}
                    onChange={(e) => {
                      setMaterialSearch(e.target.value);
                      setShowMaterialDropdown(true);
                    }}
                    onFocus={() => setShowMaterialDropdown(true)}
                    placeholder="Search inventory materials..."
                    className="w-full h-[52px] pl-[42px] pr-4 bg-[#FFFFFF] border border-slate-200 rounded-[16px] text-[15px] font-medium text-slate-900 focus:outline-none focus:border-[#1E90FF]"
                  />
                </div>

                {showMaterialDropdown && materialSearch && (
                  <div className="absolute left-5 right-5 top-[calc(100%-12px)] bg-[#FFFFFF] border border-slate-200 rounded-[16px] shadow-lg max-h-[240px] overflow-y-auto z-50 animate-in fade-in slide-in-from-top-2">
                    {availableMaterials.length > 0 ? (
                      <div className="p-2 space-y-1">
                        {availableMaterials.map(m => (
                          <button
                            key={m.id}
                            onClick={() => addIngredient(m)}
                            className="w-full flex items-center justify-between p-3.5 rounded-[12px] hover:bg-slate-100 active:bg-slate-200 transition-colors text-left"
                          >
                            <span className="font-bold text-slate-900 text-[14px]">{m.name}</span>
                            <div className="flex items-center gap-2">
                              <span className={`text-[12px] font-bold ${m.stock > 0 ? 'text-emerald-600' : 'text-red-500'}`}>Stock: {m.stock} {m.unit}</span>
                              <span className="text-[11px] font-black text-slate-500 uppercase bg-slate-100 px-2.5 py-1 rounded-md border border-slate-200">
                                in {m.unit}
                              </span>
                            </div>
                          </button>
                        ))}
                      </div>
                    ) : (
                      <div className="p-6 text-center text-[14px] font-medium text-slate-500">
                        No materials found matching "{materialSearch}"
                      </div>
                    )}
                  </div>
                )}
              </div>
              
              {showMaterialDropdown && (
                <div className="fixed inset-0 z-40" onClick={() => setShowMaterialDropdown(false)} />
              )}
            </div>

            <div>
              <h3 className="font-bold text-slate-900 text-[16px] flex items-center gap-2 mb-4 px-1">
                <ChefHat size={20} className="text-[#1E90FF]" /> 
                {currentVariant?.name} Ingredients
              </h3>

              {(currentVariant?.ingredients.length || 0) > 0 ? (
                <div className="space-y-3">
                  {currentVariant.ingredients.map((ing) => (
                    <div key={ing.id} className="flex flex-col sm:flex-row sm:items-center justify-between p-4 bg-[#FFFFFF] rounded-[16px] border border-slate-200 gap-3">
                      <div className="flex items-center gap-3">
                         <div className="w-12 h-12 rounded-[12px] bg-slate-100 flex items-center justify-center text-slate-500 shrink-0 border border-slate-200">
                           <Package size={20} strokeWidth={2.5} />
                         </div>
                         <div>
                           <p className="font-bold text-slate-900 text-[15px]">{ing.name}</p>
                           <p className="text-[12px] font-semibold text-slate-500 mt-0.5">From Inventory</p>
                         </div>
                      </div>
                      
                      <div className="flex items-center gap-3 self-end sm:self-auto">
                        <div className="relative">
                          <input
                            type="number"
                            placeholder="0"
                            value={ing.quantity}
                            onChange={(e) => updateIngredientQuantity(ing.id, e.target.value)}
                            className="w-[100px] h-[48px] px-3 text-right pr-10 bg-slate-50 border border-slate-200 rounded-[12px] text-slate-900 font-bold focus:outline-none focus:border-[#1E90FF] focus:bg-[#FFFFFF]"
                          />
                          <span className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 text-[13px] font-bold">{ing.unit}</span>
                        </div>
                        
                        <button 
                          onClick={() => removeIngredient(ing.id)}
                          className="w-[48px] h-[48px] flex items-center justify-center rounded-[12px] border border-red-200 text-red-500 hover:bg-red-50 active:scale-95 transition-all bg-[#FFFFFF]"
                        >
                          <Trash2 size={20} />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-10 px-4 border-2 border-dashed border-slate-200 rounded-[16px] bg-slate-50">
                  <div className="mx-auto w-14 h-14 bg-[#FFFFFF] rounded-full flex items-center justify-center text-slate-400 mb-3 shadow-sm border border-slate-200">
                    <Scale size={24} />
                  </div>
                  <h4 className="font-bold text-slate-900 text-[16px] mb-1">No ingredients added</h4>
                  <p className="text-[14px] font-medium text-slate-500">Add raw materials to create a recipe.</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Fixed Footer for Cancel and Save */}
        <div className="fixed bottom-0 left-0 right-0 p-4 bg-[#FFFFFF] border-t border-slate-100 flex gap-3 z-30 lg:static lg:max-w-2xl lg:mx-auto lg:border-none lg:bg-transparent lg:p-8 lg:pt-0">
          <button 
            onClick={handleBackToList}
            className="flex-1 h-[52px] rounded-[16px] font-semibold text-[16px] flex items-center justify-center transition-all bg-slate-100 text-slate-700 active:scale-[0.98]"
          >
            Cancel
          </button>
          <button 
            onClick={handleSaveRecipe}
            className="flex-1 h-[52px] rounded-[16px] font-semibold text-[16px] flex items-center justify-center transition-all bg-[#1E90FF] text-[#FFFFFF] active:scale-[0.98]"
          >
            Save Recipe
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-[#FFFFFF] min-h-screen pb-32 font-sans w-full">
      {/* Mobile Header */}
      <header className="sticky top-0 z-40 bg-[#FFFFFF] border-b border-slate-100 h-[60px] flex items-center px-4 justify-between lg:hidden">
        <div className="flex items-center gap-3">
          <button onClick={onBack} className="w-10 h-10 flex items-center justify-center -ml-2 text-slate-700 active:bg-slate-100 rounded-full transition-colors">
            <ArrowLeft size={22} />
          </button>
          <h1 className="text-[18px] font-bold text-slate-900">Recipe</h1>
        </div>
      </header>

      {/* Desktop Header */}
      <div className="hidden lg:flex items-center gap-4 px-8 pt-8 mb-8 max-w-5xl">
        <button onClick={onBack} className="w-12 h-12 flex items-center justify-center rounded-full bg-slate-100 hover:bg-slate-200 text-slate-700 active:scale-95 transition-all">
          <ArrowLeft size={24} />
        </button>
        <div>
          <h1 className="text-[32px] font-extrabold text-slate-900 leading-tight">Recipe Management</h1>
          <p className="text-[15px] font-medium text-slate-500">Link menu items to inventory materials</p>
        </div>
      </div>

      <div className="px-4 lg:px-8 mb-6 mt-6 lg:mt-0 max-w-5xl">
        <div className="relative mb-6">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-[#6B7280]" size={20} />
          <input 
            type="text" 
            placeholder="Search for dishes" 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full h-[52px] bg-[#FFFFFF] border border-[#E5E7EB] text-[#111827] py-4 pl-12 pr-4 rounded-[16px] focus:outline-none focus:border-[#1E90FF] text-[15px] font-medium transition-all"
          />
        </div>

        {/* Categories */}
        <div className="flex gap-3 overflow-x-auto pb-4 mb-2 snap-x [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
          {categories.map(cat => (
            <button 
              key={`main-[${cat}]`}
              onClick={() => setActiveCategory(cat)}
              className={`h-[36px] px-[14px] rounded-[18px] text-[14px] font-medium whitespace-nowrap transition-all duration-300 flex-shrink-0 flex items-center font-sans ${
                activeCategory === cat 
                  ? 'bg-[#EFF6FF] text-[#1E90FF]' 
                  : 'bg-[#FFFFFF] border border-[#E5E7EB] text-[#374151]'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Sub Categories */}
        <div className="flex gap-2 overflow-x-auto pb-2 snap-x [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
          {subCategories.map(cat => (
            <button 
              key={`sub-[${cat}]`}
              onClick={() => setActiveCategory(cat)}
              className={`h-[36px] px-[14px] rounded-[18px] text-[14px] font-medium whitespace-nowrap transition-all duration-300 flex-shrink-0 flex items-center font-sans ${
                activeCategory === cat 
                  ? 'bg-[#EFF6FF] text-[#1E90FF]' 
                  : 'bg-[#FFFFFF] border border-[#E5E7EB] text-[#374151]'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      <div className="px-4 lg:px-8 space-y-4 max-w-5xl">
        {filteredItems.map(item => {
          const itemRecipe = recipes[item.id.toString()];
          const hasRecipe = itemRecipe && itemRecipe.length > 0;
          
          return (
            <div 
              key={item.id}
              onClick={() => handleSelectItem(item)}
              className="bg-[#FFFFFF] p-4 rounded-[16px] border border-slate-200 flex items-center justify-between cursor-pointer hover:border-slate-300 hover:shadow-sm transition-all duration-300 group"
            >
              <div className="flex-1 min-w-0 pr-4">
                  <h3 className="font-bold text-[16px] text-slate-900 truncate mb-1">{item.name}</h3>
                  <p className="text-[13px] font-medium text-slate-500">{item.category}</p>
              </div>
              
              <div className="flex items-center gap-3">
                {hasRecipe ? (
                  <span className="inline-flex items-center text-[12px] font-bold text-[#059669] bg-[#D1FAE5] px-2.5 py-1 rounded-[8px]">
                    {itemRecipe.length} VARIANTS
                  </span>
                ) : (
                  <span className="inline-flex items-center text-[12px] font-bold text-[#D97706] bg-[#FEF3C7] px-2.5 py-1 rounded-[8px]">
                    RECIPE MISSING
                  </span>
                )}
              </div>
            </div>
          );
        })}
        {filteredItems.length === 0 && (
          <div className="text-center py-16 border-2 border-dashed border-slate-200 rounded-[16px] bg-slate-50 max-w-5xl">
            <p className="text-slate-500 font-bold text-[15px]">No items found.</p>
          </div>
        )}
      </div>
    </div>
  );
};
