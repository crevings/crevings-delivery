import React, { useState, useMemo } from 'react';
import { ArrowLeft, MoreVertical, Plus, ShieldCheck, X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { usePartnerProfile, updatePartnerProfile } from '@/api/profile';

interface BankAccountViewProps {
  onBack?: () => void;
}

interface BankAccount {
  id: number;
  bankName: string;
  holderName: string;
  accountNumber: string;
  ifscCode: string;
  upiId?: string;
  isPrimary: boolean;
  verified?: boolean;
}

export const BankAccountView: React.FC<BankAccountViewProps> = ({ onBack }) => {
  const navigate = useNavigate();
  const handleBack = () => {
    if (onBack) onBack();
    else if (window.history.length > 1) navigate(-1);
    else navigate('/');
  };

  const { profile, isLoading, mutate } = usePartnerProfile();

  const accounts: BankAccount[] = useMemo(() => {
    if (!profile?.bankAccount?.accountNumber) return [];
    return [
      {
        id: 1,
        bankName: profile.bankAccount.ifsc?.slice(0, 4) ? `${profile.bankAccount.ifsc.slice(0, 4).toUpperCase()} Bank` : 'Primary Bank Account',
        holderName: profile.bankAccount.accountHolderName || profile.name || 'Account Holder',
        accountNumber: profile.bankAccount.accountNumber,
        ifscCode: profile.bankAccount.ifsc || '',
        isPrimary: true,
        verified: profile.bankAccount.verified || false,
      }
    ];
  }, [profile]);

  const [activeMenuId, setActiveMenuId] = useState<number | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<number | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  
  const [formData, setFormData] = useState({
    bankName: '',
    holderName: '',
    accountNumber: '',
    confirmAccountNumber: '',
    ifscCode: '',
    upiId: ''
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleOpenAdd = () => {
    setFormData({
      bankName: '',
      holderName: profile?.name || '',
      accountNumber: '',
      confirmAccountNumber: '',
      ifscCode: '',
      upiId: ''
    });
    setErrors({});
    setSaveError(null);
    setShowAddModal(true);
  };

  const handleOpenEdit = (account: BankAccount) => {
    setFormData({
      bankName: account.bankName,
      holderName: account.holderName,
      accountNumber: account.accountNumber,
      confirmAccountNumber: account.accountNumber,
      ifscCode: account.ifscCode,
      upiId: account.upiId || ''
    });
    setErrors({});
    setSaveError(null);
    setActiveMenuId(null);
    setShowAddModal(true);
  };

  const handleDeleteClick = (id: number) => {
    setShowDeleteConfirm(id);
    setActiveMenuId(null);
  };

  const confirmDelete = async () => {
    if (showDeleteConfirm !== null) {
      await updatePartnerProfile({
        bankAccount: {
          accountHolderName: '',
          accountNumber: '',
          ifsc: '',
          verified: false
        }
      });
      await mutate();
      setShowDeleteConfirm(null);
    }
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    if (!formData.holderName.trim()) newErrors.holderName = 'Account Holder Name is required';
    if (!formData.accountNumber.trim()) newErrors.accountNumber = 'Account Number is required';
    if (!formData.confirmAccountNumber.trim()) newErrors.confirmAccountNumber = 'Please re-enter account number';
    if (formData.accountNumber !== formData.confirmAccountNumber) {
      newErrors.confirmAccountNumber = 'Account numbers do not match';
    }
    if (!formData.ifscCode.trim()) {
      newErrors.ifscCode = 'IFSC Code is required';
    } else if (!/^[A-Z]{4}0[A-Z0-9]{6}$/.test(formData.ifscCode.toUpperCase().trim())) {
      newErrors.ifscCode = 'Invalid IFSC Code format (e.g. HDFC0001234)';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSaveAccount = async () => {
    if (!validateForm()) return;
    setIsSaving(true);
    setSaveError(null);

    try {
      await updatePartnerProfile({
        bankAccount: {
          accountHolderName: formData.holderName.trim(),
          accountNumber: formData.accountNumber.trim(),
          ifsc: formData.ifscCode.trim().toUpperCase(),
        }
      });
      await mutate();
      setShowAddModal(false);
    } catch (err: any) {
      setSaveError(err.message || 'Failed to save bank details. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  const maskAccountNumber = (accNum: string) => {
    if (accNum.length <= 4) return accNum;
    return `**** **** ${accNum.slice(-4)}`;
  };

  return (
    <div className="min-h-screen bg-[#FFFFFF] pb-24 font-sans animate-in fade-in duration-300">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-[#FFFFFF] border-b border-slate-100 h-[56px] flex items-center justify-between px-4">
        <div className="flex items-center gap-3">
          <button onClick={handleBack} className="w-10 h-10 flex items-center justify-center -ml-2 text-slate-700 active:scale-95 transition-transform">
            <ArrowLeft size={24} />
          </button>
          <h1 className="text-[18px] font-semibold text-slate-900">Bank Accounts</h1>
        </div>
        <button onClick={handleOpenAdd} className="w-10 h-10 flex items-center justify-center -mr-2 text-[#1E90FF] active:scale-95 transition-transform">
          <Plus size={24} />
        </button>
      </header>

      <div className="p-4 space-y-4">
        {/* Security Indicator */}
        <div className="flex items-center justify-center gap-2 py-2">
          <ShieldCheck size={16} className="text-emerald-600" />
          <p className="text-[12px] font-medium text-slate-500">Your bank details are securely stored and encrypted</p>
        </div>

        {/* Bank Accounts List */}
        <div className="space-y-4">
          {accounts.length > 0 ? (
            accounts.map(account => (
              <div key={account.id} className="bg-[#FFFFFF] rounded-[16px] p-4 border border-[#E5E7EB] shadow-sm relative">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h3 className="text-[16px] font-bold text-slate-900">{account.bankName}</h3>
                    {account.isPrimary && (
                      <div className="mt-1.5 inline-flex items-center px-2 py-0.5 rounded-md bg-[#DCFCE7] text-[#15803D] text-[11px] font-bold uppercase tracking-wide">
                        Primary Account
                      </div>
                    )}
                  </div>
                  <button 
                    onClick={() => setActiveMenuId(activeMenuId === account.id ? null : account.id)}
                    className="w-8 h-8 flex items-center justify-center text-slate-400 active:bg-slate-50 rounded-full -mr-2 -mt-2"
                  >
                    <MoreVertical size={20} />
                  </button>
                </div>

                <div className="space-y-3">
                  <div>
                    <p className="text-[12px] text-slate-500 font-medium mb-0.5">Account Holder Name</p>
                    <p className="text-[15px] font-semibold text-slate-900">{account.holderName}</p>
                  </div>
                  <div>
                    <p className="text-[12px] text-slate-500 font-medium mb-0.5">Account Number</p>
                    <p className="text-[16px] font-mono font-semibold text-slate-900 tracking-wider">{maskAccountNumber(account.accountNumber)}</p>
                  </div>
                  <div>
                    <p className="text-[12px] text-slate-500 font-medium mb-0.5">IFSC Code</p>
                    <p className="text-[15px] font-semibold text-slate-900">{account.ifscCode}</p>
                  </div>
                </div>

                {/* 3-Dot Menu Dropdown */}
                {activeMenuId === account.id && (
                  <>
                    <div className="fixed inset-0 z-10" onClick={() => setActiveMenuId(null)} />
                    <div className="absolute right-4 top-12 w-48 bg-[#FFFFFF] rounded-xl shadow-lg border border-slate-100 z-20 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
                      <button onClick={() => handleOpenEdit(account)} className="w-full px-4 py-3 text-left text-[14px] font-medium text-slate-700 hover:bg-slate-50 border-b border-slate-50">
                        Edit
                      </button>
                      <button onClick={() => handleDeleteClick(account.id)} className="w-full px-4 py-3 text-left text-[14px] font-medium text-red-600 hover:bg-red-50">
                        Delete
                      </button>
                    </div>
                  </>
                )}
              </div>
            ))
          ) : (
            <div className="flex flex-col items-center justify-center py-16 text-center bg-slate-50 rounded-2xl border border-slate-200">
              <p className="text-[15px] font-bold text-slate-900 mb-1">No bank account added</p>
              <p className="text-[13px] text-slate-500 mb-4 max-w-xs">Add your bank account details to receive weekly automated payouts.</p>
              <button
                onClick={handleOpenAdd}
                className="px-5 py-2.5 bg-[#1E90FF] text-white rounded-xl text-xs font-bold active:scale-95 shadow-sm"
              >
                + Add Bank Account
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Add/Edit Bank Account Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-[100] bg-black/50 flex flex-col justify-end animate-in fade-in duration-200">
          <div className="bg-[#FFFFFF] rounded-t-[24px] p-4 pb-8 animate-in slide-in-from-bottom-full duration-300 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6 sticky top-0 bg-[#FFFFFF] z-10 py-2">
              <h2 className="text-[18px] font-bold text-slate-900">{accounts.length > 0 ? 'Edit Bank Account' : 'Add Bank Account'}</h2>
              <button onClick={() => setShowAddModal(false)} className="p-2 text-slate-400 hover:text-slate-900 bg-slate-50 rounded-full">
                <X size={20} />
              </button>
            </div>
            
            <div className="space-y-4">
              {saveError && (
                <div className="p-3 rounded-xl bg-red-50 text-red-600 text-xs font-medium border border-red-100">
                  {saveError}
                </div>
              )}

              <div>
                <label className="block text-[13px] font-medium text-slate-700 mb-1.5">Account Holder Name</label>
                <input 
                  type="text"
                  value={formData.holderName}
                  onChange={(e) => setFormData({...formData, holderName: e.target.value})}
                  className={`w-full h-[48px] px-3 bg-[#FFFFFF] border ${errors.holderName ? 'border-red-500' : 'border-[#E5E7EB]'} rounded-[12px] text-[15px] text-slate-900 focus:outline-none focus:border-[#1E90FF] transition-colors`}
                  placeholder="e.g. Rahul Sharma"
                />
                {errors.holderName && <p className="text-red-500 text-[12px] mt-1">{errors.holderName}</p>}
              </div>

              <div>
                <label className="block text-[13px] font-medium text-slate-700 mb-1.5">Account Number</label>
                <input 
                  type="password"
                  value={formData.accountNumber}
                  onChange={(e) => setFormData({...formData, accountNumber: e.target.value})}
                  className={`w-full h-[48px] px-3 bg-[#FFFFFF] border ${errors.accountNumber ? 'border-red-500' : 'border-[#E5E7EB]'} rounded-[12px] text-[15px] text-slate-900 focus:outline-none focus:border-[#1E90FF] transition-colors`}
                  placeholder="Enter account number"
                />
                {errors.accountNumber && <p className="text-red-500 text-[12px] mt-1">{errors.accountNumber}</p>}
              </div>

              <div>
                <label className="block text-[13px] font-medium text-slate-700 mb-1.5">Re-enter Account Number</label>
                <input 
                  type="text"
                  value={formData.confirmAccountNumber}
                  onChange={(e) => setFormData({...formData, confirmAccountNumber: e.target.value})}
                  className={`w-full h-[48px] px-3 bg-[#FFFFFF] border ${errors.confirmAccountNumber ? 'border-red-500' : 'border-[#E5E7EB]'} rounded-[12px] text-[15px] text-slate-900 focus:outline-none focus:border-[#1E90FF] transition-colors`}
                  placeholder="Re-enter account number"
                />
                {errors.confirmAccountNumber && <p className="text-red-500 text-[12px] mt-1">{errors.confirmAccountNumber}</p>}
              </div>

              <div>
                <label className="block text-[13px] font-medium text-slate-700 mb-1.5">IFSC Code</label>
                <input 
                  type="text"
                  value={formData.ifscCode}
                  onChange={(e) => setFormData({...formData, ifscCode: e.target.value.toUpperCase()})}
                  className={`w-full h-[48px] px-3 bg-[#FFFFFF] border ${errors.ifscCode ? 'border-red-500' : 'border-[#E5E7EB]'} rounded-[12px] text-[15px] text-slate-900 focus:outline-none focus:border-[#1E90FF] transition-colors uppercase`}
                  placeholder="e.g. HDFC0001234"
                />
                {errors.ifscCode && <p className="text-red-500 text-[12px] mt-1">{errors.ifscCode}</p>}
              </div>

              <div className="pt-4">
                <button 
                  onClick={handleSaveAccount}
                  disabled={isSaving}
                  className="w-full h-[52px] bg-[#1E90FF] text-white rounded-[14px] font-semibold text-[16px] flex items-center justify-center active:scale-[0.98] transition-all shadow-sm disabled:opacity-50"
                >
                  {isSaving ? 'Saving...' : 'Save Bank Account'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm !== null && (
        <div className="fixed inset-0 z-[110] bg-black/50 flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-[#FFFFFF] rounded-[20px] p-6 w-full max-w-sm animate-in zoom-in-95 duration-200">
            <h3 className="text-[18px] font-bold text-slate-900 mb-2">Delete Bank Account</h3>
            <p className="text-[15px] text-slate-600 mb-6">Are you sure you want to delete this bank account?</p>
            <div className="flex gap-3">
              <button 
                onClick={() => setShowDeleteConfirm(null)}
                className="flex-1 h-[48px] bg-slate-100 text-slate-700 rounded-xl font-semibold text-[15px] active:bg-slate-200 transition-colors"
              >
                Cancel
              </button>
              <button 
                onClick={confirmDelete}
                className="flex-1 h-[48px] bg-red-600 text-white rounded-xl font-semibold text-[15px] active:bg-red-700 transition-colors"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
