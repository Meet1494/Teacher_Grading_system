# Student Grading System - Local Setup Guide

This guide will help you set up and run the Student Grading System on your local machine.

## Prerequisites

1. Node.js (v18 or newer) and npm
2. PostgreSQL database (local or cloud-hosted)
3. Git (for cloning the repository)

## Step 1: Clone the Repository

```bash
git clone https://github.com/yourusername/student-grading-system.git
cd student-grading-system
```

## Step 2: Install Dependencies

```bash
npm install
```

## Step 3: Set Up Environment Variables

Create a `.env` file in the root directory with the following content:

```
# Database Configuration
DATABASE_URL=postgresql://username:password@localhost:5432/student_grading_system

# Session Secret (generate a random string)
SESSION_SECRET=your_random_session_secret_here
```

Replace `username`, `password`, and other values with your PostgreSQL database credentials.

## Step 4: Set Up the Database

Create a new PostgreSQL database:

```bash
createdb student_grading_system
```

Then, run the database migration:

```bash
npm run db:push
```

## Step 5: Run the Application

Start the development server:

```bash
npm run dev
```

The application will be available at `http://localhost:5000`.

## Project Structure

```
├── client/                 # Frontend code
│   ├── src/
│   │   ├── components/     # React components
│   │   ├── hooks/          # Custom React hooks
│   │   ├── lib/            # Utility functions
│   │   ├── pages/          # Page components
│   │   ├── App.tsx         # Main application component
│   │   └── main.tsx        # Entry point
│   └── index.html          # HTML template
├── server/                 # Backend code
│   ├── auth.ts             # Authentication logic
│   ├── db.ts               # Database connection
│   ├── index.ts            # Server entry point
│   ├── routes.ts           # API routes
│   ├── storage.ts          # Storage interface
│   └── vite.ts             # Vite server configuration
├── shared/                 # Shared code between client and server
│   └── schema.ts           # Database schema and types
├── drizzle.config.ts       # Drizzle ORM configuration
└── package.json            # Project dependencies
```

## API Endpoints

The system exposes the following API endpoints:

- `/api/students` - CRUD operations for students
- `/api/grades` - CRUD operations for grades
- `/api/reports/student` - Get student reports

## Database Schema

The system uses the following tables:

- `teachers` - Store teacher information
- `students` - Store student information (name, SAP ID, class)
- `grades` - Store student grades for experiments (performance, knowledge, implementation, strategy, attitude)

## Deployment

To prepare the application for production:

1. Build the frontend and backend:

```bash
npm run build
```

2. Start the production server:

```bash
npm start
```

## Troubleshooting

If you encounter issues:

1. Check database connection - ensure your PostgreSQL server is running and accessible
2. Verify environment variables - make sure your `.env` file is correctly configured
3. Check port availability - make sure port 5000 is not already in use

## Exporting Data

The system allows exporting student reports as CSV files. This feature is available through the UI in the Reports section.
