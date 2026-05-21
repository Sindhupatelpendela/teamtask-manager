import jwt from 'jsonwebtoken';
import { User, ProjectMember } from '../models/index.js';

const JWT_SECRET = process.env.JWT_SECRET || 'teamtask-super-secret-key-13579';

export const authenticate = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'Access denied. No token provided.' });
    }

    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, JWT_SECRET);

    const user = await User.findByPk(decoded.id);
    if (!user) {
      return res.status(401).json({ error: 'Invalid token. User not found.' });
    }

    req.user = user;
    next();
  } catch (error) {
    console.error('Authentication Error:', error);
    return res.status(401).json({ error: 'Invalid or expired token.' });
  }
};

export const requireAdmin = (req, res, next) => {
  if (!req.user || req.user.role !== 'Admin') {
    return res.status(403).json({ error: 'Access denied. Administrator privileges required.' });
  }
  next();
};

// Dynamic middleware to check if user has access to a project with a specific project role
export const requireProjectRole = (allowedRoles = ['Project Admin', 'Project Member']) => {
  return async (req, res, next) => {
    try {
      const { projectId } = req.params;
      const targetProjectId = projectId || req.body.projectId || req.query.projectId;

      if (!targetProjectId) {
        return res.status(400).json({ error: 'Project ID is required for validation.' });
      }

      // If user is a global Admin, allow full access to any project automatically
      if (req.user.role === 'Admin') {
        return next();
      }

      const member = await ProjectMember.findOne({
        where: {
          projectId: targetProjectId,
          userId: req.user.id
        }
      });

      if (!member) {
        return res.status(403).json({ error: 'Access denied. You are not a member of this project.' });
      }

      if (!allowedRoles.includes(member.role)) {
        return res.status(403).json({ error: `Access denied. Requires project role(s): ${allowedRoles.join(', ')}` });
      }

      // Attach member context for use in controllers if needed
      req.projectMember = member;
      next();
    } catch (error) {
      console.error('Project Role Verification Error:', error);
      return res.status(500).json({ error: 'Internal server error during authorization.' });
    }
  };
};
export { JWT_SECRET };
