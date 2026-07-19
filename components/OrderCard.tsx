import React from 'react';
import { Clock, Navigation, MapPin, Package, ChevronsRight, IndianRupee } from 'lucide-react';
import { Order } from '../types';

interface OrderCardProps {
  order: Order;
  onClick: () => void;
  onUpdateStatus: (e: React.MouseEvent) => void;
  isCompact?: boolean;
}

export const OrderCard: React.FC<OrderCardProps> = ({ order, onClick, onUpdateStatus, isCompact = false }) => {
  // Parse time
  let timeRemaining = parseInt(order.time.split(':')[0]);
  if (isNaN(timeRemaining)) timeRemaining = 15;
  
  const isRushOrder = timeRemaining < 0;

  const btnText = order.status === 'Incoming' ? 'Accept Delivery' : 
                  order.status === 'Accepted' || order.status === 'Preparing' ? 'Navigate to Outlet' : 
                  order.status === 'Ready' ? 'Deliver to Customer' : 
                  (order.status === 'Completed' || order.status === 'Delivered') ? 'Delivery Complete' : 'Complete Delivery';
                  
  const btnBg = order.status === 'Incoming' ? 'bg-[#22C55E]' : 
                order.status === 'Ready' ? 'bg-[#6366F1]' : 
                (order.status === 'Completed' || order.status === 'Delivered') ? 'bg-slate-200 text-slate-500 cursor-default' :
                'bg-[#1E90FF]';

  return (
    <div 
      onClick={onClick}
      className={`bg-white rounded-[20px] mb-4 mx-4 border ${isRushOrder ? 'border-red-200 shadow-sm shadow-red-100' : 'border-slate-200'} cursor-pointer active:scale-[0.98] transition-all overflow-hidden ${isCompact ? '' : 'lg:mx-0'}`}
    >
      {/* Header section with amount, timer, and payment type */}
      <div className={`p-4 border-b ${isRushOrder ? 'bg-red-50/50 border-red-100' : 'bg-slate-50/50 border-slate-100'}`}>
        <div className="flex justify-between items-start">
          <div className="flex flex-col">
             <span className="text-[12px] font-bold tracking-widest text-slate-500 uppercase mb-0.5">Order #{order.id}</span>
             <div className="flex items-center gap-1">
               <span className="text-[22px] font-black text-slate-900 tracking-tight">₹{order.total}</span>
               {order.paymentStatus === 'Paid' ? (
                 <span className="bg-emerald-100 text-emerald-700 text-[10px] font-bold px-1.5 py-0.5 rounded ml-1">PAID</span>
               ) : (
                 <span className="bg-rose-100 text-rose-700 text-[10px] font-bold px-1.5 py-0.5 rounded ml-1">COD</span>
               )}
             </div>
          </div>
          
          <div className="flex flex-col items-end">
            <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[13px] font-bold ${isRushOrder ? 'bg-red-100 text-red-700' : 'bg-blue-100 text-blue-700'}`}>
              <Clock size={14} />
              <span>{order.time}</span>
            </div>
            <span className="text-[12px] font-bold text-slate-500 mt-2">4.2 km total dist</span>
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
              <h4 className="text-[14px] font-bold text-slate-900 leading-tight">Biryani House</h4>
              <span className="text-[11px] font-bold text-slate-500 bg-slate-100 px-2 py-0.5 rounded uppercase">Pickup</span>
            </div>
            <p className="text-[13px] text-slate-500 mt-0.5 line-clamp-1">Sector 15, City Center</p>
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
            <p className="text-[13px] text-slate-500 mt-0.5 line-clamp-1">{order.address || 'House No. 42, Green Avenue'}</p>
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
            if (order.status !== 'Completed' && order.status !== 'Delivered') {
              onUpdateStatus(e);
            } else {
              e.stopPropagation();
            }
          }}
          className={`w-full h-[50px] rounded-[14px] font-bold text-[15px] tracking-wide flex items-center justify-center gap-2 transition-colors ${btnBg} ${order.status !== 'Completed' && order.status !== 'Delivered' ? 'text-white active:bg-opacity-90' : ''}`}
        >
          {order.status === 'Accepted' || order.status === 'Preparing' || order.status === 'Ready' ? <Navigation size={18} className="" /> : null}
          {order.status === 'Incoming' ? <ChevronsRight size={18} className="" /> : null}
          {btnText}
        </button>
      </div>
    </div>
  );
};
