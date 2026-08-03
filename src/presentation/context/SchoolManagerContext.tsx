/**
 * Qarayti.ai — School Manager Portal Context & State Engine
 * Centralized state orchestration across all 11 sub-modules of the School OS.
 */

import React, { createContext, useContext, useState } from 'react';
import {
  SchoolTeacher,
  SchoolStudent,
  SchoolGuardian,
  SchoolFinanceSummary,
  FinancialTransaction,
  SchoolAnalyticsData,
  TimetableSlot,
  SchoolExam,
  HREmployeeRecord,
  SchoolDocument,
  SchoolAnnouncement,
  UserRolePermission,
} from '../../domain/types/schoolManager.types';

import {
  INITIAL_SCHOOL_TEACHERS,
  INITIAL_SCHOOL_STUDENTS,
  INITIAL_SCHOOL_GUARDIANS,
  INITIAL_SCHOOL_FINANCE_SUMMARY,
  INITIAL_FINANCIAL_TRANSACTIONS,
  INITIAL_SCHOOL_ANALYTICS,
  INITIAL_TIMETABLE_SLOTS,
  INITIAL_SCHOOL_EXAMS,
  INITIAL_HR_EMPLOYEES,
  INITIAL_SCHOOL_DOCUMENTS,
  INITIAL_SCHOOL_ANNOUNCEMENTS,
  INITIAL_USER_ROLE_PERMISSIONS,
} from '../../domain/data/schoolManagerData';

interface SchoolManagerContextType {
  teachers: SchoolTeacher[];
  students: SchoolStudent[];
  guardians: SchoolGuardian[];
  financeSummary: SchoolFinanceSummary;
  transactions: FinancialTransaction[];
  analytics: SchoolAnalyticsData;
  timetable: TimetableSlot[];
  exams: SchoolExam[];
  hrEmployees: HREmployeeRecord[];
  documents: SchoolDocument[];
  announcements: SchoolAnnouncement[];
  permissions: UserRolePermission[];

  // Action methods
  addTeacher: (teacher: Omit<SchoolTeacher, 'id'>) => void;
  updateTeacherStatus: (id: string, status: 'ACTIVE' | 'ON_LEAVE' | 'SUSPENDED') => void;
  
  addStudent: (student: Omit<SchoolStudent, 'id'>) => void;
  updateStudentTuitionStatus: (id: string, status: 'PAID' | 'PARTIAL' | 'OVERDUE') => void;

  addGuardian: (guardian: Omit<SchoolGuardian, 'id'>) => void;
  
  addTransaction: (tx: Omit<FinancialTransaction, 'id' | 'date'>) => void;

  addTimetableSlot: (slot: Omit<TimetableSlot, 'id'>) => void;

  addExam: (exam: Omit<SchoolExam, 'id'>) => void;
  updateExamStatus: (id: string, status: 'PLANNED' | 'IN_PROGRESS' | 'COMPLETED' | 'GRADED') => void;

  addHREmployee: (emp: Omit<HREmployeeRecord, 'id'>) => void;

  addDocument: (doc: Omit<SchoolDocument, 'id' | 'dateUploaded'>) => void;

  addAnnouncement: (ann: Omit<SchoolAnnouncement, 'id' | 'publishDate'>) => void;

  updateRolePermission: (roleId: string, moduleKey: string, level: 'READ' | 'WRITE' | 'ADMIN' | 'NONE') => void;
}

const SchoolManagerContext = createContext<SchoolManagerContextType | undefined>(undefined);

