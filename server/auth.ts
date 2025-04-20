import passport from "passport";
import { Strategy as LocalStrategy } from "passport-local";
import { Express } from "express";
import session from "express-session";
import { scrypt, randomBytes, timingSafeEqual } from "crypto";
import { promisify } from "util";
import { storage } from "./storage";
import { Teacher } from "@shared/schema";

declare global {
  namespace Express {
    interface User extends Teacher {}
  }
}

const scryptAsync = promisify(scrypt);

async function hashPassword(password: string) {
  const salt = randomBytes(16).toString("hex");
  const buf = (await scryptAsync(password, salt, 64)) as Buffer;
  return `${buf.toString("hex")}.${salt}`;
}

async function comparePasswords(supplied: string, stored: string) {
  const [hashed, salt] = stored.split(".");
  const hashedBuf = Buffer.from(hashed, "hex");
  const suppliedBuf = (await scryptAsync(supplied, salt, 64)) as Buffer;
  return timingSafeEqual(hashedBuf, suppliedBuf);
}

export function setupAuth(app: Express) {
  if (!process.env.SESSION_SECRET) {
    console.warn("WARNING: No SESSION_SECRET environment variable set! Using a default secret.");
  }
  
  const sessionSettings: session.SessionOptions = {
    secret: process.env.SESSION_SECRET || "teacher-grading-system-secret",
    resave: true,
    saveUninitialized: true,
    store: storage.sessionStore,
    name: 'teacher-grade-app.sid', // custom name helps identify our app's cookies
    cookie: {
      maxAge: 30 * 24 * 60 * 60 * 1000, // 30 days
      httpOnly: true,
      secure: false, // set to false for development
      sameSite: 'lax',
      path: '/'
    }
  };

  app.set("trust proxy", 1);
  
  // Set up session middleware
  app.use(session(sessionSettings));
  
  // Initialize Passport and restore authentication state from session
  app.use(passport.initialize());
  app.use(passport.session());
  
  // Log session setup for debugging
  console.log("Auth setup complete with session store:", 
    storage.sessionStore ? "PostgreSQL session store" : "No session store");

  passport.use(
    new LocalStrategy(async (username, password, done) => {
      const teacher = await storage.getTeacherByUsername(username);
      if (!teacher || !(await comparePasswords(password, teacher.password))) {
        return done(null, false);
      } else {
        return done(null, teacher);
      }
    }),
  );

  passport.serializeUser((user, done) => done(null, user.id));
  passport.deserializeUser(async (id: number, done) => {
    const teacher = await storage.getTeacher(id);
    done(null, teacher);
  });

  app.post("/api/register", async (req, res, next) => {
    try {
      const existingTeacher = await storage.getTeacherByUsername(req.body.username);
      if (existingTeacher) {
        return res.status(400).send("Username already exists");
      }

      const teacher = await storage.createTeacher({
        ...req.body,
        password: await hashPassword(req.body.password),
      });

      req.login(teacher, (err) => {
        if (err) return next(err);
        res.status(201).json(teacher);
      });
    } catch (error) {
      next(error);
    }
  });

  app.post("/api/login", passport.authenticate("local"), (req, res) => {
    console.log("Login successful, user:", req.user);
    console.log("Session ID:", req.sessionID);
    console.log("Is authenticated:", req.isAuthenticated());
    res.status(200).json(req.user);
  });

  app.post("/api/logout", (req, res, next) => {
    req.logout((err) => {
      if (err) return next(err);
      res.sendStatus(200);
    });
  });

  app.get("/api/user", (req, res) => {
    console.log("GET /api/user - Session ID:", req.sessionID);
    console.log("GET /api/user - Is authenticated:", req.isAuthenticated());
    
    if (!req.isAuthenticated()) {
      console.log("GET /api/user - Not authenticated, sending 401");
      return res.sendStatus(401);
    }
    
    console.log("GET /api/user - User:", req.user);
    res.json(req.user);
  });
}
