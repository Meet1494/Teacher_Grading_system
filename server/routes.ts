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
      console.log("GET /api/students - No authentication required");
      
      let students;
      if (req.query.class) {
        students = await storage.getStudentsByClass(req.query.class as string);
      } else {
        students = await storage.getAllStudents();
      }
      res.json(students);
    } catch (error) {
      console.error("Error in GET /api/students:", error);
      next(error);
    }
  });

  app.get("/api/students/:id", async (req, res, next) => {
    try {
      console.log("GET /api/students/:id - No authentication required");
      
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
      console.log("POST /api/students - No authentication required");
      
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
      console.log("PATCH /api/students/:id - No authentication required");
      
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
      console.log("GET /api/grades - No authentication required");
      console.log("Query parameters:", req.query);
      
      // Filter by student, subject, and experiment if provided
      const studentId = req.query.studentId ? parseInt(req.query.studentId as string) : undefined;
      const subject = req.query.subject as string | undefined;
      const experimentNumber = req.query.experimentNumber 
        ? parseInt(req.query.experimentNumber as string) 
        : undefined;

      let grades = [];
      
      if (studentId && subject && experimentNumber) {
        // Get grade for specific student, subject and experiment
        const grade = await storage.getGradeByStudentAndExperiment(
          studentId, 
          subject, 
          experimentNumber
        );
        grades = grade ? [grade] : [];
      } else if (studentId && subject) {
        // Get all grades for student in a subject
        grades = await storage.getGradesByStudentIdAndSubject(studentId, subject);
      } else if (subject && experimentNumber) {
        // Get all grades for a subject and experiment (what the grading sheet page needs)
        grades = await storage.getGradesBySubjectAndExperiment(subject, experimentNumber);
      } else if (studentId) {
        // Get all grades for a student
        grades = await storage.getGradesByStudentId(studentId);
      } else {
        // If no filter provided, return empty array instead of error
        // This helps the UI not break when initially loading
        console.log("No query parameters provided for grades - returning empty array");
        return res.json([]);
      }

      // Add total score to each grade
      const gradesWithTotal = grades.map(grade => {
        const total = grade.performance + grade.knowledge + 
          grade.implementation + grade.strategy + 
          grade.attitude;
        return { ...grade, total };
      });

      console.log(`Returning ${gradesWithTotal.length} grades`);
      res.json(gradesWithTotal);
    } catch (error) {
      console.error("Error in GET /api/grades:", error);
      next(error);
    }
  });

  app.post("/api/grades", async (req, res, next) => {
    try {
      console.log("POST /api/grades - No authentication required");
      
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
      console.log("PATCH /api/grades/:id - No authentication required");
      
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
      console.log("GET /api/reports/student/:id - No authentication required");
      
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
