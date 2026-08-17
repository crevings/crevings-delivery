
import React, { useState } from 'react';
import { 
  Package,
  BellRing
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { NewOrderAlert } from './components/NewOrderAlert';
import { OrderCard } from './components/OrderCard';
import { Order } from '@/types';
import { isTerminalStatus } from '@/lib/orderStatus';

import { acceptOrder, mapActiveOrder, respondToDispatch, useActiveOrders, useAvailableOrders } from '@/api/orders';
import { toggleOnline } from '@/api/partner';
import { BASE_URL } from '@/api/fetcher';
import { useOrdersStore, usePartnerStore } from '@/app/store';

// Dashboard is mounted directly by the router, so it sources its state from
// the zustand stores (orders grow as dispatches are accepted) and navigates
// via the router — same pattern as the other feature views.
export const Dashboard: React.FC = () => {
  const navigate = useNavigate();
  const orders = useOrdersStore(s => s.orders);
  const setOrders = useOrdersStore(s => s.setOrders);
  const addOrder = useOrdersStore(s => s.addOrder);
  const isOnline = usePartnerStore(s => s.isOnline);
  const setIsOnline = usePartnerStore(s => s.setIsOnline);

  const onNavigateToOrders = () => navigate('/orders');

  // Go online/offline: sync the backend (the dispatch SSE only pings drivers
  // the backend considers online) and persist locally so a page refresh keeps
  // the driver's availability status.
  const handleToggleOnline = async () => {
    const next = !isOnline;
    try {
      await toggleOnline(next);
      setIsOnline(next);
      try {
        localStorage.setItem('delivery_is_online', next ? '1' : '0');
      } catch {
        // non-fatal — status still works for this session
      }
    } catch (err: any) {
      alert(err.message || 'Failed to update availability status');
    }
  };

  // Backend active-orders sync — restores the driver's assigned orders after a
  // page refresh (the zustand store is in-memory only) and keeps them fresh.
  const { activeOrders: backendActiveOrders, isError: activeOrdersError } = useActiveOrders();
  React.useEffect(() => {
    // Keep the current list intact if the fetch fails (offline/API error).
    if (activeOrdersError) return;
    setOrders(backendActiveOrders.map(mapActiveOrder));
  }, [backendActiveOrders, activeOrdersError, setOrders]);
  const [showNewOrderAlert, setShowNewOrderAlert] = useState(false);
  const [pendingOrder, setPendingOrder] = useState<Order | null>(null);

  // Orders stay visible until terminal - match both app and backend status casing.
  const activeOrders = orders.filter(o => !isTerminalStatus(o.status));

  // SWR-driven availability feed (replaces the raw 3s fetch poll): polls only
  // while online (the key is null when offline, so no request fires), dedupes
  // concurrent mounts via the global dedupingInterval, and serves the cached
  // snapshot between polls so the UI never flashes empty.
  const { availableOrder, mutate: refreshAvailableOrders } = useAvailableOrders(isOnline);

  // Surface the first available order once per order id — if the driver
  // dismisses the alert, it stays dismissed until a NEW order arrives.
  React.useEffect(() => {
    if (availableOrder) {
      setPendingOrder(availableOrder);
      setShowNewOrderAlert(true);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [availableOrder?.id]);

  // Going offline clears the incoming-order alert.
  React.useEffect(() => {
    if (!isOnline) {
      setShowNewOrderAlert(false);
      setPendingOrder(null);
    }
  }, [isOnline]);

  // Connect to SSE stream for real-time dispatch events
  React.useEffect(() => {
    if (!isOnline) return;

    let eventSource: EventSource | null = null;
    try {
      eventSource = new EventSource(`${BASE_URL}/delivery/stream`, { withCredentials: true });

      eventSource.addEventListener('dispatch', (e: MessageEvent) => {
        try {
          const payload = JSON.parse(e.data);
          if (payload && payload.type === 'DISPATCH_REQUEST' && payload.orderId) {
            const formatted: Order = {
              id: payload.orderId,
              customer: 'New Delivery Request',
              type: 'Customer Tips',
              channel: 'Direct',
              items: 'Delivery Order',
              itemList: [],
              paymentStatus: 'Paid',
              // Real pickup context from the backend dispatch event — the alert
              // sheet renders the restaurant name and driver distance from these.
              restaurantName: payload.restaurantName || 'Restaurant',
              pickupDistanceKm: payload.distanceKm,
              address: payload.customerAddress || payload.dropAddress || '',
              subtotal: 0,
              tax: 0,
              discount: 0,
              total: '150.00',
              status: 'Incoming',
              time: '--',
              customerType: 'Regular',
              phone: '',
              customerNote: '',
              offer: ''
            };
            setPendingOrder(formatted);
            setShowNewOrderAlert(true);
          }
        } catch (_) {
          // ignore parsing error
        }
      });
    } catch (_) {
      // ignore connection error
    }

    return () => {
      if (eventSource) eventSource.close();
    };
  }, [isOnline]);

  // Force open NewOrderAlert when user clicks "Review" on bottom floating snackbar
  React.useEffect(() => {
    const handleForceOpen = () => {
      setShowNewOrderAlert(true);
    };
    window.addEventListener('open_pending_order_alert', handleForceOpen);
    return () => {
      window.removeEventListener('open_pending_order_alert', handleForceOpen);
    };
  }, []);

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
          onAccept={async (prepTime) => {
            const acceptedOrder = {
              ...pendingOrder,
              time: `${prepTime}:00`,
              status: 'Preparing' as const
            };
            let assigned = false;
            try {
              // 1. Send dispatch response ACCEPT event to Inngest
              await respondToDispatch(pendingOrder.id, 'ACCEPT');
              // 2. Accept the order on the delivery orders API (empty JSON body
              // required: Fastify rejects an empty body with JSON content-type).
              await acceptOrder(pendingOrder.id);
              assigned = true;
              // Drop the accepted order from the availability cache immediately.
              void refreshAvailableOrders();
            } catch (err) {
              console.error("Order acceptance failed - not adding locally (backend sync would drop it).", err);
            }
            // Only show the order locally once the backend has actually assigned it,
            // otherwise the 20s active-order sync removes it right away.
            if (assigned) {
              addOrder(acceptedOrder);
            }
            setPendingOrder(null);
            setShowNewOrderAlert(false);
          }}
          onReject={async (reason) => {
            try {
              // Only called when driver explicitly taps the Reject button
              // Send dispatch response DECLINE event to Inngest
              await respondToDispatch(pendingOrder.id, 'DECLINE', reason);
            } catch (err) {
              console.error("Error rejecting order dispatch API:", err);
            }
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
            onClick={handleToggleOnline}
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

export default Dashboard;

