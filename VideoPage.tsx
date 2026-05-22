import React from 'react';
import { useWebsite } from '../context/WebsiteContext';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, PlayCircle } from 'lucide-react';
import { motion } from 'motion/react';

export default function VideoPage() {
  const { settings } = useWebsite();
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-slate-900 font-sans selection:bg-purple-500/30 flex flex-col items-center">
      {/* Navigation */}
      <nav className="fixed top-2 inset-x-0 z-50 pointer-events-none px-4 sm:px-6">
        <div className="max-w-7xl mx-auto flex flex-col items-center gap-4 w-full">
          <div className="pointer-events-auto bg-slate-800/60 backdrop-blur-xl shadow-lg border border-slate-700/50 rounded-full px-4 sm:px-8 py-2 flex flex-wrap items-center justify-between gap-x-3 gap-y-2 w-full max-w-full">
            <button onClick={() => navigate('/')} className="flex items-center gap-2 text-xs sm:text-sm font-semibold text-white drop-shadow-md hover:text-blue-200 transition-colors whitespace-nowrap px-2 py-1">
              <ArrowLeft className="w-4 h-4" /> Back to Home
            </button>
          </div>
        </div>
      </nav>

      {/* Content */}
      <main className="flex-1 w-full max-w-[1400px] mx-auto flex flex-col p-4 sm:p-6 lg:p-8 relative pt-24 pb-12">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full flex-1"
        >
          <div className="text-center mb-12">
             <div className="inline-flex items-center justify-center p-3 bg-purple-500/20 rounded-full mb-4">
               <PlayCircle className="w-8 h-8 text-purple-400" />
             </div>
             <h1 className="text-3xl sm:text-4xl md:text-5xl font-black text-white tracking-tight mb-3">{settings.videoPageTitle}</h1>
             <p className="text-slate-400 text-lg max-w-2xl mx-auto">{settings.videoPageSubtitle}</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6 lg:gap-8">
            {settings.promoVideos && settings.promoVideos.length > 0 ? (
               settings.promoVideos.map((video) => (
                 <div key={video.id} className="flex flex-col gap-4 group">
                    <div className="aspect-video w-full rounded-2xl overflow-hidden shadow-xl shadow-purple-900/10 border border-slate-800 bg-black flex items-center justify-center relative transition-transform duration-300 group-hover:scale-[1.02] group-hover:shadow-purple-700/30">
                       {video.embedUrl ? (
                         <iframe 
                           src={video.embedUrl} 
                           title={video.title} 
                           className="w-full h-full border-0 absolute inset-0 z-10"
                           allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
                           allowFullScreen
                         ></iframe>
                       ) : (
                         <div className="text-slate-600 flex flex-col items-center p-4 text-center gap-2 relative z-0">
                            <PlayCircle className="w-10 h-10 opacity-30" />
                            <p className="text-sm">Video unavailable</p>
                         </div>
                       )}
                       {/* Background placeholder before iframe loads */}
                       <div className="absolute inset-0 bg-slate-900 flex items-center justify-center z-0">
                         <PlayCircle className="w-10 h-10 text-slate-700" />
                       </div>
                    </div>
                    <div>
                       <h2 className="text-xl font-bold text-white mb-2 line-clamp-1">{video.title || 'Untitled Video'}</h2>
                       <p className="text-slate-400 text-sm line-clamp-3 leading-relaxed">{video.description || 'No description available for this video.'}</p>
                    </div>
                 </div>
               ))
            ) : (
               <div className="col-span-full py-20 text-center border border-dashed border-slate-800 rounded-[2rem] bg-slate-900/50 backdrop-blur-sm">
                  <PlayCircle className="w-16 h-16 opacity-20 text-white mx-auto mb-4" />
                  <p className="text-xl text-slate-500">No promotional videos are available at the moment.</p>
               </div>
            )}
          </div>
        </motion.div>
      </main>
      
      <footer className="w-full py-6 text-center text-slate-500 mt-auto">
        <p>&copy; {new Date().getFullYear()} {settings.schoolName}. All rights reserved.</p>
      </footer>
    </div>
  );
}
