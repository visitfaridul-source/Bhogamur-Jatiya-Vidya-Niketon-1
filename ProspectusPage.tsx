import React from 'react';
import { useWebsite } from '../context/WebsiteContext';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Download } from 'lucide-react';
import { motion } from 'motion/react';

export default function ProspectusPage() {
  const { settings } = useWebsite();
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-slate-50 font-sans selection:bg-blue-500/30 flex flex-col">
      {/* Navigation */}
      <nav className="fixed top-2 inset-x-0 z-50 pointer-events-none px-4 sm:px-6">
        <div className="max-w-7xl mx-auto flex flex-col items-center gap-4 w-full">
          <div className="pointer-events-auto bg-slate-900/60 backdrop-blur-xl shadow-lg shadow-blue-900/10 border border-slate-700/50 rounded-full px-4 sm:px-8 py-2 flex flex-wrap items-center justify-between gap-x-3 gap-y-2 sm:gap-6 lg:gap-8 w-full max-w-full hide-scrollbar">
            <button onClick={() => navigate('/')} className="flex items-center gap-2 text-xs sm:text-sm font-semibold text-white drop-shadow-md hover:text-blue-200 transition-colors whitespace-nowrap px-2 py-1">
              <ArrowLeft className="w-4 h-4" /> Back to Home
            </button>
          </div>
        </div>
      </nav>

      {/* Content */}
      <main className="flex-1 flex flex-col items-center justify-center p-6 relative">
        {/* Background Gradients */}
        <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-blue-200/40 rounded-full blur-[120px] -translate-y-1/2 translate-x-1/3 pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-purple-200/40 rounded-full blur-[100px] translate-y-1/3 -translate-x-1/3 pointer-events-none" />

        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-[2rem] shadow-2xl p-8 sm:p-12 max-w-lg w-full text-center relative z-10 border border-slate-100"
        >
           <div className="w-20 h-20 bg-blue-50 rounded-full flex items-center justify-center mx-auto mb-6">
             <Download className="w-10 h-10 text-blue-600" />
           </div>
           
           <h1 className="text-3xl font-bold text-slate-900 mb-4 tracking-tight">School Prospectus</h1>
           <p className="text-slate-500 mb-8 leading-relaxed">
             Download our latest prospectus to learn more about our curriculum, facilities, admission process, and school policies.
           </p>

           {settings.prospectusUrl ? (
             <a 
               href={settings.prospectusUrl} 
               target="_blank" 
               rel="noopener noreferrer"
               className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-bold py-4 px-8 rounded-full transition-all duration-300 shadow-xl shadow-blue-600/20 hover:shadow-blue-600/40 hover:-translate-y-1 w-full justify-center text-lg"
             >
               <Download className="w-6 h-6" />
               Download PDF
             </a>
           ) : (
             <div className="bg-slate-50 rounded-2xl p-6 border border-slate-200/60">
               <p className="text-slate-500 font-medium">Prospectus is currently not available online. Please contact the administration for a copy.</p>
             </div>
           )}
        </motion.div>
      </main>

      <footer className="bg-slate-900 py-8 text-center text-slate-400 mt-auto z-10">
        <p>&copy; {new Date().getFullYear()} {settings.schoolName}. All rights reserved.</p>
      </footer>
    </div>
  );
}
