import { pgTable, text, serial, integer, boolean, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Teachers table
export const teachers = pgTable("teachers", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  name: text("name").notNull(),
});

export const insertTeacherSchema = createInsertSchema(teachers).pick({
  username: true,
  password: true,
  name: true,
});

// Classes enum
export const classesEnum = z.enum(["IT1", "IT2", "IT3"]);

// Students table
export const students = pgTable("students", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  sapId: text("sapId").notNull().unique(),
  class: text("class").notNull(), // One of "IT1", "IT2", "IT3"
});

export const insertStudentSchema = createInsertSchema(students).pick({
  name: true,
  sapId: true,
  class: true,
});

// Subjects enum
export const subjectsEnum = z.enum(["FSD", "IPCV", "ISIG", "BDA", "SE"]);

// Parameters enum for grading
export const parametersEnum = z.enum([
  "performance",
  "knowledge",
  "implementation",
  "strategy",
  "attitude"
]);

// Grades table
export const grades = pgTable("grades", {
  id: serial("id").primaryKey(),
  studentId: integer("studentId").notNull(),
  subject: text("subject").notNull(), // One of FSD, IPCV, ISIG, BDA, SE
  experimentNumber: integer("experimentNumber").notNull(), // 1 to 5
  performance: integer("performance").notNull(), // 0 to 5
  knowledge: integer("knowledge").notNull(), // 0 to 5
  implementation: integer("implementation").notNull(), // 0 to 5
  strategy: integer("strategy").notNull(), // 0 to 5
  attitude: integer("attitude").notNull(), // 0 to 5
  comment: text("comment"),
  updatedAt: timestamp("updatedAt").notNull(),
});

export const insertGradeSchema = createInsertSchema(grades).pick({
  studentId: true,
  subject: true,
  experimentNumber: true,
  performance: true,
  knowledge: true,
  implementation: true,
  strategy: true,
  attitude: true,
  comment: true,
});

// Add custom validation
export const extendedInsertGradeSchema = insertGradeSchema.extend({
  performance: z.number().min(0).max(5),
  knowledge: z.number().min(0).max(5),
  implementation: z.number().min(0).max(5),
  strategy: z.number().min(0).max(5),
  attitude: z.number().min(0).max(5),
});

// Types
export type InsertTeacher = z.infer<typeof insertTeacherSchema>;
export type Teacher = typeof teachers.$inferSelect;

export type InsertStudent = z.infer<typeof insertStudentSchema>;
export type Student = typeof students.$inferSelect;

export type InsertGrade = z.infer<typeof insertGradeSchema>;
export type Grade = typeof grades.$inferSelect;

// Custom types for API responses
export type GradeWithTotal = Grade & { total: number };
export type StudentWithGrades = Student & { grades: GradeWithTotal };
export type SubjectExperiment = { subject: string, experimentNumber: number };
