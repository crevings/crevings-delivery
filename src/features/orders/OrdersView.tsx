
import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { 
  Package,
  Search
} from 'lucide-react';
import { OrderDetailView } from './OrderDetailView';
import { VoiceSearchModal } from '@/shared/components/VoiceSearchModal';
import { OrderCard } from '@/features/dashboard/components/OrderCard';
import { isTerminalStatus } from '@/lib/orderStatus';
import { updateOrderStatus, mapDriverStatus, useActiveOrders, mapActiveOrder } from '@/api/orders';
import { useOrdersStore } from '@/app/store';

// OrdersView is mounted directly by the router, so it sources its state from
// the zustand orders store and keeps it dynamically in sync with the backend.
export const OrdersView: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const orderIdParam = searchParams.get('orderId');

  const orders = useOrdersStore(s => s.orders);
  const setOrders = useOrdersStore(s => s.setOrders);
  const updateOrder = useOrdersStore(s => s.updateOrder);
  const selectedOrder = useOrdersStore(s => s.selectedOrder);
  const setSelectedOrder = useOrdersStore(s => s.setSelectedOrder);
  const [searchQuery, setSearchQuery] = useState('');
  
  const [showVoiceSearch, setShowVoiceSearch] = useState(false);

  // Auto-select order if orderId query param is present
  useEffect(() => {
    if (orderIdParam && orders.length > 0) {
      const match = orders.find(o => o.id === orderIdParam || (o as any).orderId === orderIdParam);
      if (match) {
        setSelectedOrder(match);
      }
    }
  }, [orderIdParam, orders, setSelectedOrder]);

  // Live dynamic sync with backend active orders
  const { activeOrders, isError: activeOrdersError } = useActiveOrders();
  useEffect(() => {
    if (activeOrdersError || !activeOrders) return;
    setOrders(activeOrders.map(mapActiveOrder));
  }, [activeOrders, activeOrdersError, setOrders]);

  /**
   * Advance an order's status locally and sync it to the backend.
   *
   * The backend only accepts driver-settable statuses via PATCH /status
   * (DRIVER_ARRIVED, REACHED_CUSTOMER — see backend
   * orderStatus.constants.ts); OTP-verified transitions (OUT FOR DELIVERY,
   * COMPLETED) go through the dedicated verify-pickup / complete endpoints.
   * When an explicit `status` is passed (OrderDetailView after a successful
   * OTP verify / status PATCH), the store is updated only — the backend is
   * already in sync.
   */
  const onUpdateOrderStatus = (orderId: string, status?: string) => {
    const order = orders.find(o => o.id === orderId);
    if (!order) return;

    if (status) {
      updateOrder(orderId, { status: mapDriverStatus(status) });
      return;
    }

    const s = (order.status || '').toUpperCase();
    let nextStatus: string | null = null;
    if (s === 'ACCEPTED' || s === 'PREPARING' || s === 'READY' ||
        s === 'READY_FOR_PICKUP' || s === 'DRIVER_ASSIGNED') {
      nextStatus = 'DRIVER_ARRIVED';
    } else if (s === 'DRIVER_ARRIVED' || s === 'OUT FOR DELIVERY' || s === 'OUT_FOR_DELIVERY') {
      nextStatus = 'REACHED_CUSTOMER';
    }
    if (!nextStatus) return;

    updateOrder(orderId, { status: mapDriverStatus(nextStatus) });
    updateOrderStatus(orderId, nextStatus).catch(err =>
      console.error('Failed to sync order status:', err)
    );
  };
  
  const filteredOrders = orders.filter(o => {
    const q = searchQuery.toLowerCase();
    const matchesSearch = 
      (o.displayOrderNumber && o.displayOrderNumber.toLowerCase().includes(q)) ||
      (o.displayOrderId && o.displayOrderId.toLowerCase().includes(q)) ||
      o.id.toLowerCase().includes(q) || 
      o.customer.toLowerCase().includes(q);
    
    if (!matchesSearch) return false;

    if (isTerminalStatus(o.status)) return false;
    return true;
  });

  const currentSelectedOrder = selectedOrder ? (orders.find(o => o.id === selectedOrder.id) || selectedOrder) : null;
  if (currentSelectedOrder) {
    return (
      <OrderDetailView 
        order={currentSelectedOrder} 
        onBack={() => {
          setSelectedOrder(null);
          navigate('/orders', { replace: true });
        }} 
        onUpdateOrderStatus={onUpdateOrderStatus} 
      />
    );
  }

  return (
    <div className="pb-32 px-4 pt-4 animate-in fade-in duration-300 bg-slate-50 font-sans min-h-screen lg:bg-transparent lg:px-0 lg:pt-0 lg:pb-10 max-w-xl mx-auto w-full space-y-4">
      
      <div className="relative">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
        <input 
          type="text" 
          placeholder="Search Order Number or Customer..." 
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full h-12 bg-white border border-slate-200 text-slate-900 py-3 pl-11 pr-4 rounded-2xl focus:outline-none focus:border-blue-500 text-[14px] font-medium transition-all shadow-xs"
        />
      </div>

      <VoiceSearchModal 
        isOpen={showVoiceSearch} 
        onClose={() => setShowVoiceSearch(false)} 
        onResult={(text) => setSearchQuery(text)}
      />

      <div className="space-y-4 lg:space-y-0 lg:grid lg:grid-cols-2 lg:gap-4">
        {filteredOrders.length > 0 ? (
          filteredOrders.map((order) => (
            <OrderCard 
              key={order.id}
              order={order}
              onClick={() => setSelectedOrder(order)}
              onUpdateStatus={(e) => { e.stopPropagation(); onUpdateOrderStatus(order.id); }}
            />
          ))
        ) : (
          <div className="py-16 px-4 text-center bg-white rounded-2xl border border-slate-200 shadow-xs col-span-2">
            <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-3 text-slate-400">
              <Package size={26} />
            </div>
            <h3 className="text-sm font-bold text-slate-800">No active deliveries</h3>
            <p className="text-xs text-slate-400 mt-1">Orders will appear here as soon as they are assigned to you.</p>
          </div>
        )}
      </div>
    </div>
  );
};
