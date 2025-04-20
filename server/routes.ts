import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { setupAuth } from "./auth";
import { extendedInsertGradeSchema, insertStudentSchema } from "@shared/schema";
import { z } from "zod";

export async function registerRoutes(app: Express): Promise<Server> {
  // Set up authentication
  setupAuth(app);

  // API routes
  const apiRouter = app.route("/api");

  // Students API
  app.get("/api/students", async (req, res, next) => {
    try {
      if (!req.isAuthenticated()) return res.sendStatus(401);
      
      let students;
      if (req.query.class) {
        students = await storage.getStudentsByClass(req.query.class as string);
      } else {
        students = await storage.getAllStudents();
      }
      res.json(students);
    } catch (error) {
      next(error);
    }
  });

  app.get("/api/students/:id", async (req, res, next) => {
    try {
      if (!req.isAuthenticated()) return res.sendStatus(401);
      
      const student = await storage.getStudent(parseInt(req.params.id));
      if (!student) {
        return res.status(404).json({ message: "Student not found" });
      }
      res.json(student);
    } catch (error) {
      next(error);
    }
  });

  app.post("/api/students", async (req, res, next) => {
    try {
      if (!req.isAuthenticated()) return res.sendStatus(401);
      
      // Validate request body
      const parsedData = insertStudentSchema.safeParse(req.body);
      if (!parsedData.success) {
        return res.status(400).json({ error: parsedData.error });
      }

      // Check if student already exists
      const existingStudent = await storage.getStudentBySapId(req.body.sapId);
      if (existingStudent) {
        return res.status(400).json({ message: "Student with this SAP ID already exists" });
      }

      const newStudent = await storage.createStudent(parsedData.data);
      res.status(201).json(newStudent);
    } catch (error) {
      next(error);
    }
  });

  app.patch("/api/students/:id", async (req, res, next) => {
    try {
      if (!req.isAuthenticated()) return res.sendStatus(401);
      
      const student = await storage.getStudent(parseInt(req.params.id));
      if (!student) {
        return res.status(404).json({ message: "Student not found" });
      }

      const updatedStudent = await storage.updateStudent(parseInt(req.params.id), req.body);
      res.json(updatedStudent);
    } catch (error) {
      next(error);
    }
  });

  // Grades API
  app.get("/api/grades", async (req, res, next) => {
    try {
      if (!req.isAuthenticated()) return res.sendStatus(401);
      
      // Filter by student, subject, and experiment if provided
      const studentId = req.query.studentId ? parseInt(req.query.studentId as string) : undefined;
      const subject = req.query.subject as string | undefined;
      const experimentNumber = req.query.experimentNumber 
        ? parseInt(req.query.experimentNumber as string) 
        : undefined;

      let grades = [];
      if (studentId && subject && experimentNumber) {
        const grade = await storage.getGradeByStudentAndExperiment(
          studentId, 
          subject, 
          experimentNumber
        );
        grades = grade ? [grade] : [];
      } else if (studentId && subject) {
        grades = await storage.getGradesByStudentIdAndSubject(studentId, subject);
      } else if (subject && experimentNumber) {
        grades = await storage.getGradesBySubjectAndExperiment(subject, experimentNumber);
      } else if (studentId) {
        grades = await storage.getGradesByStudentId(studentId);
      } else {
        return res.status(400).json({ message: "Missing required query parameters" });
      }

      // Add total score to each grade
      const gradesWithTotal = grades.map(grade => {
        const total = grade.performance + grade.knowledge + 
          grade.implementation + grade.strategy + 
          grade.attitude;
        return { ...grade, total };
      });

      res.json(gradesWithTotal);
    } catch (error) {
      next(error);
    }
  });

  app.post("/api/grades", async (req, res, next) => {
    try {
      if (!req.isAuthenticated()) return res.sendStatus(401);
      
      // Validate request body
      const parsedData = extendedInsertGradeSchema.safeParse(req.body);
      if (!parsedData.success) {
        return res.status(400).json({ error: parsedData.error });
      }

      // Check if student exists
      const student = await storage.getStudent(req.body.studentId);
      if (!student) {
        return res.status(400).json({ message: "Student not found" });
      }

      // Check if grade already exists for this student, subject, and experiment
      const existingGrade = await storage.getGradeByStudentAndExperiment(
        req.body.studentId,
        req.body.subject,
        req.body.experimentNumber
      );

      if (existingGrade) {
        // Update existing grade
        const updatedGrade = await storage.updateGrade(existingGrade.id, parsedData.data);
        return res.json(updatedGrade);
      }

      // Create new grade
      const newGrade = await storage.createGrade(parsedData.data);
      res.status(201).json(newGrade);
    } catch (error) {
      next(error);
    }
  });

  app.patch("/api/grades/:id", async (req, res, next) => {
    try {
      if (!req.isAuthenticated()) return res.sendStatus(401);
      
      const grade = await storage.getGrade(parseInt(req.params.id));
      if (!grade) {
        return res.status(404).json({ message: "Grade not found" });
      }

      const updatedGrade = await storage.updateGrade(parseInt(req.params.id), req.body);
      res.json(updatedGrade);
    } catch (error) {
      next(error);
    }
  });

  // Reports API
  app.get("/api/reports/student/:id", async (req, res, next) => {
    try {
      if (!req.isAuthenticated()) return res.sendStatus(401);
      
      const studentId = parseInt(req.params.id);
      const student = await storage.getStudent(studentId);
      
      if (!student) {
        return res.status(404).json({ message: "Student not found" });
      }

      const grades = await storage.getGradesByStudentId(studentId);
      
      // Add total score to each grade
      const gradesWithTotal = grades.map(grade => {
        const total = grade.performance + grade.knowledge + 
          grade.implementation + grade.strategy + 
          grade.attitude;
        return { ...grade, total };
      });

      res.json({
        student,
        grades: gradesWithTotal
      });
    } catch (error) {
      next(error);
    }
  });
  
  const httpServer = createServer(app);

  return httpServer;
}
