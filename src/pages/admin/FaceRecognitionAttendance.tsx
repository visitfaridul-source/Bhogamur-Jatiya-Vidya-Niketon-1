import React, { useEffect, useRef, useState } from 'react';
import * as faceapi from '@vladmandic/face-api';
import { useSchool } from '../../context/SchoolContext';
import { Camera, CheckCircle2, User, RefreshCcw, X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function FaceRecognitionAttendance() {
  const { students, teachers } = useSchool();
  const navigate = useNavigate();
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  
  const [isModelsLoaded, setIsModelsLoaded] = useState(false);
  const [faceMatcher, setFaceMatcher] = useState<faceapi.FaceMatcher | null>(null);
  const [isFaceMatcherLoading, setIsFaceMatcherLoading] = useState(false);
  const [loadingText, setLoadingText] = useState('Loading models...');
  const [isCameraActive, setIsCameraActive] = useState(false);
  
  const [recognizedPeople, setRecognizedPeople] = useState<Set<string>>(new Set());

  // Load models on mount
  useEffect(() => {
    const loadModels = async () => {
      try {
        const MODEL_URL = 'https://vladmandic.github.io/face-api/model/';
         await Promise.all([
           faceapi.nets.ssdMobilenetv1.loadFromUri(MODEL_URL),
           faceapi.nets.faceLandmark68Net.loadFromUri(MODEL_URL),
           faceapi.nets.faceRecognitionNet.loadFromUri(MODEL_URL),
         ]);
         setIsModelsLoaded(true);
         setLoadingText('Models loaded successfully.');
      } catch (err) {
         console.error("Error loading models", err);
         setLoadingText(`Failed to load models: ${err instanceof Error ? err.message : String(err)}`);
      }
    };
    loadModels();
  }, []);

  // Initialize face matcher when models are loaded or data changes
  useEffect(() => {
    if (!isModelsLoaded) return;

    const createFaceMatcher = async () => {
      setIsFaceMatcherLoading(true);
      setLoadingText('Processing profiles...');
      const labeledFaceDescriptors: faceapi.LabeledFaceDescriptors[] = [];

      // Combine students and teachers
      const allPeople = [
        ...students.map(s => ({ id: s.id, name: s.name, photoUrl: (s as any).photoUrl })),
        ...teachers.map(t => ({ id: t.id, name: t.name, photoUrl: (t as any).photoUrl || t.avatar }))
      ];

      for (const person of allPeople) {
        if (person.photoUrl && !person.photoUrl.includes('dicebear')) {
          try {
            // Load image
            const img = await faceapi.fetchImage(person.photoUrl);
            const detection = await faceapi.detectSingleFace(img).withFaceLandmarks().withFaceDescriptor();
            
            if (detection) {
              labeledFaceDescriptors.push(
                new faceapi.LabeledFaceDescriptors(person.name, [detection.descriptor])
              );
            }
          } catch (e) {
            console.error(`Error processing image for ${person.name}`, e);
          }
        }
      }

      if (labeledFaceDescriptors.length > 0) {
        setFaceMatcher(new faceapi.FaceMatcher(labeledFaceDescriptors, 0.6));
        setLoadingText('');
      } else {
        setFaceMatcher(null);
        setLoadingText('No valid faces found in profiles. Upload real photos first.');
      }
      setIsFaceMatcherLoading(false);
    };

    createFaceMatcher();
  }, [isModelsLoaded, students, teachers]);

  // Start video stream
  useEffect(() => {
    if (!isModelsLoaded || isFaceMatcherLoading || !isCameraActive) return;

    const startVideo = () => {
      navigator.mediaDevices.getUserMedia({ video: true })
        .then((stream) => {
          if (videoRef.current) {
            videoRef.current.srcObject = stream;
          }
        })
        .catch((err) => {
          console.error("Error accessing webcam", err);
        });
    };

    startVideo();

    return () => {
       // Clean up stream
       if (videoRef.current && videoRef.current.srcObject) {
         const stream = videoRef.current.srcObject as MediaStream;
         const tracks = stream.getTracks();
         tracks.forEach(track => track.stop());
       }
    };
  }, [isModelsLoaded, isFaceMatcherLoading, isCameraActive]);

  // Handle video play - face detection interval
  const handleVideoPlay = () => {
    if (!videoRef.current || !canvasRef.current || !faceMatcher) return;

    const displaySize = { width: videoRef.current.videoWidth, height: videoRef.current.videoHeight };
    faceapi.matchDimensions(canvasRef.current, displaySize);

    setInterval(async () => {
      if (videoRef.current && canvasRef.current && faceMatcher) {
         const detections = await faceapi.detectAllFaces(videoRef.current).withFaceLandmarks().withFaceDescriptors();
         const resizedDetections = faceapi.resizeResults(detections, displaySize);
         
         const ctx = canvasRef.current.getContext('2d');
         if (ctx) {
           ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
           
           const results = resizedDetections.map(d => faceMatcher.findBestMatch(d.descriptor));
           
           results.forEach((result, i) => {
             const box = resizedDetections[i].detection.box;
             const drawBox = new faceapi.draw.DrawBox(box, { label: result.toString() });
             drawBox.draw(canvasRef.current!);
             
             if (result.label !== 'unknown') {
               setRecognizedPeople(prev => {
                 const newSet = new Set(prev);
                 newSet.add(result.label);
                 return newSet;
               });
             }
           });
         }
      }
    }, 1000);
  };

  return (
    <div className="space-y-6 animate-fade-in">
       <div className="flex justify-between items-start">
         <div>
           <h1 className="text-2xl font-bold text-slate-800">Face Recognition Attendance</h1>
           <p className="text-slate-500 text-sm mt-1">Automatically log attendance via facial recognition.</p>
         </div>
         <button 
           onClick={() => navigate('/admin')}
           className="px-6 py-2.5 rounded-xl text-sm font-bold bg-white text-slate-700 hover:bg-slate-50 border border-slate-200 shadow-sm transition-all flex items-center gap-2"
         >
           <X className="w-4 h-4" /> Exit
         </button>
       </div>

       {(!isModelsLoaded || isFaceMatcherLoading) ? (
         <div className="bg-white border border-slate-200 shadow-sm rounded-3xl p-12 flex flex-col items-center justify-center text-center">
             <RefreshCcw className="w-10 h-10 text-blue-500 animate-spin mb-4" />
             <h3 className="text-lg font-bold text-slate-800">Setting up Face Recognition</h3>
             <p className="text-slate-500 mt-2">{loadingText}</p>
         </div>
       ) : (
         <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 bg-white rounded-[2rem] border border-slate-200 shadow-sm p-6 flex flex-col items-center relative min-h-[400px]">
               {loadingText && (
                  <div className="absolute top-4 bg-yellow-100 text-yellow-800 px-4 py-2 rounded-xl text-sm font-semibold z-10 shadow-sm border border-yellow-200">
                    {loadingText}
                  </div>
               )}
               <div className="relative w-full overflow-hidden bg-slate-900 rounded-2xl shadow-inner mx-auto flex justify-center items-center">
                 <video 
                   ref={videoRef} 
                   autoPlay 
                   muted 
                   onPlay={handleVideoPlay}
                   className="w-full h-auto object-cover max-h-[600px] rounded-2xl transform -scale-x-100"
                 />
                 <canvas ref={canvasRef} className="absolute top-0 left-0 w-full h-full transform -scale-x-100" />
                 
                 {!videoRef.current?.srcObject && (
                    <div className="absolute inset-0 flex flex-col items-center justify-center text-white bg-slate-800">
                       <Camera className="w-12 h-12 mb-4 text-slate-500" />
                       {!isCameraActive ? (
                         <button 
                           onClick={() => setIsCameraActive(true)}
                           className="px-6 py-2.5 rounded-xl text-sm font-bold bg-blue-600 text-white hover:bg-blue-700 shadow-sm transition-all"
                         >
                           Start Camera
                         </button>
                       ) : (
                         <p className="font-semibold">Waiting for camera access...</p>
                       )}
                    </div>
                 )}
               </div>
            </div>

            <div className="bg-white rounded-[2rem] border border-slate-200 shadow-sm p-6 h-[600px] flex flex-col">
               <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2 mb-6">
                 <CheckCircle2 className="w-5 h-5 text-emerald-500" /> Recognized People
               </h3>
               
               <div className="flex-1 overflow-y-auto space-y-3 custom-scrollbar">
                  {Array.from(recognizedPeople).length === 0 ? (
                    <div className="text-center text-slate-500 py-10 flex flex-col items-center">
                       <User className="w-10 h-10 text-slate-300 mb-3" />
                       <p className="text-sm">No one recognized yet</p>
                    </div>
                  ) : (
                    Array.from(recognizedPeople).map((name, idx) => (
                      <div key={idx} className="flex items-center gap-3 p-3 bg-emerald-50 border border-emerald-100 rounded-xl animate-fade-in">
                         <div className="w-10 h-10 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-600 shrink-0">
                           <User className="w-5 h-5" />
                         </div>
                         <div>
                            <p className="font-semibold text-slate-800 text-sm uppercase">{name}</p>
                            <p className="text-xs text-emerald-600 font-medium mt-0.5">Marked Present</p>
                         </div>
                      </div>
                    ))
                  )}
               </div>
            </div>
         </div>
       )}
    </div>
  );
}
