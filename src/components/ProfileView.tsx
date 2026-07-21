import React, { useState } from 'react';
import { 
  ArrowLeft,
  Settings,
  LogOut,
  ChevronRight,
  TrendingUp,
  MapPin,
  CheckCircle,
  Bike,
  ShieldCheck,
  Phone,
  FileText,
  BadgeAlert,
  Wallet,
  Clock,
  Navigation,
  Star,
  Award,
  User,
  Tag,
  Pill,
  HeartPulse
} from 'lucide-react';
import { Tab } from '../types';

interface ProfileViewProps {
  onNavigateToTab?: (tab: Tab) => void;
  onLogout?: () => void;
}

export const ProfileView: React.FC<ProfileViewProps> = ({ onNavigateToTab, onLogout }) => {
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);

  const handleNavigate = (tab: Tab) => {
    onNavigateToTab?.(tab);
  };

  return (
    <div className={`w-full bg-white flex flex-col pb-24`}>
        <div className="flex-1 overflow-y-auto no-scrollbar relative">
          
          {/* Header Actions */}
          <div className="h-[60px] flex items-center px-4 sticky top-0 z-20 bg-white">
            <h1 className="text-xl font-bold text-slate-900 tracking-tight lg:font-semibold">My Profile</h1>
            <button onClick={() => setShowLogoutConfirm(true)} className="w-10 h-10 flex items-center justify-center text-slate-700 hover:bg-slate-100 rounded-full active:scale-95 transition-all lg:hidden ml-auto">
              <LogOut size={22} />
            </button>
          </div>
          
          {/* Profile Card */}
          <div className="px-5 mt-2 relative z-10">
            <div className="bg-white border border-slate-200 rounded-3xl p-6 flex flex-col justify-center items-center text-center">
              <div className="relative mb-3">
                <div className="w-[80px] h-[80px] rounded-full overflow-hidden border border-slate-200">
                  <img src="https://images.unsplash.com/photo-1599566150163-29194dcaad36?q=80&w=200&auto=format&fit=crop" className="w-full h-full object-cover" alt="Profile" />
                </div>
              </div>
              
              <h2 className="text-[20px] font-bold text-slate-900 mb-1">Rohan Sharma</h2>
              <div className="flex items-center gap-1.5 text-slate-500 mb-4">
                <MapPin size={14} className="text-slate-400" />
                <span className="text-[14px]">Prayagraj Zone</span>
              </div>

              <div className="flex items-center justify-center w-full gap-2 pt-4 border-t border-slate-100">
                <div className="flex-1 text-center">
                  <div className="flex items-center justify-center gap-1 text-slate-900 font-bold mb-0.5">
                    <Star size={14} className="fill-slate-900 text-slate-900" /> 4.9
                  </div>
                  <div className="text-[12px] text-slate-500">Rating</div>
                </div>
                <div className="w-[1px] h-8 bg-slate-200"></div>
                <div className="flex-1 text-center">
                  <div className="flex items-center justify-center gap-1 text-slate-900 font-bold mb-0.5">
                    <Award size={14} className="text-slate-900" /> Gold
                  </div>
                  <div className="text-[12px] text-slate-500">Tier</div>
                </div>
              </div>
            </div>
          </div>

          <div className="px-5 py-6 space-y-6">
            {/* Quick Stats Bento */}
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-white border border-slate-200 rounded-2xl p-4">
                <div className="w-8 h-8 rounded-full bg-slate-100 text-slate-600 flex items-center justify-center mb-2">
                  <Navigation size={18} />
                </div>
                <p className="text-[12px] text-slate-500 mb-1">Total Deliveries</p>
                <p className="text-[20px] font-bold text-slate-900">2,450</p>
              </div>
              <div className="bg-white border border-slate-200 rounded-2xl p-4">
                <div className="w-8 h-8 rounded-full bg-slate-100 text-slate-600 flex items-center justify-center mb-2">
                  <TrendingUp size={18} />
                </div>
                <p className="text-[12px] text-slate-500 mb-1">Completion</p>
                <p className="text-[20px] font-bold text-slate-900">98.5%</p>
              </div>
            </div>

            {/* Menu Sections */}
            <div className="space-y-4">
              <div>
                <h3 className="text-[14px] font-bold text-slate-900 px-1 mb-2">Account & Details</h3>
                <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
                  <button onClick={() => handleNavigate(Tab.PROFILE_DETAILS)} className="w-full flex items-center justify-between p-4 bg-white active:bg-slate-50 border-b border-slate-100">
                    <div className="flex items-center gap-4">
                      <div className="text-slate-500">
                        <User size={20} />
                      </div>
                      <div className="text-left">
                        <p className="text-[14px] font-medium text-slate-900">Profile</p>
                        <p className="text-[12px] text-slate-500">Name, Contact, Emergency & PAN</p>
                      </div>
                    </div>
                    <ChevronRight size={18} className="text-slate-300" />
                  </button>
                  <button onClick={() => handleNavigate(Tab.BANK_ACCOUNTS)} className="w-full flex items-center justify-between p-4 bg-white active:bg-slate-50 border-b border-slate-100">
                    <div className="flex items-center gap-4">
                      <div className="text-slate-500">
                        <Wallet size={20} />
                      </div>
                      <div className="text-left">
                        <p className="text-[14px] font-medium text-slate-900">Bank & UPI</p>
                        <p className="text-[12px] text-slate-500">Linked to HDFC Bank</p>
                      </div>
                    </div>
                    <ChevronRight size={18} className="text-slate-300" />
                  </button>
                  <button onClick={() => handleNavigate(Tab.VEHICLE_DETAILS)} className="w-full flex items-center justify-between p-4 bg-white active:bg-slate-50 border-b border-slate-100">
                    <div className="flex items-center gap-4">
                      <div className="text-slate-500">
                        <Bike size={20} />
                      </div>
                      <div className="text-left">
                        <p className="text-[14px] font-medium text-slate-900">Vehicle</p>
                        <p className="text-[12px] text-slate-500">Honda Activa • UP70 DE 8472</p>
                      </div>
                    </div>
                    <ChevronRight size={18} className="text-slate-300" />
                  </button>
                  <button onClick={() => handleNavigate(Tab.PERSONAL_DOCUMENTS)} className="w-full flex items-center justify-between p-4 bg-white active:bg-slate-50">
                    <div className="flex items-center gap-4">
                      <div className="text-slate-500">
                        <FileText size={20} />
                      </div>
                      <div className="text-left">
                        <p className="text-[14px] font-medium text-slate-900">Personal Documents</p>
                        <p className="text-[12px] text-slate-500">Aadhar, PAN & License verification</p>
                      </div>
                    </div>
                    <ChevronRight size={18} className="text-slate-300" />
                  </button>
                </div>
              </div>

              <div>
                <h3 className="text-[14px] font-bold text-slate-900 px-1 mb-2 pt-2">Benefits</h3>
                <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
                  <button className="w-full flex items-center justify-between p-4 bg-white active:bg-slate-50 border-b border-slate-100">
                    <div className="flex items-center gap-4">
                      <div className="text-slate-500">
                        <Tag size={20} />
                      </div>
                      <p className="text-[14px] font-medium text-slate-900">Coupons & Offers</p>
                    </div>
                    <ChevronRight size={18} className="text-slate-300" />
                  </button>
                  <button className="w-full flex items-center justify-between p-4 bg-white active:bg-slate-50 border-b border-slate-100">
                    <div className="flex items-center gap-4">
                      <div className="text-slate-500">
                        <Pill size={20} />
                      </div>
                      <p className="text-[14px] font-medium text-slate-900">Medicine Cashback</p>
                    </div>
                    <ChevronRight size={18} className="text-slate-300" />
                  </button>
                  <button className="w-full flex items-center justify-between p-4 bg-white active:bg-slate-50">
                    <div className="flex items-center gap-4">
                      <div className="text-slate-500">
                        <HeartPulse size={20} />
                      </div>
                      <p className="text-[14px] font-medium text-slate-900">Medical Benefits</p>
                    </div>
                    <ChevronRight size={18} className="text-slate-300" />
                  </button>
                </div>
              </div>

              <div>
                <h3 className="text-[14px] font-bold text-slate-900 px-1 mb-2 pt-2">Support & More</h3>
                <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
                  <button className="w-full flex items-center justify-between p-4 bg-white active:bg-slate-50 border-b border-slate-100">
                    <div className="flex items-center gap-4">
                      <div className="text-slate-500">
                        <Phone size={20} />
                      </div>
                      <p className="text-[14px] font-medium text-slate-900">Partner Support</p>
                    </div>
                    <ChevronRight size={18} className="text-slate-300" />
                  </button>
                  <button className="w-full flex items-center justify-between p-4 bg-white active:bg-slate-50 border-b border-slate-100">
                    <div className="flex items-center gap-4">
                      <div className="text-slate-500">
                        <FileText size={20} />
                      </div>
                      <p className="text-[14px] font-medium text-slate-900">Terms & Policies</p>
                    </div>
                    <ChevronRight size={18} className="text-slate-300" />
                  </button>
                  <button className="w-full flex items-center justify-between p-4 bg-white active:bg-slate-50">
                    <div className="flex items-center gap-4">
                      <div className="text-slate-500">
                        <BadgeAlert size={20} />
                      </div>
                      <p className="text-[14px] font-medium text-slate-900">Report an Issue</p>
                    </div>
                    <ChevronRight size={18} className="text-slate-300" />
                  </button>
                </div>
              </div>
            </div>

            <div className="pt-6 pb-2 text-center text-slate-400">
              <p className="text-[12px]">Version 2.1.4</p>
            </div>
            
            <button 
              onClick={() => setShowLogoutConfirm(true)}
              className="lg:flex hidden w-full items-center justify-center gap-2 p-4 text-red-600 font-medium hover:bg-red-50 rounded-2xl transition-colors mt-4 border border-red-100"
            >
              <LogOut size={18} />
              Log Out
            </button>
          </div>
        </div>

      {/* Logout Confirmation Bottom Sheet */}
      {showLogoutConfirm && (
        <div className="relative z-[200]">
          <div className="fixed inset-0 bg-black/30 z-40 transition-opacity" onClick={() => setShowLogoutConfirm(false)} />
          <div className="fixed inset-x-0 bottom-0 z-50 bg-white rounded-t-3xl p-6 pb-8 shadow-2xl animate-in slide-in-from-bottom-full duration-300 lg:relative lg:rounded-3xl lg:w-96 lg:mx-auto lg:top-auto lg:bottom-auto lg:mt-20 lg:transform-none">
            <div className="w-12 h-1 bg-slate-200 rounded-full mx-auto mb-6"></div>
            
            <h3 className="text-[20px] font-bold text-slate-900 mb-2 text-center text-slate-900">Log Out?</h3>
            <p className="text-[14px] text-slate-500 text-center mb-8 px-4">Are you sure you want to log out from the partner app?</p>
            
            <div className="flex flex-col gap-3">
              <button 
                onClick={() => {
                  setShowLogoutConfirm(false);
                  onLogout?.();
                }}
                className="w-full h-[50px] bg-red-50 text-red-600 font-medium rounded-xl text-[15px] transition-colors"
              >
                Yes, Log Out
              </button>
              <button 
                onClick={() => setShowLogoutConfirm(false)}
                className="w-full h-[50px] bg-slate-100 text-slate-900 font-medium rounded-xl text-[15px] transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

