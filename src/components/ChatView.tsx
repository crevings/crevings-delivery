import React, { useState } from 'react';
import { ArrowLeft, Send, Paperclip, Mic, Image, User, Camera } from 'lucide-react';
import { Order } from '../types';

interface ChatViewProps {
  order: Order;
  onBack: () => void;
}

export const ChatView: React.FC<ChatViewProps> = ({ order, onBack }) => {
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState([
    { id: 1, text: 'Hi, I have picked up your order and am on the way.', sender: 'me', time: '14:23' },
    { id: 2, text: 'Okay, please ring the bell when you arrive.', sender: 'customer', time: '14:25' }
  ]);
  const [showAttachMenu, setShowAttachMenu] = useState(false);

  const quickReplies = [
    "I have arrived ✨",
    "I'm 5 mins away 🛵",
    "Can you share a landmark? 📍",
    "Please share the OTP 🔑"
  ];

  const handleSend = (text: string) => {
    if (!text.trim()) return;
    
    setMessages([...messages, {
      id: Date.now(),
      text,
      sender: 'me',
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }]);
    setMessage('');
  };

  return (
    <div className="fixed inset-0 z-[300] bg-slate-50 flex flex-col animate-in slide-in-from-right duration-300">
      {/* Modern Header */}
      <div className="flex items-center gap-4 px-4 py-4 bg-white/80 backdrop-blur-md shadow-sm sticky top-0 z-10 shrink-0 border-b border-slate-100/50">
        <button 
          onClick={onBack}
          className="w-10 h-10 flex items-center justify-center rounded-full bg-slate-100 hover:bg-slate-200 text-slate-700 active:scale-95 transition-all"
        >
          <ArrowLeft size={20} />
        </button>
        <div className="flex items-center gap-3 flex-1">
          <div className="relative">
            <div className="w-12 h-12 rounded-full bg-gradient-to-tr from-blue-100 to-indigo-50 flex items-center justify-center border-2 border-white shadow-sm">
              <User size={22} className="text-blue-600" />
            </div>
            <div className="absolute bottom-0 right-0 w-3.5 h-3.5 bg-green-500 border-2 border-white rounded-full"></div>
          </div>
          <div>
            <h2 className="font-extrabold text-slate-900 text-[18px] leading-tight flex items-center gap-2">
              {order.customer}
            </h2>
            <span className="text-[13px] font-semibold text-slate-500">Order #{order.id}</span>
          </div>
        </div>
      </div>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-6 flex flex-col bg-[#F8FAFC]">
        {messages.map((msg, index) => {
          const isMe = msg.sender === 'me';
          return (
            <div key={msg.id} className={`flex ${isMe ? 'justify-end' : 'justify-start'} animate-in fade-in slide-in-from-bottom-2 duration-300`} style={{ animationFillMode: 'both', animationDelay: `${index * 50}ms` }}>
              <div className={`max-w-[75%] relative group ${isMe ? 'items-end' : 'items-start'} flex flex-col`}>
                <div className={`rounded-2xl px-4 py-3 leading-relaxed shadow-sm ${
                  isMe 
                    ? 'bg-gradient-to-br from-blue-600 to-blue-700 text-white rounded-br-sm' 
                    : 'bg-white border border-slate-100 text-slate-800 rounded-bl-sm'
                }`}>
                  <p className="text-[15px]">{msg.text}</p>
                </div>
                <div className={`text-[11px] font-bold mt-1.5 opacity-0 group-hover:opacity-100 transition-opacity ${
                  isMe ? 'text-blue-500 pr-1' : 'text-slate-400 pl-1'
                }`}>
                  {msg.time} {isMe && '• Read'}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Modern Interface Bottom wrapper */}
      <div className="bg-white border-t border-slate-100 pb-safe">
        {/* Quick Replies */}
        <div className="px-4 py-3 flex gap-2 overflow-x-auto no-scrollbar shrink-0">
          {quickReplies.map((reply, idx) => (
            <button
              key={idx}
              onClick={() => handleSend(reply)}
              className="px-4 py-2 bg-white border border-slate-200 text-slate-700 rounded-full text-[14px] font-bold whitespace-nowrap active:scale-95 hover:bg-slate-50 hover:border-blue-200 hover:text-blue-700 transition-all shadow-sm"
            >
              {reply}
            </button>
          ))}
        </div>

        {/* Input Area */}
        <div className="p-4 pt-1 flex flex-col items-center justify-center relative shrink-0 z-20">
          {showAttachMenu && (
            <div className="absolute bottom-[80px] left-4 bg-white rounded-2xl shadow-[0_4px_30px_rgba(0,0,0,0.1)] border border-slate-100 p-2 flex flex-col gap-1 z-30 animate-in fade-in zoom-in-95 duration-200">
              <button 
                 className="flex items-center gap-3 px-4 py-3 hover:bg-slate-50 rounded-xl transition-colors text-slate-700 font-bold text-[15px]"
                 onClick={() => setShowAttachMenu(false)}
              >
                <div className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center text-blue-600">
                  <Image size={20} />
                </div>
                Photos & Videos
              </button>
              <button 
                 className="flex items-center gap-3 px-4 py-3 hover:bg-slate-50 rounded-xl transition-colors text-slate-700 font-bold text-[15px]"
                 onClick={() => setShowAttachMenu(false)}
              >
                <div className="w-10 h-10 rounded-full bg-purple-50 flex items-center justify-center text-purple-600">
                  <Camera size={20} />
                </div>
                Camera
              </button>
            </div>
          )}
          
          <div className="flex items-end gap-3 w-full max-w-md mx-auto relative group">
            <button 
              onClick={() => setShowAttachMenu(!showAttachMenu)}
              className={`w-12 h-12 flex items-center justify-center rounded-full shrink-0 transition-all ${showAttachMenu ? 'bg-blue-50 text-blue-600' : 'bg-slate-100 text-slate-500 hover:bg-slate-200'}`}
            >
              <Paperclip size={24} className="transition-transform group-hover:rotate-12" />
            </button>
            
            <div className="flex-1 bg-slate-100 rounded-[24px] flex items-end overflow-hidden border border-transparent focus-within:border-blue-200 focus-within:bg-white focus-within:shadow-[0_4px_20px_rgba(59,130,246,0.08)] transition-all min-h-[48px]">
              <textarea 
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Message..."
                className="w-full bg-transparent border-none focus:ring-0 px-5 py-3.5 max-h-32 min-h-[48px] resize-none outline-none text-[15px] font-medium"
                rows={1}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    handleSend(message);
                  }
                }}
              />
            </div>
            
            {message.trim() ? (
              <button 
                onClick={() => handleSend(message)}
                className="w-12 h-12 flex items-center justify-center bg-blue-600 text-white rounded-full shrink-0 shadow-lg shadow-blue-600/30 active:scale-95 hover:bg-blue-700 transition-all"
              >
                <Send size={20} className="ml-0.5" />
              </button>
            ) : (
              <button className="w-12 h-12 flex items-center justify-center bg-blue-600 text-white rounded-full shrink-0 shadow-md shadow-blue-600/20 active:scale-95 hover:bg-blue-700 transition-all">
                <Mic size={22} />
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
