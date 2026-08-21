import React, { useState, useEffect } from 'react';
import { 
  ArrowLeft, Headset, Store, User, Phone, Navigation, MessageCircle, 
  Info, ShoppingBag, ChevronDown, CheckCircle, Truck, Camera, X
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Order } from '@/types';
import { ChatView } from './ChatView';

import { BASE_URL } from '@/api/fetcher';
import { openMapsNavigation } from '@/utils/navigation';
import { updateOrderStatus } from '@/api/orders';

interface OrderDetailViewProps {
  order: Order;
  onBack?: () => void;
  /**
   * Called after a status transition. `status` is the backend status that
   * was set (DRIVER_ARRIVED / OUT FOR DELIVERY / REACHED_CUSTOMER /
   * COMPLETED) — the parent syncs its store with it. When omitted, the
   * parent derives the next settable status itself.
   */
  onUpdateOrderStatus?: (orderId: string, status?: string) => void;
}

const formatINR = (value: number) =>
  `₹${value.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

export const OrderDetailView: React.FC<OrderDetailViewProps> = ({ order, onBack, onUpdateOrderStatus }) => {
  const navigate = useNavigate();
  const handleBack = () => {
    if (onBack) onBack();
    else if (window.history.length > 1) navigate(-1);
    else navigate('/');
  };

  // The active-order payload is the raw Mongo doc (field `orderId`); fall back to
  // `id` so API URLs resolve even when the caller maps the order differently.
  const realOrderId = order.orderId || order.id;
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
  const orderTotal = Number(order.total) || 0;

  // Driver earnings = the delivery fee the customer paid for the trip (the
  // backend credits exactly this amount on completion). Never show the order
  // value as "earnings".
  const deliveryFee = Number(order.deliveryFee ?? 0);
  const driverEarnings = Number(order.driverEarnings ?? 0);
  const tripEarnings = driverEarnings > 0 ? driverEarnings : deliveryFee;

  const orderItems = order.itemList?.length ? order.itemList : [];

  const telHref = (phone?: string) => (phone ? `tel:${phone}` : undefined);

  const statusSteps = [
    { label: 'Accepted Order', key: 'Accepted' },
    { label: 'Arrived at Restaurant', key: 'Arrived' },
    { label: 'Order Picked Up', key: 'Picked Up' },
    { label: 'Arrived at Customer Location', key: 'Arrived Destination' },
    { label: 'Order Delivered', key: 'Delivered' }
  ];

  // Logic to determine active step from the real backend status vocabulary.
  const getStatusIndex = () => {
    const s = (currentStatus || '').toUpperCase();
    switch(s) {
      case 'ACCEPTED':
      case 'PREPARING':
      case 'READY':
      case 'READY_FOR_PICKUP':
      case 'DRIVER_ASSIGNED': return 0;
      case 'ARRIVED':
      case 'DRIVER_ARRIVED': 
      case 'DRIVER ARRIVED': return 1;
      case 'OUT FOR DELIVERY':
      case 'OUT_FOR_DELIVERY':
      case 'PICKED UP': return 2;
      case 'REACHED_CUSTOMER':
      case 'REACHED CUSTOMER':
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
      case 'PREPARING':
      case 'READY':
      case 'READY_FOR_PICKUP':
      case 'DRIVER_ASSIGNED': return 'Arrived at Restaurant';
      case 'ARRIVED':
      case 'DRIVER_ARRIVED': 
      case 'DRIVER ARRIVED':
        return 'Order Picked Up (Enter OTP)';
      case 'OUT FOR DELIVERY':
      case 'OUT_FOR_DELIVERY':
      case 'PICKED UP': return 'Arrived at Customer Location';
      case 'REACHED_CUSTOMER':
      case 'REACHED CUSTOMER':
      case 'ARRIVED DESTINATION': return 'Order Delivered';
      case 'COMPLETED':
      case 'DELIVERED': return 'Order Delivered';
      default: return 'Arrived at Restaurant';
    }
  };

  const handleAction = () => {
    const btnText = getButtonText();
    
    if (btnText === 'Arrived at Restaurant') {
      // Sync with backend so the restaurant & consumer see "Driver has arrived at the restaurant".
      updateOrderStatus(realOrderId, 'DRIVER_ARRIVED').catch(err =>
        console.error('Failed to sync driver arrival:', err)
      );
      setCurrentStatus('DRIVER_ARRIVED');
      onUpdateOrderStatus?.(order.id, 'DRIVER_ARRIVED');
      
      // Immediately open the OTP sheet so driver can verify pickup from restaurant
      setOtpValue(['', '', '', '', '', '']);
      setShowPickupOtpSheet(true);
      return;
    }

    if (btnText === 'Order Picked Up (Enter OTP)') {
      setOtpValue(['', '', '', '', '', '']);
      setShowPickupOtpSheet(true);
      return;
    }

    if (btnText === 'Arrived at Customer Location') {
      // Sync with backend so the consumer sees "Driver has reached your location".
      updateOrderStatus(realOrderId, 'REACHED_CUSTOMER').catch(err =>
        console.error('Failed to sync reached-customer:', err)
      );
      setCurrentStatus('REACHED_CUSTOMER');
      onUpdateOrderStatus?.(order.id, 'REACHED_CUSTOMER');
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
    handleBack();
  };

  const handlePickupOtpVerify = async () => {
    const pin = otpValue.join('').trim();
    setIsVerifying(true);
    try {
      const res = await fetch(`${BASE_URL}/delivery/orders/${realOrderId}/verify-pickup`, {
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
    } catch (err: any) {
      console.error("Pickup OTP verification error:", err);
      alert("Network error verifying Pickup PIN: " + (err.message || 'Please check your connection'));
      setIsVerifying(false);
      return;
    } finally {
      setIsVerifying(false);
    }

    setShowPickupOtpSheet(false);
    onUpdateOrderStatus?.(order.id, 'OUT FOR DELIVERY');
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
      const res = await fetch(`${BASE_URL}/delivery/orders/${realOrderId}/complete`, {
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
    } catch (err: any) {
      console.error("Delivery OTP verification error:", err);
      alert("Network error verifying Delivery PIN: " + (err.message || 'Please check your connection'));
      setIsVerifying(false);
      return;
    } finally {
      setIsVerifying(false);
    }

    setShowDeliveryOtpSheet(false);
    onUpdateOrderStatus?.(order.id, 'COMPLETED');
    handleBack();
  };

  const handlePhotoCapture = () => {
    setShowPhotoSheet(false);
    onUpdateOrderStatus?.(order.id, 'COMPLETED');
    handleBack();
  };

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const url = URL.createObjectURL(file);
      setPhotoPreview(url);
    }
  };

  const displayNum = order.displayOrderNumber || order.displayOrderId || (order.id && order.id.length > 12 ? order.id.slice(-8).toUpperCase() : order.id);

  if (showChat) {
    return <ChatView order={order} onBack={() => setShowChat(false)} />;
  }

  return (
    <div className="fixed inset-0 z-[150] bg-[#FFFFFF] flex flex-col animate-in slide-in-from-right duration-300 overflow-y-auto pb-28">
      
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-4 bg-[#FFFFFF] sticky top-0 z-10 shrink-0 border-b border-slate-100">
        <div className="flex items-center gap-3">
          <button onClick={handleBack} className="p-1.5 -ml-1 text-slate-700 active:bg-slate-100 rounded-xl transition-colors">
            <ArrowLeft size={22} />
          </button>
          <h1 className="text-[18px] font-black text-slate-900 tracking-tight">Order #{displayNum}</h1>
        </div>
        <button className="text-slate-500 p-2 bg-slate-50 rounded-xl hover:bg-slate-100 transition-colors">
          <Headset size={20} />
        </button>
      </div>

      <div className="p-4 space-y-4">
              
              {/* Quick Stats Card */}
              <div className="bg-[#FFFFFF] rounded-2xl border border-[#E5E7EB] flex divide-x divide-slate-100 shadow-xs">
                <div className="flex-1 p-3.5 flex flex-col items-center justify-center text-center">
                  <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1">Distance</span>
                  <span className="text-[15px] font-black text-slate-800">{order.pickupDistanceKm ? `${order.pickupDistanceKm} km` : '--'}</span>
                </div>
                <div className="flex-1 p-3.5 flex flex-col items-center justify-center text-center">
                  <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1">Est. Time</span>
                  <span className="text-[15px] font-black text-slate-800">{order.time !== '--' ? order.time : '--'}</span>
                </div>
                <div className="flex-1 p-3.5 flex flex-col items-center justify-center text-center">
                  <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1">Earnings</span>
                  <span className="text-[15px] font-black text-emerald-600">{formatINR(tripEarnings)}</span>
                </div>
              </div>

              {/* Order Info */}
              <div className="bg-[#FFFFFF] rounded-2xl border border-[#E5E7EB] p-4 shadow-xs">
                <div className="flex justify-between items-center mb-3">
                  <span className="text-slate-700 text-[13px] font-black tracking-wide">Order #{displayNum}</span>
                  <span className={`px-2.5 py-1 rounded-lg text-[11px] font-bold uppercase tracking-wider ${order.status === 'Preparing' ? 'bg-orange-50 text-orange-600' : 'bg-blue-50 text-blue-600'}`}>{order.status}</span>
                </div>
          <div className="pt-3 border-t border-slate-100 flex justify-between items-center">
            <div>
              <p className="text-[11px] font-bold text-slate-500 tracking-wide uppercase mb-0.5">Payment Method</p>
              <p className="text-[15px] font-bold text-slate-800">{isCOD ? 'Cash on Delivery (COD)' : 'Pre-Paid'}</p>
            </div>
            {isCOD && (
              <div className="px-3 py-1.5 bg-red-50 rounded-xl">
                <p className="text-[12px] font-bold text-red-600 border-b border-red-200 pb-0.5 mb-0.5">Collect Cash</p>
                <p className="text-[15px] font-black text-red-700">{formatINR(orderTotal)}</p>
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
              <h3 className="font-bold text-[17px] text-slate-900 leading-tight mb-1">{order.restaurantName || 'Restaurant'}</h3>
              <p className="text-[13px] text-slate-500 line-clamp-2 leading-snug">{order.restaurantAddress || 'Address not available'}</p>
            </div>
          </div>
          <div className="flex gap-3">
            {order.restaurantPhone ? (
              <a href={telHref(order.restaurantPhone)} className="flex-1 h-12 bg-blue-50 text-blue-600 font-bold rounded-xl flex items-center justify-center gap-2 active:bg-blue-100 transition-colors">
                <Phone size={18} />
                Call
              </a>
            ) : (
              <button disabled className="flex-1 h-12 bg-blue-50 text-blue-600 font-bold rounded-xl flex items-center justify-center gap-2 opacity-60">
                <Phone size={18} />
                Call
              </button>
            )}
            <button 
              onClick={() => openMapsNavigation(order.restaurantAddress, order.restaurantName)}
              className="flex-1 h-12 bg-blue-50 text-blue-600 font-bold rounded-xl flex items-center justify-center gap-2 active:bg-blue-100 transition-colors"
            >
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
              <h3 className="font-bold text-[17px] text-slate-900 leading-tight mb-1">{order.customer || 'Customer'}</h3>
              <p className="text-[13px] text-slate-500 line-clamp-2 leading-snug">{order.address || 'Address not available'}</p>
            </div>
          </div>
          <div className="flex gap-3">
            {order.phone ? (
              <a href={telHref(order.phone)} className="w-12 h-12 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center active:bg-blue-100 transition-colors shrink-0">
                <Phone size={20} />
              </a>
            ) : (
              <button disabled className="w-12 h-12 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center opacity-60 shrink-0">
                <Phone size={20} />
              </button>
            )}
            <button 
              onClick={() => setShowChat(true)}
              className="w-12 h-12 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center active:bg-blue-100 transition-colors shrink-0"
            >
              <MessageCircle size={20} />
            </button>
            <button 
              onClick={() => openMapsNavigation(order.address, order.customer)}
              className="h-12 px-4 bg-blue-50 text-blue-600 font-bold rounded-xl flex items-center justify-center gap-2 active:bg-blue-100 transition-colors flex-1"
            >
              <Navigation size={18} className="rotate-45" />
              Navigate
            </button>
          </div>
        </div>

        {/* Customer Instructions */}
        {order.customerNote ? (
          <div className="bg-emerald-50 rounded-2xl p-4">
            <div className="flex gap-2 items-start">
              <Info size={18} className="text-emerald-600 shrink-0 mt-0.5" />
              <div>
                <p className="text-[11px] font-bold text-emerald-700 tracking-wide uppercase mb-1">Customer Instructions</p>
                <p className="text-[15px] font-medium text-emerald-900 leading-snug">
                  {order.customerNote}
                </p>
              </div>
            </div>
          </div>
        ) : null}

        {/* Order Items Wrapper */}
        <div className="bg-[#FFFFFF] rounded-2xl border border-[#E5E7EB] overflow-hidden">
          <button 
            className="w-full flex items-center justify-between p-4 bg-white active:bg-slate-50 transition-colors"
            onClick={() => setShowItems(!showItems)}
          >
            <div className="flex items-center gap-3">
              <ShoppingBag size={20} className="text-slate-700" />
              <span className="font-bold text-slate-900 text-[16px]">Order Items ({orderItems.length})</span>
            </div>
            <div className={`text-slate-400 transition-transform duration-300 ${showItems ? 'rotate-180' : 'rotate-0'}`}>
              <ChevronDown size={20} />
            </div>
          </button>
          
          <div className={`grid transition-all duration-300 ease-in-out ${showItems ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0'}`}>
            <div className="overflow-hidden">
              <div className="px-5 pb-5 pt-1 space-y-3 border-t border-slate-100 bg-white">
                {orderItems.length > 0 ? (
                  orderItems.map((item, idx) => (
                    <div key={idx} className="flex items-center justify-between py-0.5">
                      <p className="text-[15px] font-medium text-slate-800">{item.quantity} x {item.name}</p>
                    </div>
                  ))
                ) : (
                  <p className="text-[15px] text-slate-500">No items on this order.</p>
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
              <span className="text-slate-600 font-medium">Trip Earnings (Delivery Fee)</span>
              <span className="font-medium text-slate-800">{formatINR(deliveryFee)}</span>
            </div>
            {isCOD && (
              <div className="flex justify-between text-[15px]">
                <span className="text-slate-600 font-medium">Cash to Collect (COD)</span>
                <span className="font-medium text-slate-800">{formatINR(orderTotal)}</span>
              </div>
            )}
            <div className="pt-4 border-t border-slate-100 flex justify-between items-center mt-1">
              <span className="font-bold text-[18px] text-slate-900">Total Earnings</span>
              <span className="font-black text-[18px] text-slate-900">{formatINR(tripEarnings)}</span>
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
            <p className="text-slate-500 mb-4 text-[15px]">Ask restaurant for the 6-digit PIN to confirm pickup.</p>
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
              disabled={isVerifying}
              className="w-full h-14 bg-blue-600 active:bg-blue-700 text-white rounded-xl font-bold text-[16px] flex items-center justify-center transition-colors disabled:opacity-60"
            >
              {isVerifying ? 'Verifying PIN...' : 'Verify OTP'}
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
                 <p className="text-[13px] mt-1">Order value is {formatINR(orderTotal)}. Please ensure payment is collected before concluding.</p>
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
            <p className="text-slate-500 mb-6 text-[15px]">Select payment method used by customer to pay {formatINR(orderTotal)}.</p>
            
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
              disabled={isVerifying}
              className="w-full h-14 bg-blue-600 active:bg-blue-700 text-white rounded-xl font-bold text-[16px] flex items-center justify-center transition-colors disabled:opacity-60"
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
