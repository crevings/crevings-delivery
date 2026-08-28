import React from 'react';
import { ArrowLeft, CheckCircle2, FileText, ChevronRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

import { usePartnerProfile } from '@/api/profile';

interface PersonalDocumentsViewProps {
  onBack?: () => void;
}

export const PersonalDocumentsView: React.FC<PersonalDocumentsViewProps> = ({ onBack }) => {
  const navigate = useNavigate();
  const handleBack = () => {
    if (onBack) onBack();
    else if (window.history.length > 1) navigate(-1);
    else navigate('/');
  };

  const { profile, isLoading } = usePartnerProfile();

  // Auto-verify: if the API returns document details with a URL or verified
  // flag, mark the document as verified. This covers cases where KYC was
  // completed externally or the document was previously submitted.
  const isAadhaarVerified = profile?.aadhaarVerified || profile?.kycStatus === 'VERIFIED'
    || Boolean(profile?.aadhaarFrontUrl || profile?.documents?.find(d => d.type?.includes('AADHAAR'))?.url);
  const isPanVerified = profile?.panVerified || profile?.kycStatus === 'VERIFIED'
    || Boolean(profile?.panCardUrl || profile?.documents?.find(d => d.type?.includes('PAN'))?.url);
  const isSelfieUploaded = Boolean(profile?.selfieUrl || profile?.documents?.find(d => d.type === 'SELFIE')?.url);

  const docList = [
    {
      title: 'Aadhaar Card',
      number: profile?.aadhaarNumber ? `XXXX XXXX ${profile.aadhaarNumber.slice(-4)}` : 'Not provided',
      verified: isAadhaarVerified,
      url: profile?.aadhaarFrontUrl || profile?.documents?.find(d => d.type?.includes('AADHAAR'))?.url,
    },
    {
      title: 'PAN Card',
      number: profile?.panNumber || 'Not provided',
      verified: isPanVerified,
      url: profile?.panCardUrl || profile?.documents?.find(d => d.type?.includes('PAN'))?.url,
    },
    {
      title: 'Identity Selfie Photo',
      number: profile?.name || 'Selfie',
      verified: isSelfieUploaded,
      url: profile?.selfieUrl || profile?.documents?.find(d => d.type === 'SELFIE')?.url,
    },
  ];

  return (
    <div className="min-h-screen bg-white pb-24 font-sans animate-in fade-in duration-300">
      <header className="sticky top-0 z-40 bg-white h-[60px] flex items-center px-4 mb-2 border-b border-slate-100">
        <button onClick={handleBack} className="w-10 h-10 flex items-center justify-center -ml-2 text-slate-700 active:scale-95 transition-transform">
          <ArrowLeft size={24} />
        </button>
        <h1 className="text-[20px] font-bold text-slate-900 ml-2">Verified Documents</h1>
      </header>

      <div className="px-4 space-y-1">
        {docList.map((doc, idx) => (
          <div key={idx} className="py-4 border-b border-slate-100 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-slate-50 border border-slate-100 flex items-center justify-center shrink-0 text-slate-700">
                <FileText size={22} />
              </div>
              <div>
                <p className="text-[16px] font-semibold text-slate-900 mb-0.5">{doc.title}</p>
                <div className="flex items-center gap-1.5">
                  {doc.verified ? (
                    <div className="flex items-center gap-1 text-emerald-600">
                      <CheckCircle2 size={15} />
                      <span className="text-[13px] font-medium">Verified • {doc.number}</span>
                    </div>
                  ) : (
                    <span className="text-[13px] text-slate-400 font-medium">Pending Submission</span>
                  )}
                </div>
              </div>
            </div>

            {doc.url && (
              <a
                href={doc.url}
                target="_blank"
                rel="noreferrer"
                className="text-xs font-bold text-blue-600 px-3 py-1.5 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors"
              >
                View
              </a>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};
