import React, { useState, useEffect, useRef } from 'react';
import { ArrowLeft, Search, Filter, Calendar, ChevronRight, Loader2 } from 'lucide-react';
import { Order } from '../types';
import { OrderDetailView } from './OrderDetailView';
import { useOrderHistory } from '@/api/orders';

interface OrderHistoryViewProps {
  onBack: () => void;
}

export const OrderHistoryView: React.FC<OrderHistoryViewProps> = ({ onBack }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [statusFilter, setStatusFilter] = useState('All');
  const [typeFilter, setTypeFilter] = useState('All');
  const [historyOrders, setHistoryOrders] = useState<Order[]>([]);
  const [cursor, setCursor] = useState<string | null>(null);
  const appendedCursors = useRef<Set<string | null>>(new Set());

  const { orderHistory: page, nextCursor, hasMore, isLoading, isError, mutate } =
    useOrderHistory(20, cursor ?? undefined);

  // Append each fetched page exactly once (keyed by the cursor it was
  // requested with) — the cursor key flips to null on refresh, so the first
  // page replaces the list.
  useEffect(() => {
    if (!page.length || appendedCursors.current.has(cursor)) return;
    appendedCursors.current.add(cursor);
    setHistoryOrders(prev => (cursor ? [...prev, ...page] : page));
  }, [page, cursor]);

  const loadMore = () => {
    if (hasMore && nextCursor) {
      setCursor(nextCursor);
    }
  };

  if (selectedOrder) {
    return (
      <OrderDetailView 
        order={selectedOrder} 
        onBack={() => setSelectedOrder(null)} 
      />
    );
  }

  const filteredOrders = historyOrders.filter(order => {
    const matchesSearch = order.id.toLowerCase().includes(searchQuery.toLowerCase()) || 
                         order.customer.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesStatus = statusFilter === 'All' || 
                         (statusFilter === 'Completed' && (order.status === 'Completed' || order.status === 'Delivered')) ||
                         (statusFilter === 'Rejected' && order.status === 'Rejected') ||
                         (statusFilter === 'Cancelled' && order.status === 'Cancelled');

    const matchesType = typeFilter === 'All' || order.type === typeFilter;

    return matchesSearch && matchesStatus && matchesType;
  });

  return (
    <div className="flex flex-col h-full bg-[#FFFFFF]">
      {/* Header */}
      <div className="bg-[#FFFFFF] px-4 pt-6 pb-4 flex flex-col gap-4 relative z-20 shrink-0">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button 
              onClick={onBack}
              className="w-10 h-10 bg-slate-50 hover:bg-slate-100 rounded-full flex items-center justify-center transition-colors active:scale-95"
            >
              <ArrowLeft size={22} className="text-slate-700" />
            </button>
            <h1 className="text-[19px] font-bold text-slate-900 tracking-tight">Order History</h1>
          </div>
          <button className="w-10 h-10 bg-slate-50 hover:bg-slate-100 rounded-full flex items-center justify-center text-slate-700">
            <Filter size={18} />
          </button>
        </div>

        {/* Search Bar */}
        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-[#6B7280]" size={20} />
          <input 
            type="text" 
            placeholder="Search by Order ID or Customer Name"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full h-[52px] bg-[#FFFFFF] border border-[#E5E7EB] text-[#111827] py-4 pl-12 pr-4 rounded-[16px] focus:outline-none focus:border-[#1E90FF] text-[15px] font-medium transition-all"
          />
        </div>

        {/* Filter Rows */}
        <div className="space-y-3">
          <div className="flex gap-2 overflow-x-auto no-scrollbar pb-1">
            <span className="text-[13px] font-bold text-slate-400 self-center mr-1 shrink-0">Type:</span>
            {['All', 'Delivery', 'Dine-in', 'Takeaway'].map((type) => (
              <button
                key={type}
                onClick={() => setTypeFilter(type)}
                className={`px-4 h-8 rounded-full text-[12px] font-bold whitespace-nowrap transition-all ${
                  typeFilter === type 
                    ? 'bg-[#1E90FF] text-white' 
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {type}
              </button>
            ))}
          </div>
          
          <div className="flex gap-2 overflow-x-auto no-scrollbar">
            <span className="text-[13px] font-bold text-slate-400 self-center mr-1 shrink-0">Status:</span>
            {['All', 'Completed', 'Rejected', 'Cancelled'].map((status) => (
              <button
                key={status}
                onClick={() => setStatusFilter(status)}
                className={`px-4 h-8 rounded-full text-[12px] font-bold whitespace-nowrap transition-all ${
                  statusFilter === status 
                    ? 'bg-[#1E90FF] text-white' 
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {status}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Orders List */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-[#FFFFFF]">
        {isLoading && historyOrders.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <Loader2 size={28} className="text-slate-300 animate-spin mb-4" />
            <p className="text-[15px] font-bold text-slate-900 mb-1">Loading orders...</p>
          </div>
        ) : isError && historyOrders.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mb-4 text-slate-400">
              <Search size={28} />
            </div>
            <p className="text-[15px] font-bold text-slate-900 mb-1">Couldn't load orders</p>
            <p className="text-[14px] text-slate-500 mb-4">Check your connection and try again</p>
            <button
              onClick={() => {
                appendedCursors.current.clear();
                setCursor(null);
                mutate();
              }}
              className="px-4 h-10 bg-[#1E90FF] text-white rounded-full text-[13px] font-bold"
            >
              Retry
            </button>
          </div>
        ) : filteredOrders.length > 0 ? (
          <>
            {filteredOrders.map((order) => (
              <div 
                key={order.id}
                onClick={() => setSelectedOrder(order)}
                className="bg-[#FFFFFF] p-4 rounded-[16px] border border-slate-100 active:scale-[0.98] transition-transform cursor-pointer"
              >
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-[15px] font-bold text-slate-900">{order.id}</span>
                      <span className={`text-[11px] font-bold px-2 py-0.5 rounded-full ${
                        order.status === 'Cancelled' ? 'bg-red-50 text-red-600' : 'bg-emerald-50 text-emerald-600'
                      }`}>
                        {order.status}
                      </span>
                    </div>
                    <p className="text-[13px] text-slate-600 font-medium">{order.customer} • {order.type}</p>
                  </div>
                  <div className="text-right">
                    <span className="text-[15px] font-bold text-slate-900">{order.total}</span>
                  </div>
                </div>
                
                <div className="h-px bg-slate-100 w-full mb-3" />
                
                <div className="flex items-center justify-between text-[12px] text-slate-500 font-medium">
                  <div className="flex items-center gap-1.5">
                    <Calendar size={14} />
                    <span>{order.time}</span>
                  </div>
                  <div className="flex items-center gap-1 text-[#1E90FF]">
                    <span>View Details</span>
                    <ChevronRight size={14} />
                  </div>
                </div>
              </div>
            ))}
            {hasMore && (
              <button
                onClick={loadMore}
                disabled={isLoading}
                className="w-full h-12 bg-slate-50 border border-slate-200 rounded-[16px] font-bold text-[14px] text-[#1E90FF] flex items-center justify-center gap-2 active:scale-[0.98] transition-transform disabled:opacity-60"
              >
                {isLoading ? <Loader2 size={16} className="animate-spin" /> : null}
                {isLoading ? 'Loading...' : 'Load More Orders'}
              </button>
            )}
          </>
        ) : (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mb-4 text-slate-400">
              <Search size={28} />
            </div>
            <p className="text-[15px] font-bold text-slate-900 mb-1">No orders found</p>
            <p className="text-[14px] text-slate-500">Try adjusting your search query</p>
          </div>
        )}
      </div>
    </div>
  );
};
