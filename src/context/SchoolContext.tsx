import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { db, handleFirestoreError, OperationType } from '../firebase';
import { collection, doc, onSnapshot, setDoc, deleteDoc, getDocs, getDoc } from 'firebase/firestore';
import { useAuth } from './AuthContext';

// Common Types
export interface Student {
  id: string;
  name: string;
  class: string;
  section: string;
  roll: string;
  parentName: string;
  phone: string;
  status: string;
  avatar?: string;
  photoUrl?: string; // from forms
  dob?: string;
  admissionDate?: string;
  motherName?: string;
  address?: string;
  aadhaar?: string;
  pen?: string;
  apaar?: string;
}

export interface OnlineAdmissionForm {
  id: string; // temp ID
  submitDate: string;
  name: string;
  class: string;
  dob: string;
  parentName: string;
  motherName: string;
  phone: string;
  address: string;
  aadhaar: string;
  pen: string;
  apaar: string;
  photoUrl?: string;
  status: 'Pending' | 'Approved' | 'Rejected';
}

export interface Teacher {
  id: string;
  name: string;
  subject: string;
  qualification: string;
  phone: string;
  email: string;
  status: string;
  avatar?: string;
  fatherName?: string;
  dob?: string;
  joiningDate?: string;
  aadhaar?: string;
  pan?: string;
  address?: string;
}

export interface SubjectMark {
  subject: string;
  maxMarks: number;
  obtainedMarks: number;
}

export interface StudentResult {
  id: string;
  studentId: string;
  studentName: string;
  roll?: string;
  className: string;
  examName: string;
  subjects: SubjectMark[];
  totalMarks: number;
  percentage: number;
  grade: string;
  status: 'Pass' | 'Fail';
  remarks: string;
}

export interface AcademicSession {
  id: string;
  name: string;
  startDate: string;
  endDate: string;
  isActive: boolean;
}

export interface CourseMaterial {
  id: string;
  title: string;
  type: 'PDF' | 'Video' | 'Link' | 'Document';
  url: string;
  size?: string;
  uploadDate: string;
}

export interface Course {
  id: string;
  title: string;
  description: string;
  class: string;
  subject: string;
  teacherId?: string;
  thumbnailUrl?: string;
  materials: CourseMaterial[];
}

interface SchoolContextType {
  students: Student[];
  setStudents: React.Dispatch<React.SetStateAction<Student[]>>;
  teachers: Teacher[];
  setTeachers: React.Dispatch<React.SetStateAction<Teacher[]>>;
  onlineAdmissions: OnlineAdmissionForm[];
  setOnlineAdmissions: React.Dispatch<React.SetStateAction<OnlineAdmissionForm[]>>;
  results: StudentResult[];
  setResults: React.Dispatch<React.SetStateAction<StudentResult[]>>;
  sessions: AcademicSession[];
  setSessions: React.Dispatch<React.SetStateAction<AcademicSession[]>>;
  courses: Course[];
  setCourses: React.Dispatch<React.SetStateAction<Course[]>>;
  isSyncing: boolean;
  syncStatus: 'synced' | 'pending' | 'syncing' | 'error';
  syncAllToFirebase: () => Promise<void>;
  resetFirestoreToMock: () => Promise<void>;
  firestoreDbEmpty: boolean;
  dbStats: {
    students: number;
    teachers: number;
    onlineAdmissions: number;
    results: number;
    sessions: number;
    courses: number;
  };
}

