import React, { useState, useEffect } from 'react';
import { 
  ArrowLeft, Headset, Store, User, Phone, Navigation, MessageCircle, 
  Info, ShoppingBag, ChevronDown, ChevronUp, CheckCircle, Truck, Camera, X
} from 'lucide-react';
import { Order } from '../types';
import { ChatView } from './ChatView';

import { BASE_URL } from '../api/fetcher';

interface OrderDetailViewProps {
  order: Order;
  onBack: () => void;
  onUpdateOrderStatus?: (orderId: string) => void;
}

export const OrderDetailView: React.FC<OrderDetailViewProps> = ({ order, onBack, onUpdateOrderStatus }) => {
  const [currentStatus, setCurrentStatus] = useState(order.status || 'Accepted');
  const [showItems, setShowItems] = useState(false);
  const [showProgress, setShowProgress] = useState(true);
  const [showChat, setShowChat] = useState(false);
  
  // Sheet states
  const [showPickupOtpSheet, setShowPickupOtpSheet] = useState(false);
  const [showPhotoSheet, setShowPhotoSheet] = useState(false);
  const [showDeliveryConfirmSheet, setShowDeliveryConfirmSheet] = useState(false);
  const [showPaymentSelectionSheet, setShowPaymentSelectionSheet] = useState(false);
  const [showDeliveryOtpSheet, setShowDeliveryOtpSheet] = useState(false);

  const [otpValue, setOtpValue] = useState(['', '', '', '', '', '']);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [selectedPayment, setSelectedPayment] = useState<'Cash' | 'UPI' | null>(null);
  const [isVerifying, setIsVerifying] = useState(false);

  useEffect(() => {
    if (order.status) {
      setCurrentStatus(order.status);
    }
  }, [order.status]);

  const isCOD = order.paymentStatus !== 'Paid';
  
  const statusSteps = [
    { label: 'Accepted Order', key: 'Accepted' },
    { label: 'Arrived at Restaurant', key: 'Arrived' },
    { label: 'Order Picked Up', key: 'Picked Up' },
    { label: 'Arrived at Customer Location', key: 'Arrived Destination' },
    { label: 'Order Delivered', key: 'Delivered' }
  ];

  // Logic to determine active step
  const getStatusIndex = () => {
    const s = (currentStatus || '').toUpperCase();
    switch(s) {
      case 'ACCEPTED':
      case 'PREPARING': return 0;
      case 'ARRIVED':
      case 'READY': return 1;
      case 'OUT FOR DELIVERY':
      case 'OUT_FOR_DELIVERY':
      case 'PICKED UP': return 2;
      case 'ARRIVED DESTINATION': return 3;
      case 'COMPLETED':
      case 'DELIVERED': return 4;
      default: return 0;
    }
  };
  
  const currentStatusIndex = getStatusIndex();

  const getButtonText = () => {
    const s = (currentStatus || '').toUpperCase();
    switch(s) {
      case 'ACCEPTED':
      case 'PREPARING': return 'Arrived at Restaurant';
      case 'ARRIVED':
      case 'READY': return 'Order Picked Up';
      case 'OUT FOR DELIVERY':
      case 'OUT_FOR_DELIVERY':
      case 'PICKED UP': return 'Arrived at Customer Location';
      case 'ARRIVED DESTINATION': return 'Order Delivered';
      case 'COMPLETED':
      case 'DELIVERED': return 'Order Delivered';
      default: return 'Arrived at Restaurant';
    }
  };

  const handleAction = () => {
    const btnText = getButtonText();
    
    if (btnText === 'Arrived at Restaurant' || btnText === 'Order Picked Up') {
      setOtpValue(['', '', '', '', '', '']);
      setShowPickupOtpSheet(true);
      return;
    }

    if (btnText === 'Arrived at Customer Location') {
      setCurrentStatus('ARRIVED DESTINATION');
      if (onUpdateOrderStatus) {
        onUpdateOrderStatus(order.id);
      }
      return;
    }
    
    if (btnText === 'Order Delivered' || btnText === 'Complete Delivery') {
      setShowDeliveryConfirmSheet(true);
      return;
    }
    
    // Normal progress
    if (onUpdateOrderStatus) {
      onUpdateOrderStatus(order.id);
    }
    onBack();
  };

  const handlePickupOtpVerify = async () => {
    const pin = otpValue.join('').trim();
    setIsVerifying(true);
    try {
      const res = await fetch(`${BASE_URL}/delivery/orders/${order.id}/verify-pickup`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ pin })
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        alert(data.message || "Invalid Restaurant Pickup PIN");
        setIsVerifying(false);
        return;
      }
      setCurrentStatus('OUT FOR DELIVERY');
    } catch (err) {
      console.error("Pickup OTP verification error:", err);
      setCurrentStatus('OUT FOR DELIVERY');
    } finally {
      setIsVerifying(false);
    }

    setShowPickupOtpSheet(false);
    if (onUpdateOrderStatus) {
      onUpdateOrderStatus(order.id);
    }
  };

  const handleDeliveryConfirm = () => {
    setShowDeliveryConfirmSheet(false);
    if (isCOD) {
      setShowPaymentSelectionSheet(true);
    } else {
      setOtpValue(['', '', '', '', '', '']);
      setShowDeliveryOtpSheet(true);
    }
  };

  const handlePaymentSelection = () => {
    if (!selectedPayment) return;
    setShowPaymentSelectionSheet(false);
    setOtpValue(['', '', '', '', '', '']);
    setShowDeliveryOtpSheet(true);
  };

  const handleDeliveryOtpVerify = async () => {
    const pin = otpValue.join('').trim();
    setIsVerifying(true);
    try {
      const res = await fetch(`${BASE_URL}/delivery/orders/${order.id}/complete`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ pin })
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        alert(data.message || "Invalid Customer Delivery PIN");
        setIsVerifying(false);
        return;
      }
      setCurrentStatus('COMPLETED');
    } catch (err) {
      console.error("Delivery OTP verification error:", err);
      setCurrentStatus('COMPLETED');
    } finally {
      setIsVerifying(false);
    }

    setShowDeliveryOtpSheet(false);
    if (onUpdateOrderStatus) {
      onUpdateOrderStatus(order.id);
    }
    onBack();
  };

  const handlePhotoCapture = () => {
    setShowPhotoSheet(false);
    if (onUpdateOrderStatus) {
      onUpdateOrderStatus(order.id);
    }
    onBack();
  };

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const url = URL.createObjectURL(file);
      setPhotoPreview(url);
    }
  };

  if (showChat) {
    return <ChatView order={order} onBack={() => setShowChat(false)} />;
  }

  return (
    <div className="fixed inset-0 z-[150] bg-[#FFFFFF] flex flex-col animate-in slide-in-from-right duration-300 overflow-y-auto pb-28">
      
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-4 bg-[#FFFFFF] sticky top-0 z-10 shrink-0">
        <div className="flex items-center gap-4">
          <button onClick={onBack} className="p-1 -ml-1 text-slate-700 active:bg-slate-50 rounded-full">
            <ArrowLeft size={24} />
          </button>
          <h1 className="text-[20px] font-bold text-slate-800 tracking-tight">Order #{order.id}</h1>
        </div>
        <button className="text-slate-500 p-1 bg-slate-50 rounded-full">
          <Headset size={22} />
        </button>
      </div>

      <div className="p-4 space-y-4">
        
        {/* Quick Stats Card */}
        <div className="bg-[#FFFFFF] rounded-2xl border border-[#E5E7EB] flex divide-x divide-slate-100">
          <div className="flex-1 p-4 flex flex-col items-center justify-center text-center">
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wide mb-1">Distance</span>
            <span className="text-[16px] font-black text-slate-800">6.8 km</span>
          </div>
          <div className="flex-1 p-4 flex flex-col items-center justify-center text-center">
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wide mb-1">Est. Time</span>
            <span className="text-[16px] font-black text-slate-800">35 mins</span>
          </div>
          <div className="flex-1 p-4 flex flex-col items-center justify-center text-center">
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wide mb-1">Earnings</span>
            <span className="text-[16px] font-black text-emerald-600">₹{order.total}</span>
          </div>
        </div>

        {/* Order Info */}
        <div className="bg-[#FFFFFF] rounded-2xl border border-[#E5E7EB] p-4">
          <div className="flex justify-between items-center mb-3">
            <span className="text-slate-500 text-[13px] font-bold uppercase tracking-wide">Order #{order.id}</span>
            <span className={`px-2 py-1 rounded-md text-[11px] font-bold uppercase tracking-wider ${order.status === 'Preparing' ? 'bg-orange-50 text-orange-600' : 'bg-blue-50 text-blue-600'}`}>{order.status}</span>
          </div>
          <div className="pt-3 border-t border-slate-100 flex justify-between items-center">
            <div>
              <p className="text-[11px] font-bold text-slate-500 tracking-wide uppercase mb-0.5">Payment Method</p>
              <p className="text-[15px] font-bold text-slate-800">{isCOD ? 'Cash on Delivery (COD)' : 'Pre-Paid'}</p>
            </div>
            {isCOD && (
              <div className="px-3 py-1.5 bg-red-50 rounded-xl">
                <p className="text-[12px] font-bold text-red-600 border-b border-red-200 pb-0.5 mb-0.5">Collect Cash</p>
                <p className="text-[15px] font-black text-red-700">₹{order.total || '0'}</p>
              </div>
            )}
          </div>
        </div>

        {/* Pickup Info */}
        <div className="bg-[#FFFFFF] rounded-2xl border border-[#E5E7EB] p-4">
          <div className="flex gap-3 mb-4">
            <div className="w-12 h-12 bg-slate-100 rounded-2xl flex items-center justify-center shrink-0">
              <Store className="text-slate-500" size={24} />
            </div>
            <div>
              <p className="text-[11px] font-bold text-slate-500 tracking-wide uppercase mb-0.5">Pickup From</p>
              <h3 className="font-bold text-[17px] text-slate-900 leading-tight mb-1">Biryani House</h3>
              <p className="text-[13px] text-slate-500 line-clamp-2 leading-snug">123 Food Street, Koramangala</p>
            </div>
          </div>
          <div className="flex gap-3">
            <button className="flex-1 h-12 bg-blue-50 text-blue-600 font-bold rounded-xl flex items-center justify-center gap-2 active:bg-blue-100 transition-colors">
              <Phone size={18} />
              Call
            </button>
            <button className="flex-1 h-12 bg-blue-50 text-blue-600 font-bold rounded-xl flex items-center justify-center gap-2 active:bg-blue-100 transition-colors">
              <Navigation size={18} className="rotate-45" />
              Navigate
            </button>
          </div>
        </div>

        {/* Dropoff Info */}
        <div className="bg-[#FFFFFF] rounded-2xl border border-[#E5E7EB] p-4">
          <div className="flex gap-3 mb-4">
            <div className="w-12 h-12 bg-slate-100 rounded-full flex items-center justify-center shrink-0">
              <User className="text-slate-500" size={24} />
            </div>
            <div>
              <p className="text-[11px] font-bold text-slate-500 tracking-wide uppercase mb-0.5">Deliver To</p>
              <h3 className="font-bold text-[17px] text-slate-900 leading-tight mb-1">Rahul S.</h3>
              <p className="text-[13px] text-slate-500 line-clamp-2 leading-snug">Apartment 4B, Green View, HSR Layout</p>
            </div>
          </div>
          <div className="flex gap-3">
            <button className="w-12 h-12 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center active:bg-blue-100 transition-colors shrink-0">
              <Phone size={20} />
            </button>
            <button 
              onClick={() => setShowChat(true)}
              className="w-12 h-12 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center active:bg-blue-100 transition-colors shrink-0"
            >
              <MessageCircle size={20} />
            </button>
            <button className="h-12 px-4 bg-blue-50 text-blue-600 font-bold rounded-xl flex items-center justify-center gap-2 active:bg-blue-100 transition-colors flex-1">
              <Navigation size={18} className="rotate-45" />
              Navigate
            </button>
          </div>
        </div>

        {/* Customer Instructions */}
        <div className="bg-emerald-50 rounded-2xl p-4">
          <div className="flex gap-2 items-start">
            <Info size={18} className="text-emerald-600 shrink-0 mt-0.5" />
            <div>
              <p className="text-[11px] font-bold text-emerald-700 tracking-wide uppercase mb-1">Customer Instructions</p>
              <p className="text-[15px] font-medium text-emerald-900 leading-snug">
                {order.customerNote || "Please don't ring the bell. Leave the order at the door."}
              </p>
            </div>
          </div>
        </div>

        {/* Order Items Wrapper */}
        <div className="bg-[#FFFFFF] rounded-2xl border border-[#E5E7EB] overflow-hidden">
          <button 
            className="w-full flex items-center justify-between p-4 bg-white active:bg-slate-50 transition-colors"
            onClick={() => setShowItems(!showItems)}
          >
            <div className="flex items-center gap-3">
              <ShoppingBag size={20} className="text-slate-700" />
              <span className="font-bold text-slate-900 text-[16px]">Order Items ({order.items?.split(',').length || 2})</span>
            </div>
            <div className={`text-slate-400 transition-transform duration-300 ${showItems ? 'rotate-180' : 'rotate-0'}`}>
              <ChevronDown size={20} />
            </div>
          </button>
          
          <div className={`grid transition-all duration-300 ease-in-out ${showItems ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0'}`}>
            <div className="overflow-hidden">
              <div className="px-5 pb-5 pt-1 space-y-3 border-t border-slate-100 bg-white">
                <p className="text-[15px] text-slate-700">1 x Chicken Biryani</p>
                <p className="text-[15px] text-slate-700">2 x Coke</p>
                {order.items && order.items !== '1 x Chicken Biryani, 2 x Coke' && (
                  order.items.split(',').map((item, idx) => (
                    <p key={idx} className="text-[15px] text-slate-700">{item.trim()}</p>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Order Progress */}
        <div className="bg-[#FFFFFF] rounded-2xl border border-[#E5E7EB] overflow-hidden">
          <button 
            className="w-full flex items-center justify-between p-4 bg-white active:bg-slate-50 transition-colors"
            onClick={() => setShowProgress(!showProgress)}
          >
            <div className="flex items-center gap-3">
              <Truck size={20} className="text-emerald-600" />
              <span className="font-bold text-slate-900 text-[16px]">Order Progress</span>
            </div>
            <div className={`text-slate-400 transition-transform duration-300 ${showProgress ? 'rotate-180' : 'rotate-0'}`}>
              <ChevronDown size={20} />
            </div>
          </button>
          
          <div className={`grid transition-all duration-300 ease-in-out ${showProgress ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0'}`}>
            <div className="overflow-hidden">
              <div className="px-7 py-5 border-t border-slate-100 bg-white">
                <div className="relative border-l border-slate-300 ml-3 space-y-8">
                  {statusSteps.map((step, idx) => {
                    const isCompleted = idx <= currentStatusIndex;
                    return (
                      <div key={step.key} className="relative pl-6">
                        <div className={`absolute -left-[9px] top-0 w-4 h-4 rounded-full border-2 ${isCompleted ? 'bg-white border-slate-800' : 'bg-white border-slate-300'}`}></div>
                        <span className={`text-[15px] font-medium ${isCompleted ? 'text-slate-800' : 'text-slate-400'}`}>
                          {step.label}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Earnings Breakdown */}
        <div className="bg-[#FFFFFF] rounded-2xl border border-[#E5E7EB] p-5">
          <h3 className="font-bold text-[17px] text-slate-900 mb-4">Earnings Breakdown</h3>
          <div className="space-y-4">
            <div className="flex justify-between text-[15px]">
              <span className="text-slate-600 font-medium">Base Pay</span>
              <span className="font-medium text-slate-800">₹14.00</span>
            </div>
            <div className="flex justify-between text-[15px]">
              <span className="text-slate-600 font-medium">Distance Pay (6.8 km)</span>
              <span className="font-medium text-slate-800">₹54.40</span>
            </div>
            <div className="flex justify-between text-[15px]">
              <span className="text-slate-600 font-medium">Order Value Commission (8%)</span>
              <span className="font-medium text-slate-800">₹73.60</span>
            </div>
            <div className="flex justify-between text-[15px]">
              <span className="text-slate-600 font-medium">Membership Bonus</span>
              <span className="font-medium text-slate-800">₹20.00</span>
            </div>
            <div className="flex justify-between text-[15px]">
              <span className="text-slate-600 font-medium">Petrol Incentive</span>
              <span className="font-medium text-slate-800">₹15.00</span>
            </div>
            <div className="pt-4 border-t border-slate-100 flex justify-between items-center mt-1">
              <span className="font-bold text-[18px] text-slate-900">Total Earnings</span>
              <span className="font-black text-[18px] text-slate-900">₹{order.total || '177.00'}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Floating Bottom Button */}
      <div className="fixed bottom-0 left-0 right-0 p-4 bg-white border-t border-slate-200 z-20">
        <button 
          onClick={handleAction}
          className="w-full h-14 bg-blue-600 active:bg-blue-700 text-white rounded-xl font-bold text-[16px] flex items-center justify-center transition-colors"
        >
          {getButtonText()}
        </button>
      </div>

      {/* Pickup OTP Bottom Sheet */}
      {showPickupOtpSheet && (
        <div className="fixed inset-0 z-[250] flex flex-col justify-end">
          <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" onClick={() => setShowPickupOtpSheet(false)}></div>
          <div className="relative bg-white rounded-t-3xl p-6 pb-8 animate-in slide-in-from-bottom duration-300">
            <div className="flex justify-between items-center mb-6">
              <h3 className="font-bold text-[20px] text-slate-800">Enter Pickup OTP</h3>
              <button onClick={() => setShowPickupOtpSheet(false)} className="w-8 h-8 flex items-center justify-center bg-slate-100 rounded-full text-slate-500 active:bg-slate-200">
                <X size={20} />
              </button>
            </div>
            <p className="text-slate-500 mb-6 text-[15px]">Ask restaurant for the 6-digit PIN to confirm pickup.</p>
            <div className="flex gap-2 justify-between mb-8">
              {[0, 1, 2, 3, 4, 5].map((index) => (
                <input 
                  key={index}
                  type="text"
                  maxLength={1}
                  className="w-12 h-14 text-center text-2xl font-bold bg-slate-50 border border-slate-200 rounded-xl focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none"
                  value={otpValue[index]}
                  onChange={(e) => {
                    const newOtp = [...otpValue];
                    newOtp[index] = e.target.value.replace(/[^0-9]/g, '');
                    setOtpValue(newOtp);
                  }}
                />
              ))}
            </div>
            <button 
              onClick={handlePickupOtpVerify}
              className="w-full h-14 bg-blue-600 active:bg-blue-700 text-white rounded-xl font-bold text-[16px] flex items-center justify-center transition-colors"
            >
              Verify OTP
            </button>
          </div>
        </div>
      )}

      {/* Delivery Confirm Sheet */}
      {showDeliveryConfirmSheet && (
        <div className="fixed inset-0 z-[250] flex flex-col justify-end">
          <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" onClick={() => setShowDeliveryConfirmSheet(false)}></div>
          <div className="relative bg-white rounded-t-3xl p-6 pb-8 animate-in slide-in-from-bottom duration-300">
            <div className="flex justify-between items-center mb-6">
              <h3 className="font-bold text-[20px] text-slate-800">Confirm Delivery</h3>
              <button onClick={() => setShowDeliveryConfirmSheet(false)} className="w-8 h-8 flex items-center justify-center bg-slate-100 rounded-full text-slate-500 active:bg-slate-200">
                <X size={20} />
              </button>
            </div>
            <p className="text-slate-500 mb-6 text-[15px]">Are you sure you want to mark this order as delivered?</p>
            {isCOD && (
               <div className="bg-red-50 text-red-700 p-4 rounded-xl mb-6">
                 <p className="text-[14px] font-bold">⚠️ Collect Payment First</p>
                 <p className="text-[13px] mt-1">Order value is ₹{order.total || '0'}. Please ensure payment is collected before concluding.</p>
               </div>
            )}
            <button 
              onClick={handleDeliveryConfirm}
              className="w-full h-14 bg-blue-600 active:bg-blue-700 text-white rounded-xl font-bold text-[16px] flex items-center justify-center transition-colors mb-3"
            >
              Confirm
            </button>
          </div>
        </div>
      )}

      {/* Payment Selection Sheet */}
      {showPaymentSelectionSheet && (
        <div className="fixed inset-0 z-[250] flex flex-col justify-end">
          <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" onClick={() => setShowPaymentSelectionSheet(false)}></div>
          <div className="relative bg-white rounded-t-3xl p-6 pb-8 animate-in slide-in-from-bottom duration-300">
            <div className="flex justify-between items-center mb-6">
              <h3 className="font-bold text-[20px] text-slate-800">Payment Collection</h3>
              <button onClick={() => setShowPaymentSelectionSheet(false)} className="w-8 h-8 flex items-center justify-center bg-slate-100 rounded-full text-slate-500 active:bg-slate-200">
                <X size={20} />
              </button>
            </div>
            <p className="text-slate-500 mb-6 text-[15px]">Select payment method used by customer to pay ₹{order.total || '0'}.</p>
            
            <div className="space-y-3 mb-8">
               <button 
                  onClick={() => setSelectedPayment('Cash')}
                  className={`w-full p-4 rounded-xl border-2 flex items-center justify-between transition-colors ${selectedPayment === 'Cash' ? 'border-blue-600 bg-blue-50 text-blue-700' : 'border-slate-200 hover:border-slate-300'}`}
               >
                 <span className="font-bold">Cash</span>
                 {selectedPayment === 'Cash' && <CheckCircle size={20} />}
               </button>
               <button 
                  onClick={() => setSelectedPayment('UPI')}
                  className={`w-full p-4 rounded-xl border-2 flex items-center justify-between transition-colors ${selectedPayment === 'UPI' ? 'border-blue-600 bg-blue-50 text-blue-700' : 'border-slate-200 hover:border-slate-300'}`}
               >
                 <span className="font-bold">UPI</span>
                 {selectedPayment === 'UPI' && <CheckCircle size={20} />}
               </button>
            </div>

            <button 
              onClick={handlePaymentSelection}
              disabled={!selectedPayment}
              className={`w-full h-14 rounded-xl font-bold text-[16px] flex items-center justify-center transition-colors ${!selectedPayment ? 'bg-slate-200 text-slate-400' : 'bg-blue-600 active:bg-blue-700 text-white'}`}
            >
              Continue
            </button>
          </div>
        </div>
      )}

      {/* Delivery OTP Sheet */}
      {showDeliveryOtpSheet && (
        <div className="fixed inset-0 z-[250] flex flex-col justify-end">
          <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" onClick={() => setShowDeliveryOtpSheet(false)}></div>
          <div className="relative bg-white rounded-t-3xl p-6 pb-8 animate-in slide-in-from-bottom duration-300">
            <div className="flex justify-between items-center mb-6">
              <h3 className="font-bold text-[20px] text-slate-800">Enter Drop OTP</h3>
              <button onClick={() => setShowDeliveryOtpSheet(false)} className="w-8 h-8 flex items-center justify-center bg-slate-100 rounded-full text-slate-500 active:bg-slate-200">
                <X size={20} />
              </button>
            </div>
            <p className="text-slate-500 mb-6 text-[15px]">Ask customer for the 6-digit PIN to confirm delivery.</p>
            <div className="flex gap-2 justify-between mb-8">
              {[0, 1, 2, 3, 4, 5].map((index) => (
                <input 
                  key={index}
                  type="text"
                  maxLength={1}
                  className="w-12 h-14 text-center text-2xl font-bold bg-slate-50 border border-slate-200 rounded-xl focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none"
                  value={otpValue[index]}
                  onChange={(e) => {
                    const newOtp = [...otpValue];
                    newOtp[index] = e.target.value.replace(/[^0-9]/g, '');
                    setOtpValue(newOtp);
                  }}
                />
              ))}
            </div>
            <button 
              onClick={handleDeliveryOtpVerify}
              className="w-full h-14 bg-blue-600 active:bg-blue-700 text-white rounded-xl font-bold text-[16px] flex items-center justify-center transition-colors"
            >
              Verify OTP
            </button>
          </div>
        </div>
      )}

      {/* Photo Bottom Sheet */}
      {showPhotoSheet && (
        <div className="fixed inset-0 z-[250] flex flex-col justify-end">
          <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" onClick={() => setShowPhotoSheet(false)}></div>
          <div className="relative bg-white rounded-t-3xl p-6 pb-8 animate-in slide-in-from-bottom duration-300">
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-bold text-[20px] text-slate-800">Take Photo</h3>
              <button onClick={() => setShowPhotoSheet(false)} className="w-8 h-8 flex items-center justify-center bg-slate-100 rounded-full text-slate-500 active:bg-slate-200">
                <X size={20} />
              </button>
            </div>
            <p className="text-slate-500 mb-6 text-[15px]">Please take a clear photo of the delivered order.</p>
            
            <div className="relative w-full aspect-[4/3] bg-slate-100 rounded-2xl flex flex-col items-center justify-center mb-6 border-2 border-dashed border-slate-300 overflow-hidden">
              {photoPreview ? (
                <img src={photoPreview} alt="Captured" className="w-full h-full object-cover" />
              ) : (
                <>
                  <Camera size={48} className="text-slate-400 mb-2" />
                  <span className="font-bold text-slate-500">Tap to setup camera</span>
                </>
              )}
              <input 
                type="file" 
                accept="image/*" 
                capture="environment" 
                onChange={handlePhotoUpload} 
                className="absolute inset-0 opacity-0 cursor-pointer" 
              />
            </div>
            
            <button 
              onClick={handlePhotoCapture}
              disabled={!photoPreview}
              className={`w-full h-14 rounded-xl font-bold text-[16px] flex items-center justify-center transition-colors gap-2 ${!photoPreview ? 'bg-slate-200 text-slate-400' : 'bg-blue-600 active:bg-blue-700 text-white'}`}
            >
              {photoPreview ? 'Confirm & complete order' : 'Capture Photo Required'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
