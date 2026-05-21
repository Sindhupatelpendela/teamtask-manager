import { Task, ProjectMember, User, Project } from '../models/index.js';

export const createTask = async (req, res) => {
  try {
    const { projectId, title, description, assignedToId, dueDate, priority, status } = req.body;

    if (!projectId || !title) {
      return res.status(400).json({ error: 'Project ID and Title are required.' });
    }

    // Verify target project exists
    const project = await Project.findByPk(projectId);
    if (!project) {
      return res.status(404).json({ error: 'Project not found.' });
    }

    // Verify assignee belongs to the project (if assigned)
    if (assignedToId) {
      const isMember = await ProjectMember.findOne({
        where: { projectId, userId: assignedToId }
      });
      if (!isMember) {
        return res.status(400).json({ error: 'Assigned user is not a member of this project.' });
      }
    }

    const newTask = await Task.create({
      projectId,
      title,
      description,
      assignedToId: assignedToId || null,
      dueDate: dueDate || null,
      priority: priority || 'Medium',
      status: status || 'Todo'
    });

    const taskWithAssignee = await Task.findByPk(newTask.id, {
      include: [{ model: User, as: 'assignee', attributes: ['id', 'name', 'email'] }]
    });

    return res.status(201).json({
      message: 'Task created successfully!',
      task: taskWithAssignee
    });
  } catch (error) {
    console.error('Create Task Error:', error);
    return res.status(500).json({ error: 'Failed to create task. Internal server error.' });
  }
};

export const updateTask = async (req, res) => {
  try {
    const { taskId } = req.params;
    const { title, description, assignedToId, dueDate, priority, status } = req.body;

    const task = await Task.findByPk(taskId);
    if (!task) {
      return res.status(404).json({ error: 'Task not found.' });
    }

    // Validate project membership roles for major updates
    let isProjectAdmin = false;
    if (req.user.role === 'Admin') {
      isProjectAdmin = true;
    } else {
      const membership = await ProjectMember.findOne({
        where: { projectId: task.projectId, userId: req.user.id }
      });
      if (!membership) {
        return res.status(403).json({ error: 'Access denied. You are not a member of this project.' });
      }
      isProjectAdmin = membership.role === 'Project Admin';
    }

    // If not admin, restrict what they can update (e.g. only status unless they are the assignee or project admin)
    if (!isProjectAdmin) {
      // Non-admins can update status and description, but not reassign or change titles/due dates
      if (title !== undefined && title !== task.title) {
        return res.status(403).json({ error: 'Only Project Admins can change task title.' });
      }
      if (assignedToId !== undefined && assignedToId !== task.assignedToId) {
        return res.status(403).json({ error: 'Only Project Admins can reassign tasks.' });
      }
      if (dueDate !== undefined && dueDate !== task.dueDate) {
        return res.status(403).json({ error: 'Only Project Admins can alter due dates.' });
      }
    }

    // If changing assignee, verify user belongs to project
    if (assignedToId !== undefined && assignedToId !== null && assignedToId !== task.assignedToId) {
      const isMember = await ProjectMember.findOne({
        where: { projectId: task.projectId, userId: assignedToId }
      });
      if (!isMember) {
        return res.status(400).json({ error: 'Selected assignee is not a member of this project.' });
      }
    }

    if (title !== undefined) task.title = title;
    if (description !== undefined) task.description = description;
    if (assignedToId !== undefined) task.assignedToId = assignedToId;
    if (dueDate !== undefined) task.dueDate = dueDate || null;
    if (priority !== undefined) task.priority = priority;
    if (status !== undefined) task.status = status;

    await task.save();

    const updatedTask = await Task.findByPk(task.id, {
      include: [{ model: User, as: 'assignee', attributes: ['id', 'name', 'email'] }]
    });

    return res.status(200).json({
      message: 'Task updated successfully!',
      task: updatedTask
    });
  } catch (error) {
    console.error('Update Task Error:', error);
    return res.status(500).json({ error: 'Failed to update task. Internal server error.' });
  }
};

export const updateTaskStatus = async (req, res) => {
  try {
    const { taskId } = req.params;
    const { status } = req.body;

    if (!status || !['Todo', 'In Progress', 'Completed'].includes(status)) {
      return res.status(400).json({ error: 'Invalid task status. Must be Todo, In Progress, or Completed.' });
    }

    const task = await Task.findByPk(taskId);
    if (!task) {
      return res.status(404).json({ error: 'Task not found.' });
    }

    // Ensure user belongs to project
    if (req.user.role !== 'Admin') {
      const membership = await ProjectMember.findOne({
        where: { projectId: task.projectId, userId: req.user.id }
      });
      if (!membership) {
        return res.status(403).json({ error: 'Access denied. You are not a member of this project.' });
      }
    }

    task.status = status;
    await task.save();

    const updatedTask = await Task.findByPk(task.id, {
      include: [{ model: User, as: 'assignee', attributes: ['id', 'name', 'email'] }]
    });

    return res.status(200).json({
      message: 'Status updated successfully!',
      task: updatedTask
    });
  } catch (error) {
    console.error('Update Task Status Error:', error);
    return res.status(500).json({ error: 'Failed to update status. Internal server error.' });
  }
};

export const deleteTask = async (req, res) => {
  try {
    const { taskId } = req.params;

    const task = await Task.findByPk(taskId);
    if (!task) {
      return res.status(404).json({ error: 'Task not found.' });
    }

    // Verify Project Admin or system Admin privileges
    if (req.user.role !== 'Admin') {
      const membership = await ProjectMember.findOne({
        where: { projectId: task.projectId, userId: req.user.id }
      });
      if (!membership || membership.role !== 'Project Admin') {
        return res.status(403).json({ error: 'Access denied. Only Project Admins can delete tasks.' });
      }
    }

    await task.destroy();

    return res.status(200).json({
      message: 'Task deleted successfully!'
    });
  } catch (error) {
    console.error('Delete Task Error:', error);
    return res.status(500).json({ error: 'Failed to delete task. Internal server error.' });
  }
};
