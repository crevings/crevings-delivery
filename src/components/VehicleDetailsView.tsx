import React from 'react';
import { ArrowLeft, Bike, Hash, Calendar, ShieldCheck, MapPin } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

import { usePartnerProfile } from '@/api/profile';

interface VehicleDetailsViewProps {
  onBack?: () => void;
}

export const VehicleDetailsView: React.FC<VehicleDetailsViewProps> = ({ onBack }) => {
  const navigate = useNavigate();
  const handleBack = () => {
    if (onBack) onBack();
    else if (window.history.length > 1) navigate(-1);
    else navigate('/');
  };

  const { profile, isLoading } = usePartnerProfile();

  const vehicleType = profile?.vehicleType || 'Two Wheeler';
  const vehicleNumber = profile?.vehicleNumber || 'Not Specified';
  const licenseNumber = profile?.licenseNumber || 'Not Specified';
  const kycStatus = profile?.kycStatus || (profile?.aadhaarVerified ? 'VERIFIED' : 'PENDING');

  return (
    <div className="min-h-screen bg-white pb-24 font-sans animate-in fade-in duration-300">
      <header className="sticky top-0 z-40 bg-white h-[60px] flex items-center px-4 mb-2 border-b border-slate-100">
        <button onClick={handleBack} className="w-10 h-10 flex items-center justify-center -ml-2 text-slate-700 active:scale-95 transition-transform">
          <ArrowLeft size={24} />
        </button>
        <h1 className="text-[20px] font-bold text-slate-900 ml-2">Vehicle Details</h1>
      </header>

      <div className="px-4">
        <div className="py-4 border-b border-slate-100 flex items-center justify-between">
          <div>
            <p className="text-[13px] text-slate-500 mb-1">Vehicle Type</p>
            <p className="text-[16px] font-semibold text-slate-900">{vehicleType}</p>
            <p className="text-[13px] text-slate-400 mt-0.5">Delivery Mode</p>
          </div>
          <div className="w-12 h-12 rounded-full bg-slate-50 border border-slate-100 flex items-center justify-center shrink-0">
            <Bike size={24} className="text-slate-700" />
          </div>
        </div>

        <div className="py-4 border-b border-slate-100 flex items-center justify-between">
          <div>
            <p className="text-[13px] text-slate-500 mb-1">Registration Number</p>
            <div className="inline-block px-3 py-1 bg-slate-100 text-slate-900 font-bold tracking-widest rounded-md mt-1 border border-slate-200">
              {vehicleNumber}
            </div>
          </div>
          <div className="w-12 h-12 rounded-full bg-slate-50 border border-slate-100 flex items-center justify-center shrink-0">
            <Hash size={24} className="text-slate-700" />
          </div>
        </div>

        <div className="py-4 border-b border-slate-100 flex items-center justify-between">
          <div>
            <p className="text-[13px] text-slate-500 mb-1">Driving License</p>
            <p className="text-[16px] font-semibold text-slate-900">{licenseNumber}</p>
          </div>
          <div className="w-12 h-12 rounded-full bg-slate-50 border border-slate-100 flex items-center justify-center shrink-0">
            <Calendar size={24} className="text-slate-700" />
          </div>
        </div>

        <div className="py-4 border-b border-slate-100 flex items-center justify-between">
          <div>
            <p className="text-[13px] text-slate-500 mb-1">KYC Status</p>
            <div className="flex items-center gap-1.5 mt-0.5 mb-0.5">
               <span className={`w-2 h-2 rounded-full ${kycStatus === 'VERIFIED' ? 'bg-emerald-500' : 'bg-amber-500'}`}></span>
               <p className="text-[16px] font-semibold text-slate-900 capitalize">{kycStatus.toLowerCase()}</p>
            </div>
            <p className="text-[13px] text-slate-400">Partner Fleet Verification</p>
          </div>
          <div className="w-12 h-12 rounded-full bg-slate-50 border border-slate-100 flex items-center justify-center shrink-0">
            <ShieldCheck size={24} className="text-slate-700" />
          </div>
        </div>
      </div>
    </div>
  );
};
