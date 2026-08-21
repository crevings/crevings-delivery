import React, { useState, useEffect } from 'react';
import { 
  Package,
  AlertTriangle,
  Phone,
  Banknote
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { NewOrderAlert } from './components/NewOrderAlert';
import { OrderCard } from './components/OrderCard';
import { Order } from '@/types';
import { isTerminalStatus } from '@/lib/orderStatus';

import { acceptOrder, mapActiveOrder, respondToDispatch, useActiveOrders, useAvailableOrders } from '@/api/orders';
import { toggleOnline, getPartnerProfile } from '@/api/partner';
import { BASE_URL } from '@/api/fetcher';
import { useOrdersStore, usePartnerStore } from '@/app/store';
import { createSSEClient } from '@/lib/sse-client';

export const Dashboard: React.FC = () => {
  const navigate = useNavigate();
  const orders = useOrdersStore(s => s.orders);
  const setOrders = useOrdersStore(s => s.setOrders);
  const addOrder = useOrdersStore(s => s.addOrder);
  const isOnline = usePartnerStore(s => s.isOnline);
  const setIsOnline = usePartnerStore(s => s.setIsOnline);
  const floatingCash = usePartnerStore(s => s.floatingCash);
  const setFloatingCash = usePartnerStore(s => s.setFloatingCash);

  const [showNewOrderAlert, setShowNewOrderAlert] = useState(false);
  const [pendingOrder, setPendingOrder] = useState<Order | null>(null);

  // Sync floating cash from partner profile on mount and periodically
  useEffect(() => {
    let active = true;
    const fetchProfile = async () => {
      try {
        const res: any = await getPartnerProfile();
        if (active && res?.profile) {
          if (res.profile.floatingCash !== undefined) {
            setFloatingCash(Number(res.profile.floatingCash) || 0);
          }
          if (res.profile.isOnline !== undefined) {
            setIsOnline(Boolean(res.profile.isOnline));
          }
        }
      } catch (err) {
        // non-fatal
      }
    };
    fetchProfile();
    const interval = setInterval(fetchProfile, 10000);
    return () => {
      active = false;
      clearInterval(interval);
    };
  }, [setFloatingCash, setIsOnline]);

  const isFloatingCashBlocked = floatingCash >= 2000;

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

  // Backend active-orders sync with fast live polling
  const { activeOrders: backendActiveOrders, isError: activeOrdersError, mutate: refreshActiveOrders } = useActiveOrders();
  useEffect(() => {
    if (activeOrdersError || !backendActiveOrders) return;
    setOrders(backendActiveOrders.map(mapActiveOrder));
  }, [backendActiveOrders, activeOrdersError, setOrders]);

  // SWR available orders polling when online and not blocked by floating cash
  const { availableOrder, mutate: refreshAvailableOrders } = useAvailableOrders(isOnline && !isFloatingCashBlocked);

  useEffect(() => {
    if (availableOrder && !isFloatingCashBlocked) {
      setPendingOrder(availableOrder);
      setShowNewOrderAlert(true);
    }
  }, [availableOrder?.id, availableOrder?.orderId, isFloatingCashBlocked]);

  useEffect(() => {
    if (!isOnline || isFloatingCashBlocked) {
      setShowNewOrderAlert(false);
      setPendingOrder(null);
    }
  }, [isOnline, isFloatingCashBlocked]);

  // Connect to SSE stream for real-time dispatch events
  useEffect(() => {
    if (!isOnline || isFloatingCashBlocked) return;

    const sseClient = createSSEClient({
      url: `${BASE_URL}/delivery/stream`,
      events: {
        dispatch: (payload: any) => {
          if (isFloatingCashBlocked) return;
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
              pickupDistanceKm: payload.pickupDistanceKm || (payload.distanceKm ? `${payload.distanceKm} km` : undefined),
              deliveryFee: payload.deliveryFee !== undefined && payload.deliveryFee !== null ? Number(payload.deliveryFee) : 30,
              driverEarnings: payload.driverEarnings !== undefined && payload.driverEarnings !== null ? Number(payload.driverEarnings) : (payload.deliveryFee ? Number(payload.deliveryFee) : 30),
            };
            setPendingOrder(formatted);
            setShowNewOrderAlert(true);
            refreshAvailableOrders();
            refreshActiveOrders();
          }
        },
      },
    });

    sseClient.connect();

    return () => {
      sseClient.close();
    };
  }, [isOnline, isFloatingCashBlocked, refreshAvailableOrders, refreshActiveOrders]);

  return (
    <div className="flex-1 flex flex-col bg-slate-50 min-h-full pb-20 overflow-y-auto w-full relative">
      <div className="px-4 pt-4 space-y-4 max-w-lg mx-auto w-full">
        
        {/* Floating Cash Limit Reached Banner */}
        {isFloatingCashBlocked && (
          <div className="bg-amber-50 border-2 border-amber-400 rounded-2xl p-4 shadow-sm animate-in fade-in duration-300">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 bg-amber-100 text-amber-700 rounded-full flex items-center justify-center shrink-0 mt-0.5">
                <AlertTriangle size={22} className="text-amber-600" />
              </div>
              <div className="flex-1">
                <div className="flex items-center justify-between flex-wrap gap-1">
                  <h3 className="font-bold text-amber-950 text-base">Floating Cash Limit Reached</h3>
                  <span className="bg-amber-200/90 text-amber-900 text-xs font-bold px-2 py-0.5 rounded-full">
                    ₹{floatingCash.toLocaleString('en-IN')} (Limit: ₹2,000)
                  </span>
                </div>
                <p className="text-sm text-amber-900/85 mt-1 leading-relaxed">
                  You have collected ₹{floatingCash.toLocaleString('en-IN')} in customer cash. New orders are paused until floating cash is submitted.
                </p>
                <div className="mt-3 pt-3 border-t border-amber-200/70 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2">
                  <span className="text-xs font-semibold text-amber-900">
                    Contact for cash submission:
                  </span>
                  <a
                    href="tel:+919369797768"
                    className="inline-flex items-center justify-center gap-2 bg-amber-600 hover:bg-amber-700 text-white font-bold text-sm px-4 py-2 rounded-xl transition-all shadow-sm active:scale-95"
                  >
                    <Phone size={15} />
                    +91 9369797768
                  </a>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Searching Status Radar Card */}
        {isOnline && !isFloatingCashBlocked && (
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
            refreshActiveOrders?.();
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
