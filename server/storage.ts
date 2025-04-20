import { 
  Teacher, InsertTeacher, 
  Class, InsertClass, 
  Student, InsertStudent, StudentWithClass,
  Subject, InsertSubject, 
  Experiment, InsertExperiment, ExperimentWithSubject,
  Grade, InsertGrade, UpdateGrade, GradeWithDetails
} from "@shared/schema";
import session from "express-session";
import createMemoryStore from "memorystore";

const MemoryStore = createMemoryStore(session);

export interface IStorage {
  // Auth & Teacher
  getTeacher(id: number): Promise<Teacher | undefined>;
  getTeacherByUsername(username: string): Promise<Teacher | undefined>;
  createTeacher(teacher: InsertTeacher): Promise<Teacher>;
  
  // Classes
  getClasses(): Promise<Class[]>;
  getClass(id: number): Promise<Class | undefined>;
  getClassByName(name: string): Promise<Class | undefined>;
  createClass(classData: InsertClass): Promise<Class>;
  
  // Students
  getStudents(): Promise<StudentWithClass[]>;
  getStudentsByClass(classId: number): Promise<StudentWithClass[]>;
  getStudent(id: number): Promise<StudentWithClass | undefined>;
  getStudentBySapId(sapId: string): Promise<StudentWithClass | undefined>;
  createStudent(student: InsertStudent): Promise<Student>;
  updateStudent(id: number, student: Partial<InsertStudent>): Promise<Student>;
  
  // Subjects
  getSubjects(): Promise<Subject[]>;
  getSubject(id: number): Promise<Subject | undefined>;
  getSubjectByCode(code: string): Promise<Subject | undefined>;
  createSubject(subject: InsertSubject): Promise<Subject>;
  
  // Experiments
  getExperiments(): Promise<ExperimentWithSubject[]>;
  getExperimentsBySubject(subjectId: number): Promise<ExperimentWithSubject[]>;
  getExperiment(id: number): Promise<ExperimentWithSubject | undefined>;
  createExperiment(experiment: InsertExperiment): Promise<Experiment>;
  
  // Grades
  getGrades(): Promise<GradeWithDetails[]>;
  getGradesByExperiment(experimentId: number): Promise<GradeWithDetails[]>;
  getGradesByStudent(studentId: number): Promise<GradeWithDetails[]>;
  getGradesByStudentAndExperiment(studentId: number, experimentId: number): Promise<Grade | undefined>;
  createOrUpdateGrade(grade: InsertGrade): Promise<Grade>;
  updateGrade(studentId: number, experimentId: number, grade: UpdateGrade): Promise<Grade>;
  
  // Session
  sessionStore: session.SessionStore;
}

export class MemStorage implements IStorage {
  private teachers: Map<number, Teacher>;
  private classes: Map<number, Class>;
  private students: Map<number, Student>;
  private subjects: Map<number, Subject>;
  private experiments: Map<number, Experiment>;
  private grades: Map<number, Grade>;
  
  teacherIdCounter: number;
  classIdCounter: number;
  studentIdCounter: number;
  subjectIdCounter: number;
  experimentIdCounter: number;
  gradeIdCounter: number;
  sessionStore: session.SessionStore;
  
  constructor() {
    this.teachers = new Map();
    this.classes = new Map();
    this.students = new Map();
    this.subjects = new Map();
    this.experiments = new Map();
    this.grades = new Map();
    
    this.teacherIdCounter = 1;
    this.classIdCounter = 1;
    this.studentIdCounter = 1;
    this.subjectIdCounter = 1;
    this.experimentIdCounter = 1;
    this.gradeIdCounter = 1;
    
    this.sessionStore = new MemoryStore({
      checkPeriod: 86400000, // 24 hours
    });
    
    // Initialize with default data
    this.initializeData();
  }

