import React, { useState, useEffect } from 'react';
import { Sparkles, RefreshCw, ArrowRight } from 'lucide-react';

interface SmartInsightProps {
  isOnline: boolean;
  rushHour: boolean;
}

const DRIVER_TIPS = [
  "High demand expected near Civil Lines area. Stay active to receive more delivery requests.",
  "Rainy weather approaching. Ensure rain gear is ready and drive safely.",
  "Dinner rush peak from 7 PM to 10 PM. Complete 5 deliveries to unlock bonus incentive.",
  "Customer ratings are highest when deliveries are completed within the estimated window.",
  "Keep your phone charged and GPS location accuracy set to High for optimal route tracking."
];

export const SmartInsight: React.FC<SmartInsightProps> = ({ isOnline, rushHour }) => {
  const [insight, setInsight] = useState<string>("Analyzing real-time delivery zone data...");
  const [loading, setLoading] = useState<boolean>(false);

  const fetchInsight = () => {
    setLoading(true);
    setTimeout(() => {
      const randomTip = DRIVER_TIPS[Math.floor(Math.random() * DRIVER_TIPS.length)];
      setInsight(rushHour ? "Rush hour surge active! Deliveries in central zone earn 1.2x base fare." : randomTip);
      setLoading(false);
    }, 500);
  };

  useEffect(() => {
    fetchInsight();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [rushHour, isOnline]);

  return (
    <div className="relative">
      <div className="relative bg-slate-900 rounded-[22px] p-5 overflow-hidden border border-slate-800">
        <div className="relative z-10">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center space-x-2 bg-white/10 px-3 py-1 rounded-full backdrop-blur-md border border-white/5">
              <Sparkles size={12} className="text-indigo-300" />
              <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-100">AI Assistant</span>
            </div>
            <button 
              onClick={fetchInsight} 
              disabled={loading}
              className={`p-2 rounded-full hover:bg-white/10 text-slate-400 hover:text-white transition-all ${loading ? 'animate-spin' : ''}`}
            >
              <RefreshCw size={14} />
            </button>
          </div>
          
          <p className="text-sm font-medium text-slate-200 leading-relaxed mb-1">
            {loading ? "Crunching the numbers..." : insight}
          </p>

          <div className="mt-3 flex justify-end">
            <button className="text-xs font-semibold text-indigo-400 flex items-center hover:text-indigo-300 transition-colors">
              View Analysis <ArrowRight size={12} className="ml-1" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};