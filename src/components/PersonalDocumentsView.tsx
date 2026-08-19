import React from 'react';
import { ArrowLeft, CheckCircle2, FileText, ChevronRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

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

  return (
    <div className="min-h-screen bg-white pb-24 font-sans animate-in fade-in duration-300">
      <header className="sticky top-0 z-40 bg-white h-[60px] flex items-center px-4 mb-2">
        <button onClick={handleBack} className="w-10 h-10 flex items-center justify-center -ml-2 text-slate-700 active:scale-95 transition-transform">
          <ArrowLeft size={24} />
        </button>
        <h1 className="text-[20px] font-bold text-slate-900 ml-2">Verified Documents</h1>
      </header>

      <div className="px-4">
        
        <div className="py-4 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-full bg-slate-50 border border-slate-100 flex items-center justify-center shrink-0 text-slate-700">
              <FileText size={22} />
            </div>
            <div>
              <p className="text-[16px] font-semibold text-slate-900 mb-0.5">Aadhar Card</p>
              <div className="flex items-center gap-1.5 text-emerald-600">
                <CheckCircle2 size={16} />
                <span className="text-[13px] font-medium">Verified Successfully</span>
              </div>
            </div>
          </div>
        </div>

        <div className="py-4 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-full bg-slate-50 border border-slate-100 flex items-center justify-center shrink-0 text-slate-700">
              <FileText size={22} />
            </div>
            <div>
              <p className="text-[16px] font-semibold text-slate-900 mb-0.5">PAN Card</p>
              <div className="flex items-center gap-1.5 text-emerald-600">
                <CheckCircle2 size={16} />
                <span className="text-[13px] font-medium">Verified Successfully</span>
              </div>
            </div>
          </div>
        </div>

        <div className="py-4 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-full bg-slate-50 border border-slate-100 flex items-center justify-center shrink-0 text-slate-700">
              <FileText size={22} />
            </div>
            <div>
              <p className="text-[16px] font-semibold text-slate-900 mb-0.5">Driving License</p>
              <div className="flex items-center gap-1.5 text-emerald-600">
                <CheckCircle2 size={16} />
                <span className="text-[13px] font-medium">Verified Successfully</span>
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};
