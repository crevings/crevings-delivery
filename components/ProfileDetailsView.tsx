import React from 'react';
import { ArrowLeft, User, Phone, Mail, Droplet, AlertTriangle, CreditCard, MessageCircle } from 'lucide-react';

interface ProfileDetailsViewProps {
  onBack: () => void;
}

export const ProfileDetailsView: React.FC<ProfileDetailsViewProps> = ({ onBack }) => {
  return (
    <div className="min-h-screen bg-white pb-24 font-sans animate-in fade-in duration-300">
      <header className="sticky top-0 z-40 bg-white h-[60px] flex items-center px-4 mb-2">
        <button onClick={onBack} className="w-10 h-10 flex items-center justify-center -ml-2 text-slate-700 active:scale-95 transition-transform">
          <ArrowLeft size={24} />
        </button>
        <h1 className="text-[20px] font-bold text-slate-900 ml-2">Profile Details</h1>
      </header>

      <div className="px-4">
        
        <div className="py-4 border-b border-slate-100 flex items-center gap-4">
          <div className="w-12 h-12 rounded-full bg-slate-50 border border-slate-100 flex items-center justify-center shrink-0 text-slate-700">
            <User size={22} />
          </div>
          <div>
            <p className="text-[13px] text-slate-500 mb-0.5">Full Name</p>
            <p className="text-[16px] font-semibold text-slate-900">Rohan Sharma</p>
          </div>
        </div>

        <div className="py-4 border-b border-slate-100 flex items-center gap-4">
          <div className="w-12 h-12 rounded-full bg-slate-50 border border-slate-100 flex items-center justify-center shrink-0 text-slate-700">
            <Phone size={22} />
          </div>
          <div>
            <p className="text-[13px] text-slate-500 mb-0.5">Phone Number</p>
            <p className="text-[16px] font-semibold text-slate-900">+91 98765 43210</p>
          </div>
        </div>

        <div className="py-4 border-b border-slate-100 flex items-center gap-4">
          <div className="w-12 h-12 rounded-full bg-emerald-50 border border-emerald-100 flex items-center justify-center shrink-0 text-emerald-600">
            <MessageCircle size={22} />
          </div>
          <div>
            <p className="text-[13px] text-slate-500 mb-0.5">WhatsApp Number</p>
            <p className="text-[16px] font-semibold text-slate-900">+91 98765 43210</p>
          </div>
        </div>

        <div className="py-4 border-b border-slate-100 flex items-center gap-4">
          <div className="w-12 h-12 rounded-full bg-slate-50 border border-slate-100 flex items-center justify-center shrink-0 text-slate-700">
            <Mail size={22} />
          </div>
          <div>
            <p className="text-[13px] text-slate-500 mb-0.5">Email Address</p>
            <p className="text-[16px] font-semibold text-slate-900">rohan.sharma@example.com</p>
          </div>
        </div>

        <div className="py-4 border-b border-slate-100 flex items-center gap-4">
          <div className="w-12 h-12 rounded-full bg-red-50 border border-red-100 flex items-center justify-center shrink-0 text-red-500">
            <Droplet size={22} />
          </div>
          <div>
            <p className="text-[13px] text-slate-500 mb-0.5">Blood Group</p>
            <p className="text-[16px] font-semibold text-slate-900">O+</p>
          </div>
        </div>

        <div className="py-4 border-b border-slate-100 flex items-center gap-4">
          <div className="w-12 h-12 rounded-full bg-orange-50 border border-orange-100 flex items-center justify-center shrink-0 text-orange-500">
            <AlertTriangle size={22} />
          </div>
          <div>
            <p className="text-[13px] text-slate-500 mb-0.5">Emergency Contact</p>
            <p className="text-[16px] font-semibold text-slate-900">+91 91234 56789 <span className="text-slate-400 font-normal text-[14px] ml-1">(Brother)</span></p>
          </div>
        </div>

        <div className="py-4 flex items-center gap-4">
          <div className="w-12 h-12 rounded-full bg-slate-50 border border-slate-100 flex items-center justify-center shrink-0 text-slate-700">
            <CreditCard size={22} />
          </div>
          <div>
            <p className="text-[13px] text-slate-500 mb-0.5">PAN Number</p>
            <p className="text-[16px] font-semibold text-slate-900 tracking-wider">ABCDE1234F</p>
          </div>
        </div>

      </div>
    </div>
  );
};

