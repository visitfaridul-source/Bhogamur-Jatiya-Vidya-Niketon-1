import React, { useState } from 'react';
import { Plus, Trash2, Edit2, Link as LinkIcon, FileText, Video, Eye, Settings, BookOpen, Download } from 'lucide-react';
import { useSchool, Course, CourseMaterial } from '@/context/SchoolContext';
import { useAuth } from '@/context/AuthContext';

export default function ManageCourses() {
  const { user } = useAuth();
  const isStudentOrParent = user?.role === 'Student' || user?.role === 'Parent';
  const { courses, setCourses } = useSchool();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isMaterialModalOpen, setIsMaterialModalOpen] = useState(false);
  
  const [editingCourseId, setEditingCourseId] = useState<string | null>(null);
  const [formData, setFormData] = useState<Partial<Course>>({
    title: '',
    description: '',
    class: 'Class 10',
    subject: '',
    thumbnailUrl: ''
  });

  const [activeCourseId, setActiveCourseId] = useState<string | null>(null);
  const [materialFormData, setMaterialFormData] = useState<Partial<CourseMaterial>>({
    title: '',
    type: 'PDF',
    url: '',
    size: ''
  });

  const handleSaveCourse = (e: React.FormEvent) => {
    e.preventDefault();
    const titleVal = (formData.title || 'UNKNOWN COURSE').trim().toUpperCase();
    const descriptionVal = (formData.description || '').trim().toUpperCase();
    const classVal = (formData.class || 'CLASS 10').trim().toUpperCase();
    const subjectVal = (formData.subject || 'GENERAL').trim().toUpperCase();
    const thumbnailVal = (formData.thumbnailUrl || '').trim();

    const finalizedData = {
      ...formData,
      title: titleVal,
      description: descriptionVal,
      class: classVal,
      subject: subjectVal,
      thumbnailUrl: thumbnailVal
    };

    if (editingCourseId) {
      setCourses(courses.map(c => c.id === editingCourseId ? { ...c, ...finalizedData as any } : c));
    } else {
      const newCourse: Course = {
        id: `CRS-${Date.now()}`,
        materials: [],
        ...(finalizedData as any)
      };
      setCourses([...courses, newCourse]);
    }
    setIsModalOpen(false);
    setFormData({ title: '', description: '', class: 'Grade 10', subject: '', thumbnailUrl: '' });
    setEditingCourseId(null);
  };

  const handleEditCourse = (course: Course) => {
    setFormData({
      title: course.title,
      description: course.description,
      class: course.class,
      subject: course.subject,
      thumbnailUrl: course.thumbnailUrl
    });
    setEditingCourseId(course.id);
    setIsModalOpen(true);
  };

  const handleDeleteCourse = (id: string) => {
    if (confirm('Are you sure you want to delete this course?')) {
      setCourses(courses.filter(c => c.id !== id));
    }
  };

  const handleOpenMaterialModal = (courseId: string) => {
    setActiveCourseId(courseId);
    setMaterialFormData({ title: '', type: 'PDF', url: '', size: '' });
    setIsMaterialModalOpen(true);
  };

  const handleSaveMaterial = (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeCourseId) return;

    const titleVal = (materialFormData.title || 'STUDY MATERIAL').trim().toUpperCase();
    const typeVal = (materialFormData.type || 'PDF').trim().toUpperCase();
    const urlVal = (materialFormData.url || '').trim();
    const sizeVal = (materialFormData.size || '0 MB').trim().toUpperCase();

    const finalizedMaterial = {
      ...materialFormData,
      title: titleVal,
      type: typeVal,
      url: urlVal,
      size: sizeVal
    };

    const newMaterial: CourseMaterial = {
      id: `MAT-${Date.now()}`,
      uploadDate: new Date().toISOString().split('T')[0],
      ...(finalizedMaterial as any)
    };

    setCourses(courses.map(c => {
      if (c.id === activeCourseId) {
        return { ...c, materials: [...c.materials, newMaterial] };
      }
      return c;
    }));

    setIsMaterialModalOpen(false);
  };

  const handleDeleteMaterial = (courseId: string, materialId: string) => {
    if (confirm('Are you sure you want to delete this material?')) {
      setCourses(courses.map(c => {
        if (c.id === courseId) {
          return { ...c, materials: c.materials.filter(m => m.id !== materialId) };
        }
        return c;
      }));
    }
  };

  const getIconForType = (type: string) => {
    switch (type) {
      case 'PDF': return <FileText className="w-4 h-4 text-red-500" />;
      case 'Video': return <Video className="w-4 h-4 text-purple-500" />;
      case 'Link': return <LinkIcon className="w-4 h-4 text-blue-500" />;
      case 'Document': return <FileText className="w-4 h-4 text-blue-500" />;
      default: return <FileText className="w-4 h-4 text-slate-500" />;
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div className="flex justify-between items-center bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-blue-50 text-blue-600 rounded-xl">
            <BookOpen className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-slate-800">{isStudentOrParent ? 'My Courses' : 'Manage Courses'}</h1>
            <p className="text-slate-500 text-sm">View courses and download study materials</p>
          </div>
        </div>
        
        {!isStudentOrParent && (
          <button 
            onClick={() => {
              setFormData({ title: '', description: '', class: 'Class 10', subject: '', thumbnailUrl: '' });
              setEditingCourseId(null);
              setIsModalOpen(true);
            }}
            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-xl font-medium transition-all shadow-lg shadow-blue-600/20"
          >
            <Plus className="w-5 h-5" /> Add Course
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {courses.map(course => (
          <div key={course.id} className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden flex flex-col">
            <div className="p-5 border-b border-slate-100 flex justify-between items-start">
              <div className="flex gap-4 items-start">
                {course.thumbnailUrl ? (
                  <img src={course.thumbnailUrl} alt="" className="w-16 h-16 rounded-xl object-cover" />
                ) : (
                  <div className="w-16 h-16 rounded-xl bg-slate-100 flex items-center justify-center text-slate-400 shrink-0">
                    <BookOpen className="w-8 h-8" />
                  </div>
                )}
                <div>
                  <h3 className="text-lg font-bold text-slate-800 line-clamp-1">{course.title}</h3>
                  <div className="flex gap-2 mt-1">
                    <span className="text-xs font-semibold px-2 py-1 bg-indigo-50 text-indigo-700 rounded-md">{course.class}</span>
                    <span className="text-xs font-semibold px-2 py-1 bg-emerald-50 text-emerald-700 rounded-md">{course.subject}</span>
                  </div>
                </div>
              </div>
              {!isStudentOrParent && (
                <div className="flex gap-1 shrink-0">
                  <button onClick={() => handleEditCourse(course)} className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors">
                    <Edit2 className="w-4 h-4" />
                  </button>
                  <button onClick={() => handleDeleteCourse(course.id)} className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              )}
            </div>
            
            <div className="p-5 flex-1 bg-slate-50/50">
              <div className="flex justify-between items-center mb-3">
                <h4 className="font-semibold text-slate-700 text-sm">Materials ({course.materials.length})</h4>
                {!isStudentOrParent && (
                  <button 
                    onClick={() => handleOpenMaterialModal(course.id)}
                    className="text-xs font-bold text-blue-600 hover:text-blue-800 bg-blue-50 hover:bg-blue-100 px-3 py-1.5 rounded-lg transition-colors flex items-center gap-1"
                  >
                    <Plus className="w-3 h-3" /> Add Material
                  </button>
                )}
              </div>
              
              <div className="space-y-2 max-h-[200px] overflow-y-auto pr-2 custom-scrollbar">
                {course.materials.length === 0 ? (
                  <div className="text-center py-4 text-slate-400 text-sm italic">No materials added yet</div>
                ) : (
                  course.materials.map(mat => (
                    <div key={mat.id} className="flex items-center justify-between bg-white border border-slate-200 p-2.5 rounded-xl shadow-sm">
                      <div className="flex items-center gap-3 overflow-hidden">
                        <div className="w-8 h-8 rounded-lg bg-slate-50 flex items-center justify-center shrink-0">
                          {getIconForType(mat.type)}
                        </div>
                        <div className="min-w-0">
                          <p className="text-sm font-medium text-slate-700 truncate">{mat.title}</p>
                          <p className="text-[10px] text-slate-400">{mat.type} • {mat.size}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-1 shrink-0">
                        <a 
                          href={mat.url}
                          target="_blank"
                          rel="noreferrer"
                          className="p-1.5 text-slate-400 hover:text-emerald-500 hover:bg-emerald-50 rounded-md transition-colors"
                          title="Download / View"
                        >
                          <Download className="w-3.5 h-3.5" />
                        </a>
                        {!isStudentOrParent && (
                          <button 
                            onClick={() => handleDeleteMaterial(course.id, mat.id)}
                            className="p-1.5 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-md transition-colors"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Course Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl">
            <h2 className="text-2xl font-bold text-slate-800 mb-6">
              {editingCourseId ? 'Edit Course' : 'Create Course'}
            </h2>
            <form onSubmit={handleSaveCourse} className="space-y-4">
              <div className="space-y-1">
                <label className="text-sm font-semibold text-slate-700">Course Title</label>
                <input 
                  type="text" 
                  value={formData.title}
                  onChange={e => setFormData({...formData, title: e.target.value})}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-500 outline-none uppercase"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-sm font-semibold text-slate-700">Class</label>
                  <select 
                    value={formData.class}
                    onChange={e => setFormData({...formData, class: e.target.value})}
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-500 outline-none uppercase"
                  >
                    {['Nursery', 'LKG', 'UKG', 'Class 1', 'Class 2', 'Class 3', 'Class 4', 'Class 5', 'Class 6', 'Class 7', 'Class 8', 'Class 9', 'Class 10', 'Class 11', 'Class 12'].map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="text-sm font-semibold text-slate-700">Subject</label>
                  <input 
                    type="text" 
                    value={formData.subject}
                    onChange={e => setFormData({...formData, subject: e.target.value})}
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-500 outline-none uppercase"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-sm font-semibold text-slate-700">Description</label>
                <textarea 
                  value={formData.description}
                  onChange={e => setFormData({...formData, description: e.target.value})}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-500 outline-none min-h-[80px] resize-none uppercase"
                />
              </div>

              <div className="space-y-1">
                <label className="text-sm font-semibold text-slate-700">Thumbnail URL (Optional)</label>
                <input 
                  type="url" 
                  value={formData.thumbnailUrl}
                  onChange={e => setFormData({...formData, thumbnailUrl: e.target.value})}
                  placeholder="https://images.unsplash.com/..."
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-500 outline-none text-sm"
                />
              </div>

              <div className="flex gap-3 pt-4">
                <button 
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="flex-1 px-4 py-2.5 rounded-xl font-bold text-slate-600 bg-slate-100 hover:bg-slate-200 transition"
                >
                  Cancel
                </button>
                <button 
                  type="submit"
                  className="flex-1 px-4 py-2.5 rounded-xl font-bold text-white bg-blue-600 hover:bg-blue-700 transition shadow-lg shadow-blue-500/30"
                >
                  Save Course
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Material Modal */}
      {isMaterialModalOpen && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-xl shadow-blue-900/20">
            <h2 className="text-2xl font-bold text-slate-800 mb-6">Add Material</h2>
            <form onSubmit={handleSaveMaterial} className="space-y-4">
              <div className="space-y-1">
                <label className="text-sm font-semibold text-slate-700">Title</label>
                <input 
                  type="text" 
                  value={materialFormData.title}
                  onChange={e => setMaterialFormData({...materialFormData, title: e.target.value})}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-500 outline-none uppercase"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-sm font-semibold text-slate-700">Type</label>
                  <select 
                    value={materialFormData.type}
                    onChange={e => setMaterialFormData({...materialFormData, type: e.target.value as any})}
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-500 outline-none uppercase"
                  >
                    <option value="PDF">PDF</option>
                    <option value="Video">Video</option>
                    <option value="Document">Document</option>
                    <option value="Link">Web Link</option>
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="text-sm font-semibold text-slate-700">Size (Optional)</label>
                  <input 
                    type="text" 
                    placeholder="e.g. 2.5 MB"
                    value={materialFormData.size}
                    onChange={e => setMaterialFormData({...materialFormData, size: e.target.value})}
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-500 outline-none uppercase"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-sm font-semibold text-slate-700">URL / Link</label>
                <input 
                  type="url" 
                  value={materialFormData.url}
                  onChange={e => setMaterialFormData({...materialFormData, url: e.target.value})}
                  placeholder="https://..."
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-500 outline-none text-sm"
                />
              </div>

              <div className="flex gap-3 pt-4">
                <button 
                  type="button"
                  onClick={() => setIsMaterialModalOpen(false)}
                  className="flex-1 px-4 py-2.5 rounded-xl font-bold text-slate-600 bg-slate-100 hover:bg-slate-200 transition"
                >
                  Cancel
                </button>
                <button 
                  type="submit"
                  className="flex-1 px-4 py-2.5 rounded-xl font-bold text-white bg-blue-600 hover:bg-blue-700 transition shadow-lg shadow-blue-500/30"
                >
                  Add Material
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
