import { useState, lazy, Suspense, useMemo } from 'react';
import { Search, Calendar as CalendarIcon, CheckCircle, XCircle, Clock, Filter, FileSpreadsheet, QrCode, ScanFace, ListOrdered, Save, Edit2, X, Loader2, Download, Printer } from 'lucide-react';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import { useSchool } from '@/context/SchoolContext';

const QRScanner = lazy(() => import('@/components/attendance/QRScanner'));
const FaceScanner = lazy(() => import('@/components/attendance/FaceScanner'));

const initialMockAttendance = [
  { id: '1', date: new Date().toISOString(), class: 'Class 10', section: 'A', present: 42, absent: 3, late: 0, status: 'Completed', markedBy: 'Face ID System' },
  { id: '2', date: new Date().toISOString(), class: 'Class 8', section: 'B', present: 38, absent: 1, late: 2, status: 'Completed', markedBy: 'QR Scanner' },
  { id: '3', date: new Date().toISOString(), class: 'Class 12', section: 'A', present: 30, absent: 5, late: 0, status: 'Completed', markedBy: 'Mrs. Emily Brown' },
];

type ActiveTab = 'overview' | 'qr' | 'face';

export default function Attendance() {
  const { students } = useSchool();
  const [date, setDate] = useState(format(new Date(), 'yyyy-MM-dd'));
  const [selectedClass, setSelectedClass] = useState<string>('');
  const [activeTab, setActiveTab] = useState<ActiveTab>('overview');
  
  const [attendanceData, setAttendanceData] = useState(initialMockAttendance);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editRecord, setEditRecord] = useState<any>(null);

  const classes = useMemo(() => Array.from(new Set(students.map(s => s.class))).filter(Boolean), [students]);

  const exportAttendanceDetails = () => {
    let csvHeader = "";
    let csvRows = [];

    if (selectedClass) {
      csvHeader = "Roll No,Student Name,Class,Section,Status,Remarks\n";
      const classStudents = students.filter(s => s.class === selectedClass);
      classStudents.forEach((student, index) => {
        // Mock attendance status based on ID index
        const statuses = ['Present', 'Present', 'Present', 'Absent', 'Late'];
        const status = statuses[index % statuses.length];
        csvRows.push(`${student.roll},${student.name},${student.class},${student.section},${status},`);
      });
    } else {
      csvHeader = "Class,Section,Total Students,Present,Absent,Late\n";
      classes.forEach(c => {
        const classStudents = students.filter(s => s.class === c);
        const randPresent = Math.max(0, classStudents.length - Math.floor(Math.random() * 3));
        const randAbsent = classStudents.length - randPresent;
        csvRows.push(`${c},A,${classStudents.length},${randPresent},${randAbsent},0`);
      });
    }

    const csvContent = "data:text/csv;charset=utf-8," + csvHeader + csvRows.join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `Attendance_${selectedClass ? selectedClass : 'Overview'}_${date}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const printClassList = () => {
    let htmlContent = `
      <html>
        <head>
          <title>Class List</title>
          <style>
            body { font-family: sans-serif; padding: 20px; }
            table { width: 100%; border-collapse: collapse; margin-top: 20px; }
            th, td { border: 1px solid #ccc; padding: 10px; text-align: left; }
            th { background-color: #f8fafc; font-weight: bold; }
            .header { text-align: center; margin-bottom: 20px; }
          </style>
        </head>
        <body>
          <div class="header">
            <h2>${selectedClass ? selectedClass + ' - ' : 'All Classes '}Attendance Sheet</h2>
            <p>Date: ${format(new Date(date), 'MMMM dd, yyyy')}</p>
          </div>
          <table>
            <thead>
              <tr>
                <th style="width: 10%">Roll No</th>
                <th style="width: 40%">Student Name</th>
                <th style="width: 20%">Class / Section</th>
                <th style="width: 30%">Attendance / Signature</th>
              </tr>
            </thead>
            <tbody>
    `;

    const studentsToPrint = selectedClass ? students.filter(s => s.class === selectedClass) : students;

    studentsToPrint.forEach(student => {
      htmlContent += `
        <tr>
          <td>${student.roll || '-'}</td>
          <td><b>${student.name}</b></td>
          <td>${student.class}${student.section ? ' - ' + student.section : ''}</td>
          <td></td>
        </tr>
      `;
    });

    htmlContent += `
            </tbody>
          </table>
        </body>
      </html>
    `;

    const win = window.open('', '_blank');
    if (win) {
      win.document.write(htmlContent);
      win.document.close();
      win.print();
    }
  };

  const openEditModal = (record: any) => {
    setEditRecord({ ...record });
    setIsEditModalOpen(true);
  };

  const handleModalChange = (field: string, value: string) => {
    setEditRecord((prev: any) => ({ ...prev, [field]: value }));
  };

  const saveEditModal = () => {
    setAttendanceData(prev => prev.map(record => {
      if (record.id === editRecord.id) {
        return { 
          ...editRecord,
          present: parseInt(editRecord.present) || 0,
          absent: parseInt(editRecord.absent) || 0,
          late: parseInt(editRecord.late) || 0
        };
      }
      return record;
    }));
    setIsEditModalOpen(false);
    setEditRecord(null);
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 tracking-tight">Smart Attendance</h1>
          <p className="text-slate-500 text-sm mt-1">AI-powered tracking, QR scanning, and daily reports.</p>
        </div>
        <div className="flex flex-wrap gap-3">
          <button onClick={printClassList} className="flex items-center gap-2 bg-indigo-50 border border-indigo-200 text-indigo-700 px-4 py-2 rounded-xl text-sm font-semibold hover:bg-indigo-100 transition-colors shadow-sm">
            <Printer className="w-4 h-4" />
            <span className="hidden sm:inline">Print Blank List</span>
          </button>
          <button onClick={exportAttendanceDetails} className="flex items-center gap-2 bg-white border border-slate-200 text-slate-700 px-4 py-2 rounded-xl text-sm font-semibold hover:bg-slate-50 transition-colors shadow-sm">
            <FileSpreadsheet className="w-4 h-4" />
            <span className="hidden sm:inline">Export Report</span>
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 bg-white p-1.5 rounded-2xl border border-slate-200 w-full sm:w-fit overflow-x-auto shadow-sm">
        <TabButton 
          active={activeTab === 'overview'} 
          onClick={() => setActiveTab('overview')} 
          icon={ListOrdered} 
          label="Overview" 
        />
        <TabButton 
          active={activeTab === 'qr'} 
          onClick={() => setActiveTab('qr')} 
          icon={QrCode} 
          label="QR Scanner" 
        />
        <TabButton 
          active={activeTab === 'face'} 
          onClick={() => setActiveTab('face')} 
          icon={ScanFace} 
          label="Face Recognition" 
        />
      </div>

      {/* Tab Content */}
      <div className="mt-6">
        {activeTab === 'overview' && (
          <div className="space-y-6 animate-fade-in">
             {/* KPI Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
               <div className="bg-white rounded-[2rem] p-6 border border-slate-200 shadow-sm relative overflow-hidden group hover:border-emerald-300 hover:shadow-md transition-all">
                 <div className="absolute -right-4 -top-4 w-24 h-24 bg-emerald-50 rounded-full blur-2xl group-hover:bg-emerald-100 transition-colors"></div>
                 <div className="flex items-center gap-4 relative z-10">
                   <div className="w-12 h-12 bg-emerald-50 rounded-2xl flex items-center justify-center text-emerald-600 border border-emerald-100">
                     <CheckCircle className="w-6 h-6" />
                   </div>
                   <div>
                     <p className="text-sm font-bold text-slate-500 uppercase tracking-wider">Total Present</p>
                     <h3 className="text-2xl font-black text-slate-900 mt-1">2,412</h3>
                   </div>
                 </div>
               </div>
               <div className="bg-white rounded-[2rem] p-6 border border-slate-200 shadow-sm relative overflow-hidden group hover:border-rose-300 hover:shadow-md transition-all">
                 <div className="absolute -right-4 -top-4 w-24 h-24 bg-rose-50 rounded-full blur-2xl group-hover:bg-rose-100 transition-colors"></div>
                 <div className="flex items-center gap-4 relative z-10">
                   <div className="w-12 h-12 bg-rose-50 rounded-2xl flex items-center justify-center text-rose-600 border border-rose-100">
                     <XCircle className="w-6 h-6" />
                   </div>
                   <div>
                     <p className="text-sm font-bold text-slate-500 uppercase tracking-wider">Total Absent</p>
                     <h3 className="text-2xl font-black text-slate-900 mt-1">124</h3>
                   </div>
                 </div>
               </div>
               <div className="bg-white rounded-[2rem] p-6 border border-slate-200 shadow-sm relative overflow-hidden group hover:border-amber-300 hover:shadow-md transition-all">
                 <div className="absolute -right-4 -top-4 w-24 h-24 bg-amber-50 rounded-full blur-2xl group-hover:bg-amber-100 transition-colors"></div>
                 <div className="flex items-center gap-4 relative z-10">
                   <div className="w-12 h-12 bg-amber-50 rounded-2xl flex items-center justify-center text-amber-600 border border-amber-100">
                     <Clock className="w-6 h-6" />
                   </div>
                   <div>
                     <p className="text-sm font-bold text-slate-500 uppercase tracking-wider">Late Arrivals</p>
                     <h3 className="text-2xl font-black text-slate-900 mt-1">32</h3>
                   </div>
                 </div>
               </div>
               <div className="bg-white rounded-[2rem] p-6 border border-slate-200 shadow-sm relative overflow-hidden group hover:border-indigo-300 hover:shadow-md transition-all">
                 <div className="absolute -right-4 -top-4 w-24 h-24 bg-indigo-50 rounded-full blur-2xl group-hover:bg-indigo-100 transition-colors"></div>
                 <div className="flex items-center gap-4 relative z-10">
                   <div className="w-12 h-12 bg-indigo-50 rounded-2xl flex items-center justify-center text-indigo-600 border border-indigo-100">
                     <ScanFace className="w-6 h-6" />
                   </div>
                   <div>
                     <p className="text-sm font-bold text-slate-500 uppercase tracking-wider">AI Verified</p>
                     <h3 className="text-2xl font-black text-slate-900 mt-1">84.2%</h3>
                   </div>
                 </div>
               </div>
            </div>

            {/* Table */}
            <div className="bg-white rounded-[2rem] border border-slate-200 shadow-sm overflow-hidden">
              <div className="p-5 border-b border-slate-200 flex flex-col sm:flex-row justify-between gap-4 bg-slate-50/50">
                <div className="flex gap-4 flex-1">
                  <div className="relative max-w-[200px] w-full">
                    <select
                      className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm font-bold text-slate-700 outline-none focus:ring-2 focus:ring-blue-500/20"
                      value={selectedClass}
                      onChange={(e) => setSelectedClass(e.target.value)}
                    >
                      <option value="">All Classes (Summary)</option>
                      {classes.map(c => (
                        <option key={c} value={c}>{c}</option>
                      ))}
                    </select>
                  </div>
                  <div className="relative max-w-xs w-full">
                    <Search className="w-5 h-5 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input 
                      type="text" 
                      placeholder="Search class or teacher..." 
                      className="w-full pl-11 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all font-medium shadow-sm"
                    />
                  </div>
                  <div className="relative max-w-[200px] w-full">
                     <input 
                       type="date"
                       value={date}
                       onChange={(e) => setDate(e.target.value)}
                       className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm text-slate-700 font-bold focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 shadow-sm"
                     />
                  </div>
                </div>
                <div className="flex gap-2">
                  <button className="flex items-center gap-2 p-2 border border-slate-200 rounded-xl bg-white text-slate-700 hover:bg-slate-50 text-sm font-bold px-5 shadow-sm transition-colors">
                    <Filter className="w-4 h-4" /> Filter
                  </button>
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm whitespace-nowrap">
                  <thead className="bg-slate-100 text-slate-600 border-b border-slate-200">
                    {selectedClass ? (
                      <tr>
                        <th className="px-6 py-4 font-bold uppercase tracking-wider text-xs">Roll No</th>
                        <th className="px-6 py-4 font-bold uppercase tracking-wider text-xs">Student Name</th>
                        <th className="px-6 py-4 font-bold uppercase tracking-wider text-xs">Class / Section</th>
                        <th className="px-6 py-4 font-bold uppercase tracking-wider text-xs">Status</th>
                        <th className="px-6 py-4 font-bold uppercase tracking-wider text-xs">Remarks</th>
                      </tr>
                    ) : (
                      <tr>
                        <th className="px-6 py-4 font-bold uppercase tracking-wider text-xs">Class / Section</th>
                        <th className="px-6 py-4 font-bold uppercase tracking-wider text-xs">Date</th>
                        <th className="px-6 py-4 font-bold uppercase tracking-wider text-xs">Present</th>
                        <th className="px-6 py-4 font-bold uppercase tracking-wider text-xs">Absent</th>
                        <th className="px-6 py-4 font-bold uppercase tracking-wider text-xs">Late</th>
                        <th className="px-6 py-4 font-bold uppercase tracking-wider text-xs">Marked By</th>
                        <th className="px-6 py-4 font-bold uppercase tracking-wider text-xs text-right">Status / Action</th>
                      </tr>
                    )}
                  </thead>
                  <tbody className="divide-y divide-slate-100 bg-white">
                    {selectedClass ? (
                      students.filter(s => s.class === selectedClass).map((student, idx) => {
                        const statuses = ['Present', 'Present', 'Present', 'Absent', 'Late'];
                        const status = statuses[idx % statuses.length];
                        return (
                          <tr key={student.id} className="hover:bg-slate-50 transition-colors group">
                            <td className="px-6 py-4 font-bold text-slate-900">{student.roll}</td>
                            <td className="px-6 py-4 font-bold text-slate-800 flex items-center gap-3">
                              {student.avatar && <img src={student.avatar} alt="avatar" className="w-8 h-8 rounded-full border border-slate-200" />}
                              {student.name}
                            </td>
                            <td className="px-6 py-4 font-bold text-slate-600">{student.class} - {student.section}</td>
                            <td className="px-6 py-4">
                              <span className={cn(
                                "px-3 py-1.5 rounded-full text-xs font-bold",
                                status === 'Present' ? "bg-emerald-50 text-emerald-700 border border-emerald-200" :
                                status === 'Absent' ? "bg-rose-50 text-rose-700 border border-rose-200" :
                                "bg-amber-50 text-amber-700 border border-amber-200"
                              )}>
                                {status}
                              </span>
                            </td>
                            <td className="px-6 py-4 text-slate-500 font-medium">Auto-marked today</td>
                          </tr>
                        );
                      })
                    ) : (
                      attendanceData.map((record) => (
                        <tr key={record.id} className="hover:bg-slate-50 transition-colors group">
                          <td className="px-6 py-4 font-bold text-slate-900">{record.class}</td>
                          <td className="px-6 py-4 font-bold text-slate-800">{format(new Date(record.date), 'MMM dd, yyyy')}</td>
                          <td className="px-6 py-4 text-emerald-600 font-black text-base">
                            {record.present}
                          </td>
                          <td className="px-6 py-4 text-rose-600 font-black text-base">
                            {record.absent}
                          </td>
                          <td className="px-6 py-4 text-amber-600 font-black text-base">
                            {record.late}
                          </td>
                          <td className="px-6 py-4 text-slate-700 font-medium flex items-center gap-2">
                             {record.markedBy === 'Face ID System' ? (
                                <span className="flex items-center gap-1.5 text-indigo-700 bg-indigo-50 border border-indigo-100 px-2 py-1 rounded-md mt-1.5 font-bold text-xs"><ScanFace className="w-3.5 h-3.5" /> AI Verified</span>
                             ) : record.markedBy === 'QR Scanner' ? (
                                <span className="flex items-center gap-1.5 text-blue-700 bg-blue-50 border border-blue-100 px-2 py-1 rounded-md mt-1.5 font-bold text-xs"><QrCode className="w-3.5 h-3.5" /> QR Scanned</span>
                             ) : (
                                <span className="mt-1.5 block font-bold text-slate-700">{record.markedBy}</span>
                             )}
                          </td>
                          <td className="px-6 py-4 text-right">
                            <div className="flex items-center justify-end gap-3">
                              <span className="px-3 py-1.5 bg-emerald-50 border border-emerald-200 text-emerald-700 rounded-full text-xs font-bold">
                                {record.status}
                              </span>
                              <button onClick={() => openEditModal(record)} className="p-1.5 text-blue-500 hover:text-blue-700 hover:bg-blue-50 border border-transparent hover:border-blue-100 rounded-xl transition-colors opacity-0 group-hover:opacity-100">
                                <Edit2 className="w-4 h-4" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'qr' && (
          <Suspense fallback={<div className="p-12 text-center text-slate-500 flex flex-col items-center justify-center"><Loader2 className="w-8 h-8 animate-spin mb-4" />Loading Scanner...</div>}>
            <QRScanner onExit={() => setActiveTab('overview')} />
          </Suspense>
        )}
        {activeTab === 'face' && <FaceScanner onExit={() => setActiveTab('overview')} />}
      </div>

      {isEditModalOpen && editRecord && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl w-full max-w-md shadow-2xl overflow-hidden flex flex-col">
            <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
              <h3 className="font-bold text-xl text-slate-800">Edit Attendance Record</h3>
              <button onClick={() => setIsEditModalOpen(false)} className="p-2 bg-white border border-slate-200 text-slate-400 hover:text-rose-500 rounded-full hover:bg-rose-50 transition-colors shadow-sm">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-1">Class / Section</label>
                <input type="text" value={editRecord.class} disabled className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm text-slate-600 font-medium" />
              </div>
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-1">Present</label>
                <input type="number" value={editRecord.present} onChange={(e) => handleModalChange('present', e.target.value)} className="w-full bg-white border border-slate-200 rounded-xl px-4 py-3 text-sm text-slate-800 font-bold focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20" />
              </div>
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-1">Absent</label>
                <input type="number" value={editRecord.absent} onChange={(e) => handleModalChange('absent', e.target.value)} className="w-full bg-white border border-slate-200 rounded-xl px-4 py-3 text-sm text-slate-800 font-bold focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20" />
              </div>
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-1">Late</label>
                <input type="number" value={editRecord.late} onChange={(e) => handleModalChange('late', e.target.value)} className="w-full bg-white border border-slate-200 rounded-xl px-4 py-3 text-sm text-slate-800 font-bold focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20" />
              </div>
            </div>
            <div className="p-6 bg-slate-50 border-t border-slate-100 flex items-center justify-end gap-3 mt-auto">
              <button onClick={() => setIsEditModalOpen(false)} className="px-6 py-2.5 bg-white border border-slate-200 text-slate-700 font-bold rounded-xl hover:bg-slate-50 transition-colors">
                Cancel
              </button>
              <button onClick={saveEditModal} className="px-6 py-2.5 bg-indigo-600 text-white font-bold rounded-xl shadow-lg shadow-indigo-600/30 hover:bg-indigo-700 transition-all">
                Save Changes
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function TabButton({ active, onClick, icon: Icon, label }: { active: boolean, onClick: () => void, icon: any, label: string }) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold transition-all shrink-0 whitespace-nowrap",
        active 
          ? "bg-slate-900 text-white shadow-sm" 
          : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
      )}
    >
      <Icon className={cn("w-4 h-4", active ? "text-white" : "text-slate-400")} />
      <span>{label}</span>
    </button>
  );
}
