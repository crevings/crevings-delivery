
import React, { useState } from 'react';
import { 
  ShoppingBag, 
  Clock, 
  ChevronRight, 
  Users, 
  Package, 
  Wallet, 
  CheckCircle, 
  User,
  TrendingUp,
  Globe,
  BellRing,
  LayoutGrid,
  Circle,
  ArrowRight,
  AlertCircle,
  AlertTriangle,
  MapPin,
  ChevronDown,
  Bell,
  Plus,
  Zap,
  X,
  Store,
  Fuel,
  Hospital,
  Wrench,
  List,
  Navigation,
  Briefcase
} from 'lucide-react';
import { NewOrderAlert } from './NewOrderAlert';
import { OrderCard } from './OrderCard';
import { Order, Tab } from '../types';

interface DashboardProps {
  orders: Order[];
  onAddOrder: (order: Order) => void;
  onUpdateOrderStatus: (orderId: string) => void;
  onNavigateToOrders?: () => void;
  onNavigateToTables?: () => void;
  onNavigateToOffers?: () => void;
  onQuickOrder?: (type: 'Offline Orders' | 'Base Fare') => void;
  onCreateOrder?: () => void;
  isOnline: boolean;
  setIsOnline: (val: boolean) => void;
  rushHour: boolean;
  setRushHour: (val: boolean) => void;
  selectedBranch: any;
  outletServices?: { dineIn: boolean; booking: boolean };
  gigEndTime?: Date | null;
  gigStartTime?: Date | null;
}

export const Dashboard: React.FC<DashboardProps> = ({ 
  orders,
  onAddOrder,
  onUpdateOrderStatus,
  onNavigateToOrders, 
  onNavigateToTables,
  onNavigateToOffers,
  onQuickOrder,
  onCreateOrder,
  isOnline, 
  setIsOnline,
  rushHour,
  setRushHour,
  selectedBranch,
  outletServices = { dineIn: true, booking: true },
  gigEndTime,
  gigStartTime
}) => {
  const [showNewOrderAlert, setShowNewOrderAlert] = useState(false);
  const [pendingOrder, setPendingOrder] = useState<Order | null>(null);

  const activeOrders = orders.filter(o => o.status !== 'Delivered' && o.status !== 'Cancelled');

  const triggerRandomOrder = () => {
    const newOrder: Order = {
      id: `DEL-${Math.floor(1000 + Math.random() * 9000)}`,
      customer: ['Priya Verma', 'Rahul Sharma', 'Amit Kumar', 'Neha Singh'][Math.floor(Math.random() * 4)],
      type: 'Customer Tips',
      channel: ['Zomato', 'Swiggy', 'Direct'][Math.floor(Math.random() * 3)],
      items: '2 Items • Custom Order',
      itemList: [
        { name: 'Veg Supreme Pizza', quantity: 1, size: 'Large', addOns: ['Extra Cheese', 'Jalapenos'], price: 850 }, 
        { name: 'Coke Zero', quantity: 2, size: '500ml', price: 60 }
      ],
      paymentStatus: 'Paid',
      address: 'House No. 42, Green Avenue, Sector 15',
      subtotal: 970,
      tax: 48.50,
      discount: 100,
      total: '918.50',
      status: 'Incoming',
      time: '--',
      customerType: 'Regular',
      phone: '+91 98765 43210',
      customerNote: 'Please ring the bell twice.',
      offer: 'FLAT100 (₹100 off)'
    };
    
    setPendingOrder(newOrder);
    setShowNewOrderAlert(true);
  };

  return (
    <div className="flex-1 flex flex-col bg-slate-50 min-h-full pb-24 overflow-y-auto w-full relative">
      <div className="px-4 pt-4 space-y-6 max-w-lg mx-auto w-full">
        
        {/* Searching Status */}
        {isOnline && (
          <div className="bg-blue-50 border border-blue-200/60 rounded-2xl p-4 flex items-center gap-4">
            <div className="relative w-10 h-10 flex shrink-0 items-center justify-center">
              <div className="absolute inset-0 bg-blue-200 rounded-full animate-ping opacity-75"></div>
              <div className="absolute inset-1 bg-blue-500 rounded-full flex items-center justify-center">
                <div className="w-2.5 h-2.5 bg-white rounded-full"></div>
              </div>
            </div>
            <div>
              <h3 className="font-bold text-blue-900">Searching order for you...</h3>
              <p className="text-sm tracking-tight text-blue-700/80 font-medium">Keep your app open and stay in the current zone.</p>
            </div>
          </div>
        )}

        {/* Active Orders Section */}
        <div>
          <div className="flex items-center justify-between mb-4 mt-2">
            <h2 className="text-lg font-black text-slate-900">Active Orders</h2>
            {activeOrders.length > 0 && (
              <span className="bg-blue-100 text-blue-700 text-xs font-bold px-2 py-1 rounded-full">
                {activeOrders.length}
              </span>
            )}
          </div>
          
          <div className="space-y-4">
            {activeOrders.length > 0 ? (
              activeOrders.map(order => (
                <OrderCard
                  key={order.id}
                  order={order}
                  onClick={() => onNavigateToOrders && onNavigateToOrders()}
                />
              ))
            ) : (
              <div className="text-center py-8">
                <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-3">
                  <Package className="text-slate-400" size={24} />
                </div>
                <p className="text-slate-500 font-medium">No active orders right now.</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {pendingOrder && (
        <NewOrderAlert 
          isOpen={showNewOrderAlert} 
          onClose={() => setShowNewOrderAlert(false)} 
          onAccept={(prepTime) => {
            onAddOrder({
              ...pendingOrder,
              time: `${prepTime}:00`,
              status: 'Preparing'
            });
            setPendingOrder(null);
            setShowNewOrderAlert(false);
          }}
          onReject={() => {
            setPendingOrder(null);
            setShowNewOrderAlert(false);
          }}
          order={pendingOrder}
        />
      )}

      {/* Floating Buttons / Controls Setup */}
      <div className="fixed bottom-24 left-0 right-0 z-40 px-6 flex flex-col items-center gap-3 pointer-events-none">
        <div className="pointer-events-auto shadow-2xl rounded-full">
          <button 
            onClick={() => setIsOnline(!isOnline)}
            className={`px-5 py-2.5 rounded-full flex items-center justify-center gap-2 transition-all active:scale-95 ${isOnline ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/30' : 'bg-white text-slate-800 shadow-xl'}`}
          >
            {isOnline ? (
              <>
                <div className="relative w-2.5 h-2.5">
                  <div className="absolute inset-0 bg-white/50 rounded-full animate-ping"></div>
                  <div className="absolute inset-0.5 bg-white rounded-full"></div>
                </div>
                <span className="font-bold text-[11px] uppercase tracking-wider">Searching</span>
              </>
            ) : (
              <>
                <div className="w-2.5 h-2.5 bg-rose-500 rounded-full shadow-sm shadow-rose-500/50"></div>
                <span className="font-bold text-[11px] uppercase tracking-wider">Offline</span>
              </>
            )}
          </button>
        </div>

        {/* Developer Testing Control */}
        <div className="pointer-events-auto">
          <button 
            className="px-4 py-2 bg-slate-900/90 backdrop-blur-sm text-white rounded-full font-semibold flex items-center justify-center gap-1.5 shadow-xl active:scale-95 transition-all outline-none"
            onClick={triggerRandomOrder}
          >
            <BellRing size={12} />
            <span className="font-bold text-[10px] uppercase tracking-wider">Test Request</span>
          </button>
        </div>
      </div>
    </div>
  );
};

