import React, { useState } from 'react';
import { useWebsite } from '../context/WebsiteContext';
import { Mail, Phone, ExternalLink, X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { cn } from '../lib/utils';
import { motion, AnimatePresence } from 'motion/react';

export default function StaffPage() {
  const { settings } = useWebsite();
  const navigate = useNavigate();
  const [selectedImage, setSelectedImage] = useState<string | null>(null);

  return (
    <div className="min-h-screen bg-slate-50 font-sans selection:bg-blue-500/30">
      {/* Navigation - Duplicated from LandingPage for simplicity, normally should extract to a shared component */}
      <nav className="fixed top-2 inset-x-0 z-50 pointer-events-none px-4 sm:px-6">
        <div className="max-w-7xl mx-auto flex flex-col items-center gap-4 w-full">
          <div className="pointer-events-auto bg-slate-900/60 backdrop-blur-xl shadow-lg shadow-blue-900/10 border border-slate-700/50 rounded-full px-4 sm:px-8 py-2 flex flex-wrap items-center justify-center gap-x-3 gap-y-2 sm:gap-6 lg:gap-8 w-full max-w-full hide-scrollbar">
            <div className="flex items-center gap-2 sm:gap-6 lg:gap-8 overflow-x-auto mx-auto">
              <button onClick={() => navigate('/')} className="text-xs sm:text-sm font-semibold text-white drop-shadow-md hover:text-blue-200 transition-colors whitespace-nowrap px-2 py-1">
                Home
              </button>
              <button disabled className="text-xs sm:text-sm font-semibold text-white drop-shadow-md transition-colors whitespace-nowrap px-2 py-1">
                Our Staff
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Header */}
      <section className="pt-24 pb-8 px-4 bg-slate-900 text-white clip-path-slant relative overflow-hidden">
        <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-blue-500 to-transparent" />
        <div className="absolute -top-40 -right-40 w-96 h-96 bg-blue-600/20 rounded-full blur-3xl pointer-events-none" />
        <div className="max-w-7xl mx-auto relative z-10 text-center">
            <motion.h1 
               initial={{ opacity: 0, y: 20 }}
               animate={{ opacity: 1, y: 0 }}
               className="text-3xl md:text-5xl font-black tracking-tight mb-2"
            >
                {settings.staffPageTitle} <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-amber-200">{settings.staffPageTitleHighlight}</span>
            </motion.h1>
            <motion.p 
               initial={{ opacity: 0, y: 20 }}
               animate={{ opacity: 1, y: 0 }}
               transition={{ delay: 0.1 }}
               className="text-slate-400 text-base md:text-lg max-w-2xl mx-auto font-medium"
            >
                {settings.staffPageSubtitle}
            </motion.p>
        </div>
      </section>

      {/* Staff Grid */}
      <section className="py-10 px-4 md:px-8">
        <div className="max-w-[1400px] mx-auto">
            {settings.staffMembers && settings.staffMembers.length > 0 ? (
                <div className="grid sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-5 gap-6 md:gap-6">
                    {settings.staffMembers.map((staff, index) => (
                        <motion.div 
                           key={staff.id}
                           initial={{ opacity: 0, y: 20 }}
                           whileInView={{ opacity: 1, y: 0 }}
                           viewport={{ once: true }}
                           transition={{ delay: index * 0.1 }}
                           className="group relative bg-white rounded-[1.5rem] overflow-hidden shadow-xl shadow-slate-200/50 hover:shadow-2xl hover:-translate-y-2 transition-all duration-300 border border-slate-100 flex flex-col"
                        >
                            {/* Image Container with Neon animated border */}
                            <div 
                              className="relative aspect-square overflow-hidden bg-slate-900 p-[3px] cursor-pointer"
                              onClick={() => staff.imageUrl && setSelectedImage(staff.imageUrl)}
                            >
                                {/* Neon Gradient Spinners */}
                                <div className="absolute inset-[-100%] bg-[conic-gradient(from_0deg,transparent_0_340deg,#0ea5e9_360deg)] animate-[spin_3s_linear_infinite]" />
                                <div className="absolute inset-[-100%] bg-[conic-gradient(from_180deg,transparent_0_340deg,#e879f9_360deg)] animate-[spin_3s_linear_infinite]" />
                                
                                <div className="relative h-full w-full rounded-[calc(1.5rem-3px)] rounded-b-none overflow-hidden shadow-inner isolate bg-slate-50 flex items-center justify-center p-2">
                                    {staff.imageUrl ? (
                                        <>
                                          <img 
                                              src={staff.imageUrl} 
                                              alt={staff.name} 
                                              className="w-full h-full object-contain transition-transform duration-700 group-hover:scale-105"
                                          />
                                          {/* Overlay prompt to click */}
                                          <div className="absolute inset-x-2 inset-y-2 rounded-xl bg-slate-900/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                                            <span className="text-white text-xs font-bold uppercase tracking-widest border border-white/30 backdrop-blur-sm px-3 py-1 rounded-full">View</span>
                                          </div>
                                        </>
                                    ) : (
                                        <div className="text-slate-400 text-sm">No Image</div>
                                    )}
                                </div>
                            </div>
                            
                            {/* Content */}
                            <div className="p-5 flex-1 flex flex-col">
                                <div className="inline-block px-3 py-1 bg-blue-50 text-blue-700 text-[10px] font-bold uppercase tracking-wider rounded-full mb-3 self-start">
                                    {staff.role}
                                </div>
                                <h3 className="text-lg font-bold tracking-tight text-slate-900 mb-2 leading-tight">{staff.name}</h3>
                                <p className="text-slate-600 text-sm line-clamp-3 mb-5 leading-relaxed flex-1">
                                    {staff.bio || "A dedicated member of our institution, committed to excellence and student success."}
                                </p>
                                
                                <div className="flex gap-2 mt-auto">
                                   {staff.email && (
                                     <a href={`mailto:${staff.email}`} className="p-2 bg-slate-50 text-slate-500 rounded-lg hover:bg-blue-500 hover:text-white transition-colors border border-slate-100">
                                        <Mail className="w-4 h-4" />
                                     </a>
                                   )}
                                   {staff.phone && (
                                     <a href={`tel:${staff.phone}`} className="p-2 bg-slate-50 text-slate-500 rounded-lg hover:bg-blue-500 hover:text-white transition-colors border border-slate-100">
                                        <Phone className="w-4 h-4" />
                                     </a>
                                   )}
                                   {staff.linkedinUrl && (
                                     <a href={staff.linkedinUrl} target="_blank" rel="noopener noreferrer" className="p-2 bg-slate-50 text-slate-500 rounded-lg hover:bg-blue-500 hover:text-white transition-colors border border-slate-100">
                                        <ExternalLink className="w-4 h-4" />
                                     </a>
                                   )}
                                </div>
                            </div>
                        </motion.div>
                    ))}
                </div>
            ) : (
                <div className="py-32 text-center text-slate-500 bg-white rounded-[2rem] border border-slate-100">
                    <p className="text-2xl font-medium mb-2">No staff members listed yet.</p>
                    <p>Please check back later or update via the admin panel.</p>
                </div>
            )}
        </div>
      </section>
      
      {/* Full Image Modal */}
      <AnimatePresence>
        {selectedImage && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/90 backdrop-blur-sm"
            onClick={() => setSelectedImage(null)}
          >
            <button 
              className="absolute top-6 right-6 p-2 bg-white/10 hover:bg-white/20 text-white rounded-full transition-colors"
              onClick={() => setSelectedImage(null)}
            >
              <X className="w-6 h-6" />
            </button>
            <motion.img 
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              src={selectedImage} 
              alt="Full view" 
              className="max-w-full max-h-[90vh] rounded-2xl shadow-2xl object-contain border border-white/10"
              onClick={(e) => e.stopPropagation()}
            />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Footer minimal */}
      <footer className="bg-slate-900 py-8 text-center text-slate-400 mt-auto">
        <p>&copy; {new Date().getFullYear()} {settings.schoolName}. All rights reserved.</p>
      </footer>
    </div>
  );
}
