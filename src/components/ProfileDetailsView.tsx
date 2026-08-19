import React, { useState, useEffect } from 'react';
import { 
  ArrowLeft, User, Phone, Mail, Droplet, AlertTriangle, CreditCard, MessageCircle, 
  Edit2, X, Calendar, Shield, UserPlus, CheckCircle2 
} from 'lucide-react';
import { usePartnerProfile, updatePartnerProfile, UpdateProfileData } from '@/api/profile';
import { useAuthStore } from '@/app/store';
import { useNavigate } from 'react-router-dom';

interface ProfileDetailsViewProps {
  onBack?: () => void;
}

export const ProfileDetailsView: React.FC<ProfileDetailsViewProps> = ({ onBack }) => {
  const navigate = useNavigate();
  const handleBack = () => {
    if (onBack) onBack();
    else if (window.history.length > 1) navigate(-1);
    else navigate('/');
  };

  const { profile, isLoading, mutate } = usePartnerProfile();
  const partnerId = useAuthStore(s => s.partnerId);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState<UpdateProfileData>({
    name: '',
    phone: '',
    phoneVerified: false,
    dateOfBirth: '',
    emergencyContact: {
      name: '',
      phone: '',
      relationship: '',
    },
    vehicleType: 'Bike',
    vehicleNumber: '',
    licenseNumber: '',
  });
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Populate form when profile loads
  useEffect(() => {
    if (profile) {
      const dob = profile.dateOfBirth ? new Date(profile.dateOfBirth).toISOString().split('T')[0] : '';
      setFormData({
        name: profile.name || '',
        phone: profile.phone || '',
        phoneVerified: profile.phoneVerified || false,
        dateOfBirth: dob,
        emergencyContact: {
          name: profile.emergencyContact?.name || '',
          phone: profile.emergencyContact?.phone || '',
          relationship: profile.emergencyContact?.relationship || '',
        },
        vehicleType: (profile.vehicleType as UpdateProfileData['vehicleType']) || 'Bike',
        vehicleNumber: profile.vehicleNumber || '',
        licenseNumber: profile.licenseNumber || '',
      });
    }
  }, [profile]);

  const handleSave = async () => {
    const name = formData.name?.trim();
    const phone = formData.phone?.trim();
    if (!name) {
      setError('Name is required');
      return;
    }
    if (!phone) {
      setError('Phone number is required');
      return;
    }

    setError(null);
    setSuccess(null);

    try {
      await updatePartnerProfile(formData);
      await mutate(); // Re-fetch profile
      setSuccess('Profile updated successfully');
      setIsEditing(false);
      setTimeout(() => setSuccess(null), 3000);
    } catch (err: any) {
      setError(err.message || 'Failed to update profile');
    }
  };

  const handleCancel = () => {
    if (profile) {
      const dob = profile.dateOfBirth ? new Date(profile.dateOfBirth).toISOString().split('T')[0] : '';
      setFormData({
        name: profile.name || '',
        phone: profile.phone || '',
        phoneVerified: profile.phoneVerified || false,
        dateOfBirth: dob,
        emergencyContact: {
          name: profile.emergencyContact?.name || '',
          phone: profile.emergencyContact?.phone || '',
          relationship: profile.emergencyContact?.relationship || '',
        },
        vehicleType: (profile.vehicleType as UpdateProfileData['vehicleType']) || 'Bike',
        vehicleNumber: profile.vehicleNumber || '',
        licenseNumber: profile.licenseNumber || '',
      });
    }
    setError(null);
    setIsEditing(false);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-brand-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const displayName = profile?.name || '—';
  const displayPhone = profile?.phone || '—';
  const displayPhoneVerified = profile?.phoneVerified || false;
  const displayEmail = profile?.email || '—';
  const displayDob = profile?.dateOfBirth ? new Date(profile.dateOfBirth).toLocaleDateString('en-GB', {
    day: '2-digit',
    month: 'short',
    year: 'numeric'
  }) : '—';
  const displayEmergencyName = profile?.emergencyContact?.name || '—';
  const displayEmergencyPhone = profile?.emergencyContact?.phone || '—';
  const displayEmergencyRelationship = profile?.emergencyContact?.relationship || '—';

  return (
    <div className="min-h-screen bg-white pb-24 font-sans animate-in fade-in duration-300">
      <header className="sticky top-0 z-40 bg-white h-[60px] flex items-center px-4 mb-2 border-b border-slate-100">
        <button onClick={handleBack} className="w-10 h-10 flex items-center justify-center -ml-2 text-slate-700 active:scale-95 transition-transform">
          <ArrowLeft size={24} />
        </button>
        <h1 className="text-[20px] font-bold text-slate-900 ml-2">Profile Details</h1>
        <div className="ml-auto flex items-center gap-2">
          {!isEditing && (
            <button
              onClick={() => setIsEditing(true)}
              className="w-10 h-10 bg-brand-50 hover:bg-brand-100 rounded-full flex items-center justify-center transition-colors active:scale-95"
            >
              <Edit2 size={20} className="text-brand-700" />
            </button>
          )}
          {isEditing && (
            <>
              <button
                onClick={handleCancel}
                disabled={isLoading}
                className="w-10 h-10 bg-slate-50 hover:bg-slate-100 rounded-full flex items-center justify-center transition-colors active:scale-95 disabled:opacity-50"
              >
                <X size={20} className="text-slate-700" />
              </button>
              <button
                onClick={handleSave}
                disabled={isLoading}
                className="px-4 h-10 bg-brand-600 hover:bg-brand-700 rounded-full flex items-center justify-center transition-colors active:scale-95 disabled:opacity-50 text-white font-semibold text-sm"
              >
                Save
              </button>
            </>
          )}
        </div>
      </header>

      {(error || success) && (
        <div className="px-4 py-2">
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl flex items-center gap-2 text-sm animate-in slide-in-from-top-2">
              <AlertCircle size={18} />
              {error}
            </div>
          )}
          {success && (
            <div className="bg-emerald-50 border border-emerald-200 text-emerald-700 px-4 py-3 rounded-xl flex items-center gap-2 text-sm animate-in slide-in-from-top-2">
              <CheckCircle2 size={18} />
              {success}
            </div>
          )}
        </div>
      )}

      <div className="px-4">
        {/* Full Name */}
        <div className="py-4 border-b border-slate-100 flex items-center gap-4">
          <div className="w-12 h-12 rounded-full bg-slate-50 border border-slate-100 flex items-center justify-center shrink-0 text-slate-700">
            <User size={22} />
          </div>
          <div className="flex-1">
            <p className="text-[13px] text-slate-500 mb-0.5">Full Name</p>
            {isEditing ? (
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full h-10 px-4 bg-slate-50 border border-brand-200 rounded-xl text-[16px] font-semibold text-slate-900 focus:outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-100"
                placeholder="Enter your full name"
              />
            ) : (
              <p className="text-[16px] font-semibold text-slate-900">{displayName}</p>
            )}
          </div>
        </div>

        {/* Date of Birth */}
        <div className="py-4 border-b border-slate-100 flex items-center gap-4">
          <div className="w-12 h-12 rounded-full bg-blue-50 border border-blue-100 flex items-center justify-center shrink-0 text-blue-600">
            <Calendar size={22} />
          </div>
          <div className="flex-1">
            <p className="text-[13px] text-slate-500 mb-0.5">Date of Birth</p>
            {isEditing ? (
              <input
                type="date"
                value={formData.dateOfBirth}
                onChange={(e) => setFormData({ ...formData, dateOfBirth: e.target.value })}
                className="w-full h-10 px-4 bg-slate-50 border border-brand-200 rounded-xl text-[16px] font-semibold text-slate-900 focus:outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-100"
                max={new Date().toISOString().split('T')[0]}
              />
            ) : (
              <p className="text-[16px] font-semibold text-slate-900">{displayDob}</p>
            )}
          </div>
        </div>

        {/* Phone Number */}
        <div className="py-4 border-b border-slate-100 flex items-center gap-4">
          <div className="w-12 h-12 rounded-full bg-slate-50 border border-slate-100 flex items-center justify-center shrink-0 text-slate-700">
            <Phone size={22} />
          </div>
          <div className="flex-1">
            <p className="text-[13px] text-slate-500 mb-0.5">Phone Number</p>
            {isEditing ? (
              <div className="flex items-center gap-2">
                <input
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  className="flex-1 h-10 px-4 bg-slate-50 border border-brand-200 rounded-xl text-[16px] font-semibold text-slate-900 focus:outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-100"
                  placeholder="Enter phone number"
                />
                <label className="flex items-center gap-2 text-sm text-slate-600">
                  <input
                    type="checkbox"
                    checked={formData.phoneVerified}
                    onChange={(e) => setFormData({ ...formData, phoneVerified: e.target.checked })}
                    className="w-4 h-4 text-brand-600 border-brand-300 rounded focus:ring-brand-500"
                  />
                  <span>Verified</span>
                </label>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <p className="text-[16px] font-semibold text-slate-900">{displayPhone}</p>
                {displayPhoneVerified && (
                  <span className="px-2 py-1 bg-emerald-50 text-emerald-700 text-xs font-medium rounded-full flex items-center gap-1">
                    <Shield size={10} className="fill-current" />
                    Verified
                  </span>
                )}
              </div>
            )}
          </div>
        </div>

        {/* OTP Verification status */}
        <div className="py-4 border-b border-slate-100 flex items-center gap-4">
          <div className="w-12 h-12 rounded-full bg-amber-50 border border-amber-100 flex items-center justify-center shrink-0 text-amber-600">
            <Shield size={22} />
          </div>
          <div>
            <p className="text-[13px] text-slate-500 mb-0.5">OTP Verification</p>
            <p className="text-[16px] font-semibold text-slate-900">
              {displayPhoneVerified ? 'Verified' : 'Not Verified'}
            </p>
          </div>
        </div>

        {/* Email Address (read-only) */}
        <div className="py-4 border-b border-slate-100 flex items-center gap-4">
          <div className="w-12 h-12 rounded-full bg-slate-50 border border-slate-100 flex items-center justify-center shrink-0 text-slate-700">
            <Mail size={22} />
          </div>
          <div>
            <p className="text-[13px] text-slate-500 mb-0.5">Email Address</p>
            <p className="text-[16px] font-semibold text-slate-900">{displayEmail}</p>
            <p className="text-[11px] text-slate-400 mt-0.5">Email cannot be changed here</p>
          </div>
        </div>

        {/* Emergency Contact */}
        <div className="py-4 border-b border-slate-100">
          <div className="flex items-center gap-4 mb-3">
            <div className="w-12 h-12 rounded-full bg-red-50 border border-red-100 flex items-center justify-center shrink-0 text-red-500">
              <UserPlus size={22} />
            </div>
            <div>
              <p className="text-[13px] text-slate-500 mb-0.5">Emergency Contact</p>
            </div>
          </div>
          
          {isEditing ? (
            <div className="space-y-3 ml-16">
              <input
                type="text"
                value={formData.emergencyContact?.name || ''}
                onChange={(e) => setFormData({ 
                  ...formData, 
                  emergencyContact: { ...formData.emergencyContact, name: e.target.value } 
                })}
                className="w-full h-10 px-4 bg-slate-50 border border-brand-200 rounded-xl text-[16px] font-semibold text-slate-900 focus:outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-100"
                placeholder="Emergency contact name"
              />
              <input
                type="tel"
                value={formData.emergencyContact?.phone || ''}
                onChange={(e) => setFormData({ 
                  ...formData, 
                  emergencyContact: { ...formData.emergencyContact, phone: e.target.value } 
                })}
                className="w-full h-10 px-4 bg-slate-50 border border-brand-200 rounded-xl text-[16px] font-semibold text-slate-900 focus:outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-100"
                placeholder="Emergency contact phone"
              />
              <input
                type="text"
                value={formData.emergencyContact?.relationship || ''}
                onChange={(e) => setFormData({ 
                  ...formData, 
                  emergencyContact: { ...formData.emergencyContact, relationship: e.target.value } 
                })}
                className="w-full h-10 px-4 bg-slate-50 border border-brand-200 rounded-xl text-[16px] font-semibold text-slate-900 focus:outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-100"
                placeholder="Relationship (e.g., Father, Mother, Spouse)"
              />
            </div>
          ) : (
            <div className="ml-16 space-y-2">
              <p className="text-[16px] font-semibold text-slate-900">{displayEmergencyName}</p>
              <p className="text-[14px] text-slate-600">{displayEmergencyPhone}</p>
              <p className="text-[13px] text-slate-500">{displayEmergencyRelationship}</p>
            </div>
          )}
        </div>

        {/* License Number */}
        <div className="py-4 flex items-center gap-4">
          <div className="w-12 h-12 rounded-full bg-amber-50 border border-amber-100 flex items-center justify-center shrink-0 text-amber-600">
            <AlertTriangle size={22} />
          </div>
          <div className="flex-1">
            <p className="text-[13px] text-slate-500 mb-0.5">License Number</p>
            {isEditing ? (
              <input
                type="text"
                value={formData.licenseNumber}
                onChange={(e) => setFormData({ ...formData, licenseNumber: e.target.value.toUpperCase() })}
                className="w-full h-10 px-4 bg-slate-50 border border-brand-200 rounded-xl text-[16px] font-semibold text-slate-900 focus:outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-100"
                placeholder="Enter license number"
                style={{ textTransform: 'uppercase' }}
              />
            ) : (
              <p className="text-[16px] font-semibold text-slate-900">{profile?.licenseNumber || '—'}</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

import { AlertCircle } from 'lucide-react';