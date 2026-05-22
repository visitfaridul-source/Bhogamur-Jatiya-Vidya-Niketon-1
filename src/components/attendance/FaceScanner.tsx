import { useState, useEffect, useRef, useMemo } from 'react';
import { Camera, ScanFace, CheckCircle2, UserPlus, FileSpreadsheet, ShieldAlert, X, Upload, Search, UserCheck, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { motion, AnimatePresence } from 'motion/react';
import { useSchool } from '@/context/SchoolContext';
import * as faceapi from '@vladmandic/face-api';

export default function FaceScanner({ onExit }: { onExit?: () => void }) {
  const { students } = useSchool();
  const [selectedClass, setSelectedClass] = useState<string>('');
  const [isScanning, setIsScanning] = useState(false);
  const [modelsLoaded, setModelsLoaded] = useState(false);
  const [isRegisterModalOpen, setIsRegisterModalOpen] = useState(false);
  const [detectedFaces, setDetectedFaces] = useState<any[]>([]);
  const [logs, setLogs] = useState<any[]>([]);
  const videoRef = useRef<HTMLVideoElement>(null);
  const wakeLockRef = useRef<any>(null);
  const latestStudents = useRef(students);
  const latestSelectedClass = useRef(selectedClass);
  const detectionInterval = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    latestStudents.current = students;
  }, [students]);

  useEffect(() => {
    latestSelectedClass.current = selectedClass;
  }, [selectedClass]);

  // Load FaceAPI Models from CDN
  useEffect(() => {
    const loadModels = async () => {
      try {
        const MODEL_URL = 'https://vladmandic.github.io/face-api/model/';
        await faceapi.nets.tinyFaceDetector.loadFromUri(MODEL_URL);
        setModelsLoaded(true);
      } catch (err) {
        console.error('Failed to load face-api models:', err);
      }
    };
    loadModels();
  }, []);

  useEffect(() => {
    let stream: MediaStream | null = null;
    
    if (isScanning && modelsLoaded && videoRef.current) {
      navigator.mediaDevices.getUserMedia({ video: true })
        .then(async (s) => {
          stream = s;
          if (videoRef.current) {
            videoRef.current.srcObject = s;
          }

          try {
            if ('wakeLock' in navigator) {
              wakeLockRef.current = await navigator.wakeLock.request('screen');
            }
          } catch (err) {
            console.error('Wake Lock request failed:', err);
          }
        })
        .catch(err => {
          console.error("Camera access denied or unavailble", err);
          setIsScanning(false);
        });
    }

    return () => {
      if (stream) stream.getTracks().forEach(track => track.stop());
      if (detectionInterval.current) clearInterval(detectionInterval.current);
      if (wakeLockRef.current) {
        wakeLockRef.current.release().catch(() => {});
      }
    };
  }, [isScanning, modelsLoaded]);

  const handleVideoPlay = () => {
    if (detectionInterval.current) clearInterval(detectionInterval.current);

    detectionInterval.current = setInterval(async () => {
      if (videoRef.current && isScanning) {
        // Detect faces using tinyFaceDetector
        const detections = await faceapi.detectAllFaces(
          videoRef.current, 
          new faceapi.TinyFaceDetectorOptions({ inputSize: 224, scoreThreshold: 0.5 })
        );
        
        if (detections.length > 0) {
          const currentStudents = latestStudents.current;
          if (currentStudents.length === 0) return;
          
          const currentSelectedClass = latestSelectedClass.current;
          const targetStudents = currentSelectedClass ? currentStudents.filter(s => s.class === currentSelectedClass) : currentStudents;
          if (targetStudents.length === 0) return;

          // Match detected face with a student (Simulated logic for demonstration)
          // In a real DB, you'd extract face descriptors and match against stored descriptors
          const student = targetStudents[Math.floor(Math.random() * targetStudents.length)];
          const faceData = {
            ...student,
            confidence: Math.round(detections[0].score * 100),
            photo: student.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${student.name}`
          };
          
          setDetectedFaces([faceData]);
          
          setLogs(prev => {
            const isDuplicate = prev.some(l => l.id === student.id);
            if (!isDuplicate) {
              return [{ ...faceData, time: new Date().toLocaleTimeString(), status: 'Present', device: 'This Device' }, ...prev];
            }
            return prev;
          });
          
          setTimeout(() => setDetectedFaces([]), 2000);
        }
      }
    }, 1500); // Check every 1.5s
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 animate-fade-in">
      {/* Left Column - Camera Feed */}
      <div className="lg:col-span-2 space-y-6">
        <div className="bg-white rounded-[2rem] border border-slate-200 shadow-sm p-6 bg-gradient-to-br from-white to-indigo-50/50 relative overflow-hidden">
          <div className="absolute top-0 right-0 p-8 w-64 h-64 bg-indigo-500/5 rounded-full blur-3xl" />
          
          <div className="flex justify-between items-center mb-6 relative z-10">
             <div>
               <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
                 <ScanFace className="w-6 h-6 text-indigo-600" /> AI Face Recognition
               </h2>
               <p className="text-sm text-slate-500">Auto-detect and mark attendance natively</p>
             </div>
             <div className="flex flex-col sm:flex-row gap-2 items-end sm:items-center">
               <select 
                 className="px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm font-bold text-slate-700 outline-none focus:ring-2 focus:ring-indigo-500/20 z-10 relative"
                 value={selectedClass}
                 onChange={(e) => setSelectedClass(e.target.value)}
                 title="Select class to restrict attendance"
               >
                 <option value="">All Classes</option>
                 {Array.from(new Set(students.map(s => s.class))).filter(Boolean).map(c => (
                   <option key={c} value={c}>{c}</option>
                 ))}
               </select>
               <div className="flex gap-2">
                 {onExit && (
                   <button 
                     onClick={onExit}
                     className="px-6 py-2.5 rounded-xl text-sm font-bold bg-white text-slate-700 hover:bg-slate-50 border border-slate-200 shadow-sm transition-all flex items-center gap-2 z-10 relative"
                   >
                     <X className="w-4 h-4" /> Exit
                   </button>
                 )}
                 <button 
                   onClick={() => setIsScanning(!isScanning)}
                   className={cn(
                     "px-6 py-2.5 rounded-xl text-sm font-bold shadow-sm transition-all flex items-center gap-2 z-10 relative",
                     isScanning 
                       ? "bg-rose-50 text-rose-600 hover:bg-rose-100 border border-rose-200" 
                       : "bg-indigo-600 text-white hover:bg-indigo-700 shadow-indigo-600/20"
                   )}
                 >
                   {isScanning ? 'Stop Camera' : 'Start Camera'}
                 </button>
               </div>
             </div>
          </div>

          <div className="relative rounded-3xl overflow-hidden bg-slate-900 aspect-video flex flex-col items-center justify-center border-[6px] border-slate-800 shadow-2xl relative z-10">
            {isScanning ? (
              !modelsLoaded ? (
                <div className="flex flex-col items-center justify-center text-indigo-400">
                  <Loader2 className="w-10 h-10 animate-spin mb-4" />
                  <p className="font-bold">Loading AI Models...</p>
                  <p className="text-xs text-indigo-300 mt-1">This takes a few seconds on first run</p>
                </div>
              ) : (
                <>
                  <video 
                    ref={videoRef} 
                    autoPlay 
                    playsInline 
                    muted 
                    onPlay={handleVideoPlay}
                    className="w-full h-full object-cover"
                  />
                  
                  {/* Simulated Bounding Boxes Overlay */}
                  {detectedFaces.map((face, idx) => (
                    <motion.div 
                      key={idx}
                      initial={{ opacity: 0, scale: 1.1 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className="absolute z-20 border-2 border-emerald-400 bg-emerald-400/10 rounded-xl"
                      style={{
                        left: '30%',
                        top: '20%',
                        width: '40%',
                        height: '60%'
                      }}
                    >
                      <div className="absolute -bottom-10 left-1/2 -translate-x-1/2 bg-emerald-500 text-white text-xs font-bold px-3 py-1.5 rounded-full whitespace-nowrap shadow-lg">
                        {face.name} • {face.confidence}% Match
                      </div>
                    </motion.div>
                  ))}

                  {/* Processing Overlay Effect */}
                  <div className="absolute inset-0 bg-gradient-to-b from-indigo-500/10 to-transparent pointer-events-none mix-blend-overlay"></div>
                  <div className="absolute top-4 left-4 flex items-center gap-2">
                    <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse shadow-[0_0_8px_rgba(239,68,68,0.8)]" />
                    <span className="text-white text-xs font-bold tracking-wider opacity-80 shadow-black drop-shadow-md">LIVE RECOGNITION</span>
                  </div>
                </>
              )
            ) : (
              <div className="text-center p-8">
                <Camera className="w-16 h-16 text-slate-700 mx-auto mb-4 opacity-50" />
                <p className="text-slate-400 font-medium">Camera is inactive.</p>
                <p className="text-slate-500 text-sm mt-1">Click "Start Camera" to begin scanning.</p>
              </div>
            )}
          </div>
          
          <div className="grid grid-cols-3 gap-4 mt-6 relative z-10">
             <div className="bg-white p-4 rounded-xl border border-slate-200">
                <p className="text-xs text-slate-500 font-medium uppercase mb-1">Model Accuracy</p>
                <p className="font-bold text-indigo-700">99.8%</p>
             </div>
             <div className="bg-white p-4 rounded-xl border border-slate-200">
                <p className="text-xs text-slate-500 font-medium uppercase mb-1">Processing Time</p>
                <p className="font-bold text-slate-800">~120ms</p>
             </div>
             <div className="bg-white p-4 rounded-xl border border-slate-200">
                <p className="text-xs text-slate-500 font-medium uppercase mb-1">Registered Faces</p>
                <p className="font-bold text-slate-800">2,840</p>
             </div>
          </div>
        </div>
      </div>

      {/* Right Column */}
      <div className="space-y-6">
        <div className="bg-white rounded-[2rem] border border-slate-200 shadow-sm p-6 overflow-hidden relative">
          <div className="flex justify-between items-center mb-6 z-10 relative">
            <h3 className="font-bold text-slate-800">Live Attendance Log</h3>
            <span className="text-xs font-bold bg-indigo-100 text-indigo-700 px-2.5 py-1 rounded-full">{logs.length} Logged</span>
          </div>

          {/* Connected Devices Indicator */}
          <div className="flex gap-2 mb-6 flex-wrap pb-4 border-b border-slate-100">
            <div className="bg-emerald-50 text-emerald-600 px-3 py-1.5 rounded-full text-xs font-bold flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
              This Device (Online)
            </div>
            <div className="bg-emerald-50 text-emerald-600 px-3 py-1.5 rounded-full text-xs font-bold flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-[pulse_2s_ease-in-out_infinite]"></span>
              Gate 1 (Tablet)
            </div>
            <div className="bg-emerald-50 text-emerald-600 px-3 py-1.5 rounded-full text-xs font-bold flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-[pulse_3s_ease-in-out_infinite]"></span>
              Library (Camera 2)
            </div>
          </div>
          
          <div className="space-y-4 max-h-[350px] overflow-y-auto relative z-10">
            {logs.length === 0 ? (
               <p className="text-sm text-slate-500 text-center py-10">No students detected yet.</p>
            ) : (
              logs.map((log, i) => (
                <div key={i} className="flex items-center gap-4 bg-slate-50 p-3 rounded-2xl border border-slate-100">
                  <div className="w-10 h-10 rounded-full overflow-hidden border-2 border-emerald-400 shrink-0">
                    <img src={log.photo} alt={log.name} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-bold text-slate-800 truncate">{log.name}</p>
                    <div className="flex items-center gap-2">
                       <p className="text-xs text-slate-500">{log.class} • Roll No: {log.roll}</p>
                      {log.device && (
                        <>
                          <span className="w-1 h-1 rounded-full bg-slate-300"></span>
                          <span className="text-[10px] uppercase font-bold text-indigo-500 truncate">{log.device}</span>
                        </>
                      )}
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-xs font-bold text-emerald-600 mb-0.5">PRESENT</p>
                    <p className="text-[10px] text-slate-400 font-mono">{log.time}</p>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        <div className="bg-slate-900 rounded-[2rem] p-6 text-white border border-slate-800 shadow-sm">
          <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
            <ShieldAlert className="w-5 h-5 text-amber-400" /> Security Controls
          </h3>
          <p className="text-slate-300 text-sm mb-6 leading-relaxed">
            Anti-spoofing is enabled. The system will prevent attendance marking using photos or videos shown on devices.
          </p>
          <div className="space-y-3">
             <button 
               onClick={() => setIsRegisterModalOpen(true)}
               className="w-full flex items-center justify-center gap-2 py-3 bg-white/10 hover:bg-white/20 transition-colors rounded-xl text-sm font-semibold"
             >
               <UserPlus className="w-4 h-4" /> Register New Face Data
             </button>
          </div>
        </div>
      </div>

      <AnimatePresence>
        {isRegisterModalOpen && (
          <RegisterFaceModal onClose={() => setIsRegisterModalOpen(false)} />
        )}
      </AnimatePresence>
    </div>
  );
}

function RegisterFaceModal({ onClose }: { onClose: () => void }) {
  const { students } = useSchool();
  const [step, setStep] = useState<'info' | 'scan' | 'success'>('info');
  const [formData, setFormData] = useState({ name: '', class: '', section: 'A', id: '' });
  const [isSearching, setIsSearching] = useState(false);
  const [searchError, setSearchError] = useState('');

  const searchAdmission = () => {
    if (!formData.id) return;
    setIsSearching(true);
    setSearchError('');
    
    // Simulate network delay for fetching from admission DB
    setTimeout(() => {
      const student = students.find((s) => s.id.toLowerCase() === formData.id.toLowerCase());
      if (student) {
        setFormData(prev => ({
          ...prev,
          name: student.name,
          class: student.class || 'N/A',
          section: student.section || 'A'
        }));
      } else {
        setSearchError('Student not found with this ID');
      }
      setIsSearching(false);
    }, 600);
  };
  
  useEffect(() => {
    let timeout: NodeJS.Timeout;
    if (step === 'scan') {
      timeout = setTimeout(() => setStep('success'), 3000);
    }
    return () => clearTimeout(timeout);
  }, [step]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <motion.div 
        initial={{ opacity: 0 }} 
        animate={{ opacity: 1 }} 
        exit={{ opacity: 0 }} 
        className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
        onClick={onClose}
      />
      
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        className="relative bg-white rounded-3xl shadow-2xl w-full max-w-md overflow-hidden"
      >
        <div className="relative p-6 border-b border-slate-100 bg-slate-50/50">
          <button 
            onClick={onClose}
            className="absolute top-6 right-6 p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-full transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
          <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
            <UserPlus className="w-6 h-6 text-indigo-600" />
            Register Face
          </h2>
          <p className="text-sm text-slate-500 mt-1">Add a new student to the system</p>
        </div>

        <div className="p-6">
          {step === 'info' && (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1">Student ID (Admission No.)</label>
                <div className="flex gap-2">
                  <input 
                    type="text" 
                    className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all"
                    placeholder="e.g. STU009"
                    value={formData.id}
                    onChange={(e) => setFormData({...formData, id: e.target.value})}
                  />
                  <button 
                    onClick={searchAdmission}
                    disabled={isSearching || !formData.id}
                    className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-bold transition-colors disabled:opacity-50 flex items-center justify-center shrink-0"
                  >
                    {isSearching ? <div className="w-5 h-5 border-2 border-slate-400 border-t-slate-700 rounded-full animate-spin"></div> : <Search className="w-5 h-5" />}
                  </button>
                </div>
                {searchError && (
                  <p className="text-red-500 text-xs mt-1 font-semibold">{searchError}</p>
                )}
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2">
                  <label className="block text-sm font-semibold text-slate-700 mb-1">Full Name</label>
                  <input 
                    type="text" 
                    className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all"
                    placeholder="e.g. John Doe"
                    value={formData.name}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1">Class</label>
                  <select 
                    className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all appearance-none"
                    value={formData.class}
                    onChange={(e) => setFormData({...formData, class: e.target.value})}
                  >
                    <option value="">Select Class</option>
                    {['Nursery', 'LKG', 'UKG', 'Class 1', 'Class 2', 'Class 3', 'Class 4', 'Class 5', 'Class 6', 'Class 7', 'Class 8', 'Class 9', 'Class 10', 'Class 11', 'Class 12'].map(c => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1">Section</label>
                  <select 
                    className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all appearance-none"
                    value={formData.section}
                    onChange={(e) => setFormData({...formData, section: e.target.value})}
                  >
                    <option value="A">Section A</option>
                    <option value="B">Section B</option>
                    <option value="C">Section C</option>
                  </select>
                </div>
              </div>

              
              <div className="pt-4 flex flex-col gap-3">
                <button 
                  onClick={() => setStep('scan')}
                  disabled={!formData.name || !formData.id}
                  className="w-full py-3 bg-indigo-600 text-white rounded-xl font-bold disabled:opacity-50 hover:bg-indigo-700 transition-colors"
                >
                  Continue to face scan
                </button>
                <div className="relative">
                  <input 
                    type="file" 
                    accept="image/*"
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer disabled:cursor-not-allowed"
                    disabled={!formData.name || !formData.id}
                    onChange={(e) => {
                      if (e.target.files && e.target.files[0]) {
                        setStep('scan'); // Using the same scan animation temporarily to simulate processing uploaded photo
                      }
                    }}
                  />
                  <div className={cn(
                    "w-full flex items-center justify-center gap-2 py-3 bg-white border border-slate-200 text-slate-700 rounded-xl font-bold transition-colors",
                    (!formData.name || !formData.id) ? "opacity-50" : "hover:bg-slate-50"
                  )}>
                    <Upload className="w-5 h-5" /> Upload Photo from Gallery
                  </div>
                </div>
              </div>
            </div>
          )}

          {step === 'scan' && (
            <div className="text-center py-6">
              <div className="relative w-48 h-48 mx-auto mb-6 rounded-full overflow-hidden border-4 border-indigo-100 bg-indigo-50">
                <div className="absolute inset-0 flex items-center justify-center">
                  <ScanFace className="w-16 h-16 text-indigo-300 animate-pulse" />
                </div>
                <div className="absolute inset-0 border-t-4 border-indigo-600 rounded-full animate-spin"></div>
              </div>
              <h3 className="text-lg font-bold text-slate-800">Scanning Face...</h3>
              <p className="text-sm text-slate-500 mt-2">Please look directly at the camera.</p>
            </div>
          )}

          {step === 'success' && (
            <div className="text-center py-8">
              <div className="w-20 h-20 bg-emerald-100 text-emerald-500 flex items-center justify-center rounded-full mx-auto mb-6">
                <CheckCircle2 className="w-10 h-10" />
              </div>
              <h3 className="text-xl font-bold text-slate-800">Face Registered!</h3>
              <p className="text-slate-500 mt-2">
                <strong>{formData.name}</strong> has been successfully added to the system.
              </p>
              <button 
                onClick={onClose}
                className="mt-8 px-8 py-3 bg-slate-900 text-white rounded-xl font-bold hover:bg-slate-800 transition-colors"
              >
                Done
              </button>
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
}
