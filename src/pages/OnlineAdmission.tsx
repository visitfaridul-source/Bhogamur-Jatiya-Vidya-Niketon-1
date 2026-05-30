import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSchool } from '../context/SchoolContext';
import { useWebsite } from '../context/WebsiteContext';
import { ArrowLeft, CheckCircle2, Download, Printer } from 'lucide-react';

const ensureDDMMYYYY = (dateVal: string | Date | undefined | null) => {
  if (!dateVal) return '-';
  if (typeof dateVal === 'object' && dateVal instanceof Date) {
    const d = dateVal.getDate().toString().padStart(2, '0');
    const m = (dateVal.getMonth() + 1).toString().padStart(2, '0');
    const y = dateVal.getFullYear();
    return `${d}/${m}/${y}`;
  }
  const dateStr = String(dateVal).trim();
  if (!dateStr || dateStr === '-') return '-';
  if (/^\d{2}\/\d{2}\/\d{4}$/.test(dateStr)) return dateStr;
  
  // if format is YYYY-MM-DD
  const matchesYMD = dateStr.match(/^(\d{4})[-/](\d{1,2})[-/](\d{1,2})$/);
  if (matchesYMD) {
    return `${matchesYMD[3].padStart(2, '0')}/${matchesYMD[2].padStart(2, '0')}/${matchesYMD[1]}`;
  }
  
  // if format is YYYY/MM/DD
  const parts = dateStr.split('/');
  if (parts.length === 3 && parts[0].length === 4) {
    return `${parts[2].padStart(2, '0')}/${parts[1].padStart(2, '0')}/${parts[0]}`;
  }

  // Try parsing in native JS Date parser
  try {
    const dObj = new Date(dateStr);
    if (!isNaN(dObj.getTime())) {
      const d = dObj.getDate().toString().padStart(2, '0');
      const m = (dObj.getMonth() + 1).toString().padStart(2, '0');
      const y = dObj.getFullYear();
      return `${d}/${m}/${y}`;
    }
  } catch (err) {}

  return dateStr;
};

const handleDateInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
  let value = e.target.value.replace(/\D/g, ""); // strip non-digits
  if (value.length > 8) value = value.slice(0, 8);
  
  let formatted = "";
  if (value.length > 0) {
    formatted += value.slice(0, 2);
  }
  if (value.length > 2) {
    formatted += "/" + value.slice(2, 4);
  }
  if (value.length > 4) {
    formatted += "/" + value.slice(4, 8);
  }
  e.target.value = formatted;
};

