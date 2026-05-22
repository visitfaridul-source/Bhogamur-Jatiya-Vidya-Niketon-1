import React, { useState } from 'react';
import { useSchool, StudentResult } from '../context/SchoolContext';
import { useWebsite } from '../context/WebsiteContext';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Search, CheckCircle2, XCircle, Award, Printer, Download, Loader2 } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '../lib/utils';

export default function ResultPage() {
  const { results } = useSchool();
  const { settings } = useWebsite();
  const [admNo, setAdmNo] = useState('');
  const [fullName, setFullName] = useState('');
  const [searchedResult, setSearchedResult] = useState<StudentResult | null>(null);
  const [hasSearched, setHasSearched] = useState(false);
  const [error, setError] = useState('');
  const [isPrinting, setIsPrinting] = useState(false);
  const navigate = useNavigate();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setHasSearched(true);
    setError('');

    if (!admNo.trim() || !fullName.trim()) {
      setError('Please enter both Admission Number and Full Name.');
      setSearchedResult(null);
      return;
    }

    const result = results.find(
      r => r.studentId.toLowerCase() === admNo.trim().toLowerCase() &&
           r.studentName.toLowerCase() === fullName.trim().toLowerCase()
    );

    if (result) {
      // Calculate rank
      const peerResults = results.filter(
        r => r.className === result.className && r.examName === result.examName
      ).sort((a, b) => b.percentage - a.percentage);
      
      let rank = 1;
      for (let i = 0; i < peerResults.length; i++) {
        if (peerResults[i].id === result.id) {
          rank = i + 1;
          break;
        }
      }
      
      const resultWithRank = { ...result, rank };
      setSearchedResult(resultWithRank as StudentResult & { rank: number });
    } else {
      setSearchedResult(null);
      setError('No matching result found. Please check your credentials.');
    }
  };

  const handlePrint = async () => {
    const marksheetElement = document.getElementById('marksheet-content');
    if (!marksheetElement) return;

    try {
      setIsPrinting(true);
      // Hide the print button temporarily during capture
      const printBtn = document.getElementById('print-action-btn');
      if (printBtn) printBtn.style.display = 'none';

      // Dynamically import libraries to prevent any bundle/react conflict
      const [{ toPng }, { jsPDF }] = await Promise.all([
        import('html-to-image'),
        import('jspdf')
      ]);

      // Capture the element
      const dataUrl = await toPng(marksheetElement, {
        quality: 1.0,
        pixelRatio: 2,
        backgroundColor: '#ffffff'
      });

      if (printBtn) printBtn.style.display = 'flex';

      const pdf = new jsPDF({
        orientation: 'p',
        unit: 'mm',
        format: 'a4'
      });

      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pageHeight = pdf.internal.pageSize.getHeight();
      
      // Calculate total image height based on standard A4 width
      const imgProps = pdf.getImageProperties(dataUrl);
      const imgHeight = (imgProps.height * pdfWidth) / imgProps.width;

      let heightLeft = imgHeight;
      let position = 0;

      // Add first page
      pdf.addImage(dataUrl, 'PNG', 0, position, pdfWidth, imgHeight);
      heightLeft -= pageHeight;

      // Add subsequent pages if content overflows
      while (heightLeft > 0) {
        position = heightLeft - imgHeight;
        pdf.addPage();
        pdf.addImage(dataUrl, 'PNG', 0, position, pdfWidth, imgHeight);
        heightLeft -= pageHeight;
      }

      pdf.save(`${searchedResult?.studentName?.replace(/\s+/g, '_')}_Marksheet.pdf`);
    } catch (error) {
      console.error('Error generating PDF:', error);
      alert('Failed to generate marksheet PDF. Please try again.');
      const printBtn = document.getElementById('print-action-btn');
      if (printBtn) printBtn.style.display = 'flex';
    } finally {
      setIsPrinting(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 font-sans selection:bg-blue-500/30 flex flex-col print:bg-white">
      <style>
        {`
          @media print {
            @page { margin: 1cm; }
            body { 
              -webkit-print-color-adjust: exact; 
              print-color-adjust: exact; 
              background-color: white !important;
            }
          }
        `}
      </style>
      {/* Navigation (Hidden when printing) */}
      <nav className="fixed top-2 inset-x-0 z-50 pointer-events-none px-4 sm:px-6 print:hidden">
        <div className="max-w-7xl mx-auto flex flex-col items-center gap-4 w-full">
          <div className="pointer-events-auto bg-slate-900/60 backdrop-blur-xl shadow-lg border border-slate-700/50 rounded-full px-4 sm:px-8 py-2 flex flex-wrap items-center justify-between gap-x-3 gap-y-2 w-full max-w-full">
            <button onClick={() => navigate('/')} className="flex items-center gap-2 text-xs sm:text-sm font-semibold text-white drop-shadow-md hover:text-blue-200 transition-colors px-2 py-1">
              <ArrowLeft className="w-4 h-4" /> Back to Home
            </button>
            <div className="text-white text-sm font-bold tracking-tight">{settings.schoolName}</div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="flex-1 flex flex-col items-center p-4 sm:p-6 relative pt-24 pb-12 w-full print:p-0 print:m-0 print:block">
        {/* Decorative Gradients (Hidden when printing) */}
        <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-blue-200/40 rounded-full blur-[120px] -translate-y-1/2 translate-x-1/3 pointer-events-none print:hidden" />
        <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-indigo-200/40 rounded-full blur-[100px] translate-y-1/3 -translate-x-1/3 pointer-events-none print:hidden" />

        <div className="w-full max-w-4xl mx-auto z-10">
          {/* Search Card (Hidden when a result is successfully found to show full screen marksheet, or keep it but minimal. Actually let's keep it visible so they can search another, but hidden on print) */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-[2rem] shadow-xl p-6 sm:p-8 mb-8 border border-slate-100 print:hidden"
          >
            <div className="text-center mb-6">
              <div className="w-16 h-16 bg-indigo-50 text-indigo-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <Award className="w-8 h-8" />
              </div>
              <h1 className="text-2xl sm:text-3xl font-black text-slate-800 tracking-tight">{settings.resultPageTitle}</h1>
              <p className="text-slate-500 mt-2">{settings.resultPageSubtitle}</p>
            </div>

            <form onSubmit={handleSearch} className="max-w-2xl mx-auto flex flex-col sm:flex-row gap-4">
              <div className="flex-1">
                <input
                  type="text"
                  placeholder="Admission Number (e.g. ADM2023001)"
                  value={admNo}
                  onChange={(e) => setAdmNo(e.target.value)}
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white text-slate-800 font-medium"
                />
              </div>
              <div className="flex-1">
                <input
                  type="text"
                  placeholder="Full Name (e.g. AARAV SHARMA)"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white text-slate-800 font-medium"
                />
              </div>
              <button 
                type="submit"
                className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 px-6 rounded-xl transition-all duration-300 shadow-md hover:shadow-lg flex items-center justify-center gap-2"
              >
                <Search className="w-5 h-5" />
                Find
              </button>
            </form>

            <AnimatePresence>
              {hasSearched && error && (
                <motion.div 
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="max-w-2xl mx-auto mt-4"
                >
                  <div className="p-4 bg-rose-50 text-rose-600 rounded-xl text-center text-sm font-medium border border-rose-100 flex items-center justify-center gap-2">
                    <XCircle className="w-5 h-5" /> {error}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>

          {/* Marksheet Design */}
          <AnimatePresence>
            {searchedResult && (
              <motion.div
                id="marksheet-content"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="bg-white p-8 sm:p-12 shadow-2xl rounded-sm border-t-8 border-indigo-700 relative overflow-hidden print:shadow-none print:border-none print:p-0"
              >
                {/* Background Watermark */}
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-[0.03]">
                  {settings.logoUrl ? (
                    <img src={settings.logoUrl} alt="Watermark" className="w-96 h-96 object-contain grayscale" />
                  ) : (
                    <Award className="w-96 h-96 text-slate-900" />
                  )}
                </div>

                {/* Print CTA */}
                <div className="absolute top-4 right-4 print:hidden flex gap-2 z-10" id="print-action-btn">
                  <button onClick={handlePrint} disabled={isPrinting} className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white shadow-md hover:shadow-lg px-4 py-2 rounded-lg font-bold text-sm transition-all disabled:opacity-70">
                     {isPrinting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4" />} 
                     {isPrinting ? 'Generating PDF...' : 'Download PDF / Print'}
                  </button>
                </div>

                {/* Header */}
                <div className="text-center border-b-[3px] border-indigo-700 pb-8 mb-8 relative z-10 pt-8 sm:pt-4">
                  {settings.logoUrl && (
                    <img src={settings.logoUrl} alt={settings.schoolName} className="h-20 sm:h-24 mx-auto mb-4 object-contain" />
                  )}
                  <h1 className="text-3xl sm:text-4xl font-black text-slate-900 uppercase tracking-widest">{settings.schoolName}</h1>
                  <p className="text-slate-600 font-medium mt-1 uppercase tracking-wide">{searchedResult.examName}</p>
                  <div className="mt-4 inline-block bg-indigo-50 border border-indigo-100 text-indigo-800 font-black px-6 py-2 rounded-full uppercase tracking-widest text-sm shadow-sm">
                    Statement of Marks
                  </div>
                </div>

                {/* Student Details Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8 text-sm sm:text-base relative z-10">
                  <div className="space-y-3">
                    <div className="flex border-b border-dashed border-slate-200 pb-1">
                      <span className="font-semibold text-slate-500 w-32">Student Name:</span>
                      <span className="font-bold text-slate-900 uppercase">{searchedResult.studentName}</span>
                    </div>
                    <div className="flex border-b border-dashed border-slate-200 pb-1">
                      <span className="font-semibold text-slate-500 w-32">Admission No:</span>
                      <span className="font-bold text-slate-900">{searchedResult.studentId}</span>
                    </div>
                  </div>
                  <div className="space-y-3">
                    <div className="flex border-b border-dashed border-slate-200 pb-1">
                      <span className="font-semibold text-slate-500 w-32">Class & Sec:</span>
                      <span className="font-bold text-slate-900">{searchedResult.className}</span>
                    </div>
                    <div className="flex border-b border-dashed border-slate-200 pb-1">
                      <span className="font-semibold text-slate-500 w-32">Date of Issue:</span>
                      <span className="font-bold text-slate-900">{new Date().toLocaleDateString('en-GB')}</span>
                    </div>
                  </div>
                </div>

                {/* Marks Table */}
                <div className="mb-8 relative z-10">
                  <table className="w-full text-left border-collapse border border-slate-300">
                    <thead>
                      <tr className="bg-slate-100 text-slate-800 uppercase text-xs sm:text-sm font-bold tracking-wider">
                        <th className="border border-slate-300 px-4 py-3">Subject Name</th>
                        <th className="border border-slate-300 px-4 py-3 text-center w-24">Max Marks</th>
                        <th className="border border-slate-300 px-4 py-3 text-center w-32">Marks Obtained</th>
                      </tr>
                    </thead>
                    <tbody className="text-slate-800 text-sm sm:text-base font-medium">
                      {searchedResult.subjects.map((sub, idx) => (
                        <tr key={idx} className="hover:bg-slate-50 transition-colors">
                          <td className="border border-slate-300 px-4 py-3 font-bold">{sub.subject}</td>
                          <td className="border border-slate-300 px-4 py-3 text-center text-slate-500">{sub.maxMarks}</td>
                          <td className="border border-slate-300 px-4 py-3 text-center font-bold tracking-wider">{sub.obtainedMarks}</td>
                        </tr>
                      ))}
                    </tbody>
                    <tfoot className="bg-indigo-50/50 text-indigo-900 font-black text-sm sm:text-base tracking-wide">
                      <tr>
                        <td className="border border-slate-300 px-4 py-4 text-right pr-6 uppercase tracking-widest">Total</td>
                        <td className="border border-slate-300 px-4 py-4 text-center">{searchedResult.subjects.reduce((acc, curr) => acc + curr.maxMarks, 0)}</td>
                        <td className="border border-slate-300 px-4 py-4 text-center">{searchedResult.totalMarks}</td>
                      </tr>
                    </tfoot>
                  </table>
                </div>

                {/* Final Result Summary */}
                <div className="grid grid-cols-2 sm:grid-cols-5 gap-4 mb-10 relative z-10">
                  <div className="bg-slate-50 border border-slate-200 p-4 rounded-xl text-center">
                    <div className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-1">Percentage</div>
                    <div className="text-2xl font-black text-slate-800">{searchedResult.percentage}%</div>
                  </div>
                  <div className="bg-slate-50 border border-slate-200 p-4 rounded-xl text-center">
                    <div className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-1">Grade</div>
                    <div className="text-2xl font-black text-slate-800">{searchedResult.grade}</div>
                  </div>
                  <div className="bg-slate-50 border border-slate-200 p-4 rounded-xl text-center">
                    <div className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-1">Rank</div>
                    <div className="text-2xl font-black text-slate-800">#{(searchedResult as any).rank}</div>
                  </div>
                  <div className={cn("border p-4 rounded-xl text-center col-span-2 sm:col-span-2", searchedResult.status === 'Pass' ? 'bg-emerald-50 border-emerald-200' : 'bg-rose-50 border-rose-200')}>
                    <div className={cn("text-xs font-bold uppercase tracking-widest mb-1", searchedResult.status === 'Pass' ? 'text-emerald-600' : 'text-rose-600')}>Final Status</div>
                    <div className={cn("text-2xl font-black flex items-center justify-center gap-2", searchedResult.status === 'Pass' ? 'text-emerald-700' : 'text-rose-700')}>
                       {searchedResult.status === 'Pass' ? <CheckCircle2 className="w-6 h-6" /> : <XCircle className="w-6 h-6" />}
                       {searchedResult.status.toUpperCase()}
                    </div>
                  </div>
                </div>

                {/* Remarks & Signatures */}
                <div className="flex flex-col sm:flex-row justify-between items-end mt-12 pt-8 border-t border-slate-200 relative z-10 gap-8">
                  <div className="flex-1 w-full">
                    <p className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-1">Remarks</p>
                    <p className="text-base font-medium text-slate-800 italic bg-slate-50 p-3 rounded-lg border border-slate-100">
                      "{searchedResult.remarks || (searchedResult.status === 'Pass' ? 'Promoted to next class.' : 'Needs improvement.')}"
                    </p>
                  </div>
                  
                  <div className="w-full sm:w-auto flex flex-row gap-8 justify-between sm:justify-end">
                    <div className="text-center pt-8 border-t border-slate-300 w-32 relative">
                       <span className="text-xs sm:text-sm font-bold text-slate-600">Class Teacher</span>
                    </div>
                    <div className="text-center pt-8 border-t border-slate-300 w-32 relative">
                       {settings.principalSignatureUrl && (
                         <img src={settings.principalSignatureUrl} alt="Principal Signature" className="absolute bottom-8 left-1/2 -translate-x-1/2 h-12 object-contain mix-blend-multiply" />
                       )}
                       <span className="text-xs sm:text-sm font-bold text-slate-600">Principal</span>
                    </div>
                  </div>
                </div>

              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </main>
    </div>
  );
}
