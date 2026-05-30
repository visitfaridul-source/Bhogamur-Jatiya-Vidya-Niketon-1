import React, { useState, useEffect, useRef } from 'react';
import { Save, Plus, Trash2, Check } from 'lucide-react';
import { useWebsite, TimetableSlot, OnlineClassEvent, FeeStructureTier, FeeStructureItem } from '@/context/WebsiteContext';

export default function WebsitePagesSettings() {
  const { settings, updateSettings } = useWebsite();
  const [activeTab, setActiveTab] = useState<'timetable' | 'onlineClasses' | 'fees'>('timetable');

  const [timetableSlots, setTimetableSlots] = useState<TimetableSlot[]>(settings.timetableSlots || []);
  const [onlineClasses, setOnlineClasses] = useState<OnlineClassEvent[]>(settings.onlineClasses || []);
  const [feeStructures, setFeeStructures] = useState<FeeStructureTier[]>(settings.feeStructures || []);
  const [saved, setSaved] = useState(false);

  const lastSettingsRef = useRef({
    timetableSlots: settings.timetableSlots || [],
    onlineClasses: settings.onlineClasses || [],
    feeStructures: settings.feeStructures || [],
  });

  const isDirtyRef = useRef(false);

  // Sync settings -> local states if not actively modified by user
  useEffect(() => {
    if (!isDirtyRef.current) {
      lastSettingsRef.current = {
        timetableSlots: settings.timetableSlots || [],
        onlineClasses: settings.onlineClasses || [],
        feeStructures: settings.feeStructures || [],
      };
      setTimetableSlots(settings.timetableSlots || []);
      setOnlineClasses(settings.onlineClasses || []);
      setFeeStructures(settings.feeStructures || []);
    }
  }, [settings]);

  // Auto-sync local state changes back to parent context with debounce
  useEffect(() => {
    const baseline = lastSettingsRef.current;
    const isDifferent = 
      JSON.stringify(timetableSlots) !== JSON.stringify(baseline.timetableSlots) ||
      JSON.stringify(onlineClasses) !== JSON.stringify(baseline.onlineClasses) ||
      JSON.stringify(feeStructures) !== JSON.stringify(baseline.feeStructures);

    if (isDifferent) {
      isDirtyRef.current = true;
      const timer = setTimeout(() => {
        updateSettings({
          timetableSlots,
          onlineClasses,
          feeStructures,
        });
        // Sync reference baseline to prevent duplicate sync loops
        lastSettingsRef.current = {
          timetableSlots,
          onlineClasses,
          feeStructures,
        };
      }, 500); // 500ms debounce
      return () => clearTimeout(timer);
    }
  }, [timetableSlots, onlineClasses, feeStructures, updateSettings]);

  const handleSave = () => {
    isDirtyRef.current = false;
    const nextVal = {
      timetableSlots,
      onlineClasses,
      feeStructures,
    };
    updateSettings(nextVal);
    lastSettingsRef.current = nextVal;
    
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-6 rounded-xl border border-slate-200">
        <div>
          <h1 className="text-2xl font-bold font-serif text-slate-800">Custom Pages Settings</h1>
          <p className="text-slate-500 mt-1">Manage data for Timetable, Online Classes, and Fee Structure pages</p>
        </div>
        <button
          onClick={handleSave}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg font-semibold transition ${
            saved 
              ? 'bg-emerald-500 text-white shadow-emerald-500/10' 
              : 'bg-indigo-600 hover:bg-indigo-700 text-white shadow-indigo-600/10'
          }`}
        >
          {saved ? <Check size={20} /> : <Save size={20} />}
          {saved ? 'Saved!' : 'Save Changes'}
        </button>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
        <div className="flex border-b border-slate-200">
          <button
            onClick={() => setActiveTab('timetable')}
            className={`px-6 py-3 text-sm font-medium transition ${activeTab === 'timetable' ? 'border-b-2 border-indigo-600 text-indigo-600 bg-indigo-50/50' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'}`}
          >
            Timetable Page
          </button>
          <button
            onClick={() => setActiveTab('onlineClasses')}
            className={`px-6 py-3 text-sm font-medium transition ${activeTab === 'onlineClasses' ? 'border-b-2 border-indigo-600 text-indigo-600 bg-indigo-50/50' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'}`}
          >
            Online Classes
          </button>
          <button
            onClick={() => setActiveTab('fees')}
            className={`px-6 py-3 text-sm font-medium transition ${activeTab === 'fees' ? 'border-b-2 border-indigo-600 text-indigo-600 bg-indigo-50/50' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'}`}
          >
            Fee Structure
          </button>
        </div>

        <div className="p-6">
          {activeTab === 'timetable' && (
            <TimetableSettings
              slots={timetableSlots}
              setSlots={setTimetableSlots}
              classes={settings.timetableClasses || []}
              days={settings.timetableDays || []}
            />
          )}

          {activeTab === 'onlineClasses' && (
            <OnlineClassesSettings
               classes={onlineClasses}
               setClasses={setOnlineClasses}
            />
          )}

          {activeTab === 'fees' && (
            <FeeStructureSettings
               tiers={feeStructures}
               setTiers={setFeeStructures}
            />
          )}
        </div>
      </div>
    </div>
  );
}

function TimetableSettings({ slots, setSlots, classes, days }: { slots: TimetableSlot[], setSlots: any, classes: string[], days: string[] }) {
  const addSlot = () => setSlots([...slots, { id: Date.now().toString(), classId: classes[0], day: days[0], time: '', subject: '', teacher: '', room: '', type: 'Theory' }]);
  const updateSlot = (index: number, key: string, value: string) => {
    const updated = [...slots];
    updated[index] = { ...updated[index], [key]: value };
    setSlots(updated);
  };
  const removeSlot = (index: number) => {
    const updated = [...slots];
    updated.splice(index, 1);
    setSlots(updated);
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold">Manage Timetable Slots</h3>
        <button onClick={addSlot} className="flex items-center gap-2 bg-indigo-50 text-indigo-600 px-3 py-1.5 rounded-lg text-sm font-medium">
          <Plus size={16} /> Add Slot
        </button>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm border-collapse rounded-lg overflow-hidden border border-slate-200">
          <thead className="bg-slate-50">
            <tr>
              <th className="p-3 border-b border-slate-200 font-semibold">Class</th>
              <th className="p-3 border-b border-slate-200 font-semibold">Day</th>
              <th className="p-3 border-b border-slate-200 font-semibold">Time</th>
              <th className="p-3 border-b border-slate-200 font-semibold">Subject</th>
              <th className="p-3 border-b border-slate-200 font-semibold">Type</th>
              <th className="p-3 border-b border-slate-200 font-semibold">Teacher</th>
              <th className="p-3 border-b border-slate-200 font-semibold">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {slots.map((slot, idx) => (
              <tr key={slot.id} className="bg-white">
                <td className="p-2"><select className="w-full p-2 border rounded-md" value={slot.classId} onChange={e => updateSlot(idx, 'classId', e.target.value)}>{classes.map(c => <option key={c} value={c}>{c}</option>)}</select></td>
                <td className="p-2"><select className="w-full p-2 border rounded-md" value={slot.day} onChange={e => updateSlot(idx, 'day', e.target.value)}>{days.map(d => <option key={d} value={d}>{d}</option>)}</select></td>
                <td className="p-2"><input type="text" className="w-full p-2 border rounded-md" placeholder="e.g. 08:00 AM" value={slot.time} onChange={e => updateSlot(idx, 'time', e.target.value)} /></td>
                <td className="p-2"><input type="text" className="w-full p-2 border rounded-md" placeholder="Subject" value={slot.subject} onChange={e => updateSlot(idx, 'subject', e.target.value)} /></td>
                <td className="p-2"><select className="w-full p-2 border rounded-md" value={slot.type} onChange={e => updateSlot(idx, 'type', e.target.value)}><option value="Theory">Theory</option><option value="Practical">Practical</option><option value="Break">Break</option></select></td>
                <td className="p-2"><input type="text" className="w-full p-2 border rounded-md" placeholder="Teacher" value={slot.teacher} onChange={e => updateSlot(idx, 'teacher', e.target.value)} /></td>
                <td className="p-2"><button onClick={() => removeSlot(idx)} className="p-2 text-red-500 hover:bg-red-50 rounded-md"><Trash2 size={16} /></button></td>
              </tr>
            ))}
          </tbody>
        </table>
        {slots.length === 0 && <p className="text-center text-slate-500 py-6">No slots found.</p>}
      </div>
    </div>
  );
}

function OnlineClassesSettings({ classes, setClasses }: { classes: OnlineClassEvent[], setClasses: any }) {
  const addClass = () => setClasses([...classes, { id: Date.now().toString(), subject: '', class: '', teacher: '', time: '', students: 0, meetLink: '' }]);
  const updateClass = (index: number, key: string, value: string | number) => {
    const updated = [...classes];
    updated[index] = { ...updated[index], [key]: value };
    setClasses(updated);
  };
  const removeClass = (index: number) => {
    const updated = [...classes];
    updated.splice(index, 1);
    setClasses(updated);
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold">Manage Online Classes</h3>
        <button onClick={addClass} className="flex items-center gap-2 bg-indigo-50 text-indigo-600 px-3 py-1.5 rounded-lg text-sm font-medium">
          <Plus size={16} /> Add Class
        </button>
      </div>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
         {classes.map((cls, idx) => (
             <div key={cls.id} className="border border-slate-200 rounded-lg p-4 space-y-3 relative group">
                <button onClick={() => removeClass(idx)} className="absolute top-2 right-2 p-1.5 bg-white text-red-500 rounded hover:bg-red-50 border border-slate-100 shadow-sm opacity-0 group-hover:opacity-100 transition-opacity">
                   <Trash2 size={14} />
                </button>
                <div>
                   <label className="text-xs font-semibold text-slate-500 mb-1 block">Subject & Topic</label>
                   <input type="text" className="w-full p-2 border rounded-md text-sm" value={cls.subject} onChange={e => updateClass(idx, 'subject', e.target.value)} />
                </div>
                <div className="grid grid-cols-2 gap-2">
                   <div>
                     <label className="text-xs font-semibold text-slate-500 mb-1 block">Class Name</label>
                     <input type="text" className="w-full p-2 border rounded-md text-sm" value={cls.class} onChange={e => updateClass(idx, 'class', e.target.value)} />
                   </div>
                   <div>
                     <label className="text-xs font-semibold text-slate-500 mb-1 block">Students</label>
                     <input type="number" className="w-full p-2 border rounded-md text-sm" value={cls.students} onChange={e => updateClass(idx, 'students', parseInt(e.target.value))} />
                   </div>
                </div>
                <div>
                   <label className="text-xs font-semibold text-slate-500 mb-1 block">Teacher</label>
                   <input type="text" className="w-full p-2 border rounded-md text-sm" value={cls.teacher} onChange={e => updateClass(idx, 'teacher', e.target.value)} />
                </div>
                <div>
                   <label className="text-xs font-semibold text-slate-500 mb-1 block">Time</label>
                   <input type="text" className="w-full p-2 border rounded-md text-sm" value={cls.time} onChange={e => updateClass(idx, 'time', e.target.value)} />
                </div>
                <div>
                   <label className="text-xs font-semibold text-slate-500 mb-1 block">Meeting Link</label>
                   <input type="text" className="w-full p-2 border rounded-md text-sm" value={cls.meetLink} onChange={e => updateClass(idx, 'meetLink', e.target.value)} />
                </div>
             </div>
         ))}
      </div>
      {classes.length === 0 && <p className="text-center text-slate-500 py-6">No online classes scheduled.</p>}
    </div>
  );
}

function FeeStructureSettings({ tiers, setTiers }: { tiers: FeeStructureTier[], setTiers: any }) {
  const addTier = () => setTiers([...tiers, { id: Date.now().toString(), tierName: 'New Section', tierSubtitle: '', items: [] }]);
  const updateTier = (idx: number, key: string, value: string) => {
     const up = [...tiers];
     up[idx] = { ...up[idx], [key]: value };
     setTiers(up);
  };
  const removeTier = (idx: number) => {
     const up = [...tiers]; up.splice(idx, 1); setTiers(up);
  };

  const addItem = (tierIdx: number) => {
     const up = [...tiers];
     up[tierIdx].items.push({ id: Date.now().toString(), class: '', admissionFee: '', tuitionFee: '', annualFee: '', totalAnnual: '' });
     setTiers(up);
  };
  const updateItem = (tierIdx: number, itemIdx: number, key: string, value: string) => {
     const up = [...tiers];
     up[tierIdx].items[itemIdx] = { ...up[tierIdx].items[itemIdx], [key]: value };
     setTiers(up);
  };
  const removeItem = (tierIdx: number, itemIdx: number) => {
     const up = [...tiers];
     up[tierIdx].items.splice(itemIdx, 1);
     setTiers(up);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold">Manage Fee Structures</h3>
        <button onClick={addTier} className="flex items-center gap-2 bg-indigo-50 text-indigo-600 px-3 py-1.5 rounded-lg text-sm font-medium">
          <Plus size={16} /> Add Section
        </button>
      </div>

      {tiers.map((tier, tierIdx) => (
         <div key={tier.id} className="border border-slate-200 rounded-xl p-6 relative">
            <button onClick={() => removeTier(tierIdx)} className="absolute top-4 right-4 p-2 text-red-500 bg-red-50 rounded-lg hover:bg-red-100">
               <Trash2 size={16} />
            </button>
            <div className="grid md:grid-cols-2 gap-4 mb-6">
               <div>
                 <label className="text-sm font-semibold text-slate-700 block mb-1">Section Title</label>
                 <input type="text" className="w-full p-2 border rounded-md" value={tier.tierName} onChange={e => updateTier(tierIdx, 'tierName', e.target.value)} />
               </div>
               <div>
                 <label className="text-sm font-semibold text-slate-700 block mb-1">Subtitle</label>
                 <input type="text" className="w-full p-2 border rounded-md" value={tier.tierSubtitle} onChange={e => updateTier(tierIdx, 'tierSubtitle', e.target.value)} />
               </div>
            </div>

            <div className="bg-slate-50 border border-slate-200 rounded-lg p-4">
               <div className="flex justify-between items-center mb-4">
                  <h4 className="font-semibold text-slate-800">Fee Items</h4>
                  <button onClick={() => addItem(tierIdx)} className="text-sm font-medium text-indigo-600 hover:text-indigo-800">
                     + Add Item
                  </button>
               </div>
               <div className="space-y-3">
                  {tier.items.map((item, itemIdx) => (
                     <div key={item.id} className="flex flex-wrap gap-2 items-center bg-white p-3 rounded-md border border-slate-200">
                        <input type="text" placeholder="Class" className="flex-1 min-w-[120px] p-2 text-sm border rounded" value={item.class} onChange={e => updateItem(tierIdx, itemIdx, 'class', e.target.value)} />
                        <input type="text" placeholder="Admission" className="w-28 p-2 text-sm border rounded" value={item.admissionFee} onChange={e => updateItem(tierIdx, itemIdx, 'admissionFee', e.target.value)} />
                        <input type="text" placeholder="Tuition" className="w-28 p-2 text-sm border rounded" value={item.tuitionFee} onChange={e => updateItem(tierIdx, itemIdx, 'tuitionFee', e.target.value)} />
                        <input type="text" placeholder="Annual" className="w-28 p-2 text-sm border rounded" value={item.annualFee} onChange={e => updateItem(tierIdx, itemIdx, 'annualFee', e.target.value)} />
                        <input type="text" placeholder="Total" className="w-28 p-2 text-sm border rounded bg-indigo-50 font-bold" value={item.totalAnnual} onChange={e => updateItem(tierIdx, itemIdx, 'totalAnnual', e.target.value)} />
                        <button onClick={() => removeItem(tierIdx, itemIdx)} className="p-2 text-red-500 hover:bg-red-50 rounded"><Trash2 size={16}/></button>
                     </div>
                  ))}
               </div>
            </div>
         </div>
      ))}
      {tiers.length === 0 && <p className="text-center text-slate-500 py-6">No fee structures defined.</p>}
    </div>
  );
}
