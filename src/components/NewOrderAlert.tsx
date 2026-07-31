import React, { useState, useEffect } from 'react';
import { Order } from '../types';
import { MapPin, Navigation, Map, DollarSign, Crosshair, ChevronLeft } from 'lucide-react';
import { playOrderAlertSound } from '../utils/audioNotifier';

interface NewOrderAlertProps {
  isOpen: boolean;
  onClose: () => void;
  onAccept: (prepTime: number) => void;
  onReject?: (reason?: string) => void;
  order: Order;
}

export const NewOrderAlert: React.FC<NewOrderAlertProps> = ({ isOpen, onClose, onAccept, onReject, order }) => {
  const [rejectStep, setRejectStep] = useState(false);
  const [rejectReason, setRejectReason] = useState('');
  
  useEffect(() => {
    if (isOpen && !rejectStep) {
      playOrderAlertSound();
    }
  }, [isOpen, rejectStep]);

  // Reset state when the modal opens/closes
  useEffect(() => {
    if (isOpen) {
      setRejectStep(false);
      setRejectReason('');
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleConfirmAccept = () => {
    onAccept(10); // arbitrary time
    onClose();
  };

  const handleRejectClick = () => {
    setRejectStep(true);
  };

  const handleFinalReject = () => {
    if (onReject) onReject(rejectReason || 'User rejected');
    onClose();
  };

  const REASONS = [
    'Vehicle breakdown',
    'Too far away',
    'Heavy traffic',
    'Order incorrect',
    'Other reason'
  ];

  return (
    <div 
      className="fixed inset-0 z-[9999] flex items-end justify-center bg-black/50 sm:items-center transition-opacity"
      onClick={onClose}
    >
      <div 
        className="w-full bg-[#FFFFFF] rounded-t-3xl sm:rounded-3xl sm:max-w-md overflow-hidden flex flex-col animate-in slide-in-from-bottom-full sm:slide-in-from-bottom-0 sm:fade-in duration-300 relative"
        onClick={e => e.stopPropagation()}
      >
        
        {!rejectStep ? (
          <>
            {/* Header content */}
            <div className="bg-emerald-50 p-6 flex flex-col items-center relative overflow-hidden">
               {/* Background pulse effect */}
               <div className={`absolute inset-0 bg-emerald-500/10 animate-pulse`}></div>
               
               <div className="relative z-10 w-20 h-20 rounded-full border-4 border-emerald-100 flex items-center justify-center mb-3 bg-white shadow-sm">
                 <div className="text-emerald-500 animate-bounce mt-2">
                   <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                     <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"></path>
                     <path d="M13.73 21a2 2 0 0 1-3.46 0"></path>
                   </svg>
                 </div>
               </div>
               
               <h2 className="relative z-10 text-xl font-black text-slate-900 tracking-tight uppercase">New Delivery Request</h2>
            </div>

            <div className="p-6 space-y-6">
              {/* Earnings Card */}
              <div className="bg-slate-50 rounded-2xl p-4 border border-slate-100 flex items-center justify-between">
                <div>
                   <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest mb-1 mt-0.5">Estimated Earning</p>
                   <p className="text-3xl font-black text-slate-900 tracking-tight leading-none">₹{order.total ? (parseFloat(order.total) * 0.15).toFixed(0) : '45'}</p>
                </div>
                <div className="text-right">
                   <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest mb-1 mt-0.5">Extra Earning</p>
                   <p className="text-xl font-bold text-emerald-600 leading-none">+ ₹15</p>
                </div>
              </div>

              <div className="relative">
                 <div className="absolute top-2.5 left-2.5 bottom-2.5 w-0.5 bg-slate-200"></div>
                 
                 {/* Pickup */}
                 <div className="flex gap-4 relative">
                    <div className="w-5 h-5 bg-blue-50 border-4 border-white rounded-full shadow-sm z-10 flex flex-col mt-0.5 shrink-0">
                      <div className="w-full h-full rounded-full bg-blue-500 border border-blue-600 shadow-sm"></div>
                    </div>
                    <div className="pb-6">
                       <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest leading-none mb-1.5">Pickup Location</p>
                       <p className="text-[15px] font-bold text-slate-900 leading-tight">Gourmet Kitchen</p>
                       <p className="text-[13px] font-medium text-blue-600 mt-1 flex items-center gap-1"><Navigation size={12}/> 2.5 km away</p>
                    </div>
                 </div>

                 {/* Drop */}
                 <div className="flex gap-4 relative">
                    <div className="w-5 h-5 bg-rose-50 border-4 border-white rounded-full shadow-sm z-10 flex flex-col mt-0.5 shrink-0">
                       <div className="w-full h-full rounded-full bg-rose-500 border border-rose-600 shadow-sm"></div>
                    </div>
                    <div>
                       <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest leading-none mb-1.5">Drop Customer</p>
                       <p className="text-[15px] font-bold text-slate-900 leading-tight">{order.address || 'Civil Lines, Prayagraj'}</p>
                       <p className="text-[13px] font-medium text-slate-500 mt-1 flex items-center gap-1"><Map size={12}/> 4.1 km delivery</p>
                    </div>
                 </div>
              </div>

            </div>

            {/* Action Buttons */}
            <div className="p-4 bg-slate-50 border-t border-slate-100 flex gap-3">
              <button 
                onClick={handleRejectClick}
                className="flex-1 py-4 px-4 bg-white border-2 border-slate-200 text-slate-600 font-bold rounded-2xl active:scale-95 transition-transform uppercase tracking-wider text-[14px]"
              >
                Reject
              </button>
              <button 
                onClick={handleConfirmAccept}
                className="flex-[2] py-4 px-4 bg-blue-600 text-white font-bold rounded-2xl active:scale-95 transition-transform uppercase tracking-wider text-[14px] shadow-lg shadow-blue-200"
              >
                Accept Gig
              </button>
            </div>
          </>
        ) : (
          <div className="p-6">
            <div className="flex items-center gap-2 mb-6">
              <button onClick={() => setRejectStep(false)} className="w-8 h-8 flex items-center justify-center rounded-full bg-slate-100 text-slate-600 active:scale-95">
                <ChevronLeft size={20} />
              </button>
              <h3 className="text-xl font-bold text-slate-900">Reason for Rejection</h3>
            </div>
            
            <div className="space-y-3 mb-6">
              {REASONS.map((reason) => (
                <button
                  key={reason}
                  onClick={() => setRejectReason(reason)}
                  className={`w-full text-left px-4 py-3 rounded-xl border ${rejectReason === reason ? 'border-rose-500 bg-rose-50 text-rose-700' : 'border-slate-200 bg-white text-slate-700'} font-medium transition-colors`}
                >
                  {reason}
                </button>
              ))}
            </div>

            <button 
              onClick={handleFinalReject}
              disabled={!rejectReason}
              className="w-full h-[52px] bg-rose-500 text-white font-bold rounded-xl disabled:opacity-50 disabled:cursor-not-allowed transition-opacity uppercase tracking-wider"
            >
              Submit & Reject
            </button>
          </div>
        )}

      </div>
    </div>
  );
};
