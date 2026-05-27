import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Home, 
  Calendar, 
  Clock, 
  BookOpen, 
  Users, 
  MapPin, 
  Coffee, 
  Sun, 
  Bell, 
  Flame, 
  CalendarDays, 
  Award 
} from 'lucide-react';
import { useWebsite } from '@/context/WebsiteContext';

export default function TimetablePage() {
  const navigate = useNavigate();
  const { settings } = useWebsite();
  
  const classes = ['Ankur (Nursery)', 'Prak-Prathomik', 'Class 1', 'Class 2', 'Class 3', 'Class 4', 'Class 5', 'Class 6', 'Class 7', 'Class 8', 'Class 9', 'Class 10', 'Class 11', 'Class 12'];
  const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  
  const [selectedClass, setSelectedClass] = useState('Ankur (Nursery)');
  const [selectedDay, setSelectedDay] = useState('Monday');

  // Intelligent fallback routine generator based on the user's provided Class IX structure
  const getSimulatedRoutine = (classId: string, day: string) => {
    // Standard normal-day schedule periods
    const periods = [
      { period: '1st', time: '9:30 AM – 10:10 AM', subject: 'English', teacher: 'S. K. Baruah', room: 'Room 101', type: 'Theory' },
      { period: '2nd', time: '10:10 AM – 10:50 AM', subject: 'Mathematics', teacher: 'J. Dutta', room: 'Room 102', type: 'Theory' },
      { period: '3rd', time: '10:50 AM – 11:30 AM', subject: 'Science', teacher: 'M. Hazarika', room: 'Science Lab', type: 'Practical' },
      { period: '4th', time: '11:30 AM – 12:10 AM', subject: 'Social Science', teacher: 'R. Gogoi', room: 'Room 104', type: 'Theory' },
      { period: 'Short Break', time: '12:10 PM – 12:30 PM', subject: 'Short Break', teacher: '-', room: '-', type: 'Break' },
      { period: 'Leisure / Tiffin', time: '12:30 PM – 1:00 PM', subject: 'Leisure Break', teacher: '-', room: '-', type: 'Break' },
      { period: '5th', time: '1:00 PM – 1:40 PM', subject: 'Assamese', teacher: 'P. Saikia', room: 'Room 105', type: 'Theory' },
      { period: '6th', time: '1:40 PM – 2:20 PM', subject: 'Computer', teacher: 'A. Chetia', room: 'Computer Lab', type: 'Practical' },
    ];

    const lowerClassId = classId.toLowerCase();
    const isAnkur = lowerClassId.includes('ankur');
    const isPrakPrathomik = lowerClassId.includes('prak') || lowerClassId.includes('prathomik');
    const isPrimary = !isAnkur && !isPrakPrathomik && ['class 1', 'class 2', 'class 3', 'class 4', 'class 5', 'class i', 'class ii', 'class iii', 'class iv', 'class v'].includes(lowerClassId);

    // Variations based on Class/Day to keep it look natural and fully loaded
    if (isAnkur) {
      if (day === 'Friday') {
        return [
          { period: '1st', time: '9:30 AM – 10:10 AM', subject: 'Story Session & Mimicry', teacher: 'Mrs. Pinky Baruah', room: 'Ankur Room', type: 'Theory' },
          { period: '2nd', time: '10:10 AM – 10:50 AM', subject: 'Rhymes & Music', teacher: 'Mrs. Jonali Das', room: 'Ankur Room', type: 'Theory' },
          { period: '3rd', time: '10:50 AM – 11:30 AM', subject: 'Coloring Fun & Drawing', teacher: 'Mrs. Ruby Roy', room: 'Ankur Room', type: 'Theory' },
          { period: '4th (End)', time: '11:30 AM – 12:00 PM', subject: 'Toy Selection & Departure Prep', teacher: 'Mrs. Nabha Kakoti', room: 'Indoor Playroom', type: 'Theory' },
        ];
      }
      return [
        { period: '1st', time: '9:30 AM – 10:15 AM', subject: 'Shora & Rhymes (Oral)', teacher: 'Mrs. Pinky Baruah', room: 'Ankur Room', type: 'Theory' },
        { period: '2nd', time: '10:15 AM – 11:00 AM', subject: 'Alphabet Pattern Trace-Writing', teacher: 'Mrs. Jonali Das', room: 'Ankur Room', type: 'Theory' },
        { period: 'Short Break', time: '11:00 AM – 11:30 AM', subject: 'Playground Games / Break', teacher: '-', room: '-', type: 'Break' },
        { period: '3rd', time: '11:30 AM – 12:15 PM', subject: 'Picture Book Reading (Fruits & Birds)', teacher: 'Mrs. Ruby Roy', room: 'Ankur Room', type: 'Theory' },
        { period: 'Tiffin Time', time: '12:15 PM – 12:45 PM', subject: 'Tiffin & Leisure Break', teacher: '-', room: '-', type: 'Break' },
        { period: '4th', time: '12:45 PM – 1:30 PM', subject: 'Clay Modeling & Simple Drawing', teacher: 'Mrs. Nabha Kakoti', room: 'Indoor Playroom', type: 'Practical' },
      ];
    } else if (isPrakPrathomik) {
      if (day === 'Friday') {
        return [
          { period: '1st', time: '9:30 AM – 10:10 AM', subject: 'Phonics & Pronunciation Practice', teacher: 'Mrs. Runjun Phukan', room: 'Prak-Prathomik Room', type: 'Theory' },
          { period: '2nd', time: '10:10 AM – 10:50 AM', subject: 'Number Trace & Shapes Activity', teacher: 'Mrs. Jonali Das', room: 'Prak-Prathomik Room', type: 'Theory' },
          { period: '3rd', time: '10:50 AM – 11:30 AM', subject: 'Recitation & Action Songs', teacher: 'Mrs. Pinky Baruah', room: 'Prak-Prathomik Room', type: 'Theory' },
          { period: '4th', time: '11:30 AM – 12:00 PM', subject: 'Creative Pencil Sketching', teacher: 'Mrs. Nabha Kakoti', room: 'Playroom', type: 'Practical' },
          { period: '5th (End)', time: '12:00 PM – 12:30 PM', subject: 'Storytelling & Pack-up', teacher: 'Mrs. Ruby Roy', room: 'Prak-Prathomik Room', type: 'Theory' }
        ];
      }
      return [
        { period: '1st', time: '9:30 AM – 10:10 AM', subject: 'Phonics & Storytelling (Oral)', teacher: 'Mrs. Runjun Phukan', room: 'Prak-Prathomik Room', type: 'Theory' },
        { period: '2nd', time: '10:10 AM – 10:50 AM', subject: 'Number Counting & Math Shapes', teacher: 'Mrs. Jonali Das', room: 'Prak-Prathomik Room', type: 'Theory' },
        { period: '3rd', time: '10:50 AM – 11:30 AM', subject: 'Assamese Akhar & Swarabarna', teacher: 'Mrs. Pinky Baruah', room: 'Prak-Prathomik Room', type: 'Theory' },
        { period: 'Tiffin Break', time: '11:30 AM – 12:00 PM', subject: 'Tiffin & Leisure Break', teacher: '-', room: '-', type: 'Break' },
        { period: '4th', time: '12:00 PM – 12:40 PM', subject: 'English Alphabet Writing', teacher: 'Mrs. Ruby Roy', room: 'Prak-Prathomik Room', type: 'Theory' },
        { period: 'Short Recess', time: '12:40 PM – 1:10 PM', subject: 'Short Recess & Playtime', teacher: '-', room: '-', type: 'Break' },
        { period: '5th', time: '1:10 PM – 1:50 PM', subject: 'Action Songs & General Knowledge', teacher: 'Mrs. Nabha Kakoti', room: 'Prak-Prathomik Room', type: 'Theory' },
      ];
    } else if (isPrimary) {
      periods[0].subject = 'English & Phonics'; periods[0].teacher = 'Mrs. Ruby Roy'; periods[0].room = 'Wing A - Room ' + classId.split(' ').pop();
      periods[1].subject = 'Arithmetic & Counting'; periods[1].teacher = 'Mrs. J. Kalita'; periods[1].room = 'Wing A - Room ' + classId.split(' ').pop();
      periods[2].subject = 'Nature Study / EVS'; periods[2].teacher = 'Mr. B. Das'; periods[2].room = 'Wing A - Room ' + classId.split(' ').pop();
      periods[3].subject = 'Assamese Recitation'; periods[3].teacher = 'Mrs. M. Bezbaruah'; periods[3].room = 'Wing A - Room ' + classId.split(' ').pop();
      periods[6].subject = 'Hindi & Conversational Oral'; periods[6].teacher = 'Mrs. S. Sharma'; periods[6].room = 'Wing A - Room ' + classId.split(' ').pop();
      periods[7].subject = 'Art, Craft & Playtime'; periods[7].teacher = 'Mrs. A. Kakoti'; periods[7].room = 'Indoor Playroom';
    } else if (classId === 'Class 10') {
      periods[0].subject = 'Mathematics'; periods[0].teacher = 'J. Dutta';
      periods[1].subject = 'English'; periods[1].teacher = 'S. K. Baruah';
      periods[5].subject = 'Advanced Mathematics'; periods[5].teacher = 'K. Bora';
    } else if (classId === 'Class 11' || classId === 'Class 12') {
      periods[0].subject = 'Physics'; periods[0].teacher = 'D. Sharma';
      periods[1].subject = 'Chemistry'; periods[1].teacher = 'N. Kalita';
      periods[2].subject = 'Biology'; periods[2].teacher = 'M. Das';
      periods[3].subject = 'English'; periods[3].teacher = 'S. K. Baruah';
      periods[6].subject = 'Mathematics'; periods[6].teacher = 'J. Dutta';
      periods[7].subject = 'Alternative English'; periods[7].teacher = 'B. Dev';
    } else if (classId === 'Class 6' || classId === 'Class 7') {
      periods[0].subject = 'Social Science'; periods[0].teacher = 'R. Gogoi';
      periods[1].subject = 'General Mathematics'; periods[1].teacher = 'M. Das';
      periods[2].subject = 'English Grammar'; periods[2].teacher = 'S. K. Baruah';
      periods[3].subject = 'Assamese Literature'; periods[3].teacher = 'P. Saikia';
      periods[6].subject = 'Drawing / Craft'; periods[6].teacher = 'A. Kakoti';
      periods[7].subject = 'Physical Education'; periods[7].teacher = 'D. Bora';
    }

    // Friday adjustments (school ends early)
    if (day === 'Friday') {
      return [
        { period: '1st', time: '9:30 AM – 10:10 AM', subject: isPrimary ? 'English Reading' : 'English', teacher: isPrimary ? 'Mrs. Ruby Roy' : 'S. K. Baruah', room: 'Room 101', type: 'Theory' },
        { period: '2nd', time: '10:10 AM – 10:50 AM', subject: isPrimary ? 'Arithmetic Practice' : 'Mathematics', teacher: isPrimary ? 'Mrs. J. Kalita' : 'J. Dutta', room: 'Room 102', type: 'Theory' },
        { period: '3rd', time: '10:50 AM – 11:30 AM', subject: isPrimary ? 'Story-telling & Morals' : 'Science', teacher: isPrimary ? 'Mr. B. Das' : 'M. Hazarika', room: isPrimary ? 'Playroom' : 'Science Lab', type: 'Theory' },
        { period: '4th', time: '11:30 AM – 12:00 PM', subject: isPrimary ? 'Drawing / Painting' : 'Social Science', teacher: isPrimary ? 'Mrs. A. Kakoti' : 'R. Gogoi', room: 'Room 104', type: 'Theory' },
        { period: 'Friday Assembly', time: '12:00 PM', subject: 'Weekend Announcement', teacher: '-', room: '-', type: 'Break' },
      ];
    }

    return periods;
  };

  const currentRoutine = useMemo(() => {
    // If the database website settings has actual customized slots for this class and day, use them
    const dbSlots = settings.timetableSlots?.filter(
      slot => slot.classId?.toLowerCase() === selectedClass.toLowerCase() && slot.day?.toLowerCase() === selectedDay.toLowerCase()
    );

    if (dbSlots && dbSlots.length > 0) {
      return dbSlots;
    }

    // fallback to our high-fidelity schedule
    return getSimulatedRoutine(selectedClass, selectedDay);
  }, [settings.timetableSlots, selectedClass, selectedDay]);

  return (
    <div id="timetable-page-container" className="min-h-screen bg-slate-50 text-slate-800 pb-16">
      {/* Decorative Elegant Hero Banner */}
      <div id="timetable-hero" className="bg-[#0b4f8a] text-white relative overflow-hidden shadow-md">
        <div className="absolute inset-0 max-w-7xl mx-auto">
          <div className="absolute top-[-10%] right-[-5%] w-96 h-96 bg-blue-400/20 rounded-full blur-3xl mix-blend-screen opacity-40"></div>
          <div className="absolute bottom-[-20%] left-[-10%] w-80 h-80 bg-sky-300/20 rounded-full blur-3xl mix-blend-screen opacity-40"></div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14 relative z-10 text-center">
          <button 
            id="back-home-button"
            onClick={() => navigate('/')} 
            className="inline-flex items-center gap-2 text-sky-100 hover:text-white transition-colors text-sm font-semibold mb-6 bg-white/10 hover:bg-white/20 px-5 py-2.5 rounded-full border border-sky-300/20 backdrop-blur-md cursor-pointer"
          >
            <Home className="w-4 h-4" /> Back to Home
          </button>
          
          <h1 id="timetable-title" className="text-4xl md:text-5xl font-bold tracking-tight mb-3">Academic Routine & Times</h1>
          <p id="timetable-subtitle" className="text-sky-100 text-base md:text-lg max-w-2xl mx-auto font-medium">
            Classes V – XII Schedule • Detailed Period Timings & Subject Distributions
          </p>
        </div>
      </div>

      <div id="timetable-content-wrapper" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-10 space-y-10">
        
        {/* Bento Grid: School Timings */}
        <div id="school-timing-bento" className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-amber-50 border-l-4 border-amber-500 p-5 rounded-2xl flex items-start gap-4 shadow-sm md:col-span-4">
            <div className="p-3 bg-amber-100 text-amber-700 rounded-xl">
              <Clock className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-amber-900">Standard School Timing Information</h3>
              <p className="text-amber-800 text-sm mt-0.5">Please check standard timings for assemblies, tiffin breaks, and Friday special hours below.</p>
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-slate-200 p-5 flex flex-col justify-between shadow-sm hover:shadow-md transition">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-[#0b4f8a] uppercase tracking-wider">Morning Session</span>
              <Sun className="w-5 h-5 text-amber-500" />
            </div>
            <div className="mt-4">
              <h4 className="text-xl font-black text-slate-800">9:00 AM – 9:30 AM</h4>
              <p className="text-slate-500 text-xs mt-1">Morning Assembly & Daily Prayer</p>
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-slate-200 p-5 flex flex-col justify-between shadow-sm hover:shadow-md transition">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-green-600 uppercase tracking-wider">Tiffin break</span>
              <Coffee className="w-5 h-5 text-green-500" />
            </div>
            <div className="mt-4">
              <h4 className="text-xl font-black text-slate-800">12:30 PM – 1:00 PM</h4>
              <p className="text-slate-500 text-xs mt-1">Leisure / Lunch Break (All Classes)</p>
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-slate-200 p-5 flex flex-col justify-between shadow-sm hover:shadow-md transition">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-indigo-600 uppercase tracking-wider">Daily Closing</span>
              <Bell className="w-5 h-5 text-indigo-500" />
            </div>
            <div className="mt-4">
              <h4 className="text-xl font-black text-slate-800">2:30 PM</h4>
              <p className="text-slate-500 text-xs mt-1">Dismissal & Closing Activities</p>
            </div>
          </div>

          <div className="bg-rose-50 border border-rose-100 rounded-2xl p-5 flex flex-col justify-between shadow-sm hover:shadow-md transition">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-rose-700 uppercase tracking-wider">Friday Special</span>
              <CalendarDays className="w-5 h-5 text-rose-500" />
            </div>
            <div className="mt-4">
              <h4 className="text-xl font-bold text-rose-950">12:00 PM Break</h4>
              <p className="text-rose-800 text-xs mt-1">Friday Half Day Timing</p>
            </div>
          </div>
        </div>

        {/* Dual Column Layout */}
        <div id="timetable-layout-grid" className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* Normal Day Timing Timeline (5 Cols) */}
          <div id="normal-day-timeline-col" className="lg:col-span-4 bg-white rounded-3xl border border-slate-200 p-6 md:p-8 shadow-sm space-y-6">
            <div className="border-b border-slate-100 pb-4">
              <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
                <Clock className="w-5 h-5 text-[#0b4f8a]" />
                Normal Day Schedule
              </h2>
              <p className="text-slate-500 text-xs mt-1">Chronological sequence of steps during normal operating hours</p>
            </div>

            <div className="relative pl-6 border-l-2 border-slate-100 space-y-6">
              <div className="relative">
                <span className="absolute -left-[31px] top-1.5 w-4 h-4 rounded-full bg-[#0b4f8a] border-2 border-white shadow"></span>
                <span className="text-xs font-bold text-[#0b4f8a] bg-blue-50 px-2 py-0.5 rounded-md">09:00 – 09:30</span>
                <h4 className="font-bold text-slate-800 text-sm mt-1">Morning Assembly</h4>
              </div>

              <div className="relative">
                <span className="absolute -left-[31px] top-1.5 w-4 h-4 rounded-full bg-slate-300 border-2 border-white shadow"></span>
                <span className="text-xs font-bold text-slate-500">09:30 – 10:10</span>
                <h4 className="font-bold text-slate-800 text-sm mt-1">1st Period</h4>
              </div>

              <div className="relative">
                <span className="absolute -left-[31px] top-1.5 w-4 h-4 rounded-full bg-slate-300 border-2 border-white shadow"></span>
                <span className="text-xs font-bold text-slate-500">10:10 – 10:50</span>
                <h4 className="font-bold text-slate-800 text-sm mt-1">2nd Period</h4>
              </div>

              <div className="relative">
                <span className="absolute -left-[31px] top-1.5 w-4 h-4 rounded-full bg-slate-300 border-2 border-white shadow"></span>
                <span className="text-xs font-bold text-slate-500">10:50 – 11:30</span>
                <h4 className="font-bold text-slate-800 text-sm mt-1">3rd Period</h4>
              </div>

              <div className="relative">
                <span className="absolute -left-[31px] top-1.5 w-4 h-4 rounded-full bg-slate-300 border-2 border-white shadow"></span>
                <span className="text-xs font-bold text-slate-500">11:30 – 12:10</span>
                <h4 className="font-bold text-slate-800 text-sm mt-1">4th Period</h4>
              </div>

              <div className="relative bg-amber-50/50 p-2.5 rounded-xl border border-amber-100">
                <span className="absolute -left-[31px] top-3 w-4 h-4 rounded-full bg-amber-500 border-2 border-white shadow"></span>
                <span className="text-xs font-bold text-amber-700">12:10 – 12:30</span>
                <h4 className="font-bold text-amber-900 text-sm mt-0.5">Short Break</h4>
              </div>

              <div className="relative bg-emerald-50/50 p-2.5 rounded-xl border border-emerald-100">
                <span className="absolute -left-[31px] top-3 w-4 h-4 rounded-full bg-emerald-500 border-2 border-white shadow"></span>
                <span className="text-xs font-bold text-emerald-700">12:30 – 1:00</span>
                <h4 className="font-bold text-emerald-900 text-sm mt-0.5">Leisure / Tiffin</h4>
              </div>

              <div className="relative">
                <span className="absolute -left-[31px] top-1.5 w-4 h-4 rounded-full bg-slate-300 border-2 border-white shadow"></span>
                <span className="text-xs font-bold text-slate-500">01:00 – 01:40</span>
                <h4 className="font-bold text-slate-800 text-sm mt-1">5th Period</h4>
              </div>

              <div className="relative">
                <span className="absolute -left-[31px] top-1.5 w-4 h-4 rounded-full bg-slate-300 border-2 border-white shadow"></span>
                <span className="text-xs font-bold text-slate-500">01:40 – 02:20</span>
                <h4 className="font-bold text-slate-800 text-sm mt-1">6th Period</h4>
              </div>

              <div className="relative">
                <span className="absolute -left-[31px] top-1.5 w-4 h-4 rounded-full bg-[#0b4f8a] border-2 border-white shadow"></span>
                <span className="text-xs font-bold text-[#0b4f8a] bg-blue-50 px-2 py-0.5 rounded-md">02:20 – 02:30</span>
                <h4 className="font-bold text-slate-800 text-sm mt-1">Closing Activities</h4>
              </div>
            </div>
          </div>

          {/* Interactive Class Schedule (8 Cols) */}
          <div id="class-routine-explorer-col" className="lg:col-span-8 bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-sm">
            <div className="p-6 border-b border-slate-100 bg-slate-50/50">
              <span className="text-xs font-bold text-[#0b4f8a] uppercase tracking-wider block mb-2">Class-wise Routine Explorer</span>
              <h2 className="text-xl font-bold text-slate-900">Weekly Lecture Distribution</h2>
              
              {/* Class Tabs */}
              <div className="flex gap-2 overflow-x-auto pb-1 mt-4 scrollbar-thin">
                {classes.map(cls => (
                  <button
                    key={cls}
                    onClick={() => setSelectedClass(cls)}
                    className={`whitespace-nowrap px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                      selectedClass === cls 
                        ? 'bg-[#0b4f8a] text-white shadow shadow-blue-900/10' 
                        : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
                    }`}
                  >
                    {cls}
                  </button>
                ))}
              </div>

              {/* Day Filter Bubbles */}
              <div className="flex flex-wrap gap-1.5 mt-4">
                {days.map(day => (
                  <button
                    key={day}
                    onClick={() => setSelectedDay(day)}
                    className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
                      selectedDay === day
                        ? 'bg-slate-800 text-white font-semibold'
                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                    }`}
                  >
                    {day}
                  </button>
                ))}
              </div>
            </div>

            <div className="p-6">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-slate-50 border-b border-slate-200">
                      <th className="py-3 px-4 text-xs font-bold uppercase tracking-wider text-slate-500">Period</th>
                      <th className="py-3 px-4 text-xs font-bold uppercase tracking-wider text-slate-500">Time</th>
                      <th className="py-3 px-4 text-xs font-bold uppercase tracking-wider text-slate-500">Subject</th>
                      <th className="py-3 px-4 text-xs font-bold uppercase tracking-wider text-slate-500">Teacher</th>
                      <th className="py-3 px-4 text-xs font-bold uppercase tracking-wider text-slate-500">Room</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {currentRoutine.map((slot, index) => {
                      const isBreak = slot.type === 'Break' || slot.subject?.toLowerCase().includes('break') || slot.subject?.toLowerCase().includes('leisure');
                      return (
                        <tr 
                          key={index} 
                          className={`transition-colors ${isBreak ? 'bg-amber-50/25 italic' : 'hover:bg-slate-50/70'}`}
                        >
                          <td className="py-4 px-4 whitespace-nowrap text-xs font-bold text-[#0b4f8a]">
                            {slot.period || `${index + 1}st`}
                          </td>
                          <td className="py-4 px-4 whitespace-nowrap">
                            <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-700">
                              <Clock className="w-3.5 h-3.5 text-slate-400" />
                              {slot.time}
                            </span>
                          </td>
                          <td className="py-4 px-4 font-bold text-slate-900 text-sm">
                            {slot.subject}
                          </td>
                          <td className="py-4 px-4 text-xs text-slate-600 font-medium">
                            {isBreak ? (
                              <span className="text-slate-400">—</span>
                            ) : (
                              <span className="inline-flex items-center gap-1">
                                <Users className="w-3.5 h-3.5 text-slate-400" />
                                {slot.teacher || '__________'}
                              </span>
                            )}
                          </td>
                          <td className="py-4 px-4 text-xs text-slate-600 font-medium">
                            {isBreak ? (
                              <span className="text-slate-400">—</span>
                            ) : (
                              <span className="inline-flex items-center gap-1">
                                <MapPin className="w-3.5 h-3.5 text-slate-400" />
                                {slot.room || 'Room ' + (index + 101)}
                              </span>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}

