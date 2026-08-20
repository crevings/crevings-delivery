import React, { useState, useEffect } from 'react';
import { 
  User, Phone, Mail, Droplet, AlertTriangle, CreditCard, MessageCircle, 
  Edit2, X, Calendar, Shield, UserPlus, CheckCircle2, AlertCircle 
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
      {/* Top action bar — no duplicate page header */}
      <div className="flex items-center justify-between px-4 py-3 bg-white border-b border-slate-100">
        <div>
          <span className="text-[13px] font-bold text-slate-700 uppercase tracking-wide">
            {isEditing ? "Edit Personal Details" : "Personal Information"}
          </span>
        </div>
        <div className="flex items-center gap-2">
          {!isEditing && (
            <button
              onClick={() => setIsEditing(true)}
              className="flex items-center gap-1.5 px-3.5 py-1.5 bg-[#00bd6f]/10 hover:bg-[#00bd6f]/20 text-[#00bd6f] rounded-xl font-bold text-xs transition-colors active:scale-95 border border-[#00bd6f]/20"
            >
              <Edit2 size={14} />
              <span>Edit</span>
            </button>
          )}
          {isEditing && (
            <>
              <button
                onClick={handleCancel}
                disabled={isLoading}
                className="w-9 h-9 bg-slate-100 hover:bg-slate-200 rounded-xl flex items-center justify-center transition-colors active:scale-95 disabled:opacity-50 text-slate-600"
                title="Cancel"
              >
                <X size={18} />
              </button>
              <button
                onClick={handleSave}
                disabled={isLoading}
                className="px-4 h-9 bg-[#00bd6f] hover:bg-[#00a862] rounded-xl flex items-center justify-center transition-colors active:scale-95 disabled:opacity-50 text-white font-bold text-xs shadow-md shadow-emerald-500/20"
              >
                Save
              </button>
            </>
          )}
        </div>
      </div>

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