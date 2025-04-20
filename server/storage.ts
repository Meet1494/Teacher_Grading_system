import { teachers, students, grades, Teacher, Student, Grade, InsertTeacher, InsertStudent, InsertGrade } from "@shared/schema";
import session from "express-session";
import createMemoryStore from "memorystore";

const MemoryStore = createMemoryStore(session);

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

export class MemStorage implements IStorage {
  private teachers: Map<number, Teacher>;
  private students: Map<number, Student>;
  private grades: Map<number, Grade>;
  private teacherIdCounter: number;
  private studentIdCounter: number;
  private gradeIdCounter: number;
  public sessionStore: any; // Using any to resolve the session store type issue

  constructor() {
    this.teachers = new Map();
    this.students = new Map();
    this.grades = new Map();
    this.teacherIdCounter = 1;
    this.studentIdCounter = 1;
    this.gradeIdCounter = 1;
    this.sessionStore = new MemoryStore({
      checkPeriod: 86400000, // 24 hours
    });
  }

  // Teacher methods
  async getTeacher(id: number): Promise<Teacher | undefined> {
    return this.teachers.get(id);
  }

  async getTeacherByUsername(username: string): Promise<Teacher | undefined> {
    return Array.from(this.teachers.values()).find(
      (teacher) => teacher.username === username,
    );
  }

  async createTeacher(teacher: InsertTeacher): Promise<Teacher> {
    const id = this.teacherIdCounter++;
    const newTeacher: Teacher = { ...teacher, id };
    this.teachers.set(id, newTeacher);
    return newTeacher;
  }

  // Student methods
  async getStudent(id: number): Promise<Student | undefined> {
    return this.students.get(id);
  }

  async getStudentBySapId(sapId: string): Promise<Student | undefined> {
    return Array.from(this.students.values()).find(
      (student) => student.sapId === sapId,
    );
  }

  async createStudent(student: InsertStudent): Promise<Student> {
    const id = this.studentIdCounter++;
    const newStudent: Student = { ...student, id };
    this.students.set(id, newStudent);
    return newStudent;
  }

  async updateStudent(id: number, student: Partial<InsertStudent>): Promise<Student | undefined> {
    const existingStudent = this.students.get(id);
    if (!existingStudent) return undefined;
    
    const updatedStudent = { ...existingStudent, ...student };
    this.students.set(id, updatedStudent);
    return updatedStudent;
  }

  async getAllStudents(): Promise<Student[]> {
    return Array.from(this.students.values());
  }

  async getStudentsByClass(className: string): Promise<Student[]> {
    return Array.from(this.students.values()).filter(
      (student) => student.class === className,
    );
  }

  // Grade methods
  async getGrade(id: number): Promise<Grade | undefined> {
    return this.grades.get(id);
  }

  async getGradeByStudentAndExperiment(
    studentId: number, 
    subject: string, 
    experimentNumber: number
  ): Promise<Grade | undefined> {
    return Array.from(this.grades.values()).find(
      (grade) => 
        grade.studentId === studentId && 
        grade.subject === subject && 
        grade.experimentNumber === experimentNumber,
    );
  }

  async createGrade(grade: InsertGrade): Promise<Grade> {
    const id = this.gradeIdCounter++;
    const newGrade: Grade = { 
      ...grade, 
      id, 
      comment: grade.comment || null, // Ensure comment is string or null, never undefined
      updatedAt: new Date() 
    };
    this.grades.set(id, newGrade);
    return newGrade;
  }

  async updateGrade(id: number, grade: Partial<InsertGrade>): Promise<Grade | undefined> {
    const existingGrade = this.grades.get(id);
    if (!existingGrade) return undefined;
    
    const updatedGrade = { 
      ...existingGrade, 
      ...grade, 
      updatedAt: new Date() 
    };
    this.grades.set(id, updatedGrade);
    return updatedGrade;
  }

  async getGradesByStudentId(studentId: number): Promise<Grade[]> {
    return Array.from(this.grades.values()).filter(
      (grade) => grade.studentId === studentId,
    );
  }

  async getGradesBySubjectAndExperiment(
    subject: string, 
    experimentNumber: number
  ): Promise<Grade[]> {
    return Array.from(this.grades.values()).filter(
      (grade) => 
        grade.subject === subject && 
        grade.experimentNumber === experimentNumber,
    );
  }

  async getGradesByStudentIdAndSubject(
    studentId: number, 
    subject: string
  ): Promise<Grade[]> {
    return Array.from(this.grades.values()).filter(
      (grade) => 
        grade.studentId === studentId && 
        grade.subject === subject,
    );
  }
}

export const storage = new MemStorage();
