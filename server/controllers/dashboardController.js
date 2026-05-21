import { Task, Project, ProjectMember, User } from '../models/index.js';
import { Op } from 'sequelize';

export const getDashboardSummary = async (req, res) => {
  try {
    const userId = req.user.id;
    const today = new Date().toISOString().split('T')[0];

    let projectCount = 0;
    let projects = [];

    if (req.user.role === 'Admin') {
      projectCount = await Project.count();
      projects = await Project.findAll({
        attributes: ['id', 'name'],
        limit: 5
      });
    } else {
      const memberships = await ProjectMember.findAll({
        where: { userId }
      });
      const projectIds = memberships.map(m => m.projectId);
      projectCount = projectIds.length;
      projects = await Project.findAll({
        where: { id: projectIds },
        attributes: ['id', 'name'],
        limit: 5
      });
    }

    // Task stats for tasks assigned to the current user
    const tasksAssigned = await Task.findAll({
      where: { assignedToId: userId },
      include: [{ model: Project, attributes: ['id', 'name'] }]
    });

    const totalTasks = tasksAssigned.length;
    const todoTasks = tasksAssigned.filter(t => t.status === 'Todo').length;
    const inProgressTasks = tasksAssigned.filter(t => t.status === 'In Progress').length;
    const completedTasks = tasksAssigned.filter(t => t.status === 'Completed').length;

    // Overdue tasks: Assigned tasks where status is not Completed and due date < today
    const overdueTasks = tasksAssigned.filter(t => 
      t.status !== 'Completed' && 
      t.dueDate && 
      t.dueDate < today
    );

    // Upcoming tasks: Assigned tasks that are not completed, sorted by due date
    const upcomingTasks = tasksAssigned
      .filter(t => t.status !== 'Completed' && t.dueDate && t.dueDate >= today)
      .sort((a, b) => new Date(a.dueDate) - new Date(b.dueDate))
      .slice(0, 5);

    // Distribution by priority
    const priorityStats = {
      Low: tasksAssigned.filter(t => t.priority === 'Low').length,
      Medium: tasksAssigned.filter(t => t.priority === 'Medium').length,
      High: tasksAssigned.filter(t => t.priority === 'High').length
    };

    return res.status(200).json({
      projectCount,
      recentProjects: projects,
      tasks: {
        total: totalTasks,
        todo: todoTasks,
        inProgress: inProgressTasks,
        completed: completedTasks,
        overdueCount: overdueTasks.length,
        overdueList: overdueTasks.slice(0, 5),
        upcomingList: upcomingTasks,
        priorityStats
      }
    });
  } catch (error) {
    console.error('Get Dashboard Summary Error:', error);
    return res.status(500).json({ error: 'Failed to retrieve dashboard summaries. Internal server error.' });
  }
};
