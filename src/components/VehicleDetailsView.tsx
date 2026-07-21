import React from 'react';
import { ArrowLeft, Bike, Hash, Calendar, ShieldCheck, MapPin } from 'lucide-react';

interface VehicleDetailsViewProps {
  onBack: () => void;
}

export const VehicleDetailsView: React.FC<VehicleDetailsViewProps> = ({ onBack }) => {
  return (
    <div className="min-h-screen bg-white pb-24 font-sans animate-in fade-in duration-300">
      <header className="sticky top-0 z-40 bg-white h-[60px] flex items-center px-4 mb-2">
        <button onClick={onBack} className="w-10 h-10 flex items-center justify-center -ml-2 text-slate-700 active:scale-95 transition-transform">
          <ArrowLeft size={24} />
        </button>
        <h1 className="text-[20px] font-bold text-slate-900 ml-2">Vehicle Details</h1>
      </header>

      <div className="px-4">
        
        <div className="py-4 border-b border-slate-100 flex items-center justify-between">
          <div>
            <p className="text-[13px] text-slate-500 mb-1">Make & Model</p>
            <p className="text-[16px] font-semibold text-slate-900">Honda Activa 6G</p>
            <p className="text-[13px] text-slate-400 mt-0.5">Two Wheeler</p>
          </div>
          <div className="w-12 h-12 rounded-full bg-slate-50 border border-slate-100 flex items-center justify-center shrink-0">
            <Bike size={24} className="text-slate-700" />
          </div>
        </div>

        <div className="py-4 border-b border-slate-100 flex items-center justify-between">
          <div>
            <p className="text-[13px] text-slate-500 mb-1">Registration Number</p>
            <div className="inline-block px-3 py-1 bg-slate-100 text-slate-900 font-bold tracking-widest rounded-md mt-1 border border-slate-200">
              UP70 DE 8472
            </div>
          </div>
          <div className="w-12 h-12 rounded-full bg-slate-50 border border-slate-100 flex items-center justify-center shrink-0">
            <Hash size={24} className="text-slate-700" />
          </div>
        </div>

        <div className="py-4 border-b border-slate-100 flex items-center justify-between">
          <div>
            <p className="text-[13px] text-slate-500 mb-1">Registration Year</p>
            <p className="text-[16px] font-semibold text-slate-900">2021</p>
          </div>
          <div className="w-12 h-12 rounded-full bg-slate-50 border border-slate-100 flex items-center justify-center shrink-0">
            <Calendar size={24} className="text-slate-700" />
          </div>
        </div>

        <div className="py-4 border-b border-slate-100 flex items-center justify-between">
          <div>
            <p className="text-[13px] text-slate-500 mb-1">Insurance Check</p>
            <div className="flex items-center gap-1.5 mt-0.5 mb-0.5">
               <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
               <p className="text-[16px] font-semibold text-slate-900">Active</p>
            </div>
            <p className="text-[13px] text-slate-400">Valid till 15 Aug 2027</p>
          </div>
          <div className="w-12 h-12 rounded-full bg-slate-50 border border-slate-100 flex items-center justify-center shrink-0">
            <ShieldCheck size={24} className="text-slate-700" />
          </div>
        </div>

        <div className="py-4 flex items-center justify-between">
          <div>
            <p className="text-[13px] text-slate-500 mb-1">Registered RTO</p>
            <p className="text-[16px] font-semibold text-slate-900">Prayagraj (UP-70)</p>
          </div>
          <div className="w-12 h-12 rounded-full bg-slate-50 border border-slate-100 flex items-center justify-center shrink-0">
            <MapPin size={24} className="text-slate-700" />
          </div>
        </div>

      </div>
    </div>
  );
};
