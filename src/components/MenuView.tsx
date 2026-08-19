import React, { useState, useRef, useEffect } from 'react';
import { 
  Search, 
  Mic, 
  Plus, 
  MoreVertical, 
  ChevronDown,
  ChevronUp,
  SlidersHorizontal,
  ArrowLeft,
  Camera,
  Check,
  CheckCircle2,
  Sparkles,
  X,
  ImageIcon,
  Trash2,
  PlusCircle,
  Flame,
  Trophy,
  ThumbsUp,
  Star,
  ChevronRight,
  Info,
  Layers,
  IndianRupee,
  UtensilsCrossed,
  Layout,
  PlusSquare,
  Hash,
  Award,
  Zap,
  Droplets,
  Leaf,
  Heart,
  Pencil,
  AlertCircle,
  Circle,
  Egg as EggIcon,
  Loader2,
  Filter
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { VoiceSearchModal } from './VoiceSearchModal';
import { CreateComboView } from './CreateComboView';

export interface MenuItem {
  id: number;
  itemCode?: string;
  name: string;
  category: string;
  subCategory?: string;
  description: string;
  price: number;
  isVeg: boolean;
  isAvailable: boolean;
  image: string;
  dietaryType?: 'Veg' | 'Non-Veg' | 'Egg';
  badges?: string[];
  allowedToppings?: string[];
  allowedAddons?: string[];
  exactStock?: number;
  scheduledMenus?: { enabled: boolean; type: string };
  comboItems?: string[];
  preparationTime?: number;
  competitorPrice?: number;
  allergens?: string[];
  dietTags?: string[];
  comboType?: 'fixed' | 'choice' | 'build';
  comboDetails?: any;
  requiredAddonGroups?: string[];
  addonGroupLimits?: Record<string, number>;
  variants?: { id: string; name: string; price: string | number; allowedAddons?: string[] }[];
}

export const ALL_BADGES = [
  { id: 'bestseller', label: 'Bestseller', icon: Trophy, color: 'text-amber-600', bg: 'bg-amber-50', border: 'border-amber-200' },
  { id: 'must-try', label: 'Must Try', icon: Star, color: 'text-indigo-600', bg: 'bg-indigo-50', border: 'border-indigo-200' },
  { id: 'spicy', label: 'Spicy', icon: Flame, color: 'text-rose-600', bg: 'bg-rose-50', border: 'border-rose-200' },
  { id: 'sugar-free', label: 'Sugar Free', icon: Droplets, color: 'text-sky-600', bg: 'bg-sky-50', border: 'border-sky-200' },
  { id: 'new-launch', label: 'New Launch', icon: Sparkles, color: 'text-emerald-600', bg: 'bg-emerald-50', border: 'border-emerald-200' },
  { id: 'chef-special', label: 'Chef Special', icon: UtensilsCrossed, color: 'text-violet-600', bg: 'bg-violet-50', border: 'border-violet-200' },
  { id: 'recommended', label: 'Recommended', icon: ThumbsUp, color: 'text-blue-600', bg: 'bg-blue-50', border: 'border-blue-200' },
  { id: 'trending', label: 'Trending', icon: Zap, color: 'text-orange-600', bg: 'bg-orange-50', border: 'border-orange-200' },
  { id: 'vegan', label: 'Vegan', icon: Leaf, color: 'text-green-600', bg: 'bg-green-50', border: 'border-green-200' },
  { id: 'healthy', label: 'Healthy', icon: Heart, color: 'text-pink-600', bg: 'bg-pink-50', border: 'border-pink-200' }
];

export const ALL_ALLERGENS = [
  { id: 'dairy', label: 'Dairy' },
  { id: 'peanuts', label: 'Peanuts' },
  { id: 'tree-nuts', label: 'Tree Nuts' },
  { id: 'gluten', label: 'Gluten' },
  { id: 'soy', label: 'Soy' },
  { id: 'eggs', label: 'Eggs' },
  { id: 'fish', label: 'Fish' },
  { id: 'shellfish', label: 'Shellfish' }
];

export const ALL_DIET_TAGS = [
  { id: 'vegan', label: 'Vegan', bg: 'bg-green-50', color: 'text-green-700', border: 'border-green-200' },
  { id: 'vegetarian', label: 'Vegetarian', bg: 'bg-emerald-50', color: 'text-emerald-700', border: 'border-emerald-200' },
  { id: 'halal', label: 'Halal', bg: 'bg-emerald-50', color: 'text-emerald-700', border: 'border-emerald-200' },
  { id: 'keto', label: 'Keto', bg: 'bg-blue-50', color: 'text-blue-700', border: 'border-blue-200' },
  { id: 'paleo', label: 'Paleo', bg: 'bg-orange-50', color: 'text-orange-700', border: 'border-orange-200' },
  { id: 'gluten-free', label: 'Gluten Free', bg: 'bg-amber-50', color: 'text-amber-700', border: 'border-amber-200' }
];

export const SAMPLE_ITEMS: MenuItem[] = [
  {
    id: 1,
    itemCode: 'PZ01',
    name: 'Margherita Pizza',
    category: 'Pizza',
    description: 'Classic delight with 100% real mozzarella cheese.',
    price: 199,
    isVeg: true,
    isAvailable: true,
    dietaryType: 'Veg',
    badges: ['bestseller'],
    image: 'https://images.unsplash.com/photo-1574071318508-1cdbab80d002?auto=format&fit=crop&w=500&q=80'
  },
  {
    id: 2,
    itemCode: 'PZ02',
    name: 'Farmhouse Pizza',
    category: 'Pizza',
    description: 'Delightful combination of onion, capsicum, tomato & grilled mushroom.',
    price: 399,
    isVeg: true,
    isAvailable: true,
    dietaryType: 'Veg',
    badges: ['must-try', 'healthy'],
    image: 'https://images.unsplash.com/photo-1513104890138-7c749659a591?auto=format&fit=crop&w=500&q=80'
  },
  {
    id: 3,
    itemCode: 'PZ03',
    name: 'Peppy Paneer Pizza',
    category: 'Pizza',
    description: 'Flavorful trio of juicy paneer, crisp capsicum with spicy red paprika.',
    price: 459,
    isVeg: true,
    isAvailable: true,
    dietaryType: 'Veg',
    badges: ['spicy'],
    image: 'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?auto=format&fit=crop&w=500&q=80'
  },
  {
    id: 4,
    itemCode: 'PZ04',
    name: 'Chicken Tikka Pizza',
    category: 'Pizza',
    description: 'Traditional chicken tikka with onion, capsicum and mint mayo.',
    price: 499,
    isVeg: false,
    isAvailable: true,
    dietaryType: 'Non-Veg',
    badges: ['bestseller', 'chef-special'],
    image: 'https://images.unsplash.com/photo-1565299507177-b0ac66763828?auto=format&fit=crop&w=500&q=80'
  },
  {
    id: 5,
    itemCode: 'PZ05',
    name: 'Pepperoni Pizza',
    category: 'Pizza',
    description: 'Classic American pizza with premium pork pepperoni.',
    price: 549,
    isVeg: false,
    isAvailable: false,
    dietaryType: 'Non-Veg',
    badges: ['trending'],
    image: 'https://images.unsplash.com/photo-1628840042765-356cda07504e?auto=format&fit=crop&w=500&q=80'
  },
  {
    id: 6,
    itemCode: 'PZ06',
    name: 'Veg Extravaganza',
    category: 'Pizza',
    description: 'Black olives, capsicum, onion, grilled mushroom, corn, tomato, jalapeno.',
    price: 499,
    isVeg: true,
    isAvailable: true,
    dietaryType: 'Veg',
    badges: ['recommended'],
    image: 'https://images.unsplash.com/photo-1604382354936-07c5d9983bd3?auto=format&fit=crop&w=500&q=80'
  },
  {
    id: 7,
    itemCode: 'PZ07',
    name: 'BBQ Chicken Pizza',
    category: 'Pizza',
    description: 'Smoked BBQ chicken, onion, and jalapeno with a sweet & spicy sauce.',
    price: 529,
    isVeg: false,
    isAvailable: true,
    dietaryType: 'Non-Veg',
    badges: ['new-launch'],
    image: 'https://images.unsplash.com/photo-1513104890138-7c749659a591?auto=format&fit=crop&w=500&q=80'
  },
  {
    id: 8,
    itemCode: 'PZ08',
    name: 'Mushroom & Truffle',
    category: 'Pizza',
    description: 'Gourmet pizza with roasted mushrooms, truffle oil, and parmesan.',
    price: 649,
    isVeg: true,
    isAvailable: true,
    dietaryType: 'Veg',
    badges: ['chef-special'],
    image: 'https://images.unsplash.com/photo-1590947132387-155cc02f3212?auto=format&fit=crop&w=500&q=80'
  },
  {
    id: 9,
    itemCode: 'PZ09',
    name: 'Spicy Chicken Sausage',
    category: 'Pizza',
    description: 'Chicken sausage, red paprika, and mint mayo on a thin crust.',
    price: 449,
    isVeg: false,
    isAvailable: true,
    dietaryType: 'Non-Veg',
    badges: ['spicy'],
    image: 'https://images.unsplash.com/photo-1565299507177-b0ac66763828?auto=format&fit=crop&w=500&q=80'
  },
  {
    id: 10,
    itemCode: 'PZ10',
    name: 'Four Cheese Pizza',
    category: 'Pizza',
    description: 'Mozzarella, Cheddar, Gouda, and Parmesan cheese blend.',
    price: 599,
    isVeg: true,
    isAvailable: true,
    dietaryType: 'Veg',
    badges: ['must-try'],
    image: 'https://images.unsplash.com/photo-1574071318508-1cdbab80d002?auto=format&fit=crop&w=500&q=80'
  },
  {
    id: 11,
    itemCode: 'SD01',
    name: 'Garlic Breadsticks',
    category: 'Sides',
    description: 'Freshly baked garlic breadsticks with a cheesy dip.',
    price: 129,
    isVeg: true,
    isAvailable: true,
    dietaryType: 'Veg',
    badges: ['bestseller'],
    image: 'https://images.unsplash.com/photo-1573140247632-f8fd74997d5c?auto=format&fit=crop&w=500&q=80'
  },
  {
    id: 12,
    itemCode: 'SD02',
    name: 'Stuffed Garlic Bread',
    category: 'Sides',
    description: 'Garlic bread stuffed with mozzarella cheese and sweet corn.',
    price: 169,
    isVeg: true,
    isAvailable: true,
    dietaryType: 'Veg',
    badges: ['must-try'],
    image: 'https://images.unsplash.com/photo-1573140247632-f8fd74997d5c?auto=format&fit=crop&w=500&q=80'
  },
  {
    id: 13,
    itemCode: 'SD03',
    name: 'Chicken Wings (6 pcs)',
    category: 'Sides',
    description: 'Spicy roasted chicken wings served with ranch dip.',
    price: 249,
    isVeg: false,
    isAvailable: true,
    dietaryType: 'Non-Veg',
    badges: ['spicy', 'trending'],
    image: 'https://images.unsplash.com/photo-1569691899455-88464f6d3ab1?auto=format&fit=crop&w=500&q=80'
  },
  {
    id: 14,
    itemCode: 'SD04',
    name: 'French Fries',
    category: 'Sides',
    description: 'Crispy golden french fries salted to perfection.',
    price: 109,
    isVeg: true,
    isAvailable: true,
    dietaryType: 'Veg',
    badges: ['vegan'],
    image: 'https://images.unsplash.com/photo-1576107232684-1279f390859f?auto=format&fit=crop&w=500&q=80'
  },
  {
    id: 15,
    itemCode: 'SD05',
    name: 'Cheesy Jalapeno Dip',
    category: 'Sides',
    description: 'Creamy cheese dip with a spicy jalapeno kick.',
    price: 39,
    isVeg: true,
    isAvailable: true,
    dietaryType: 'Veg',
    badges: [],
    image: 'https://images.unsplash.com/photo-1585032226651-759b368d7246?auto=format&fit=crop&w=500&q=80'
  },
  {
    id: 16,
    itemCode: 'SD06',
    name: 'Potato Wedges',
    category: 'Sides',
    description: 'Oven-baked potato wedges with herbs and spices.',
    price: 139,
    isVeg: true,
    isAvailable: true,
    dietaryType: 'Veg',
    badges: ['vegan'],
    image: 'https://images.unsplash.com/photo-1576107232684-1279f390859f?auto=format&fit=crop&w=500&q=80'
  },
  {
    id: 17,
    itemCode: 'SD07',
    name: 'Chicken Meatballs',
    category: 'Sides',
    description: 'Juicy chicken meatballs in a tangy tomato sauce.',
    price: 199,
    isVeg: false,
    isAvailable: true,
    dietaryType: 'Non-Veg',
    badges: ['new-launch'],
    image: 'https://images.unsplash.com/photo-1529042410759-befb1204b468?auto=format&fit=crop&w=500&q=80'
  },
  {
    id: 18,
    itemCode: 'SD08',
    name: 'Choco Lava Cake',
    category: 'Sides',
    description: 'Chocolate cake with a gooey, molten chocolate center.',
    price: 119,
    isVeg: false,
    isAvailable: true,
    dietaryType: 'Egg',
    badges: ['bestseller'],
    image: 'https://images.unsplash.com/photo-1624353365286-3f8d62daad51?auto=format&fit=crop&w=500&q=80'
  },
  {
    id: 19,
    itemCode: 'BV01',
    name: 'Pepsi (500ml)',
    category: 'Beverages',
    description: 'Chilled Pepsi pet bottle.',
    price: 60,
    isVeg: true,
    isAvailable: true,
    dietaryType: 'Veg',
    badges: [],
    image: 'https://images.unsplash.com/photo-1622483767028-3f66f32aef97?auto=format&fit=crop&w=500&q=80'
  },
  {
    id: 20,
    itemCode: 'BV02',
    name: 'Diet Coke (330ml)',
    category: 'Beverages',
    description: 'Zero calorie cola in a can.',
    price: 60,
    isVeg: true,
    isAvailable: true,
    dietaryType: 'Veg',
    badges: ['sugar-free'],
    image: 'https://images.unsplash.com/photo-1622483767028-3f66f32aef97?auto=format&fit=crop&w=500&q=80'
  },
  {
    id: 21,
    itemCode: 'BV03',
    name: 'Cold Coffee',
    category: 'Beverages',
    description: 'Creamy and refreshing cold coffee.',
    price: 149,
    isVeg: true,
    isAvailable: true,
    dietaryType: 'Veg',
    badges: ['bestseller'],
    image: 'https://images.unsplash.com/photo-1461023058943-07fcbe16d735?auto=format&fit=crop&w=500&q=80'
  },
  {
    id: 22,
    itemCode: 'BV04',
    name: 'Lemon Iced Tea',
    category: 'Beverages',
    description: 'Refreshing iced tea with a hint of lemon.',
    price: 129,
    isVeg: true,
    isAvailable: true,
    dietaryType: 'Veg',
    badges: ['vegan'],
    image: 'https://images.unsplash.com/photo-1556679343-c7306c1976bc?auto=format&fit=crop&w=500&q=80'
  },
  {
    id: 23,
    itemCode: 'BV05',
    name: 'Mango Smoothie',
    category: 'Beverages',
    description: 'Thick and creamy mango smoothie.',
    price: 179,
    isVeg: true,
    isAvailable: false,
    dietaryType: 'Veg',
    badges: ['must-try'],
    image: 'https://images.unsplash.com/photo-1623065422902-30a2d299bbe4?auto=format&fit=crop&w=500&q=80'
  },
  {
    id: 24,
    itemCode: 'BV06',
    name: 'Mineral Water',
    category: 'Beverages',
    description: 'Packaged drinking water (1 Litre).',
    price: 40,
    isVeg: true,
    isAvailable: true,
    dietaryType: 'Veg',
    badges: [],
    image: 'https://images.unsplash.com/photo-1523362628745-0c100150b504?auto=format&fit=crop&w=500&q=80'
  },
  {
    id: 25,
    itemCode: 'BV07',
    name: 'Strawberry Milkshake',
    category: 'Beverages',
    description: 'Classic strawberry milkshake with ice cream.',
    price: 159,
    isVeg: true,
    isAvailable: true,
    dietaryType: 'Veg',
    badges: [],
    image: 'https://images.unsplash.com/photo-1572490122747-3968b75bb699?auto=format&fit=crop&w=500&q=80'
  },
  {
    id: 26,
    itemCode: 'CB01',
    name: 'Meal for 2 (Veg)',
    category: 'Combos',
    description: '1 Medium Veg Pizza + 1 Garlic Bread + 2 Pepsi.',
    price: 699,
    isVeg: true,
    isAvailable: true,
    dietaryType: 'Veg',
    badges: ['bestseller'],
    image: 'https://images.unsplash.com/photo-1513104890138-7c749659a591?auto=format&fit=crop&w=500&q=80'
  },
  {
    id: 27,
    itemCode: 'CB02',
    name: 'Meal for 2 (Non-Veg)',
    category: 'Combos',
    description: '1 Medium Non-Veg Pizza + 1 Chicken Wings + 2 Pepsi.',
    price: 849,
    isVeg: false,
    isAvailable: true,
    dietaryType: 'Non-Veg',
    badges: ['recommended'],
    image: 'https://images.unsplash.com/photo-1565299507177-b0ac66763828?auto=format&fit=crop&w=500&q=80'
  },
  {
    id: 28,
    itemCode: 'CB03',
    name: 'Family Feast',
    category: 'Combos',
    description: '2 Medium Pizzas + 2 Sides + 1 large Beverage.',
    price: 1299,
    isVeg: true,
    isAvailable: true,
    dietaryType: 'Veg',
    badges: ['trending'],
    image: 'https://images.unsplash.com/photo-1604382354936-07c5d9983bd3?auto=format&fit=crop&w=500&q=80'
  },
  {
    id: 29,
    itemCode: 'CB04',
    name: 'Snack Combo',
    category: 'Combos',
    description: '1 Garlic Bread + 1 French Fries + 1 Dip.',
    price: 249,
    isVeg: true,
    isAvailable: true,
    dietaryType: 'Veg',
    badges: [],
    image: 'https://images.unsplash.com/photo-1573140247632-f8fd74997d5c?auto=format&fit=crop&w=500&q=80'
  },
  {
    id: 30,
    itemCode: 'CB05',
    name: 'Party Combo',
    category: 'Combos',
    description: '4 Large Pizzas + 4 Sides + 4 Desserts + 4 Beverages.',
    price: 2999,
    isVeg: false,
    isAvailable: true,
    dietaryType: 'Non-Veg',
    badges: ['chef-special'],
    image: 'https://images.unsplash.com/photo-1565299507177-b0ac66763828?auto=format&fit=crop&w=500&q=80'
  }
];

const getCategoryIcon = (category: string) => {
  switch (category.toLowerCase()) {
    case 'pizza': return '🍕';
    case 'sides': return '🍟';
    case 'beverages': return '🥤';
    case 'combos': return '🍱';
    case 'desserts': return '🍰';
    default: return '';
  }
};

export const MenuView: React.FC = () => {
  const [mainTab, setMainTab] = useState<'items' | 'menu' | 'addons'>('items');
  const [items, setItems] = useState<MenuItem[]>(SAMPLE_ITEMS);
  const [addonGroups, setAddonGroups] = useState<{id: string, name: string, type?: 'addon' | 'topping', isRequired?: boolean, isActive: boolean, addons: {id: string, name: string, price: string}[]}[]>([
    { id: '1', name: 'Bread Type', isActive: true, addons: [{ id: '101', name: 'Wheat', price: '0' }, { id: '102', name: 'Multi-grain', price: '20' }] }
  ]);
  const [activeCategory, setActiveCategory] = useState('All Categories');
  const [activeSubCategory, setActiveSubCategory] = useState('All Sub Categories');
  const [isFilterSheetOpen, setIsFilterSheetOpen] = useState(false);
  
  const [searchQuery, setSearchQuery] = useState('');
  const [showVoiceSearch, setShowVoiceSearch] = useState(false);
  const [viewMode, setViewMode] = useState<'list' | 'create' | 'edit' | 'create-combo'>('list');
  const [editingItem, setEditingItem] = useState<MenuItem | null>(null);
  const [activeActionMenuId, setActiveActionMenuId] = useState<number | null>(null);
  const [itemToDelete, setItemToDelete] = useState<MenuItem | null>(null);
  
  const [categories, setCategories] = useState(['All Categories', 'Lunch', 'Dinner', 'Main Course', 'Combos', 'Toppings']);
  const [subCategories, setSubCategories] = useState(['All Sub Categories', 'Pizza', 'Sides', 'Beverages']);
  const [isAddCategoryOpen, setIsAddCategoryOpen] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState('');
  const [isAddMainCategoryOpen, setIsAddMainCategoryOpen] = useState(false);
  const [newMainCategoryName, setNewMainCategoryName] = useState('');
  const [isAddOptionsOpen, setIsAddOptionsOpen] = useState(false);
  
  const toggleAvailability = (id: number) => {
    setItems(items.map(item => 
      item.id === id ? { ...item, isAvailable: !item.isAvailable } : item
    ));
  };

  const handleDeleteItem = (id: number) => {
    setItems(items.filter(item => item.id !== id));
    setItemToDelete(null);
  };

  const handleSaveItem = (item: any) => {
    if (viewMode === 'edit' && editingItem) {
      setItems(items.map(i => i.id === editingItem.id ? { ...item, id: editingItem.id } : i));
    } else {
      setItems([...items, { ...item, id: Date.now() }]);
    }
    setViewMode('list');
    setEditingItem(null);
  };

  const handleAddCategory = () => {
    if (newCategoryName.trim() && !subCategories.includes(newCategoryName.trim())) {
      const newCats = [...subCategories];
      newCats.splice(1, 0, newCategoryName.trim());
      setSubCategories(newCats);
      setNewCategoryName('');
      setIsAddCategoryOpen(false);
    }
  };

  const handleAddMainCategory = () => {
    if (newMainCategoryName.trim() && !categories.includes(newMainCategoryName.trim())) {
      setCategories([...categories, newMainCategoryName.trim()]);
      setNewMainCategoryName('');
      setIsAddMainCategoryOpen(false);
    }
  };

  const filteredItems = items.filter(item => {
    const matchesCategory = activeCategory === 'All Categories' || item.category === activeCategory;
    const matchesSubCategory = activeSubCategory === 'All Sub Categories' || item.subCategory === activeSubCategory;
    const matchesSearch = 
      item.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
      (item.itemCode && item.itemCode.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesCategory && matchesSubCategory && matchesSearch;
  });

  if (viewMode === 'create-combo') {
    return (
      <CreateComboView 
        onBack={() => setViewMode('list')}
        allItems={items}
        categories={categories.filter(c => c !== 'All Categories')}
        onSave={handleSaveItem}
      />
    );
  }

  if (viewMode === 'create' || viewMode === 'edit') {
    return (
      <CreateItemView 
        onBack={() => {
          setViewMode('list');
          setEditingItem(null);
        }} 
        categories={categories.filter(c => c !== 'All Categories')} 
        subCategories={subCategories.filter(c => c !== 'All Sub Categories')}
        initialItem={editingItem}
        onSave={handleSaveItem}
        allItems={items}
        addonGroups={addonGroups}
      />
    );
  }

  return (
    <div className="pb-32 px-6 pt-6 animate-in fade-in duration-500 bg-[#FFFFFF] min-h-screen font-sans relative lg:bg-transparent lg:px-0 lg:pt-0 lg:pb-10">
      
      {/* Main Tab Toggle */}
      <div className="relative flex p-1 bg-[#F3F4F6] rounded-full mb-6 mx-0 lg:max-w-md">
        <div 
          className="absolute top-1 bottom-1 bg-[#FFFFFF] rounded-full shadow-sm transition-all duration-300 ease-out"
          style={{ 
            left: '4px', 
            width: 'calc((100% - 8px) / 3)',
            transform: `translateX(${['items', 'menu', 'addons'].indexOf(mainTab) * 100}%)` 
          }}
        />
        {['items', 'menu', 'addons'].map(tab => (
          <button
            key={tab}
            onClick={() => setMainTab(tab as any)}
            className={`relative z-10 flex-1 py-3 text-[14px] font-semibold transition-colors duration-300 capitalize ${
              mainTab === tab 
              ? 'text-[#1E90FF]' 
              : 'text-[#6B7280] hover:text-slate-900'
            }`}
          >
            {tab === 'addons' ? 'Add-ons' : tab}
          </button>
        ))}
      </div>

      {mainTab === 'items' && (
        <>
          {/* Search Bar */}
          <div className="relative mb-6">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-[#6B7280]" size={20} />
            <input 
              type="text" 
              placeholder="Search for dishes" 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full h-[52px] bg-[#FFFFFF] border border-[#E5E7EB] text-[#111827] py-4 pl-12 pr-[60px] rounded-[16px] focus:outline-none focus:border-blue-500 text-[15px] font-medium transition-all"
            />
            <button 
              onClick={() => setIsFilterSheetOpen(true)}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-[#6B7280] hover:text-[#1E90FF] transition-colors p-1"
            >
              <Filter size={20} />
            </button>
          </div>

          <VoiceSearchModal 
            isOpen={showVoiceSearch} 
            onClose={() => setShowVoiceSearch(false)} 
            onResult={(text) => setSearchQuery(text)}
          />

          {/* Filter Bottom Sheet */}
          {isFilterSheetOpen && (
            <div className="fixed inset-0 z-[200] flex items-end justify-center bg-black/50 sm:items-center transition-opacity" onClick={() => setIsFilterSheetOpen(false)}>
              <div className="w-full bg-[#FFFFFF] rounded-t-2xl sm:rounded-2xl sm:max-w-sm p-6 animate-in slide-in-from-bottom-full sm:slide-in-from-bottom-0 sm:fade-in duration-300" onClick={e => e.stopPropagation()}>
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-lg font-bold text-slate-900">Filters</h3>
                  <button onClick={() => setIsFilterSheetOpen(false)} className="w-8 h-8 flex items-center justify-center rounded-full bg-slate-100 text-slate-600 hover:bg-slate-200">
                    <X size={16} />
                  </button>
                </div>
                
                <div className="space-y-4 mb-8">
                  <div className="space-y-2">
                    <label className="text-[14px] font-medium text-[#374151]">Category</label>
                    <select 
                      value={activeCategory}
                      onChange={(e) => setActiveCategory(e.target.value)}
                      className="w-full h-[44px] bg-[#FFFFFF] border border-[#E5E7EB] rounded-[10px] px-[12px] text-[14px] text-[#111827] focus:outline-none focus:border-[#1E90FF] transition-colors appearance-none"
                    >
                      <option value="All Categories">All Categories</option>
                      {categories.filter(c => c !== 'All Categories').map(cat => (
                        <option key={cat} value={cat}>{cat}</option>
                      ))}
                    </select>
                  </div>

                  <div className="space-y-2">
                    <label className="text-[14px] font-medium text-[#374151]">Sub Category</label>
                    <select 
                      value={activeSubCategory}
                      onChange={(e) => setActiveSubCategory(e.target.value)}
                      className="w-full h-[44px] bg-[#FFFFFF] border border-[#E5E7EB] rounded-[10px] px-[12px] text-[14px] text-[#111827] focus:outline-none focus:border-[#1E90FF] transition-colors appearance-none"
                    >
                      <option value="All Sub Categories">All Sub Categories</option>
                      {subCategories.filter(c => c !== 'All Sub Categories').map(cat => (
                        <option key={cat} value={cat}>{cat}</option>
                      ))}
                    </select>
                  </div>
                </div>
                
                <div className="flex gap-3">
                  <button 
                    onClick={() => {
                      setActiveCategory('All Categories');
                      setActiveSubCategory('All Sub Categories');
                      setIsFilterSheetOpen(false);
                    }}
                    className="flex-1 py-3 px-4 bg-slate-100 text-slate-700 font-semibold rounded-xl active:scale-95 transition-transform"
                  >
                    Clear All
                  </button>
                  <button 
                    onClick={() => setIsFilterSheetOpen(false)}
                    className="flex-1 py-3 px-4 bg-[#1E90FF] text-white font-semibold rounded-xl active:scale-95 transition-transform"
                  >
                    Apply Filters
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Add Sub Category Bottom Sheet */}
      {isAddCategoryOpen && (
        <div className="fixed inset-0 z-[200] flex items-end justify-center bg-black/50 sm:items-center transition-opacity" onClick={() => setIsAddCategoryOpen(false)}>
          <div className="w-full bg-[#FFFFFF] rounded-t-2xl sm:rounded-2xl sm:max-w-sm p-6 animate-in slide-in-from-bottom-full sm:slide-in-from-bottom-0 sm:fade-in duration-300" onClick={e => e.stopPropagation()}>
            <h3 className="text-lg font-bold text-slate-900 mb-4">Add New Sub Category</h3>
            
            <div className="space-y-2 mb-6">
              <label className="text-[14px] font-medium text-[#374151]">Sub Category Name</label>
              <input 
                type="text" 
                placeholder="Enter sub category name" 
                value={newCategoryName}
                onChange={(e) => setNewCategoryName(e.target.value)}
                autoFocus
                className="w-full h-[44px] bg-[#FFFFFF] border border-[#E5E7EB] rounded-[10px] px-[12px] text-[14px] text-[#111827] focus:outline-none focus:border-[#1E90FF] transition-colors"
              />
            </div>
            
            <div className="flex gap-3">
              <button 
                onClick={() => setIsAddCategoryOpen(false)}
                className="flex-1 py-3 px-4 bg-slate-100 text-slate-700 font-semibold rounded-xl active:scale-95 transition-transform"
              >
                Cancel
              </button>
              <button 
                onClick={handleAddCategory}
                disabled={!newCategoryName.trim()}
                className="flex-1 py-3 px-4 bg-[#1E90FF] text-white font-semibold rounded-xl active:scale-95 transition-transform disabled:opacity-50"
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add Main Category Bottom Sheet */}
      {isAddMainCategoryOpen && (
        <div className="fixed inset-0 z-[200] flex items-end justify-center bg-black/50 sm:items-center transition-opacity" onClick={() => setIsAddMainCategoryOpen(false)}>
          <div className="w-full bg-[#FFFFFF] rounded-t-2xl sm:rounded-2xl sm:max-w-sm p-6 animate-in slide-in-from-bottom-full sm:slide-in-from-bottom-0 sm:fade-in duration-300" onClick={e => e.stopPropagation()}>
            <h3 className="text-lg font-bold text-slate-900 mb-4">Add New Category</h3>
            
            <div className="space-y-2 mb-6">
              <label className="text-[14px] font-medium text-[#374151]">Category Name</label>
              <input 
                type="text" 
                placeholder="Enter category name" 
                value={newMainCategoryName}
                onChange={(e) => setNewMainCategoryName(e.target.value)}
                autoFocus
                className="w-full h-[44px] bg-[#FFFFFF] border border-[#E5E7EB] rounded-[10px] px-[12px] text-[14px] text-[#111827] focus:outline-none focus:border-[#1E90FF] transition-colors"
              />
            </div>
            
            <div className="flex gap-3">
              <button 
                onClick={() => setIsAddMainCategoryOpen(false)}
                className="flex-1 py-3 px-4 bg-slate-100 text-slate-700 font-semibold rounded-xl active:scale-95 transition-transform"
              >
                Cancel
              </button>
              <button 
                onClick={handleAddMainCategory}
                disabled={!newMainCategoryName.trim()}
                className="flex-1 py-3 px-4 bg-[#1E90FF] text-white font-semibold rounded-xl active:scale-95 transition-transform disabled:opacity-50"
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Menu Item Cards */}
      <div className="flex flex-col gap-4 mb-8">
        {filteredItems.length > 0 ? (
          filteredItems.map((item) => (
            <div key={item.id} className={`relative rounded-[16px] p-3 border border-[#E5E7EB] flex gap-4 transition-colors duration-300 ${item.isAvailable ? 'bg-[#FFFFFF]' : 'bg-slate-100 opacity-75 grayscale-[0.5]'}`}>
              {/* Image Section */}
              <div className="relative w-[120px] h-[120px] rounded-[10px] overflow-hidden bg-slate-50 shrink-0">
                <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                
                {/* Veg/Non-Veg Icon */}
                <div className="absolute top-1.5 left-1.5 bg-[#FFFFFF] p-1 rounded-md shadow-sm">
                  <div className={`w-2.5 h-2.5 rounded-sm border flex items-center justify-center ${item.isVeg ? 'border-green-500' : 'border-red-500'}`}>
                    <div className={`w-1 h-1 rounded-full ${item.isVeg ? 'bg-green-500' : 'bg-red-500'}`} />
                  </div>
                </div>

                {/* Rating Badge */}
                <div className="absolute bottom-1.5 right-1.5 bg-[#ECFDF5] text-[#065F46] px-1.5 py-0.5 rounded-md flex items-center gap-1 shadow-sm">
                  <span className="text-[9px] font-medium">⭐ 4.3</span>
                </div>
              </div>

              {/* Content Section */}
              <div className="flex flex-col flex-1 py-1">
                <div className="flex items-start justify-between gap-1 mb-1.5">
                  <h3 className="text-[14px] font-semibold text-[#111827] leading-tight flex-1 line-clamp-2">{item.name}</h3>
                  
                  {/* Action Menu */}
                  <div className="relative shrink-0">
                    <button 
                      onClick={() => setActiveActionMenuId(activeActionMenuId === item.id ? null : item.id)}
                      className="w-6 h-6 -mr-1 -mt-1 rounded-full hover:bg-slate-100 flex items-center justify-center text-[#6B7280] transition-colors"
                    >
                       <MoreVertical size={16} />
                    </button>
                    
                    {/* Action Menu Dropdown */}
                    {activeActionMenuId === item.id && (
                      <>
                        <div className="fixed inset-0 z-[100]" onClick={() => setActiveActionMenuId(null)} />
                        <div className="absolute right-0 mt-1 w-28 bg-[#FFFFFF] rounded-xl shadow-lg border border-[#E5E7EB] overflow-hidden z-[110] animate-in zoom-in-95 duration-200">
                           <button 
                             onClick={() => {
                               setEditingItem(item);
                               setViewMode('edit');
                               setActiveActionMenuId(null);
                             }}
                             className="w-full px-3 py-2 flex items-center gap-2 text-[#111827] hover:bg-slate-50 transition-colors text-[12px] font-medium"
                           >
                              <Pencil size={12} className="text-[#1E90FF]" /> Edit
                           </button>
                           <button 
                             onClick={() => {
                               setItemToDelete(item);
                               setActiveActionMenuId(null);
                             }}
                             className="w-full px-3 py-2 flex items-center gap-2 text-rose-500 hover:bg-rose-50 transition-colors text-[12px] font-medium border-t border-slate-50"
                           >
                              <Trash2 size={12} /> Delete
                           </button>
                        </div>
                      </>
                    )}
                  </div>
                </div>
                
                <p className="text-[12px] text-[#6B7280] line-clamp-2 mb-2 leading-snug">
                   {item.description || 'Delicious and freshly prepared for you.'}
                </p>
                
                <div className="flex flex-row items-center justify-between gap-1 mt-auto">
                  <span className="text-[17px] font-black text-[#111827]">₹{item.price}</span>
                  
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-bold text-[#6B7280] uppercase tracking-wide">
                      {item.isAvailable ? 'IN STOCK' : 'OUT'}
                    </span>
                    <button 
                      onClick={() => toggleAvailability(item.id)}
                      className={`w-[44px] h-[24px] rounded-full p-[2px] transition-colors duration-300 relative shrink-0 ${item.isAvailable ? 'bg-green-500' : 'bg-[#D1D5DB]'}`}
                    >
                      <div className={`w-[20px] h-[20px] bg-[#FFFFFF] rounded-full transform transition-transform duration-300 shadow-sm ${item.isAvailable ? 'translate-x-[20px]' : 'translate-x-0'}`} />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="py-20 text-center bg-[#FFFFFF] rounded-[18px] border border-dashed border-[#E5E7EB]">
             <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4 text-[#6B7280] shadow-sm">
                <Search size={24} />
             </div>
             <p className="text-[15px] font-medium text-[#111827]">No matching items</p>
             <p className="text-[13px] text-[#6B7280] mt-1">Try searching by a different name</p>
             {searchQuery && (
               <button 
                onClick={() => setSearchQuery('')}
                className="mt-4 text-[14px] font-medium text-[#1E90FF]"
               >
                 Clear Search
               </button>
             )}
          </div>
        )}
      </div>

      {/* Add Options Bottom Sheet */}
      {isAddOptionsOpen && (
        <div 
          className="fixed inset-0 z-[200] flex items-end justify-center bg-black/50 sm:items-center transition-opacity"
          onClick={() => setIsAddOptionsOpen(false)}
        >
          <div 
            className="w-full bg-[#FFFFFF] rounded-t-2xl sm:rounded-2xl sm:max-w-sm p-6 animate-in slide-in-from-bottom-full sm:slide-in-from-bottom-0 sm:fade-in duration-300"
            onClick={e => e.stopPropagation()}
          >
            <h3 className="text-lg font-bold text-slate-900 mb-6">What would you like to add?</h3>
            <div className="flex flex-col gap-3">
              <button 
                onClick={() => { setIsAddOptionsOpen(false); setViewMode('create'); }}
                className="w-full p-4 flex items-center gap-4 bg-slate-50 hover:bg-slate-100 rounded-xl transition-colors text-left"
              >
                <div className="w-10 h-10 rounded-full bg-[#1E90FF] text-white flex items-center justify-center shrink-0 font-bold text-[16px]">
                  1
                </div>
                <div>
                  <p className="font-semibold text-slate-900">Food Item</p>
                  <p className="text-sm text-slate-500">Add a new dish to your menu</p>
                </div>
              </button>

              <button 
                onClick={() => { setIsAddOptionsOpen(false); setIsAddMainCategoryOpen(true); }}
                className="w-full p-4 flex items-center gap-4 bg-slate-50 hover:bg-slate-100 rounded-xl transition-colors text-left"
              >
                <div className="w-10 h-10 rounded-full bg-[#1E90FF] text-white flex items-center justify-center shrink-0 font-bold text-[16px]">
                  2
                </div>
                <div>
                  <p className="font-semibold text-slate-900">Category</p>
                  <p className="text-sm text-slate-500">Create a new main category</p>
                </div>
              </button>

              <button 
                onClick={() => { setIsAddOptionsOpen(false); setIsAddCategoryOpen(true); }}
                className="w-full p-4 flex items-center gap-4 bg-slate-50 hover:bg-slate-100 rounded-xl transition-colors text-left"
              >
                <div className="w-10 h-10 rounded-full bg-[#1E90FF] text-white flex items-center justify-center shrink-0 font-bold text-[16px]">
                  3
                </div>
                <div>
                  <p className="font-semibold text-slate-900">Sub Category</p>
                  <p className="text-sm text-slate-500">Create a new sub category</p>
                </div>
              </button>

              <button 
                onClick={() => { setIsAddOptionsOpen(false); setViewMode('create-combo'); }}
                className="w-full p-4 flex items-center gap-4 bg-slate-50 hover:bg-slate-100 rounded-xl transition-colors text-left"
              >
                <div className="w-10 h-10 rounded-full bg-[#1E90FF] text-white flex items-center justify-center shrink-0 font-bold text-[16px]">
                  4
                </div>
                <div>
                  <p className="font-semibold text-slate-900">Create Combo</p>
                  <p className="text-sm text-slate-500">Fixed, Choice, or Build your own combo</p>
                </div>
              </button>
            </div>
            <button 
              onClick={() => setIsAddOptionsOpen(false)}
              className="w-full mt-4 py-3 bg-slate-100 text-slate-700 font-semibold rounded-xl active:scale-95 transition-transform"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Add Button */}
      <button 
        onClick={() => setIsAddOptionsOpen(true)}
        className="fixed bottom-[100px] right-6 lg:bottom-10 lg:right-10 z-50 px-6 h-[52px] bg-[#1E90FF] text-[#FFFFFF] rounded-[16px] font-semibold text-[16px] flex items-center justify-center shadow-lg active:scale-[0.98] transition-all"
      >
        <Plus size={20} className="mr-2" />
        Add
      </button>
      </>
      )}

      {mainTab === 'menu' && (
         <ConsumerMenuBuilder items={items} />
      )}
      
      {mainTab === 'addons' && (
         <AddonsManager addonGroups={addonGroups} setAddonGroups={setAddonGroups} />
      )}
    </div>
  );
};

const ConsumerMenuBuilder: React.FC<{ items: MenuItem[] }> = ({ items }) => {
  const [consumerMenus, setConsumerMenus] = useState<{id: string, name: string, itemIds: number[], isActive: boolean}[]>([
    { id: '1', name: 'Our Speciality', itemIds: [1, 2], isActive: true },
    { id: '2', name: 'Must Try', itemIds: [3, 4], isActive: true }
  ]);
  const [editingMenuId, setEditingMenuId] = useState<string | null>(null);
  const [searchQueries, setSearchQueries] = useState<{[key: string]: string}>({});
  
  const [isAddMenuOpen, setIsAddMenuOpen] = useState(false);
  const [newMenuName, setNewMenuName] = useState('');

  const handleAddMenu = () => {
    if (newMenuName.trim()) {
      setConsumerMenus([...consumerMenus, { id: Date.now().toString(), name: newMenuName.trim(), itemIds: [], isActive: true }]);
      setNewMenuName('');
      setIsAddMenuOpen(false);
    }
  };

  const handleDeleteMenu = (e: React.MouseEvent, menuId: string) => {
    e.stopPropagation();
    setConsumerMenus(consumerMenus.filter(m => m.id !== menuId));
  };

  const handleToggleMenuActive = (e: React.MouseEvent, menuId: string) => {
    e.stopPropagation();
    setConsumerMenus(consumerMenus.map(m => m.id === menuId ? {...m, isActive: !m.isActive} : m));
  };

  const handleToggleItem = (menuId: string, itemId: number) => {
    setConsumerMenus(consumerMenus.map(menu => {
      if (menu.id === menuId) {
        const hasItem = menu.itemIds.includes(itemId);
        return {
          ...menu,
          itemIds: hasItem ? menu.itemIds.filter(id => id !== itemId) : [...menu.itemIds, itemId]
        };
      }
      return menu;
    }));
  };

  return (
    <div className="space-y-6 pb-20 fade-in animate-in duration-300">
       <div className="flex items-center justify-between">
         <div>
           <h2 className="text-lg font-bold text-slate-900">Consumer App Menu</h2>
           <p className="text-sm text-slate-500">Design how your menu looks for customers.</p>
         </div>
       </div>

       {consumerMenus.length === 0 ? (
         <div className="text-center py-12 block border border-dashed border-slate-300 rounded-2xl bg-slate-50 relative mt-4">
           <p className="text-slate-500 font-medium">No custom menus created yet.</p>
         </div>
       ) : (
         <div className="space-y-4">
           {consumerMenus.map(menu => {
              const query = searchQueries[menu.id] || '';
              const filteredItems = items.filter(item => item.name.toLowerCase().includes(query.toLowerCase()));
              // Group by category
              const categorizedItems = filteredItems.reduce((acc, item) => {
                const cat = item.category || 'Other';
                if (!acc[cat]) acc[cat] = [];
                acc[cat].push(item);
                return acc;
              }, {} as { [key: string]: MenuItem[] });

              return (
              <div key={menu.id} className={`bg-white border ${menu.isActive ? 'border-slate-200' : 'border-slate-200/60 opacity-60'} rounded-2xl overflow-hidden shadow-sm transition-all duration-300`}>
                 <div 
                   className="p-4 flex items-center justify-between cursor-pointer hover:bg-slate-50 active:bg-slate-100 group"
                   onClick={() => setEditingMenuId(editingMenuId === menu.id ? null : menu.id)}
                 >
                    <div>
                      <h3 className="font-bold text-slate-900">{menu.name}</h3>
                      <p className="text-sm text-slate-500 mt-0.5">{menu.itemIds.length} items selected</p>
                    </div>
                    <div className="flex items-center gap-3">
                      <button
                        onClick={(e) => handleToggleMenuActive(e, menu.id)}
                        className={`w-10 h-6 rounded-full p-1 transition-colors duration-300 relative ${menu.isActive ? 'bg-[#1E90FF]' : 'bg-[#D1D5DB]'}`}
                      >
                        <div className={`w-4 h-4 bg-white rounded-full shadow-sm transform transition-transform duration-300 ${menu.isActive ? 'translate-x-4' : 'translate-x-0'}`} />
                      </button>
                      <button
                        onClick={(e) => handleDeleteMenu(e, menu.id)}
                        className="w-8 h-8 rounded-full bg-slate-50 flex items-center justify-center text-slate-400 hover:text-red-500 hover:bg-red-50 transition-colors"
                      >
                        <Trash2 size={16} />
                      </button>
                      <div className={`w-8 h-8 rounded-full bg-slate-50 flex items-center justify-center transition-transform duration-300 ${editingMenuId === menu.id ? 'rotate-180 text-blue-600' : ''}`}>
                        <ChevronDown className={editingMenuId === menu.id ? "text-blue-600" : "text-slate-500"} size={20} />
                      </div>
                    </div>
                 </div>

                 <AnimatePresence initial={false}>
                   {editingMenuId === menu.id && (
                     <motion.div 
                       initial={{ height: 0, opacity: 0 }}
                       animate={{ height: 'auto', opacity: 1 }}
                       exit={{ height: 0, opacity: 0 }}
                       transition={{ duration: 0.3, ease: "easeInOut" }}
                       className="overflow-hidden"
                     >
                       <div className="p-4 border-t border-slate-100 bg-slate-50/50">
                          <div className="relative mb-4">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                            <input 
                              type="text" 
                              placeholder={`Search items for ${menu.name}...`} 
                              className="w-full bg-white border border-slate-200 rounded-xl pl-10 pr-4 py-2.5 text-sm focus:outline-none focus:border-blue-500 box-border"
                              value={searchQueries[menu.id] || ''}
                              onChange={(e) => setSearchQueries(prev => ({...prev, [menu.id]: e.target.value}))}
                            />
                          </div>

                          <div className="space-y-6 max-h-[360px] overflow-y-auto pr-2 custom-scrollbar">
                            {Object.entries(categorizedItems).length === 0 ? (
                               <p className="text-sm text-slate-500 text-center py-4">No items matched your search.</p>
                            ) : (
                               Object.entries(categorizedItems).map(([category, catItems]) => (
                                 <div key={category}>
                                   <h4 className="text-[11px] font-bold text-slate-400 tracking-wider uppercase mb-3 px-1">{category}</h4>
                                   <div className="space-y-2">
                                     {catItems.map(item => (
                                        <label key={item.id} className="flex items-center gap-3 p-3 bg-white rounded-xl border border-slate-100 cursor-pointer hover:border-blue-200 transition-colors">
                                          <div className={`w-5 h-5 rounded border-2 flex items-center justify-center shrink-0 transition-colors ${menu.itemIds.includes(item.id) ? 'bg-blue-500 border-blue-500' : 'border-slate-300'}`}>
                                            {menu.itemIds.includes(item.id) && <Check size={14} className="text-white" strokeWidth={3} />}
                                          </div>
                                          <div className="flex items-center gap-3 flex-1 overflow-hidden">
                                            <div className="relative shrink-0">
                                              <img src={item.image} alt={item.name} className="w-12 h-12 rounded-lg object-cover bg-slate-100" />
                                              <div className="absolute -top-1.5 -right-1.5 bg-white p-[2px] rounded shadow-sm">
                                                {item.dietaryType === 'Veg' && (
                                                  <div className="w-3 h-3 rounded-[2px] border border-green-500 flex items-center justify-center">
                                                    <div className="w-1.5 h-1.5 rounded-full bg-green-500" />
                                                  </div>
                                                )}
                                                {item.dietaryType === 'Non-Veg' && (
                                                  <div className="w-3 h-3 rounded-[2px] border border-red-500 flex items-center justify-center">
                                                    <div className="w-0 h-0 border-l-[2px] border-r-[2px] border-b-[3px] border-l-transparent border-r-transparent border-b-red-500" />
                                                  </div>
                                                )}
                                                {item.dietaryType === 'Egg' && (
                                                  <div className="w-3 h-3 rounded-[2px] border border-yellow-500 flex items-center justify-center">
                                                    <div className="w-1.5 h-1.5 rounded-full bg-yellow-500" />
                                                  </div>
                                                )}
                                              </div>
                                            </div>
                                            <div className="min-w-0 flex-1">
                                              <p className="text-sm font-semibold text-slate-900 truncate">{item.name}</p>
                                              <p className="text-xs text-slate-500 font-medium mt-0.5">₹{item.price}</p>
                                            </div>
                                          </div>
                                          <input type="checkbox" className="hidden" checked={menu.itemIds.includes(item.id)} onChange={() => handleToggleItem(menu.id, item.id)} />
                                        </label>
                                     ))}
                                   </div>
                                 </div>
                               ))
                            )}
                          </div>
                       </div>
                     </motion.div>
                   )}
                 </AnimatePresence>
              </div>
           )})}
         </div>
       )}

       {/* Floating Add Menu Button */}
       <button 
         onClick={() => setIsAddMenuOpen(true)}
         className="fixed bottom-[100px] right-6 lg:bottom-10 lg:right-10 z-50 px-6 h-[52px] bg-[#1E90FF] text-[#FFFFFF] rounded-[16px] font-semibold text-[16px] flex items-center justify-center shadow-lg active:scale-[0.98] transition-all"
       >
         <Plus size={20} className="mr-2" />
         Add Menu
       </button>

       {isAddMenuOpen && (
        <div className="fixed inset-0 z-[200] flex items-end justify-center bg-black/50 sm:items-center transition-opacity" onClick={() => setIsAddMenuOpen(false)}>
          <div className="w-full bg-[#FFFFFF] rounded-t-2xl sm:rounded-2xl sm:max-w-sm p-6 animate-in slide-in-from-bottom-full sm:slide-in-from-bottom-0 sm:fade-in duration-300" onClick={e => e.stopPropagation()}>
            <h3 className="text-lg font-bold text-slate-900 mb-4">Create Menu Section</h3>
            
            <div className="space-y-2 mb-6">
              <label className="text-[14px] font-medium text-[#374151]">Menu Title</label>
              <input 
                type="text" 
                placeholder="e.g. Our Speciality" 
                value={newMenuName}
                onChange={(e) => setNewMenuName(e.target.value)}
                autoFocus
                className="w-full h-[44px] bg-[#FFFFFF] border border-[#E5E7EB] rounded-[10px] px-[12px] text-[14px] text-[#111827] focus:outline-none focus:border-[#1E90FF] transition-colors"
                onKeyDown={(e) => {
                  if (e.key === 'Enter') handleAddMenu();
                }}
              />
            </div>
            
            <div className="flex gap-3">
              <button 
                onClick={() => setIsAddMenuOpen(false)}
                className="flex-1 py-3 px-4 bg-slate-100 text-slate-700 font-semibold rounded-xl active:scale-95 transition-transform"
              >
                Cancel
              </button>
              <button 
                onClick={handleAddMenu}
                disabled={!newMenuName.trim()}
                className="flex-1 py-3 px-4 bg-[#1E90FF] text-white font-semibold rounded-xl disabled:opacity-50 active:scale-95 transition-all"
              >
                Create
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

const AddonsManager: React.FC<{
  addonGroups: {id: string, name: string, type?: 'addon' | 'topping', isRequired?: boolean, isActive: boolean, addons: {id: string, name: string, price: string}[]}[],
  setAddonGroups: React.Dispatch<React.SetStateAction<{id: string, name: string, type?: 'addon' | 'topping', isRequired?: boolean, isActive: boolean, addons: {id: string, name: string, price: string}[]}[]>>
}> = ({ addonGroups, setAddonGroups }) => {
  const [editingGroupId, setEditingGroupId] = useState<string | null>(null);
  
  const [isAddGroupOpen, setIsAddGroupOpen] = useState(false);
  const [newGroupName, setNewGroupName] = useState('');
  const [newGroupType, setNewGroupType] = useState<'addon' | 'topping'>('addon');
  const [newGroupRequired, setNewGroupRequired] = useState(false);
  
  const [newAddonName, setNewAddonName] = useState('');
  const [newAddonPrice, setNewAddonPrice] = useState('');

  const handleAddGroup = () => {
    if (newGroupName.trim()) {
      setAddonGroups([...addonGroups, { 
        id: Date.now().toString(), 
        name: newGroupName.trim(), 
        type: newGroupType, 
        isRequired: newGroupRequired, 
        isActive: true, 
        addons: [] 
      }]);
      setNewGroupName('');
      setNewGroupType('addon');
      setNewGroupRequired(false);
      setIsAddGroupOpen(false);
    }
  };

  const handleDeleteGroup = (e: React.MouseEvent, groupId: string) => {
    e.stopPropagation();
    setAddonGroups(addonGroups.filter(g => g.id !== groupId));
  };

  const handleToggleGroupActive = (e: React.MouseEvent, groupId: string) => {
    e.stopPropagation();
    setAddonGroups(addonGroups.map(g => g.id === groupId ? {...g, isActive: !g.isActive} : g));
  };

  const handleAddAddon = (groupId: string) => {
    if (newAddonName.trim()) {
      setAddonGroups(addonGroups.map(g => {
        if (g.id === groupId) {
          return {
            ...g,
            addons: [...g.addons, { id: Date.now().toString(), name: newAddonName.trim(), price: newAddonPrice || '0' }]
          };
        }
        return g;
      }));
      setNewAddonName('');
      setNewAddonPrice('');
    }
  };

  const handleRemoveAddon = (groupId: string, addonId: string) => {
    setAddonGroups(addonGroups.map(g => {
      if (g.id === groupId) {
        return {
          ...g,
          addons: g.addons.filter(a => a.id !== addonId)
        };
      }
      return g;
    }));
  };

  return (
    <div className="space-y-6 pb-20 fade-in animate-in duration-300">
       <div className="flex items-center justify-between">
         <div>
           <h2 className="text-lg font-bold text-slate-900">Add-ons Management</h2>
           <p className="text-sm text-slate-500">Create add-on categories like Bread Type, Extras, etc.</p>
         </div>
       </div>

       {addonGroups.length === 0 ? (
         <div className="text-center py-12 block border border-dashed border-slate-300 rounded-2xl bg-slate-50 relative mt-4">
           <p className="text-slate-500 font-medium">No add-on groups created yet.</p>
         </div>
       ) : (
         <div className="space-y-4">
           {addonGroups.map(group => (
              <div key={group.id} className={`bg-white border ${group.isActive ? 'border-slate-200' : 'border-slate-200/60 opacity-60'} rounded-2xl overflow-hidden shadow-sm transition-all duration-300`}>
                 <div 
                   className="p-4 flex items-center justify-between cursor-pointer hover:bg-slate-50 active:bg-slate-100 group-btn"
                   onClick={() => setEditingGroupId(editingGroupId === group.id ? null : group.id)}
                 >
                    <div>
                      <h3 className="font-bold text-slate-900">{group.name}</h3>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-xs text-slate-500 bg-slate-100 px-2 py-0.5 rounded-md capitalize">{group.type || 'addon'}</span>
                        <span className={`text-xs px-2 py-0.5 rounded-md font-medium ${group.isRequired ? 'bg-amber-100 text-amber-700' : 'bg-slate-100 text-slate-500'}`}>
                          {group.isRequired ? 'Mandatory' : 'Optional'}
                        </span>
                        <span className="text-sm text-slate-500">· {group.addons.length} items</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <button
                        onClick={(e) => handleToggleGroupActive(e, group.id)}
                        className={`w-10 h-6 rounded-full p-1 transition-colors duration-300 relative ${group.isActive ? 'bg-[#1E90FF]' : 'bg-[#D1D5DB]'}`}
                      >
                        <div className={`w-4 h-4 bg-white rounded-full shadow-sm transform transition-transform duration-300 ${group.isActive ? 'translate-x-4' : 'translate-x-0'}`} />
                      </button>
                      <button
                        onClick={(e) => handleDeleteGroup(e, group.id)}
                        className="w-8 h-8 rounded-full bg-slate-50 flex items-center justify-center text-slate-400 hover:text-red-500 hover:bg-red-50 transition-colors"
                      >
                        <Trash2 size={16} />
                      </button>
                      <div className={`w-8 h-8 rounded-full bg-slate-50 flex items-center justify-center transition-transform duration-300 ${editingGroupId === group.id ? 'rotate-180 text-blue-600' : ''}`}>
                        <ChevronDown className={editingGroupId === group.id ? "text-blue-600" : "text-slate-500"} size={20} />
                      </div>
                    </div>
                 </div>

                 <AnimatePresence initial={false}>
                   {editingGroupId === group.id && (
                     <motion.div 
                       initial={{ height: 0, opacity: 0 }}
                       animate={{ height: 'auto', opacity: 1 }}
                       exit={{ height: 0, opacity: 0 }}
                       transition={{ duration: 0.3, ease: "easeInOut" }}
                       className="overflow-hidden"
                     >
                       <div className="p-4 border-t border-slate-100 bg-slate-50/50">
                          
                          <div className="flex gap-2 mb-4">
                            <input
                              type="text"
                              value={newAddonName}
                              onChange={(e) => setNewAddonName(e.target.value)}
                              placeholder="Add-on Name (e.g. Cheese)"
                              className="flex-1 px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:border-blue-500"
                            />
                            <div className="relative w-24">
                              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 text-sm">₹</span>
                              <input
                                type="number"
                                value={newAddonPrice}
                                onChange={(e) => setNewAddonPrice(e.target.value)}
                                placeholder="Price"
                                className="w-full pl-7 pr-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:border-blue-500"
                              />
                            </div>
                            <button
                              onClick={() => handleAddAddon(group.id)}
                              disabled={!newAddonName.trim()}
                              className="px-4 py-2 bg-blue-600 text-white text-sm font-semibold rounded-lg disabled:opacity-50"
                            >
                              Add
                            </button>
                          </div>

                          <div className="space-y-2 max-h-80 overflow-y-auto pr-2 custom-scrollbar">
                            {group.addons.map(addon => (
                               <div key={addon.id} className="flex items-center justify-between p-3 bg-white rounded-xl border border-slate-100">
                                 <div>
                                   <p className="text-sm font-semibold text-slate-900">{addon.name}</p>
                                   <p className="text-xs text-slate-500 font-medium mt-0.5">₹{addon.price}</p>
                                 </div>
                                 <button
                                   onClick={() => handleRemoveAddon(group.id, addon.id)}
                                   className="w-8 h-8 rounded-full bg-slate-50 flex items-center justify-center text-slate-400 hover:text-red-500 hover:bg-red-50 transition-colors"
                                 >
                                   <Trash2 size={16} />
                                 </button>
                               </div>
                            ))}
                            {group.addons.length === 0 && (
                               <p className="text-sm text-slate-500 text-center py-4">No add-ons added yet.</p>
                            )}
                          </div>
                       </div>
                     </motion.div>
                   )}
                 </AnimatePresence>
              </div>
           ))}
         </div>
       )}

       {/* Floating Add Group Button */}
       <button 
         onClick={() => setIsAddGroupOpen(true)}
         className="fixed bottom-[100px] right-6 lg:bottom-10 lg:right-10 z-50 px-6 h-[52px] bg-[#1E90FF] text-[#FFFFFF] rounded-[16px] font-semibold text-[16px] flex items-center justify-center shadow-lg active:scale-[0.98] transition-all"
       >
         <Plus size={20} className="mr-2" />
         Add Group
       </button>

       {isAddGroupOpen && (
        <div className="fixed inset-0 z-[200] flex items-end justify-center bg-black/50 sm:items-center transition-opacity" onClick={() => setIsAddGroupOpen(false)}>
          <div className="w-full bg-[#FFFFFF] rounded-t-2xl sm:rounded-2xl sm:max-w-sm p-6 animate-in slide-in-from-bottom-full sm:slide-in-from-bottom-0 sm:fade-in duration-300" onClick={e => e.stopPropagation()}>
            <h3 className="text-lg font-bold text-slate-900 mb-4">Create Add-on Group</h3>
            
            <div className="space-y-4 mb-6">
              <div className="space-y-2">
                <label className="text-[14px] font-medium text-[#374151]">Group Name</label>
                <input 
                  type="text" 
                  placeholder="e.g. Bread Type, Extras" 
                  value={newGroupName}
                  onChange={(e) => setNewGroupName(e.target.value)}
                  autoFocus
                  className="w-full h-[44px] bg-[#FFFFFF] border border-[#E5E7EB] rounded-[10px] px-[12px] text-[14px] text-[#111827] focus:outline-none focus:border-[#1E90FF] transition-colors"
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') handleAddGroup();
                  }}
                />
              </div>

              <div className="space-y-2">
                <label className="text-[14px] font-medium text-[#374151]">Show As</label>
                <div className="grid grid-cols-2 gap-2">
                  <button 
                    onClick={() => setNewGroupType('addon')}
                    className={`h-10 rounded-[10px] text-sm font-semibold transition-colors border ${newGroupType === 'addon' ? 'bg-[#1E90FF] text-white border-[#1E90FF]' : 'bg-slate-50 text-slate-600 border-slate-200'}`}
                  >
                    Add-ons
                  </button>
                  <button 
                    onClick={() => setNewGroupType('topping')}
                    className={`h-10 rounded-[10px] text-sm font-semibold transition-colors border ${newGroupType === 'topping' ? 'bg-[#1E90FF] text-white border-[#1E90FF]' : 'bg-slate-50 text-slate-600 border-slate-200'}`}
                  >
                    Toppings
                  </button>
                </div>
              </div>
            </div>
            
            <div className="flex gap-3">
              <button 
                onClick={() => setIsAddGroupOpen(false)}
                className="flex-1 py-3 px-4 bg-slate-100 text-slate-700 font-semibold rounded-xl active:scale-95 transition-transform"
              >
                Cancel
              </button>
              <button 
                onClick={handleAddGroup}
                disabled={!newGroupName.trim()}
                className="flex-1 py-3 px-4 bg-[#1E90FF] text-white font-semibold rounded-xl disabled:opacity-50 active:scale-95 transition-all"
              >
                Create
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

const MOCK_INVENTORY = [
  { id: 'inv_1', name: 'Thumbs Up 250ml', price: 40, stock: 120 },
  { id: 'inv_2', name: 'Sprite 250ml', price: 40, stock: 95 },
  { id: 'inv_3', name: 'Mineral Water 1L', price: 20, stock: 200 },
  { id: 'inv_4', name: 'Lays Classic Salted 50g', price: 20, stock: 45 },
  { id: 'inv_5', name: 'Oreo Biscuits', price: 30, stock: 60 }
];

const CreateItemView: React.FC<{ 
  onBack: () => void, 
  categories: string[],
  subCategories: string[],
  initialItem?: MenuItem | null,
  onSave: (item: any) => void,
  allItems: MenuItem[],
  addonGroups: {id: string, name: string, type?: 'addon' | 'topping', isRequired?: boolean, isActive: boolean, addons: {id: string, name: string, price: string}[]}[]
}> = ({ onBack, categories, subCategories, initialItem, onSave, allItems, addonGroups }) => {
  const [image, setImage] = useState<string | null>(initialItem?.image || null);
  const [isCropping, setIsCropping] = useState(false);
  const [name, setName] = useState(initialItem?.name || '');
  const [description, setDescription] = useState(initialItem?.description || '');
  const [dietaryType, setDietaryType] = useState<'Veg' | 'Non-Veg' | 'Egg'>(initialItem?.dietaryType || 'Veg');
  const [selectedTags, setSelectedTags] = useState<string[]>(initialItem?.badges || []);
  const [pricingType, setPricingType] = useState<'simple' | 'variety'>('simple');
  const [price, setPrice] = useState(initialItem?.price?.toString() || '');
  const [variants, setVariants] = useState<any[]>([]);
  const [isAvailable, setIsAvailable] = useState(initialItem?.isAvailable ?? true);
  const [showSuccess, setShowSuccess] = useState(false);
  const [error, setError] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [openVariantDropdown, setOpenVariantDropdown] = useState<string | null>(null);

  // New states
  const [gstCategory, setGstCategory] = useState<'Freshly Prepared Item' | 'MRP Based Item'>('Freshly Prepared Item');
  const [gstIncluded, setGstIncluded] = useState(true);
  const [foodCategory, setFoodCategory] = useState(initialItem?.category || categories[0] || 'Pizza');
  const [subCategory, setSubCategory] = useState(initialItem?.subCategory || subCategories[0] || 'Pizza');
  const [enableAddons, setEnableAddons] = useState(initialItem?.allowedAddons && initialItem.allowedAddons.length > 0 ? true : false);
  const [selectedAddons, setSelectedAddons] = useState<string[]>(initialItem?.allowedAddons || []);
  const [requiredAddonGroups, setRequiredAddonGroups] = useState<string[]>(initialItem?.requiredAddonGroups || []);
  const [addonGroupLimits, setAddonGroupLimits] = useState<Record<string, number>>(initialItem?.addonGroupLimits || {});
  
  const [enableToppings, setEnableToppings] = useState(initialItem?.allowedToppings && initialItem.allowedToppings.length > 0 ? true : false);
  const [selectedToppings, setSelectedToppings] = useState<string[]>(initialItem?.allowedToppings || []);

  const [exactStock, setExactStock] = useState<string>(initialItem?.exactStock?.toString() || '');
  const [enableScheduledMenu, setEnableScheduledMenu] = useState(initialItem?.scheduledMenus?.enabled || false);
  const [scheduleType, setScheduleType] = useState(initialItem?.scheduledMenus?.type || 'Breakfast');
  const [enableComboBuilder, setEnableComboBuilder] = useState(initialItem?.comboItems && initialItem.comboItems.length > 0 ? true : false);
  const [comboSelectedItems, setComboSelectedItems] = useState<string[]>(initialItem?.comboItems || []);

  const [preparationTime, setPreparationTime] = useState<string>(initialItem?.preparationTime?.toString() || '');
  const [competitorPrice, setCompetitorPrice] = useState<string>(initialItem?.competitorPrice?.toString() || '');
  const [selectedAllergens, setSelectedAllergens] = useState<string[]>(initialItem?.allergens || []);
  const [selectedDietTags, setSelectedDietTags] = useState<string[]>(initialItem?.dietTags || []);

  const availableAddons = allItems.filter(item => item.category !== 'Toppings').map(item => item.name);
  const availableToppings = allItems.filter(item => item.category === 'Toppings').map(item => item.name);

  const toggleAddon = (addon: string) => {
    if (selectedAddons.includes(addon)) {
      setSelectedAddons(selectedAddons.filter(a => a !== addon));
    } else {
      setSelectedAddons([...selectedAddons, addon]);
    }
  };

  const toggleTopping = (topping: string) => {
    if (selectedToppings.includes(topping)) {
      setSelectedToppings(selectedToppings.filter(t => t !== topping));
    } else {
      setSelectedToppings([...selectedToppings, topping]);
    }
  };

  const [enableServeInfo, setEnableServeInfo] = useState(false);
  const [servingSize, setServingSize] = useState('1-2');
  const [piecesInfo, setPiecesInfo] = useState<{name: string, count: string}[]>([]);
  const [availableFor, setAvailableFor] = useState<string[]>(['Delivery', 'Takeaway', 'Dine-In']);
  const [customTagInput, setCustomTagInput] = useState('');

  const [inventorySearchQuery, setInventorySearchQuery] = useState('');
  const [showInventoryDropdown, setShowInventoryDropdown] = useState(false);
  
  const filteredInventory = MOCK_INVENTORY.filter(item => item.name.toLowerCase().includes(inventorySearchQuery.toLowerCase()));

  const handleSelectInventoryItem = (item: any) => {
    setName(item.name);
    setPrice(item.price.toString());
    setExactStock(item.stock.toString());
    setInventorySearchQuery(item.name);
    setShowInventoryDropdown(false);
  };

  const servingSizeOptions = ['0-1', '1-2', '2-3', '3-4', '4-5', '5-6', '6-7', '7-8', '8-9', '9-10'];

  const tagsList = [
    'Best Seller', 'Spicy', 'Sugar Free', 'Chef Special', 'New', 
    'Recommended', 'Healthy', 'Popular', 'Kids Favourite', 'Limited Offer'
  ];

  const handleImageUpload = () => {
    // Simulate image picker
    setImage('https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=500&q=80');
    setIsCropping(true);
  };

  const handleCropComplete = () => {
    setIsCropping(false);
  };

  const handleSave = () => {
    setError('');
    if (!image && foodCategory !== 'Toppings') {
      setError('Food image is required');
      return;
    }
    if (!name.trim()) {
      setError('Food name is required');
      return;
    }
    
    setIsSaving(true);

    // If it's a topping, we don't need all the other fields
    if (foodCategory === 'Toppings') {
      setTimeout(() => {
        setIsSaving(false);
        onSave({
          name,
          category: foodCategory,
          subCategory,
          price: pricingType === 'simple' ? parseFloat(price) : 0,
          isAvailable,
          isVeg: dietaryType === 'Veg',
          dietaryType,
          image: image || '',
          description: '',
          badges: [],
          allowedToppings: [],
          allowedAddons: []
        });
        setShowSuccess(true);
        setTimeout(() => {
          setShowSuccess(false);
          onBack();
        }, 1500);
      }, 1000);
      return;
    }

    if (pricingType === 'simple' && !price) {
      setError('Price is required');
      setIsSaving(false);
      return;
    }
    if (pricingType === 'variety' && variants.length === 0) {
      setError('At least one variant is required');
      setIsSaving(false);
      return;
    }

    setTimeout(() => {
      setIsSaving(false);
      setShowSuccess(true);
      setTimeout(() => {
        onSave({
          name,
          category: foodCategory,
          subCategory,
          description,
          price: pricingType === 'simple' ? parseFloat(price) : parseFloat(variants[0]?.price || 0),
          isVeg: dietaryType === 'Veg',
          isAvailable,
          dietaryType,
          badges: selectedTags,
          image,
          allowedToppings: enableToppings ? selectedToppings : [],
          allowedAddons: enableAddons ? selectedAddons : [],
          requiredAddonGroups: requiredAddonGroups,
          addonGroupLimits: addonGroupLimits,
          exactStock: gstCategory === 'MRP Based Item' && exactStock ? parseInt(exactStock, 10) : undefined,
          scheduledMenus: enableScheduledMenu ? { enabled: true, type: scheduleType } : undefined,
          comboItems: enableComboBuilder ? comboSelectedItems : undefined,
          preparationTime: preparationTime ? parseInt(preparationTime, 10) : undefined,
          competitorPrice: competitorPrice ? parseFloat(competitorPrice) : undefined,
          allergens: selectedAllergens,
          dietTags: selectedDietTags,
          variants: pricingType === 'variety' ? variants : undefined
        });
      }, 1500);
    }, 1000);
  };

  const toggleTag = (tag: string) => {
    setSelectedTags(prev => prev.includes(tag) ? prev.filter(t => t !== tag) : [...prev, tag]);
  };

  const addVariant = () => {
    setVariants([...variants, { id: Date.now().toString(), name: '', price: '' }]);
  };

  const updateVariant = (id: string, field: 'name' | 'price', value: string) => {
    setVariants(variants.map(v => v.id === id ? { ...v, [field]: value } : v));
  };

  const toggleVariantAddon = (variantId: string, addonId: string) => {
    setVariants(variants.map(v => {
      if (v.id === variantId) {
        const allowedAddons = v.allowedAddons || [];
        const newAddons = allowedAddons.includes(addonId) ? allowedAddons.filter((id: string) => id !== addonId) : [...allowedAddons, addonId];
        return {
          ...v,
          allowedAddons: newAddons
        };
      }
      return v;
    }));
  };

  const removeVariant = (id: string) => {
    setVariants(variants.filter(v => v.id !== id));
  };

  const toggleAvailableFor = (option: string) => {
    setAvailableFor(prev => prev.includes(option) ? prev.filter(o => o !== option) : [...prev, option]);
  };

  const addPieceInfo = () => {
    setPiecesInfo([...piecesInfo, { name: '', count: '' }]);
  };

  const updatePieceInfo = (index: number, field: 'name' | 'count', value: string) => {
    const newPieces = [...piecesInfo];
    newPieces[index][field] = value;
    setPiecesInfo(newPieces);
  };

  const removePieceInfo = (index: number) => {
    setPiecesInfo(piecesInfo.filter((_, i) => i !== index));
  };

  const handleAddCustomTag = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && customTagInput.trim()) {
      e.preventDefault();
      if (!selectedTags.includes(customTagInput.trim())) {
        setSelectedTags([...selectedTags, customTagInput.trim()]);
      }
      setCustomTagInput('');
    }
  };

  const calculateFinalPrice = (basePrice: string) => {
    if (!basePrice) return 0;
    const numPrice = parseFloat(basePrice);
    if (isNaN(numPrice)) return 0;
    return gstIncluded ? numPrice : numPrice + (numPrice * 0.05);
  };

  if (isCropping) {
    return (
      <div className="fixed inset-0 z-[600] bg-black flex flex-col">
        <div className="flex-1 flex items-center justify-center p-4">
          <div className="w-full aspect-square bg-slate-800 relative overflow-hidden">
            <img src={image!} alt="Crop preview" className="w-full h-full object-cover opacity-50" />
            <div className="absolute inset-4 border-2 border-white shadow-[0_0_0_9999px_rgba(0,0,0,0.5)]"></div>
          </div>
        </div>
        <div className="p-6 flex gap-4 bg-black">
          <button onClick={() => setIsCropping(false)} className="flex-1 h-[52px] bg-slate-50 text-slate-700 rounded-[16px] font-semibold text-[16px] flex items-center justify-center active:scale-[0.98] transition-all">Cancel</button>
        <button onClick={handleCropComplete} className="flex-1 h-[52px] bg-[#1E90FF] text-[#FFFFFF] rounded-[16px] font-semibold text-[16px] flex items-center justify-center active:scale-[0.98] transition-all">Crop Image</button>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-[500] flex items-end justify-center bg-black/50 sm:items-center transition-opacity" onClick={onBack}>
      <div className="w-full h-[90vh] bg-[#FFFFFF] rounded-t-2xl sm:rounded-2xl sm:max-w-2xl flex flex-col animate-in slide-in-from-bottom-full sm:slide-in-from-bottom-0 sm:fade-in duration-300 relative overflow-hidden" onClick={e => e.stopPropagation()}>
      {showSuccess && (
        <div className="absolute top-4 left-4 right-4 z-50 bg-emerald-50 border border-emerald-200 text-emerald-700 px-4 py-3 rounded-xl flex items-center gap-2 shadow-lg animate-in slide-in-from-top">
          <CheckCircle2 size={20} />
          <span className="font-medium text-sm">Food item added successfully.</span>
        </div>
      )}

      <div className="px-4 py-4 flex items-center gap-3 bg-[#FFFFFF] border-b border-slate-100 sticky top-0 z-40 shrink-0">
        <button onClick={onBack} className="w-10 h-10 flex items-center justify-center text-slate-700 active:bg-slate-50 rounded-full transition-colors">
          <ArrowLeft size={24} />
        </button>
        <h2 className="text-[20px] font-[600] text-slate-900">Add Food Item</h2>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-6 pb-32 lg:pb-6">
        {error && (
          <div className="bg-rose-50 text-rose-600 p-3 rounded-xl text-sm font-medium flex items-center gap-2">
            <AlertCircle size={16} /> {error}
          </div>
        )}

        {/* Image Upload Section */}
        {foodCategory !== 'Toppings' && (
          <div 
            onClick={handleImageUpload}
            className="h-[180px] rounded-[16px] border border-dashed border-[#D1D5DB] bg-[#F9FAFB] flex flex-col items-center justify-center gap-3 relative overflow-hidden active:bg-slate-50 transition-colors"
          >
            {image ? (
              <img src={image} alt="Preview" className="w-full h-full object-cover" />
            ) : (
              <>
                <div className="w-12 h-12 bg-[#FFFFFF] rounded-full shadow-sm flex items-center justify-center text-slate-400">
                  <ImageIcon size={24} />
                </div>
                <span className="text-sm font-medium text-slate-600">Upload Food Image</span>
              </>
            )}
          </div>
        )}

        {/* Food Item Name */}
        <div className="space-y-2">
          <label className="text-sm font-medium text-slate-700">{foodCategory === 'Toppings' ? 'Topping Name' : 'Food Name'}</label>
          <input 
            type="text" 
            placeholder={foodCategory === 'Toppings' ? 'Enter topping name' : 'Enter food item name'} 
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full h-[44px] rounded-[10px] border border-[#E5E7EB] px-[12px] text-sm focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all"
          />
        </div>

        {foodCategory !== 'Toppings' && (
          <>
            {/* Description */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700">Description</label>
              <textarea 
                placeholder="Write a short description about the dish" 
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full h-[90px] rounded-[10px] border border-[#E5E7EB] p-[12px] text-sm focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all resize-none"
              />
            </div>
          </>
        )}

        {/* Main Category */}
        <div className="space-y-2">
          <label className="text-sm font-medium text-slate-700">Main Category</label>
          <select
            value={foodCategory}
            onChange={(e) => setFoodCategory(e.target.value)}
            className="w-full h-[44px] rounded-[10px] border border-[#E5E7EB] px-[12px] text-sm focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all bg-[#FFFFFF]"
          >
            {categories.map(cat => (
              <option key={cat} value={cat}>{cat}</option>
            ))}
          </select>
        </div>

        {/* Sub Category */}
        {foodCategory !== 'Toppings' && (
          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-700">Sub Category</label>
            <select
              value={subCategory}
              onChange={(e) => setSubCategory(e.target.value)}
              className="w-full h-[44px] rounded-[10px] border border-[#E5E7EB] px-[12px] text-sm focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all bg-[#FFFFFF]"
            >
              {subCategories.map(cat => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
          </div>
        )}

        {foodCategory !== 'Toppings' && (
          <>
            {/* GST Category */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700">GST Category</label>
              <div className="flex gap-4">
                <label className="flex items-center gap-2 text-sm font-medium text-slate-700 cursor-pointer">
                  <input 
                    type="radio" 
                    checked={gstCategory === 'Freshly Prepared Item'} 
                    onChange={() => setGstCategory('Freshly Prepared Item')}
                    className="w-4 h-4 text-blue-600 focus:ring-blue-500 border-gray-300"
                  />
                  Freshly Prepared Item
                </label>
                <label className="flex items-center gap-2 text-sm font-medium text-slate-700 cursor-pointer">
                  <input 
                    type="radio" 
                    checked={gstCategory === 'MRP Based Item'} 
                    onChange={() => setGstCategory('MRP Based Item')}
                    className="w-4 h-4 text-blue-600 focus:ring-blue-500 border-gray-300"
                  />
                  MRP Based Item
                </label>
              </div>
            </div>

            {gstCategory === 'MRP Based Item' && (
              <div className="space-y-4 pt-4 border-t border-slate-100 relative">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-700">Link Inventory Item</label>
                  <p className="text-[11px] text-slate-500 mb-2">Search item to fetch stock and price automatically</p>
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                    <input 
                      type="text"
                      className="w-full h-[44px] bg-[#F8FAFC] border border-[#E5E7EB] rounded-[10px] pl-[36px] pr-[12px] text-[14px] text-[#111827] focus:outline-none focus:border-[#1E90FF] focus:bg-[#FFFFFF] transition-colors"
                      placeholder="Search inventory..."
                      value={inventorySearchQuery}
                      onChange={(e) => {
                        setInventorySearchQuery(e.target.value);
                        setShowInventoryDropdown(true);
                      }}
                      onFocus={() => setShowInventoryDropdown(true)}
                    />
                    {showInventoryDropdown && inventorySearchQuery && filteredInventory.length > 0 && (
                      <div className="absolute top-full mt-1 w-full bg-[#FFFFFF] border border-[#E5E7EB] rounded-xl shadow-lg z-50 max-h-[200px] overflow-y-auto">
                        {filteredInventory.map(item => (
                          <div 
                            key={item.id}
                            className="p-3 hover:bg-slate-50 border-b border-slate-100 last:border-0 cursor-pointer transition-colors"
                            onClick={() => handleSelectInventoryItem(item)}
                          >
                            <div className="flex justify-between items-center">
                              <span className="text-[14px] font-medium text-slate-900">{item.name}</span>
                              <span className="text-[13px] font-bold text-[#1E90FF]">₹{item.price}</span>
                            </div>
                            <span className="text-[12px] text-slate-500">Stock: {item.stock}</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
                <div className="flex items-center justify-between py-2">
                  <div>
                    <label className="text-sm font-medium text-slate-700">Exact Stock Tracking</label>
                    <p className="text-[11px] text-slate-500">Fetched directly from Inventory Management</p>
                  </div>
                  <input 
                    type="number" 
                    placeholder="Stock"
                    value={exactStock}
                    onChange={(e) => setExactStock(e.target.value)}
                    className="w-24 h-[36px] rounded-lg border border-slate-200 px-3 text-sm focus:outline-none focus:border-blue-500 bg-slate-50"
                  />
                </div>
              </div>
            )}

            {/* Food Type Selection */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700">Food Type</label>
              <div className="flex gap-3">
                <button 
                  onClick={() => setDietaryType('Veg')}
                  className={`flex-1 h-[44px] rounded-[10px] border flex items-center justify-center gap-2 text-sm font-medium transition-colors ${dietaryType === 'Veg' ? 'border-green-500 bg-green-50 text-green-700' : 'border-[#E5E7EB] text-slate-600'}`}
                >
                  <div className="w-3 h-3 rounded-sm border border-green-600 flex items-center justify-center"><div className="w-1.5 h-1.5 rounded-full bg-green-600" /></div>
                  Veg
                </button>
                <button 
                  onClick={() => setDietaryType('Non-Veg')}
                  className={`flex-1 h-[44px] rounded-[10px] border flex items-center justify-center gap-2 text-sm font-medium transition-colors ${dietaryType === 'Non-Veg' ? 'border-red-500 bg-red-50 text-red-700' : 'border-[#E5E7EB] text-slate-600'}`}
                >
                  <div className="w-3 h-3 rounded-sm border border-red-600 flex items-center justify-center"><div className="w-0 h-0 border-l-[3px] border-r-[3px] border-b-[5px] border-l-transparent border-r-transparent border-b-red-600" /></div>
                  Non-Veg
                </button>
                <button 
                  onClick={() => setDietaryType('Egg')}
                  className={`flex-1 h-[44px] rounded-[10px] border flex items-center justify-center gap-2 text-sm font-medium transition-colors ${dietaryType === 'Egg' ? 'border-yellow-500 bg-yellow-50 text-yellow-700' : 'border-[#E5E7EB] text-slate-600'}`}
                >
                  <div className="w-3 h-3 rounded-sm border border-yellow-500 flex items-center justify-center"><div className="w-1.5 h-1.5 rounded-full bg-yellow-500" /></div>
                  Egg
                </button>
              </div>
            </div>

            {/* Food Tags */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700">Food Tags</label>
              <input 
                type="text" 
                placeholder="Type a tag and press Enter" 
                value={customTagInput}
                onChange={(e) => setCustomTagInput(e.target.value)}
                onKeyDown={handleAddCustomTag}
                className="w-full h-[44px] rounded-[10px] border border-[#E5E7EB] px-[12px] text-sm focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all mb-2"
              />
              <div className="flex flex-wrap gap-2">
                {[...new Set([...tagsList, ...selectedTags])].map(tag => (
                  <button
                    key={tag}
                    onClick={() => toggleTag(tag)}
                    className={`h-[32px] px-4 rounded-[16px] border text-sm transition-colors ${
                      selectedTags.includes(tag) 
                        ? 'bg-[#1E90FF] border-[#1E90FF] text-white' 
                        : 'bg-[#FFFFFF] border-[#E5E7EB] text-slate-600'
                    }`}
                  >
                    {tag}
                  </button>
                ))}
              </div>
            </div>
          </>
        )}

        {/* Pricing Section */}
        <div className="space-y-4">
          <h3 className="text-base font-semibold text-slate-900">Pricing</h3>
          
          {foodCategory !== 'Toppings' && (
            <div className="flex gap-4">
              <label className="flex items-center gap-2 text-sm font-medium text-slate-700 cursor-pointer">
                <input 
                  type="radio" 
                  checked={pricingType === 'simple'} 
                  onChange={() => setPricingType('simple')}
                  className="w-4 h-4 text-blue-600 focus:ring-blue-500 border-gray-300"
                />
                Simple Price
              </label>
              <label className="flex items-center gap-2 text-sm font-medium text-slate-700 cursor-pointer">
                <input 
                  type="radio" 
                  checked={pricingType === 'variety'} 
                  onChange={() => setPricingType('variety')}
                  className="w-4 h-4 text-blue-600 focus:ring-blue-500 border-gray-300"
                />
                Price by Variety
              </label>
            </div>
          )}

          {pricingType === 'simple' || foodCategory === 'Toppings' ? (
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700">Price</label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500">₹</span>
                <input 
                  type="number" 
                  placeholder="250" 
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                  className="w-full h-[44px] rounded-[10px] border border-[#E5E7EB] pl-8 pr-[12px] text-sm focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all"
                />
              </div>
              <div className="flex items-center gap-2 mt-2">
                <input 
                  type="checkbox" 
                  checked={gstIncluded} 
                  onChange={(e) => setGstIncluded(e.target.checked)}
                  className="w-4 h-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500"
                />
                <label className="text-sm text-slate-600">GST Included</label>
              </div>
              {price && (
                <p className="text-sm text-slate-500 mt-1">
                  Final Price: ₹{calculateFinalPrice(price).toFixed(2)} (incl. GST)
                </p>
              )}
            </div>
          ) : (
            <div className="space-y-3">
              <div className="flex text-sm font-medium text-slate-500 px-1">
                <div className="flex-1">Variant Name</div>
                <div className="w-24">Price</div>
                <div className="w-8"></div>
              </div>
              
              {variants.map((variant) => (
                <div key={variant.id} className="flex flex-col gap-2">
                  <div className="flex gap-2 items-center">
                    <input 
                      type="text" 
                      placeholder="e.g. Small" 
                      value={variant.name}
                      onChange={(e) => updateVariant(variant.id, 'name', e.target.value)}
                      className="flex-1 h-[44px] rounded-[10px] border border-[#E5E7EB] px-[12px] text-sm focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all"
                    />
                    <div className="relative w-24">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500">₹</span>
                      <input 
                        type="number" 
                        placeholder="0" 
                        value={variant.price}
                        onChange={(e) => updateVariant(variant.id, 'price', e.target.value)}
                        className="w-full h-[44px] rounded-[10px] border border-[#E5E7EB] pl-7 pr-2 text-sm focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all"
                      />
                    </div>
                    <button onClick={() => removeVariant(variant.id)} className="w-8 h-[44px] flex items-center justify-center text-rose-500 hover:bg-rose-50 rounded-lg transition-colors">
                      <Trash2 size={18} />
                    </button>
                  </div>
                  {variant.price && (
                    <p className="text-xs text-slate-500 ml-1">
                      Final Price: ₹{calculateFinalPrice(variant.price).toFixed(2)} (incl. GST)
                    </p>
                  )}
                  
                  {/* Variant Add-ons */}
                  <div className="mt-2 pl-1">
                    <p className="text-[11px] font-semibold text-slate-600 mb-2 uppercase tracking-wide">Variant Add-ons</p>
                    {addonGroups.filter(g => g.isActive && g.type !== 'topping').length > 0 ? (
                      <div className="space-y-3">
                        {addonGroups.filter(g => g.isActive && g.type !== 'topping').map(group => (
                          <div key={group.id}>
                             <div className="flex items-center justify-between mb-1.5 pointer-events-none">
                               <p className="text-[10px] text-slate-500">{group.name}</p>
                               {group.isRequired && <span className="text-[9px] text-amber-600 bg-amber-50 px-1 py-0.5 rounded font-medium">Req</span>}
                             </div>
                             <div className="flex flex-col gap-1.5 mt-1">
                               <button 
                                 onClick={() => setOpenVariantDropdown(openVariantDropdown === `${variant.id}-${group.id}` ? null : `${variant.id}-${group.id}`)}
                                 className="flex items-center justify-between px-3 py-2 bg-white border border-slate-200 rounded-lg text-[11px] font-medium text-slate-700 w-full hover:bg-slate-50 transition-colors"
                               >
                                 <span>
                                   {variant.allowedAddons?.filter((id: string) => group.addons.some(a => a.id === id)).length || 0} selected
                                 </span>
                                 <ChevronDown size={14} className={`text-slate-400 transition-transform ${openVariantDropdown === `${variant.id}-${group.id}` ? 'rotate-180' : ''}`} />
                               </button>
                               {openVariantDropdown === `${variant.id}-${group.id}` && (
                                 <div className="flex flex-wrap gap-1.5 p-2 bg-slate-50 border border-slate-100 rounded-lg animate-in slide-in-from-top-1 fade-in duration-200">
                                   {group.addons.map(addon => {
                                     const isSelected = variant.allowedAddons?.includes(addon.id);
                                     return (
                                       <button
                                         key={addon.id}
                                         onClick={() => toggleVariantAddon(variant.id, addon.id)}
                                         className={`px-2.5 py-1.5 text-[10px] rounded-[6px] border transition-colors ${isSelected ? 'bg-blue-50 border-blue-200 text-blue-700 font-semibold' : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'}`}
                                       >
                                         {addon.name} (+₹{addon.price})
                                       </button>
                                     );
                                   })}
                                 </div>
                               )}
                             </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-[10px] text-slate-400">No add-on groups available.</p>
                    )}
                  </div>
                </div>
              ))}
              
              <div className="flex items-center gap-2 mt-2">
                <input 
                  type="checkbox" 
                  checked={gstIncluded} 
                  onChange={(e) => setGstIncluded(e.target.checked)}
                  className="w-4 h-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500"
                />
                <label className="text-sm text-slate-600">GST Included for all variants</label>
              </div>

              <button 
                onClick={addVariant}
                className="text-sm font-medium text-blue-600 flex items-center gap-1 py-2"
              >
                <Plus size={16} /> Add Variant
              </button>
            </div>
          )}
        </div>

        {/* Add-ons Section - Simple Pricing Only */}
        {foodCategory !== 'Toppings' && pricingType === 'simple' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between py-2 border-t border-slate-100">
              <label className="text-sm font-medium text-slate-700">Enable Add-ons</label>
              <button 
                onClick={() => setEnableAddons(!enableAddons)}
                className={`w-[32px] h-[18px] rounded-full p-[2px] transition-colors duration-300 relative shrink-0 ${enableAddons ? 'bg-[#1E90FF]' : 'bg-[#D1D5DB]'}`}
              >
                <div className={`w-[14px] h-[14px] bg-[#FFFFFF] rounded-full transform transition-transform duration-300 shadow-sm ${enableAddons ? 'translate-x-[14px]' : 'translate-x-0'}`} />
              </button>
            </div>

            {enableAddons && (
              <div className="space-y-4 p-4 bg-slate-50 rounded-[12px] border border-slate-100">
                <label className="text-sm font-medium text-slate-700 block">Select Add-ons</label>
                {addonGroups.filter(g => g.isActive && g.type !== 'topping').length > 0 ? (
                  <div className="space-y-3">
                    {addonGroups.filter(g => g.isActive && g.type !== 'topping').map(group => (
                      <div key={group.id} className="flex flex-col gap-1.5 mt-1 border border-slate-200 rounded-lg bg-white overflow-hidden">
                        <div className="flex items-center justify-between p-3 border-b border-slate-100 bg-slate-50/50 flex-wrap gap-2">
                          <p className="text-[13px] font-semibold text-slate-700">{group.name}</p>
                          <div className="flex items-center gap-4">
                            <div className="flex items-center gap-1.5">
                              <span className="text-[10px] uppercase font-semibold text-slate-500">Pick Lmt</span>
                              <input 
                                type="number" 
                                min="1"
                                placeholder="..." 
                                value={addonGroupLimits[group.id] || ''}
                                onChange={(e) => setAddonGroupLimits(prev => ({...prev, [group.id]: parseInt(e.target.value) || 0}))}
                                className="w-12 h-6 text-xs text-center border border-slate-200 rounded focus:outline-none focus:border-blue-500 bg-white"
                              />
                            </div>
                            <label className="flex items-center gap-2 cursor-pointer">
                              <span className="text-[11px] font-medium text-slate-500 uppercase tracking-wider">{requiredAddonGroups.includes(group.id) ? 'Required' : 'Optional'}</span>
                              <div 
                                onClick={() => setRequiredAddonGroups(prev => prev.includes(group.id) ? prev.filter(id => id !== group.id) : [...prev, group.id])}
                                className={`w-8 h-4.5 rounded-full p-0.5 transition-colors duration-300 relative shrink-0 ${requiredAddonGroups.includes(group.id) ? 'bg-[#1E90FF]' : 'bg-[#D1D5DB]'}`}
                              >
                                <div className={`w-3.5 h-3.5 bg-[#FFFFFF] rounded-full transform transition-transform duration-300 shadow-sm ${requiredAddonGroups.includes(group.id) ? 'translate-x-[14px]' : 'translate-x-0'}`} />
                              </div>
                            </label>
                          </div>
                        </div>
                        <div className="p-3">
                          <button 
                            onClick={() => setOpenVariantDropdown(openVariantDropdown === `simple-${group.id}` ? null : `simple-${group.id}`)}
                            className="flex items-center justify-between px-3 py-2 bg-slate-50 border border-slate-200 rounded-[10px] text-[13px] font-medium text-slate-700 w-full hover:bg-slate-100 transition-colors"
                          >
                            <span>
                              {selectedAddons.filter((id: string) => group.addons.some(a => a.id === id)).length || 0} selected
                            </span>
                            <ChevronDown size={14} className={`text-slate-400 transition-transform ${openVariantDropdown === `simple-${group.id}` ? 'rotate-180' : ''}`} />
                          </button>
                          {openVariantDropdown === `simple-${group.id}` && (
                            <div className="flex flex-wrap gap-2 pt-3 animate-in slide-in-from-top-1 fade-in duration-200">
                              {group.addons.map(addon => {
                                const isSelected = selectedAddons.includes(addon.id);
                                return (
                                  <button
                                    key={addon.id}
                                   onClick={() => toggleAddon(addon.id)}
                                   className={`px-3 py-1.5 text-xs rounded-lg border transition-colors ${
                                     isSelected
                                       ? 'bg-blue-50 border-blue-200 text-blue-700 font-semibold' 
                                       : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
                                   }`}
                                 >
                                   {addon.name} (+₹{addon.price})
                                 </button>
                               );
                             })}
                           </div>
                         )}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-slate-500">No add-ons available. Create them in the Add-ons manager.</p>
                )}
              </div>
            )}
          </div>
        )}

        {/* Toppings Section */}
        {foodCategory !== 'Toppings' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between py-2 border-t border-slate-100">
              <label className="text-sm font-medium text-slate-700">Enable Toppings</label>
              <button 
                onClick={() => setEnableToppings(!enableToppings)}
                className={`w-[32px] h-[18px] rounded-full p-[2px] transition-colors duration-300 relative shrink-0 ${enableToppings ? 'bg-[#1E90FF]' : 'bg-[#D1D5DB]'}`}
              >
                <div className={`w-[14px] h-[14px] bg-[#FFFFFF] rounded-full transform transition-transform duration-300 shadow-sm ${enableToppings ? 'translate-x-[14px]' : 'translate-x-0'}`} />
              </button>
            </div>

            {enableToppings && (
              <div className="space-y-4 p-4 bg-slate-50 rounded-[12px] border border-slate-100">
                <label className="text-sm font-medium text-slate-700 block">Select Toppings</label>
                {addonGroups.filter(g => g.isActive && g.type === 'topping').length > 0 ? (
                  <div className="space-y-3">
                    {addonGroups.filter(g => g.isActive && g.type === 'topping').map(group => (
                      <div key={group.id} className="flex flex-col gap-1.5 mt-1 border border-slate-200 rounded-lg bg-white overflow-hidden">
                        <div className="flex items-center justify-between p-3 border-b border-slate-100 bg-slate-50/50 flex-wrap gap-2">
                          <p className="text-[13px] font-semibold text-slate-700">{group.name}</p>
                          <div className="flex items-center gap-4">
                            <div className="flex items-center gap-1.5">
                              <span className="text-[10px] uppercase font-semibold text-slate-500">Pick Lmt</span>
                              <input 
                                type="number" 
                                min="1"
                                placeholder="..." 
                                value={addonGroupLimits[group.id] || ''}
                                onChange={(e) => setAddonGroupLimits(prev => ({...prev, [group.id]: parseInt(e.target.value) || 0}))}
                                className="w-12 h-6 text-xs text-center border border-slate-200 rounded focus:outline-none focus:border-blue-500 bg-white"
                              />
                            </div>
                            <label className="flex items-center gap-2 cursor-pointer">
                              <span className="text-[11px] font-medium text-slate-500 uppercase tracking-wider">{requiredAddonGroups.includes(group.id) ? 'Required' : 'Optional'}</span>
                              <div 
                                onClick={() => setRequiredAddonGroups(prev => prev.includes(group.id) ? prev.filter(id => id !== group.id) : [...prev, group.id])}
                                className={`w-8 h-4.5 rounded-full p-0.5 transition-colors duration-300 relative shrink-0 ${requiredAddonGroups.includes(group.id) ? 'bg-[#1E90FF]' : 'bg-[#D1D5DB]'}`}
                              >
                                <div className={`w-3.5 h-3.5 bg-[#FFFFFF] rounded-full transform transition-transform duration-300 shadow-sm ${requiredAddonGroups.includes(group.id) ? 'translate-x-[14px]' : 'translate-x-0'}`} />
                              </div>
                            </label>
                          </div>
                        </div>
                        <div className="p-3">
                          <button 
                            onClick={() => setOpenVariantDropdown(openVariantDropdown === `simple-${group.id}` ? null : `simple-${group.id}`)}
                            className="flex items-center justify-between px-3 py-2 bg-slate-50 border border-slate-200 rounded-[10px] text-[13px] font-medium text-slate-700 w-full hover:bg-slate-100 transition-colors"
                          >
                            <span>
                              {selectedToppings.filter((id: string) => group.addons.some(a => a.id === id)).length || 0} selected
                            </span>
                            <ChevronDown size={14} className={`text-slate-400 transition-transform ${openVariantDropdown === `simple-${group.id}` ? 'rotate-180' : ''}`} />
                          </button>
                          {openVariantDropdown === `simple-${group.id}` && (
                            <div className="flex flex-wrap gap-2 pt-3 animate-in slide-in-from-top-1 fade-in duration-200">
                              {group.addons.map(addon => {
                                const isSelected = selectedToppings.includes(addon.id);
                                return (
                                  <button
                                    key={addon.id}
                                   onClick={() => toggleTopping(addon.id)}
                                   className={`px-3 py-1.5 text-xs rounded-lg border transition-colors ${
                                     isSelected
                                       ? 'bg-blue-50 border-blue-200 text-blue-700 font-semibold' 
                                       : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
                                   }`}
                                 >
                                   {addon.name} (+₹{addon.price})
                                 </button>
                               );
                             })}
                           </div>
                         )}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-slate-500">No toppings available. Create them in the Add-ons manager.</p>
                )}
              </div>
            )}
          </div>
        )}

        {/* Serve Info Section */}
        {foodCategory !== 'Toppings' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between py-2 border-t border-slate-100">
              <label className="text-sm font-medium text-slate-700">Enable Serve Info</label>
              <button 
                onClick={() => setEnableServeInfo(!enableServeInfo)}
                className={`w-[32px] h-[18px] rounded-full p-[2px] transition-colors duration-300 relative shrink-0 ${enableServeInfo ? 'bg-[#1E90FF]' : 'bg-[#D1D5DB]'}`}
              >
                <div className={`w-[14px] h-[14px] bg-[#FFFFFF] rounded-full transform transition-transform duration-300 shadow-sm ${enableServeInfo ? 'translate-x-[14px]' : 'translate-x-0'}`} />
              </button>
            </div>

            {enableServeInfo && (
              <div className="space-y-4 p-4 bg-slate-50 rounded-[12px] border border-slate-100">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-700">Serving Size</label>
                  <select
                    value={servingSize}
                    onChange={(e) => setServingSize(e.target.value)}
                    className="w-full h-[44px] rounded-[10px] border border-[#E5E7EB] px-[12px] text-sm focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all bg-[#FFFFFF]"
                  >
                    {servingSizeOptions.map(size => (
                      <option key={size} value={size}>{size}</option>
                    ))}
                  </select>
                </div>

                <div className="space-y-3">
                  <label className="text-sm font-medium text-slate-700">Pieces Info</label>
                  {piecesInfo.map((piece, index) => (
                    <div key={index} className="flex gap-2 items-center">
                      <input 
                        type="text" 
                        placeholder="Item Name (e.g. Chicken)" 
                        value={piece.name}
                        onChange={(e) => updatePieceInfo(index, 'name', e.target.value)}
                        className="flex-1 h-[44px] rounded-[10px] border border-[#E5E7EB] px-[12px] text-sm focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all bg-[#FFFFFF]"
                      />
                      <input 
                        type="number" 
                        placeholder="Count" 
                        value={piece.count}
                        onChange={(e) => updatePieceInfo(index, 'count', e.target.value)}
                        className="w-24 h-[44px] rounded-[10px] border border-[#E5E7EB] px-[12px] text-sm focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all bg-[#FFFFFF]"
                      />
                      <button onClick={() => removePieceInfo(index)} className="w-8 h-[44px] flex items-center justify-center text-rose-500 hover:bg-rose-50 rounded-lg transition-colors">
                        <Trash2 size={18} />
                      </button>
                    </div>
                  ))}
                  
                  <button 
                    onClick={addPieceInfo}
                    className="text-sm font-medium text-blue-600 flex items-center gap-1 py-1"
                  >
                    <Plus size={16} /> Add More
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Item Availability */}
        {foodCategory !== 'Toppings' && (
          <div className="space-y-4 pt-4 border-t border-slate-100">
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700">Available For</label>
              <div className="flex flex-wrap gap-2">
                {['Delivery', 'Takeaway', 'Dine-In'].map(option => (
                  <button
                    key={option}
                    onClick={() => toggleAvailableFor(option)}
                    className={`h-[32px] px-4 rounded-[16px] border text-sm transition-colors ${
                      availableFor.includes(option) 
                        ? 'bg-[#1E90FF] border-[#1E90FF] text-white' 
                        : 'bg-[#FFFFFF] border-[#E5E7EB] text-slate-600'
                    }`}
                  >
                    {option}
                  </button>
                ))}
              </div>
            </div>

            {/* Scheduled Menus Section */}
            <div className="flex items-center justify-between py-2 border-t border-slate-100">
              <div>
                <label className="text-sm font-medium text-slate-700">Scheduled Menu (Optional)</label>
                <p className="text-[11px] text-slate-500">Available only during specific times</p>
              </div>
              <button 
                onClick={() => setEnableScheduledMenu(!enableScheduledMenu)}
                className={`w-[32px] h-[18px] rounded-full p-[2px] transition-colors duration-300 relative shrink-0 ${enableScheduledMenu ? 'bg-[#1E90FF]' : 'bg-[#D1D5DB]'}`}
              >
                <div className={`w-[14px] h-[14px] bg-[#FFFFFF] rounded-full transform transition-transform duration-300 shadow-sm ${enableScheduledMenu ? 'translate-x-[14px]' : 'translate-x-0'}`} />
              </button>
            </div>

            {enableScheduledMenu && (
              <div className="space-y-3 p-4 bg-slate-50 rounded-[12px] border border-slate-100">
                <label className="text-sm font-medium text-slate-700">Select Schedule Type</label>
                <select
                  value={scheduleType}
                  onChange={(e) => setScheduleType(e.target.value)}
                  className="w-full h-[44px] rounded-[10px] border border-[#E5E7EB] px-[12px] text-sm focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all bg-[#FFFFFF]"
                >
                  <option value="Breakfast">Breakfast (7 AM - 11 AM)</option>
                  <option value="Lunch">Lunch (11 AM - 4 PM)</option>
                  <option value="Dinner">Dinner (7 PM - 12 AM)</option>
                  <option value="Late Night">Late Night (12 AM - 4 AM)</option>
                  <option value="Custom">Custom Schedule</option>
                </select>
              </div>
            )}

            {/* Combo Builder */}
            <div className="flex items-center justify-between py-2 border-t border-slate-100">
              <div>
                <label className="text-sm font-medium text-slate-700">Enable Combo Options (Optional)</label>
                <p className="text-[11px] text-slate-500">Allow users to build a combo meal</p>
              </div>
              <button 
                onClick={() => setEnableComboBuilder(!enableComboBuilder)}
                className={`w-[32px] h-[18px] rounded-full p-[2px] transition-colors duration-300 relative shrink-0 ${enableComboBuilder ? 'bg-[#1E90FF]' : 'bg-[#D1D5DB]'}`}
              >
                <div className={`w-[14px] h-[14px] bg-[#FFFFFF] rounded-full transform transition-transform duration-300 shadow-sm ${enableComboBuilder ? 'translate-x-[14px]' : 'translate-x-0'}`} />
              </button>
            </div>
            
            {enableComboBuilder && (
              <div className="space-y-3 p-4 bg-slate-50 rounded-[12px] border border-slate-100 mt-2">
                <label className="text-sm font-medium text-slate-700">Combo Items Allowed limit</label>
                <p className="text-[11px] text-slate-500 mb-2">e.g., Choose any 2 items</p>
                <div className="flex flex-wrap gap-2">
                  <span className="text-sm text-slate-500 border border-slate-200 bg-white rounded-lg px-3 py-1">Set Limit in Add-ons</span>
                </div>
              </div>
            )}

            {/* Preparation Time */}
            <div className="space-y-2 pt-4 border-t border-slate-100">
              <label className="text-sm font-medium text-slate-700">Preparation Time (minutes)</label>
              <input 
                type="number" 
                placeholder="e.g. 15" 
                value={preparationTime}
                onChange={(e) => setPreparationTime(e.target.value)}
                className="w-full h-[44px] rounded-[10px] border border-[#E5E7EB] px-[12px] text-sm focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all bg-[#FFFFFF]"
              />
            </div>

            {/* Price on other app */}
            <div className="space-y-2 pt-4 border-t border-slate-100">
               <div>
                 <label className="text-sm font-medium text-slate-700">Price on other App</label>
                 {competitorPrice ? (
                   <p className="text-[11px] text-slate-500">Price shown for comparison</p>
                 ) : (
                   <div className="flex items-start gap-1.5 mt-1 bg-amber-50 text-amber-700 p-2 rounded-lg border border-amber-200">
                     <AlertCircle size={14} className="mt-0.5 shrink-0" />
                     <p className="text-[11px] font-medium">Notice: We show food price on other app by adding 40% extra from the menu price if left blank.</p>
                   </div>
                 )}
               </div>
               <div className="relative">
                 <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500">₹</span>
                 <input 
                   type="number" 
                   placeholder="0" 
                   value={competitorPrice}
                   onChange={(e) => setCompetitorPrice(e.target.value)}
                   className="w-full h-[44px] rounded-[10px] border border-[#E5E7EB] pl-7 pr-4 text-sm focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all bg-[#FFFFFF]"
                 />
               </div>
            </div>

            {/* Allergen Warnings */}
            <div className="space-y-3 pt-4 border-t border-slate-100">
               <div>
                 <label className="text-sm font-bold text-slate-900 tracking-tight">Allergen Warnings</label>
                 <p className="text-[11px] text-slate-500 mt-0.5">Select all known allergens present in this item</p>
               </div>
               <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
                 {ALL_ALLERGENS.map(allergen => {
                   const isSelected = selectedAllergens.includes(allergen.id);
                   return (
                     <button
                       key={allergen.id}
                       onClick={() => setSelectedAllergens(prev => prev.includes(allergen.id) ? prev.filter(a => a !== allergen.id) : [...prev, allergen.id])}
                       className={`flex items-center justify-between p-2.5 rounded-xl border text-left transition-all ${
                         isSelected 
                           ? 'bg-rose-50 border-rose-200 shadow-sm' 
                           : 'bg-[#FFFFFF] border-slate-200 hover:border-slate-300'
                       }`}
                     >
                       <span className={`text-[13px] font-medium ${isSelected ? 'text-rose-700' : 'text-slate-600'}`}>
                         {allergen.label}
                       </span>
                       <div className={`w-4 h-4 rounded-full border flex flex-shrink-0 items-center justify-center ${isSelected ? 'bg-rose-500 border-rose-500' : 'border-slate-300'}`}>
                         {isSelected && <Check size={10} className="text-white" />}
                       </div>
                     </button>
                   );
                 })}
               </div>
            </div>

            {/* Visual Diet Tags */}
            <div className="space-y-3 pt-4 border-t border-slate-100">
               <div>
                 <label className="text-sm font-bold text-slate-900 tracking-tight">Visual Diet Tags</label>
                 <p className="text-[11px] text-slate-500 mt-0.5">Highlight specific diets for customers</p>
               </div>
               <div className="flex flex-wrap gap-2">
                 {ALL_DIET_TAGS.map(diet => {
                   const isSelected = selectedDietTags.includes(diet.id);
                   return (
                     <button
                       key={diet.id}
                       onClick={() => setSelectedDietTags(prev => prev.includes(diet.id) ? prev.filter(d => d !== diet.id) : [...prev, diet.id])}
                       className={`h-[36px] px-3.5 rounded-xl border text-[13px] font-medium transition-all flex items-center gap-2 ${
                         isSelected 
                           ? `${diet.bg} ${diet.border} ${diet.color} shadow-sm ring-1 ring-inset ${diet.border.replace('border-', 'ring-')}` 
                           : 'bg-[#FFFFFF] border-slate-200 text-slate-600 hover:bg-slate-50'
                       }`}
                     >
                       {isSelected && <Check size={14} />}
                       {diet.label}
                     </button>
                   );
                 })}
               </div>
            </div>

          </div>
        )}

        {/* Availability Toggle */}
        <div className="flex items-center justify-between py-2 border-t border-slate-100">
          <label className="text-sm font-medium text-slate-700">Active Status</label>
          <button 
            onClick={() => setIsAvailable(!isAvailable)}
            className={`w-[32px] h-[18px] rounded-full p-[2px] transition-colors duration-300 relative shrink-0 ${isAvailable ? 'bg-[#1E90FF]' : 'bg-[#D1D5DB]'}`}
          >
            <div className={`w-[14px] h-[14px] bg-[#FFFFFF] rounded-full transform transition-transform duration-300 shadow-sm ${isAvailable ? 'translate-x-[14px]' : 'translate-x-0'}`} />
          </button>
        </div>


      </div>

      <div className="p-4 bg-[#FFFFFF] border-t border-slate-100 flex gap-3">
        <button 
          onClick={onBack}
          className="flex-1 h-[52px] rounded-[16px] font-semibold text-[16px] flex items-center justify-center transition-all bg-slate-100 text-slate-700 active:scale-[0.98]"
        >
          Cancel
        </button>
        <button 
          onClick={handleSave}
          disabled={isSaving}
          className={`flex-1 h-[52px] rounded-[16px] font-semibold text-[16px] flex items-center justify-center transition-all ${isSaving ? 'bg-blue-400 text-white' : 'bg-[#1E90FF] text-[#FFFFFF] active:scale-[0.98]'}`}
        >
          {isSaving ? <Loader2 className="animate-spin" size={24} /> : 'Save Food Item'}
        </button>
      </div>
    </div>
  </div>
);
};