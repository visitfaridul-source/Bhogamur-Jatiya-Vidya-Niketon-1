import React, { useState } from 'react';
import { useSchool, StudentResult, SubjectMark } from '../../context/SchoolContext';
import { useAuth } from '../../context/AuthContext';
import { Search, Plus, Edit2, Trash2, CheckCircle2, XCircle, FileSpreadsheet, ChevronDown, Download } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '../../lib/utils';
import html2pdf from 'html2pdf.js';

export default function ResultsManagement() {
  const { user } = useAuth();
  const isStudentOrParent = user?.role === 'Student' || user?.role === 'Parent';
  const { results, setResults } = useSchool();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedClassFilter, setSelectedClassFilter] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [showBulkModal, setShowBulkModal] = useState(false);
  const initialGrid = () => {
    const arr = Array.from({ length: 15 }, () => Array(8).fill(''));
    arr[0] = ['Student Name', 'Admission No', 'Class', 'Exam Name', 'Math [100]', 'Science [100]', 'English [100]', 'Remarks'];
    return arr;
  };
  const [gridData, setGridData] = useState<string[][]>(initialGrid);
  const [editingResult, setEditingResult] = useState<StudentResult | null>(null);

  const initialFormState = {
    studentId: '',
    studentName: '',
    roll: '',
    className: '',
    examName: '',
    subjects: [{ subject: '', maxMarks: 100, obtainedMarks: 0 }] as SubjectMark[],
    remarks: ''
  };

  const [formData, setFormData] = useState(initialFormState);

  const calculateResults = (subjects: SubjectMark[]) => {
    let totalMax = 0;
    let totalObtained = 0;
    subjects.forEach(sub => {
      totalMax += Number(sub.maxMarks) || 0;
      totalObtained += Number(sub.obtainedMarks) || 0;
    });

    const percentage = totalMax > 0 ? (totalObtained / totalMax) * 100 : 0;
    
    let grade = 'F';
    if (percentage >= 90) grade = 'A+';
    else if (percentage >= 80) grade = 'A';
    else if (percentage >= 70) grade = 'B+';
    else if (percentage >= 60) grade = 'B';
    else if (percentage >= 50) grade = 'C';
    else if (percentage >= 40) grade = 'D';

    const status = percentage >= 40 ? 'Pass' : 'Fail';

    return { totalObtained, percentage, grade, status };
  };

  const filteredResults = results.filter(r => 
    (selectedClassFilter === '' || r.className === selectedClassFilter) &&
    (r.studentName.toLowerCase().includes(searchTerm.toLowerCase()) || 
     r.studentId.toLowerCase().includes(searchTerm.toLowerCase()) ||
     r.examName.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const uniqueClasses = ['Nursery', 'LKG', 'UKG', 'Class 1', 'Class 2', 'Class 3', 'Class 4', 'Class 5', 'Class 6', 'Class 7', 'Class 8', 'Class 9', 'Class 10', 'Class 11', 'Class 12'];

  const handleOpenModal = (result?: StudentResult) => {
    if (result) {
      setEditingResult(result);
      setFormData({
        studentId: result.studentId,
        studentName: result.studentName,
        roll: result.roll || '',
        className: result.className,
        examName: result.examName,
        subjects: [...result.subjects],
        remarks: result.remarks
      });
    } else {
      setEditingResult(null);
      setFormData(initialFormState);
    }
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditingResult(null);
    setFormData(initialFormState);
  };

  const handleSubjectChange = (index: number, field: keyof SubjectMark, value: string | number) => {
    const newSubjects = [...formData.subjects];
    newSubjects[index] = { ...newSubjects[index], [field]: value };
    setFormData({ ...formData, subjects: newSubjects });
  };

  const addSubject = () => {
    setFormData({ ...formData, subjects: [...formData.subjects, { subject: '', maxMarks: 100, obtainedMarks: 0 }] });
  };

  const removeSubject = (index: number) => {
    const newSubjects = [...formData.subjects];
    newSubjects.splice(index, 1);
    setFormData({ ...formData, subjects: newSubjects });
  };

  const handleSave = () => {
    const { totalObtained, percentage, grade, status } = calculateResults(formData.subjects);

    const newResult: StudentResult = {
      id: editingResult ? editingResult.id : `RES-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      ...formData,
      totalMarks: totalObtained,
      percentage: Number(percentage.toFixed(2)),
      grade,
      status: status as 'Pass' | 'Fail'
    };

    if (editingResult) {
      setResults(results.map(r => r.id === newResult.id ? newResult : r));
    } else {
      setResults([...results, newResult]);
    }
    handleCloseModal();
  };

  const handleDelete = (id: string) => {
    if (window.confirm('Are you sure you want to delete this result?')) {
      setResults(results.filter(r => r.id !== id));
    }
  };

  const [parsedPreview, setParsedPreview] = useState<StudentResult[]>([]);
  const [parseError, setParseError] = useState('');

  // Update parsed preview whenever gridData changes
  React.useEffect(() => {
    const rows = gridData;
    const nonEmptyRows = rows.filter(r => r.some(c => c.trim() !== ''));

    if (nonEmptyRows.length < 2) {
      setParsedPreview([]);
      setParseError('');
      return;
    }

    try {
      const headers = nonEmptyRows[0].map(h => h.trim());
      const studentNameIdx = headers.findIndex(h => h.toLowerCase().includes('name'));
      const studentIdIdx = headers.findIndex(h => h.toLowerCase().includes('admission') || h.toLowerCase().includes('id'));
      const classIdx = headers.findIndex(h => h.toLowerCase().includes('class'));
      const examIdx = headers.findIndex(h => h.toLowerCase().includes('exam'));
      const remarksIdx = headers.findIndex(h => h.toLowerCase().includes('remark'));

      if (studentNameIdx === -1 || studentIdIdx === -1 || classIdx === -1 || examIdx === -1) {
        setParseError('Missing required columns: Student Name, Admission No, Class, Exam Name');
        setParsedPreview([]);
        return;
      }

      const subjectColumns: { index: number; name: string; maxMarks: number }[] = [];
      headers.forEach((header, index) => {
        if (index === studentNameIdx || index === studentIdIdx || index === classIdx || index === examIdx || index === remarksIdx) {
          return;
        }
        
        let name = header;
        let maxMarks = 100;
        const match = header.match(/(.*)\[(\d+)\]/);
        if (match) {
          name = match[1].trim();
          maxMarks = parseInt(match[2], 10);
        }
        
        if (name) {
          subjectColumns.push({ index, name, maxMarks });
        }
      });

      if (subjectColumns.length === 0) {
        setParseError('No subject columns found in headers.');
        setParsedPreview([]);
        return;
      }

      const newResults: StudentResult[] = [];
      for (let i = 1; i < nonEmptyRows.length; i++) {
        const row = nonEmptyRows[i];

        const subjects: SubjectMark[] = subjectColumns.map(col => ({
          subject: col.name,
          maxMarks: col.maxMarks,
          obtainedMarks: parseInt(row[col.index]) || 0,
        }));

        const { totalObtained, percentage, grade, status } = calculateResults(subjects);

        // Only add if we have required fields
        const stName = row[studentNameIdx]?.trim() || '';
        const stId = row[studentIdIdx]?.trim() || '';
        
        if (!stName || !stId) continue;

        newResults.push({
          id: `PREVIEW-${i}`,
          studentId: stId,
          studentName: stName,
          className: row[classIdx]?.trim() || '',
          examName: row[examIdx]?.trim() || '',
          remarks: remarksIdx !== -1 ? row[remarksIdx]?.trim() || '' : '',
          subjects,
          totalMarks: totalObtained,
          percentage: Number(percentage.toFixed(2)),
          grade,
          status: status as 'Pass' | 'Fail'
        });
      }

      setParseError('');
      setParsedPreview(newResults);
    } catch (err) {
      setParseError('Error parsing grid data.');
      setParsedPreview([]);
    }
  }, [gridData]);

  const handleBulkImport = () => {
    if (parsedPreview.length === 0) return;
    
    // Generate actual unique IDs before saving
    const resultsToSave = parsedPreview.map((res, i) => ({
      ...res,
      id: `RES-${Date.now()}-${Math.floor(Math.random() * 1000)}-${i}`
    }));

    setResults([...results, ...resultsToSave]);
    setShowBulkModal(false);
    setGridData(initialGrid());
    alert(`Successfully imported ${resultsToSave.length} results!`);
  };

  const handleGridPaste = (e: React.ClipboardEvent, startRow: number, startCol: number) => {
    const clipboardData = e.clipboardData.getData('text');
    if (!clipboardData) return;
    
    if (clipboardData.includes('\t') || clipboardData.includes('\n')) {
      e.preventDefault();
      const pasteRows = clipboardData.split(/\r?\n/).map(r => r.split('\t'));
      
      let newGrid = [...gridData.map(r => [...r])];
      let maxRows = Math.max(newGrid.length, startRow + pasteRows.length);
      let maxCols = newGrid[0].length;
      
      pasteRows.forEach(r => { 
        maxCols = Math.max(maxCols, startCol + r.length);
      });
      
      while(newGrid.length < maxRows) {
        newGrid.push(Array(maxCols).fill(''));
      }
      newGrid.forEach(row => {
        while (row.length < maxCols) row.push('');
      });

      pasteRows.forEach((r, i) => {
        r.forEach((c, j) => {
          const ri = startRow + i;
          const ci = startCol + j;
          if (ri < newGrid.length && ci < newGrid[ri].length) {
            newGrid[ri][ci] = c;
          }
        });
      });
      setGridData(newGrid);
    }
  };

  const updateGridCell = (rIdx: number, cIdx: number, value: string) => {
    const newGrid = [...gridData];
    newGrid[rIdx] = [...newGrid[rIdx]];
    newGrid[rIdx][cIdx] = value;
    setGridData(newGrid);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Results Management</h1>
          <p className="text-slate-500">Manage student exam results</p>
        </div>
        <div className="flex items-center gap-3">
          {!isStudentOrParent && (
            <>
              <button
                onClick={() => setShowBulkModal(true)}
                className="flex items-center gap-2 bg-emerald-600 text-white px-4 py-2 rounded-xl hover:bg-emerald-700 transition-colors"
              >
                <FileSpreadsheet className="w-5 h-5" />
                <span className="hidden sm:inline">Bulk Import</span>
              </button>
              <button
                onClick={() => handleOpenModal()}
                className="flex items-center gap-2 bg-indigo-600 text-white px-4 py-2 rounded-xl hover:bg-indigo-700 transition-colors"
              >
                <Plus className="w-5 h-5" />
                New Result
              </button>
            </>
          )}
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden flex flex-col h-[calc(100vh-220px)]">
        <div className="p-4 border-b border-slate-200 flex flex-col sm:flex-row gap-4 justify-between items-center bg-white z-20">
          <div className="relative w-full sm:max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
            <input
              type="text"
              placeholder="Search by name, ID or exam..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-indigo-500 transition-colors"
            />
          </div>
          <div className="w-full sm:w-auto min-w-[200px]">
            <select
              value={selectedClassFilter}
              onChange={(e) => setSelectedClassFilter(e.target.value)}
              className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-indigo-500 transition-colors cursor-pointer appearance-none"
            >
              <option value="">All Classes</option>
              {uniqueClasses.map(className => (
                <option key={className} value={className}>{className}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="overflow-auto flex-1">
          <table className="w-full text-left text-sm text-slate-600 relative border-collapse">
            <thead className="bg-indigo-50/95 backdrop-blur text-indigo-800 font-semibold border-b border-indigo-100 sticky top-0 z-10 shadow-sm">
              <tr>
                <th className="px-6 py-4">Student</th>
                <th className="px-6 py-4">Class</th>
                <th className="px-6 py-4">Exam</th>
                <th className="px-6 py-4 text-center">Score</th>
                <th className="px-6 py-4 text-center">Grade</th>
                <th className="px-6 py-4 text-center">Status</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-indigo-50">
              {filteredResults.map((result, idx) => (
                <tr key={result.id} className={cn(
                  "transition-colors hover:bg-indigo-50/50",
                  idx % 2 === 0 ? "bg-white" : "bg-slate-50/50"
                )}>
                  <td className="px-6 py-4">
                    <div className="font-semibold text-slate-800">{result.studentName}</div>
                    <div className="text-xs text-slate-500">ID: {result.studentId}</div>
                  </td>
                  <td className="px-6 py-4">{result.className}</td>
                  <td className="px-6 py-4">{result.examName}</td>
                  <td className="px-6 py-4 text-center">
                    <div className="font-bold text-slate-800">{result.percentage}%</div>
                    <div className="text-xs text-slate-500">{result.totalMarks} marks</div>
                  </td>
                  <td className="px-6 py-4 text-center">
                    <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-indigo-50 text-indigo-700">
                      {result.grade}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-center">
                    {result.status === 'Pass' ? (
                      <span className="inline-flex items-center gap-1 text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-full text-xs font-bold">
                        <CheckCircle2 className="w-3.5 h-3.5" /> Pass
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-rose-600 bg-rose-50 px-2.5 py-1 rounded-full text-xs font-bold">
                        <XCircle className="w-3.5 h-3.5" /> Fail
                      </span>
                    )}
                  </td>
                  <td className="px-6 py-4 text-right whitespace-nowrap">
                    <button
                      onClick={() => {
                        const printWindow = window.open('', '_blank');
                        if (printWindow) {
                          printWindow.document.write(`
                            <html>
                              <head>
                                <title>Exam Result - ${result.studentName}</title>
                              </head>
                              <body>
                                <div style="padding: 40px; font-family: sans-serif; max-width: 800px; margin: 0 auto;">
                                  <h1 style="text-align: center; color: #1e293b; margin-bottom: 5px;">Student Exam Result</h1>
                                  <h3 style="text-align: center; color: #475569; margin-top: 0; margin-bottom: 30px;">${result.examName}</h3>
                                  
                                  <table style="width: 100%; margin-bottom: 20px; border-collapse: collapse;">
                                    <tr>
                                      <td style="padding: 10px; border: 1px solid #cbd5e1; font-weight: bold; background: #f8fafc;">Student Name</td>
                                      <td style="padding: 10px; border: 1px solid #cbd5e1;">${result.studentName}</td>
                                      <td style="padding: 10px; border: 1px solid #cbd5e1; font-weight: bold; background: #f8fafc;">Admission No</td>
                                      <td style="padding: 10px; border: 1px solid #cbd5e1;">${result.studentId}</td>
                                    </tr>
                                    <tr>
                                      <td style="padding: 10px; border: 1px solid #cbd5e1; font-weight: bold; background: #f8fafc;">Class</td>
                                      <td style="padding: 10px; border: 1px solid #cbd5e1;">${result.className}</td>
                                      <td style="padding: 10px; border: 1px solid #cbd5e1; font-weight: bold; background: #f8fafc;">Roll No</td>
                                      <td style="padding: 10px; border: 1px solid #cbd5e1;">${result.roll || '-'}</td>
                                    </tr>
                                  </table>

                                  <h4 style="margin-bottom: 10px; color: #1e293b;">Subject Marks</h4>
                                  <table style="width: 100%; border-collapse: collapse; margin-bottom: 20px;">
                                    <thead>
                                      <tr style="background: #f1f5f9;">
                                        <th style="padding: 10px; border: 1px solid #cbd5e1; text-align: left;">Subject</th>
                                        <th style="padding: 10px; border: 1px solid #cbd5e1; text-align: center;">Max Marks</th>
                                        <th style="padding: 10px; border: 1px solid #cbd5e1; text-align: center;">Obtained Marks</th>
                                      </tr>
                                    </thead>
                                    <tbody>
                                      ${result.subjects.map((s: any) => `
                                        <tr>
                                          <td style="padding: 10px; border: 1px solid #cbd5e1;">${s.subject}</td>
                                          <td style="padding: 10px; border: 1px solid #cbd5e1; text-align: center;">${s.maxMarks}</td>
                                          <td style="padding: 10px; border: 1px solid #cbd5e1; text-align: center;">${s.obtainedMarks}</td>
                                        </tr>
                                      `).join('')}
                                    </tbody>
                                  </table>

                                  <table style="width: 100%; border-collapse: collapse;">
                                    <tr>
                                      <td style="padding: 10px; border: 1px solid #cbd5e1; font-weight: bold; background: #f8fafc;">Total Marks</td>
                                      <td style="padding: 10px; border: 1px solid #cbd5e1;">${result.totalMarks}</td>
                                      <td style="padding: 10px; border: 1px solid #cbd5e1; font-weight: bold; background: #f8fafc;">Percentage</td>
                                      <td style="padding: 10px; border: 1px solid #cbd5e1;">${result.percentage}%</td>
                                    </tr>
                                    <tr>
                                      <td style="padding: 10px; border: 1px solid #cbd5e1; font-weight: bold; background: #f8fafc;">Grade</td>
                                      <td style="padding: 10px; border: 1px solid #cbd5e1; color: ${result.status === 'Pass' ? '#16a34a' : '#dc2626'}">${result.grade}</td>
                                      <td style="padding: 10px; border: 1px solid #cbd5e1; font-weight: bold; background: #f8fafc;">Status</td>
                                      <td style="padding: 10px; border: 1px solid #cbd5e1; font-weight: bold; color: ${result.status === 'Pass' ? '#16a34a' : '#dc2626'}">${result.status}</td>
                                    </tr>
                                  </table>
                                  ${result.remarks ? `<p style="margin-top: 20px; padding: 15px; background: #f8fafc; border-left: 4px solid #94a3b8;"><strong>Remarks:</strong> ${result.remarks}</p>` : ''}
                                </div>
                              </body>
                            </html>
                          `);
                          printWindow.document.close();
                          printWindow.focus();
                          printWindow.print();
                        }
                      }}
                      className="text-emerald-600 hover:text-emerald-800 p-2"
                      title="Download Result"
                    >
                      <Download className="w-4 h-4" />
                    </button>
                    {!isStudentOrParent && (
                      <>
                        <button
                          onClick={() => handleOpenModal(result)}
                          className="text-indigo-600 hover:text-indigo-800 p-2"
                          title="Edit Result"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(result.id)}
                          className="text-rose-600 hover:text-rose-800 p-2"
                          title="Delete Result"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </>
                    )}
                  </td>
                </tr>
              ))}
              {filteredResults.length === 0 && (
                <tr>
                  <td colSpan={7} className="px-6 py-8 text-center text-slate-500">
                    No results found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add/Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-2xl shadow-xl w-full max-w-3xl overflow-hidden flex flex-col max-h-[90vh]"
          >
            <div className="p-6 border-b border-slate-200">
              <h2 className="text-xl font-bold text-slate-800">
                {editingResult ? 'Edit Result' : 'Add New Result'}
              </h2>
            </div>
            
            <div className="p-6 overflow-y-auto space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1">Student Name</label>
                  <input
                    type="text"
                    value={formData.studentName}
                    onChange={(e) => setFormData({ ...formData, studentName: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:border-indigo-500"
                    placeholder="e.g., John Doe"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1">Admission Number</label>
                  <input
                    type="text"
                    value={formData.studentId}
                    onChange={(e) => setFormData({ ...formData, studentId: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:border-indigo-500"
                    placeholder="e.g., ADM2023001"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1">Class & Section</label>
                  <input
                    type="text"
                    value={formData.className}
                    onChange={(e) => setFormData({ ...formData, className: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:border-indigo-500"
                    placeholder="e.g., Grade 10 - A"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1">Roll Number</label>
                  <input
                    type="text"
                    value={formData.roll}
                    onChange={(e) => setFormData({ ...formData, roll: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:border-indigo-500"
                    placeholder="e.g., 21"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1">Exam Name</label>
                  <input
                    type="text"
                    value={formData.examName}
                    onChange={(e) => setFormData({ ...formData, examName: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:border-indigo-500"
                    placeholder="e.g., Final Examination 2023"
                  />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="block text-sm font-semibold text-slate-700">Subjects & Marks</label>
                  <button onClick={addSubject} className="text-xs bg-indigo-50 text-indigo-600 px-2 py-1 rounded hover:bg-indigo-100 font-bold">
                    + Add Subject
                  </button>
                </div>
                <div className="space-y-3">
                  {formData.subjects.map((sub, idx) => (
                    <div key={idx} className="flex items-center gap-3 bg-slate-50 p-3 rounded-lg border border-slate-200">
                      <div className="flex-1">
                        <input
                          type="text"
                          value={sub.subject}
                          onChange={(e) => handleSubjectChange(idx, 'subject', e.target.value)}
                          className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:border-indigo-500"
                          placeholder="Subject Name"
                        />
                      </div>
                      <div className="w-24">
                        <input
                          type="number"
                          value={sub.maxMarks}
                          onChange={(e) => handleSubjectChange(idx, 'maxMarks', parseInt(e.target.value) || 0)}
                          className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:border-indigo-500"
                          placeholder="Max"
                        />
                      </div>
                      <div className="w-24">
                        <input
                          type="number"
                          value={sub.obtainedMarks}
                          onChange={(e) => handleSubjectChange(idx, 'obtainedMarks', parseInt(e.target.value) || 0)}
                          className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:border-indigo-500"
                          placeholder="Obtained"
                        />
                      </div>
                      <button onClick={() => removeSubject(idx)} className="text-rose-500 hover:text-rose-700">
                        <XCircle className="w-5 h-5" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1">Remarks</label>
                <textarea
                  value={formData.remarks}
                  onChange={(e) => setFormData({ ...formData, remarks: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:border-indigo-500"
                  placeholder="e.g., Excellent performance"
                  rows={2}
                />
              </div>
            </div>

            <div className="p-6 border-t border-slate-200 flex justify-end gap-3 bg-slate-50">
              <button
                onClick={handleCloseModal}
                className="px-4 py-2 text-slate-600 font-semibold hover:bg-slate-200 rounded-xl transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                className="px-6 py-2 bg-indigo-600 text-white font-semibold rounded-xl hover:bg-indigo-700 transition-colors"
              >
                Save Result
              </button>
            </div>

          </motion.div>
        </div>
      )}

      {/* Bulk Import Modal */}
      {showBulkModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-2xl shadow-xl w-full max-w-[95vw] overflow-hidden flex flex-col h-[90vh]"
          >
            <div className="p-6 border-b border-slate-200">
              <h2 className="text-xl font-bold text-slate-800">Bulk Import from Excel</h2>
              <p className="text-sm text-slate-500 mt-1">Paste tabular data directly from Excel or type in the grid.</p>
            </div>
            
            <div className="p-6 overflow-y-auto flex-1 flex flex-col">
              <div className="mb-4 bg-indigo-50 border border-indigo-100 p-4 rounded-xl text-sm text-indigo-800">
                <strong>Required Columns:</strong> Student Name, Admission No, Class, Exam Name.<br/>
                <strong>Subject Columns:</strong> Use format <code>Subject [MaxMarks]</code> (e.g., <code>Math [100]</code>) in the first row. If omit max marks, defaults to 100.<br/>
                <strong>Optional Column:</strong> Remarks<br/>
                <em>Instructions:</em> You can edit cells directly or paste data spanning multiple rows and columns from Excel. First row is the Header.
              </div>

              <div className="mb-4 border border-slate-300 overflow-auto resize-y min-h-[300px] h-[50vh] relative shadow-inner bg-slate-50">
                <table className="w-full border-collapse">
                  <thead className="sticky top-0 z-30 shadow-md">
                    <tr>
                      <th className="bg-indigo-100/95 backdrop-blur text-indigo-400 text-xs w-10 text-center border-b border-r border-indigo-200 select-none">
                        #
                      </th>
                      {gridData[0].map((cell, ci) => (
                        <th key={`header-${ci}`} className="bg-indigo-100/95 backdrop-blur border-b border-r border-indigo-200 min-w-[150px] relative group p-0 text-left">
                          <input 
                            className="w-full px-3 py-2.5 outline-none focus:ring-2 focus:ring-indigo-500/50 focus:relative focus:z-10 transition-shadow m-0 border-0 font-bold bg-transparent text-indigo-900 pr-14 placeholder-indigo-300"
                            value={cell}
                            onChange={(e) => updateGridCell(0, ci, e.target.value)}
                            onPaste={(e) => handleGridPaste(e, 0, ci)}
                            placeholder="Header"
                          />
                          
                          {cell?.toLowerCase().trim() === 'class' && (
                            <div className="absolute right-8 top-1/2 -translate-y-1/2 flex items-center justify-center w-6 h-6 bg-indigo-200/50 rounded hover:bg-indigo-300/50 transition-colors cursor-pointer text-indigo-700" title="Set Class for All Rows">
                              <select 
                                className="absolute inset-0 opacity-0 cursor-pointer"
                                onChange={(e) => {
                                  const val = e.target.value;
                                  if (val) {
                                    const newGrid = [...gridData];
                                    for(let i=1; i<newGrid.length; i++) {
                                      newGrid[i][ci] = val;
                                    }
                                    setGridData(newGrid);
                                  }
                                  e.target.value = '';
                                }}
                              >
                                <option value="">Fill Column...</option>
                                {['Nursery', 'LKG', 'UKG', 'Class 1', 'Class 2', 'Class 3', 'Class 4', 'Class 5', 'Class 6', 'Class 7', 'Class 8', 'Class 9', 'Class 10', 'Class 11', 'Class 12'].map(c => <option key={c} value={c}>{c}</option>)}
                              </select>
                              <ChevronDown className="w-4 h-4 pointer-events-none" />
                            </div>
                          )}

                          {cell?.toLowerCase().trim() === 'exam name' && (
                            <div className="absolute right-8 top-1/2 -translate-y-1/2 flex items-center justify-center w-6 h-6 bg-indigo-200/50 rounded hover:bg-indigo-300/50 transition-colors cursor-pointer text-indigo-700" title="Set Exam for All Rows">
                              <select 
                                className="absolute inset-0 opacity-0 cursor-pointer"
                                onChange={(e) => {
                                  const val = e.target.value;
                                  if (val) {
                                    const newGrid = [...gridData];
                                    for(let i=1; i<newGrid.length; i++) {
                                      newGrid[i][ci] = val;
                                    }
                                    setGridData(newGrid);
                                  }
                                  e.target.value = '';
                                }}
                              >
                                <option value="">Fill Column...</option>
                                {['Unit Test 1', 'Unit Test 2', 'Unit Test 3', 'Unit Test 4', 'Half Yearly Examination', 'Annual Examination', 'Pre-Board Examination', 'Board Examination'].map(ex => <option key={ex} value={ex}>{ex}</option>)}
                              </select>
                              <ChevronDown className="w-4 h-4 pointer-events-none" />
                            </div>
                          )}

                          {gridData[0].length > 1 && (
                            <button
                              onClick={() => {
                                if (window.confirm(`Delete column "${cell || ci + 1}"?`)) {
                                  const newGrid = gridData.map(r => {
                                    const newRow = [...r];
                                    newRow.splice(ci, 1);
                                    return newRow;
                                  });
                                  setGridData(newGrid);
                                }
                              }}
                              className="absolute right-1 top-1/2 -translate-y-1/2 hidden group-hover:flex items-center justify-center text-rose-500 bg-white shadow-sm rounded-md p-1 hover:bg-rose-50 z-20"
                              title="Delete Column"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          )}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {gridData.slice(1).map((row, riOffset) => {
                      const ri = riOffset + 1;
                      return (
                      <tr key={ri}>
                        <td className={cn(
                          "text-xs w-10 text-center border-b border-r border-slate-300 select-none relative group h-full",
                          ri % 2 === 0 ? "bg-slate-100 text-slate-500" : "bg-slate-50 text-slate-400"
                        )}>
                          <span className="group-hover:opacity-0">{ri}</span>
                          {gridData.length > 2 && (
                            <button
                              onClick={() => {
                                const newGrid = [...gridData];
                                newGrid.splice(ri, 1);
                                setGridData(newGrid);
                              }}
                              className="absolute inset-x-1 top-1/2 -translate-y-1/2 hidden group-hover:flex items-center justify-center text-rose-500 bg-rose-50 rounded p-1 hover:bg-rose-100 mx-auto"
                              title="Delete Row"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          )}
                        </td>
                        {row.map((cell, ci) => (
                          <td key={`${ri}-${ci}`} className="border-b border-r border-slate-300 min-w-[150px] relative group p-0">
                            {gridData[0][ci]?.toLowerCase().trim() === 'class' ? (
                              <select
                                 className={cn(
                                   "w-full px-3 py-2.5 outline-none focus:ring-2 focus:ring-indigo-500/50 focus:relative focus:z-10 transition-colors m-0 border-0 cursor-pointer appearance-none",
                                   ri % 2 === 0 ? "bg-blue-50/50 text-slate-700" : "bg-white text-slate-700"
                                 )}
                                 value={cell}
                                 onChange={(e) => updateGridCell(ri, ci, e.target.value)}
                                 onPaste={(e) => handleGridPaste(e, ri, ci)}
                               >
                                 <option value="" disabled>Select Class</option>
                                 {['Nursery', 'LKG', 'UKG', 'Class 1', 'Class 2', 'Class 3', 'Class 4', 'Class 5', 'Class 6', 'Class 7', 'Class 8', 'Class 9', 'Class 10', 'Class 11', 'Class 12'].map(c => <option key={c} value={c}>{c}</option>)}
                                 {!['', 'Nursery', 'LKG', 'UKG', 'Class 1', 'Class 2', 'Class 3', 'Class 4', 'Class 5', 'Class 6', 'Class 7', 'Class 8', 'Class 9', 'Class 10', 'Class 11', 'Class 12'].includes(cell) && cell && (
                                   <option value={cell}>{cell}</option>
                                 )}
                               </select>
                             ) : gridData[0][ci]?.toLowerCase().trim() === 'exam name' ? (
                              <select
                                className={cn(
                                  "w-full px-3 py-2.5 outline-none focus:ring-2 focus:ring-indigo-500/50 focus:relative focus:z-10 transition-colors m-0 border-0 cursor-pointer appearance-none",
                                  ri % 2 === 0 ? "bg-blue-50/50 text-slate-700" : "bg-white text-slate-700"
                                )}
                                value={cell}
                                onChange={(e) => updateGridCell(ri, ci, e.target.value)}
                                onPaste={(e) => handleGridPaste(e, ri, ci)}
                              >
                                <option value="" disabled>Select Exam</option>
                                {['Unit Test 1', 'Unit Test 2', 'Unit Test 3', 'Unit Test 4', 'Half Yearly Examination', 'Annual Examination', 'Pre-Board Examination', 'Board Examination'].map(ex => <option key={ex} value={ex}>{ex}</option>)}
                                {!['', 'Unit Test 1', 'Unit Test 2', 'Unit Test 3', 'Unit Test 4', 'Half Yearly Examination', 'Annual Examination', 'Pre-Board Examination', 'Board Examination'].includes(cell) && cell && (
                                  <option value={cell}>{cell}</option>
                                )}
                              </select>
                             ) : (
                              <input 
                                className={cn(
                                  "w-full px-3 py-2.5 outline-none focus:ring-2 focus:ring-indigo-500/50 focus:relative focus:z-10 transition-colors m-0 border-0",
                                  ri % 2 === 0 ? "bg-blue-50/50 text-slate-700" : "bg-white text-slate-700"
                                )}
                                value={cell}
                                onChange={(e) => updateGridCell(ri, ci, e.target.value)}
                                onPaste={(e) => handleGridPaste(e, ri, ci)}
                              />
                            )}
                          </td>
                        ))}
                      </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              <div className="flex items-center gap-2 mb-4">
                <button
                  onClick={() => setGridData([...gridData, Array(gridData[0].length).fill('')])}
                  className="px-3 py-1.5 text-sm font-medium border border-slate-200 text-slate-600 rounded-lg hover:bg-slate-50"
                >
                  + Add Row
                </button>
                <button
                  onClick={() => setGridData(gridData.map(r => [...r, '']))}
                  className="px-3 py-1.5 text-sm font-medium border border-slate-200 text-slate-600 rounded-lg hover:bg-slate-50"
                >
                  + Add Column
                </button>
                <div className="flex-1"></div>
                <button
                  onClick={() => {
                    if(window.confirm('Clear all data?')) setGridData(initialGrid());
                  }}
                  className="px-3 py-1.5 text-sm font-medium text-rose-600 hover:bg-rose-50 rounded-lg"
                >
                  Clear Grid
                </button>
              </div>

              {parseError && (
                <div className="p-4 bg-rose-50 text-rose-600 rounded-xl text-sm font-medium border border-rose-200 mb-4 flex items-center gap-2">
                  <XCircle className="w-5 h-5 flex-shrink-0" /> {parseError}
                </div>
              )}

              {parsedPreview.length > 0 && (
                <div>
                  <h3 className="font-bold text-slate-700 mb-3 flex items-center gap-2">
                    <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                    Preview ({parsedPreview.length} valid records)
                  </h3>
                  <div className="overflow-auto border border-slate-200 rounded-xl max-h-[400px] relative">
                    <table className="w-full text-left text-sm text-slate-600 whitespace-nowrap border-collapse">
                      <thead className="bg-slate-50/95 backdrop-blur text-slate-500 font-semibold border-b border-slate-200 sticky top-0 z-10 shadow-sm">
                        <tr>
                          <th className="px-4 py-3">Student Name</th>
                          <th className="px-4 py-3">Adm No</th>
                          <th className="px-4 py-3">Class & Exam</th>
                          <th className="px-4 py-3">Subjects</th>
                          <th className="px-4 py-3 text-center">Score %</th>
                          <th className="px-4 py-3 text-center">Grade/Status</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {parsedPreview.map((preview, idx) => (
                          <tr key={idx} className="hover:bg-slate-50">
                            <td className="px-4 py-3 font-semibold text-slate-800">{preview.studentName}</td>
                            <td className="px-4 py-3 text-xs">{preview.studentId}</td>
                            <td className="px-4 py-3 text-xs">{preview.className}<br/><span className="text-slate-400">{preview.examName}</span></td>
                            <td className="px-4 py-3 text-xs max-w-xs truncate" title={preview.subjects.map(s => `${s.subject}: ${s.obtainedMarks}/${s.maxMarks}`).join(', ')}>
                              {preview.subjects.length} subjects
                            </td>
                            <td className="px-4 py-3 text-center font-bold text-slate-800">{preview.percentage}%</td>
                            <td className="px-4 py-3 text-center">
                              <span className={`px-2 py-0.5 rounded text-xs font-bold ${preview.status === 'Pass' ? 'bg-emerald-100 text-emerald-700' : 'bg-rose-100 text-rose-700'}`}>
                                {preview.grade} • {preview.status}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>

            <div className="p-6 border-t border-slate-200 flex justify-end gap-3 bg-slate-50">
              <button
                onClick={() => { setShowBulkModal(false); setGridData(initialGrid()); }}
                className="px-4 py-2 text-slate-600 font-semibold hover:bg-slate-200 rounded-xl transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleBulkImport}
                disabled={parsedPreview.length === 0}
                className="px-6 py-2 bg-emerald-600 text-white font-semibold rounded-xl hover:bg-emerald-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Import Data
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}
