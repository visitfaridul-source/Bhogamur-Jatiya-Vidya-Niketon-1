import React, { useState, useRef } from 'react';
import { createPortal } from 'react-dom';
import { Search, Plus, Filter, MoreVertical, Edit, Trash2, Download, Upload, IdCard, X, Printer, UserPlus, Image as ImageIcon } from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';
import * as XLSX from 'xlsx';
import { useSchool } from '../../context/SchoolContext';

export default function Students() {
  const { students, setStudents } = useSchool();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedClassFilter, setSelectedClassFilter] = useState('');
  const [selectedStatusFilter, setSelectedStatusFilter] = useState('');
  const [selectedStudentForID, setSelectedStudentForID] = useState<any>(null);
  const [isAddStudentModalOpen, setIsAddStudentModalOpen] = useState(false);
  const [editingStudent, setEditingStudent] = useState<any>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handlePrint = () => {
    window.print();
  };

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPhotoPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleImportExcel = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (evt) => {
        const bstr = evt.target?.result;
        const wb = XLSX.read(bstr, { type: 'binary' });
        const wsname = wb.SheetNames[0];
        const ws = wb.Sheets[wsname];
        const data = XLSX.utils.sheet_to_json(ws);
        
        const importedStudents = data.map((row: any, index) => ({
          id: row['Admission Id'] || row['Adm Id'] || `IMP${Date.now()}${index}`,
          name: row['Name'] || 'Unknown',
          class: row['Class'] || 'N/A',
          section: row['Section'] || 'N/A',
          admissionDate: row['Date of Admission'] || '',
          dob: row['DOB'] || '',
          parentName: row["Father's Name"] || row["Father's name"] || 'N/A',
          motherName: row["Mother's Name"] || row["Mother's name"] || '',
          address: row['Address'] || '',
          phone: row['Mobile No'] || 'N/A',
          aadhaar: row['Aadhaar No'] || '',
          pen: row['PEN No'] || '',
          apaar: row['APAAR ID'] || '',
          status: row['Status'] || 'Active',
        }));
        
        setStudents(prev => [...importedStudents, ...prev]);
        
        if (fileInputRef.current) {
          fileInputRef.current.value = '';
        }
      };
      reader.readAsBinaryString(file);
    }
  };

  const handleExportExcel = () => {
    const wb = XLSX.utils.book_new();

    // Group students by class
    const studentsByClass = students.reduce((acc, student) => {
      const className = student.class || 'Unassigned';
      if (!acc[className]) {
        acc[className] = [];
      }
      acc[className].push(student);
      return acc;
    }, {} as Record<string, typeof students>);

    // Create a sheet for each class
    Object.entries(studentsByClass).forEach(([className, classStudentsList]) => {
      const formattedData = (classStudentsList as any[]).map(s => ({
        'Admission Id': s.id,
        'Date of Admission': s.admissionDate || '',
        'Class': s.class,
        'Section': s.section,
        'Name': s.name,
        'DOB': s.dob || '',
        'Mobile No': s.phone,
        "Father's Name": s.parentName,
        "Mother's Name": s.motherName || '',
        'Address': s.address || '',
        'Aadhaar No': s.aadhaar || '',
        'PEN No': s.pen || '',
        'APAAR ID': s.apaar || '',
        'Status': s.status
      }));

      const ws = XLSX.utils.json_to_sheet(formattedData);
      // Valid sheet names cannot exceed 31 chars and no special chars
      let safeSheetName = className.substring(0, 31).replace(/[\\/?*[\]]/g, ' ').trim();
      if (!safeSheetName) safeSheetName = 'Students';
      
      XLSX.utils.book_append_sheet(wb, ws, safeSheetName);
    });

    if (Object.keys(studentsByClass).length === 0) {
      const ws = XLSX.utils.json_to_sheet([]);
      XLSX.utils.book_append_sheet(wb, ws, "Students");
    }

    XLSX.writeFile(wb, "Classwise_Students_List.xlsx");
  };

  const handleDeleteStudent = (id: string) => {
    if (confirm('Are you sure you want to delete this student?')) {
      setStudents(prev => prev.filter(s => s.id !== id));
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">Student Management</h1>
          <p className="text-slate-500 text-sm mt-1 font-medium">Manage enrollments, profiles, and ID cards.</p>
        </div>
        <div className="flex flex-wrap gap-3">
          <input 
            type="file" 
            accept=".xlsx, .xls" 
            className="hidden" 
            ref={fileInputRef}
            onChange={handleImportExcel}
          />
          <button 
            onClick={() => fileInputRef.current?.click()}
            className="flex items-center gap-2 bg-emerald-50 text-emerald-700 px-4 py-2.5 rounded-xl text-sm font-bold hover:bg-emerald-100 transition-colors border border-emerald-200"
          >
            <Upload className="w-4 h-4" />
            Import Excel
          </button>
          <button 
            onClick={handleExportExcel}
            className="flex items-center gap-2 bg-white text-slate-700 border border-slate-200 px-4 py-2.5 rounded-xl text-sm font-bold hover:bg-slate-50 transition-colors shadow-sm"
          >
            <Download className="w-4 h-4" />
            Export
          </button>
          <button 
            onClick={() => setIsAddStudentModalOpen(true)}
            className="flex items-center gap-2 bg-blue-600 text-white px-5 py-2.5 rounded-xl text-sm font-bold hover:bg-blue-700 transition-colors shadow-sm"
          >
            <Plus className="w-4 h-4" />
            Add Student
          </button>
        </div>
      </div>

      <div className="bg-white rounded-[2rem] border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-5 border-b border-slate-200 flex flex-col sm:flex-row justify-between gap-4 bg-slate-50/50">
          <div className="relative w-full sm:max-w-md">
            <Search className="w-5 h-5 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input 
              type="text" 
              placeholder="Search by name, ID or roll..." 
              className="w-full pl-11 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all shadow-sm"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="flex flex-wrap gap-3">
            <select 
              className="bg-white border border-slate-200 text-slate-700 text-sm font-medium rounded-xl px-4 py-2.5 focus:outline-none focus:border-blue-500 shadow-sm min-w-[140px]"
              value={selectedStatusFilter}
              onChange={(e) => setSelectedStatusFilter(e.target.value)}
            >
              <option value="">All Status</option>
              <option value="Active">Active</option>
              <option value="Inactive">Inactive</option>
              <option value="Transferred">Transferred</option>
            </select>
            <select 
              className="bg-white border border-slate-200 text-slate-700 text-sm font-medium rounded-xl px-4 py-2.5 focus:outline-none focus:border-blue-500 shadow-sm min-w-[140px]"
              value={selectedClassFilter}
              onChange={(e) => setSelectedClassFilter(e.target.value)}
            >
              <option value="">All Classes</option>
              {['Nursery', 'LKG', 'UKG', 'Class 1', 'Class 2', 'Class 3', 'Class 4', 'Class 5', 'Class 6', 'Class 7', 'Class 8', 'Class 9', 'Class 10', 'Class 11', 'Class 12'].map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm whitespace-nowrap">
            <thead className="bg-slate-100 text-slate-600 border-b border-slate-200">
              <tr>
                <th className="px-6 py-4 font-bold uppercase tracking-wider text-xs">Photo</th>
                <th className="px-6 py-4 font-bold uppercase tracking-wider text-xs">Adm Id</th>
                <th className="px-6 py-4 font-bold uppercase tracking-wider text-xs">Name</th>
                <th className="px-6 py-4 font-bold uppercase tracking-wider text-xs">Class</th>
                <th className="px-6 py-4 font-bold uppercase tracking-wider text-xs">Mobile</th>
                <th className="px-6 py-4 font-bold uppercase tracking-wider text-xs">Father's Name</th>
                <th className="px-6 py-4 font-bold uppercase tracking-wider text-xs">Status</th>
                <th className="px-6 py-4 font-bold uppercase tracking-wider text-xs text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 bg-white">
              {students
                .filter(s => 
                  s.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                  s.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
                  (s.roll && s.roll.toLowerCase().includes(searchTerm.toLowerCase()))
                )
                .filter(s => selectedClassFilter ? s.class === selectedClassFilter : true)
                .filter(s => selectedStatusFilter ? s.status === selectedStatusFilter : true)
                .map((student) => (
                <tr key={student.id} className="hover:bg-slate-50 transition-colors group">
                  <td className="px-6 py-4">
                    <div className="w-12 h-12 rounded-full border border-slate-200 overflow-hidden shrink-0 bg-white">
                       {(student as any).photoUrl ? (
                          <img src={(student as any).photoUrl} alt={student.name} className="w-full h-full object-cover" />
                       ) : (
                          <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${student.name}`} alt={student.name} className="w-full h-full object-cover bg-slate-50" />
                       )}
                    </div>
                  </td>
                  <td className="px-6 py-4 text-slate-800 font-bold">{student.id}</td>
                  <td className="px-6 py-4 text-slate-900 font-bold">{student.name}</td>
                  <td className="px-6 py-4 text-slate-600 font-medium">
                    {student.class} {student.section && `- ${student.section}`}
                  </td>
                  <td className="px-6 py-4 text-slate-600 font-medium">{student.phone}</td>
                  <td className="px-6 py-4 text-slate-600 font-medium">{student.parentName}</td>
                  <td className="px-6 py-4">
                     <span className={`px-3 py-1.5 rounded-full text-xs font-bold border ${
                      student.status === 'Active' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 
                      student.status === 'Transferred' ? 'bg-amber-50 text-amber-700 border-amber-200' : 'bg-red-50 text-red-700 border-red-200'
                    }`}>
                      {student.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button 
                        onClick={() => setSelectedStudentForID(student)}
                        className="p-2 text-indigo-600 bg-indigo-50 hover:bg-indigo-100 rounded-xl transition-colors border border-indigo-100" title="Generate ID Card"
                      >
                        <IdCard className="w-4 h-4" />
                      </button>
                      <button 
                        onClick={() => {
                          setEditingStudent(student);
                          setPhotoPreview((student as any).photoUrl || null);
                        }}
                        className="p-2 text-blue-600 bg-blue-50 hover:bg-blue-100 rounded-xl transition-colors border border-blue-100" title="Edit">
                        <Edit className="w-4 h-4" />
                      </button>
                      <button 
                        onClick={() => handleDeleteStudent(student.id)}
                        className="p-2 text-red-600 bg-red-50 hover:bg-red-100 rounded-xl transition-colors border border-red-100" title="Delete">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        
        <div className="p-5 border-t border-slate-100 flex items-center justify-between text-sm text-slate-500 bg-slate-50/50">
          <p className="font-medium">Showing {students.length} students</p>
          <div className="flex gap-2">
            <button className="px-4 py-2 border border-slate-200 bg-white rounded-xl font-medium hover:bg-slate-50 disabled:opacity-50 transition-colors">Previous</button>
            <button className="px-4 py-2 bg-blue-600 font-bold text-white rounded-xl shadow-sm">1</button>
            <button className="px-4 py-2 border border-slate-200 bg-white rounded-xl font-medium hover:bg-slate-50 disabled:opacity-50 transition-colors">Next</button>
          </div>
        </div>
      </div>

      {/* ID Card Modal */}
      {selectedStudentForID && createPortal(
        <div className="fixed inset-0 z-[100] bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl shadow-xl w-full max-w-md overflow-hidden print:w-full print:shadow-none animate-in fade-in zoom-in-95 duration-200">
            <div className="p-4 border-b border-slate-100 flex justify-between items-center print:hidden bg-slate-50">
              <h3 className="font-bold text-slate-800 flex items-center gap-2"><IdCard className="w-5 h-5" /> Student ID Card</h3>
              <div className="flex gap-2">
                <button onClick={handlePrint} className="p-2 hover:bg-slate-200 rounded-full text-slate-600 transition-colors">
                  <Printer className="w-5 h-5" />
                </button>
                <button onClick={() => setSelectedStudentForID(null)} className="p-2 hover:bg-slate-200 rounded-full text-slate-600 transition-colors">
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            <div className="p-8 flex justify-center bg-[#f8fafc]" id="printable-id-card">
              {/* ID Card Visual Design */}
              <div className="w-[300px] h-[480px] bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden relative print:shadow-none flex flex-col">
                {/* Header Banner */}
                <div className="h-24 bg-gradient-to-r from-blue-600 to-indigo-600 relative flex items-center justify-center px-4">
                  <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-20" />
                  <div className="text-center relative z-10 text-white w-full">
                    <h2 className="font-black text-xl tracking-wider leading-tight">BHOGAMUR JATIYA VIDYA NIKETON</h2>
                    <p className="text-[10px] text-blue-100 font-medium tracking-widest uppercase">Student Identity Card</p>
                  </div>
                  {/* Decorative curved bottom */}
                  <div className="absolute -bottom-4 left-0 right-0 h-8 bg-white/10 blur-xl" />
                </div>

                {/* Photo & Details Layer */}
                <div className="flex flex-col items-center -mt-12 relative z-20 flex-1 px-6">
                  {/* Profile Photo */}
                  <div className="w-24 h-24 bg-white rounded-full p-1.5 shadow-lg mb-4">
                     <div className="w-full h-full rounded-full bg-slate-100 overflow-hidden">
                       <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${selectedStudentForID.name}`} alt={selectedStudentForID.name} />
                     </div>
                  </div>

                  {/* Student Info */}
                  <h3 className="text-xl font-bold text-slate-800 text-center uppercase tracking-tight">{selectedStudentForID.name}</h3>
                  <p className="text-sm font-semibold text-blue-600 mt-1 mb-5">{selectedStudentForID.id}</p>

                  <div className="w-full space-y-2.5">
                    <div className="flex justify-between items-center text-xs">
                      <span className="text-slate-500 font-medium">Class/Sec</span>
                      <span className="font-bold text-slate-800">{selectedStudentForID.class} - {selectedStudentForID.section}</span>
                    </div>
                    <div className="flex justify-between items-center text-xs">
                      <span className="text-slate-500 font-medium">Roll No.</span>
                      <span className="font-bold text-slate-800">{selectedStudentForID.roll}</span>
                    </div>
                    <div className="flex justify-between items-center text-xs">
                      <span className="text-slate-500 font-medium">Session</span>
                      <span className="font-bold text-slate-800">2023 - 2024</span>
                    </div>
                  </div>

                  {/* QR Code Container */}
                  <div className="mt-auto mb-6 flex flex-col items-center">
                    <div className="p-2 bg-white rounded-xl shadow-[0_0_15px_-3px_rgba(0,0,0,0.1)] border border-slate-100">
                      <QRCodeSVG 
                        value={JSON.stringify({ 
                          id: selectedStudentForID.id, 
                          name: selectedStudentForID.name, 
                          class: selectedStudentForID.class, 
                          section: selectedStudentForID.section 
                        })} 
                        size={80} 
                        level="H"
                        includeMargin={false}
                      />
                    </div>
                    <p className="text-[9px] text-slate-400 mt-2 font-medium tracking-wide">SCAN FOR ATTENDANCE</p>
                  </div>
                </div>

                <div className="h-2 bg-gradient-to-r from-blue-600 to-indigo-600 w-full" />
              </div>
            </div>
            
            <style>
              {`
                @media print {
                  body * { visibility: hidden; }
                  #printable-id-card, #printable-id-card * { visibility: visible; }
                  #printable-id-card { position: absolute; left: 0; top: 0; }
                }
              `}
            </style>
          </div>
        </div>
      , document.body)}

      {/* Add/Edit Student Modal */}
      {(isAddStudentModalOpen || editingStudent) && createPortal(
        <div className="fixed inset-0 z-[100] bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl shadow-xl w-full max-w-5xl max-h-[90vh] flex flex-col animate-in fade-in zoom-in-95 duration-200">
             {/* Modal Header (Fixed) */}
             <div className="px-8 py-5 border-b border-slate-100 flex justify-between items-center shrink-0">
               <div>
                  <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
                     <UserPlus className="w-6 h-6 text-blue-600" /> 
                     {editingStudent ? 'Edit Student Details' : 'New Admission Form'}
                  </h2>
                  <p className="text-sm text-slate-500 mt-1">{editingStudent ? 'Update the details for the existing student' : 'Fill in the details to enroll a new student into the system'}</p>
               </div>
               <button 
                 onClick={() => { setIsAddStudentModalOpen(false); setEditingStudent(null); }} 
                 className="p-2 hover:bg-slate-100 rounded-full text-slate-500 transition-colors"
               >
                 <X className="w-6 h-6" />
               </button>
             </div>

             {/* Modal Body (Scrollable) */}
             <div className="p-8 overflow-y-auto flex-1 custom-scrollbar">
        <form key={editingStudent?.id || 'new'} id="add-student-form" className="space-y-8" onSubmit={(e) => { 
          e.preventDefault(); 
          const formData = new FormData(e.currentTarget);
          
          const admId = formData.get('admId') as string;
          const isIdCollision = students.some(s => s.id === admId && (!editingStudent || editingStudent.id !== admId));
          
          if (isIdCollision) {
            alert('Admission ID must be unique. This ID is already assigned to another student.');
            return;
          }

          const newStudent = {
            id: admId,
            name: formData.get('fullName') as string,
            class: formData.get('class') as string,
            section: formData.get('section') as string,
            roll: formData.get('roll') as string || editingStudent?.roll || '-',
            parentName: formData.get('fatherName') as string,
            phone: formData.get('mobile') as string,
            status: formData.get('status') as string,
            admissionDate: formData.get('admissionDate') as string,
            dob: formData.get('dob') as string,
            motherName: formData.get('motherName') as string,
            address: formData.get('address') as string,
            aadhaar: formData.get('aadhaar') as string,
            pen: formData.get('pen') as string,
            apaar: formData.get('apaar') as string,
            photoUrl: photoPreview || editingStudent?.photoUrl,
          };

          if (editingStudent) {
            setStudents(prev => prev.map(s => s.id === editingStudent.id ? newStudent : s));
            setEditingStudent(null);
          } else {
            setStudents(prev => [newStudent, ...prev]);
            setIsAddStudentModalOpen(false);
          }
          setPhotoPreview(null);
          // Optional: e.currentTarget.reset(); is handled when form is re-rendered
        }}>
                 
                 {/* Section 1: Academic Details */}
                 <div className="bg-slate-50/50 p-6 rounded-2xl border border-slate-100">
                    <h3 className="text-sm font-bold text-blue-800 uppercase tracking-wider mb-5 flex items-center gap-2">
                      <div className="w-6 h-6 rounded-md bg-blue-100 text-blue-600 flex items-center justify-center text-xs">1</div> 
                      Academic Details
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-5">
                      <div className="space-y-1.5">
                        <label className="text-sm font-semibold text-slate-700">Admission No. (Adm Id)</label>
                        <input type="text" name="admId" defaultValue={editingStudent?.id} className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all text-sm" placeholder="e.g. ADM2023001" required />
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-sm font-semibold text-slate-700">Date of Admission</label>
                        <input type="date" name="admissionDate" defaultValue={editingStudent?.admissionDate} className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all text-sm" required />
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-sm font-semibold text-slate-700">Class</label>
                        <select name="class" defaultValue={editingStudent?.class} className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all text-sm" required>
                          <option value="">Select Class</option>
                          {['Nursery', 'LKG', 'UKG', 'Class 1', 'Class 2', 'Class 3', 'Class 4', 'Class 5', 'Class 6', 'Class 7', 'Class 8', 'Class 9', 'Class 10', 'Class 11', 'Class 12'].map(c => <option key={c} value={c}>{c}</option>)}
                        </select>
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-sm font-semibold text-slate-700">Section</label>
                        <div className="relative">
                           <select name="section" defaultValue={editingStudent?.section} className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all appearance-none text-sm" required>
                             <option value="">Select Section</option>
                             <option value="A">Section A</option>
                             <option value="B">Section B</option>
                             <option value="C">Section C</option>
                             <option value="D">Section D</option>
                           </select>
                           <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-slate-500">
                             <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z"/></svg>
                           </div>
                        </div>
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-sm font-semibold text-slate-700">Roll No.</label>
                        <input type="text" name="roll" defaultValue={editingStudent?.roll} className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all text-sm" placeholder="e.g. 1" />
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-sm font-semibold text-slate-700">Status</label>
                        <select name="status" defaultValue={editingStudent?.status || 'Active'} className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all text-sm" required>
                          <option value="Active">Active</option>
                          <option value="Inactive">Inactive</option>
                        </select>
                      </div>
                    </div>
                 </div>

                 {/* Section 2: Student Details & Photo */}
                 <div className="flex flex-col lg:flex-row gap-6">
                   <div className="flex-1 bg-slate-50/50 p-6 rounded-2xl border border-slate-100">
                      <h3 className="text-sm font-bold text-blue-800 uppercase tracking-wider mb-5 flex items-center gap-2">
                        <div className="w-6 h-6 rounded-md bg-blue-100 text-blue-600 flex items-center justify-center text-xs">2</div> 
                        Personal Details
                      </h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                         <div className="space-y-1.5 md:col-span-2">
                           <label className="text-sm font-semibold text-slate-700">Full Name</label>
                           <input type="text" name="fullName" defaultValue={editingStudent?.name} className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all text-sm" placeholder="Student's Legal Name" required />
                         </div>
                         <div className="space-y-1.5">
                           <label className="text-sm font-semibold text-slate-700">Date of Birth (D.O.B)</label>
                           <input type="date" name="dob" defaultValue={editingStudent?.dob} className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all text-sm" required />
                         </div>
                         <div className="space-y-1.5">
                           <label className="text-sm font-semibold text-slate-700">Mobile Number</label>
                           <input type="tel" name="mobile" defaultValue={editingStudent?.phone} className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all text-sm" placeholder="+1 (___) ___-____" />
                         </div>
                      </div>
                   </div>
                       
                   {/* Photo Upload */}
                   <div className="w-full lg:w-64 bg-slate-50/50 p-6 rounded-2xl border border-slate-100 flex flex-col items-center justify-center shrink-0">
                     <label className="text-sm font-bold text-slate-700 mb-4 uppercase tracking-wider">Student Photo</label>
                     <div className="relative group w-36 h-44 rounded-2xl border-2 border-dashed border-slate-300 bg-white overflow-hidden hover:border-blue-400 hover:bg-blue-50/50 transition-colors flex items-center justify-center cursor-pointer shadow-sm">
                        <input 
                          type="file" 
                          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10" 
                          accept="image/*"
                          onChange={handlePhotoUpload}
                        />
                        {photoPreview ? (
                          <img src={photoPreview} alt="Preview" className="w-full h-full object-cover" />
                        ) : (
                          <div className="flex flex-col items-center p-4 text-center text-slate-400 group-hover:text-blue-500">
                            <ImageIcon className="w-8 h-8 mb-2 opacity-50 group-hover:opacity-100 transition-opacity" />
                            <span className="text-xs font-semibold">Click to upload<br/>passport size</span>
                          </div>
                        )}
                     </div>
                     <div className="mt-4 w-full">
                        <input 
                          type="text" 
                          placeholder="Or paste photo URL"
                          value={photoPreview || ''}
                          onChange={(e) => {
                            setPhotoPreview(e.target.value);
                          }}
                          className="w-full bg-white border border-slate-200 rounded-lg px-3 py-2 text-xs focus:outline-none focus:border-blue-500 text-center"
                        />
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
                        <label className="text-sm font-semibold text-slate-700">Father's Name</label>
                        <input type="text" name="fatherName" defaultValue={editingStudent?.parentName} className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all text-sm" required />
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-sm font-semibold text-slate-700">Mother's Name</label>
                        <input type="text" name="motherName" defaultValue={editingStudent?.motherName} className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all text-sm" required />
                      </div>
                      <div className="space-y-1.5 md:col-span-2">
                        <label className="text-sm font-semibold text-slate-700">Residential Address</label>
                        <textarea name="address" defaultValue={(editingStudent as any)?.address} className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all resize-none h-20 text-sm" placeholder="Full residential street address..." required></textarea>
                      </div>
                    </div>
                 </div>

                 {/* Section 4: Identification Details */}
                 <div className="bg-slate-50/50 p-6 rounded-2xl border border-slate-100">
                    <h3 className="text-sm font-bold text-blue-800 uppercase tracking-wider mb-5 flex items-center gap-2">
                       <div className="w-6 h-6 rounded-md bg-blue-100 text-blue-600 flex items-center justify-center text-xs">4</div> 
                       National Identification
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                      <div className="space-y-1.5">
                        <label className="text-sm font-semibold text-slate-700">Aadhaar No. (12 Digits)</label>
                        <input type="text" name="aadhaar" defaultValue={(editingStudent as any)?.aadhaar} pattern="\d{12}" className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all text-sm" placeholder="XXXX XXXX XXXX" />
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-sm font-semibold text-slate-700">PEN No. (Permanent Ed. No.)</label>
                        <input type="text" name="pen" defaultValue={(editingStudent as any)?.pen} className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all text-sm" placeholder="Enter PEN" />
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-sm font-semibold text-slate-700">APAAR ID (One Nation ID)</label>
                        <input type="text" name="apaar" defaultValue={(editingStudent as any)?.apaar} className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all text-sm" placeholder="Enter APAAR ID" />
                      </div>
                    </div>
                 </div>

               </form>
             </div>

             {/* Modal Footer (Fixed) */}
             <div className="px-8 py-5 border-t border-slate-100 bg-white flex justify-end gap-3 shrink-0 rounded-b-3xl">
               <button 
                 type="button"
                 onClick={() => { setIsAddStudentModalOpen(false); setEditingStudent(null); }}
                 className="px-6 py-2.5 text-sm font-bold text-slate-600 hover:bg-slate-100 rounded-xl transition-colors"
               >
                 Cancel
               </button>
               <button 
                 type="submit"
                 form="add-student-form"
                 className="px-8 py-2.5 bg-blue-600 text-white text-sm font-bold rounded-xl shadow-sm hover:bg-blue-700 shadow-blue-500/20 transition-all active:scale-95"
               >
                 {editingStudent ? 'Save Changes' : 'Save & Enroll Student'}
               </button>
             </div>
          </div>
        </div>
      , document.body)}
    </div>
  );
}
