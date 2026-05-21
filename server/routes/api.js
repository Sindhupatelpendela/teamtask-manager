import express from 'express';
import { signup, login, getMe, getAllUsers } from '../controllers/authController.js';
import {
  createProject,
  getProjects,
  getProjectDetails,
  addProjectMember,
  updateProjectMemberRole,
  removeProjectMember,
  deleteProject
} from '../controllers/projectController.js';
import {
  createTask,
  updateTask,
  updateTaskStatus,
  deleteTask
} from '../controllers/taskController.js';
import { getDashboardSummary } from '../controllers/dashboardController.js';
import { authenticate, requireProjectRole } from '../middleware/auth.js';

const router = express.Router();

// --- Authentication & Users ---
router.post('/auth/signup', signup);
router.post('/auth/login', login);
router.get('/auth/me', authenticate, getMe);
router.get('/users', authenticate, getAllUsers);

// --- Dashboard ---
router.get('/dashboard/summary', authenticate, getDashboardSummary);

// --- Projects ---
router.post('/projects', authenticate, createProject);
router.get('/projects', authenticate, getProjects);
router.get('/projects/:projectId', authenticate, requireProjectRole(['Project Admin', 'Project Member']), getProjectDetails);
router.delete('/projects/:projectId', authenticate, requireProjectRole(['Project Admin']), deleteProject);

// --- Project Members ---
router.post('/projects/:projectId/members', authenticate, requireProjectRole(['Project Admin']), addProjectMember);
router.put('/projects/:projectId/members', authenticate, requireProjectRole(['Project Admin']), updateProjectMemberRole);
router.delete('/projects/:projectId/members', authenticate, requireProjectRole(['Project Admin']), removeProjectMember);

// --- Tasks ---
router.post('/tasks', authenticate, requireProjectRole(['Project Admin', 'Project Member']), createTask);
router.put('/tasks/:taskId', authenticate, updateTask);
router.patch('/tasks/:taskId/status', authenticate, updateTaskStatus);
router.delete('/tasks/:taskId', authenticate, deleteTask);

export default router;
