import React, { useState, useEffect } from 'react';
import { 
  Package 
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

export const Dashboard: React.FC = () => {
  const navigate = useNavigate();
  const orders = useOrdersStore(s => s.orders);
  const setOrders = useOrdersStore(s => s.setOrders);
  const addOrder = useOrdersStore(s => s.addOrder);
  const isOnline = usePartnerStore(s => s.isOnline);
  const setIsOnline = usePartnerStore(s => s.setIsOnline);

  const [showNewOrderAlert, setShowNewOrderAlert] = useState(false);
  const [pendingOrder, setPendingOrder] = useState<Order | null>(null);

  // Active orders filtered
  const activeOrders = orders.filter(o => !isTerminalStatus(o.status));

  // Online / offline toggling
  const handleToggleOnline = async () => {
    const next = !isOnline;
    try {
      await toggleOnline(next);
      setIsOnline(next);
      try {
        localStorage.setItem('delivery_is_online', next ? '1' : '0');
      } catch {
        // non-fatal
      }
    } catch (err: any) {
      alert(err.message || 'Failed to update availability status');
    }
  };

  // Backend active-orders sync
  const { activeOrders: backendActiveOrders, isError: activeOrdersError } = useActiveOrders();
  useEffect(() => {
    if (activeOrdersError) return;
    setOrders(backendActiveOrders.map(mapActiveOrder));
  }, [backendActiveOrders, activeOrdersError, setOrders]);

  // SWR available orders polling when online
  const { availableOrder, mutate: refreshAvailableOrders } = useAvailableOrders(isOnline);

  useEffect(() => {
    if (availableOrder) {
      setPendingOrder(availableOrder);
      setShowNewOrderAlert(true);
    }
  }, [availableOrder?.id]);

  useEffect(() => {
    if (!isOnline) {
      setShowNewOrderAlert(false);
      setPendingOrder(null);
    }
  }, [isOnline]);

  // Connect to SSE stream for real-time dispatch events
  useEffect(() => {
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
              customer: payload.customerName || 'Customer',
              type: 'Delivery',
              channel: 'Crevings',
              items: payload.itemsSummary || `${payload.itemsCount || 1} Items`,
              total: String(payload.total || payload.orderTotal || '0.00'),
              status: 'Incoming',
              time: '15:00',
              paymentStatus: payload.isCOD ? 'Unpaid' : 'Paid',
              address: payload.dropoffAddress || payload.deliveryAddress || 'Customer Address',
              restaurantName: payload.restaurantName || 'Restaurant',
              restaurantAddress: payload.restaurantAddress,
              restaurantPhone: payload.restaurantPhone,
              pickupDistanceKm: payload.pickupDistanceKm ? String(payload.pickupDistanceKm) : undefined,
              deliveryFee: payload.deliveryFee,
              driverEarnings: payload.driverEarnings,
            };
            setPendingOrder(formatted);
            setShowNewOrderAlert(true);
          }
        } catch (err) {
          console.error('Failed to parse SSE dispatch payload:', err);
        }
      });
    } catch (err) {
      console.error('Failed to connect to SSE delivery stream:', err);
    }

    return () => {
      if (eventSource) {
        eventSource.close();
      }
    };
  }, [isOnline]);

  return (
    <div className="flex-1 flex flex-col bg-slate-50 min-h-full pb-20 overflow-y-auto w-full relative">
      <div className="px-4 pt-4 space-y-6 max-w-lg mx-auto w-full">
        
        {/* Searching Status Radar Card */}
        {isOnline && (
          <div className="bg-blue-50 border border-blue-200/60 rounded-2xl p-4 flex items-center gap-4 shadow-sm">
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
                  onClick={() => navigate(`/orders?orderId=${order.id}`)}
                />
              ))
            ) : (
              <div className="text-center py-12 bg-white rounded-2xl border border-slate-200">
                <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-3">
                  <Package className="text-slate-400" size={24} />
                </div>
                <p className="text-slate-500 font-medium">No active orders right now.</p>
                <p className="text-xs text-slate-400 mt-1">Orders will appear here as soon as they are assigned to you.</p>
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
            const rawId = pendingOrder.id;
            try {
              if (!rawId.startsWith('DEL-')) {
                await respondToDispatch(rawId, 'ACCEPT');
                await acceptOrder(rawId);
              }
            } catch (err: any) {
              console.warn('Accept order API warning:', err.message);
            }

            addOrder({
              ...pendingOrder,
              time: `${prepTime}:00`,
              status: 'Accepted'
            });
            setPendingOrder(null);
            setShowNewOrderAlert(false);
            refreshAvailableOrders?.();
            navigate(`/orders?orderId=${rawId}`);
          }}
          onReject={async () => {
            const rawId = pendingOrder?.id;
            if (rawId && !rawId.startsWith('DEL-')) {
              try {
                await respondToDispatch(rawId, 'DECLINE');
              } catch (err: any) {
                console.warn('Reject dispatch API warning:', err.message);
              }
            }
            setPendingOrder(null);
            setShowNewOrderAlert(false);
            refreshAvailableOrders?.();
          }}
          order={pendingOrder}
        />
      )}
    </div>
  );
};

export default Dashboard;
