import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useWebsite } from '@/context/WebsiteContext';
import { useAuth } from '@/context/AuthContext';
import { 
  Video, MonitorUp, MessageSquare, Users, FileText, 
  Settings, Hand, X, Maximize2, PenTool, LayoutDashboard, ExternalLink, Play,
  ShieldAlert, Check, Ban
} from 'lucide-react';

export default function VirtualClassroom() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { settings } = useWebsite();
  const { user } = useAuth();
  
  const [activeTab, setActiveTab] = useState<'video' | 'whiteboard' | 'materials' | 'settings'>('video');
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [rightSidebarTab, setRightSidebarTab] = useState<'qa' | 'students'>('qa');

  // Find class from settings
  const cls = settings.onlineClasses?.find(c => c.id === id);

  useEffect(() => {
    if (!cls) {
      navigate('/online-class');
    }
  }, [cls, navigate]);

  if (!cls) return null;

  // We use Jitsi for embedded video because Google Meet blocks iframes with "X-Frame-Options",
  // which causes the "We're sorry, but you do not have access to this page" error.
  const embeddedMeetUrl = `https://meet.jit.si/EduClassroom_${cls.id}_${cls.subject.replace(/[^a-zA-Z0-9]/g, '')}#userInfo.displayName="${encodeURIComponent(user?.name || 'Guest Student')}"`;

  return (
    <div className={`flex flex-col bg-slate-900 text-slate-200 transition-all duration-300 ${isFullscreen ? 'fixed inset-0 z-50' : 'min-h-screen'}`}>
      {/* Header */}
      <header className="h-16 bg-slate-950 border-b border-slate-800 flex items-center justify-between px-4 sm:px-6 shrink-0">
        <div className="flex items-center gap-4">
          {!isFullscreen && (
            <button onClick={() => navigate('/online-class')} className="text-slate-400 hover:text-white transition-colors">
              <X className="w-6 h-6" />
            </button>
          )}
          <div>
            <h1 className="font-bold text-white leading-tight">{cls.subject}</h1>
            <div className="text-xs text-slate-400 font-medium flex items-center gap-2">
              <span className="flex items-center gap-1"><Users className="w-3 h-3" /> {cls.class}</span>
              <span>•</span>
              <span>Instructor: {cls.teacher}</span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="hidden sm:flex items-center gap-2 bg-red-500/10 text-red-500 px-3 py-1.5 rounded-full border border-red-500/20">
            <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse"></span>
            <span className="text-xs font-bold uppercase tracking-wider">Live</span>
          </div>
          <button 
            onClick={() => setIsFullscreen(!isFullscreen)} 
            className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors"
            title="Toggle Fullscreen"
          >
            <Maximize2 className="w-5 h-5" />
          </button>
        </div>
      </header>

      {/* Main Workspace */}
      <div className="flex-1 flex flex-col md:flex-row overflow-hidden">
        {/* Left Toolbar */}
        <div className="w-full md:w-20 bg-slate-950 border-r border-slate-800 shrink-0 flex md:flex-col items-center py-2 md:py-4 gap-2 overflow-x-auto md:overflow-x-visible">
          <ToolButton icon={<Video />} label="Live Video" active={activeTab === 'video'} onClick={() => setActiveTab('video')} />
          <ToolButton icon={<PenTool />} label="Whiteboard" active={activeTab === 'whiteboard'} onClick={() => setActiveTab('whiteboard')} />
          <ToolButton icon={<FileText />} label="Materials" active={activeTab === 'materials'} onClick={() => setActiveTab('materials')} />
          
          <div className="md:mt-auto flex md:flex-col gap-2">
            <ToolButton icon={<Hand />} label="Raise Hand" color="text-amber-400" />
            <ToolButton icon={<Settings />} label="Settings" active={activeTab === 'settings'} onClick={() => setActiveTab('settings')} />
          </div>
        </div>

        {/* Center Content Area */}
        <div className="flex-1 bg-slate-900 relative overflow-hidden flex flex-col">
          {activeTab === 'video' && (
            <div className="flex-1 flex flex-col relative w-full h-full bg-black">
               {/* Embed Jitsi Meet for a seamless in-app experience without Google's iframe block */}
               <iframe 
                  src={embeddedMeetUrl}
                  allow="camera; microphone; fullscreen; display-capture"
                  className="w-full h-full border-0"
                  title="Inbuilt Virtual Classroom"
               ></iframe>
               <div className="absolute top-4 right-4 z-10 flex gap-2">
                  <div className="bg-slate-900/90 text-xs font-bold text-slate-300 px-3 py-2 rounded-xl backdrop-blur-sm border border-slate-700 shadow-lg flex items-center">
                    Inbuilt Secure Video
                  </div>
                  <button 
                    onClick={() => {
                       const width = 1000;
                       const height = 700;
                       const left = (window.innerWidth - width) / 2;
                       const top = (window.innerHeight - height) / 2;
                       window.open(embeddedMeetUrl, 'VirtualClassroomSetup', `width=${width},height=${height},top=${top},left=${left}`);
                    }}
                    className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-xl backdrop-blur-sm border border-indigo-500 transition-colors text-sm font-bold shadow-lg"
                  >
                    <ExternalLink className="w-4 h-4" /> Popup
                  </button>
               </div>
            </div>
          )}

          {activeTab === 'settings' && (
            <div className="flex-1 p-6 md:p-10 overflow-y-auto">
              <h2 className="text-2xl font-bold text-white mb-6">Classroom Settings</h2>
              <div className="max-w-2xl space-y-6">
                <div className="bg-slate-800 border border-slate-700 p-6 rounded-2xl">
                  <h3 className="text-lg font-bold text-white mb-4 border-b border-slate-700 pb-2">Audio & Video</h3>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <span className="text-slate-300 font-medium">Microphone</span>
                      <select className="bg-slate-900 border border-slate-700 text-white rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-indigo-500">
                        <option>Default (Built-in Microphone)</option>
                      </select>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-slate-300 font-medium">Camera</span>
                      <select className="bg-slate-900 border border-slate-700 text-white rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-indigo-500">
                        <option>FaceTime HD Camera</option>
                      </select>
                    </div>
                  </div>
                </div>

                <div className="bg-slate-800 border border-slate-700 p-6 rounded-2xl">
                  <h3 className="text-lg font-bold text-white mb-4 border-b border-slate-700 pb-2">Classroom Preferences</h3>
                  <div className="space-y-4">
                    <label className="flex items-center gap-3 cursor-pointer">
                      <input type="checkbox" defaultChecked className="w-4 h-4 rounded border-slate-700 text-indigo-500 focus:ring-indigo-500 bg-slate-900" />
                      <span className="text-slate-300 font-medium">Mute microphone upon joining</span>
                    </label>
                    <label className="flex items-center gap-3 cursor-pointer">
                      <input type="checkbox" className="w-4 h-4 rounded border-slate-700 text-indigo-500 focus:ring-indigo-500 bg-slate-900" />
                      <span className="text-slate-300 font-medium">Turn off camera upon joining</span>
                    </label>
                    <label className="flex items-center gap-3 cursor-pointer">
                      <input type="checkbox" defaultChecked className="w-4 h-4 rounded border-slate-700 text-indigo-500 focus:ring-indigo-500 bg-slate-900" />
                      <span className="text-slate-300 font-medium">Show chat notifications</span>
                    </label>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'whiteboard' && (
            <div className="flex-1 bg-white p-4">
              <div className="w-full h-full rounded-2xl border-2 border-dashed border-slate-200 flex items-center justify-center flex-col text-slate-400">
                 <PenTool className="w-12 h-12 mb-4 text-slate-300" />
                 <h3 className="text-lg font-bold text-slate-500 mb-2">Interactive Whiteboard</h3>
                 <p className="text-sm font-medium">Teacher can draw equations and diagrams here.</p>
              </div>
            </div>
          )}

          {activeTab === 'materials' && (
             <div className="flex-1 p-6 md:p-10 overflow-y-auto">
               <h2 className="text-2xl font-bold text-white mb-6">Class Materials</h2>
               <div className="grid gap-4 md:grid-cols-2">
                  {[1, 2, 3].map(i => (
                    <div key={i} className="bg-slate-800 border border-slate-700 p-5 rounded-2xl flex items-start gap-4 group hover:bg-slate-750 transition-colors cursor-pointer">
                       <div className="w-12 h-12 rounded-lg bg-indigo-500/20 text-indigo-400 flex items-center justify-center shrink-0">
                          <FileText className="w-6 h-6" />
                       </div>
                       <div>
                          <h4 className="font-bold text-white mb-1 group-hover:text-indigo-400 transition-colors">Chapter {i} Study Guide.pdf</h4>
                          <p className="text-sm text-slate-400">Uploaded by {cls.teacher} • 2.4 MB</p>
                       </div>
                    </div>
                  ))}
               </div>
             </div>
          )}
        </div>

        {/* Right Sidebar (Chat & Roster) */}
        <div className="w-full md:w-80 bg-slate-950 border-l border-slate-800 shrink-0 flex flex-col h-[50vh] md:h-auto">
           <div className="flex border-b border-slate-800 shrink-0">
             <button 
                onClick={() => setRightSidebarTab('qa')}
                className={`flex-1 py-4 text-sm font-bold border-b-2 transition-colors ${rightSidebarTab === 'qa' ? 'text-white border-indigo-500' : 'text-slate-400 hover:text-slate-200 border-transparent'}`}
             >
               Live Q&A
             </button>
             <button 
                onClick={() => setRightSidebarTab('students')}
                className={`flex-1 py-4 text-sm font-bold border-b-2 transition-colors ${rightSidebarTab === 'students' ? 'text-white border-indigo-500' : 'text-slate-400 hover:text-slate-200 border-transparent'}`}
             >
               Students ({cls.students})
             </button>
           </div>
           
           {rightSidebarTab === 'qa' ? (
             <>
               <div className="flex-1 overflow-y-auto p-4 space-y-4">
                  <div className="bg-slate-900 rounded-xl p-3 border border-slate-800">
                     <div className="flex items-center gap-2 mb-2">
                        <div className="w-6 h-6 rounded-full bg-amber-500/20 text-amber-500 flex items-center justify-center text-xs font-bold">T</div>
                        <span className="text-sm font-bold text-slate-300">{cls.teacher}</span>
                        <span className="text-xs px-1.5 py-0.5 rounded bg-indigo-500/20 text-indigo-400 font-bold ml-auto">Teacher</span>
                     </div>
                     <p className="text-sm text-slate-400">Welcome to class! Please click 'Join Meet Session' to join the video call. Ask any questions here.</p>
                  </div>

                  {/* Sample student question */}
                  <div className="bg-slate-900 rounded-xl p-3 border border-slate-800">
                     <div className="flex items-center gap-2 mb-2">
                        <div className="w-6 h-6 rounded-full bg-blue-500/20 text-blue-500 flex items-center justify-center text-xs font-bold">R</div>
                        <span className="text-sm font-bold text-slate-300">Rahul V.</span>
                     </div>
                     <p className="text-sm text-slate-400">Sir, will we cover the previous assignment today?</p>
                  </div>
               </div>

               <div className="p-4 border-t border-slate-800 shrink-0 bg-slate-950">
                 <div className="relative">
                   <input 
                     type="text" 
                     placeholder="Type a question..." 
                     className="w-full bg-slate-900 border border-slate-700 text-white rounded-xl pl-4 pr-10 py-3 text-sm focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all font-medium"
                   />
                   <button className="absolute right-2 top-1/2 -translate-y-1/2 p-2 text-slate-400 hover:text-indigo-400 transition-colors">
                      <MessageSquare className="w-4 h-4" />
                   </button>
                 </div>
               </div>
             </>
           ) : (
             <div className="flex-1 overflow-y-auto p-4">
               {/* Pending Security Action List */}
               <div className="mb-6">
                 <div className="flex items-center gap-2 text-amber-500 mb-3 px-1">
                   <ShieldAlert className="w-4 h-4" />
                   <h3 className="text-xs font-bold uppercase tracking-wider">Join Requests (2)</h3>
                 </div>
                 
                 <div className="space-y-2">
                   <div className="bg-amber-500/10 border border-amber-500/20 rounded-xl p-3">
                     <div className="flex items-center gap-3">
                       <div className="w-8 h-8 rounded-full bg-slate-800 flex items-center justify-center text-sm font-bold text-slate-300 shrink-0">U</div>
                       <div className="min-w-0 flex-1">
                         <div className="text-sm font-bold text-slate-200 truncate">Unknown User</div>
                         <div className="text-xs text-slate-500 truncate">Not registered in system</div>
                       </div>
                     </div>
                     <div className="flex items-center gap-2 mt-3">
                       <button className="flex-1 bg-amber-500/20 hover:bg-amber-500/30 text-amber-500 text-xs font-bold py-1.5 rounded-lg transition-colors flex items-center justify-center gap-1">
                         <Check className="w-3 h-3" /> Admit
                       </button>
                       <button className="flex-1 bg-red-500/20 hover:bg-red-500/30 text-red-400 text-xs font-bold py-1.5 rounded-lg transition-colors flex items-center justify-center gap-1">
                         <Ban className="w-3 h-3" /> Block
                       </button>
                     </div>
                   </div>

                   <div className="bg-amber-500/10 border border-amber-500/20 rounded-xl p-3">
                     <div className="flex items-center gap-3">
                       <div className="w-8 h-8 rounded-full bg-slate-800 flex items-center justify-center text-sm font-bold text-slate-300 shrink-0">S</div>
                       <div className="min-w-0 flex-1">
                         <div className="text-sm font-bold text-slate-200 truncate">Sneha P (Guest)</div>
                         <div className="text-xs text-slate-500 truncate">Using personal email</div>
                       </div>
                     </div>
                     <div className="flex items-center gap-2 mt-3">
                       <button className="flex-1 bg-amber-500/20 hover:bg-amber-500/30 text-amber-500 text-xs font-bold py-1.5 rounded-lg transition-colors flex items-center justify-center gap-1">
                         <Check className="w-3 h-3" /> Admit
                       </button>
                       <button className="flex-1 bg-red-500/20 hover:bg-red-500/30 text-red-400 text-xs font-bold py-1.5 rounded-lg transition-colors flex items-center justify-center gap-1">
                         <Ban className="w-3 h-3" /> Block
                       </button>
                     </div>
                   </div>
                 </div>
               </div>

               {/* Regular Students */}
               <div>
                 <div className="flex items-center justify-between mb-3 px-1">
                   <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider">In Class</h3>
                   <span className="text-xs font-bold text-slate-400">12</span>
                 </div>
                 <div className="space-y-1">
                    {[1, 2, 3, 4, 5].map(i => (
                      <div key={i} className="flex items-center justify-between p-2 rounded-lg hover:bg-slate-800/50 transition-colors cursor-pointer group">
                         <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center text-sm font-bold text-slate-400">S</div>
                            <span className="text-sm font-medium text-slate-300 group-hover:text-white transition-colors">Student {i}</span>
                         </div>
                         <button className="p-1 text-slate-600 hover:text-red-400 text-xs opacity-0 group-hover:opacity-100 transition-all font-bold">Block</button>
                      </div>
                    ))}
                 </div>
               </div>
             </div>
           )}
        </div>
      </div>
    </div>
  );
}

function ToolButton({ icon, label, active, onClick, color = "text-slate-400" }: { icon: React.ReactNode, label: string, active?: boolean, onClick?: () => void, color?: string }) {
  return (
    <button 
      onClick={onClick}
      className={`group flex md:flex-col items-center gap-2 p-3 rounded-xl transition-all w-full md:w-auto ${active ? 'bg-indigo-600 font-bold text-white' : 'hover:bg-slate-800 text-slate-400'}`}
      title={label}
    >
      <div className={`${active ? 'text-white' : color} group-hover:text-white transition-colors`}>
        {React.cloneElement(icon as React.ReactElement, { className: 'w-5 h-5 md:w-6 md:h-6' })}
      </div>
      <span className={`text-[10px] md:text-xs tracking-wide ${active ? 'text-indigo-100' : 'text-slate-500 group-hover:text-slate-300'}`}>
        {label}
      </span>
    </button>
  );
}
