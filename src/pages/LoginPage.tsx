import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { BookOpen, ShieldCheck, Users, GraduationCap, ArrowLeft, ArrowRight, Home } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useWebsite } from '@/context/WebsiteContext';
import { useAuth, UserRole } from '@/context/AuthContext';
import { auth } from '@/firebase';
import { signInWithEmailAndPassword } from 'firebase/auth';

type Role = 'Super Admin' | 'Admin' | 'Teacher' | 'Student' | 'Parent' | null;

export default function LoginPage() {
  const navigate = useNavigate();
  const { settings } = useWebsite();
  const { user, updateUserRole } = useAuth();
  const [selectedRole, setSelectedRole] = useState<Role>(null);
  const [isAnimating, setIsAnimating] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');

  // If already logged in, redirect
  React.useEffect(() => {
    if (user && (user.role === 'Admin' || user.role === 'Super Admin')) {
      navigate('/admin/dashboard');
    } else if (user) {
      if (user.role === 'Student' || user.role === 'Parent') {
        navigate('/admin/results');
      } else {
        navigate('/admin/dashboard');
      }
    }
  }, [user, navigate]);

  const handleRoleSelect = (role: Role) => {
    setSelectedRole(role);
    setErrorMessage('');
  };

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedRole || !username || !password) return;
    
    setIsAnimating(true);
    setErrorMessage('');

    try {
      await signInWithEmailAndPassword(auth, username, password);
      // Wait for auth context to update and redirect via useEffect above
    } catch (error: any) {
      console.error("Authentication error:", error);
      if (error.code === 'auth/user-not-found' || error.code === 'auth/invalid-credential') {
        setErrorMessage('Invalid username or password');
      } else if (error.code === 'auth/operation-not-allowed') {
        setErrorMessage('Developer Error: Email/Password authentication is not enabled in Firebase Console.');
      } else {
        setErrorMessage('Login failed. Please check your credentials.');
      }
      setIsAnimating(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4 relative overflow-hidden">
      {/* Decorative Background */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-blue-400/20 blur-[100px]" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full bg-purple-400/20 blur-[100px]" />
      </div>

      <div className="w-full max-w-5xl grid lg:grid-cols-2 bg-white rounded-[2rem] shadow-2xl overflow-hidden relative z-10 border border-white/50">
        
        {/* Left Side - Brand/Image */}
        <div className="hidden lg:flex flex-col justify-between bg-slate-900 p-12 text-white relative overflow-hidden">
          {/* Abstract graphic */}
          <div className="absolute inset-0 opacity-20">
            <div className="absolute top-20 right-10 w-64 h-64 bg-emerald-500 rounded-full blur-3xl" />
            <div className="absolute bottom-20 left-10 w-80 h-80 bg-blue-500 rounded-full blur-3xl" />
          </div>
          
          <div className="relative z-10 w-full max-w-lg mb-8 lg:mb-0">
             <button 
               onClick={() => navigate('/')} 
               className="flex items-center gap-2 text-slate-400 hover:text-white transition-colors text-sm font-medium mb-12"
             >
               <Home className="w-4 h-4" /> Back to Home
             </button>
             <div className="flex items-center gap-3 mb-8">
               {settings.loginSidebarLogoUrl ? (
                 <img src={settings.loginSidebarLogoUrl} alt={settings.schoolName} className="h-16 object-contain" />
               ) : (
                 <>
                   {settings.logoUrl ? (
                     <img src={settings.logoUrl} alt={settings.schoolName} className="w-10 h-10 object-contain" />
                   ) : (
                     <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white shadow-lg">
                       <BookOpen className="w-6 h-6" />
                     </div>
                   )}
                   <span className="text-2xl font-bold tracking-tight">{settings.schoolName || 'Bhogamur Jatiya Vidya Niketon'}</span>
                 </>
               )}
             </div>
             
             {/* Futuristic School ERP Dashboard Image Frame */}
             <div className="relative group w-full perspective-1000">
               <div className="absolute -inset-2 bg-gradient-to-r from-blue-600 via-indigo-500 to-purple-600 rounded-2xl blur opacity-30 group-hover:opacity-75 transition duration-1000 group-hover:duration-500"></div>
               <div className="relative rounded-2xl border border-white/10 overflow-hidden shadow-2xl shadow-indigo-500/20 bg-slate-900/80 backdrop-blur-md transform transition-transform duration-500 hover:scale-[1.02]">
                 <div className="absolute top-0 left-0 right-0 h-10 bg-black/40 backdrop-blur border-b border-white/10 flex items-center px-4 gap-2 z-10">
                    <div className="flex gap-1.5">
                      <div className="w-3 h-3 rounded-full bg-rose-500/80"></div>
                      <div className="w-3 h-3 rounded-full bg-amber-500/80"></div>
                      <div className="w-3 h-3 rounded-full bg-emerald-500/80"></div>
                    </div>
                    <div className="mx-auto flex items-center gap-2">
                       <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></div>
                       <span className="text-[10px] text-emerald-400 font-mono tracking-widest uppercase">Bhogamur Jatiya Vidya Niketon OS Live</span>
                    </div>
                 </div>
                 
                 <div className="pt-10 relative">
                   <img 
                     src="https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&q=80&w=1200" 
                     alt="School ERP Dashboard Overview" 
                     className="w-full h-auto object-cover opacity-80 mix-blend-screen hover:opacity-100 transition-opacity duration-500"
                     style={{ maskImage: "linear-gradient(to bottom, rgba(0,0,0,1) 60%, rgba(0,0,0,0) 100%)", WebkitMaskImage: "linear-gradient(to bottom, rgba(0,0,0,1) 60%, rgba(0,0,0,0) 100%)" }}
                   />
                   
                   {/* Overlay Elements for Futuristic Feel */}
                   <div className="absolute top-16 left-6 right-6 bottom-16 border border-indigo-500/20 rounded-xl pointer-events-none"></div>
                   <div className="absolute top-20 left-10 p-3 bg-indigo-900/50 backdrop-blur border border-indigo-500/30 rounded-lg text-xs font-mono text-indigo-200 pointer-events-none">
                     [SYSCFG] Opt: ACTIVE
                   </div>
                 </div>
               </div>
             </div>
          </div>

          <div className="relative z-10">
             <div className="p-6 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-md">
               <div className="flex items-center gap-3">
                 <div className="w-10 h-10 rounded-full bg-slate-800">
                    <img src={settings.loginSidebarQuoteAvatarUrl || "https://api.dicebear.com/7.x/avataaars/svg?seed=Principal"} alt={settings.loginSidebarQuoteAuthor} className="w-full h-full object-cover rounded-full" />
                 </div>
                 <div>
                   <p className="text-sm font-bold text-white">{settings.loginSidebarQuoteAuthor}</p>
                   <p className="text-xs text-slate-400">{settings.loginSidebarQuoteRole}</p>
                 </div>
               </div>
             </div>
          </div>
        </div>

        {/* Right Side - Login Form */}
        <div className="p-8 lg:p-12 xl:p-16 flex flex-col justify-center relative">
          <AnimatePresence mode="wait">
            {!selectedRole ? (
              <motion.div
                key="role-selection"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="w-full max-w-md mx-auto relative"
              >
                <div className="flex justify-start lg:hidden mb-8">
                  <button 
                    onClick={() => navigate('/')} 
                    className="flex items-center gap-2 text-slate-500 hover:text-slate-900 transition-colors text-sm font-medium"
                  >
                    <Home className="w-4 h-4" /> Back to Home
                  </button>
                </div>
                <div className="text-center mb-10">
                  <h2 className="text-3xl font-bold text-slate-900 mb-3">{settings.loginBoxTitle || 'Welcome Back'}</h2>
                  <p className="text-slate-500">{settings.loginBoxSubtitle || 'Please select your role to continue securely.'}</p>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <RoleCard role="Super Admin" icon={ShieldCheck} onClick={() => handleRoleSelect('Super Admin')} color="text-amber-600 bg-amber-50 border-amber-100 ring-amber-500" />
                  <RoleCard role="Admin" icon={ShieldCheck} onClick={() => handleRoleSelect('Admin')} color="text-rose-600 bg-rose-50 border-rose-100 ring-rose-500" />
                  <RoleCard role="Teacher" icon={Users} onClick={() => handleRoleSelect('Teacher')} color="text-blue-600 bg-blue-50 border-blue-100 ring-blue-500" />
                  <RoleCard role="Student" icon={GraduationCap} onClick={() => handleRoleSelect('Student')} color="text-emerald-600 bg-emerald-50 border-emerald-100 ring-emerald-500" />
                  <RoleCard role="Parent" icon={Users} onClick={() => handleRoleSelect('Parent')} color="text-purple-600 bg-purple-50 border-purple-100 ring-purple-500" />
                </div>
              </motion.div>
            ) : (
              <motion.div
                key="login-form"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="w-full max-w-md mx-auto"
              >
                <button 
                  onClick={() => setSelectedRole(null)}
                  className="flex items-center gap-2 text-slate-500 hover:text-slate-900 mb-8 transition-colors font-medium text-sm"
                >
                  <ArrowLeft className="w-4 h-4" /> Change Role
                </button>

                <div className="mb-8">
                  <h2 className="text-3xl font-bold text-slate-900 mb-2">{selectedRole} Login</h2>
                  <p className="text-slate-500 text-sm">Enter your credentials to access your account.</p>
                </div>

                <form onSubmit={handleAuth} className="space-y-6">
                  {errorMessage && (
                    <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-600 font-medium text-center">
                      {errorMessage}
                    </div>
                  )}
                  <div className="space-y-1 text-left">
                    <label className="text-sm font-semibold text-slate-700">Email address</label>
                    <input 
                      type="email" 
                      placeholder="e.g. admin@school.com" 
                      value={username}
                      required
                      onChange={(e) => { setUsername(e.target.value); setErrorMessage(''); }}
                      
                      className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all bg-slate-50/50 text-sm"
                    />
                  </div>
                  
                  <div className="space-y-1 text-left">
                    <div className="flex justify-between items-center">
                      <label className="text-sm font-semibold text-slate-700">Password</label>
                      <a href="#" className="text-xs font-semibold text-blue-600 hover:text-blue-700">Forgot password?</a>
                    </div>
                    <input 
                      type="password" 
                      placeholder="••••••••" 
                      value={password}
                      required
                      onChange={(e) => { setPassword(e.target.value); setErrorMessage(''); }}
                      
                      className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all bg-slate-50/50 text-sm"
                    />
                  </div>

                  <div className="flex items-center gap-2">
                    <input type="checkbox" id="remember" className="rounded text-blue-600 focus:ring-blue-500 w-4 h-4" />
                    <label htmlFor="remember" className="text-sm text-slate-600">Remember me</label>
                  </div>

                  <button 
                    disabled={isAnimating}
                    type="submit"
                    className="w-full bg-slate-900 text-white font-bold py-3.5 rounded-xl hover:bg-blue-600 transition-all flex items-center justify-center gap-2 mt-4 shadow-lg hover:shadow-blue-500/30 group"
                  >
                    {isAnimating ? (
                      <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    ) : (
                      <>Sign In with Email <ArrowRight className="w-4 h-4 opacity-70 group-hover:translate-x-1 group-hover:opacity-100 transition-all" /></>
                    )}
                  </button>

                  <div className="relative flex items-center py-2">
                    <div className="flex-grow border-t border-slate-200"></div>
                    <span className="flex-shrink-0 mx-4 text-slate-400 text-xs font-semibold">OR</span>
                    <div className="flex-grow border-t border-slate-200"></div>
                  </div>

                  <button 
                    disabled={isAnimating}
                    type="button"
                    onClick={async () => {
                      setIsAnimating(true);
                      setErrorMessage('');
                      try {
                        const { signInWithPopup } = await import('firebase/auth');
                        const { googleProvider } = await import('@/firebase');
                        const userCredential = await signInWithPopup(auth, googleProvider);
                        
                        // Check if user exists in db
                        const { doc, getDoc, setDoc } = await import('firebase/firestore');
                        const { db } = await import('@/firebase');
                        
                        const userDoc = await getDoc(doc(db, 'users', userCredential.user.uid));
                        let finalRole = selectedRole;
                        if (!userDoc.exists()) {
                          // first time login
                          await setDoc(doc(db, 'users', userCredential.user.uid), {
                            name: userCredential.user.displayName || 'User',
                            email: userCredential.user.email,
                            role: selectedRole,
                            createdAt: new Date().toISOString()
                          });
                        } else {
                          finalRole = userDoc.data()?.role || selectedRole;
                        }
                        
                        if (finalRole === 'Student' || finalRole === 'Parent') {
                          navigate('/admin/results');
                        } else {
                          navigate('/admin/dashboard');
                        }
                      } catch (err: any) {
                        console.error("Google Auth error:", err);
                        setErrorMessage(err.message || 'Failed to sign in with Google');
                        setIsAnimating(false);
                      }
                    }}
                    className="w-full bg-white text-slate-700 border border-slate-200 font-bold py-3.5 rounded-xl hover:bg-slate-50 transition-all flex items-center justify-center gap-3 shadow-sm hover:shadow group"
                  >
                    <svg className="w-5 h-5" viewBox="0 0 24 24">
                      <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                      <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                      <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                      <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                    </svg>
                    Continue with Google
                  </button>
                  
                  {selectedRole === 'Super Admin' && (
                    <div className="text-center mt-4">
                      <button 
                        type="button" 
                        onClick={async () => {
                          if (!username || !password) {
                            setErrorMessage('Please enter email and password to sign up.');
                            return;
                          }
                          setIsAnimating(true);
                          setErrorMessage('');
                          try {
                            const { createUserWithEmailAndPassword } = await import('firebase/auth');
                            const userCredential = await createUserWithEmailAndPassword(auth, username, password);
                            
                            // Set role to Super Admin
                            const { doc, setDoc } = await import('firebase/firestore');
                            const { db } = await import('@/firebase');
                            await setDoc(doc(db, 'users', userCredential.user.uid), {
                              name: 'Super Administrator',
                              email: username,
                              role: 'Super Admin',
                              createdAt: new Date().toISOString()
                            });
                            
                            navigate('/admin/dashboard');
                          } catch (err: any) {
                            console.error(err);
                            setErrorMessage(err.message || 'Failed to sign up');
                            setIsAnimating(false);
                          }
                        }}
                        className="text-sm font-semibold text-blue-600 hover:text-blue-700 transition-colors"
                      >
                        First time? Create initial Super Admin account
                      </button>
                    </div>
                  )}
                </form>
                
                {/* For demo purposes */}
                <div className="mt-8 p-4 bg-amber-50 border border-amber-200 rounded-xl">
                  <p className="text-xs text-amber-800 font-medium text-center">
                    Firebase Login enabled: Use your valid email and password to access the dashboard.
                  </p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}

function RoleCard({ role, icon: Icon, onClick, color }: any) {
  return (
    <button 
      onClick={onClick}
      className="flex flex-col items-center justify-center p-6 border border-slate-200 rounded-2xl hover:border-transparent hover:shadow-lg transition-all focus:outline-none focus:ring-2 bg-white group cursor-pointer h-36"
    >
      <div className={cn("w-14 h-14 rounded-full flex items-center justify-center mb-4 transition-transform group-hover:scale-110", color.split(' ')[1], color.split(' ')[0])}>
        <Icon className="w-7 h-7" />
      </div>
      <span className="font-bold text-slate-800">{role}</span>
    </button>
  );
}

