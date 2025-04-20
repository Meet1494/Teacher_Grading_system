#!/bin/bash

# Create a project directory
mkdir -p student-grading-system
cd student-grading-system

# Copy package.json and configuration files
cp ../package.json .
cp ../tsconfig.json .
cp ../vite.config.ts .
cp ../postcss.config.js .
cp ../tailwind.config.ts .
cp ../drizzle.config.ts .
cp ../theme.json .

# Create directories
mkdir -p client/src/{components,hooks,lib,pages}
mkdir -p server
mkdir -p shared

# Copy client files
cp -r ../client/src/* client/src/
cp ../client/index.html client/

# Copy server files
cp -r ../server/* server/

# Copy shared files
cp -r ../shared/* shared/

# Create .env file template
cat > .env << EOF
# Database Configuration
DATABASE_URL=postgresql://username:password@localhost:5432/student_grading_system

# Session Secret (generate a random string)
SESSION_SECRET=change_this_to_a_random_string
EOF

# Copy documentation
cp ../LOCAL_SETUP_GUIDE.md .

# Create a simple README
cat > README.md << EOF
# Student Grading System

A comprehensive system designed to streamline teacher workflow for student assessment, enabling efficient experiment grading and report generation.

## Features

- Add and manage students by class (IT1, IT2, IT3)
- Grade experiments across 5 subjects (FSD, IPCV, ISIG, BDA, SE)
- Grade on 5 parameters: Performance, Knowledge, Implementation, Strategy, Attitude
- Generate comprehensive student reports
- Export reports as CSV files

## Getting Started

Please refer to the [Local Setup Guide](./LOCAL_SETUP_GUIDE.md) for instructions on how to set up and run the project locally.

## License

This project is for educational purposes only.
EOF

# Create .gitignore
cat > .gitignore << EOF
# Node modules
node_modules/

# Environment variables
.env
.env.local
.env.development
.env.test
.env.production

# Build files
dist/
build/

# Logs
logs
*.log
npm-debug.log*
yarn-debug.log*
yarn-error.log*

# Editor directories and files
.idea/
.vscode/
*.suo
*.ntvs*
*.njsproj
*.sln
*.sw?

# OS generated files
.DS_Store
.DS_Store?
._*
.Spotlight-V100
.Trashes
ehthumbs.db
Thumbs.db
EOF

echo "Project exported to student-grading-system directory"
echo "Follow the instructions in LOCAL_SETUP_GUIDE.md to set up and run the project locally"