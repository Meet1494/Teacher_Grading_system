import type { Express, Request, Response } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { setupAuth } from "./auth";
import { 
  insertStudentSchema, 
  insertGradeSchema, 
  updateGradeSchema 
} from "@shared/schema";
import { ZodError } from "zod";
import { fromZodError } from "zod-validation-error";

function isAuthenticated(req: Request, res: Response, next: Function) {
  if (req.isAuthenticated()) {
    return next();
  }
  return res.status(401).json({ message: "Unauthorized" });
}

export async function registerRoutes(app: Express): Promise<Server> {
  // Sets up auth routes: /api/register, /api/login, /api/logout, /api/user
  setupAuth(app);

  // Classes routes
  app.get("/api/classes", isAuthenticated, async (req, res) => {
    try {
      const classes = await storage.getClasses();
      res.json(classes);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch classes" });
    }
  });

  // Students routes
  app.get("/api/students", isAuthenticated, async (req, res) => {
    try {
      const students = await storage.getStudents();
      res.json(students);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch students" });
    }
  });

  app.get("/api/students/class/:classId", isAuthenticated, async (req, res) => {
    try {
      const classId = parseInt(req.params.classId);
      const students = await storage.getStudentsByClass(classId);
      res.json(students);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch students by class" });
    }
  });

  app.post("/api/students", isAuthenticated, async (req, res) => {
    try {
      const studentData = insertStudentSchema.parse(req.body);
      const student = await storage.createStudent(studentData);
      res.status(201).json(student);
    } catch (error) {
      if (error instanceof ZodError) {
        const validationError = fromZodError(error);
        return res.status(400).json({ message: validationError.message });
      }
      res.status(500).json({ message: "Failed to create student" });
    }
  });

  app.put("/api/students/:id", isAuthenticated, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const studentData = insertStudentSchema.partial().parse(req.body);
      const student = await storage.updateStudent(id, studentData);
      res.json(student);
    } catch (error) {
      if (error instanceof ZodError) {
        const validationError = fromZodError(error);
        return res.status(400).json({ message: validationError.message });
      }
      res.status(500).json({ message: "Failed to update student" });
    }
  });

  // Subjects routes
  app.get("/api/subjects", isAuthenticated, async (req, res) => {
    try {
      const subjects = await storage.getSubjects();
      res.json(subjects);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch subjects" });
    }
  });

  // Experiments routes
  app.get("/api/experiments", isAuthenticated, async (req, res) => {
    try {
      const experiments = await storage.getExperiments();
      res.json(experiments);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch experiments" });
    }
  });

  app.get("/api/experiments/subject/:subjectId", isAuthenticated, async (req, res) => {
    try {
      const subjectId = parseInt(req.params.subjectId);
      const experiments = await storage.getExperimentsBySubject(subjectId);
      res.json(experiments);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch experiments by subject" });
    }
  });

  // Grades routes
  app.get("/api/grades/experiment/:experimentId", isAuthenticated, async (req, res) => {
    try {
      const experimentId = parseInt(req.params.experimentId);
      const grades = await storage.getGradesByExperiment(experimentId);
      res.json(grades);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch grades by experiment" });
    }
  });

  app.get("/api/grades/student/:studentId", isAuthenticated, async (req, res) => {
    try {
      const studentId = parseInt(req.params.studentId);
      const grades = await storage.getGradesByStudent(studentId);
      res.json(grades);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch grades by student" });
    }
  });

  app.post("/api/grades", isAuthenticated, async (req, res) => {
    try {
      const gradeData = insertGradeSchema.parse(req.body);
      const grade = await storage.createOrUpdateGrade(gradeData);
      res.status(201).json(grade);
    } catch (error) {
      if (error instanceof ZodError) {
        const validationError = fromZodError(error);
        return res.status(400).json({ message: validationError.message });
      }
      res.status(500).json({ message: "Failed to create grade" });
    }
  });

  app.put("/api/grades/:studentId/:experimentId", isAuthenticated, async (req, res) => {
    try {
      const studentId = parseInt(req.params.studentId);
      const experimentId = parseInt(req.params.experimentId);
      const gradeData = updateGradeSchema.parse(req.body);
      const grade = await storage.updateGrade(studentId, experimentId, gradeData);
      res.json(grade);
    } catch (error) {
      if (error instanceof ZodError) {
        const validationError = fromZodError(error);
        return res.status(400).json({ message: validationError.message });
      }
      res.status(500).json({ message: "Failed to update grade" });
    }
  });

  // Generate report endpoint (gets all grades for a student)
  app.get("/api/reports/student/:studentId", isAuthenticated, async (req, res) => {
    try {
      const studentId = parseInt(req.params.studentId);
      const student = await storage.getStudent(studentId);
      if (!student) {
        return res.status(404).json({ message: "Student not found" });
      }
      
      const grades = await storage.getGradesByStudent(studentId);
      const subjects = await storage.getSubjects();
      
      // Group grades by subject
      const subjectGrades: Record<string, any> = {};
      
      for (const subject of subjects) {
        subjectGrades[subject.code] = {
          subjectName: subject.name,
          experiments: [],
          totalMarks: 0,
          maxMarks: 0
        };
      }
      
      for (const grade of grades) {
        const experiment = await storage.getExperiment(grade.experimentId);
        if (!experiment) continue;
        
        const totalGrade = (grade.performance || 0) + 
                          (grade.knowledge || 0) + 
                          (grade.implementation || 0) + 
                          (grade.strategy || 0) + 
                          (grade.attitude || 0);
        
        subjectGrades[experiment.subjectCode].experiments.push({
          experimentNumber: experiment.number,
          experimentTitle: experiment.title,
          performance: grade.performance || 0,
          knowledge: grade.knowledge || 0,
          implementation: grade.implementation || 0,
          strategy: grade.strategy || 0,
          attitude: grade.attitude || 0,
          totalMarks: totalGrade,
          maxMarks: 25
        });
        
        subjectGrades[experiment.subjectCode].totalMarks += totalGrade;
        subjectGrades[experiment.subjectCode].maxMarks += 25;
      }
      
      // Calculate overall metrics
      let overallTotalMarks = 0;
      let overallMaxMarks = 0;
      
      // Calculate metrics by parameter
      const metrics = {
        performance: { total: 0, count: 0 },
        knowledge: { total: 0, count: 0 },
        implementation: { total: 0, count: 0 },
        strategy: { total: 0, count: 0 },
        attitude: { total: 0, count: 0 }
      };
      
      for (const subject of Object.values(subjectGrades)) {
        for (const experiment of subject.experiments) {
          if (experiment.performance) {
            metrics.performance.total += experiment.performance;
            metrics.performance.count++;
          }
          if (experiment.knowledge) {
            metrics.knowledge.total += experiment.knowledge;
            metrics.knowledge.count++;
          }
          if (experiment.implementation) {
            metrics.implementation.total += experiment.implementation;
            metrics.implementation.count++;
          }
          if (experiment.strategy) {
            metrics.strategy.total += experiment.strategy;
            metrics.strategy.count++;
          }
          if (experiment.attitude) {
            metrics.attitude.total += experiment.attitude;
            metrics.attitude.count++;
          }
        }
        
        overallTotalMarks += subject.totalMarks;
        overallMaxMarks += subject.maxMarks;
      }
      
      // Calculate averages
      const metricAverages = {
        performance: metrics.performance.count > 0 ? metrics.performance.total / metrics.performance.count : 0,
        knowledge: metrics.knowledge.count > 0 ? metrics.knowledge.total / metrics.knowledge.count : 0,
        implementation: metrics.implementation.count > 0 ? metrics.implementation.total / metrics.implementation.count : 0,
        strategy: metrics.strategy.count > 0 ? metrics.strategy.total / metrics.strategy.count : 0,
        attitude: metrics.attitude.count > 0 ? metrics.attitude.total / metrics.attitude.count : 0
      };
      
      // Get overall percentage and grade
      const overallPercentage = overallMaxMarks > 0 ? (overallTotalMarks / overallMaxMarks) * 100 : 0;
      
      // Determine overall grade
      let overallGrade = 'F';
      if (overallPercentage >= 90) overallGrade = 'A+';
      else if (overallPercentage >= 80) overallGrade = 'A';
      else if (overallPercentage >= 70) overallGrade = 'B';
      else if (overallPercentage >= 60) overallGrade = 'C';
      else if (overallPercentage >= 50) overallGrade = 'D';
      
      const report = {
        student: {
          id: student.id,
          name: student.name,
          sapId: student.sapId,
          className: student.className
        },
        subjects: subjectGrades,
        metrics: metricAverages,
        overall: {
          totalMarks: overallTotalMarks,
          maxMarks: overallMaxMarks,
          percentage: overallPercentage,
          grade: overallGrade
        }
      };
      
      res.json(report);
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: "Failed to generate report" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
