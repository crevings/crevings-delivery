import React from 'react';
import { Navigation, MapPin, Phone, ShieldCheck, ChevronRight } from 'lucide-react';
import { Order } from '../types';

interface ActiveOrderCardProps {
  order: Order;
  onOpenDetails: (order: Order) => void;
}

export const ActiveOrderCard: React.FC<ActiveOrderCardProps> = ({ order, onOpenDetails }) => {
  if (!order) return null;

  const isPickupStage = ['ACCEPTED', 'PREPARING', 'READY', 'NEW', 'PENDING_ACCEPT'].includes(order.status);
  const statusLabel = isPickupStage ? 'Pickup from Restaurant' : 'On the way to Customer';
  const statusBadgeColor = isPickupStage ? 'bg-amber-500/10 text-amber-600 border-amber-500/20' : 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20';

  return (
    <div className="fixed bottom-20 left-4 right-4 z-40 sm:max-w-md sm:mx-auto">
      <div 
        onClick={() => onOpenDetails(order)}
        className="bg-slate-900 text-white rounded-2xl p-4 shadow-2xl border border-slate-800 backdrop-blur-lg cursor-pointer active:scale-[0.99] transition-transform duration-200"
      >
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-ping" />
            <span className="text-xs font-bold uppercase tracking-wider text-slate-300">Active Order #{order.displayOrderNumber || order.orderId?.slice(-6)}</span>
          </div>
          <span className={`text-[11px] font-extrabold px-2.5 py-0.5 rounded-full border ${statusBadgeColor}`}>
            {order.status}
          </span>
        </div>

        <div className="py-3 flex items-center justify-between">
          <div className="space-y-0.5 max-w-[75%]">
            <h4 className="text-sm font-bold text-white truncate">
              {isPickupStage ? 'Gourmet Kitchen / Branch' : (order.customerDetails?.name || order.customer || 'Customer')}
            </h4>
            <p className="text-xs text-slate-400 truncate flex items-center gap-1">
              <MapPin size={13} className="text-emerald-400 shrink-0" />
              {isPickupStage ? 'Pickup Restaurant' : (order.customerDetails?.address || order.address || 'Civil Lines, Prayagraj')}
            </p>
          </div>

          <div className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-full bg-emerald-500 text-white flex items-center justify-center shadow-lg shadow-emerald-900/50">
              <ChevronRight size={20} />
            </div>
          </div>
        </div>

        <div className="pt-2 flex items-center justify-between text-xs text-slate-400 border-t border-slate-800/80">
          <span className="flex items-center gap-1.5 font-medium">
            <Navigation size={13} className="text-blue-400" />
            {statusLabel}
          </span>
          <span className="font-bold text-emerald-400">
            Tap to manage
          </span>
        </div>
      </div>
    </div>
  );
};
