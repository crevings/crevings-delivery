const fs = require('fs');

const step1 = `
            {/* Offer Basic Info */}
            <div className="bg-[#FFFFFF] rounded-[20px] p-5 border border-slate-100 shadow-sm space-y-4">
              <h3 className="text-[16px] font-bold text-slate-900 mb-2">Basic Info</h3>
              <div className="space-y-1.5">
                <label className="text-[13px] font-medium text-slate-600">Offer Name</label>
                <input 
                  type="text" 
                  value={offerName}
                  onChange={(e) => setOfferName(e.target.value)}
                  placeholder="e.g. Weekend Delight"
                  className="w-full h-11 px-4 bg-slate-50 border border-slate-200 rounded-[12px] text-[15px] focus:bg-[#FFFFFF] focus:border-[#1E90FF] focus:outline-none transition-colors"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-[13px] font-medium text-slate-600">Offer Description (Optional)</label>
                <textarea 
                  value={offerDescription}
                  onChange={(e) => setOfferDescription(e.target.value)}
                  placeholder="Additional details for customers..."
                  className="w-full min-h-[80px] p-4 bg-slate-50 border border-slate-200 rounded-[12px] text-[15px] focus:bg-[#FFFFFF] focus:border-[#1E90FF] focus:outline-none transition-colors resize-y"
                />
              </div>
            </div>

            {/* Targeting & Application */}
            <div className="bg-[#FFFFFF] rounded-[20px] p-5 border border-slate-100 shadow-sm space-y-5">
              <h3 className="text-[16px] font-bold text-slate-900 mb-2">Targeting</h3>
              <div className="space-y-3">
                <label className="text-[13px] font-medium text-slate-600">Customer Segment</label>
                <div className="grid grid-cols-2 gap-2">
                  <button onClick={() => setCustomerTargeting('all')} className={\`h-10 rounded-[10px] text-[13px] font-semibold transition-all \${customerTargeting === 'all' ? 'bg-[#1E90FF] text-white' : 'bg-slate-50 text-slate-600'}\`}>All Customers</button>
                  <button onClick={() => setCustomerTargeting('new')} className={\`h-10 rounded-[10px] text-[13px] font-semibold transition-all \${customerTargeting === 'new' ? 'bg-[#1E90FF] text-white' : 'bg-slate-50 text-slate-600'}\`}>New only</button>
                  <button onClick={() => setCustomerTargeting('existing')} className={\`h-10 rounded-[10px] text-[13px] font-semibold transition-all \${customerTargeting === 'existing' ? 'bg-[#1E90FF] text-white' : 'bg-slate-50 text-slate-600'}\`}>Existing</button>
                  <button onClick={() => setCustomerTargeting('inactive')} className={\`h-10 rounded-[10px] text-[13px] font-semibold transition-all \${customerTargeting === 'inactive' ? 'bg-[#1E90FF] text-white' : 'bg-slate-50 text-slate-600'}\`}>Inactive</button>
                </div>
              </div>

              <div className="space-y-3">
                <label className="text-[13px] font-medium text-slate-600">Order Type</label>
                <div className="flex flex-wrap gap-2">
                  {['delivery', 'takeaway', 'dineIn'].map((type) => (
                    <button key={type} onClick={() => toggleOrderType(type as 'delivery'|'takeaway'|'dineIn')} className={\`px-4 h-9 rounded-full text-[13px] font-semibold transition-all border \${orderTypes[type as 'delivery'|'takeaway'|'dineIn'] ? 'bg-blue-50 border-blue-200 text-blue-700' : 'bg-white border-slate-200 text-slate-600'}\`}>
                      {type.charAt(0).toUpperCase() + type.slice(1)}
                    </button>
                  ))}
                </div>
              </div>
              
              <div className="space-y-3">
                <label className="text-[13px] font-medium text-slate-600">Payment Mode</label>
                <div className="grid grid-cols-2 gap-2">
                  <button onClick={() => setPaymentMode('all')} className={\`h-10 rounded-[10px] text-[13px] font-semibold transition-all \${paymentMode === 'all' ? 'bg-[#1E90FF] text-white' : 'bg-slate-50 text-slate-600'}\`}>All Modes</button>
                  <button onClick={() => setPaymentMode('prepaid')} className={\`h-10 rounded-[10px] text-[13px] font-semibold transition-all \${paymentMode === 'prepaid' ? 'bg-[#1E90FF] text-white' : 'bg-slate-50 text-slate-600'}\`}>Prepaid Online</button>
                </div>
              </div>
            </div>

            {/* Offer Validity & Scheduling */}
            <div className="bg-[#FFFFFF] rounded-[20px] p-5 border border-slate-100 shadow-sm space-y-4">
              <h3 className="text-[16px] font-bold text-slate-900 mb-2">Validity & Schedule</h3>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className="text-[13px] font-medium text-slate-600">Start Date</label>
                  <input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} className="w-full h-11 px-3 bg-slate-50 border border-slate-200 rounded-[12px] text-[14px] focus:bg-[#FFFFFF] focus:border-[#1E90FF] focus:outline-none transition-colors" />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[13px] font-medium text-slate-600">End Date</label>
                  <input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} className="w-full h-11 px-3 bg-slate-50 border border-slate-200 rounded-[12px] text-[14px] focus:bg-[#FFFFFF] focus:border-[#1E90FF] focus:outline-none transition-colors" />
                </div>
              </div>
              <div className="space-y-1.5 pt-2">
                <label className="text-[13px] font-medium text-slate-600">Valid Days</label>
                <div className="flex flex-wrap gap-2">
                  {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((day) => (
                    <button key={day} onClick={() => toggleScheduleDay(day)} className={\`w-10 h-10 rounded-full text-[13px] font-semibold transition-all \${scheduleDays.includes(day) ? 'bg-[#1E90FF] text-white' : 'bg-slate-50 text-slate-600'}\`}>
                      {day}
                    </button>
                  ))}
                </div>
              </div>
            </div>
`;

