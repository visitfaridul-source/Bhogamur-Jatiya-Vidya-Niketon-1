import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Home, Calendar, Clock, BookOpen, Users, MapPin } from 'lucide-react';
import { useWebsite } from '@/context/WebsiteContext';

export default function TimetablePage() {
  const navigate = useNavigate();
  const { settings } = useWebsite();
  
  const classes = settings.timetableClasses || ['Class 8', 'Class 9', 'Class 10', 'Class 11', 'Class 12'];
  const days = settings.timetableDays || ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  
  const [selectedClass, setSelectedClass] = useState(classes[0] || 'Class 10');
  const [selectedDay, setSelectedDay] = useState(days[0] || 'Monday');

  const timetableData = settings.timetableSlots?.filter(slot => slot.classId === selectedClass && slot.day === selectedDay) || [];

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="bg-slate-900 text-white relative overflow-hidden">
        <div className="absolute inset-0 max-w-7xl mx-auto">
          <div className="absolute top-[-10%] right-[-5%] w-96 h-96 bg-blue-500/20 rounded-full blur-3xl mix-blend-screen opacity-50"></div>
          <div className="absolute bottom-[-20%] left-[-10%] w-80 h-80 bg-purple-500/20 rounded-full blur-3xl mix-blend-screen opacity-50"></div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 relative z-10 text-center">
          <button 
            onClick={() => navigate('/')} 
            className="inline-flex items-center gap-2 text-slate-400 hover:text-white transition-colors text-sm font-medium mb-6 bg-white/5 px-4 py-2 rounded-full border border-white/10 backdrop-blur-sm"
          >
            <Home className="w-4 h-4" /> Back to Home
          </button>
          
          <h1 className="text-4xl md:text-5xl font-bold font-serif mb-4">School Timetable</h1>
          <p className="text-lg text-slate-300 max-w-2xl mx-auto">View the daily core academic schedule and extracurricular activities for all classes.</p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden">
          <div className="p-6 md:p-8 border-b border-slate-100 bg-slate-50/50">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
              <div className="flex items-center gap-4 overflow-x-auto pb-2 scrollbar-hide">
                {classes.map(cls => (
                  <button
                    key={cls}
                    onClick={() => setSelectedClass(cls)}
                    className={`whitespace-nowrap px-5 py-2.5 rounded-xl text-sm font-bold transition-all ${
                      selectedClass === cls 
                        ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/20' 
                        : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
                    }`}
                  >
                    {cls}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="p-6 md:p-8">
            <div className="flex flex-wrap gap-2 mb-8">
              {days.map(day => (
                 <button
                   key={day}
                   onClick={() => setSelectedDay(day)}
                   className={`px-6 py-2 rounded-full text-sm font-medium transition-all ${
                     selectedDay === day
                       ? 'bg-slate-800 text-white'
                       : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                   }`}
                 >
                   {day}
                 </button>
              ))}
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr>
                    <th className="py-4 px-6 bg-slate-50 text-xs font-bold uppercase tracking-wider text-slate-500 rounded-tl-xl border-b border-slate-100">Time</th>
                    <th className="py-4 px-6 bg-slate-50 text-xs font-bold uppercase tracking-wider text-slate-500 border-b border-slate-100">Subject</th>
                    <th className="py-4 px-6 bg-slate-50 text-xs font-bold uppercase tracking-wider text-slate-500 border-b border-slate-100">Type</th>
                    <th className="py-4 px-6 bg-slate-50 text-xs font-bold uppercase tracking-wider text-slate-500 border-b border-slate-100">Teacher</th>
                    <th className="py-4 px-6 bg-slate-50 text-xs font-bold uppercase tracking-wider text-slate-500 rounded-tr-xl border-b border-slate-100">Room</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {timetableData.length > 0 ? timetableData.map((slot, index) => (
                    <tr key={index} className={`hover:bg-slate-50/50 transition-colors ${slot.type === 'Break' ? 'bg-amber-50/30' : ''}`}>
                      <td className="py-5 px-6 whitespace-nowrap">
                        <div className="flex items-center gap-2 text-sm font-semibold text-slate-700">
                          <Clock className="w-4 h-4 text-slate-400" />
                          {slot.time}
                        </div>
                      </td>
                      <td className="py-5 px-6">
                        <div className={`font-bold ${slot.type === 'Break' ? 'text-amber-600' : 'text-slate-900'}`}>
                          {slot.subject}
                        </div>
                      </td>
                      <td className="py-5 px-6">
                        {slot.type !== 'Break' && (
                          <span className={`inline-flex items-center px-2.5 py-1 rounded-md text-xs font-semibold ${
                            slot.type === 'Practical' ? 'bg-purple-50 text-purple-700' : 'bg-blue-50 text-blue-700'
                          }`}>
                            {slot.type}
                          </span>
                        )}
                      </td>
                      <td className="py-5 px-6">
                        {slot.type !== 'Break' && (
                          <div className="flex items-center gap-2 text-sm text-slate-600 font-medium">
                            <Users className="w-4 h-4 text-slate-400" />
                            {slot.teacher}
                          </div>
                        )}
                      </td>
                      <td className="py-5 px-6">
                        {slot.type !== 'Break' && (
                          <div className="flex items-center gap-2 text-sm text-slate-600 font-medium">
                            <MapPin className="w-4 h-4 text-slate-400" />
                            {slot.room}
                          </div>
                        )}
                      </td>
                    </tr>
                  )) : (
                    <tr>
                      <td colSpan={5} className="py-12 text-center text-slate-500 font-medium">
                         No timetable slots available for this day.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
