import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Home, Download, BookOpen, FileText, Video, Link as LinkIcon, Filter, Search, ChevronRight } from 'lucide-react';
import { useSchool } from '@/context/SchoolContext';

export default function CoursesPage() {
  const navigate = useNavigate();
  const { courses } = useSchool();
  const [selectedClass, setSelectedClass] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState('');

  const classes = ['All', ...Array.from(new Set(courses.map(c => c.class)))];

  const filteredCourses = courses.filter(course => {
    const matchesClass = selectedClass === 'All' || course.class === selectedClass;
    const matchesSearch = course.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          course.subject.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesClass && matchesSearch;
  });

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
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <div className="bg-slate-900 text-white relative overflow-hidden">
        <div className="absolute inset-0 max-w-7xl mx-auto">
          <div className="absolute top-[-10%] right-[-5%] w-96 h-96 bg-blue-500/20 rounded-full blur-3xl mix-blend-screen opacity-50 hidden md:block"></div>
          <div className="absolute bottom-[-20%] left-[-10%] w-80 h-80 bg-purple-500/20 rounded-full blur-3xl mix-blend-screen opacity-50 hidden md:block"></div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 relative z-10 text-center">
          <button 
            onClick={() => navigate('/')} 
            className="inline-flex items-center gap-2 text-slate-400 hover:text-white transition-colors text-sm font-medium mb-6 bg-white/5 px-4 py-2 rounded-full border border-white/10 backdrop-blur-sm"
          >
            <Home className="w-4 h-4" /> Back to Home
          </button>
          
          <h1 className="text-4xl md:text-5xl font-bold font-serif mb-4">Download Courses</h1>
          <p className="text-lg text-slate-300 max-w-2xl mx-auto">Access study materials, video lectures, and assignments organized by class and subject.</p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Filters */}
        <div className="flex flex-col md:flex-row gap-4 mb-10 items-center justify-between bg-white p-4 rounded-2xl shadow-sm border border-slate-100">
          <div className="flex items-center gap-2 w-full md:w-auto overflow-x-auto pb-2 md:pb-0 scrollbar-hide">
            <Filter className="w-5 h-5 text-slate-400 shrink-0 ml-2 mr-1" />
            {classes.map(cls => (
              <button
                key={cls}
                onClick={() => setSelectedClass(cls)}
                className={`shrink-0 px-4 py-2 rounded-xl text-sm font-medium transition-all ${
                  selectedClass === cls 
                    ? 'bg-blue-600 text-white shadow-md shadow-blue-600/20' 
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {cls}
              </button>
            ))}
          </div>

          <div className="relative w-full md:w-80 shrink-0">
            <Search className="w-5 h-5 absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search subjects or topics..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-11 pr-4 py-3 bg-slate-100 border-none rounded-xl focus:ring-2 focus:ring-blue-500 font-medium text-slate-700 outline-none transition-all"
            />
          </div>
        </div>

        {/* Courses Grid */}
        {filteredCourses.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-3xl border border-slate-100 shadow-sm">
            <BookOpen className="w-16 h-16 mx-auto text-slate-300 mb-4" />
            <h3 className="text-xl font-bold text-slate-800 mb-2">No courses found</h3>
            <p className="text-slate-500">We couldn't find any courses matching your criteria.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredCourses.map(course => (
              <div key={course.id} className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden hover:shadow-xl transition-all duration-300 group">
                <div className="h-48 overflow-hidden relative">
                  <div className="absolute top-4 left-4 z-10">
                    <span className="bg-white/90 backdrop-blur text-blue-700 text-xs font-bold px-3 py-1.5 rounded-lg shadow-sm">
                      {course.class}
                    </span>
                  </div>
                  <div className="absolute top-4 right-4 z-10">
                    <span className="bg-slate-900/80 backdrop-blur text-white text-xs font-bold px-3 py-1.5 rounded-lg shadow-sm">
                      {course.subject}
                    </span>
                  </div>
                  <img 
                    src={course.thumbnailUrl || `https://images.unsplash.com/photo-1509228468518-180dd4864904?auto=format&fit=crop&q=80&w=600`}
                    alt={course.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                </div>
                
                <div className="p-6">
                  <h3 className="text-xl font-bold text-slate-800 mb-2 line-clamp-1 group-hover:text-blue-600 transition-colors">{course.title}</h3>
                  <p className="text-slate-500 text-sm mb-6 line-clamp-2 min-h-[40px]">{course.description}</p>
                  
                  <div className="space-y-3 mb-6">
                    <div className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Materials ({course.materials.length})</div>
                    {course.materials.map(material => (
                      <div key={material.id} className="flex justify-between items-center bg-slate-50 p-3 rounded-xl border border-slate-100 hover:border-blue-200 hover:bg-blue-50/50 transition-colors">
                        <div className="flex items-center gap-3 overflow-hidden">
                          <div className="shrink-0 bg-white p-2 rounded-lg shadow-sm flex items-center justify-center">
                            {getIconForType(material.type)}
                          </div>
                          <div className="min-w-0">
                            <div className="text-sm font-semibold text-slate-700 truncate">{material.title}</div>
                            <div className="text-xs text-slate-500">{material.size || material.type}</div>
                          </div>
                        </div>
                        <a 
                          href={material.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="shrink-0 w-8 h-8 flex items-center justify-center rounded-full bg-white text-blue-600 border border-blue-100 hover:bg-blue-600 hover:text-white transition-all shadow-sm"
                        >
                          {material.type === 'Link' ? <ChevronRight className="w-4 h-4" /> : <Download className="w-4 h-4" />}
                        </a>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