const step2 = `
            {/* Offer Type Selection */}
            <div className="bg-[#FFFFFF] rounded-[20px] p-5 border border-slate-100 shadow-sm space-y-4">
              <h3 className="text-[16px] font-bold text-slate-900 mb-2">Offer Mechanics</h3>
              <div className="grid grid-cols-2 gap-3">
                {[
                  { id: 'percentage', label: 'Percentage', icon: <Percent size={18} /> },
                  { id: 'flat', label: 'Flat Amount', icon: <Wallet size={18} /> },
                  { id: 'bogo', label: 'BOGO', icon: <Gift size={18} /> },
                  { id: 'free_item', label: 'Free Item', icon: <Package size={18} /> }
                ].map((type) => (
                  <button 
                    key={type.id}
                    onClick={() => setOfferType(type.id as any)}
                    className={\`h-[60px] flex items-center gap-3 px-4 rounded-[14px] border transition-all \${offerType === type.id ? 'bg-blue-50 border-blue-200 text-[#1E90FF]' : 'bg-[#FFFFFF] border-slate-200 text-slate-700'}\`}
                  >
                    <div className={\`w-8 h-8 rounded-full flex items-center justify-center \${offerType === type.id ? 'bg-white' : 'bg-slate-50'}\`}>
                      {type.icon}
                    </div>
                    <span className="text-[14px] font-bold">{type.label}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Discount Configuration */}
            <div className="bg-[#FFFFFF] rounded-[20px] p-5 border border-slate-100 shadow-sm space-y-4">
              <h3 className="text-[16px] font-bold text-slate-900 mb-2">Value Configuration</h3>
              
              {offerType === 'percentage' && (
                <div className="space-y-4 animate-in fade-in">
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1.5">
                      <label className="text-[13px] font-medium text-slate-600">Discount %</label>
                      <div className="relative">
                        <input type="number" value={discountPercent} onChange={(e) => setDiscountPercent(e.target.value)} placeholder="0" className="w-full h-11 pl-4 pr-10 bg-slate-50 border border-slate-200 rounded-[12px] text-[15px] focus:bg-[#FFFFFF] inline-block" />
                        <span className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 font-medium">%</span>
                      </div>
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-[13px] font-medium text-slate-600">Max Capping (₹)</label>
                      <input type="number" value={maxCap} onChange={(e) => setMaxCap(e.target.value)} placeholder="0" className="w-full h-11 px-4 bg-slate-50 border border-slate-200 rounded-[12px] text-[15px] focus:bg-[#FFFFFF]" />
                    </div>
                  </div>
                </div>
              )}

              {offerType === 'flat' && (
                <div className="space-y-4 animate-in fade-in">
                  <div className="space-y-1.5">
                    <label className="text-[13px] font-medium text-slate-600">Discount Amount (₹)</label>
                    <input type="number" value={discountAmount} onChange={(e) => setDiscountAmount(e.target.value)} placeholder="0" className="w-full h-11 px-4 bg-slate-50 border border-slate-200 rounded-[12px] text-[15px]" />
                  </div>
                </div>
              )}

              {(offerType === 'bogo' || offerType === 'free_item') && (
                <div className="space-y-4 animate-in fade-in">
                  <button onClick={() => setIsItemSelectSheetOpen(true)} className="w-full h-[52px] bg-slate-50 border border-slate-200 border-dashed rounded-[14px] flex items-center justify-center gap-2 text-[#1E90FF] font-bold text-[14px]">
                    <Search size={18} />
                    {selectedBogoItems.length > 0 ? \`\${selectedBogoItems.length} Items Selected\` : 'Choose Items'}
                  </button>
                </div>
              )}
            </div>

            {/* Usage Limits */}
            <div className="bg-[#FFFFFF] rounded-[20px] p-5 border border-slate-100 shadow-sm space-y-4">
               <h3 className="text-[16px] font-bold text-slate-900 mb-2">Conditions</h3>
               <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-[13px] font-medium text-slate-600">Min Order Value (₹)</label>
                    <input type="number" value={minOrder} onChange={(e) => setMinOrder(e.target.value)} placeholder="0" className="w-full h-11 px-4 bg-slate-50 border border-slate-200 rounded-[12px] text-[15px]" />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[13px] font-medium text-slate-600">Per User Usage Limit</label>
                    <input type="number" value={perCustomerLimit} onChange={(e) => setPerCustomerLimit(e.target.value)} placeholder="Uncapped" className="w-full h-11 px-4 bg-slate-50 border border-slate-200 rounded-[12px] text-[15px]" />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[13px] font-medium text-slate-600">Total Campaign Usage</label>
                    <input type="number" value={totalUsageLimit} onChange={(e) => setTotalUsageLimit(e.target.value)} placeholder="Uncapped" className="w-full h-11 px-4 bg-slate-50 border border-slate-200 rounded-[12px] text-[15px]" />
                  </div>
               </div>
            </div>
`;

