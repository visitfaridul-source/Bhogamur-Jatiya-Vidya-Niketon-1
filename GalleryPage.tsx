import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Sparkles, Filter } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useWebsite } from '../context/WebsiteContext';
import { cn } from '../lib/utils';

export default function GalleryPage() {
  const { settings } = useWebsite();
  const navigate = useNavigate();
  
  const galleryItems = settings.galleryPageItems || [];
  const categories = ['All', ...Array.from(new Set(galleryItems.map(item => item.category)))];
  
  const [activeTab, setActiveTab] = useState('All');
  const [selectedImage, setSelectedImage] = useState<{ id: string | number; src: string; title: string, category: string } | null>(null);

  const filteredItems = activeTab === 'All' ? galleryItems : galleryItems.filter(item => item.category === activeTab);

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
                Gallery
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
                {settings.galleryPageTitle ? settings.galleryPageTitle.split(' ').slice(0, -1).join(' ') : 'Our '} 
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-amber-200">
                  {settings.galleryPageTitle ? settings.galleryPageTitle.split(' ').slice(-1) : 'Gallery'}
                </span>
            </motion.h1>
            <motion.p 
               initial={{ opacity: 0, y: 20 }}
               animate={{ opacity: 1, y: 0 }}
               transition={{ delay: 0.1 }}
               className="text-slate-400 text-base md:text-lg max-w-2xl mx-auto font-medium"
            >
                {settings.galleryPageSubtitle}
            </motion.p>
        </div>
      </section>

      {/* Main Content */}
      <div className="relative z-10 max-w-[1400px] mx-auto px-4 md:px-8 py-10">
        
        {/* Filters */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="flex flex-wrap justify-center items-center gap-3 mb-12"
        >
          <div className="flex items-center gap-2 mr-4 text-slate-500 hidden sm:flex">
            <Filter className="w-5 h-5" />
            <span className="text-sm font-bold uppercase tracking-wider">Filter By</span>
          </div>
          {categories.map((category) => (
            <button
              key={category}
              onClick={() => setActiveTab(category)}
              className={cn(
                "px-5 py-2 rounded-full text-sm font-bold transition-all duration-300 border",
                activeTab === category 
                  ? "bg-blue-600 text-white border-blue-500 shadow-md shadow-blue-500/30" 
                  : "bg-white text-slate-500 border-slate-200 hover:bg-slate-100"
              )}
            >
              {category}
            </button>
          ))}
        </motion.div>

        {/* Gallery Grid */}
        <motion.div 
          layout
          className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
        >
          <AnimatePresence mode="popLayout">
            {filteredItems.map((item, index) => {
              return (
                <motion.div
                  layout
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ duration: 0.4 }}
                  key={item.id}
                  className="group relative bg-white rounded-[1.5rem] overflow-hidden shadow-xl shadow-slate-200/50 hover:shadow-2xl hover:-translate-y-2 transition-all duration-300 border border-slate-100 flex flex-col cursor-pointer"
                  onClick={() => setSelectedImage(item)}
                >
                  <div className="relative h-64 overflow-hidden bg-slate-900 p-[3px]">
                    {/* Neon Gradient Spinners */}
                    <div className="absolute inset-[-100%] bg-[conic-gradient(from_0deg,transparent_0_340deg,#0ea5e9_360deg)] animate-[spin_3s_linear_infinite]" />
                    <div className="absolute inset-[-100%] bg-[conic-gradient(from_180deg,transparent_0_340deg,#e879f9_360deg)] animate-[spin_3s_linear_infinite]" />
                    
                    <div className="relative h-full w-full rounded-[calc(1.5rem-3px)] rounded-b-none overflow-hidden isolate bg-slate-100 flex items-center justify-center">
                        <img 
                          src={item.src} 
                          alt={item.title} 
                          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                        />
                        <div className="absolute inset-0 bg-slate-900/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                          <span className="text-white text-xs font-bold uppercase tracking-widest border border-white/30 backdrop-blur-sm px-3 py-1 rounded-full">View Full</span>
                        </div>
                    </div>
                  </div>
                  
                  {/* Content below image */}
                  <div className="p-5 flex-1 flex flex-col">
                    <div className="inline-block px-3 py-1 bg-blue-50 text-blue-700 text-[10px] font-bold uppercase tracking-wider rounded-full mb-3 self-start">
                      {item.category}
                    </div>
                    <h3 className="text-lg font-bold tracking-tight text-slate-900 leading-tight">{item.title}</h3>
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </motion.div>
      </div>

      {/* Lightbox / Modal */}
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
              className="absolute top-6 right-6 p-2 bg-white/10 hover:bg-white/20 text-white rounded-full transition-colors z-[110]"
              onClick={() => setSelectedImage(null)}
            >
              <X className="w-6 h-6" />
            </button>
            <motion.div 
               initial={{ scale: 0.9, opacity: 0 }}
               animate={{ scale: 1, opacity: 1 }}
               exit={{ scale: 0.9, opacity: 0 }}
               className="relative max-w-5xl w-full flex flex-col rounded-2xl overflow-hidden shadow-2xl bg-slate-900"
               onClick={(e) => e.stopPropagation()}
             >
               <div className="relative bg-black h-fit max-h-[80vh] flex items-center justify-center">
                 <img 
                   src={selectedImage.src} 
                   alt={selectedImage.title} 
                   className="max-w-full max-h-[80vh] object-contain"
                 />
               </div>
               <div className="p-4 sm:p-6 bg-slate-900 border-t border-slate-800 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
                 <h3 className="text-xl sm:text-2xl font-bold text-white tracking-tight">{selectedImage.title}</h3>
                 <span className="px-3 py-1 bg-blue-500/20 text-blue-300 text-[10px] sm:text-xs font-bold uppercase tracking-widest rounded-full">
                   {selectedImage.category}
                 </span>
               </div>
             </motion.div>
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
