import React, { useState, useEffect } from 'react';
import { useAuth, UserRole } from '@/context/AuthContext';
import { ShieldCheck, UserPlus, Plus, Trash2, KeyRound, CheckCircle2 } from 'lucide-react';
import { initializeApp } from 'firebase/app';
import { getAuth, createUserWithEmailAndPassword } from 'firebase/auth';
import { collection, getDocs, doc, setDoc } from 'firebase/firestore';
import { db, firebaseConfig } from '@/firebase';

// Create secondary app to create users without logging out the current admin
const secondaryApp = initializeApp(firebaseConfig, 'SecondaryApp');
const secondaryAuth = getAuth(secondaryApp);

export default function ManageAdmins() {
  const { user } = useAuth();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [usersList, setUsersList] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  const [formData, setFormData] = useState({
    name: '',
    username: '',
    password: '',
    role: 'Teacher' as UserRole,
  });

  // Both Super Admin and Admin can access
  if (user?.role !== 'Super Admin' && user?.role !== 'Admin') {
    return (
      <div className="flex flex-col items-center justify-center h-full text-slate-500 gap-4">
        <ShieldCheck className="w-16 h-16 text-slate-300" />
        <h2 className="text-2xl font-bold">Access Denied</h2>
        <p>Only Administrators can manage user credentials.</p>
      </div>
    );
  }

  const fetchUsers = async () => {
    setIsLoading(true);
    try {
      const usersCol = collection(db, 'users');
      const userSnapshot = await getDocs(usersCol);
      const userList = userSnapshot.docs.map(doc => ({
        uid: doc.id,
        ...doc.data()
      }));
      setUsersList(userList);
    } catch (err) {
      console.error("Error fetching users:", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');
    setIsSaving(true);
    
    try {
      // Create user in Auth
      const userCredential = await createUserWithEmailAndPassword(secondaryAuth, formData.username, formData.password);
      
      // Save info in Firestore
      await setDoc(doc(db, 'users', userCredential.user.uid), {
        name: formData.name,
        role: formData.role,
        createdAt: new Date().toISOString()
      }, { merge: true });
      
      setSuccessMsg(`Successfully created user: ${formData.name}`);
      setIsModalOpen(false);
      setFormData({ name: '', username: '', password: '', role: 'Teacher' });
      fetchUsers();
    } catch (err: any) {
      console.error("Error creating user:", err);
      if (err.code === 'auth/email-already-in-use') {
        setErrorMsg('Email address stands already in use!');
      } else if (err.code === 'auth/weak-password') {
        setErrorMsg('Password should be at least 6 characters.');
      } else {
        setErrorMsg(err.message || 'Failed to create user');
      }
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-amber-100 text-amber-600 rounded-xl flex items-center justify-center">
            <KeyRound className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-slate-800">User Credentials</h1>
            <p className="text-slate-500 text-sm">Manage login details for {user?.role === 'Super Admin' ? 'all users' : 'school users'}</p>
          </div>
        </div>
        
        <button 
          onClick={() => {
            setFormData({ name: '', username: '', password: '', role: 'Teacher' });
            setErrorMsg('');
            setSuccessMsg('');
            setIsModalOpen(true);
          }}
          className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-xl hover:bg-blue-700 transition"
        >
          <Plus className="w-5 h-5" /> Add User
        </button>
      </div>

      {successMsg && (
        <div className="bg-emerald-50 border border-emerald-200 text-emerald-700 px-4 py-3 rounded-xl flex items-center gap-3">
          <CheckCircle2 className="w-5 h-5" />
          <p className="text-sm font-semibold">{successMsg}</p>
        </div>
      )}

      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
        {isLoading ? (
          <div className="p-12 text-center text-slate-500 flex flex-col items-center">
             <div className="w-8 h-8 border-4 border-slate-200 border-t-blue-600 rounded-full animate-spin mb-4"></div>
             <p className="font-medium">Loading remote users...</p>
          </div>
        ) : usersList.length === 0 ? (
          <div className="p-12 text-center text-slate-500 flex flex-col items-center">
            <UserPlus className="w-12 h-12 text-slate-300 mb-3" />
            <p className="text-lg font-medium">No system users found</p>
            <p className="text-sm">Click "Add User" to create manual login credentials.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-slate-50 border-b border-slate-100 text-slate-500 font-semibold text-sm">
                <tr>
                  <th className="p-4 pl-6">Role</th>
                  <th className="p-4">Name</th>
                  <th className="p-4">User ID (UID)</th>
                  <th className="p-4 text-right pr-6">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {usersList.map(usr => (
                  <tr key={usr.uid} className="hover:bg-slate-50/50 transition">
                    <td className="p-4 pl-6">
                      <span className={`px-2.5 py-1 rounded-lg text-xs font-bold ring-1 ${
                        usr.role === 'Super Admin' ? 'bg-amber-50 text-amber-700 ring-amber-600/20' : 
                        usr.role === 'Admin' ? 'bg-rose-50 text-rose-700 ring-rose-600/20' : 
                        usr.role === 'Teacher' ? 'bg-blue-50 text-blue-700 ring-blue-600/20' : 
                        usr.role === 'Student' ? 'bg-emerald-50 text-emerald-700 ring-emerald-600/20' : 
                        'bg-purple-50 text-purple-700 ring-purple-600/20'
                      }`}>
                        {usr.role}
                      </span>
                    </td>
                    <td className="p-4 text-slate-800 font-medium">{usr.name}</td>
                    <td className="p-4 text-slate-500 font-mono text-xs">{usr.uid}</td>
                    <td className="p-4 pr-6 flex justify-end gap-2">
                       <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-2 py-1 rounded-md">Active</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl">
            <h2 className="text-2xl font-bold text-slate-800 mb-6">
              Create User Credential
            </h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              
              {errorMsg && (
                 <div className="bg-red-50 text-red-600 text-sm font-medium p-3 rounded-xl border border-red-200">
                    {errorMsg}
                 </div>
              )}

              <div className="space-y-1">
                <label className="text-sm font-semibold text-slate-700">Role</label>
                <select 
                  value={formData.role}
                  onChange={e => setFormData({...formData, role: e.target.value as UserRole})}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-500 outline-none"
                  required
                >
                  <option value="Super Admin">Super Admin</option>
                  <option value="Admin">Admin (Administrator)</option>
                  <option value="Teacher">Teacher</option>
                  <option value="Student">Student</option>
                  <option value="Parent">Parent</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-sm font-semibold text-slate-700">Full Name</label>
                <input 
                  type="text" 
                  value={formData.name}
                  onChange={e => setFormData({...formData, name: e.target.value})}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-500 outline-none"
                  required 
                />
              </div>
              <div className="space-y-1">
                <label className="text-sm font-semibold text-slate-700">Email Address (Login ID)</label>
                <input 
                  type="email" 
                  value={formData.username}
                  onChange={e => setFormData({...formData, username: e.target.value})}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-500 outline-none"
                  required 
                />
              </div>
              <div className="space-y-1">
                <label className="text-sm font-semibold text-slate-700">Password</label>
                <input 
                  type="password" 
                  value={formData.password}
                  onChange={e => setFormData({...formData, password: e.target.value})}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-500 outline-none"
                  required
                  minLength={6}
                />
              </div>
              
              <div className="pt-4 flex gap-3">
                <button 
                  type="button"
                  disabled={isSaving}
                  onClick={() => setIsModalOpen(false)}
                  className="flex-1 px-4 py-2.5 rounded-xl font-bold text-slate-600 bg-slate-100 hover:bg-slate-200 transition"
                >
                  Cancel
                </button>
                <button 
                  type="submit"
                  disabled={isSaving}
                  className="flex-1 px-4 py-2.5 rounded-xl font-bold text-white bg-blue-600 hover:bg-blue-700 transition shadow-lg shadow-blue-500/30 flex items-center justify-center gap-2"
                >
                  {isSaving && <div className="w-4 h-4 border-2 border-white/50 border-t-white rounded-full animate-spin"></div>}
                  Save User
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
