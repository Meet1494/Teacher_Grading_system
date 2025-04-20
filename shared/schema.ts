import { pgTable, text, serial, integer, boolean, timestamp, unique } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Teacher schema
export const teachers = pgTable("teachers", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  name: text("name").notNull(),
  department: text("department"),
});

export const insertTeacherSchema = createInsertSchema(teachers).pick({
  username: true,
  password: true,
  name: true,
  department: true,
});

// Class schema
export const classes = pgTable("classes", {
  id: serial("id").primaryKey(),
  name: text("name").notNull().unique(), // IT1, IT2, IT3, etc.
});

export const insertClassSchema = createInsertSchema(classes).pick({
  name: true,
});

// Student schema
export const students = pgTable("students", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  sapId: text("sap_id").notNull().unique(),
  classId: integer("class_id").notNull(),
});

export const insertStudentSchema = createInsertSchema(students).pick({
  name: true,
  sapId: true,
  classId: true,
});

// Subject schema
export const subjects = pgTable("subjects", {
  id: serial("id").primaryKey(),
  code: text("code").notNull().unique(), // FSD, IPCV, ISIG, BDA, SE
  name: text("name").notNull(),
});

export const insertSubjectSchema = createInsertSchema(subjects).pick({
  code: true,
  name: true,
});

// Experiment schema
export const experiments = pgTable("experiments", {
  id: serial("id").primaryKey(),
  subjectId: integer("subject_id").notNull(),
  number: integer("number").notNull(), // 1-5
  title: text("title").notNull(),
  description: text("description"),
});

export const insertExperimentSchema = createInsertSchema(experiments).pick({
  subjectId: true,
  number: true,
  title: true,
  description: true,
});

// Grade schema
export const grades = pgTable("grades", {
  id: serial("id").primaryKey(),
  studentId: integer("student_id").notNull(),
  experimentId: integer("experiment_id").notNull(),
  performance: integer("performance"), // 0-5
  knowledge: integer("knowledge"), // 0-5
  implementation: integer("implementation"), // 0-5
  strategy: integer("strategy"), // 0-5
  attitude: integer("attitude"), // 0-5
  comment: text("comment"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
}, (table) => {
  return {
    unq: unique().on(table.studentId, table.experimentId),
  };
});

export const insertGradeSchema = createInsertSchema(grades).pick({
  studentId: true,
  experimentId: true,
  performance: true,
  knowledge: true,
  implementation: true,
  strategy: true,
  attitude: true,
  comment: true,
});

export const updateGradeSchema = createInsertSchema(grades).pick({
  performance: true,
  knowledge: true,
  implementation: true,
  strategy: true,
  attitude: true,
  comment: true,
});

// Types
export type InsertTeacher = z.infer<typeof insertTeacherSchema>;
export type Teacher = typeof teachers.$inferSelect;

export type InsertClass = z.infer<typeof insertClassSchema>;
export type Class = typeof classes.$inferSelect;

export type InsertStudent = z.infer<typeof insertStudentSchema>;
export type Student = typeof students.$inferSelect;

export type InsertSubject = z.infer<typeof insertSubjectSchema>;
export type Subject = typeof subjects.$inferSelect;

export type InsertExperiment = z.infer<typeof insertExperimentSchema>;
export type Experiment = typeof experiments.$inferSelect;

export type InsertGrade = z.infer<typeof insertGradeSchema>;
export type UpdateGrade = z.infer<typeof updateGradeSchema>;
export type Grade = typeof grades.$inferSelect;

// Extended types for frontend use
export type StudentWithClass = Student & { className: string };
export type ExperimentWithSubject = Experiment & { subjectCode: string, subjectName: string };
export type GradeWithDetails = Grade & { 
  studentName: string, 
  studentSapId: string, 
  experimentTitle: string,
  experimentNumber: number,
  subjectCode: string
};
