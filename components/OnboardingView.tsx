import React, { useState } from 'react';
import { 
  ArrowLeft, 
  MapPin, 
  Mic, 
  Bell, 
  Camera, 
  Image as ImageIcon,
  CheckCircle2,
  Upload,
  ChevronDown
} from 'lucide-react';

interface OnboardingViewProps {
  onComplete: () => void;
  onBack: () => void;
}

export const OnboardingView: React.FC<OnboardingViewProps> = ({ onComplete, onBack }) => {
  const [step, setStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Step 1: Permissions
  const [permissionsGranted, setPermissionsGranted] = useState(false);

  // Step 2: Personal Details
  const [personalDetails, setPersonalDetails] = useState({
    name: '',
    phone: '',
    email: '',
    whatsapp: '',
    emergencyName: '',
    emergencyPhone: '',
    emergencyRelationship: ''
  });

  // Step 3: Documents
  const [documents, setDocuments] = useState({
    aadharFront: null as string | null,
    aadharBack: null as string | null,
    panNumber: '',
    legalAddress: ''
  });

  // Step 4: Vehicle Info
  const [vehicle, setVehicle] = useState({
    brand: '',
    model: '',
    type: 'Bike', // Bike, Scooty, EV Bike, EV Scooty, Cycle
    numberPlate: '',
    licensePhoto: null as string | null
  });

  // Step 5: Bank Details
  const [bank, setBank] = useState({
    bankName: '',
    accountName: '',
    accountNumber: '',
    ifsc: '',
    upiId: ''
  });

  const handlePersonalChange = (field: string, value: string) => {
    setPersonalDetails(prev => ({ ...prev, [field]: value }));
  };

  const handleDocChange = (field: string, value: any) => {
    setDocuments(prev => ({ ...prev, [field]: value }));
  };

  const handleVehicleChange = (field: string, value: string) => {
    setVehicle(prev => ({ ...prev, [field]: value }));
  };

  const handleBankChange = (field: string, value: string) => {
    setBank(prev => ({ ...prev, [field]: value }));
  };

  const InputField = ({ label, placeholder = "", type = "text", value, onChange, className = "" }: any) => (
    <div className="space-y-1.5 mb-4">
      <label className="text-[13px] font-medium text-slate-600">{label}</label>
      <input 
        type={type}
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        className={`w-full h-12 px-4 bg-slate-50 border border-slate-200 rounded-xl text-[15px] text-slate-900 focus:outline-none focus:border-[#1E90FF] transition-colors focus:bg-[#FFFFFF] ${className}`}
      />
    </div>
  );

  const PhotoUpload = ({ label, photo, setPhoto }: { label: string, photo: string | null, setPhoto: (val: string | null) => void }) => (
    <div className="flex flex-col items-center justify-center p-6 border-2 border-dashed border-slate-200 rounded-3xl bg-slate-50 mb-4 cursor-pointer hover:bg-slate-100 transition-colors" onClick={() => {
      const input = document.createElement('input');
      input.type = 'file';
      input.accept = 'image/png, image/jpeg';
      input.onchange = (e: any) => {
        const file = e.target.files?.[0];
        if (file) {
          const reader = new FileReader();
          reader.onload = (event) => {
            setPhoto(event.target?.result as string);
          };
          reader.readAsDataURL(file);
        }
      };
      input.click();
    }}>
      {photo ? (
        <img src={photo} alt={label} className="w-full h-32 rounded-xl object-cover mb-3 shadow-sm" />
      ) : (
        <div className="w-12 h-12 bg-[#FFFFFF] rounded-full flex items-center justify-center text-[#1E90FF] shadow-sm mb-3">
          <Upload size={20} />
        </div>
      )}
      <p className="text-[14px] font-semibold text-[#1E90FF]">{photo ? `Change ${label}` : `Upload ${label}`}</p>
    </div>
  );

  const renderStep1 = () => (
    <div className="animate-in fade-in slide-in-from-right-4 duration-300 pb-10">
      <div className="bg-[#FFFFFF] rounded-[24px] p-6 border border-slate-200 shadow-sm mb-6 text-center">
        <div className="w-16 h-16 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center mx-auto mb-4">
          <MapPin size={28} />
        </div>
        <h2 className="text-xl font-bold text-slate-900 mb-2">App Permissions</h2>
        <p className="text-[14px] text-slate-500 mb-6">
          To provide you with the best delivery experience and get orders nearby, we need access to the following settings.
        </p>

        <div className="space-y-4 text-left">
          <div className="flex items-center gap-4 p-4 rounded-xl bg-slate-50 border border-slate-100">
            <MapPin className={permissionsGranted ? "text-emerald-500" : "text-blue-500"} size={22} />
            <div className="flex-1">
              <p className="text-[15px] font-semibold text-slate-900">Location</p>
              <p className="text-[12px] text-slate-500">To match you with nearby orders</p>
            </div>
            {permissionsGranted && <CheckCircle2 size={18} className="text-emerald-500" />}
          </div>
          <div className="flex items-center gap-4 p-4 rounded-xl bg-slate-50 border border-slate-100">
            <Mic className={permissionsGranted ? "text-emerald-500" : "text-slate-500"} size={22} />
            <div className="flex-1">
              <p className="text-[15px] font-semibold text-slate-900">Microphone</p>
              <p className="text-[12px] text-slate-500">For voice support and calls</p>
            </div>
            {permissionsGranted && <CheckCircle2 size={18} className="text-emerald-500" />}
          </div>
          <div className="flex items-center gap-4 p-4 rounded-xl bg-slate-50 border border-slate-100">
            <Bell className={permissionsGranted ? "text-emerald-500" : "text-amber-500"} size={22} />
            <div className="flex-1">
              <p className="text-[15px] font-semibold text-slate-900">Notifications</p>
              <p className="text-[12px] text-slate-500">To alert you of new gigs</p>
            </div>
            {permissionsGranted && <CheckCircle2 size={18} className="text-emerald-500" />}
          </div>
          <div className="flex items-center gap-4 p-4 rounded-xl bg-slate-50 border border-slate-100">
            <Camera className={permissionsGranted ? "text-emerald-500" : "text-purple-500"} size={22} />
            <div className="flex-1">
              <p className="text-[15px] font-semibold text-slate-900">Camera</p>
              <p className="text-[12px] text-slate-500">For document scanning</p>
            </div>
            {permissionsGranted && <CheckCircle2 size={18} className="text-emerald-500" />}
          </div>
          <div className="flex items-center gap-4 p-4 rounded-xl bg-slate-50 border border-slate-100">
            <ImageIcon className={permissionsGranted ? "text-emerald-500" : "text-rose-500"} size={22} />
            <div className="flex-1">
              <p className="text-[15px] font-semibold text-slate-900">Gallery</p>
              <p className="text-[12px] text-slate-500">To upload existing documents</p>
            </div>
            {permissionsGranted && <CheckCircle2 size={18} className="text-emerald-500" />}
          </div>
        </div>
      </div>

      <button 
        onClick={() => {
          if (!permissionsGranted) {
            setPermissionsGranted(true);
            setTimeout(() => setStep(2), 1000);
          } else {
            setStep(2);
          }
        }}
        className={`w-full h-[52px] rounded-[16px] font-semibold text-[16px] flex items-center justify-center transition-all ${
          permissionsGranted ? 'bg-emerald-500 text-white' : 'bg-[#1E90FF] text-[#FFFFFF] active:scale-[0.98]'
        }`}
      >
        {permissionsGranted ? 'Permissions Granted' : 'Allow All Permissions'}
      </button>
    </div>
  );

  const renderStep2 = () => {
    const isReady = personalDetails.name && personalDetails.phone && personalDetails.email && personalDetails.emergencyName && personalDetails.emergencyPhone && personalDetails.emergencyRelationship;
    return (
      <div className="animate-in fade-in slide-in-from-right-4 duration-300 pb-10">
        <div className="bg-[#FFFFFF] rounded-[24px] p-5 border border-slate-200 shadow-sm mb-6">
          <h3 className="text-[16px] font-bold text-slate-900 mb-4">Personal Details</h3>
          <InputField label="Full Name" placeholder="e.g. Rahul Kumar" value={personalDetails.name} onChange={(e: any) => handlePersonalChange('name', e.target.value)} />
          <InputField label="Phone Number" placeholder="10-digit mobile number" type="tel" value={personalDetails.phone} onChange={(e: any) => handlePersonalChange('phone', e.target.value)} />
          <InputField label="Email Address" placeholder="alex@example.com" type="email" value={personalDetails.email} onChange={(e: any) => handlePersonalChange('email', e.target.value)} />
          <InputField label="WhatsApp Number (Optional)" placeholder="For gig updates" type="tel" value={personalDetails.whatsapp} onChange={(e: any) => handlePersonalChange('whatsapp', e.target.value)} />
        </div>

        <div className="bg-[#FFFFFF] rounded-[24px] p-5 border border-slate-200 shadow-sm mb-6">
          <h3 className="text-[16px] font-bold text-slate-900 mb-4">Emergency Contact</h3>
          <InputField label="Contact Name" placeholder="e.g. Ramesh Kumar" value={personalDetails.emergencyName} onChange={(e: any) => handlePersonalChange('emergencyName', e.target.value)} />
          <InputField label="Contact Number" placeholder="10-digit mobile number" type="tel" value={personalDetails.emergencyPhone} onChange={(e: any) => handlePersonalChange('emergencyPhone', e.target.value)} />
          <InputField label="Relationship" placeholder="e.g. Father, Brother, Spouse" value={personalDetails.emergencyRelationship} onChange={(e: any) => handlePersonalChange('emergencyRelationship', e.target.value)} />
        </div>

        <button 
          onClick={() => setStep(3)}
          disabled={!isReady}
          className={`w-full h-[52px] rounded-[16px] font-semibold text-[16px] flex items-center justify-center transition-all ${
            isReady ? 'bg-[#1E90FF] text-[#FFFFFF] active:scale-[0.98]' : 'bg-slate-200 text-slate-400 cursor-not-allowed'
          }`}
        >
          Next Step
        </button>
      </div>
    );
  };

  const renderStep3 = () => {
    const isReady = documents.aadharFront && documents.aadharBack && documents.panNumber && documents.legalAddress;
    return (
      <div className="animate-in fade-in slide-in-from-right-4 duration-300 pb-10">
        <div className="bg-[#FFFFFF] rounded-[24px] p-5 border border-slate-200 shadow-sm mb-6">
          <h3 className="text-[16px] font-bold text-slate-900 mb-4">Aadhar Card</h3>
          <PhotoUpload label="Aadhar Front" photo={documents.aadharFront} setPhoto={(v) => handleDocChange('aadharFront', v)} />
          <PhotoUpload label="Aadhar Back" photo={documents.aadharBack} setPhoto={(v) => handleDocChange('aadharBack', v)} />
        </div>

        <div className="bg-[#FFFFFF] rounded-[24px] p-5 border border-slate-200 shadow-sm mb-6">
          <h3 className="text-[16px] font-bold text-slate-900 mb-4">Other Documents</h3>
          <InputField label="PAN Card Number" placeholder="E.g. ABCDE1234F" value={documents.panNumber} onChange={(e: any) => handleDocChange('panNumber', e.target.value)} />
          
          <div className="space-y-1.5 mb-4">
            <label className="text-[13px] font-medium text-slate-600">Legal Address</label>
            <textarea 
              placeholder="Full resident address as per Aadhar..."
              value={documents.legalAddress}
              onChange={(e: any) => handleDocChange('legalAddress', e.target.value)}
              className="w-full h-24 p-4 bg-slate-50 border border-slate-200 rounded-xl text-[15px] text-slate-900 focus:outline-none focus:border-[#1E90FF] transition-colors focus:bg-[#FFFFFF] resize-none"
            />
          </div>
        </div>

        <button 
          onClick={() => setStep(4)}
          disabled={Boolean(!isReady)}
          className={`w-full h-[52px] rounded-[16px] font-semibold text-[16px] flex items-center justify-center transition-all ${
            isReady ? 'bg-[#1E90FF] text-[#FFFFFF] active:scale-[0.98]' : 'bg-slate-200 text-slate-400 cursor-not-allowed'
          }`}
        >
          Next Step
        </button>
      </div>
    );
  };

  const renderStep4 = () => {
    const isCycle = vehicle.type === 'Cycle';
    const isReady = vehicle.brand && vehicle.model && vehicle.type && (isCycle || vehicle.numberPlate) && vehicle.licensePhoto;
    return (
      <div className="animate-in fade-in slide-in-from-right-4 duration-300 pb-10">
        <div className="bg-[#FFFFFF] rounded-[24px] p-5 border border-slate-200 shadow-sm mb-6">
          <h3 className="text-[16px] font-bold text-slate-900 mb-4">Vehicle Details</h3>
          
          <div className="space-y-1.5 mb-4">
            <label className="text-[13px] font-medium text-slate-600">Vehicle Type</label>
            <div className="relative">
              <select 
                value={vehicle.type}
                onChange={(e) => handleVehicleChange('type', e.target.value)}
                className="w-full h-12 px-4 bg-slate-50 border border-slate-200 rounded-xl text-[15px] text-slate-900 focus:outline-none focus:border-[#1E90FF] appearance-none"
              >
                <option value="Bike">Bike</option>
                <option value="Scooty">Scooty</option>
                <option value="EV Bike">EV Bike</option>
                <option value="EV Scooty">EV Scooty</option>
                <option value="Cycle">Cycle</option>
              </select>
              <div className="absolute inset-y-0 right-4 flex items-center pointer-events-none">
                <ChevronDown size={16} className="text-slate-400" />
              </div>
            </div>
          </div>

          <InputField label="Brand Name" placeholder="e.g. Honda, Hero, Bajaj" value={vehicle.brand} onChange={(e: any) => handleVehicleChange('brand', e.target.value)} />
          <InputField label="Model" placeholder="e.g. Activa 6G, Splendor" value={vehicle.model} onChange={(e: any) => handleVehicleChange('model', e.target.value)} />
          
          {!isCycle && (
            <InputField label="Number Plate" placeholder="e.g. MH 12 AB 1234" value={vehicle.numberPlate} onChange={(e: any) => handleVehicleChange('numberPlate', e.target.value)} />
          )}
        </div>

        <div className="bg-[#FFFFFF] rounded-[24px] p-5 border border-slate-200 shadow-sm mb-6">
          <h3 className="text-[16px] font-bold text-slate-900 mb-4">Driving License</h3>
          <PhotoUpload label="Driving License Photo" photo={vehicle.licensePhoto} setPhoto={(v) => handleVehicleChange('licensePhoto', v)} />
        </div>

        <button 
          onClick={() => setStep(5)}
          disabled={Boolean(!isReady)}
          className={`w-full h-[52px] rounded-[16px] font-semibold text-[16px] flex items-center justify-center transition-all ${
            isReady ? 'bg-[#1E90FF] text-[#FFFFFF] active:scale-[0.98]' : 'bg-slate-200 text-slate-400 cursor-not-allowed'
          }`}
        >
          Next Step
        </button>
      </div>
    );
  };

  const renderStep5 = () => {
    const isReady = bank.bankName && bank.accountName && bank.accountNumber && bank.ifsc && bank.upiId;
    return (
      <div className="animate-in fade-in slide-in-from-right-4 duration-300 pb-10">
        <div className="bg-[#FFFFFF] rounded-[24px] p-5 border border-slate-200 shadow-sm mb-6">
          <h3 className="text-[16px] font-bold text-slate-900 mb-4">Driving Earnings Account</h3>
          <InputField label="Bank Name" placeholder="e.g. HDFC Bank, SBI" value={bank.bankName} onChange={(e: any) => handleBankChange('bankName', e.target.value)} />
          <InputField label="Account Holder Name" placeholder="Name as per bank records" value={bank.accountName} onChange={(e: any) => handleBankChange('accountName', e.target.value)} />
          <InputField label="Account Number" placeholder="Enter Account Number" type="password" value={bank.accountNumber} onChange={(e: any) => handleBankChange('accountNumber', e.target.value)} />
          <InputField label="Confirm Account Number" placeholder="Re-enter Account Number" type="text" value={bank.accountNumber} onChange={(e: any) => handleBankChange('accountNumber', e.target.value)} />
          <InputField label="IFSC Code" placeholder="e.g. HDFC0001234" value={bank.ifsc} onChange={(e: any) => handleBankChange('ifsc', e.target.value.toUpperCase())} />
          
          <div className="h-px bg-slate-100 my-6"></div>

          <h3 className="text-[16px] font-bold text-slate-900 mb-4">UPI Details (For Quick Payouts)</h3>
          <InputField label="UPI ID" placeholder="e.g. yourname@upi" value={bank.upiId} onChange={(e: any) => handleBankChange('upiId', e.target.value)} />
        </div>

        <button 
          onClick={() => {
            setIsSubmitting(true);
            setTimeout(() => {
              setIsSubmitting(false);
              setStep(6);
            }, 2000);
          }}
          disabled={Boolean(!isReady)}
          className={`w-full h-[52px] rounded-[16px] font-semibold text-[16px] flex items-center justify-center transition-all ${
            isReady ? 'bg-[#1E90FF] text-[#FFFFFF] active:scale-[0.98]' : 'bg-slate-200 text-slate-400 cursor-not-allowed'
          }`}
        >
          Submit Application
        </button>
      </div>
    );
  };

  const renderStep6 = () => {
    return (
      <div className="flex flex-col items-center justify-center py-8 animate-in zoom-in-95 duration-700 h-full mt-20">
        <div className="w-24 h-24 bg-emerald-100 rounded-full flex items-center justify-center text-emerald-600 mb-8 border-4 border-emerald-50">
          <CheckCircle2 size={48} strokeWidth={2.5} />
        </div>
        <h2 className="text-3xl font-black text-slate-900 tracking-tight mb-3 text-center">Application Received!</h2>
        <p className="text-[16px] text-slate-500 text-center max-w-[320px] leading-relaxed mb-10">
          We are evaluating your details. Welcome to the rider network! Our team will notify you once your ID is activated.
        </p>
        
        <button 
          onClick={onComplete}
          className="w-full h-[56px] max-w-[300px] bg-[#1E90FF] text-[#FFFFFF] rounded-full font-bold text-[16px] flex items-center justify-center active:scale-[0.98] transition-all shadow-lg shadow-blue-500/30"
        >
          Go to Dashboard
        </button>
      </div>
    );
  };

  if (isSubmitting) {
    return (
      <div className="fixed inset-0 z-[700] bg-[#FFFFFF] flex flex-col items-center justify-center">
        <div className="w-14 h-14 border-4 border-slate-100 border-t-[#1E90FF] rounded-full animate-spin mb-6"></div>
        <p className="text-[18px] font-bold text-slate-900">Submitting Profile...</p>
        <p className="text-[14px] text-slate-500 mt-2">Securely saving your details</p>
      </div>
    );
  }

  const stepTitles = [
    'Permissions',
    'Personal Details',
    'Legal Docs',
    'Vehicle Info',
    'Bank Details'
  ];

  return (
    <div className="fixed inset-0 z-[600] bg-slate-50 flex flex-col font-sans overflow-hidden">
      {/* Header */}
      {step < 6 && (
        <header className="flex flex-col pt-4 px-4 pb-2 bg-[#FFFFFF] shrink-0 border-b border-slate-100 shadow-sm z-10">
          <div className="flex items-center justify-between mb-4">
            <button 
              onClick={() => step === 1 ? onBack() : setStep(step - 1)} 
              className="w-10 h-10 flex items-center justify-center -ml-2 text-slate-700 active:bg-slate-100 rounded-full transition-colors"
            >
              <ArrowLeft size={22} />
            </button>
            <span className="text-[14px] font-bold text-slate-900 uppercase tracking-widest">
              Step {step} of 5
            </span>
            <div className="w-10" />
          </div>
          
          <div className="flex justify-between items-center pb-2 px-6">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="flex-1 max-w-[20%] px-1">
                <div className={`w-full h-1.5 rounded-full transition-all duration-300 ${i === step ? 'bg-[#1E90FF]' : i < step ? 'bg-blue-400/30' : 'bg-slate-100'}`} />
              </div>
            ))}
          </div>
        </header>
      )}

      {/* Content */}
      <div className="flex-1 overflow-y-auto pb-12 relative">
        {step < 6 && (
          <div className="px-5 pt-8 pb-6">
            <h1 className="text-3xl font-black text-slate-900 tracking-tight mb-2">
              {stepTitles[step - 1]}
            </h1>
            <p className="text-[15px] font-medium text-slate-500">
              {step === 1 && "Grant access to enable delivery apps functionality."}
              {step === 2 && "Tell us about yourself and emergency contacts."}
              {step === 3 && "Securely upload your legal records for KYC."}
              {step === 4 && "What vehicle will you use for deliveries?"}
              {step === 5 && "Where should we send your earnings?"}
            </p>
          </div>
        )}

        <div className="px-5">
          {step === 1 && renderStep1()}
          {step === 2 && renderStep2()}
          {step === 3 && renderStep3()}
          {step === 4 && renderStep4()}
          {step === 5 && renderStep5()}
          {step === 6 && renderStep6()}
        </div>
      </div>
    </div>
  );
};