const step3 = `
            {/* Coupon & Visibility */}
            <div className="bg-[#FFFFFF] rounded-[20px] p-5 border border-slate-100 shadow-sm space-y-4">
              <h3 className="text-[16px] font-bold text-slate-900 mb-2">Distribution</h3>
              
              <div className="space-y-3">
                <label className="text-[13px] font-medium text-slate-600">Application Mode</label>
                <div className="grid grid-cols-2 gap-2">
                  <button onClick={() => setCouponSetting('auto')} className={\`h-10 rounded-[10px] text-[13px] font-semibold transition-all \${couponSetting === 'auto' ? 'bg-[#1E90FF] text-white' : 'bg-slate-50 text-slate-600'}\`}>Auto-Apply</button>
                  <button onClick={() => setCouponSetting('manual')} className={\`h-10 rounded-[10px] text-[13px] font-semibold transition-all \${couponSetting === 'manual' ? 'bg-[#1E90FF] text-white' : 'bg-slate-50 text-slate-600'}\`}>Require Code</button>
                </div>
                {couponSetting === 'manual' && (
                  <div className="animate-in slide-in-from-top-1">
                    <input type="text" value={manualCode} onChange={(e) => setManualCode(e.target.value)} placeholder="e.g. GET50" className="w-full h-11 px-4 bg-slate-50 border border-slate-200 rounded-[12px] text-[15px] uppercase font-mono tracking-wider" />
                  </div>
                )}
              </div>

              <div className="space-y-3 pt-3 border-t border-slate-100">
                <label className="text-[13px] font-medium text-slate-600">Stacking & Visibility</label>
                <div className="grid grid-cols-2 gap-2">
                  <button onClick={() => setStacking(stacking === 'allow' ? 'disable' : 'allow')} className={\`h-10 rounded-[10px] text-[13px] font-semibold transition-all border \${stacking === 'allow' ? 'bg-orange-50 border-orange-200 text-orange-700' : 'bg-white border-slate-200 text-slate-600'}\`}>
                    {stacking === 'allow' ? 'Stacking Allowed' : 'Prevent Stacking'}
                  </button>
                  <button onClick={() => setVisibility(visibility === 'visible' ? 'private' : 'visible')} className={\`h-10 rounded-[10px] text-[13px] font-semibold transition-all border \${visibility === 'visible' ? 'bg-white border-slate-200 text-slate-600' : 'bg-purple-50 border-purple-200 text-purple-700'}\`}>
                    {visibility === 'visible' ? 'Visible to All' : 'Hidden Code'}
                  </button>
                </div>
              </div>
            </div>

            {/* Offer Preview */}
            <div className="bg-slate-900 rounded-[20px] p-5 shadow-lg relative overflow-hidden">
              <div className="absolute top-0 right-0 p-4 opacity-10">
                <Tag size={80} />
              </div>
              <h3 className="text-[13px] font-bold text-slate-400 mb-3 uppercase tracking-wider relative z-10">Live Preview</h3>
              <div className="bg-[#FFFFFF] rounded-[16px] p-4 relative z-10">
                <div className="flex items-start justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <div className="bg-emerald-100 text-emerald-700 p-1.5 rounded-lg"><Tag size={16} /></div>
                    <span className="font-bold text-slate-900">{offerName || 'Offer Name'}</span>
                  </div>
                  {couponSetting === 'manual' && manualCode && (
                    <span className="bg-slate-100 text-slate-600 px-2.5 py-1 rounded-md text-[12px] font-bold font-mono tracking-wider">{manualCode.toUpperCase()}</span>
                  )}
                </div>
                <p className="text-[14px] text-slate-600 leading-snug">{renderPreviewText()}</p>
                {offerDescription && <p className="text-[12px] text-slate-400 mt-2 line-clamp-2">{offerDescription}</p>}
              </div>
            </div>

            {/* Cost Impact */}
            <div className="bg-[#FFFFFF] rounded-[20px] p-5 border border-slate-100 shadow-sm space-y-4">
              <div className="flex items-center gap-2 mb-2">
                 <TrendingUp size={18} className="text-blue-500" />
                 <h3 className="text-[16px] font-bold text-slate-900">Projected Impact</h3>
              </div>
              <div className="grid grid-cols-2 gap-3">
                 <div className="bg-slate-50 p-3 rounded-[12px]">
                   <span className="text-[12px] font-medium text-slate-500 block mb-1">Expected Orders</span>
                   <span className="text-[16px] font-bold text-slate-900">+{expectedOrderIncrease.toFixed(1)}%</span>
                 </div>
                 <div className="bg-slate-50 p-3 rounded-[12px]">
                   <span className="text-[12px] font-medium text-slate-500 block mb-1">Revenue Boost</span>
                   <span className="text-[16px] font-bold text-slate-900">+{expectedRevenueBoost.toFixed(1)}%</span>
                 </div>
              </div>
              {(marginWarning || highDiscountWarning) && (
                <div className="bg-amber-50 rounded-[12px] p-3 flex gap-3 text-amber-800">
                  <AlertTriangle size={18} className="shrink-0 mt-0.5" />
                  <p className="text-[13px] font-medium leading-snug">
                    {marginWarning ? 'This high discount may negatively impact your profit margin. Ensure you have high volume to offset.' : 'High discount selected. Consider adding a max cap limit.'}
                  </p>
                </div>
              )}
            </div>

            {/* Abuse Protection Info */}
            <div className="flex gap-3 bg-blue-50 rounded-[16px] p-4 items-start">
               <Info size={18} className="text-blue-600 shrink-0 mt-0.5" />
               <p className="text-[13px] font-semibold text-blue-800 leading-snug">Device fingerprinting and bot protection is active for this campaign to prevent fraud.</p>
            </div>
`;

let content = fs.readFileSync('components/CreateOfferView.tsx', 'utf8');

content = content.replace('${cOfferBasicInfo.trim()}', '');
content = content.replace('${cTargeting.trim()}', '');
content = content.replace('${cOfferValidity.trim()}', step1);

content = content.replace('${cOfferTypeSelection.trim()}', '');
content = content.replace('${cDiscountConfiguration.trim()}', '');
content = content.replace('${cUsageLimits.trim()}', step2);

content = content.replace('${cCouponVisibility.trim()}', '');
content = content.replace('${cOfferPreview.trim()}', '');
content = content.replace('${cCostImpact.trim()}', '');
content = content.replace('${cAbuseInfo.trim()}', step3);

fs.writeFileSync('components/CreateOfferView.tsx', content);
