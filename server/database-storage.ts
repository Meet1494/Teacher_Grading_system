import { teachers, students, grades, Teacher, Student, Grade, InsertTeacher, InsertStudent, InsertGrade } from "@shared/schema";
import session from "express-session";
import connectPg from "connect-pg-simple";
import { db, pool } from "./db";
import { eq, and } from "drizzle-orm";
import { IStorage } from "./storage";

const PostgresSessionStore = connectPg(session);

export class DatabaseStorage implements IStorage {
  public sessionStore: any;

  constructor() {
    this.sessionStore = new PostgresSessionStore({ 
      pool, 
      createTableIfMissing: true 
    });
  }

  // Teacher methods
  async getTeacher(id: number): Promise<Teacher | undefined> {
    const [teacher] = await db.select().from(teachers).where(eq(teachers.id, id));
    return teacher;
  }

  async getTeacherByUsername(username: string): Promise<Teacher | undefined> {
    const [teacher] = await db.select().from(teachers).where(eq(teachers.username, username));
    return teacher;
  }

  async createTeacher(teacher: InsertTeacher): Promise<Teacher> {
    const [newTeacher] = await db.insert(teachers).values(teacher).returning();
    return newTeacher;
  }

  // Student methods
  async getStudent(id: number): Promise<Student | undefined> {
    const [student] = await db.select().from(students).where(eq(students.id, id));
    return student;
  }

  async getStudentBySapId(sapId: string): Promise<Student | undefined> {
    const [student] = await db.select().from(students).where(eq(students.sapId, sapId));
    return student;
  }

  async createStudent(student: InsertStudent): Promise<Student> {
    const [newStudent] = await db.insert(students).values(student).returning();
    return newStudent;
  }

  async updateStudent(id: number, student: Partial<InsertStudent>): Promise<Student | undefined> {
    const [updatedStudent] = await db
      .update(students)
      .set(student)
      .where(eq(students.id, id))
      .returning();
    return updatedStudent;
  }

  async getAllStudents(): Promise<Student[]> {
    return await db.select().from(students);
  }

  async getStudentsByClass(className: string): Promise<Student[]> {
    return await db
      .select()
      .from(students)
      .where(eq(students.class, className));
  }

  // Grade methods
  async getGrade(id: number): Promise<Grade | undefined> {
    const [grade] = await db.select().from(grades).where(eq(grades.id, id));
    return grade;
  }

  async getGradeByStudentAndExperiment(
    studentId: number, 
    subject: string, 
    experimentNumber: number
  ): Promise<Grade | undefined> {
    const [grade] = await db
      .select()
      .from(grades)
      .where(
        and(
          eq(grades.studentId, studentId),
          eq(grades.subject, subject),
          eq(grades.experimentNumber, experimentNumber)
        )
      );
    return grade;
  }

  async createGrade(grade: InsertGrade): Promise<Grade> {
    const gradeWithComment = {
      ...grade,
      comment: grade.comment || null,
      updatedAt: new Date()
    };
    const [newGrade] = await db.insert(grades).values(gradeWithComment).returning();
    return newGrade;
  }

  async updateGrade(id: number, grade: Partial<InsertGrade>): Promise<Grade | undefined> {
    // Ensure we include the updatedAt timestamp
    const updatedData = {
      ...grade,
      comment: grade.comment || null,
      updatedAt: new Date()
    };
    
    const [updatedGrade] = await db
      .update(grades)
      .set(updatedData)
      .where(eq(grades.id, id))
      .returning();
    return updatedGrade;
  }

  async getGradesByStudentId(studentId: number): Promise<Grade[]> {
    return await db
      .select()
      .from(grades)
      .where(eq(grades.studentId, studentId));
  }

  async getGradesBySubjectAndExperiment(
    subject: string, 
    experimentNumber: number
  ): Promise<Grade[]> {
    return await db
      .select()
      .from(grades)
      .where(
        and(
          eq(grades.subject, subject),
          eq(grades.experimentNumber, experimentNumber)
        )
      );
  }

  async getGradesByStudentIdAndSubject(
    studentId: number, 
    subject: string
  ): Promise<Grade[]> {
    return await db
      .select()
      .from(grades)
      .where(
        and(
          eq(grades.studentId, studentId),
          eq(grades.subject, subject)
        )
      );
  }
}