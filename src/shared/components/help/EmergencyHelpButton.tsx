import React, { useState } from 'react';
import { Phone, ShieldAlert, Ambulance, Headphones, X, AlertTriangle } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export const EmergencyHelpButton: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);

  const emergencyContacts = [
    {
      id: 'ambulance',
      title: 'Call Ambulance',
      subtitle: 'Medical emergency service',
      number: '108',
      telUrl: 'tel:108',
      icon: Ambulance,
      color: 'bg-red-500',
      textColor: 'text-red-600',
      bgColor: 'bg-red-50',
      borderColor: 'border-red-100',
      btnBg: 'bg-red-600 hover:bg-red-700',
    },
    {
      id: 'police',
      title: 'Call Police',
      subtitle: 'Safety & emergency response',
      number: '112',
      telUrl: 'tel:112',
      icon: ShieldAlert,
      color: 'bg-blue-600',
      textColor: 'text-blue-600',
      bgColor: 'bg-blue-50',
      borderColor: 'border-blue-100',
      btnBg: 'bg-blue-600 hover:bg-blue-700',
    },
    {
      id: 'support',
      title: 'Contact Support',
      subtitle: 'Delivery partner helpline',
      number: '+91 93697 97768',
      telUrl: 'tel:+919369797768',
      icon: Headphones,
      color: 'bg-emerald-600',
      textColor: 'text-emerald-600',
      bgColor: 'bg-emerald-50',
      borderColor: 'border-emerald-100',
      btnBg: 'bg-emerald-600 hover:bg-emerald-700',
    },
  ];

  return (
    <>
      {/* Floating Action Button */}
      <div className="fixed bottom-[calc(5rem+env(safe-area-inset-bottom,0px))] right-4 z-40 lg:bottom-8 lg:right-8">
        <button
          onClick={() => setIsOpen(true)}
          className="group relative flex items-center justify-center w-14 h-14 rounded-full bg-gradient-to-tr from-red-600 to-rose-500 text-white shadow-lg shadow-red-500/25 active:scale-95 transition-transform duration-200 focus:outline-none"
          aria-label="Emergency Help & Support"
        >
          <div className="flex flex-col items-center justify-center">
            <AlertTriangle className="w-5 h-5 stroke-[2.5]" />
            <span className="text-[9px] font-black tracking-wider uppercase leading-none mt-0.5">SOS</span>
          </div>
        </button>
      </div>

      {/* Modal / Bottom Sheet */}
      <AnimatePresence>
        {isOpen && (
          <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center">
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsOpen(false)}
              className="fixed inset-0 bg-black/60 backdrop-blur-xs transition-opacity"
            />

            {/* Modal Card */}
            <motion.div
              initial={{ y: '100%', opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: '100%', opacity: 0 }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              className="relative w-full max-w-md bg-white rounded-t-[28px] sm:rounded-[28px] p-5 sm:p-6 shadow-2xl z-10 mx-auto"
            >
              {/* Top Grab Handle */}
              <div className="w-12 h-1.5 bg-slate-200 rounded-full mx-auto mb-4 sm:hidden" />

              {/* Header */}
              <div className="flex items-center justify-between mb-5">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-2xl bg-red-100 flex items-center justify-center text-red-600">
                    <AlertTriangle className="w-5 h-5 stroke-[2.5]" />
                  </div>
                  <div>
                    <h3 className="text-lg font-black text-slate-900 leading-tight">
                      Emergency & Help
                    </h3>
                    <p className="text-xs text-slate-500 font-medium">
                      Immediate assistance & partner support
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setIsOpen(false)}
                  className="w-9 h-9 flex items-center justify-center rounded-full bg-slate-100 text-slate-500 hover:bg-slate-200 active:scale-95 transition-all"
                  aria-label="Close"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Contact Options */}
              <div className="space-y-3">
                {emergencyContacts.map((contact) => {
                  const Icon = contact.icon;
                  return (
                    <div
                      key={contact.id}
                      className={`flex items-center justify-between p-3.5 rounded-2xl border ${contact.borderColor} ${contact.bgColor} transition-all`}
                    >
                      <div className="flex items-center gap-3.5">
                        <div className={`w-11 h-11 rounded-xl ${contact.color} text-white flex items-center justify-center shadow-sm shrink-0`}>
                          <Icon className="w-5 h-5 stroke-[2.5]" />
                        </div>
                        <div>
                          <h4 className="text-sm font-bold text-slate-900">
                            {contact.title}
                          </h4>
                          <p className="text-xs text-slate-500 font-medium">
                            {contact.subtitle} • <span className="font-semibold text-slate-700">{contact.number}</span>
                          </p>
                        </div>
                      </div>

                      <a
                        href={contact.telUrl}
                        className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-white text-xs font-bold shadow-sm ${contact.btnBg} active:scale-95 transition-all shrink-0`}
                      >
                        <Phone className="w-3.5 h-3.5 fill-current" />
                        <span>Call</span>
                      </a>
                    </div>
                  );
                })}
              </div>

              {/* Footer Note */}
              <div className="mt-5 pt-3 border-t border-slate-100 text-center">
                <p className="text-[11px] text-slate-400 font-medium">
                  In case of life-threatening situations, always dial 112 immediately.
                </p>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
};
