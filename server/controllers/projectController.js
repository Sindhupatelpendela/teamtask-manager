import { Project, ProjectMember, User, Task } from '../models/index.js';

export const createProject = async (req, res) => {
  try {
    const { name, description } = req.body;

    if (!name) {
      return res.status(400).json({ error: 'Project name is required.' });
    }

    const newProject = await Project.create({ name, description });

    // The creator becomes the 'Project Admin'
    await ProjectMember.create({
      projectId: newProject.id,
      userId: req.user.id,
      role: 'Project Admin'
    });

    return res.status(201).json({
      message: 'Project created successfully!',
      project: newProject
    });
  } catch (error) {
    console.error('Create Project Error:', error);
    return res.status(500).json({ error: 'Failed to create project. Internal server error.' });
  }
};

export const getProjects = async (req, res) => {
  try {
    let projects;

    if (req.user.role === 'Admin') {
      // Global Admin can see all projects in the system
      projects = await Project.findAll({
        include: [
          {
            model: User,
            attributes: ['id', 'name', 'email'],
            through: { attributes: ['role'] }
          }
        ]
      });
    } else {
      // Normal user can only see projects they are members of
      projects = await Project.findAll({
        include: [
          {
            model: User,
            attributes: ['id', 'name', 'email'],
            through: { attributes: ['role'] },
            where: { id: req.user.id }
          }
        ]
      });

      // Refetch full user lists for those projects so the UI displays all members
      const projectIds = projects.map(p => p.id);
      projects = await Project.findAll({
        where: { id: projectIds },
        include: [
          {
            model: User,
            attributes: ['id', 'name', 'email'],
            through: { attributes: ['role'] }
          }
        ]
      });
    }

    return res.status(200).json({ projects });
  } catch (error) {
    console.error('Get Projects Error:', error);
    return res.status(500).json({ error: 'Failed to retrieve projects. Internal server error.' });
  }
};

export const getProjectDetails = async (req, res) => {
  try {
    const { projectId } = req.params;

    const project = await Project.findByPk(projectId, {
      include: [
        {
          model: User,
          attributes: ['id', 'name', 'email'],
          through: { attributes: ['role'] }
        },
        {
          model: Task,
          include: [
            { model: User, as: 'assignee', attributes: ['id', 'name', 'email'] }
          ]
        }
      ]
    });

    if (!project) {
      return res.status(404).json({ error: 'Project not found.' });
    }

    // Identify user's role in this project
    let userProjectRole = null;
    if (req.user.role === 'Admin') {
      userProjectRole = 'Project Admin'; // System admins act as project admins
    } else {
      const membership = await ProjectMember.findOne({
        where: { projectId, userId: req.user.id }
      });
      userProjectRole = membership ? membership.role : null;
    }

    return res.status(200).json({ project, userProjectRole });
  } catch (error) {
    console.error('Get Project Details Error:', error);
    return res.status(500).json({ error: 'Failed to retrieve project details. Internal server error.' });
  }
};

export const addProjectMember = async (req, res) => {
  try {
    const { projectId } = req.params;
    const { email, role } = req.body;

    if (!email) {
      return res.status(400).json({ error: 'User email is required.' });
    }

    const targetUser = await User.findOne({ where: { email } });
    if (!targetUser) {
      return res.status(404).json({ error: 'User not found with this email.' });
    }

    // Check if user is already a member
    const existingMembership = await ProjectMember.findOne({
      where: { projectId, userId: targetUser.id }
        });

    if (existingMembership) {
      return res.status(400).json({ error: 'User is already a member of this project.' });
    }

    const memberRole = role === 'Project Admin' ? 'Project Admin' : 'Project Member';

    const newMember = await ProjectMember.create({
      projectId,
      userId: targetUser.id,
      role: memberRole
    });

    return res.status(201).json({
      message: 'Member added to project successfully!',
      member: {
        id: targetUser.id,
        name: targetUser.name,
        email: targetUser.email,
        role: memberRole
      }
    });
  } catch (error) {
    console.error('Add Project Member Error:', error);
    return res.status(500).json({ error: 'Failed to add project member. Internal server error.' });
  }
};

export const updateProjectMemberRole = async (req, res) => {
  try {
    const { projectId } = req.params;
    const { userId, role } = req.body;

    if (!userId || !role) {
      return res.status(400).json({ error: 'User ID and Role are required.' });
    }

    const membership = await ProjectMember.findOne({
      where: { projectId, userId }
    });

    if (!membership) {
      return res.status(404).json({ error: 'Member relationship not found in this project.' });
    }

    membership.role = role === 'Project Admin' ? 'Project Admin' : 'Project Member';
    await membership.save();

    return res.status(200).json({
      message: 'Member role updated successfully!',
      membership
    });
  } catch (error) {
    console.error('Update Project Member Role Error:', error);
    return res.status(500).json({ error: 'Failed to update member role. Internal server error.' });
  }
};

export const removeProjectMember = async (req, res) => {
  try {
    const { projectId } = req.params;
    const { userId } = req.body;

    if (!userId) {
      return res.status(400).json({ error: 'User ID is required.' });
    }

    const membership = await ProjectMember.findOne({
      where: { projectId, userId }
    });

    if (!membership) {
      return res.status(404).json({ error: 'Member relationship not found in this project.' });
    }

    // Check if they are trying to remove themselves, but are the last Project Admin
    if (userId === req.user.id) {
      const adminCount = await ProjectMember.count({
        where: { projectId, role: 'Project Admin' }
      });
      if (adminCount <= 1) {
        return res.status(400).json({ error: 'Cannot leave project. You are the sole Project Admin. Promote another member first.' });
      }
    }

    await membership.destroy();

    // Also remove task assignments for this user in this project
    await Task.update(
      { assignedToId: null },
      { where: { projectId, assignedToId: userId } }
    );

    return res.status(200).json({
      message: 'Member removed from project successfully!'
    });
  } catch (error) {
    console.error('Remove Project Member Error:', error);
    return res.status(500).json({ error: 'Failed to remove member. Internal server error.' });
  }
};

export const deleteProject = async (req, res) => {
  try {
    const { projectId } = req.params;

    const project = await Project.findByPk(projectId);
    if (!project) {
      return res.status(404).json({ error: 'Project not found.' });
    }

    await project.destroy(); // Cascade triggers automatic deletion of members and tasks due to Sequelize relationships

    return res.status(200).json({
      message: 'Project and all associated tasks/members deleted successfully!'
    });
  } catch (error) {
    console.error('Delete Project Error:', error);
    return res.status(500).json({ error: 'Failed to delete project. Internal server error.' });
  }
};
