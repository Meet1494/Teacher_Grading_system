# Student Grading System - Deployment Guide

This guide will help you deploy the Student Grading System to a production environment.

## Option 1: Deploy on Render.com (Recommended)

Render.com offers a simple way to deploy full-stack JavaScript applications with a free tier.

### Prerequisites
- A [Render.com](https://render.com/) account
- Your project code pushed to a GitHub repository

### Steps

1. **Create a PostgreSQL Database**

   - Go to the Render dashboard and click on "New" -> "PostgreSQL"
   - Give your database a name (e.g., `student-grading-db`)
   - Choose the free plan or a paid plan based on your needs
   - Make note of the connection details (especially the external connection string)

2. **Deploy the Web Service**

   - Click on "New" -> "Web Service"
   - Connect your GitHub repository
   - Configure the service:
     - Name: `student-grading-system`
     - Environment: `Node`
     - Build Command: `npm install && npm run build`
     - Start Command: `npm start`
   
   - Add the following environment variables:
     - `DATABASE_URL`: Your PostgreSQL connection string from step 1
     - `SESSION_SECRET`: A random string for session encryption
   
   - Click "Create Web Service"

3. **Initialize the Database**

   Once deployed, you'll need to initialize your database schema:
   
   - Go to your web service dashboard
   - Click on "Shell"
   - Run: `npm run db:push`

Your application should now be deployed and accessible via the URL provided by Render!

## Option 2: Deploy on Vercel or Netlify + Separate Backend

If you prefer to separate frontend and backend:

1. **Deploy Backend on Railway or Heroku**

   - Create a new project
   - Connect your GitHub repository
   - Set environment variables similar to above
   - Deploy the backend

2. **Deploy Frontend on Vercel or Netlify**

   - Connect your GitHub repository
   - Configure the build settings:
     - Build command: `cd client && npm run build`
     - Output directory: `client/dist`
   - Set environment variables to point to your backend URL
   - Deploy the frontend

## Option 3: Self-Hosting on a VPS (Digital Ocean, AWS, etc.)

For more control, you can deploy on your own server:

1. **Provision a Server**
   - Set up a Ubuntu 22.04 server
   - Install Node.js, PostgreSQL, and Nginx

2. **Clone and Setup Your Repository**
   ```bash
   git clone https://github.com/yourusername/student-grading-system.git
   cd student-grading-system
   npm install
   npm run build
   ```

3. **Setup Environment Variables**
   Create a `.env` file with your production settings

4. **Setup Process Manager (PM2)**
   ```bash
   npm install -g pm2
   pm2 start npm --name "student-grading" -- start
   pm2 save
   pm2 startup
   ```

5. **Configure Nginx as a Reverse Proxy**
   ```nginx
   server {
       listen 80;
       server_name your-domain.com;

       location / {
           proxy_pass http://localhost:5000;
           proxy_http_version 1.1;
           proxy_set_header Upgrade $http_upgrade;
           proxy_set_header Connection 'upgrade';
           proxy_set_header Host $host;
           proxy_cache_bypass $http_upgrade;
       }
   }
   ```

6. **Setup SSL with Let's Encrypt**
   ```bash
   sudo apt install certbot python3-certbot-nginx
   sudo certbot --nginx -d your-domain.com
   ```

## Important Production Considerations

1. **Database Backups**
   Set up regular database backups to prevent data loss

2. **Monitoring**
   Use a monitoring service like UptimeRobot or Datadog

3. **Security**
   - Keep your dependencies updated
   - Use HTTPS
   - Implement rate limiting for API endpoints

4. **Scaling**
   If your application grows, consider:
   - Using a load balancer
   - Implementing caching strategies
   - Optimizing database queries

## Migrating Data from Development to Production

To migrate your data from the Replit environment to your production database:

1. Export your Replit database using `pg_dump`:
   ```bash
   pg_dump -U $PGUSER -h $PGHOST -p $PGPORT $PGDATABASE > database_backup.sql
   ```

2. Import the data to your production database:
   ```bash
   psql -U yourusername -h your-production-host -d your-production-db < database_backup.sql
   ```

## Troubleshooting

If you encounter issues during deployment:

1. Check application logs
2. Verify database connection
3. Ensure environment variables are correctly set
4. Check for network/firewall issues if using a VPS