import React, { useState } from 'react';
import { useSchool } from '@/context/SchoolContext';
import { useWebsite } from '@/context/WebsiteContext';
import { Search, GraduationCap, ArrowRight, FileText, Printer, CheckCircle, X, ScrollText, UserMinus } from 'lucide-react';
import { cn } from '@/lib/utils';
import { motion } from 'motion/react';
import { format } from 'date-fns';

export default function Promotions() {
  const { students, setStudents } = useSchool();
  const { settings } = useWebsite();
  
  const [activeTab, setActiveTab] = useState<'promote' | 'tc'>('promote');

  // Promotion State
  const [promoteSourceClass, setPromoteSourceClass] = useState('');
  const [promoteDestClass, setPromoteDestClass] = useState('');
  const [promoteStudents, setPromoteStudents] = useState<string[]>([]); // Selected IDs for promotion
  const [isPromoteModalOpen, setIsPromoteModalOpen] = useState(false);
  const [promoteSearch, setPromoteSearch] = useState('');

  // TC State
  const [tcSearch, setTcSearch] = useState('');
  const [tcClassFilter, setTcClassFilter] = useState('');
  const [isTcModalOpen, setIsTcModalOpen] = useState(false);
  const [selectedTcStudent, setSelectedTcStudent] = useState<any>(null);
  
  const uniqueClasses = ['Nursery', 'LKG', 'UKG', 'Class 1', 'Class 2', 'Class 3', 'Class 4', 'Class 5', 'Class 6', 'Class 7', 'Class 8', 'Class 9', 'Class 10', 'Class 11', 'Class 12'];

  const filteredPromoteStudents = students.filter(s => 
    s.class === promoteSourceClass && 
    s.status !== 'Transferred' &&
    (s.name.toLowerCase().includes(promoteSearch.toLowerCase()) || s.id.toLowerCase().includes(promoteSearch.toLowerCase()))
  );

  const handleSourceClassChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setPromoteSourceClass(e.target.value);
    setPromoteDestClass('');
    // Auto-select all students in that class
    const ids = students.filter(s => s.class === e.target.value && s.status !== 'Transferred').map(s => s.id);
    setPromoteStudents(ids);
  };

  const toggleStudentPromotion = (id: string) => {
    setPromoteStudents(prev => 
      prev.includes(id) ? prev.filter(sid => sid !== id) : [...prev, id]
    );
  };

  const handlePromoteSubmit = () => {
    if (!promoteDestClass || promoteStudents.length === 0) return;
    
    setStudents(prev => prev.map(s => {
      if (promoteStudents.includes(s.id)) {
        return { ...s, class: promoteDestClass };
      }
      return s;
    }));
    
    setIsPromoteModalOpen(true);
    setTimeout(() => {
      setIsPromoteModalOpen(false);
      setPromoteSourceClass('');
      setPromoteDestClass('');
      setPromoteStudents([]);
    }, 3000);
  };
  
  const handleIssueTc = (student: any) => {
    setSelectedTcStudent(student);
    setIsTcModalOpen(true);
  };

  const handleConfirmTc = () => {
    setStudents(prev => prev.map(s => s.id === selectedTcStudent.id ? { ...s, status: 'Transferred' } : s));
  };

  const filteredStudentsForTc = students.filter(s => 
    (s.name.toLowerCase().includes(tcSearch.toLowerCase()) || 
     s.id.toLowerCase().includes(tcSearch.toLowerCase())) &&
    (tcClassFilter ? s.class === tcClassFilter : true) &&
    s.status !== 'Transferred'
  );

  return (
    <div className="space-y-6 animate-fade-in print:bg-white print:m-0 print:p-0">
      
      {/* Header - Hide when printing */}
      <div className="print:hidden flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 tracking-tight">Promotions & Transfers</h1>
          <p className="text-slate-500 text-sm mt-1">Manage academic year promotions and generate Transfer Certificates.</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="print:hidden flex gap-4 p-1 bg-white border border-slate-200 rounded-xl w-fit shadow-sm">
        <button
          onClick={() => setActiveTab('promote')}
          className={cn(
            "flex items-center gap-2 px-6 py-2.5 rounded-lg text-sm font-bold transition-all",
            activeTab === 'promote' ? "bg-indigo-50 text-indigo-700" : "text-slate-500 hover:text-slate-700"
          )}
        >
          <GraduationCap className="w-4 h-4" />
          Promote Students
        </button>
        <button
          onClick={() => setActiveTab('tc')}
          className={cn(
            "flex items-center gap-2 px-6 py-2.5 rounded-lg text-sm font-bold transition-all",
            activeTab === 'tc' ? "bg-amber-50 text-amber-700" : "text-slate-500 hover:text-slate-700"
          )}
        >
          <ScrollText className="w-4 h-4" />
          Transfer Certificate
        </button>
      </div>

      {/* Promotion Panel */}
      {activeTab === 'promote' && (
        <div className="print:hidden space-y-6">
          <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm">
             <div className="grid md:grid-cols-[1fr,auto,1fr] gap-6 items-end">
               <div>
                 <label className="block text-sm font-bold text-slate-700 mb-2">Current Class</label>
                 <select 
                   value={promoteSourceClass}
                   onChange={handleSourceClassChange}
                   className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                 >
                   <option value="">Select Class</option>
                   {uniqueClasses.map(c => <option key={c} value={c}>{c}</option>)}
                 </select>
               </div>
               <div className="hidden md:flex justify-center items-center pb-3 text-slate-400">
                 <ArrowRight className="w-6 h-6" />
               </div>
               <div>
                  <label className="block text-sm font-bold text-slate-700 mb-2">Promote To Class</label>
                  <select 
                    value={promoteDestClass}
                    onChange={(e) => setPromoteDestClass(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 appearance-none"
                  >
                    <option value="">Select Destination Class</option>
                    {uniqueClasses.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
               </div>
             </div>
          </div>

          {promoteSourceClass && (
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
               <div className="px-6 py-4 border-b border-slate-100 flex flex-col sm:flex-row justify-between items-start sm:items-center bg-slate-50 gap-4">
                 <h3 className="font-bold text-slate-800">Students in {promoteSourceClass}</h3>
                 <div className="flex flex-col sm:flex-row items-center gap-4 w-full sm:w-auto">
                   <div className="relative w-full sm:w-64">
                     <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                     <input 
                       type="text" 
                       placeholder="Search inside class..." 
                       value={promoteSearch}
                       onChange={(e) => setPromoteSearch(e.target.value)}
                       className="w-full pl-9 pr-4 py-2 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 bg-white"
                     />
                   </div>
                   <span className="text-sm font-medium text-slate-500 whitespace-nowrap">Selected: {promoteStudents.length}</span>
                 </div>
               </div>
               <div className="overflow-x-auto">
                 <table className="w-full text-left text-sm">
                   <thead>
                     <tr className="bg-white border-b border-slate-100 text-slate-500">
                       <th className="py-3 px-6 font-semibold w-16">
                         <input 
                           type="checkbox" 
                           checked={promoteStudents.length > 0 && promoteStudents.length === filteredPromoteStudents.length}
                           onChange={(e) => {
                             if(e.target.checked) {
                               setPromoteStudents(filteredPromoteStudents.map(s => s.id));
                             } else {
                               setPromoteStudents([]);
                             }
                           }}
                           className="rounded text-indigo-600 focus:ring-indigo-500/20 w-4 h-4 cursor-pointer"
                         />
                       </th>
                       <th className="py-3 px-6 font-semibold">Admission No</th>
                       <th className="py-3 px-6 font-semibold">Roll No</th>
                       <th className="py-3 px-6 font-semibold">Student Name</th>
                       <th className="py-3 px-6 font-semibold">Parent Name</th>
                     </tr>
                   </thead>
                   <tbody className="divide-y divide-slate-50">
                      {filteredPromoteStudents.map(s => (
                        <tr key={s.id} className="hover:bg-slate-50 transition-colors">
                          <td className="py-3 px-6 w-16">
                             <input 
                               type="checkbox" 
                               checked={promoteStudents.includes(s.id)}
                               onChange={() => toggleStudentPromotion(s.id)}
                               className="rounded text-indigo-600 focus:ring-indigo-500/20 w-4 h-4 cursor-pointer"
                             />
                          </td>
                          <td className="py-3 px-6 font-medium text-slate-600">{s.id}</td>
                          <td className="py-3 px-6 font-medium text-slate-600">{s.roll || '-'}</td>
                          <td className="py-3 px-6 font-bold text-slate-800">{s.name}</td>
                          <td className="py-3 px-6 text-slate-500">{s.parentName}</td>
                        </tr>
                      ))}
                   </tbody>
                 </table>
               </div>
               
               <div className="p-6 bg-slate-50 border-t border-slate-100 flex justify-end">
                 <button 
                   onClick={handlePromoteSubmit}
                   disabled={!promoteDestClass || promoteStudents.length === 0}
                   className="px-6 py-2.5 bg-indigo-600 text-white font-bold rounded-xl shadow-lg shadow-indigo-600/30 hover:bg-indigo-700 transition-all disabled:opacity-50 disabled:shadow-none disabled:cursor-not-allowed flex items-center gap-2"
                 >
                   Confirm Promotion <ArrowRight className="w-4 h-4" />
                 </button>
               </div>
            </div>
          )}
        </div>
      )}

      {/* TC Panel */}
      {activeTab === 'tc' && (
        <div className="print:hidden space-y-6">
           <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm flex flex-col md:flex-row gap-4 justify-between items-center">
             <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
               <div className="w-full sm:w-80 relative">
                  <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input 
                    type="text" 
                    placeholder="Search student by name or adm no..." 
                    value={tcSearch}
                    onChange={(e) => setTcSearch(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 transition-all"
                  />
               </div>
               <select
                 value={tcClassFilter}
                 onChange={(e) => setTcClassFilter(e.target.value)}
                 className="bg-slate-50 border border-slate-200 text-slate-700 text-sm rounded-xl px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 min-w-[140px]"
               >
                 <option value="">Select Class</option>
                 {uniqueClasses.map(c => <option key={c} value={c}>{c}</option>)}
               </select>
             </div>
             <div className="text-sm text-slate-500 px-2 sm:px-0">
               * Only active students can be issued a TC.
             </div>
           </div>

           <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
             {filteredStudentsForTc.map(student => (
               <div key={student.id} className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md hover:border-amber-200 transition-all flex flex-col group">
                 <div className="flex items-start justify-between mb-4">
                   <div className="w-12 h-12 rounded-xl bg-slate-100 overflow-hidden flex items-center justify-center border border-slate-200 shrink-0">
                     {student.avatar ? (
                       <img src={student.avatar} alt={student.name} className="w-full h-full object-cover" />
                     ) : (
                       <span className="text-lg font-bold text-slate-500">{student.name.charAt(0)}</span>
                     )}
                   </div>
                   <span className="text-xs font-bold px-2.5 py-1 bg-amber-50 text-amber-700 rounded-lg">
                     {student.class}
                   </span>
                 </div>
                 
                 <div className="mb-6 flex-1">
                   <h3 className="font-bold text-slate-800 text-lg leading-tight mb-1 group-hover:text-amber-600 transition-colors">{student.name}</h3>
                   <div className="text-sm text-slate-500 font-medium">Adm No: {student.id}</div>
                 </div>

                 <button 
                   onClick={() => handleIssueTc(student)}
                   className="w-full py-2.5 flex items-center justify-center gap-2 bg-slate-50 border border-slate-200 text-slate-700 font-bold rounded-xl hover:bg-amber-500 hover:text-white hover:border-amber-500 transition-colors shadow-sm"
                 >
                   <ScrollText className="w-4 h-4" />
                   Generate TC
                 </button>
               </div>
             ))}
           </div>
           
           {filteredStudentsForTc.length === 0 && (
             <div className="py-20 text-center bg-white rounded-2xl border border-slate-200 border-dashed">
                <UserMinus className="w-10 h-10 text-slate-300 mx-auto mb-3" />
                <h3 className="text-lg font-bold text-slate-700">No active students found</h3>
                <p className="text-slate-500 text-sm mt-1">Try to refine your search</p>
             </div>
           )}
        </div>
      )}

      {/* Modals */}

      {/* Promotion Success Modal */}
      {isPromoteModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-in fade-in duration-200 print:hidden">
           <div className="bg-white p-8 rounded-3xl w-full max-w-sm flex flex-col items-center text-center shadow-xl">
             <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mb-4 animate-bounce">
               <CheckCircle className="w-8 h-8" />
             </div>
             <h2 className="text-xl font-bold text-slate-800 mb-2">Promoted Successfully!</h2>
             <p className="text-slate-500 font-medium">{promoteStudents.length} student(s) have been promoted to {promoteDestClass}.</p>
           </div>
        </div>
      )}

      {/* TC Modal / Preview */}
      {isTcModalOpen && selectedTcStudent && (
        <div className="fixed inset-0 z-[100] flex flex-col md:flex-row bg-slate-50 overflow-hidden print:bg-white">
          
          {/* Controls Sidebar - Hidden in Print */}
          <div className="w-full md:w-80 bg-white border-r border-slate-200 flex flex-col shadow-xl z-10 print:hidden">
             <div className="p-6 border-b border-slate-100 flex items-center justify-between">
               <h3 className="font-bold text-xl text-slate-800 flex items-center gap-2">
                 <ScrollText className="w-5 h-5 text-amber-500" /> TC Generator
               </h3>
               <button onClick={() => setIsTcModalOpen(false)} className="p-2 text-slate-400 hover:text-rose-500 bg-slate-50 rounded-full hover:bg-rose-50 transition-colors">
                 <X className="w-5 h-5" />
               </button>
             </div>
             
             <div className="p-6 flex-1 overflow-y-auto space-y-6">
                <div>
                  <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3">Student Details</h4>
                  <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 space-y-2 text-sm">
                    <p><span className="text-slate-500">Name:</span> <span className="font-bold text-slate-800 ml-1">{selectedTcStudent.name}</span></p>
                    <p><span className="text-slate-500">Admission No:</span> <span className="font-bold text-slate-800 ml-1">{selectedTcStudent.id}</span></p>
                    <p><span className="text-slate-500">Class:</span> <span className="font-bold text-slate-800 ml-1">{selectedTcStudent.class}</span></p>
                  </div>
                </div>

                <div className="bg-amber-50 p-4 rounded-xl border border-amber-100">
                  <h4 className="font-bold text-amber-700 text-sm mb-1">Confirm Transfer</h4>
                  <p className="text-xs text-amber-600 mb-3">Make sure the student's dues are clear. Once generated, you can mark the student as transferred.</p>
                  <button 
                    onClick={handleConfirmTc}
                    className="w-full py-2 bg-amber-500 text-white font-bold rounded-lg text-sm shadow-md shadow-amber-500/20 hover:bg-amber-600 transition-colors"
                  >
                    Mark as Transferred
                  </button>
                </div>
             </div>

             <div className="p-6 border-t border-slate-100 bg-white">
                <button 
                  onClick={() => window.print()}
                  className="w-full flex items-center justify-center gap-2 bg-slate-900 text-white py-3 rounded-xl font-bold shadow-lg hover:bg-slate-800 transition-colors mb-3"
                >
                  <Printer className="w-5 h-5" />
                  Print A4 Certificate
                </button>
                <div className="text-center text-xs text-slate-500 font-medium">
                  Tip: You can update the school logo and details from <span className="font-bold">Website Settings</span>.
                </div>
             </div>
          </div>

          {/* Document Preview Area */}
          <div className="flex-1 overflow-y-auto bg-slate-200/50 p-4 sm:p-8 flex items-start justify-center print:bg-white print:p-0 print:overflow-visible relative">
            <style>{`
              @media print {
                @page { size: A4 portrait; margin: 0; }
                body { -webkit-print-color-adjust: exact; print-color-adjust: exact; background: white; margin: 0; padding: 0; overflow: visible !important; }
                body * { visibility: hidden; }
                #tc-print-zone, #tc-print-zone * { visibility: visible; }
                #tc-print-zone { position: absolute !important; left: 0 !important; top: 0 !important; width: 100% !important; margin: 0 !important; }
              }
              .tc-font { font-family: 'Times New Roman', Times, serif; }
            `}</style>
            
            <div id="tc-print-zone" className="w-[210mm] h-[297mm] bg-white text-slate-900 relative shadow-2xl print:shadow-none mx-auto shrink-0 print:m-0 flex flex-col font-serif box-border p-[15mm]">
               {/* Borders */}
               <div className="absolute inset-[10mm] border-[2px] border-slate-900 pointer-events-none z-0"></div>
               <div className="absolute inset-[11mm] border-[1px] border-slate-900 pointer-events-none z-0"></div>

               {/* Watermark Logo */}
               {settings.logoUrl && (
                 <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-[0.03] z-0">
                    <img src={settings.logoUrl} alt="Watermark" className="w-[60%] object-contain grayscale" />
                 </div>
               )}

               <div className="relative z-10 flex flex-col h-full">
                 {/* Header */}
                 <div className="flex items-center justify-between mb-4 pb-4 border-b-[2px] border-slate-900">
                     <div className="w-[100px] flex justify-center">
                         {settings.logoUrl && <img src={settings.logoUrl} alt="Logo" className="w-24 h-24 object-contain" />}
                     </div>
                     <div className="flex-1 text-center px-4">
                         <h1 className="text-3xl sm:text-[36px] font-black uppercase text-slate-900 mb-2 leading-none" style={{ fontFamily: '"Alkatra", cursive', letterSpacing: '1px' }}>
                             {settings.schoolName || "SMART PUBLIC SCHOOL"}
                         </h1>
                         <p className="text-[14px] font-bold uppercase tracking-widest text-slate-700 leading-tight">
                             {settings.address || "123 Education Lane, Knowledge City"}
                         </p>
                         <p className="text-[12px] font-semibold mt-1">
                             (Recognized by / Affiliated to CBSE / State Board)
                         </p>
                         <p className="text-[12px] font-bold mt-1 tracking-wide">
                             Affiliation No: 1234567 &nbsp;|&nbsp; School Code: 98765
                         </p>
                     </div>
                     <div className="w-[100px]"></div> {/* Space balance */}
                 </div>

                 {/* Title */}
                 <div className="text-center mb-6">
                     <h2 className="inline-block border-[2px] border-slate-900 px-6 py-2 text-xl font-black uppercase tracking-widest bg-slate-100 shadow-[4px_4px_0_0_#0f172a]">
                       Transfer Certificate
                     </h2>
                 </div>

                 {/* Meta Data */}
                 <div className="flex justify-between font-bold text-[14px] mb-6 px-4" style={{ fontFamily: '"Playfair Display", serif' }}>
                     <div>TC No: <span className="underline underline-offset-4 ml-2">TC-{selectedTcStudent.id.slice(-4)}</span></div>
                     <div>Admission No: <span className="underline underline-offset-4 ml-2">{selectedTcStudent.id}</span></div>
                     <div>Date: <span className="underline underline-offset-4 ml-2">{format(new Date(), 'dd/MM/yyyy')}</span></div>
                 </div>

                 {/* Form List */}
                 <div className="flex-1 px-4 text-[15px] font-medium text-slate-900 flex flex-col justify-between py-2">
                     <div className="w-full space-y-[11px]">
                         {[
                             { label: "Name of Pupil", value: selectedTcStudent.name },
                             { label: "Mother's Name", value: (selectedTcStudent as any).motherName || "-" },
                             { label: "Father's / Guardian's Name", value: selectedTcStudent.parentName },
                             { label: "Date of Birth (in Christian Era) according to Admission Register", value: `${selectedTcStudent.dob || '14/08/2010'}` },
                             { label: "Date of Birth (in words)", value: "Fourteenth August Two Thousand Ten" },
                             { label: "Nationality", value: "Indian" },
                             { label: "Whether the candidate belongs to SC / ST / OBC", value: "General" },
                             { label: "Date of first admission in the School with class", value: `${selectedTcStudent.admissionDate || '01/04/2015'} - Class X` },
                             { label: "Class in which the pupil last studied (in figures & words)", value: `${selectedTcStudent.class}` },
                             { label: "School / Board Annual examination last taken with result", value: `Passed ${selectedTcStudent.class}` },
                             { label: "Whether failed, if so once/twice in the same class", value: "No" },
                             { label: "Subjects Studied", value: "1. English  2. Hindi  3. Maths  4. Science  5. Social Sci." },
                             { label: "Whether qualified for promotion to the higher class", value: "Yes, to the next grade" },
                             { label: "Month up to which the pupil has paid school dues", value: "March 2026" },
                             { label: "Any fee concession availed of. If so, the nature", value: "No" },
                             { label: "Total No. of working days in the academic session", value: "220" },
                             { label: "Total No. of working days pupil present in the school", value: "205" },
                             { label: "General conduct", value: "Excellent" },
                             { label: "Date of application for certificate", value: format(new Date(), 'dd MMMM yyyy') },
                             { label: "Date of issue of certificate", value: format(new Date(), 'dd MMMM yyyy') },
                             { label: "Reasons for leaving the school", value: "Transfer of Parents" },
                             { label: "Any other remarks", value: "Nil" }
                         ].map((item, i) => (
                             <div key={i} className="flex min-h-[30px] items-end">
                                 <div className="w-[30px] shrink-0 font-bold">{i + 1}.</div>
                                 <div className="w-[380px] shrink-0 font-semibold">{item.label}</div>
                                 <div className="w-[15px] shrink-0 font-bold">:</div>
                                 <div className="flex-1 font-bold uppercase pl-2 border-b-[1.5px] border-dotted border-slate-600 truncate pb-0.5" style={{ fontFamily: '"Playfair Display", serif' }}>
                                     {item.value}
                                 </div>
                             </div>
                         ))}
                     </div>
                 </div>

                 {/* Signatures */}
                 <div className="flex justify-between items-end mt-4 pt-12 font-bold text-[14px] px-4">
                     <div className="text-center w-[180px]">
                         <div className="w-full border-b-[1.5px] border-slate-900 mb-1"></div>
                         <p>Class Teacher</p>
                     </div>
                     <div className="text-center w-[180px]">
                         <div className="w-full border-b-[1.5px] border-slate-900 mb-1"></div>
                         <p>Checked By</p>
                         <p className="text-[10px] uppercase font-normal text-slate-600">(State full name & designation)</p>
                     </div>
                     <div className="text-center w-[180px]">
                         <div className="w-full border-b-[1.5px] border-slate-900 mb-1"></div>
                         <p>Principal</p>
                         <p className="text-[10px] uppercase font-normal text-slate-600">(Seal)</p>
                     </div>
                 </div>
               </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
