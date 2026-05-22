import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { auth, db } from '../firebase';
import { onAuthStateChanged, signOut as firebaseSignOut, User as FirebaseUser } from 'firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore';

export type UserRole = 'Super Admin' | 'Admin' | 'Teacher' | 'Student' | 'Parent';

interface User {
  role: UserRole;
  name: string;
  username?: string;
  uid?: string;
}

export interface AdminCredential {
  id: string;
  name: string;
  username: string;
  password?: string;
  role: UserRole;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  logout: () => Promise<void>;
  updateUserRole: (uid: string, role: UserRole, name: string) => Promise<void>;
  adminCredentials: AdminCredential[];
  setAdminCredentials: React.Dispatch<React.SetStateAction<AdminCredential[]>>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  // Still keeping local admin credentials config for backward compatibility
  const [adminCredentials, setAdminCredentials] = useState<AdminCredential[]>(() => {
    try {
      const saved = localStorage.getItem('school_admin_credentials');
      if (saved) {
        return JSON.parse(saved);
      }
    } catch {
      return [];
    }
    return [];
  });

  useEffect(() => {
    try {
      localStorage.setItem('school_admin_credentials', JSON.stringify(adminCredentials));
    } catch {
      // Ignored
    }
  }, [adminCredentials]);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        // Fetch user role from Firestore
        try {
          const userDocRef = doc(db, 'users', firebaseUser.uid);
          const userDoc = await getDoc(userDocRef);
          
          if (userDoc.exists()) {
            const userData = userDoc.data();
            let role = userData.role as UserRole || 'Student';
            
            // Auto-upgrade developer email to Super Admin just in case it was incorrectly set
            if (firebaseUser.email === 'visitfaridul@gmail.com' && role !== 'Super Admin') {
              role = 'Super Admin';
              await setDoc(userDocRef, { role: 'Super Admin' }, { merge: true });
            }

            setUser({
              uid: firebaseUser.uid,
              name: userData.name || firebaseUser.displayName || 'User',
              role: role,
              username: firebaseUser.email || undefined
            });
          } else {
            // First time auth state listener without a user doc (e.g. they logged in before rules were fixed)
            // Let's create the user doc with Super Admin role since they are the owner/first user experiencing this
            const defaultRole: UserRole = 'Super Admin';
            await setDoc(userDocRef, {
              name: firebaseUser.displayName || 'New User',
              email: firebaseUser.email,
              role: defaultRole,
              createdAt: new Date().toISOString()
            });
            
            setUser({
              uid: firebaseUser.uid,
              name: firebaseUser.displayName || 'New User',
              role: defaultRole,
              username: firebaseUser.email || undefined
            });
          }
        } catch (error) {
          console.error("Error fetching user data:", error);
          // Fallback
          setUser({
            uid: firebaseUser.uid,
            name: firebaseUser.displayName || 'Error Loading',
            role: 'Super Admin',
            username: firebaseUser.email || undefined
          });
        }
      } else {
        setUser(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const logout = async () => {
    try {
      await firebaseSignOut(auth);
      setUser(null);
    } catch (error) {
      console.error("Error signing out:", error);
    }
  };

  const updateUserRole = async (uid: string, role: UserRole, name: string) => {
    try {
        await setDoc(doc(db, 'users', uid), {
            role,
            name,
            updatedAt: new Date().toISOString()
        }, { merge: true });
        
        if (user && user.uid === uid) {
             setUser(prev => prev ? { ...prev, role, name } : null);
        }
    } catch(err) {
        console.error("Failed to update role:", err);
    }
  }

  return (
    <AuthContext.Provider value={{ user, loading, logout, updateUserRole, adminCredentials, setAdminCredentials }}>
      {!loading && children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