  private async initializeData() {
    // Create default classes: IT1, IT2, IT3
    await this.createClass({ name: 'IT1' });
    await this.createClass({ name: 'IT2' });
    await this.createClass({ name: 'IT3' });
    
    // Create default subjects
    await this.createSubject({ code: 'FSD', name: 'Full Stack Development' });
    await this.createSubject({ code: 'IPCV', name: 'Image Processing & Computer Vision' });
    await this.createSubject({ code: 'ISIG', name: 'Information Security & Integrity' });
    await this.createSubject({ code: 'BDA', name: 'Big Data Analytics' });
    await this.createSubject({ code: 'SE', name: 'Software Engineering' });
    
    // Create default experiments for each subject
    const subjects = await this.getSubjects();
    for (const subject of subjects) {
      for (let i = 1; i <= 5; i++) {
        await this.createExperiment({
          subjectId: subject.id,
          number: i,
          title: `Experiment ${i}: ${subject.name}`,
          description: `Description for Experiment ${i} of ${subject.name}`
        });
      }
    }
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
  
  async createTeacher(teacherData: InsertTeacher): Promise<Teacher> {
    const id = this.teacherIdCounter++;
    const teacher: Teacher = { ...teacherData, id };
    this.teachers.set(id, teacher);
    return teacher;
  }
  
  // Class methods
  async getClasses(): Promise<Class[]> {
    return Array.from(this.classes.values());
  }
  
  async getClass(id: number): Promise<Class | undefined> {
    return this.classes.get(id);
  }
  
  async getClassByName(name: string): Promise<Class | undefined> {
    return Array.from(this.classes.values()).find(c => c.name === name);
  }
  
  async createClass(classData: InsertClass): Promise<Class> {
    const id = this.classIdCounter++;
    const newClass: Class = { ...classData, id };
    this.classes.set(id, newClass);
    return newClass;
  }
  
  // Student methods
  async getStudents(): Promise<StudentWithClass[]> {
    const students = Array.from(this.students.values());
    return Promise.all(students.map(async (student) => {
      const studentClass = await this.getClass(student.classId);
      return {
        ...student,
        className: studentClass?.name || 'Unknown',
      };
    }));
  }
  
  async getStudentsByClass(classId: number): Promise<StudentWithClass[]> {
    const students = Array.from(this.students.values())
      .filter(student => student.classId === classId);
    
    const studentClass = await this.getClass(classId);
    return students.map(student => ({
      ...student,
      className: studentClass?.name || 'Unknown',
    }));
  }
  
  async getStudent(id: number): Promise<StudentWithClass | undefined> {
    const student = this.students.get(id);
    if (!student) return undefined;
    
    const studentClass = await this.getClass(student.classId);
    return {
      ...student,
      className: studentClass?.name || 'Unknown',
    };
  }
  
  async getStudentBySapId(sapId: string): Promise<StudentWithClass | undefined> {
    const student = Array.from(this.students.values()).find(s => s.sapId === sapId);
    if (!student) return undefined;
    
    const studentClass = await this.getClass(student.classId);
    return {
      ...student,
      className: studentClass?.name || 'Unknown',
    };
  }
  
  async createStudent(studentData: InsertStudent): Promise<Student> {
    const id = this.studentIdCounter++;
    const student: Student = { ...studentData, id };
    this.students.set(id, student);
    return student;
  }
  
  async updateStudent(id: number, studentData: Partial<InsertStudent>): Promise<Student> {
    const student = this.students.get(id);
    if (!student) throw new Error('Student not found');
    
    const updatedStudent: Student = { ...student, ...studentData };
    this.students.set(id, updatedStudent);
    return updatedStudent;
  }
  
  // Subject methods
  async getSubjects(): Promise<Subject[]> {
    return Array.from(this.subjects.values());
  }
  
  async getSubject(id: number): Promise<Subject | undefined> {
    return this.subjects.get(id);
  }
  
  async getSubjectByCode(code: string): Promise<Subject | undefined> {
    return Array.from(this.subjects.values()).find(s => s.code === code);
  }
  
  async createSubject(subjectData: InsertSubject): Promise<Subject> {
    const id = this.subjectIdCounter++;
    const subject: Subject = { ...subjectData, id };
    this.subjects.set(id, subject);
    return subject;
  }
  
  // Experiment methods
  async getExperiments(): Promise<ExperimentWithSubject[]> {
    const experiments = Array.from(this.experiments.values());
    return Promise.all(experiments.map(async (experiment) => {
      const subject = await this.getSubject(experiment.subjectId);
      return {
        ...experiment,
        subjectCode: subject?.code || 'Unknown',
        subjectName: subject?.name || 'Unknown',
      };
    }));
  }
  
  async getExperimentsBySubject(subjectId: number): Promise<ExperimentWithSubject[]> {
    const experiments = Array.from(this.experiments.values())
      .filter(exp => exp.subjectId === subjectId);
    
    const subject = await this.getSubject(subjectId);
    return experiments.map(experiment => ({
      ...experiment,
      subjectCode: subject?.code || 'Unknown',
      subjectName: subject?.name || 'Unknown',
    }));
  }
  
  async getExperiment(id: number): Promise<ExperimentWithSubject | undefined> {
    const experiment = this.experiments.get(id);
    if (!experiment) return undefined;
    
    const subject = await this.getSubject(experiment.subjectId);
    return {
      ...experiment,
      subjectCode: subject?.code || 'Unknown',
      subjectName: subject?.name || 'Unknown',
    };
  }
  
  async createExperiment(experimentData: InsertExperiment): Promise<Experiment> {
    const id = this.experimentIdCounter++;
    const experiment: Experiment = { ...experimentData, id };
    this.experiments.set(id, experiment);
    return experiment;
  }
  
  // Grade methods
  async getGrades(): Promise<GradeWithDetails[]> {
    const grades = Array.from(this.grades.values());
    return Promise.all(grades.map(async (grade) => {
      const student = await this.getStudent(grade.studentId);
      const experiment = await this.getExperiment(grade.experimentId);
      
      return {
        ...grade,
        studentName: student?.name || 'Unknown',
        studentSapId: student?.sapId || 'Unknown',
        experimentTitle: experiment?.title || 'Unknown',
        experimentNumber: experiment?.number || 0,
        subjectCode: experiment?.subjectCode || 'Unknown',
      };
    }));
  }
  
  async getGradesByExperiment(experimentId: number): Promise<GradeWithDetails[]> {
    const grades = Array.from(this.grades.values())
      .filter(grade => grade.experimentId === experimentId);
    
    const experiment = await this.getExperiment(experimentId);
    
    return Promise.all(grades.map(async (grade) => {
      const student = await this.getStudent(grade.studentId);
      
      return {
        ...grade,
        studentName: student?.name || 'Unknown',
        studentSapId: student?.sapId || 'Unknown',
        experimentTitle: experiment?.title || 'Unknown',
        experimentNumber: experiment?.number || 0,
        subjectCode: experiment?.subjectCode || 'Unknown',
      };
    }));
  }
  
  async getGradesByStudent(studentId: number): Promise<GradeWithDetails[]> {
    const grades = Array.from(this.grades.values())
      .filter(grade => grade.studentId === studentId);
    
    const student = await this.getStudent(studentId);
    
    return Promise.all(grades.map(async (grade) => {
      const experiment = await this.getExperiment(grade.experimentId);
      
      return {
        ...grade,
        studentName: student?.name || 'Unknown',
        studentSapId: student?.sapId || 'Unknown',
        experimentTitle: experiment?.title || 'Unknown',
        experimentNumber: experiment?.number || 0,
        subjectCode: experiment?.subjectCode || 'Unknown',
      };
    }));
  }
  
  async getGradesByStudentAndExperiment(studentId: number, experimentId: number): Promise<Grade | undefined> {
    return Array.from(this.grades.values()).find(
      grade => grade.studentId === studentId && grade.experimentId === experimentId
    );
  }
  
  async createOrUpdateGrade(gradeData: InsertGrade): Promise<Grade> {
    const existingGrade = await this.getGradesByStudentAndExperiment(
      gradeData.studentId, 
      gradeData.experimentId
    );
    
    if (existingGrade) {
      // Update existing grade
      const updatedGrade: Grade = { 
        ...existingGrade, 
        ...gradeData,
        updatedAt: new Date(),
      };
      this.grades.set(existingGrade.id, updatedGrade);
      return updatedGrade;
    } else {
      // Create new grade
      const id = this.gradeIdCounter++;
      const now = new Date();
      const newGrade: Grade = { 
        ...gradeData, 
        id,
        createdAt: now,
        updatedAt: now,
      };
      this.grades.set(id, newGrade);
      return newGrade;
    }
  }
  
  async updateGrade(studentId: number, experimentId: number, gradeData: UpdateGrade): Promise<Grade> {
    const existingGrade = await this.getGradesByStudentAndExperiment(studentId, experimentId);
    if (!existingGrade) throw new Error('Grade not found');
    
    const updatedGrade: Grade = { 
      ...existingGrade, 
      ...gradeData,
      updatedAt: new Date(),
    };
    this.grades.set(existingGrade.id, updatedGrade);
    return updatedGrade;
  }
}

export const storage = new MemStorage();
