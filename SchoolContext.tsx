import React, { createContext, useContext, useState, ReactNode } from 'react';

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
  const [students, setStudents] = useState<Student[]>(mockStudents);
  const [teachers, setTeachers] = useState<Teacher[]>(mockTeachers);
  const [onlineAdmissions, setOnlineAdmissions] = useState<OnlineAdmissionForm[]>(mockAdmissions);
  const [results, setResults] = useState<StudentResult[]>(mockResults);
  const [sessions, setSessions] = useState<AcademicSession[]>(mockSessions);
  const [courses, setCourses] = useState<Course[]>(mockCourses);

  return (
    <SchoolContext.Provider value={{
      students, setStudents,
      teachers, setTeachers,
      onlineAdmissions, setOnlineAdmissions,
      results, setResults,
      sessions, setSessions,
      courses, setCourses
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
