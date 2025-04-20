import { teachers, students, grades, Teacher, Student, Grade, InsertTeacher, InsertStudent, InsertGrade } from "@shared/schema";
import session from "express-session";
import { DatabaseStorage } from "./database-storage";

// Define the Storage interface
export interface IStorage {
  // Teacher methods
  getTeacher(id: number): Promise<Teacher | undefined>;
  getTeacherByUsername(username: string): Promise<Teacher | undefined>;
  createTeacher(teacher: InsertTeacher): Promise<Teacher>;
  
  // Student methods
  getStudent(id: number): Promise<Student | undefined>;
  getStudentBySapId(sapId: string): Promise<Student | undefined>;
  createStudent(student: InsertStudent): Promise<Student>;
  updateStudent(id: number, student: Partial<InsertStudent>): Promise<Student | undefined>;
  getAllStudents(): Promise<Student[]>;
  getStudentsByClass(className: string): Promise<Student[]>;
  
  // Grade methods
  getGrade(id: number): Promise<Grade | undefined>;
  getGradeByStudentAndExperiment(studentId: number, subject: string, experimentNumber: number): Promise<Grade | undefined>;
  createGrade(grade: InsertGrade): Promise<Grade>;
  updateGrade(id: number, grade: Partial<InsertGrade>): Promise<Grade | undefined>;
  getGradesByStudentId(studentId: number): Promise<Grade[]>;
  getGradesBySubjectAndExperiment(subject: string, experimentNumber: number): Promise<Grade[]>;
  getGradesByStudentIdAndSubject(studentId: number, subject: string): Promise<Grade[]>;
  
  // Session store
  sessionStore: any; // Using any to resolve session store type issue
}

// Create an instance of DatabaseStorage
export const storage = new DatabaseStorage();