export default function OnlineAdmission() {
  const navigate = useNavigate();
  const { setOnlineAdmissions } = useSchool();
  const { settings } = useWebsite();
  const [submitted, setSubmitted] = useState(false);
  const [submittedData, setSubmittedData] = useState<any>(null);

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    
    // In a real app, you would handle photo upload to a server here.
    // For now we just create a temp admission request.
    const newAdmission = {
      id: `REQ-${Date.now().toString().slice(-6)}`,
      submitDate: ensureDDMMYYYY(new Date()),
      name: formData.get('fullName') as string,
      gender: (formData.get('gender') as string || 'Male'),
      class: formData.get('class') as string,
      dob: ensureDDMMYYYY(formData.get('dob') as string),
      parentName: formData.get('fatherName') as string,
      motherName: formData.get('motherName') as string,
      phone: formData.get('mobile') as string,
      address: formData.get('address') as string,
      aadhaar: formData.get('aadhaar') as string,
      pen: formData.get('pen') as string,
      apaar: formData.get('apaar') as string,
      status: 'Pending' as const,
    };

    setOnlineAdmissions(prev => [newAdmission, ...prev]);
    setSubmittedData(newAdmission);
    setSubmitted(true);
  };

  const handlePrint = async () => {
    try {
      const element = document.getElementById('print-area');
      if (element) {
        // dynamic import of html2pdf
        const html2pdf = (await import('html2pdf.js')).default;
        
        const opt = {
          margin: 10,
          filename: `Admission_Form_${submittedData?.id || 'Form'}.pdf`,
          image: { type: 'jpeg' as const, quality: 0.98 },
          html2canvas: { scale: 2 },
          jsPDF: { unit: 'mm' as const, format: 'a4' as const, orientation: 'portrait' as const }
        };
        
        html2pdf().set(opt).from(element).save();
      } else {
        window.print();
      }
    } catch (e) {
      console.error(e);
      window.print();
    }
  };

  if (submitted && submittedData) {
    return (
      <div className="min-h-screen bg-[#fafafa] flex flex-col items-center justify-center p-4 print:bg-white print:p-0">
        <div className="bg-white p-8 md:p-12 rounded-3xl shadow-xl max-w-2xl w-full print:shadow-none print:max-w-none print:rounded-none">
          {/* Printable Content */}
          <div id="print-area" className="print-content bg-white p-8">
            <div className="text-center mb-8 border-b pb-6">
               <div className="w-20 h-20 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-6 print:hidden">
                <CheckCircle2 className="w-10 h-10" />
              </div>
              <h1 className="text-3xl font-bold text-slate-800 mb-2">{settings.schoolName}</h1>
              <h2 className="text-xl font-semibold text-slate-600">Admission Application Form</h2>
              <div className="mt-4 flex flex-col items-center justify-center text-sm text-slate-500">
                <p>Application No: <span className="font-semibold text-slate-800">{submittedData.id}</span></p>
                <p>Date: {new Date(submittedData.submitDate).toLocaleDateString()}</p>
              </div>
            </div>

            <div className="space-y-6">
               <div className="grid grid-cols-2 gap-4">
                  <div className="col-span-2 sm:col-span-1">
                    <p className="text-xs text-slate-500 font-semibold uppercase">Student Name</p>
                    <p className="text-slate-800 font-medium border-b border-slate-200 pb-1">{submittedData.name}</p>
                  </div>
                  <div className="col-span-2 sm:col-span-1">
                    <p className="text-xs text-slate-500 font-semibold uppercase">Gender</p>
                    <p className="text-slate-800 font-medium border-b border-slate-200 pb-1">{submittedData.gender || 'Male'}</p>
                  </div>
                  <div className="col-span-2 sm:col-span-1">
                    <p className="text-xs text-slate-500 font-semibold uppercase">Admission Class</p>
                    <p className="text-slate-800 font-medium border-b border-slate-200 pb-1">{submittedData.class}</p>
                  </div>
                  <div className="col-span-2 sm:col-span-1">
                    <p className="text-xs text-slate-500 font-semibold uppercase">Date of Birth</p>
                    <p className="text-slate-800 font-medium border-b border-slate-200 pb-1">{submittedData.dob}</p>
                  </div>
                   <div className="col-span-2 sm:col-span-1">
                    <p className="text-xs text-slate-500 font-semibold uppercase">Mobile Number</p>
                    <p className="text-slate-800 font-medium border-b border-slate-200 pb-1">{submittedData.phone}</p>
                  </div>
                  <div className="col-span-2 sm:col-span-1">
                    <p className="text-xs text-slate-500 font-semibold uppercase">Father's Name</p>
                    <p className="text-slate-800 font-medium border-b border-slate-200 pb-1">{submittedData.parentName}</p>
                  </div>
                  <div className="col-span-2 sm:col-span-1">
                    <p className="text-xs text-slate-500 font-semibold uppercase">Mother's Name</p>
                    <p className="text-slate-800 font-medium border-b border-slate-200 pb-1">{submittedData.motherName}</p>
                  </div>
                  <div className="col-span-2">
                    <p className="text-xs text-slate-500 font-semibold uppercase">Address</p>
                    <p className="text-slate-800 font-medium border-b border-slate-200 pb-1">{submittedData.address}</p>
                  </div>
               </div>

               <div className="pt-8 flex justify-between items-end">
                 <div className="text-center">
                   <div className="w-32 border-b border-slate-400 mb-2"></div>
                   <p className="text-sm text-slate-600">Parent's Signature</p>
                 </div>
                 <div className="text-center">
                   <div className="w-32 border-b border-slate-400 mb-2"></div>
                   <p className="text-sm text-slate-600">Principal's Signature</p>
                 </div>
               </div>
            </div>
          </div>

          <div className="mt-12 flex flex-col sm:flex-row gap-4 print:hidden">
            <button 
              onClick={handlePrint}
              className="flex-1 flex items-center justify-center gap-2 bg-blue-600 text-white font-bold py-3 px-6 rounded-xl hover:bg-blue-700 transition-colors"
            >
              <Printer className="w-5 h-5" /> Print / Save as PDF
            </button>
            <button 
              onClick={() => navigate('/')}
              className="flex-1 bg-slate-900 text-white font-bold py-3 px-6 rounded-xl hover:bg-slate-800 transition-colors"
            >
              Return to Home
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#fafafa] py-12 px-4 sm:px-6lg:px-8">
      <div className="max-w-4xl mx-auto">
        <button 
          onClick={() => navigate('/')}
          className="flex items-center gap-2 text-slate-500 hover:text-slate-800 transition-colors mb-8"
        >
          <ArrowLeft className="w-5 h-5" /> Back to Home
        </button>

        <div className="bg-white rounded-3xl shadow-xl overflow-hidden border border-slate-100">
          <div className="bg-gradient-to-r from-blue-600 to-indigo-600 p-8 text-white text-center">
            <h1 className="text-3xl sm:text-4xl font-bold tracking-tight mb-2">{settings.admissionPageTitle}</h1>
            <p className="text-blue-100 max-w-xl mx-auto">{settings.admissionPageSubtitle}</p>
          </div>

          <div className="p-8">
            <form onSubmit={handleSubmit} className="space-y-8">
              {/* Section 1: Academic Details */}
              <div className="bg-slate-50/50 p-6 rounded-2xl border border-slate-100">
                <h3 className="text-sm font-bold text-blue-800 uppercase tracking-wider mb-5 flex items-center gap-2">
                  <div className="w-6 h-6 rounded-md bg-blue-100 text-blue-600 flex items-center justify-center text-xs">1</div> 
                  Academic Preferences
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div className="space-y-1.5 md:col-span-2">
                    <label className="text-sm font-semibold text-slate-700">Admission for Class *</label>
                    <select name="class" className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all text-sm" required>
                      <option value="">Select Class</option>
                      {['Nursery', 'LKG', 'UKG', 'Class 1', 'Class 2', 'Class 3', 'Class 4', 'Class 5', 'Class 6', 'Class 7', 'Class 8', 'Class 9', 'Class 10', 'Class 11', 'Class 12'].map(c => <option key={c} value={c}>{c}</option>)}
                    </select>
                  </div>
                </div>
              </div>

              {/* Section 2: Student Details */}
              <div className="bg-slate-50/50 p-6 rounded-2xl border border-slate-100">
                <h3 className="text-sm font-bold text-blue-800 uppercase tracking-wider mb-5 flex items-center gap-2">
                  <div className="w-6 h-6 rounded-md bg-blue-100 text-blue-600 flex items-center justify-center text-xs">2</div> 
                  Student Details
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div className="space-y-1.5 md:col-span-2">
                    <label className="text-sm font-semibold text-slate-700">Full Name *</label>
                    <input type="text" name="fullName" className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all text-sm" placeholder="Student's Legal Name" required />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-sm font-semibold text-slate-700">Gender *</label>
                    <select name="gender" className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all text-sm" required>
                      <option value="Male">Male</option>
                      <option value="Female">Female</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-sm font-semibold text-slate-700">Date of Birth (D.O.B) *</label>
                    <input 
                      type="text" 
                      name="dob" 
                      maxLength={10}
                      placeholder="DD/MM/YYYY"
                      onChange={handleDateInputChange}
                      className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all text-sm" 
                      required 
                    />
                  </div>
                  <div className="space-y-1.5 md:col-span-2">
                    <label className="text-sm font-semibold text-slate-700">Mobile Number *</label>
                    <input type="tel" name="mobile" className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all text-sm" placeholder="e.g. 9876543210" required />
                  </div>
                </div>
              </div>

              {/* Section 3: Family Details & Address */}
              <div className="bg-slate-50/50 p-6 rounded-2xl border border-slate-100">
                <h3 className="text-sm font-bold text-blue-800 uppercase tracking-wider mb-5 flex items-center gap-2">
                    <div className="w-6 h-6 rounded-md bg-blue-100 text-blue-600 flex items-center justify-center text-xs">3</div> 
                    Family & Address
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div className="space-y-1.5">
                    <label className="text-sm font-semibold text-slate-700">Father's Name *</label>
                    <input type="text" name="fatherName" className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all text-sm" required />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-sm font-semibold text-slate-700">Mother's Name *</label>
                    <input type="text" name="motherName" className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all text-sm" required />
                  </div>
                  <div className="space-y-1.5 md:col-span-2">
                    <label className="text-sm font-semibold text-slate-700">Residential Address *</label>
                    <textarea name="address" className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all resize-none h-24 text-sm" placeholder="Full residential street address..." required></textarea>
                  </div>
                </div>
              </div>

              {/* Section 4: Identification Details */}
              <div className="bg-slate-50/50 p-6 rounded-2xl border border-slate-100">
                <h3 className="text-sm font-bold text-blue-800 uppercase tracking-wider mb-5 flex items-center gap-2">
                    <div className="w-6 h-6 rounded-md bg-blue-100 text-blue-600 flex items-center justify-center text-xs">4</div> 
                    National Identification (Optional)
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                  <div className="space-y-1.5">
                    <label className="text-sm font-semibold text-slate-700">Aadhaar No. (12 Digits)</label>
                    <input type="text" name="aadhaar" pattern="\d{12}" className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all text-sm" placeholder="XXXX XXXX XXXX" />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-sm font-semibold text-slate-700">PEN No.</label>
                    <input type="text" name="pen" className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all text-sm" placeholder="Enter PEN" />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-sm font-semibold text-slate-700">APAAR ID</label>
                    <input type="text" name="apaar" className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all text-sm" placeholder="Enter APAAR ID" />
                  </div>
                </div>
              </div>

              <div className="pt-6">
                <p className="text-xs text-slate-500 mb-6 text-center">
                  By submitting this form, you confirm that the information provided is accurate and true to the best of your knowledge.
                </p>
                <button 
                  type="submit"
                  className="w-full text-lg bg-blue-600 text-white font-bold py-4 rounded-xl shadow-lg hover:bg-blue-700 hover:shadow-blue-500/25 transition-all"
                >
                  Submit Application
                </button>
              </div>

            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