export const SchoolManagerProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [teachers, setTeachers] = useState<SchoolTeacher[]>(INITIAL_SCHOOL_TEACHERS);
  const [students, setStudents] = useState<SchoolStudent[]>(INITIAL_SCHOOL_STUDENTS);
  const [guardians, setGuardians] = useState<SchoolGuardian[]>(INITIAL_SCHOOL_GUARDIANS);
  const [financeSummary, setFinanceSummary] = useState<SchoolFinanceSummary>(INITIAL_SCHOOL_FINANCE_SUMMARY);
  const [transactions, setTransactions] = useState<FinancialTransaction[]>(INITIAL_FINANCIAL_TRANSACTIONS);
  const [analytics] = useState<SchoolAnalyticsData>(INITIAL_SCHOOL_ANALYTICS);
  const [timetable, setTimetable] = useState<TimetableSlot[]>(INITIAL_TIMETABLE_SLOTS);
  const [exams, setExams] = useState<SchoolExam[]>(INITIAL_SCHOOL_EXAMS);
  const [hrEmployees, setHrEmployees] = useState<HREmployeeRecord[]>(INITIAL_HR_EMPLOYEES);
  const [documents, setDocuments] = useState<SchoolDocument[]>(INITIAL_SCHOOL_DOCUMENTS);
  const [announcements, setAnnouncements] = useState<SchoolAnnouncement[]>(INITIAL_SCHOOL_ANNOUNCEMENTS);
  const [permissions, setPermissions] = useState<UserRolePermission[]>(INITIAL_USER_ROLE_PERMISSIONS);

  // Actions
  const addTeacher = (teacherData: Omit<SchoolTeacher, 'id'>) => {
    const created: SchoolTeacher = {
      ...teacherData,
      id: `tch-${Date.now()}`,
    };
    setTeachers((prev) => [created, ...prev]);
  };

  const updateTeacherStatus = (id: string, status: 'ACTIVE' | 'ON_LEAVE' | 'SUSPENDED') => {
    setTeachers((prev) =>
      prev.map((t) => (t.id === id ? { ...t, status } : t))
    );
  };

  const addStudent = (studentData: Omit<SchoolStudent, 'id'>) => {
    const created: SchoolStudent = {
      ...studentData,
      id: `std-${Date.now()}`,
    };
    setStudents((prev) => [created, ...prev]);
  };

  const updateStudentTuitionStatus = (id: string, tuitionStatus: 'PAID' | 'PARTIAL' | 'OVERDUE') => {
    setStudents((prev) =>
      prev.map((s) => (s.id === id ? { ...s, tuitionStatus } : s))
    );
  };

  const addGuardian = (guardianData: Omit<SchoolGuardian, 'id'>) => {
    const created: SchoolGuardian = {
      ...guardianData,
      id: `grd-${Date.now()}`,
    };
    setGuardians((prev) => [created, ...prev]);
  };

  const addTransaction = (txData: Omit<FinancialTransaction, 'id' | 'date'>) => {
    const created: FinancialTransaction = {
      ...txData,
      id: `tx-${Date.now()}`,
      date: new Date().toISOString().split('T')[0],
    };
    setTransactions((prev) => [created, ...prev]);

    // Update finance summary dynamically
    if (txData.type === 'INCOME') {
      setFinanceSummary((prev) => ({
        ...prev,
        totalRevenueMAD: prev.totalRevenueMAD + txData.amountMAD,
      }));
    } else {
      setFinanceSummary((prev) => ({
        ...prev,
        operationalExpensesMAD: prev.operationalExpensesMAD + txData.amountMAD,
      }));
    }
  };

  const addTimetableSlot = (slotData: Omit<TimetableSlot, 'id'>) => {
    const created: TimetableSlot = {
      ...slotData,
      id: `slot-${Date.now()}`,
    };
    setTimetable((prev) => [...prev, created]);
  };

  const addExam = (examData: Omit<SchoolExam, 'id'>) => {
    const created: SchoolExam = {
      ...examData,
      id: `ex-${Date.now()}`,
    };
    setExams((prev) => [created, ...prev]);
  };

  const updateExamStatus = (id: string, status: 'PLANNED' | 'IN_PROGRESS' | 'COMPLETED' | 'GRADED') => {
    setExams((prev) =>
      prev.map((e) => (e.id === id ? { ...e, status } : e))
    );
  };

  const addHREmployee = (empData: Omit<HREmployeeRecord, 'id'>) => {
    const created: HREmployeeRecord = {
      ...empData,
      id: `hr-${Date.now()}`,
    };
    setHrEmployees((prev) => [created, ...prev]);
  };

  const addDocument = (docData: Omit<SchoolDocument, 'id' | 'dateUploaded'>) => {
    const created: SchoolDocument = {
      ...docData,
      id: `doc-${Date.now()}`,
      dateUploaded: new Date().toISOString().split('T')[0],
    };
    setDocuments((prev) => [created, ...prev]);
  };

  const addAnnouncement = (annData: Omit<SchoolAnnouncement, 'id' | 'publishDate'>) => {
    const created: SchoolAnnouncement = {
      ...annData,
      id: `ann-${Date.now()}`,
      publishDate: new Date().toISOString().split('T')[0],
    };
    setAnnouncements((prev) => [created, ...prev]);
  };

  const updateRolePermission = (roleId: string, moduleKey: string, level: 'READ' | 'WRITE' | 'ADMIN' | 'NONE') => {
    setPermissions((prev) =>
      prev.map((p) => {
        if (p.id === roleId) {
          return {
            ...p,
            modulesAccess: {
              ...p.modulesAccess,
              [moduleKey]: level,
            },
          };
        }
        return p;
      })
    );
  };

  return (
    <SchoolManagerContext.Provider
      value={{
        teachers,
        students,
        guardians,
        financeSummary,
        transactions,
        analytics,
        timetable,
        exams,
        hrEmployees,
        documents,
        announcements,
        permissions,
        addTeacher,
        updateTeacherStatus,
        addStudent,
        updateStudentTuitionStatus,
        addGuardian,
        addTransaction,
        addTimetableSlot,
        addExam,
        updateExamStatus,
        addHREmployee,
        addDocument,
        addAnnouncement,
        updateRolePermission,
      }}
    >
      {children}
    </SchoolManagerContext.Provider>
  );
};

export const useSchoolManager = () => {
  const context = useContext(SchoolManagerContext);
  if (!context) {
    throw new Error('useSchoolManager must be used within a SchoolManagerProvider');
  }
  return context;
};
