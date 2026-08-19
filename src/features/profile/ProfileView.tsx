import React, { useState } from 'react';
import {
  LogOut,
  ChevronRight,
  TrendingUp,
  MapPin,
  Bike,
  Phone,
  FileText,
  BadgeAlert,
  Wallet,
  Navigation,
  Star,
  Award,
  User,
  Settings,
  ShoppingBag,
  Receipt
} from 'lucide-react';
import { Tab } from '@/types';
import { useAuth } from '@/app/providers';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '@/app/store';
import { usePartnerProfile } from '@/api/profile';
import { useEarningsSummary } from '@/api/earnings';

interface ProfileViewProps {
  onNavigateToTab?: (tab: Tab) => void;
  onLogout?: () => void;
}

const formatINR = (value?: number) =>
  value === undefined || value === null ? '—' : `₹${value.toLocaleString('en-IN')}`;

export const ProfileView: React.FC<ProfileViewProps> = ({ onNavigateToTab, onLogout }) => {
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const { logout } = useAuth();
  const navigate = useNavigate();
  const partnerEmail = useAuthStore(s => s.partnerEmail);
  const partnerId = useAuthStore(s => s.partnerId);
  const { profile } = usePartnerProfile();
  const { earnings } = useEarningsSummary();

  const displayName = profile?.name || 'Partner';
  const displayPhone = profile?.phone || partnerEmail || partnerId || 'Prayagraj Zone';
  const vehicle = profile?.vehicleType && profile?.vehicleNumber
    ? `${profile.vehicleType} • ${profile.vehicleNumber}`
    : profile?.vehicleType || 'Not set';
  const totalTrips = earnings?.allTime?.trips;
  const balance = earnings?.balance;

  const handleNavigate = (tab: Tab, routePath?: string) => {
    if (routePath) {
      navigate(routePath);
    } else if (onNavigateToTab) {
      onNavigateToTab(tab);
    } else {
      switch (tab) {
        case Tab.PROFILE_DETAILS: navigate('/profile/details'); break;
        case Tab.BANK_ACCOUNTS: navigate('/profile/bank'); break;
        case Tab.VEHICLE_DETAILS: navigate('/profile/vehicle'); break;
        case Tab.PERSONAL_DOCUMENTS: navigate('/profile/documents'); break;
        case Tab.INVOICES: navigate('/invoices'); break;
        case Tab.PARTNER_STORE: navigate('/store'); break;
        case Tab.SETTINGS: navigate('/settings'); break;
        case Tab.SUPPORT: navigate('/support'); break;
        case Tab.CREVINGS_STUDIO: navigate('/studio'); break;
        case Tab.CREVINGS_LEGAL: navigate('/legal'); break;
        default: navigate('/profile'); break;
      }
    }
  };

  return (
    <div className="w-full bg-white flex flex-col pb-24 font-sans">
      <div className="flex-1 overflow-y-auto no-scrollbar relative">

        {/* Header Actions */}
        <div className="h-[60px] flex items-center px-4 sticky top-0 z-20 bg-white border-b border-slate-100 justify-between">
          <h1 className="text-xl font-bold text-slate-900 tracking-tight lg:font-semibold">My Profile</h1>
          <button onClick={() => setShowLogoutConfirm(true)} className="w-10 h-10 flex items-center justify-center text-slate-700 hover:bg-slate-100 rounded-full active:scale-95 transition-all lg:hidden">
            <LogOut size={22} />
          </button>
        </div>

        {/* Profile Card */}
        <div className="px-5 mt-4 relative z-10">
          <div className="bg-white border border-slate-200 rounded-3xl p-6 flex flex-col justify-center items-center text-center shadow-sm">
            <div className="relative mb-3">
              <div className="w-[80px] h-[80px] rounded-full overflow-hidden border-2 border-blue-500/20">
                <img src="https://images.unsplash.com/photo-1599566150163-29194dcaad36?q=80&w=200&auto=format&fit=crop" className="w-full h-full object-cover" alt="Profile" />
              </div>
            </div>

            <h2 className="text-[20px] font-bold text-slate-900 mb-1">{displayName}</h2>
            <div className="flex items-center gap-1.5 text-slate-500 mb-4">
              <MapPin size={14} className="text-slate-400" />
              <span className="text-[14px]">{displayPhone}</span>
            </div>

            <div className="flex items-center justify-center w-full gap-2 pt-4 border-t border-slate-100">
              <div className="flex-1 text-center py-1">
                <div className="flex items-center justify-center gap-1 text-slate-900 font-bold mb-0.5">
                  <TrendingUp size={14} className="text-blue-500" /> {totalTrips ?? 0}
                </div>
                <div className="text-[12px] text-slate-500">Total Trips</div>
              </div>
              <div className="w-[1px] h-8 bg-slate-200"></div>
              <div className="flex-1 text-center py-1">
                <div className="flex items-center justify-center gap-1 text-slate-900 font-bold mb-0.5">
                  <Wallet size={14} className="text-emerald-500" /> {formatINR(balance)}
                </div>
                <div className="text-[12px] text-slate-500">Balance</div>
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
              <p className="text-[20px] font-bold text-slate-900">{totalTrips?.toLocaleString('en-IN') ?? '—'}</p>
            </div>
            <div className="bg-white border border-slate-200 rounded-2xl p-4">
              <div className="w-8 h-8 rounded-full bg-slate-100 text-slate-600 flex items-center justify-center mb-2">
                <TrendingUp size={18} />
              </div>
              <p className="text-[12px] text-slate-500 mb-1">Wallet Balance</p>
              <p className="text-[20px] font-bold text-slate-900">{formatINR(balance)}</p>
            </div>
          </div>

          {/* Menu Sections */}
          <div className="space-y-4">
            <div>
              <h3 className="text-[14px] font-bold text-slate-900 px-1 mb-2">Account & Details</h3>
              <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
                <button onClick={() => handleNavigate(Tab.PROFILE_DETAILS, '/profile/details')} className="w-full flex items-center justify-between p-4 bg-white hover:bg-slate-50 border-b border-slate-100 transition-colors">
                  <div className="flex items-center gap-4">
                    <div className="text-slate-500"><User size={20} /></div>
                    <div className="text-left">
                      <p className="text-[14px] font-medium text-slate-900">Profile</p>
                      <p className="text-[12px] text-slate-500">Name, Contact, Emergency & PAN</p>
                    </div>
                  </div>
                  <ChevronRight size={18} className="text-slate-300" />
                </button>
                <button onClick={() => handleNavigate(Tab.BANK_ACCOUNTS, '/profile/bank')} className="w-full flex items-center justify-between p-4 bg-white hover:bg-slate-50 border-b border-slate-100 transition-colors">
                  <div className="flex items-center gap-4">
                    <div className="text-slate-500"><Wallet size={20} /></div>
                    <div className="text-left">
                      <p className="text-[14px] font-medium text-slate-900">Bank & UPI</p>
                      <p className="text-[12px] text-slate-500">Payout account details</p>
                    </div>
                  </div>
                  <ChevronRight size={18} className="text-slate-300" />
                </button>
                <button onClick={() => handleNavigate(Tab.VEHICLE_DETAILS, '/profile/vehicle')} className="w-full flex items-center justify-between p-4 bg-white hover:bg-slate-50 border-b border-slate-100 transition-colors">
                  <div className="flex items-center gap-4">
                    <div className="text-slate-500"><Bike size={20} /></div>
                    <div className="text-left">
                      <p className="text-[14px] font-medium text-slate-900">Vehicle</p>
                      <p className="text-[12px] text-slate-500">{vehicle}</p>
                    </div>
                  </div>
                  <ChevronRight size={18} className="text-slate-300" />
                </button>
                <button onClick={() => handleNavigate(Tab.PERSONAL_DOCUMENTS, '/profile/documents')} className="w-full flex items-center justify-between p-4 bg-white hover:bg-slate-50 border-b border-slate-100 transition-colors">
                  <div className="flex items-center gap-4">
                    <div className="text-slate-500"><FileText size={20} /></div>
                    <div className="text-left">
                      <p className="text-[14px] font-medium text-slate-900">Personal Documents</p>
                      <p className="text-[12px] text-slate-500">Aadhar, PAN & License verification</p>
                    </div>
                  </div>
                  <ChevronRight size={18} className="text-slate-300" />
                </button>
                <button onClick={() => handleNavigate(Tab.INVOICES, '/invoices')} className="w-full flex items-center justify-between p-4 bg-white hover:bg-slate-50 transition-colors">
                  <div className="flex items-center gap-4">
                    <div className="text-slate-500"><Receipt size={20} /></div>
                    <div className="text-left">
                      <p className="text-[14px] font-medium text-slate-900">Invoices & Statements</p>
                      <p className="text-[12px] text-slate-500">Download payout receipts</p>
                    </div>
                  </div>
                  <ChevronRight size={18} className="text-slate-300" />
                </button>
              </div>
            </div>

            <div>
              <h3 className="text-[14px] font-bold text-slate-900 px-1 mb-2 pt-2">Partner Store & Perks</h3>
              <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
                <button onClick={() => handleNavigate(Tab.PARTNER_STORE, '/store')} className="w-full flex items-center justify-between p-4 bg-white hover:bg-slate-50 transition-colors">
                  <div className="flex items-center gap-4">
                    <div className="text-slate-500"><ShoppingBag size={20} /></div>
                    <div className="text-left">
                      <p className="text-[14px] font-medium text-slate-900">Partner Gear Store</p>
                      <p className="text-[12px] text-slate-500">T-shirts, bags, helmets & raincoats</p>
                    </div>
                  </div>
                  <ChevronRight size={18} className="text-slate-300" />
                </button>
              </div>
            </div>

            <div>
              <h3 className="text-[14px] font-bold text-slate-900 px-1 mb-2 pt-2">Support & Learning</h3>
              <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
                <button onClick={() => handleNavigate(Tab.SUPPORT, '/support')} className="w-full flex items-center justify-between p-4 bg-white hover:bg-slate-50 border-b border-slate-100 transition-colors">
                  <div className="flex items-center gap-4">
                    <div className="text-slate-500"><Phone size={20} /></div>
                    <p className="text-[14px] font-medium text-slate-900">Partner Support & Help</p>
                  </div>
                  <ChevronRight size={18} className="text-slate-300" />
                </button>
                <button onClick={() => handleNavigate(Tab.CREVINGS_STUDIO, '/studio')} className="w-full flex items-center justify-between p-4 bg-white hover:bg-slate-50 border-b border-slate-100 transition-colors">
                  <div className="flex items-center gap-4">
                    <div className="text-slate-500"><Award size={20} /></div>
                    <p className="text-[14px] font-medium text-slate-900">Crevings Studio (Training)</p>
                  </div>
                  <ChevronRight size={18} className="text-slate-300" />
                </button>
                <button onClick={() => handleNavigate(Tab.CREVINGS_LEGAL, '/legal')} className="w-full flex items-center justify-between p-4 bg-white hover:bg-slate-50 border-b border-slate-100 transition-colors">
                  <div className="flex items-center gap-4">
                    <div className="text-slate-500"><FileText size={20} /></div>
                    <p className="text-[14px] font-medium text-slate-900">Terms & Policies</p>
                  </div>
                  <ChevronRight size={18} className="text-slate-300" />
                </button>
                <button onClick={() => handleNavigate(Tab.SETTINGS, '/settings')} className="w-full flex items-center justify-between p-4 bg-white hover:bg-slate-50 transition-colors">
                  <div className="flex items-center gap-4">
                    <div className="text-slate-500"><Settings size={20} /></div>
                    <p className="text-[14px] font-medium text-slate-900">App Settings</p>
                  </div>
                  <ChevronRight size={18} className="text-slate-300" />
                </button>
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

              <h3 className="text-[20px] font-bold text-slate-900 mb-2 text-center">Log Out?</h3>
              <p className="text-[14px] text-slate-500 text-center mb-8 px-4">Are you sure you want to log out from the partner app?</p>

              <div className="flex flex-col gap-3">
                <button
                  onClick={async () => {
                    setShowLogoutConfirm(false);
                    onLogout?.();
                    await logout();
                    navigate('/login', { replace: true });
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
    </div>
  );
};
