
import React, { useState } from 'react';
import { 
  Package,
  BellRing
} from 'lucide-react';
import { NewOrderAlert } from './NewOrderAlert';
import { OrderCard } from './OrderCard';
import { Order } from '../types';
import { isTerminalStatus } from '../lib/orderStatus';

interface DashboardProps {
  orders: Order[];
  onAddOrder: (order: Order) => void;
  onNavigateToOrders?: () => void;
  isOnline: boolean;
  setIsOnline: (val: boolean) => void;
}

import { BASE_URL } from '../api/fetcher';

export const Dashboard: React.FC<DashboardProps> = ({ 
  orders,
  onAddOrder,
  onNavigateToOrders, 
  isOnline, 
  setIsOnline,
}) => {
  const [showNewOrderAlert, setShowNewOrderAlert] = useState(false);
  const [pendingOrder, setPendingOrder] = useState<Order | null>(null);

  // Orders stay visible until terminal - match both app and backend status casing.
  const activeOrders = orders.filter(o => !isTerminalStatus(o.status));

  // Poll available orders from backend when online (runs immediately when app opens or reopens)
  React.useEffect(() => {
    let interval: any;
    if (isOnline) {
      const fetchAvailable = async () => {
        try {
          const res = await fetch(`${BASE_URL}/delivery/orders/available`, {
            credentials: 'include'
          });
          const data = await res.json();
          if (data.success && data.orders && data.orders.length > 0) {
            const raw = data.orders[0];
            const formatted: Order = {
              id: raw.orderId,
              customer: raw.customerDetails?.name || 'Customer',
              type: 'Customer Tips',
              channel: 'Direct',
              items: `${raw.items?.length || 1} Items`,
              itemList: (raw.items || []).map((it: any) => ({
                name: it.name,
                quantity: it.quantity,
                price: it.price
              })),
              paymentStatus: raw.payment?.status || 'Paid',
              address: raw.customerDetails?.address || 'Civil Lines, Prayagraj',
              subtotal: raw.subtotal || 0,
              tax: raw.tax || 0,
              discount: raw.discount || 0,
              total: String(raw.total || '0'),
              status: 'Incoming',
              time: '--',
              customerType: 'Regular',
              phone: raw.customerDetails?.phone || '+91 98765 43210',
              customerNote: '',
              offer: raw.appliedOffer || ''
            };
            setPendingOrder(formatted);
            setShowNewOrderAlert(true);
          }
        } catch (err) {
          // ignore fetch error
        }
      };
      
      fetchAvailable();
      interval = setInterval(fetchAvailable, 3000);
    } else if (!isOnline) {
      setShowNewOrderAlert(false);
      setPendingOrder(null);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
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
              address: payload.restaurantName ? `Pick up at ${payload.restaurantName}` : 'Restaurant Pickup',
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
        } catch (_) {}
      });
    } catch (_) {}

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
              const respondRes = await fetch(`${BASE_URL}/delivery/orders/${pendingOrder.id}/respond`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ action: 'ACCEPT' }),
                credentials: 'include'
              });
              // 2. Accept order on delivery orders API. Must send a JSON body
              // (even an empty object): Fastify rejects an empty body when the
              // Content-Type is application/json (FST_ERR_CTP_EMPTY_JSON_BODY).
              const acceptRes = await fetch(`${BASE_URL}/delivery/orders/${pendingOrder.id}/accept`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({}),
                credentials: 'include'
              });
              assigned = respondRes.ok && acceptRes.ok;
              if (!assigned) {
                console.error("Order acceptance failed - not adding locally (backend sync would drop it).");
              }
            } catch (err) {
              console.error("Error accepting order API:", err);
            }
            // Only show the order locally once the backend has actually assigned it,
            // otherwise the 20s active-order sync removes it right away.
            if (assigned) {
              onAddOrder(acceptedOrder);
            }
            setPendingOrder(null);
            setShowNewOrderAlert(false);
          }}
          onReject={async (reason) => {
            try {
              // Only called when driver explicitly taps the Reject button
              // Send dispatch response DECLINE event to Inngest
              await fetch(`${BASE_URL}/delivery/orders/${pendingOrder.id}/respond`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ action: 'DECLINE', reason: reason || 'User declined' }),
                credentials: 'include'
              });
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

export default Dashboard;

