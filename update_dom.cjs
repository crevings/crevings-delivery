const fs = require('fs');

let content = fs.readFileSync('./components/EarningsView.tsx', 'utf8');

const regexToReplace = /\{\/\* Online Earnings \*\/\}[\s\S]+?\{\/\* Deductions Breakdown \*\/}/;

const replacement = `{/* Revenue Breakdown */}
          <div>
            <div className="space-y-4">
              {revenueBreakdown.map((item, idx) => (
                <div key={idx} className="flex items-center justify-between group">
                  <div className="flex items-center gap-3">
                    <div className={\`w-10 h-10 rounded-2xl flex items-center justify-center \${item.color}\`}>
                      <item.icon size={18} />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-slate-900">{item.label}</p>
                    </div>
                  </div>
                  <p className="text-sm font-semibold text-emerald-600">{item.amount}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
        
        <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between">
          <span className="text-sm font-medium text-slate-500">Total Earnings</span>
          <span className="text-lg font-bold text-emerald-600">{totalEarnings}</span>
        </div>
      </div>

      {/* Deductions Breakdown */}`;

content = content.replace(regexToReplace, replacement);

fs.writeFileSync('./components/EarningsView.tsx', content);
