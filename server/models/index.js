import User from './User.js';
import Project from './Project.js';
import ProjectMember from './ProjectMember.js';
import Task from './Task.js';

// Many-to-Many: User <-> Project through ProjectMember
User.belongsToMany(Project, { through: ProjectMember, foreignKey: 'userId' });
Project.belongsToMany(User, { through: ProjectMember, foreignKey: 'projectId' });

// We also associate the ProjectMember model directly for easy queries
Project.hasMany(ProjectMember, { foreignKey: 'projectId', onDelete: 'CASCADE' });
ProjectMember.belongsTo(Project, { foreignKey: 'projectId' });

User.hasMany(ProjectMember, { foreignKey: 'userId', onDelete: 'CASCADE' });
ProjectMember.belongsTo(User, { foreignKey: 'userId' });

// One-to-Many: Project -> Task
Project.hasMany(Task, { foreignKey: 'projectId', onDelete: 'CASCADE' });
Task.belongsTo(Project, { foreignKey: 'projectId' });

// One-to-Many: User -> Task (Assigned To)
User.hasMany(Task, { foreignKey: 'assignedToId', as: 'assignedTasks' });
Task.belongsTo(User, { foreignKey: 'assignedToId', as: 'assignee' });

export {
  User,
  Project,
  ProjectMember,
  Task
};
