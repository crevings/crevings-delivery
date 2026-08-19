import React from 'react';
import { ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface ComingSoonViewProps {
  title: string;
  onBack?: () => void;
}

export const ComingSoonView: React.FC<ComingSoonViewProps> = ({ title, onBack }) => {
  const navigate = useNavigate();
  const handleBack = () => {
    if (onBack) onBack();
    else if (window.history.length > 1) navigate(-1);
    else navigate('/');
  };

  return (
    <div className="min-h-screen bg-white flex flex-col font-sans">
      <div className="bg-white px-4 pt-6 pb-4 flex items-center gap-3 shrink-0 shadow-sm">
        <button
          onClick={handleBack}
          className="w-10 h-10 bg-slate-50 hover:bg-slate-100 rounded-full flex items-center justify-center transition-colors active:scale-95 text-slate-700"
          aria-label="Go back"
        >
          <ArrowLeft size={22} />
        </button>
        <h1 className="text-[19px] font-bold text-slate-900 tracking-tight">{title}</h1>
      </div>

      <div className="flex-1 flex flex-col items-center justify-center px-6 py-12">
        <div className="w-20 h-20 bg-brand-100 rounded-2xl flex items-center justify-center mb-6">
          <svg className="w-10 h-10 text-brand-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
        <h2 className="text-2xl font-bold text-slate-900 mb-2">Coming Soon</h2>
        <p className="text-slate-500 text-center max-w-sm">
          {title} is not available yet. We're working on it.
        </p>
      </div>
    </div>
  );
};