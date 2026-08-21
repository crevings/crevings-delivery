import React from 'react';
import { Clock, Navigation, MapPin, Package, ChevronsRight } from 'lucide-react';
import { Order } from '@/types';
import { openMapsNavigation } from '@/utils/navigation';

interface OrderCardProps {
  order: Order;
  onClick: () => void;
  onUpdateStatus?: (e: React.MouseEvent) => void;
  isCompact?: boolean;
}

export const OrderCard: React.FC<OrderCardProps> = ({ order, onClick, onUpdateStatus, isCompact = false }) => {
  // Parse time
  let timeRemaining = parseInt(order.time.split(':')[0]);
  if (isNaN(timeRemaining)) timeRemaining = 15;
  
  const isRushOrder = timeRemaining < 0;

  const s = (order.status || '').toUpperCase();
  const isIncoming = s === 'INCOMING';
  const isCompleted = s === 'COMPLETED' || s === 'DELIVERED';
  const isPickedUp = s === 'OUT FOR DELIVERY' || s === 'OUT_FOR_DELIVERY' || s === 'PICKED UP' || s === 'REACHED_CUSTOMER' || s === 'REACHED CUSTOMER' || s === 'ARRIVED DESTINATION';
  const isArrivedAtRestaurant = s === 'DRIVER_ARRIVED' || s === 'DRIVER ARRIVED' || s === 'ARRIVED' || s === 'ARRIVED AT RESTAURANT';

  let btnText = 'Navigate to Outlet';
  let btnBg = 'bg-[#1E90FF]';

  if (isIncoming) {
    btnText = 'Accept Delivery';
    btnBg = 'bg-[#22C55E]';
  } else if (isCompleted) {
    btnText = 'Delivery Complete';
    btnBg = 'bg-slate-200 text-slate-500 cursor-default';
  } else if (isPickedUp) {
    // Only after driver arrived at restaurant AND entered the restaurant OTP
    btnText = 'Deliver to Customer';
    btnBg = 'bg-[#6366F1]';
  } else if (isArrivedAtRestaurant) {
    btnText = 'Enter Restaurant OTP';
    btnBg = 'bg-[#F59E0B]';
  } else {
    // Accepted / Preparing / Ready (before driver arrived & entered OTP)
    btnText = 'Navigate to Outlet';
    btnBg = 'bg-[#1E90FF]';
  }

  const displayNum = order.displayOrderNumber || order.displayOrderId || (order.id && order.id.length > 12 ? order.id.slice(-8).toUpperCase() : order.id);

  return (
    <div 
      onClick={onClick}
      className={`bg-white rounded-[20px] mb-4 border ${isRushOrder ? 'border-red-200 shadow-sm shadow-red-100' : 'border-slate-200/90 shadow-xs'} cursor-pointer active:scale-[0.99] transition-all overflow-hidden ${isCompact ? '' : 'w-full'}`}
    >
      {/* Header section with order ID, amount, timer, and payment type */}
      <div className={`p-4 border-b ${isRushOrder ? 'bg-red-50/60 border-red-100' : 'bg-slate-50/70 border-slate-100'}`}>
        <div className="flex justify-between items-start gap-2">
          <div className="flex flex-col min-w-0">
            <span className="text-[12px] font-extrabold tracking-wider text-slate-500 uppercase truncate mb-1">
              Order #{displayNum}
            </span>
            <div className="flex items-center gap-2">
              <span className="text-[22px] font-black text-slate-900 tracking-tight leading-none">₹{order.total}</span>
              {order.paymentStatus === 'Paid' ? (
                <span className="bg-emerald-100 text-emerald-700 text-[10px] font-extrabold px-2 py-0.5 rounded-md">PAID</span>
              ) : (
                <span className="bg-amber-100 text-amber-800 text-[10px] font-extrabold px-2 py-0.5 rounded-md">COD</span>
              )}
            </div>
          </div>
          
          <div className="flex flex-col items-end shrink-0">
            <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-[12px] font-bold ${isRushOrder ? 'bg-red-100 text-red-700' : 'bg-blue-100/80 text-blue-700'}`}>
              <Clock size={13} />
              <span>{order.time}</span>
            </div>
            {order.pickupDistanceKm ? (
              <span className="text-[11px] font-bold text-slate-400 mt-1.5">{order.pickupDistanceKm} km away</span>
            ) : null}
          </div>
        </div>
      </div>

      {/* Locations Timeline */}
      <div className="p-4 relative">
        <div className="absolute left-[27px] top-[40px] bottom-[40px] w-0.5 border-l-2 border-dashed border-slate-200"></div>
        
        {/* Pickup */}
        <div className="flex gap-4 items-start relative z-10 mb-6">
          <div className="w-7 h-7 shrink-0 rounded-full bg-slate-100 border-2 border-slate-200 flex items-center justify-center">
            <div className="w-2 h-2 rounded-full bg-slate-400"></div>
          </div>
          <div className="flex-1">
            <div className="flex justify-between items-start">
              <h4 className="text-[14px] font-bold text-slate-900 leading-tight">{order.restaurantName || 'Restaurant'}</h4>
              <span className="text-[11px] font-bold text-slate-500 bg-slate-100 px-2 py-0.5 rounded uppercase">Pickup</span>
            </div>
            {order.restaurantAddress ? (
              <p className="text-[13px] text-slate-500 mt-0.5 line-clamp-1">{order.restaurantAddress}</p>
            ) : null}
          </div>
        </div>

        {/* Dropoff */}
        <div className="flex gap-4 items-start relative z-10">
          <div className="w-7 h-7 shrink-0 rounded-full bg-blue-50 border-2 border-blue-200 flex items-center justify-center">
            <MapPin size={12} className="text-blue-600" />
          </div>
          <div className="flex-1">
             <div className="flex justify-between items-start">
              <h4 className="text-[14px] font-bold text-slate-900 leading-tight">{order.customer}</h4>
              <span className="text-[11px] font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded uppercase">Dropoff</span>
            </div>
            <p className="text-[13px] text-slate-500 mt-0.5 line-clamp-1">{order.address || 'Address not available'}</p>
          </div>
        </div>
      </div>

      {/* order info sneak peek */}
      <div className="px-4 py-3 bg-slate-50 border-t border-b border-slate-100 flex items-center gap-2">
         <Package size={14} className="text-slate-400 shrink-0" />
         <p className="text-[12px] font-medium text-slate-600 truncate">{order.items}</p>
      </div>

      <div className="p-4 pt-4">
        {/* CTA Button */}
        <button 
          onClick={(e) => {
            e.stopPropagation();
            if (isIncoming) {
              onUpdateStatus?.(e);
            } else if (isCompleted) {
              // no-op
            } else if (isPickedUp) {
              // Food picked up & OTP entered -> Deliver to Customer
              openMapsNavigation(order.address, order.customer);
            } else if (isArrivedAtRestaurant) {
              // Arrived at restaurant -> open order details to enter restaurant OTP
              onClick();
            } else {
              // Heading to restaurant -> navigate to outlet
              openMapsNavigation(order.restaurantAddress, order.restaurantName);
            }
          }}
          className={`w-full h-[50px] rounded-[14px] font-bold text-[15px] tracking-wide flex items-center justify-center gap-2 transition-colors ${btnBg} ${!isCompleted ? 'text-white active:bg-opacity-90' : ''}`}
        >
          {(!isIncoming && !isCompleted && !isArrivedAtRestaurant) || isPickedUp ? <Navigation size={18} className="" /> : null}
          {isIncoming ? <ChevronsRight size={18} className="" /> : null}
          {isArrivedAtRestaurant ? <Package size={18} className="" /> : null}
          {btnText}
        </button>
      </div>
    </div>
  );
};
