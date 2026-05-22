import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Home, Wallet, Download, CheckCircle2, AlertCircle } from 'lucide-react';
import { useWebsite } from '@/context/WebsiteContext';

export default function FeeStructurePage() {
  const navigate = useNavigate();
  const { settings } = useWebsite();

  const feeStructures = settings.feeStructures || [];

  return (
    <div className="min-h-screen bg-[#FDFDFD]">
      {/* Editorial Header */}
      <div className="bg-slate-900 border-b border-slate-200">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-16 text-center">
          <button 
            onClick={() => navigate('/')} 
            className="inline-flex items-center gap-2 text-slate-400 hover:text-white transition-colors text-sm font-medium mb-8"
          >
            <Home className="w-4 h-4" /> Back to Home
          </button>
          
          <h1 className="text-4xl md:text-6xl font-serif text-white tracking-tight mb-6">Fee Structure & Policies</h1>
          <p className="text-lg text-slate-400 max-w-2xl mx-auto font-sans">Transparent and comprehensive overview of academic investments for the upcoming session.</p>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-16 space-y-16">
        
        {feeStructures.map((tier) => (
          <section key={tier.id}>
            <div className="mb-8 flex items-end justify-between">
               <div>
                 <h2 className="text-3xl font-bold font-serif text-slate-900 mb-2">{tier.tierName}</h2>
                 <p className="text-slate-500 font-medium">{tier.tierSubtitle}</p>
               </div>
               <div className="hidden sm:block">
                  <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-emerald-50 text-emerald-700 text-xs font-bold uppercase tracking-wide">
                     Session 2026-27
                  </span>
               </div>
            </div>
            
            <div className="overflow-x-auto rounded-xl border border-slate-200 shadow-sm">
              <table className="w-full text-left bg-white">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200">
                    <th className="py-4 px-6 text-sm font-bold text-slate-700">Class Group</th>
                    <th className="py-4 px-6 text-sm font-bold text-slate-700">One-time Admission</th>
                    <th className="py-4 px-6 text-sm font-bold text-slate-700">Monthly Tuition</th>
                    <th className="py-4 px-6 text-sm font-bold text-slate-700">Annual Charges</th>
                    <th className="py-4 px-6 text-sm font-bold text-slate-900 bg-slate-100">Estimated Annual Total</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {tier.items.map((fee) => (
                    <tr key={fee.id} className="hover:bg-slate-50/50 transition-colors">
                      <td className="py-5 px-6 font-semibold text-slate-900">{fee.class}</td>
                      <td className="py-5 px-6 text-slate-600 font-medium">{fee.admissionFee}</td>
                      <td className="py-5 px-6 text-slate-600 font-medium">{fee.tuitionFee}</td>
                      <td className="py-5 px-6 text-slate-600 font-medium">{fee.annualFee}</td>
                      <td className="py-5 px-6 font-bold text-indigo-700 bg-slate-50/50">{fee.totalAnnual}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        ))}

        {/* Payment Methods and Rules */}
        <div className="grid md:grid-cols-2 gap-8">
           <div className="bg-white border border-slate-200 p-8 rounded-2xl shadow-sm">
              <h3 className="text-xl font-bold text-slate-900 flex items-center gap-2 mb-6">
                 <Wallet className="w-5 h-5 text-indigo-600" /> Payment Methods
              </h3>
              <ul className="space-y-4">
                 <li className="flex items-start gap-3">
                   <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0 mt-0.5" />
                   <div>
                     <p className="font-bold text-slate-800 text-sm">Online Banking / UPI / Cards</p>
                     <p className="text-slate-500 text-xs font-medium mt-1">Available via the parent portal on our app or web portal.</p>
                   </div>
                 </li>
                 <li className="flex items-start gap-3">
                   <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0 mt-0.5" />
                   <div>
                     <p className="font-bold text-slate-800 text-sm">Bank Transfer (NEFT/RTGS)</p>
                     <p className="text-slate-500 text-xs font-medium mt-1">Acct Name: School Education Trust<br/>Acct No: 1234567890<br/>IFSC: ABCD0001234</p>
                   </div>
                 </li>
                 <li className="flex items-start gap-3">
                   <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0 mt-0.5" />
                   <div>
                     <p className="font-bold text-slate-800 text-sm">Demand Draft</p>
                     <p className="text-slate-500 text-xs font-medium mt-1">In favor of "School Name", payable at City Name.</p>
                   </div>
                 </li>
              </ul>
           </div>

           <div className="bg-amber-50 border border-amber-200 p-8 rounded-2xl">
              <h3 className="text-xl font-bold text-amber-900 flex items-center gap-2 mb-6">
                 <AlertCircle className="w-5 h-5 text-amber-600" /> Important Guidelines
              </h3>
              <ul className="space-y-3 text-sm font-medium text-amber-800 list-disc list-inside">
                 <li>Tuition fee must be paid by the 10th of every month.</li>
                 <li>A late fee of ₹50 per day will be charged after the due date.</li>
                 <li>Admission fee is non-refundable under any circumstances.</li>
                 <li>Annual charges are to be paid once at the beginning of the academic session.</li>
                 <li>Siblings are eligible for a 10% discount on the tuition fee of the younger child.</li>
              </ul>
              
              <button className="mt-8 bg-white border border-amber-300 text-amber-800 hover:bg-amber-100 font-bold px-4 py-2 rounded-lg text-sm transition-colors flex items-center gap-2 shadow-sm">
                 <Download className="w-4 h-4" /> Download PDF Fee Structure
              </button>
           </div>
        </div>

      </div>
    </div>
  );
}
