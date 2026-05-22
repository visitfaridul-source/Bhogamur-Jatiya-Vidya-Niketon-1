import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Home, ExternalLink, Calendar, Users, Monitor, PlayCircle, BookOpen } from 'lucide-react';
import { useWebsite } from '@/context/WebsiteContext';

export default function OnlineClassesPage() {
  const navigate = useNavigate();
  const { settings } = useWebsite();
  
  const liveClasses = settings.onlineClasses || [];

  return (
    <div className="min-h-screen bg-slate-50 border-t-4 border-indigo-600">
      <div className="bg-white border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
          <button 
            onClick={() => navigate('/')} 
            className="inline-flex items-center gap-2 text-slate-500 hover:text-indigo-600 transition-colors text-sm font-medium mb-6 bg-slate-100 px-4 py-2 rounded-full border border-slate-200"
          >
            <Home className="w-4 h-4" /> Back to Home
          </button>
          
          <h1 className="text-4xl md:text-5xl font-black text-slate-900 tracking-tight font-sans mb-4">Live Online Classes</h1>
          <p className="text-lg text-slate-600 max-w-2xl font-medium">Join scheduled interactive learning sessions from anywhere. Engage with your teachers and classmates in real-time.</p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
            <h2 className="text-2xl font-bold text-slate-800 flex items-center gap-2 mb-6">
              <span className="w-3 h-3 rounded-full bg-red-500 animate-pulse"></span>
              Live & Upcoming Sessions
            </h2>

            {liveClasses.map(cls => (
              <div key={cls.id} className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm hover:shadow-md transition-shadow flex flex-col md:flex-row gap-6 items-start md:items-center justify-between group">
                <div className="flex items-start gap-4 flex-1">
                  <div className="w-14 h-14 rounded-xl bg-indigo-50 border border-indigo-100 flex items-center justify-center shrink-0">
                    <Monitor className="w-7 h-7 text-indigo-600" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-slate-900 mb-1 group-hover:text-indigo-600 transition-colors">{cls.subject}</h3>
                    <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-slate-600 font-medium mt-2">
                       <span className="flex items-center gap-1.5"><BookOpen className="w-4 h-4 text-slate-400" /> {cls.class}</span>
                       <span className="flex items-center gap-1.5"><Users className="w-4 h-4 text-slate-400" /> {cls.teacher}</span>
                       <span className="flex items-center gap-1.5 text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-md"><Calendar className="w-3.5 h-3.5" /> {cls.time}</span>
                    </div>
                  </div>
                </div>
                <div className="shrink-0 w-full md:w-auto">
                    <button onClick={() => navigate(`/classroom/${cls.id}`)} className="w-full md:w-auto flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold px-6 py-3 rounded-xl transition-colors shadow-solid hover:-translate-y-1 transform">
                       Enter Classroom <ExternalLink className="w-4 h-4" />
                    </button>
                </div>
              </div>
            ))}
          </div>

            <div className="space-y-6">
              <div className="bg-slate-900 text-white rounded-2xl p-8 relative overflow-hidden shadow-xl shadow-indigo-900/10">
                <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/20 rounded-full blur-3xl"></div>
                <h3 className="text-2xl font-bold mb-4 z-10 relative">Missed a class?</h3>
                <p className="text-indigo-100 mb-8 z-10 relative">Access our library of recorded lectures and study materials available 24/7.</p>
                <button 
                  onClick={() => navigate('/courses')}
                  className="w-full bg-white text-slate-900 font-bold px-6 py-3.5 rounded-xl hover:bg-indigo-50 transition-colors flex items-center justify-center gap-2 relative z-10"
                >
                  <PlayCircle className="w-5 h-5 text-indigo-600" /> Browse Recorded Courses
                </button>
              </div>

               <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
                  <h3 className="font-bold text-slate-800 mb-4 pb-4 border-b border-slate-100">Guidelines for Online Classes</h3>
                  <ul className="space-y-3 text-sm font-medium text-slate-600">
                     <li className="flex gap-3">
                         <div className="w-6 h-6 rounded-full bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0 text-xs">1</div>
                         <p>Join the meeting 5 minutes prior to the scheduled start time.</p>
                     </li>
                     <li className="flex gap-3">
                         <div className="w-6 h-6 rounded-full bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0 text-xs">2</div>
                         <p>Keep your microphone on mute unless instructed otherwise.</p>
                     </li>
                     <li className="flex gap-3">
                         <div className="w-6 h-6 rounded-full bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0 text-xs">3</div>
                         <p>Ensure you have a stable internet connection and place yourself in a quiet room.</p>
                     </li>
                  </ul>
               </div>
            </div>
        </div>
      </div>
    </div>
  );
}
