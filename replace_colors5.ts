import fs from 'fs';
let code = fs.readFileSync('components/RecipeView.tsx', 'utf8');
code = code.replace(/#111827/g, 'slate-900')
           .replace(/#374151/g, 'slate-700')
           .replace(/#6B7280/g, 'slate-500')
           .replace(/#9CA3AF/g, 'slate-400')
           .replace(/#D1D5DB/g, 'slate-300')
           .replace(/#E5E7EB/g, 'slate-200')
           .replace(/#F3F4F6/g, 'slate-100')
           .replace(/#F9FAFB/g, 'slate-50')
           .replace(/border-\[slate/g, 'border-slate')
           .replace(/text-\[slate/g, 'text-slate')
           .replace(/bg-\[slate/g, 'bg-slate')
           .replace(/text-slate-900\]/g, 'text-slate-900')
           .replace(/text-slate-700\]/g, 'text-slate-700')
           .replace(/text-slate-500\]/g, 'text-slate-500')
           .replace(/text-slate-400\]/g, 'text-slate-400')
           .replace(/text-slate-300\]/g, 'text-slate-300')
           .replace(/text-\[#EF4444\]/g, 'text-red-500')
           .replace(/bg-\[#FEF2F2\]/g, 'bg-red-50')
           .replace(/border-\[#FECACA\]/g, 'border-red-200')
           .replace(/border-slate-200\]/g, 'border-slate-200')
           .replace(/border-slate-300\]/g, 'border-slate-300')
           .replace(/bg-slate-50\]/g, 'bg-slate-50')
           .replace(/bg-slate-100\]/g, 'bg-slate-100');

fs.writeFileSync('components/RecipeView.tsx', code);
console.log('Colors replaced');
