import { Users, GraduationCap, Wallet, CalendarCheck, TrendingUp, TrendingDown, IndianRupee } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, Legend } from 'recharts';
import { format } from 'date-fns';

const revenueData = [
  { name: 'Jan', total: 45000 },
  { name: 'Feb', total: 52000 },
  { name: 'Mar', total: 48000 },
  { name: 'Apr', total: 61000 },
  { name: 'May', total: 55000 },
  { name: 'Jun', total: 67000 },
  { name: 'Jul', total: 72000 },
];

const attendanceData = [
  { name: 'Mon', present: 95, absent: 5 },
  { name: 'Tue', present: 92, absent: 8 },
  { name: 'Wed', present: 96, absent: 4 },
  { name: 'Thu', present: 88, absent: 12 },
  { name: 'Fri', present: 94, absent: 6 },
];

const recentAdmissions = [
  { id: 1, name: 'Emma Thompson', class: 'Class 10', date: '2026-04-20', status: 'Approved', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Emma' },
  { id: 2, name: 'Liam Johnson', class: 'Class 8', date: '2026-04-19', status: 'Pending', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Liam' },
  { id: 3, name: 'Olivia Davis', class: 'Class 12', date: '2026-04-18', status: 'Approved', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Olivia' },
  { id: 4, name: 'Noah Wilson', class: 'Class 5', date: '2026-04-18', status: 'Approved', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Noah' },
];

export default function Dashboard() {
  return (
    <div className="space-y-6 max-w-7xl mx-auto animate-fade-in relative pb-12">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 relative z-10 mb-2 sm:mb-0">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">Dashboard Overview</h1>
          <p className="text-slate-500 text-sm sm:text-base mt-1 font-medium">Welcome back, here's what's happening today.</p>
        </div>
        <div className="bg-white px-5 py-3 rounded-2xl shadow-sm border border-slate-200 flex items-center gap-3 w-full sm:w-auto">
          <CalendarCheck className="w-5 h-5 text-blue-600 shrink-0" />
          <span className="font-bold text-slate-800 text-sm sm:text-base truncate">{format(new Date(), 'MMMM d, yyyy')}</span>
        </div>
      </div>

      <div className="flex overflow-x-auto pb-4 sm:pb-0 -mx-4 px-4 sm:mx-0 sm:px-0 sm:grid sm:grid-cols-2 xl:grid-cols-4 gap-4 sm:gap-6 relative z-10 snap-x snap-mandatory">
        <div className="snap-center shrink-0 w-[85vw] sm:w-auto">
          <StatCard 
            title="Total Students" 
            value="2,845" 
            icon={GraduationCap} 
            trend="+125 this year"
            trendUp={true}
            wrapperClass="bg-white border-slate-200 shadow-sm"
            blobClass="hidden"
            lightColors="bg-blue-50 text-blue-600"
          />
        </div>
        <div className="snap-center shrink-0 w-[85vw] sm:w-auto">
          <StatCard 
            title="Total Teachers" 
            value="142" 
            icon={Users} 
            trend="+4 this month"
            trendUp={true}
            wrapperClass="bg-white border-slate-200 shadow-sm"
            blobClass="hidden"
            lightColors="bg-purple-50 text-purple-600"
          />
        </div>
        <div className="snap-center shrink-0 w-[85vw] sm:w-auto">
          <StatCard 
            title="Fees Collected" 
            value="₹1,24,500" 
            icon={Wallet} 
            trend="+12% vs last month"
            trendUp={true}
            wrapperClass="bg-white border-slate-200 shadow-sm"
            blobClass="hidden"
            lightColors="bg-emerald-50 text-emerald-600"
          />
        </div>
        <div className="snap-center shrink-0 w-[85vw] sm:w-auto">
          <StatCard 
            title="Total Outstanding" 
            value="₹18,200" 
            icon={IndianRupee} 
            trend="-5% vs last month"
            trendUp={false}
            wrapperClass="bg-white border-slate-200 shadow-sm"
            blobClass="hidden"
            lightColors="bg-rose-50 text-rose-600"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 relative z-10">
        {/* Revenue Chart */}
        <div className="lg:col-span-2 relative overflow-hidden rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-bold text-slate-800 flex items-center gap-3">
              <span className="w-2 h-8 rounded-full bg-blue-600"></span>
              Fees Collection Overview
            </h2>
            <select className="bg-white/50 border border-slate-200/60 text-slate-700 text-sm rounded-xl focus:ring-blue-500 focus:border-blue-500 block px-3 py-2 outline-none">
              <option>This Year</option>
              <option>Last Year</option>
            </select>
          </div>
          <div className="h-[300px] w-full overflow-x-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
            <div className="min-w-[500px] h-full pb-2">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={revenueData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorTotal" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#4f46e5" stopOpacity={0.4}/>
                      <stop offset="95%" stopColor="#4f46e5" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <XAxis dataKey="name" stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} />
                  <YAxis stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(value) => `₹${value/1000}k`} />
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                  <Tooltip 
                    contentStyle={{ backgroundColor: 'rgba(255, 255, 255, 0.9)', backdropFilter: 'blur(8px)', borderRadius: '16px', border: '1px solid rgba(226, 232, 240, 0.8)', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)' }}
                    itemStyle={{ color: '#0f172a', fontWeight: 600 }}
                  />
                  <Area type="monotone" dataKey="total" stroke="#4f46e5" strokeWidth={4} fillOpacity={1} fill="url(#colorTotal)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* Attendance Chart */}
        <div className="relative overflow-hidden rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="text-xl font-bold text-slate-800 mb-6 flex items-center gap-3">
            <span className="w-2 h-8 rounded-full bg-purple-600"></span>
            Weekly Attendance
          </h2>
          <div className="h-[300px] w-full overflow-x-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
            <div className="min-w-[400px] h-full pb-2">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={attendanceData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <XAxis dataKey="name" stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} />
                  <YAxis stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} />
                  <Tooltip 
                    cursor={{fill: 'rgba(241, 245, 249, 0.5)'}}
                    contentStyle={{ backgroundColor: 'rgba(255, 255, 255, 0.9)', backdropFilter: 'blur(8px)', borderRadius: '16px', border: '1px solid rgba(226, 232, 240, 0.8)', boxShadow: '0 4px 20px rgba(0,0,0,0.08)' }}
                  />
                  <Legend iconType="circle" wrapperStyle={{ fontSize: '12px', marginTop: '10px' }} />
                  <Bar dataKey="present" name="Present %" fill="#10b981" radius={[6, 6, 0, 0]} barSize={24} />
                  <Bar dataKey="absent" name="Absent %" fill="#f43f5e" radius={[6, 6, 0, 0]} barSize={24} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 relative z-10">
        {/* Recent Admissions */}
        <div className="relative overflow-hidden rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-bold text-slate-800 flex items-center gap-3">
              <span className="w-2 h-8 rounded-full bg-emerald-500"></span>
              Recent Admissions
            </h2>
            <button className="text-emerald-600 hover:text-emerald-700 text-sm font-bold bg-emerald-50 px-3 py-1.5 rounded-lg transition-colors">View All</button>
          </div>
          <div className="space-y-4">
            {recentAdmissions.map((student) => (
              <div key={student.id} className="flex items-center justify-between p-4 bg-slate-50 hover:bg-slate-100 rounded-2xl transition-all border border-slate-200 shadow-sm">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full bg-white overflow-hidden border border-slate-200 shadow-sm shrink-0">
                    <img src={student.avatar} alt={student.name} className="w-full h-full object-cover" />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-slate-900">{student.name}</p>
                    <p className="text-xs font-semibold text-slate-500">{student.class} • {format(new Date(student.date), 'MMM d, yyyy')}</p>
                  </div>
                </div>
                <div className={`px-4 py-1.5 rounded-full text-xs font-bold border ${
                  student.status === 'Approved' ? 'bg-emerald-50 text-emerald-600 border-emerald-200' : 'bg-amber-50 text-amber-600 border-amber-200'
                }`}>
                  {student.status}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Quick Actions & Notices */}
        <div className="space-y-6">
          <div className="relative overflow-hidden rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm">
            <h2 className="text-xl font-bold text-slate-800 mb-6 flex items-center gap-3">
              <span className="w-2 h-8 rounded-full bg-orange-500"></span>
              Quick Actions
            </h2>
            <div className="grid grid-cols-2 gap-4">
              <QuickActionButton icon={GraduationCap} label="Admit Student" color="bg-blue-50 text-blue-700 hover:bg-blue-100 border-blue-100" />
              <QuickActionButton icon={Wallet} label="Collect Fees" color="bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border-emerald-100" />
              <QuickActionButton icon={CalendarCheck} label="Mark Attendance" color="bg-purple-50 text-purple-700 hover:bg-purple-100 border-purple-100" />
              <QuickActionButton icon={Users} label="Add Staff" color="bg-orange-50 text-orange-700 hover:bg-orange-100 border-orange-100" />
            </div>
          </div>
          
          <div className="relative overflow-hidden rounded-[2rem] bg-indigo-950 text-white shadow-xl p-6">
            <div className="flex items-start gap-4">
              <div className="bg-white/10 w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 border border-white/20">
                <CalendarCheck className="w-6 h-6 text-indigo-400" />
              </div>
              <div>
                <h3 className="font-bold text-xl mb-1 text-white tracking-tight">Upcoming Events</h3>
                <p className="text-indigo-100 text-sm mb-5 leading-relaxed">Annual Sports Meet is scheduled for next Friday. Ensure all participants are registered.</p>
                <button className="bg-white hover:bg-indigo-50 border-transparent text-indigo-950 px-5 py-2.5 rounded-xl text-sm font-bold transition-all flex items-center gap-2 group">
                  View Calendar
                  <span className="group-hover:translate-x-1 transition-transform">→</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function StatCard({ title, value, icon: Icon, trend, trendUp, wrapperClass, blobClass, lightColors }: any) {
  return (
    <div className={`relative overflow-hidden rounded-[2rem] border ${wrapperClass} p-6 group hover:-translate-y-1 transition-all duration-300`}>
      <div className="relative z-10">
        <div className="flex justify-between items-start mb-4">
          <div className={`p-3.5 rounded-2xl ${lightColors}`}>
            <Icon className="w-6 h-6" />
          </div>
          <div className={`flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 rounded-full border shadow-sm ${
            trendUp 
              ? 'bg-emerald-50 text-emerald-700 border-emerald-100' 
              : 'bg-rose-50 text-rose-700 border-rose-100'
          }`}>
            {trendUp ? <TrendingUp className="w-3.5 h-3.5" /> : <TrendingDown className="w-3.5 h-3.5" />}
            {trend}
          </div>
        </div>
        <div>
          <h3 className="text-slate-500 text-sm font-bold uppercase tracking-wider mb-1">{title}</h3>
          <p className="text-3xl font-bold text-slate-800 tracking-tight">{value}</p>
        </div>
      </div>
    </div>
  );
}

function QuickActionButton({ icon: Icon, label, color }: any) {
  return (
    <button className={`flex flex-col items-center justify-center p-5 rounded-2xl transition-all duration-300 border hover:-translate-y-1 ${color}`}>
      <div className="bg-white p-3 rounded-xl mb-3 shadow-sm border border-slate-200">
        <Icon className="w-6 h-6" />
      </div>
      <span className="text-sm font-bold tracking-tight">{label}</span>
    </button>
  );
}
