import React, { useState } from 'react';
import { ArrowLeft, Phone, Mail, MessageCircle, HelpCircle, ChevronDown, Info } from 'lucide-react';

interface RelationshipManagerViewProps {
  onBack: () => void;
}

export const RelationshipManagerView: React.FC<RelationshipManagerViewProps> = ({ onBack }) => {
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(null);

  const faqs = [
    {
      question: "What happens after subscription ends?",
      answer: "Your account will be downgraded to the free tier, which has higher commission rates and limited features. You can renew at any time to restore your benefits."
    },
    {
      question: "Can I cancel anytime?",
      answer: "Yes, you can cancel your subscription at any time. Your benefits will remain active until the end of your current billing cycle."
    },
    {
      question: "Will GST invoice be provided?",
      answer: "Yes, a GST invoice is generated for every successful payment and can be downloaded from the Business Documents section."
    },
    {
      question: "Can I upgrade or downgrade plan?",
      answer: "You can upgrade your plan instantly. The prorated amount will be adjusted. Downgrades will take effect at the start of your next billing cycle."
    }
  ];

  const toggleFaq = (index: number) => {
    setOpenFaqIndex(openFaqIndex === index ? null : index);
  };

  return (
    <div className="min-h-screen bg-[#FFFFFF] font-sans animate-in fade-in duration-300 pb-10">
      {/* Page Header */}
      <header className="sticky top-0 z-40 bg-[#FFFFFF] border-b border-slate-100 h-[56px] flex items-center px-4">
        <button 
          onClick={onBack} 
          className="w-10 h-10 flex items-center justify-center -ml-2 text-slate-700 active:bg-slate-100 rounded-full transition-colors"
        >
          <ArrowLeft size={22} />
        </button>
        <h1 className="text-[18px] font-semibold text-slate-900 ml-2">Relationship Manager</h1>
      </header>

      <div className="p-4 pt-6">
        {/* Important Notice */}
        <div className="mb-6 bg-blue-50 border border-blue-100 rounded-[16px] p-4 flex gap-3 shadow-sm">
          <Info size={20} className="text-blue-600 shrink-0 mt-0.5" />
          <p className="text-sm text-blue-800 leading-relaxed font-medium">
            Note: For any support related work like payment issues, order support, etc., please directly contact your Relationship Manager.
          </p>
        </div>

        {/* Manager Profile Card */}
        <div className="bg-[#FFFFFF] rounded-[20px] p-5 border border-[#E5E7EB] shadow-sm flex flex-col items-center text-center">
          
          {/* Manager Photo */}
          <div className="w-[80px] h-[80px] rounded-full overflow-hidden mb-4 border-2 border-slate-100 shadow-sm bg-slate-100">
            <img 
              src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=200&auto=format&fit=crop" 
              alt="Rahul Sharma" 
              className="w-full h-full object-cover"
            />
          </div>

          {/* Manager Details */}
          <h2 className="text-[18px] font-semibold text-slate-900 mb-1">Rahul Sharma</h2>
          <p className="text-[13px] text-[#6B7280] mb-6">Relationship Manager</p>

          {/* Action Buttons */}
          <div className="w-full space-y-3 mb-6">
            <button className="w-full h-[44px] bg-[#1E90FF] text-white rounded-[12px] font-medium text-[15px] flex items-center justify-center gap-2 active:scale-[0.98] transition-all shadow-sm">
              <Phone size={18} />
              Call
            </button>
            <button className="w-full h-[44px] bg-[#25D366] hover:bg-[#128C7E] text-white rounded-[12px] font-medium text-[15px] flex items-center justify-center gap-2 active:scale-[0.98] transition-all shadow-sm">
              <MessageCircle size={18} />
              WhatsApp Chat
            </button>
            <button className="w-full h-[44px] bg-[#FFFFFF] border border-[#E5E7EB] text-slate-700 rounded-[12px] font-medium text-[15px] flex items-center justify-center gap-2 active:scale-[0.98] transition-all">
              <Mail size={18} />
              Email
            </button>
          </div>

          {/* Availability Info */}
          <div className="flex items-center justify-center gap-1.5 text-[13px] text-slate-500">
            <div className="w-2 h-2 rounded-full bg-emerald-500"></div>
            <span>Available • Mon–Sat • 10 AM – 7 PM</span>
          </div>
        </div>

        {/* FAQ Section */}
        <div className="mt-8">
          <h2 className="text-lg font-bold text-slate-900 mb-4">Frequently Asked Questions</h2>
          <div className="space-y-3">
            {faqs.map((faq, index) => (
              <div 
                key={index} 
                className="bg-[#FFFFFF] border border-slate-200 rounded-[16px] overflow-hidden transition-all duration-300"
              >
                <button 
                  onClick={() => toggleFaq(index)}
                  className="w-full px-4 py-4 flex items-center justify-between text-left active:bg-slate-50"
                >
                  <span className="font-semibold text-slate-800 text-sm pr-4">{faq.question}</span>
                  <div className={`shrink-0 transition-transform duration-300 ${openFaqIndex === index ? 'rotate-180 text-blue-600' : 'text-slate-400'}`}>
                    <ChevronDown size={20} />
                  </div>
                </button>
                
                <div 
                  className={`px-4 overflow-hidden transition-all duration-300 ease-in-out ${
                    openFaqIndex === index ? 'max-h-40 pb-4 opacity-100' : 'max-h-0 opacity-0'
                  }`}
                >
                  <p className="text-sm text-slate-600 leading-relaxed pt-2 border-t border-slate-100">
                    {faq.answer}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Optional Section */}
        <div className="mt-6 text-center">
          <p className="text-[13px] text-slate-500 mb-3">If manager is not available:</p>
          <button className="inline-flex items-center justify-center gap-2 px-4 py-2 text-[14px] font-medium text-[#1E90FF] bg-blue-50 rounded-full active:scale-95 transition-transform">
            <HelpCircle size={16} />
            Contact Support
          </button>
        </div>
      </div>
    </div>
  );
};
