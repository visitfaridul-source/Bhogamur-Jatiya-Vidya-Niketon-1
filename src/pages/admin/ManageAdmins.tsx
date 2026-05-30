import React, { useState, useEffect } from 'react';
import { useAuth, UserRole } from '@/context/AuthContext';
import { 
  ShieldCheck, 
  UserPlus, 
  Plus, 
  Trash2, 
  KeyRound, 
  CheckCircle2, 
  Pencil, 
  AlertCircle, 
  Send,
  User,
  Mail,
  Lock
} from 'lucide-react';
import { initializeApp } from 'firebase/app';
import { 
  getAuth, 
  createUserWithEmailAndPassword, 
  sendPasswordResetEmail,
  updateEmail as authUpdateEmail,
  updatePassword as authUpdatePassword
} from 'firebase/auth';
import { collection, getDocs, doc, setDoc, deleteDoc, updateDoc } from 'firebase/firestore';
import { db, auth, firebaseConfig, handleFirestoreError, OperationType } from '@/firebase';

// Create secondary app to create users without logging out the current admin
const secondaryApp = initializeApp(firebaseConfig, 'SecondaryApp');
const secondaryAuth = getAuth(secondaryApp);

export default function ManageAdmins() {
  const { user, updateUserRole } = useAuth();
  
  // State for user list
  const [usersList, setUsersList] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  // Modal states for Add/Edit
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false);
  
  // Modals data
  const [selectedUser, setSelectedUser] = useState<any>(null);
  
  // Messages states
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  // Form states
  const [formData, setFormData] = useState({
    name: '',
    username: '',
    password: '',
    role: 'Teacher' as UserRole,
    attendanceScope: 'All' as 'All' | 'Only Students' | 'Teachers' | 'Staff',
  });

  const [editFormData, setEditFormData] = useState({
    uid: '',
    name: '',
    email: '',
    role: 'Teacher' as UserRole,
    attendanceScope: 'All' as 'All' | 'Only Students' | 'Teachers' | 'Staff',
  });

  // Self Profile states
  const [selfName, setSelfName] = useState('');
  const [selfEmail, setSelfEmail] = useState('');
  const [selfPassword, setSelfPassword] = useState('');
  const [selfSuccessMsg, setSelfSuccessMsg] = useState('');
  const [selfErrorMsg, setSelfErrorMsg] = useState('');
  const [isSavingSelf, setIsSavingSelf] = useState(false);

  // Make sure to load self profile details once user context is ready
  useEffect(() => {
    if (user) {
      setSelfName(user.name || '');
      setSelfEmail(user.username || '');
    }
  }, [user]);

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
      let userSnapshot;
      try {
        userSnapshot = await getDocs(usersCol);
      } catch (err) {
        handleFirestoreError(err, OperationType.LIST, 'users');
        return;
      }
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

  // Handle addition of new user credentials
  const handleSubmitAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');
    setIsSaving(true);
    
    try {
      // Create user in Auth on secondaryApp
      const userCredential = await createUserWithEmailAndPassword(secondaryAuth, formData.username, formData.password);
      
      // Save details to users collection in Firestore
      try {
        await setDoc(doc(db, 'users', userCredential.user.uid), {
          name: formData.name,
          email: formData.username, // Save username/email so it's searchable and editable!
          role: formData.role,
          attendanceScope: formData.attendanceScope,
          createdAt: new Date().toISOString()
        }, { merge: true });
      } catch (err) {
        handleFirestoreError(err, OperationType.WRITE, `users/${userCredential.user.uid}`);
      }
      
      setSuccessMsg(`Successfully created user: ${formData.name}`);
      setIsAddModalOpen(false);
      setFormData({ name: '', username: '', password: '', role: 'Teacher', attendanceScope: 'All' });
      fetchUsers();
    } catch (err: any) {
      console.error("Error creating user:", err);
      const errMsgString = err.message || '';
      if (err.code === 'auth/email-already-in-use' || errMsgString.includes('email-already-in-use')) {
        setErrorMsg('Email address is already in use! Please choose a different email address.');
      } else if (err.code === 'auth/weak-password' || errMsgString.includes('weak-password')) {
        setErrorMsg('Password should be at least 6 characters.');
      } else {
        setErrorMsg(err.message || 'Failed to create user');
      }
    } finally {
      setIsSaving(false);
    }
  };

  // Handle editing of an existing user's details
  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');
    setIsSaving(true);

    try {
      const userRef = doc(db, 'users', editFormData.uid);
      try {
        await setDoc(userRef, {
          name: editFormData.name,
          email: editFormData.email,
          role: editFormData.role,
          attendanceScope: editFormData.attendanceScope,
          updatedAt: new Date().toISOString()
        }, { merge: true });
      } catch (err) {
        handleFirestoreError(err, OperationType.WRITE, `users/${editFormData.uid}`);
      }

      setSuccessMsg(`Successfully updated user: ${editFormData.name}`);
      setIsEditModalOpen(false);
      fetchUsers();
    } catch (err: any) {
      console.error("Error updating user details:", err);
      setErrorMsg(err.message || 'Failed to update user details');
    } finally {
      setIsSaving(false);
    }
  };

  // Send Password Reset Email
  const handleSendResetPassword = async (email: string) => {
    if (!email) {
      alert("No email registered for this user.");
      return;
    }
    try {
      await sendPasswordResetEmail(auth, email);
      alert(`Password reset link has been successfully dispatched to: ${email}`);
    } catch (err: any) {
      console.error("Error sending reset password:", err);
      alert(`Error resetting password: ${err.message}`);
    }
  };

  // Handle deletion of a user card
  const handleDeleteSubmit = async () => {
    if (!selectedUser) return;
    setIsSaving(true);
    setErrorMsg('');

    try {
      const userDocRef = doc(db, 'users', selectedUser.uid);
      try {
        await deleteDoc(userDocRef);
      } catch (err) {
        handleFirestoreError(err, OperationType.DELETE, `users/${selectedUser.uid}`);
      }
      setSuccessMsg(`Successfully deleted and revoked role for: ${selectedUser.name}`);
      setIsDeleteConfirmOpen(false);
      setSelectedUser(null);
      fetchUsers();
    } catch (err: any) {
      console.error("Error deleting user:", err);
      setErrorMsg(err.message || 'Failed to delete user');
    } finally {
      setIsSaving(false);
    }
  };

  // Handle currently logged-in user updating their own credentials
  const handleSelfUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setSelfErrorMsg('');
    setSelfSuccessMsg('');
    setIsSavingSelf(true);

    const currentUser = auth.currentUser;
    if (!currentUser) {
      setSelfErrorMsg('Not authenticated');
      setIsSavingSelf(false);
      return;
    }

    try {
      // 1. If name changed, update Firestore doc
      if (selfName !== user?.name) {
        try {
          await setDoc(doc(db, 'users', currentUser.uid), {
            name: selfName,
            updatedAt: new Date().toISOString()
          }, { merge: true });
        } catch (err) {
          handleFirestoreError(err, OperationType.WRITE, `users/${currentUser.uid}`);
        }
      }

      // 2. If email changed, update in Firebase Authentication and Firestore
      if (selfEmail !== currentUser.email && selfEmail.trim() !== '') {
        await authUpdateEmail(currentUser, selfEmail.trim());
        try {
          await setDoc(doc(db, 'users', currentUser.uid), {
            email: selfEmail.trim(),
            updatedAt: new Date().toISOString()
          }, { merge: true });
        } catch (err) {
          handleFirestoreError(err, OperationType.WRITE, `users/${currentUser.uid}`);
        }
      }

      // 3. If password provided, update Password in Firebase Auth
      if (selfPassword.trim() !== '') {
        if (selfPassword.length < 6) {
          throw new Error('New Password must be at least 6 characters long.');
        }
        await authUpdatePassword(currentUser, selfPassword.trim());
        setSelfPassword(''); // clear password field
      }

      setSelfSuccessMsg('My Account Credentials updated successfully.');
      
      // Force reload page / state to stay in sync
      setTimeout(() => {
        window.location.reload();
      }, 1500);

    } catch (err: any) {
      console.error("Error updating self profile:", err);
      if (err.code === 'auth/requires-recent-login') {
        setSelfErrorMsg('For security, updating login email/password requires a recent login session. Please logout, log back in, and retry updating immediately.');
      } else if (err.code === 'auth/email-already-in-use') {
        setSelfErrorMsg('The email address you specified is already registered to another user account. Please use a unique email address.');
      } else {
        setSelfErrorMsg(err.message || 'Failed to update credentials. Please check your data.');
      }
    } finally {
      setIsSavingSelf(false);
    }
  };

  return (
    <div className="space-y-8">
      {/* Upper Panel */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center bg-white p-6 rounded-2xl shadow-sm border border-slate-100 gap-4">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-amber-100 text-amber-600 rounded-xl flex items-center justify-center shadow-inner">
            <KeyRound className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-slate-800">User Credentials</h1>
            <p className="text-slate-500 text-sm">Manage emails, roles, and login details for school users</p>
          </div>
        </div>
        
        <button 
          onClick={() => {
            setFormData({ name: '', username: '', password: '', role: 'Teacher', attendanceScope: 'All' });
            setErrorMsg('');
            setSuccessMsg('');
            setIsAddModalOpen(true);
          }}
          className="flex items-center gap-2 bg-indigo-600 text-white px-5 py-2.5 rounded-xl hover:bg-indigo-700 transition shadow-lg shadow-indigo-600/20 font-semibold text-sm cursor-pointer"
        >
          <Plus className="w-5 h-5" /> Add New Credentials
        </button>
      </div>

      {successMsg && (
        <div className="bg-emerald-50 border border-emerald-200 text-emerald-700 px-4 py-3 rounded-xl flex items-center gap-3 shadow-sm">
          <CheckCircle2 className="w-5 h-5 flex-shrink-0" />
          <p className="text-sm font-semibold">{successMsg}</p>
        </div>
      )}

      <div className="grid lg:grid-cols-3 gap-8">
        
        {/* Table/List of users on left side (Col span 2) */}
        <div className="lg:col-span-2 space-y-4">
          <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
            <div className="p-5 border-b border-slate-100">
              <h2 className="text-lg font-bold text-slate-800">Registered System Users</h2>
              <p className="text-slate-400 text-xs">Verify login details and authorization rights below</p>
            </div>
            
            {isLoading ? (
              <div className="p-12 text-center text-slate-500 flex flex-col items-center">
                 <div className="w-8 h-8 border-4 border-slate-200 border-t-indigo-600 rounded-full animate-spin mb-4"></div>
                 <p className="font-medium text-sm">Loading credentials from database...</p>
              </div>
            ) : usersList.length === 0 ? (
              <div className="p-12 text-center text-slate-400 flex flex-col items-center">
                <UserPlus className="w-12 h-12 text-slate-300 mb-3" />
                <p className="text-lg font-semibold">No registered users</p>
                <p className="text-sm">Click "Add New Credentials" to invite staff.</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead className="bg-slate-50/50 border-b border-slate-100 text-slate-500 font-semibold text-xs uppercase tracking-wider">
                    <tr>
                      <th className="p-4 pl-6">User/Identity</th>
                      <th className="p-4">Authorization</th>
                      <th className="p-4">User ID (UID)</th>
                      <th className="p-4 text-right pr-6">Manage</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {usersList.map(usr => (
                      <tr key={usr.uid} className="hover:bg-slate-50/30 transition">
                        <td className="p-4 pl-6">
                          <div className="flex flex-col">
                            <span className="font-bold text-slate-800 text-sm">{usr.name || 'Anonymous User'}</span>
                            <span className="text-xs text-slate-500 font-medium flex items-center gap-1 mt-0.5">
                              <Mail className="w-3 h-3 text-slate-400" />
                              {usr.email || 'No email saved'}
                            </span>
                          </div>
                        </td>
                        <td className="p-4">
                          <div className="flex flex-col items-start gap-1">
                            <span className={`px-2.5 py-1 rounded-lg text-xs font-semibold uppercase ring-1 ${
                              usr.role === 'Super Admin' ? 'bg-amber-50 text-amber-700 ring-amber-600/10' : 
                              usr.role === 'Admin' ? 'bg-rose-50 text-rose-700 ring-rose-600/10' : 
                              usr.role === 'Teacher' ? 'bg-indigo-50 text-indigo-700 ring-indigo-600/10' : 
                              usr.role === 'Student' ? 'bg-emerald-50 text-emerald-700 ring-emerald-600/10' : 
                              'bg-purple-50 text-purple-700 ring-purple-600/10'
                            }`}>
                              {usr.role || 'Unassigned'}
                            </span>
                            {(usr.role === 'Super Admin' || usr.role === 'Admin' || usr.role === 'Teacher') && (
                              <span className="text-[10px] text-slate-500 font-medium">
                                Take Attendance: <strong className="text-indigo-600 font-semibold bg-indigo-50/50 px-1 py-0.2 rounded border border-indigo-100">{usr.attendanceScope || 'All'}</strong>
                              </span>
                            )}
                          </div>
                        </td>
                        <td className="p-4 text-slate-400 font-mono text-xs">{usr.uid}</td>
                        <td className="p-4 pr-6">
                          <div className="flex justify-end gap-2">
                            <button 
                              onClick={() => {
                                setEditFormData({
                                  uid: usr.uid,
                                  name: usr.name || '',
                                  email: usr.email || '',
                                  role: usr.role || 'Teacher',
                                  attendanceScope: usr.attendanceScope || 'All'
                                });
                                setErrorMsg('');
                                setSuccessMsg('');
                                setIsEditModalOpen(true);
                              }}
                              title="Edit user settings"
                              className="p-1 px-2.5 rounded-lg bg-slate-100 text-slate-600 hover:bg-slate-200 transition text-xs font-semibold flex items-center gap-1 cursor-pointer"
                            >
                              <Pencil className="w-3 h-3" /> Edit
                            </button>
                            {usr.uid !== user?.uid && (
                              <button 
                                onClick={() => {
                                  setSelectedUser(usr);
                                  setIsDeleteConfirmOpen(true);
                                }}
                                title="Delete user"
                                className="p-1.5 rounded-lg text-red-600 bg-red-50 hover:bg-red-100 transition cursor-pointer"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>

        {/* Update Own Credentials section on right side (Col span 1) */}
        <div className="space-y-6">
          <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6">
            <div className="flex items-center gap-3 mb-4 pb-3 border-b border-slate-100">
              <div className="w-10 h-10 bg-indigo-50 text-indigo-600 rounded-xl flex items-center justify-center">
                <User className="w-5 h-5" />
              </div>
              <div>
                <h2 className="font-bold text-slate-800 text-base">My Profile Security</h2>
                <p className="text-slate-400 text-xs">Update your own login credentials</p>
              </div>
            </div>

            {selfSuccessMsg && (
              <div className="bg-emerald-50 border border-emerald-100 text-emerald-700 p-3 rounded-xl flex items-center gap-2 mb-4 text-xs font-semibold">
                <CheckCircle2 className="w-4 h-4" />
                <span>{selfSuccessMsg}</span>
              </div>
            )}

            {selfErrorMsg && (
              <div className="bg-red-50 border border-red-100 text-red-600 p-3 rounded-xl flex flex-col gap-1 mb-4 text-xs font-medium">
                <span className="font-bold flex items-center gap-1"><AlertCircle className="w-4 h-4 text-red-500" /> Action Required</span>
                <span className="leading-relaxed">{selfErrorMsg}</span>
              </div>
            )}

            <form onSubmit={handleSelfUpdate} className="space-y-4">
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-600 uppercase">My Name</label>
                <div className="relative">
                  <User className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                  <input 
                    type="text"
                    value={selfName}
                    onChange={e => setSelfName(e.target.value)}
                    required
                    placeholder="Enter your registered name"
                    className="w-full pl-9 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:bg-white focus:outline-none focus:border-indigo-500"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-600 uppercase">My Login Email</label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                  <input 
                    type="email"
                    value={selfEmail}
                    onChange={e => setSelfEmail(e.target.value)}
                    required
                    placeholder="name@school.com"
                    className="w-full pl-9 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:bg-white focus:outline-none focus:border-indigo-500"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-600 uppercase">New Password</label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                  <input 
                    type="password"
                    value={selfPassword}
                    onChange={e => setSelfPassword(e.target.value)}
                    placeholder="Leave blank to keep current"
                    minLength={6}
                    className="w-full pl-9 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:bg-white focus:outline-none focus:border-indigo-500"
                  />
                </div>
                <p className="text-[10px] text-slate-400 italic">Must be at least 6 characters long</p>
              </div>

              <button 
                type="submit"
                disabled={isSavingSelf}
                className="w-full bg-slate-900 text-white rounded-xl py-2.5 font-bold hover:bg-black transition text-sm flex items-center justify-center gap-2 shadow-md cursor-pointer mt-2"
              >
                {isSavingSelf ? (
                  <div className="w-4 h-4 border-2 border-white/50 border-t-white rounded-full animate-spin"></div>
                ) : 'Save My Credentials'}
              </button>
            </form>
          </div>
        </div>
      </div>

      {/* MODAL: ADD NEW USER */}
      {isAddModalOpen && (
        <div className="fixed inset-0 bg-slate-950/40 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl relative">
            <h2 className="text-2xl font-bold text-slate-800 mb-2">Create User Credentials</h2>
            <p className="text-slate-400 text-xs mb-6">Provision access rights for school members safely</p>
            
            <form onSubmit={handleSubmitAdd} className="space-y-4">
              {errorMsg && (
                 <div className="bg-red-50 text-red-650 text-xs font-semibold p-3 rounded-xl border border-red-100 flex items-start gap-2">
                    <AlertCircle className="w-4 h-4 text-red-500 flex-shrink-0 mt-0.5" />
                    <span>{errorMsg}</span>
                 </div>
              )}

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-600 uppercase">Access Authorization Role</label>
                <select 
                  value={formData.role}
                  onChange={e => setFormData({...formData, role: e.target.value as UserRole})}
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:bg-white focus:border-indigo-500"
                  required
                >
                  <option value="Super Admin">Super Admin</option>
                  <option value="Admin">Admin (Administrator)</option>
                  <option value="Teacher">Teacher</option>
                  <option value="Student">Student</option>
                  <option value="Parent">Parent</option>
                </select>
              </div>

              {(formData.role === 'Super Admin' || formData.role === 'Admin' || formData.role === 'Teacher') && (
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-600 uppercase">Take Attendance Permission</label>
                  <select 
                    value={formData.attendanceScope}
                    onChange={e => setFormData({...formData, attendanceScope: e.target.value as any})}
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:bg-white focus:border-indigo-500 text-indigo-700 font-semibold"
                    required
                  >
                    <option value="All">All (Students, Teachers & Staff)</option>
                    <option value="Only Students">Only Students</option>
                    <option value="Teachers">Teachers</option>
                    <option value="Staff">Staff (Other Staff)</option>
                  </select>
                </div>
              )}

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-600 uppercase">User's Full Name</label>
                <input 
                  type="text" 
                  value={formData.name}
                  onChange={e => setFormData({...formData, name: e.target.value})}
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:bg-white focus:border-indigo-500"
                  placeholder="e.g. Professor Smith"
                  required 
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-600 uppercase">User's login Email</label>
                <input 
                  type="email" 
                  value={formData.username}
                  onChange={e => setFormData({...formData, username: e.target.value})}
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:bg-white focus:border-indigo-500"
                  placeholder="e.g. smith@school.com"
                  required 
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-600 uppercase">Temporary Password</label>
                <input 
                  type="password" 
                  value={formData.password}
                  onChange={e => setFormData({...formData, password: e.target.value})}
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:bg-white focus:border-indigo-500"
                  placeholder="At least 6 characters"
                  required
                  minLength={6}
                />
              </div>
              
              <div className="pt-4 flex gap-3">
                <button 
                  type="button"
                  disabled={isSaving}
                  onClick={() => setIsAddModalOpen(false)}
                  className="flex-1 px-4 py-2.5 rounded-xl font-bold text-slate-600 bg-slate-100 hover:bg-slate-200 transition text-sm cursor-pointer"
                >
                  Cancel
                </button>
                <button 
                  type="submit"
                  disabled={isSaving}
                  className="flex-1 px-4 py-2.5 rounded-xl font-bold text-white bg-indigo-600 hover:bg-indigo-700 transition flex items-center justify-center gap-2 shadow-lg shadow-indigo-600/20 text-sm cursor-pointer"
                >
                  {isSaving && <div className="w-4 h-4 border-2 border-white/50 border-t-white rounded-full animate-spin"></div>}
                  Create User
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: EDIT USER (ROLE & NAME & PASS RESET) */}
      {isEditModalOpen && (
        <div className="fixed inset-0 bg-slate-950/40 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl relative">
            <h2 className="text-2xl font-bold text-slate-800 mb-2">Edit User Settings</h2>
            <p className="text-slate-400 text-xs mb-6">Modify system authorization level and base details</p>

            <form onSubmit={handleEditSubmit} className="space-y-4">
              {errorMsg && (
                 <div className="bg-red-50 text-red-650 text-xs font-semibold p-3 rounded-xl border border-red-100 flex items-start gap-2">
                    <AlertCircle className="w-4 h-4 text-red-500 flex-shrink-0 mt-0.5" />
                    <span>{errorMsg}</span>
                 </div>
              )}

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-600 uppercase">Access Authorization Role</label>
                <select 
                  value={editFormData.role}
                  onChange={e => setEditFormData({...editFormData, role: e.target.value as UserRole})}
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:bg-white focus:border-indigo-500"
                  required
                >
                  <option value="Super Admin">Super Admin</option>
                  <option value="Admin">Admin (Administrator)</option>
                  <option value="Teacher">Teacher</option>
                  <option value="Student">Student</option>
                  <option value="Parent">Parent</option>
                </select>
              </div>

              {(editFormData.role === 'Super Admin' || editFormData.role === 'Admin' || editFormData.role === 'Teacher') && (
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-600 uppercase">Take Attendance Permission</label>
                  <select 
                    value={editFormData.attendanceScope}
                    onChange={e => setEditFormData({...editFormData, attendanceScope: e.target.value as any})}
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:bg-white focus:border-indigo-500 text-indigo-700 font-semibold"
                    required
                  >
                    <option value="All">All (Students, Teachers & Staff)</option>
                    <option value="Only Students">Only Students</option>
                    <option value="Teachers">Teachers</option>
                    <option value="Staff">Staff (Other Staff)</option>
                  </select>
                </div>
              )}

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-600 uppercase">User's Full Name</label>
                <input 
                  type="text" 
                  value={editFormData.name}
                  onChange={e => setEditFormData({...editFormData, name: e.target.value})}
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:bg-white focus:border-indigo-500"
                  required 
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-600 uppercase">User's login Email</label>
                <input 
                  type="email" 
                  value={editFormData.email}
                  onChange={e => setEditFormData({...editFormData, email: e.target.value})}
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:bg-white focus:border-indigo-500"
                  required 
                />
              </div>

              <div className="bg-amber-50 rounded-xl p-4 border border-amber-150 space-y-2 mt-4">
                <p className="text-xs font-bold text-amber-800 flex items-center gap-1.5 uppercase">
                  <KeyRound className="w-4 h-4 text-amber-600" /> Account Security Access
                </p>
                <p className="text-[11px] text-slate-600 leading-relaxed">
                  To protect login integrity, standard client-side SDKs do not allow updating other users' passwords directly.
                </p>
                <button 
                  type="button"
                  onClick={() => handleSendResetPassword(editFormData.email)}
                  className="w-full mt-1 bg-amber-600 hover:bg-amber-700 text-white font-bold py-2 rounded-lg text-xs transition flex items-center justify-center gap-2 cursor-pointer shadow-sm"
                >
                  <Send className="w-3 h-3" /> Ship Password Reset Email
                </button>
              </div>

              <div className="pt-4 flex gap-3">
                <button 
                  type="button"
                  disabled={isSaving}
                  onClick={() => setIsEditModalOpen(false)}
                  className="flex-1 px-4 py-2.5 rounded-xl font-bold text-slate-600 bg-slate-100 hover:bg-slate-200 transition text-sm cursor-pointer"
                >
                  Cancel
                </button>
                <button 
                  type="submit"
                  disabled={isSaving}
                  className="flex-1 px-4 py-2.5 rounded-xl font-bold text-white bg-indigo-600 hover:bg-indigo-700 transition flex items-center justify-center gap-2 shadow-lg shadow-indigo-600/20 text-sm cursor-pointer"
                >
                  {isSaving && <div className="w-4 h-4 border-2 border-white/50 border-t-white rounded-full animate-spin"></div>}
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: DELETE CONFIRMATION */}
      {isDeleteConfirmOpen && selectedUser && (
        <div className="fixed inset-0 bg-slate-950/40 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-sm w-full shadow-2xl text-center">
            <div className="w-12 h-12 bg-red-150 text-red-650 rounded-full flex items-center justify-center mx-auto mb-4 text-xl font-bold">
               ⚠️
            </div>
            <h3 className="text-lg font-bold text-slate-900 mb-2">Revoke Credentials?</h3>
            <p className="text-sm text-slate-500 leading-relaxed mb-6">
              Are you sure you want to delete <span className="font-bold text-slate-800">{selectedUser.name}</span>? This will wipe their status and access control rights instantly.
            </p>

            <div className="flex gap-3">
              <button 
                type="button"
                disabled={isSaving}
                onClick={() => {
                  setIsDeleteConfirmOpen(false);
                  setSelectedUser(null);
                }}
                className="flex-1 bg-slate-100 hover:bg-slate-200 text-slate-600 font-bold py-2.5 rounded-xl text-sm transition cursor-pointer"
              >
                Go Back
              </button>
              <button 
                type="button"
                disabled={isSaving}
                onClick={handleDeleteSubmit}
                className="flex-1 bg-red-600 hover:bg-red-700 text-white font-bold py-2.5 rounded-xl text-sm transition flex items-center justify-center gap-1 cursor-pointer"
              >
                {isSaving && <div className="w-3 h-3 border-2 border-white/50 border-t-white rounded-full animate-spin mr-1"></div>}
                Yes, Delete
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
