import React, { useState } from 'react';
import { useSchool } from '@/context/SchoolContext';
import { Plus, Edit2, CheckCircle, Trash2, Calendar, Clock } from 'lucide-react';
import { motion } from 'motion/react';

export default function Sessions() {
  const { sessions, setSessions } = useSchool();
  const [showAddForm, setShowAddForm] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    startDate: '',
    endDate: ''
  });

  const handleAddSession = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.startDate || !formData.endDate) return;

    const newSession = {
      id: `session-${Date.now()}`,
      name: formData.name,
      startDate: formData.startDate,
      endDate: formData.endDate,
      isActive: sessions.length === 0 // Make active if it's the first
    };

    setSessions([...sessions, newSession]);
    setFormData({ name: '', startDate: '', endDate: '' });
    setShowAddForm(false);
  };

  const deleteSession = (id: string) => {
    setSessions(sessions.filter(s => s.id !== id));
  };

  const makeActive = (id: string) => {
    window.confirm('Are you sure you want to change the active session? This may affect currently displayed data across the application.');
    setSessions(sessions.map(s => ({
      ...s,
      isActive: s.id === id
    })));
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-800">Academic Sessions</h1>
          <p className="text-slate-500 mt-1">Manage school years and set the active session.</p>
        </div>
        <button
          onClick={() => setShowAddForm(!showAddForm)}
          className="bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-2.5 rounded-xl font-medium transition-colors flex items-center gap-2"
        >
          {showAddForm ? <Trash2 className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
          {showAddForm ? 'Cancel' : 'New Session'}
        </button>
      </div>

      {showAddForm && (
        <motion.div
           initial={{ opacity: 0, y: -20 }}
           animate={{ opacity: 1, y: 0 }}
           className="bg-white p-8 rounded-2xl shadow-sm border border-slate-100"
        >
          <h2 className="text-lg font-bold text-slate-800 mb-6">Add New Session</h2>
          <form onSubmit={handleAddSession} className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-2">Session Name</label>
              <input
                type="text"
                placeholder="e.g. 2024-2025"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-2">Start Date</label>
              <input
                type="date"
                value={formData.startDate}
                onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-2">End Date</label>
              <input
                type="date"
                value={formData.endDate}
                onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20"
                required
              />
            </div>
            <div className="md:col-span-3 flex justify-end">
              <button
                type="submit"
                className="bg-slate-900 hover:bg-slate-800 text-white px-6 py-2.5 rounded-xl font-medium transition-colors"
              >
                Save Session
              </button>
            </div>
          </form>
        </motion.div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {sessions.map((session) => (
          <div 
            key={session.id} 
            className={`bg-white rounded-2xl p-6 border-2 transition-all ${session.isActive ? 'border-indigo-500 shadow-md relative' : 'border-slate-100 shadow-sm hover:border-slate-300'}`}
          >
            {session.isActive && (
              <div className="absolute -top-3 -right-3 bg-indigo-500 text-white text-xs font-bold px-3 py-1 rounded-full shadow-sm flex items-center gap-1">
                <CheckCircle className="w-3 h-3" /> Active
              </div>
            )}
            <div className="flex items-center gap-3 mb-4">
              <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${session.isActive ? 'bg-indigo-50 text-indigo-600' : 'bg-slate-50 text-slate-400'}`}>
                <Clock className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-slate-800">{session.name}</h3>
                <p className="text-sm text-slate-500 font-medium">Academic Year</p>
              </div>
            </div>

            <div className="space-y-3 mb-6">
              <div className="flex items-center text-sm">
                <span className="text-slate-400 w-24">Start Date:</span>
                <span className="font-semibold text-slate-700">{session.startDate}</span>
              </div>
              <div className="flex items-center text-sm">
                <span className="text-slate-400 w-24">End Date:</span>
                <span className="font-semibold text-slate-700">{session.endDate}</span>
              </div>
            </div>

            <div className="flex gap-2">
              {!session.isActive && (
                <button
                  onClick={() => makeActive(session.id)}
                  className="flex-1 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 py-2 rounded-lg text-sm font-semibold transition-colors"
                >
                  Set Active
                </button>
              )}
              <button
                onClick={() => deleteSession(session.id)}
                className={`${session.isActive ? 'flex-1' : 'w-10'} flex items-center justify-center bg-rose-50 hover:bg-rose-100 text-rose-600 py-2 rounded-lg text-sm font-semibold transition-colors`}
              >
                {session.isActive ? 'Delete (Not Recommended)' : <Trash2 className="w-4 h-4" />}
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
