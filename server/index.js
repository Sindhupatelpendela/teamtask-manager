import express from 'express';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';

import sequelize from './config/db.js';
import apiRouter from './routes/api.js';
import { User, Project, ProjectMember, Task } from './models/index.js';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Mount API routes
app.use('/api', apiRouter);

// Database Initialization and Seeding Function
const initializeDatabase = async () => {
  try {
    // Sync models
    await sequelize.sync({ force: false }); // Set force: false to persist data
    console.log('Database synchronized successfully.');

    // Seed database if empty
    const userCount = await User.count();
    if (userCount === 0) {
      console.log('Database is empty. Seeding initial demo data...');

      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash('password123', salt);

      // Create Admin
      const admin = await User.create({
        name: 'Alex Admin',
        email: 'admin@teamtask.com',
        password: hashedPassword,
        role: 'Admin'
      });

      // Create Member
      const member = await User.create({
        name: 'Jordan Member',
        email: 'member@teamtask.com',
        password: hashedPassword,
        role: 'Member'
      });

      // Create Another Member
      const teamUser = await User.create({
        name: 'Taylor Developer',
        email: 'taylor@teamtask.com',
        password: hashedPassword,
        role: 'Member'
      });

      console.log('Demo Users seeded (Password: password123):');
      console.log(' - admin@teamtask.com (Admin)');
      console.log(' - member@teamtask.com (Member)');
      console.log(' - taylor@teamtask.com (Member)');

      // Create default project
      const project = await Project.create({
        name: 'Acme SaaS Dashboard',
        description: 'Redesigning the primary Acme SaaS dashboard application using modern design principles, dark glassmorphism styling, and robust full-stack workflows.'
      });

      // Add members to project
      await ProjectMember.create({
        projectId: project.id,
        userId: admin.id,
        role: 'Project Admin'
      });

      await ProjectMember.create({
        projectId: project.id,
        userId: member.id,
        role: 'Project Member'
      });

      await ProjectMember.create({
        projectId: project.id,
        userId: teamUser.id,
        role: 'Project Member'
      });

      // Seed default tasks
      await Task.create({
        projectId: project.id,
        title: 'Design Database Schemas',
        description: 'Design robust tables for Users, Projects, Tasks, and Memberships including foreign key relationships and triggers.',
        status: 'Completed',
        priority: 'High',
        dueDate: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 3 days ago
        assignedToId: admin.id
      });

      await Task.create({
        projectId: project.id,
        title: 'Implement JWT & Authentication Flow',
        description: 'Secure passwords using bcryptjs and implement clean authorization middleware checks.',
        status: 'In Progress',
        priority: 'Medium',
        dueDate: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // tomorrow
        assignedToId: member.id
      });

      await Task.create({
        projectId: project.id,
        title: 'Build Premium Responsive UI Dashboard',
        description: 'Establish a custom CSS design system using dark glassmorphism, responsive sidebar widgets, and radial SVG progress charts.',
        status: 'Todo',
        priority: 'High',
        dueDate: new Date(Date.now() + 4 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 4 days from now
        assignedToId: member.id
      });

      await Task.create({
        projectId: project.id,
        title: 'Configure Railway CI/CD & Database',
        description: 'Deploy full-stack monorepo service into Railway using unified builds and dynamic connection variables.',
        status: 'Todo',
        priority: 'Low',
        dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 7 days from now
        assignedToId: teamUser.id
      });

      console.log('Demo Project & Tasks seeded successfully.');
    }
  } catch (error) {
    console.error('Database Sync/Seeding Failed:', error);
  }
};

// Serve built React files in production
const clientBuildPath = path.join(__dirname, '..', 'client', 'dist');
app.use(express.static(clientBuildPath));

// For client-side routing, route non-API requests to the React index.html
app.get('*', (req, res, next) => {
  if (req.path.startsWith('/api')) {
    return next();
  }
  res.sendFile(path.join(clientBuildPath, 'index.html'));
});

// Start Server
app.listen(PORT, async () => {
  console.log(`Server running in ${process.env.NODE_ENV || 'development'} mode on port ${PORT}`);
  await initializeDatabase();
});