const mockStudents: Student[] = [
  { id: 'ADM2023001', name: 'AARAV SHARMA', class: 'Class 10', section: 'A', roll: '101', parentName: 'RAJESH SHARMA', phone: '+1 (555) 123-4567', status: 'Active', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Aarav' },
  { id: 'ADM2023002', name: 'SOPHIA CHEN', class: 'Class 10', section: 'A', roll: '102', parentName: 'DAVID CHEN', phone: '+1 (555) 987-6543', status: 'Active', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Sophia' }
];

const mockTeachers: Teacher[] = [
  { id: 'T001', name: 'DR. SARAH JENKINS', subject: 'Mathematics', qualification: 'Ph.D. in Math', phone: '+1 (555) 123-0001', email: 'sarah.j@school.com', status: 'Present', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Sarah' },
  { id: 'T002', name: 'MICHAEL CHANG', subject: 'Physics', qualification: 'M.Sc. Physics', phone: '+1 (555) 123-0002', email: 'm.chang@school.com', status: 'Present', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Michael' }
];

const mockAdmissions: OnlineAdmissionForm[] = [
  {
    id: 'REQ-001',
    submitDate: new Date().toISOString(),
    name: 'JOHN DOE',
    class: 'Class 5',
    dob: '2013-05-12',
    parentName: 'RICHARD DOE',
    motherName: 'JANE DOE',
    phone: '9876543210',
    address: '123 Main St, Springfield',
    aadhaar: '123412341234',
    pen: '',
    apaar: '',
    status: 'Pending'
  }
];

const mockResults: StudentResult[] = [
  {
    id: 'RES-001',
    studentId: 'ADM2023001',
    studentName: 'AARAV SHARMA',
    className: 'Class 10 - A',
    examName: 'Final Examination 2023-2024',
    subjects: [
      { subject: 'Mathematics', maxMarks: 100, obtainedMarks: 95 },
      { subject: 'Science', maxMarks: 100, obtainedMarks: 88 },
      { subject: 'English', maxMarks: 100, obtainedMarks: 92 },
      { subject: 'Hindi', maxMarks: 100, obtainedMarks: 85 },
      { subject: 'Social Studies', maxMarks: 100, obtainedMarks: 90 },
    ],
    totalMarks: 450,
    percentage: 90,
    grade: 'A+',
    status: 'Pass',
    remarks: 'Excellent performance. Keep it up!'
  }
];

const mockSessions: AcademicSession[] = [
  { id: '1', name: '2023-2024', startDate: '2023-04-01', endDate: '2024-03-31', isActive: false },
  { id: '2', name: '2024-2025', startDate: '2024-04-01', endDate: '2025-03-31', isActive: true },
];

const mockCourses: Course[] = [
  {
    id: 'C001',
    title: 'Advanced Mathematics',
    description: 'Comprehensive guide to high school mathematics.',
    class: 'Class 10',
    subject: 'Mathematics',
    thumbnailUrl: 'https://images.unsplash.com/photo-1509228468518-180dd4864904?auto=format&fit=crop&q=80&w=600',
    materials: [
      { id: 'M001', title: 'Chapter 1: Algebra.pdf', type: 'PDF', url: '#', size: '2.5 MB', uploadDate: '2023-10-01' },
      { id: 'M002', title: 'Trigonometry Basics', type: 'Video', url: '#', size: '45 MB', uploadDate: '2023-10-05' }
    ],
  },
  {
    id: 'C002',
    title: 'Physics Mechanics',
    description: 'In-depth study of classical mechanics and kinematics.',
    class: 'Class 10',
    subject: 'Physics',
    thumbnailUrl: 'https://images.unsplash.com/photo-1636466497217-26a8cbeaf0aa?auto=format&fit=crop&q=80&w=600',
    materials: [
      { id: 'M003', title: 'Newton Laws Notes.docx', type: 'Document', url: '#', size: '1.2 MB', uploadDate: '2023-10-05' },
    ],
  }
];

const SchoolContext = createContext<SchoolContextType | undefined>(undefined);

export function SchoolProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const isAdminUser = user && (user.role === 'Super Admin' || user.role === 'Admin');

  const [students, setStudentsState] = useState<Student[]>([]);
  const [teachers, setTeachersState] = useState<Teacher[]>([]);
  const [onlineAdmissions, setOnlineAdmissionsState] = useState<OnlineAdmissionForm[]>([]);
  const [results, setResultsState] = useState<StudentResult[]>([]);
  const [sessions, setSessionsState] = useState<AcademicSession[]>([]);
  const [courses, setCoursesState] = useState<Course[]>([]);

  // Track Firestore actual database statistics
  const [dbStats, setDbStats] = useState({
    students: 0,
    teachers: 0,
    onlineAdmissions: 0,
    results: 0,
    sessions: 0,
    courses: 0
  });
  const [isSyncing, setIsSyncing] = useState(false);

  // Firestore Real-time Snapshot listeners
  useEffect(() => {
    let unsubStudents = () => {};
    let unsubTeachers = () => {};
    let unsubAdmissions = () => {};

    // 1. Students - only if logged in
    if (user) {
      unsubStudents = onSnapshot(collection(db, 'students'), (snapshot) => {
        const data: Student[] = [];
        snapshot.forEach(doc => {
          data.push(doc.data() as Student);
        });
        setDbStats(prev => ({ ...prev, students: snapshot.size }));
        setStudentsState(data.length > 0 ? data : mockStudents);
      }, () => {
        // Suppress background listener error in console
        setStudentsState(mockStudents);
      });
    } else {
      setStudentsState(mockStudents);
    }

    // 2. Teachers - only if logged in
    if (user) {
      unsubTeachers = onSnapshot(collection(db, 'teachers'), (snapshot) => {
        const data: Teacher[] = [];
        snapshot.forEach(doc => {
          data.push(doc.data() as Teacher);
        });
        setDbStats(prev => ({ ...prev, teachers: snapshot.size }));
        setTeachersState(data.length > 0 ? data : mockTeachers);
      }, () => {
        // Suppress background listener error in console
        setTeachersState(mockTeachers);
      });
    } else {
      setTeachersState(mockTeachers);
    }

    // 3. Online Admissions - only if Admin user
    if (isAdminUser) {
      unsubAdmissions = onSnapshot(collection(db, 'onlineAdmissions'), (snapshot) => {
        const data: OnlineAdmissionForm[] = [];
        snapshot.forEach(doc => {
          data.push(doc.data() as OnlineAdmissionForm);
        });
        setDbStats(prev => ({ ...prev, onlineAdmissions: snapshot.size }));
        setOnlineAdmissionsState(data.length > 0 ? data : mockAdmissions);
      }, () => {
        // Suppress background listener error in console
        setOnlineAdmissionsState(mockAdmissions);
      });
    } else {
      setOnlineAdmissionsState([]);
    }

    // 4. Results
    const unsubResults = onSnapshot(collection(db, 'results'), (snapshot) => {
      const data: StudentResult[] = [];
      snapshot.forEach(doc => {
        data.push(doc.data() as StudentResult);
      });
      setDbStats(prev => ({ ...prev, results: snapshot.size }));
      setResultsState(data.length > 0 ? data : mockResults);
    }, () => {
      // Suppress background listener error in console and load fallback
      setResultsState(mockResults);
    });

    // 5. Academic Sessions
    const unsubSessions = onSnapshot(collection(db, 'sessions'), (snapshot) => {
      const data: AcademicSession[] = [];
      snapshot.forEach(doc => {
        data.push(doc.data() as AcademicSession);
      });
      setDbStats(prev => ({ ...prev, sessions: snapshot.size }));
      setSessionsState(data.length > 0 ? data : mockSessions);
    }, () => {
      // Suppress background listener error in console and load fallback
      setSessionsState(mockSessions);
    });

    // 6. Courses
    const unsubCourses = onSnapshot(collection(db, 'courses'), (snapshot) => {
      const data: Course[] = [];
      snapshot.forEach(doc => {
        data.push(doc.data() as Course);
      });
      setDbStats(prev => ({ ...prev, courses: snapshot.size }));
      setCoursesState(data.length > 0 ? data : mockCourses);
    }, () => {
      // Suppress background listener error in console and load fallback
      setCoursesState(mockCourses);
    });

    return () => {
      unsubStudents();
      unsubTeachers();
      unsubAdmissions();
      unsubResults();
      unsubSessions();
      unsubCourses();
    };
  }, [user, isAdminUser]);

  // Admin-triggered one-time bootstrapping of Firestore with initial mock template datasets
  useEffect(() => {
    if (!isAdminUser) return;
    const isBootstrapped = localStorage.getItem('bhogamur_school_bootstrapped_v2');
    if (!isBootstrapped) {
      console.log("Admin logged in. Bootstrapping default mock dataset to Firestore collections...");
      
      const bootstrapCollection = async () => {
        // Bootstrap sessions
        try {
          const sessionsSnap = await getDocs(collection(db, 'sessions'));
          if (sessionsSnap.empty) {
            for (const s of mockSessions) {
              await setDoc(doc(db, 'sessions', s.id), s);
            }
          }
        } catch (e) {
          console.error("Bootstrapping sessions failed: ", e);
        }

        // Bootstrap students
        try {
          const studentsSnap = await getDocs(collection(db, 'students'));
          if (studentsSnap.empty) {
            for (const s of mockStudents) {
              await setDoc(doc(db, 'students', s.id), s);
            }
          }
        } catch (e) {
          console.error("Bootstrapping students failed: ", e);
        }

        // Bootstrap teachers
        try {
          const teachersSnap = await getDocs(collection(db, 'teachers'));
          if (teachersSnap.empty) {
            for (const t of mockTeachers) {
              await setDoc(doc(db, 'teachers', t.id), t);
            }
          }
        } catch (e) {
          console.error("Bootstrapping teachers failed: ", e);
        }

        // Bootstrap results
        try {
          const resultsSnap = await getDocs(collection(db, 'results'));
          if (resultsSnap.empty) {
            for (const r of mockResults) {
              await setDoc(doc(db, 'results', r.id), r);
            }
          }
        } catch (e) {
          console.error("Bootstrapping results failed: ", e);
        }

        // Bootstrap courses
        try {
          const coursesSnap = await getDocs(collection(db, 'courses'));
          if (coursesSnap.empty) {
            for (const c of mockCourses) {
              await setDoc(doc(db, 'courses', c.id), c);
            }
          }
        } catch (e) {
          console.error("Bootstrapping courses failed: ", e);
        }

        localStorage.setItem('bhogamur_school_bootstrapped_v2', 'true');
      };

      bootstrapCollection();
    }
    localStorage.setItem('bhogamur_school_bootstrapped', 'true');
  }, [isAdminUser]);

  // Syncing customized setState actions back to Firestore securely
  const setStudents = async (value: React.SetStateAction<Student[]>) => {
    try {
      const current = students;
      const next = typeof value === 'function' ? (value as any)(current) : value;

      // Optimistic visual update
      setStudentsState(next);

      const currentIds = new Set(current.map(s => s.id));
      const nextIds = new Set(next.map(s => s.id));

      // 1. Delete removed
      for (const s of current) {
        if (!nextIds.has(s.id)) {
          try {
            await deleteDoc(doc(db, 'students', s.id));
          } catch (err) {
            handleFirestoreError(err, OperationType.DELETE, `students/${s.id}`);
          }
        }
      }

      // 2. Create / Update altered
      for (const s of next) {
        const existing = current.find(item => item.id === s.id);
        if (!existing || JSON.stringify(existing) !== JSON.stringify(s)) {
          try {
            await setDoc(doc(db, 'students', s.id), s);
          } catch (err) {
            handleFirestoreError(err, OperationType.WRITE, `students/${s.id}`);
          }
        }
      }
    } catch (e) {
      console.error("Error updating students on Firestore: ", e);
    }
  };

  const setTeachers = async (value: React.SetStateAction<Teacher[]>) => {
    try {
      const current = teachers;
      const next = typeof value === 'function' ? (value as any)(current) : value;

      setTeachersState(next);

      const currentIds = new Set(current.map(t => t.id));
      const nextIds = new Set(next.map(t => t.id));

      for (const t of current) {
        if (!nextIds.has(t.id)) {
          try {
            await deleteDoc(doc(db, 'teachers', t.id));
          } catch (err) {
            handleFirestoreError(err, OperationType.DELETE, `teachers/${t.id}`);
          }
        }
      }

      for (const t of next) {
        const existing = current.find(item => item.id === t.id);
        if (!existing || JSON.stringify(existing) !== JSON.stringify(t)) {
          try {
            await setDoc(doc(db, 'teachers', t.id), t);
          } catch (err) {
            handleFirestoreError(err, OperationType.WRITE, `teachers/${t.id}`);
          }
        }
      }
    } catch (e) {
      console.error("Error updating teachers on Firestore: ", e);
    }
  };

  const setOnlineAdmissions = async (value: React.SetStateAction<OnlineAdmissionForm[]>) => {
    try {
      const current = onlineAdmissions;
      const next = typeof value === 'function' ? (value as any)(current) : value;

      setOnlineAdmissionsState(next);

      const currentIds = new Set(current.map(a => a.id));
      const nextIds = new Set(next.map(a => a.id));

      for (const a of current) {
        if (!nextIds.has(a.id)) {
          try {
            await deleteDoc(doc(db, 'onlineAdmissions', a.id));
          } catch (err) {
            handleFirestoreError(err, OperationType.DELETE, `onlineAdmissions/${a.id}`);
          }
        }
      }

      for (const a of next) {
        const existing = current.find(item => item.id === a.id);
        if (!existing || JSON.stringify(existing) !== JSON.stringify(a)) {
          try {
            await setDoc(doc(db, 'onlineAdmissions', a.id), a);
          } catch (err) {
            handleFirestoreError(err, OperationType.WRITE, `onlineAdmissions/${a.id}`);
          }
        }
      }
    } catch (e) {
      console.error("Error updating admissions on Firestore: ", e);
    }
  };

  const setResults = async (value: React.SetStateAction<StudentResult[]>) => {
    try {
      const current = results;
      const next = typeof value === 'function' ? (value as any)(current) : value;

      setResultsState(next);

      const currentIds = new Set(current.map(r => r.id));
      const nextIds = new Set(next.map(r => r.id));

      for (const r of current) {
        if (!nextIds.has(r.id)) {
          try {
            await deleteDoc(doc(db, 'results', r.id));
          } catch (err) {
            handleFirestoreError(err, OperationType.DELETE, `results/${r.id}`);
          }
        }
      }

      for (const r of next) {
        const existing = current.find(item => item.id === r.id);
        if (!existing || JSON.stringify(existing) !== JSON.stringify(r)) {
          try {
            await setDoc(doc(db, 'results', r.id), r);
          } catch (err) {
            handleFirestoreError(err, OperationType.WRITE, `results/${r.id}`);
          }
        }
      }
    } catch (e) {
      console.error("Error updating results on Firestore: ", e);
    }
  };

  const setSessions = async (value: React.SetStateAction<AcademicSession[]>) => {
    try {
      const current = sessions;
      const next = typeof value === 'function' ? (value as any)(current) : value;

      setSessionsState(next);

      const currentIds = new Set(current.map(s => s.id));
      const nextIds = new Set(next.map(s => s.id));

      for (const s of current) {
        if (!nextIds.has(s.id)) {
          try {
            await deleteDoc(doc(db, 'sessions', s.id));
          } catch (err) {
            handleFirestoreError(err, OperationType.DELETE, `sessions/${s.id}`);
          }
        }
      }

      for (const s of next) {
        const existing = current.find(item => item.id === s.id);
        if (!existing || JSON.stringify(existing) !== JSON.stringify(s)) {
          try {
            await setDoc(doc(db, 'sessions', s.id), s);
          } catch (err) {
            handleFirestoreError(err, OperationType.WRITE, `sessions/${s.id}`);
          }
        }
      }
    } catch (e) {
      console.error("Error updating sessions on Firestore: ", e);
    }
  };

  const setCourses = async (value: React.SetStateAction<Course[]>) => {
    try {
      const current = courses;
      const next = typeof value === 'function' ? (value as any)(current) : value;

      setCoursesState(next);

      const currentIds = new Set(current.map(c => c.id));
      const nextIds = new Set(next.map(c => c.id));

      for (const c of current) {
        if (!nextIds.has(c.id)) {
          try {
            await deleteDoc(doc(db, 'courses', c.id));
          } catch (err) {
            handleFirestoreError(err, OperationType.DELETE, `courses/${c.id}`);
          }
        }
      }

      for (const c of next) {
        const existing = current.find(item => item.id === c.id);
        if (!existing || JSON.stringify(existing) !== JSON.stringify(c)) {
          try {
            await setDoc(doc(db, 'courses', c.id), c);
          } catch (err) {
            handleFirestoreError(err, OperationType.WRITE, `courses/${c.id}`);
          }
        }
      }
    } catch (e) {
      console.error("Error updating courses on Firestore: ", e);
    }
  };

  const firestoreDbEmpty = dbStats.students === 0 && dbStats.teachers === 0;
  const syncStatus = firestoreDbEmpty ? 'pending' : 'synced';

  const syncAllToFirebase = async () => {
    setIsSyncing(true);
    try {
      console.log("Forcing manual complete sync to Firebase Firestore...");
      
      // 1. Students
      try {
        for (const s of students) {
          await setDoc(doc(db, 'students', s.id), s);
        }
      } catch (err: any) {
        throw new Error(`Failed writing block [students] (ID: ${students[0]?.id || 'N/A'}): ${err.message || err}`);
      }
      
      // 2. Teachers
      try {
        for (const t of teachers) {
          await setDoc(doc(db, 'teachers', t.id), t);
        }
      } catch (err: any) {
        throw new Error(`Failed writing block [teachers] (ID: ${teachers[0]?.id || 'N/A'}): ${err.message || err}`);
      }
      
      // 3. Online Admissions
      try {
        for (const a of onlineAdmissions) {
          await setDoc(doc(db, 'onlineAdmissions', a.id), a);
        }
      } catch (err: any) {
        throw new Error(`Failed writing block [onlineAdmissions] (ID: ${onlineAdmissions[0]?.id || 'N/A'}): ${err.message || err}`);
      }
      
      // 4. Results
      try {
        for (const r of results) {
          await setDoc(doc(db, 'results', r.id), r);
        }
      } catch (err: any) {
        throw new Error(`Failed writing block [results] (ID: ${results[0]?.id || 'N/A'}): ${err.message || err}`);
      }
      
      // 5. Sessions
      try {
        for (const s of sessions) {
          await setDoc(doc(db, 'sessions', s.id), s);
        }
      } catch (err: any) {
        throw new Error(`Failed writing block [sessions] (ID: ${sessions[0]?.id || 'N/A'}): ${err.message || err}`);
      }
      
      // 6. Courses
      try {
        for (const c of courses) {
          await setDoc(doc(db, 'courses', c.id), c);
        }
      } catch (err: any) {
        throw new Error(`Failed writing block [courses] (ID: ${courses[0]?.id || 'N/A'}): ${err.message || err}`);
      }

      setDbStats({
        students: students.length,
        teachers: teachers.length,
        onlineAdmissions: onlineAdmissions.length,
        results: results.length,
        sessions: sessions.length,
        courses: courses.length
      });
      
    } catch (e) {
      console.error("Manual direct sync to Firebase failed:", e);
      throw e;
    } finally {
      setIsSyncing(false);
    }
  };

  const resetFirestoreToMock = async () => {
    setIsSyncing(true);
    try {
      console.log("Resetting all Firestore documents to default Mockup values...");
      
      // Clean existing state lists in firestore first
      for (const s of students) {
        try { await deleteDoc(doc(db, 'students', s.id)); } catch {}
      }
      for (const t of teachers) {
        try { await deleteDoc(doc(db, 'teachers', t.id)); } catch {}
      }
      for (const r of results) {
        try { await deleteDoc(doc(db, 'results', r.id)); } catch {}
      }
      for (const s of sessions) {
        try { await deleteDoc(doc(db, 'sessions', s.id)); } catch {}
      }
      for (const c of courses) {
        try { await deleteDoc(doc(db, 'courses', c.id)); } catch {}
      }
      for (const a of onlineAdmissions) {
        try { await deleteDoc(doc(db, 'onlineAdmissions', a.id)); } catch {}
      }

      // Write mock data models
      for (const s of mockStudents) {
        await setDoc(doc(db, 'students', s.id), s);
      }
      for (const t of mockTeachers) {
        await setDoc(doc(db, 'teachers', t.id), t);
      }
      for (const r of mockResults) {
        await setDoc(doc(db, 'results', r.id), r);
      }
      for (const s of mockSessions) {
        await setDoc(doc(db, 'sessions', s.id), s);
      }
      for (const c of mockCourses) {
        await setDoc(doc(db, 'courses', c.id), c);
      }
      for (const a of mockAdmissions) {
        await setDoc(doc(db, 'onlineAdmissions', a.id), a);
      }
      
    } catch (e) {
      console.error("Database hard reset failed:", e);
      throw e;
    } finally {
      setIsSyncing(false);
    }
  };

  return (
    <SchoolContext.Provider value={{
      students, setStudents,
      teachers, setTeachers,
      onlineAdmissions, setOnlineAdmissions,
      results, setResults,
      sessions, setSessions,
      courses, setCourses,
      isSyncing,
      syncStatus,
      syncAllToFirebase,
      resetFirestoreToMock,
      firestoreDbEmpty,
      dbStats
    }}>
      {children}
    </SchoolContext.Provider>
  );
}


export function useSchool() {
  const context = useContext(SchoolContext);
  if (context === undefined) {
    throw new Error('useSchool must be used within a SchoolProvider');
  }
  return context;
}
