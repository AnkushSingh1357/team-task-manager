const prisma = require('../config/prisma');

// GET /api/projects — list projects the user belongs to
const getProjects = async (req, res, next) => {
  try {
    const projects = await prisma.project.findMany({
      where: {
        members: { some: { userId: req.user.id } },
      },
      include: {
        creator: { select: { id: true, name: true, email: true } },
        members: {
          include: { user: { select: { id: true, name: true, email: true, avatar: true } } },
        },
        _count: { select: { tasks: true } },
      },
      orderBy: { createdAt: 'desc' },
    });
    res.json({ projects });
  } catch (err) {
    next(err);
  }
};

// POST /api/projects
const createProject = async (req, res, next) => {
  try {
    const { name, description, color } = req.body;

    const project = await prisma.project.create({
      data: {
        name,
        description,
        color: color || '#6366f1',
        createdBy: req.user.id,
        members: {
          create: { userId: req.user.id, role: 'ADMIN' },
        },
      },
      include: {
        creator: { select: { id: true, name: true, email: true } },
        members: {
          include: { user: { select: { id: true, name: true, email: true, avatar: true } } },
        },
        _count: { select: { tasks: true } },
      },
    });
    res.status(201).json({ project });
  } catch (err) {
    next(err);
  }
};

// GET /api/projects/:projectId
const getProject = async (req, res, next) => {
  try {
    const project = await prisma.project.findUnique({
      where: { id: req.params.projectId },
      include: {
        creator: { select: { id: true, name: true, email: true } },
        members: {
          include: { user: { select: { id: true, name: true, email: true, avatar: true } } },
        },
        tasks: {
          include: {
            assignee: { select: { id: true, name: true, email: true, avatar: true } },
            creator: { select: { id: true, name: true } },
          },
          orderBy: { createdAt: 'desc' },
        },
      },
    });

    if (!project) return res.status(404).json({ message: 'Project not found' });
    res.json({ project });
  } catch (err) {
    next(err);
  }
};

// PATCH /api/projects/:projectId
const updateProject = async (req, res, next) => {
  try {
    const { name, description, color } = req.body;
    const project = await prisma.project.update({
      where: { id: req.params.projectId },
      data: { name, description, color },
      include: {
        creator: { select: { id: true, name: true, email: true } },
        members: {
          include: { user: { select: { id: true, name: true, email: true, avatar: true } } },
        },
      },
    });
    res.json({ project });
  } catch (err) {
    next(err);
  }
};

// DELETE /api/projects/:projectId
const deleteProject = async (req, res, next) => {
  try {
    await prisma.project.delete({ where: { id: req.params.projectId } });
    res.json({ message: 'Project deleted successfully' });
  } catch (err) {
    next(err);
  }
};

// POST /api/projects/:projectId/members — add member by email
const addMember = async (req, res, next) => {
  try {
    const { email, role } = req.body;
    const { projectId } = req.params;

    const userToAdd = await prisma.user.findUnique({ where: { email } });
    if (!userToAdd) return res.status(404).json({ message: 'User with that email not found' });

    const existing = await prisma.projectMember.findUnique({
      where: { projectId_userId: { projectId, userId: userToAdd.id } },
    });
    if (existing) return res.status(409).json({ message: 'User is already a member' });

    const member = await prisma.projectMember.create({
      data: { projectId, userId: userToAdd.id, role: role || 'MEMBER' },
      include: { user: { select: { id: true, name: true, email: true, avatar: true } } },
    });
    res.status(201).json({ member });
  } catch (err) {
    next(err);
  }
};

// DELETE /api/projects/:projectId/members/:userId
const removeMember = async (req, res, next) => {
  try {
    const { projectId, userId } = req.params;

    // Prevent removing the last admin
    const project = await prisma.project.findUnique({ where: { id: projectId } });
    if (project.createdBy === userId) {
      return res.status(400).json({ message: 'Cannot remove the project creator' });
    }

    await prisma.projectMember.delete({
      where: { projectId_userId: { projectId, userId } },
    });
    res.json({ message: 'Member removed' });
  } catch (err) {
    next(err);
  }
};

// PATCH /api/projects/:projectId/members/:userId/role
const updateMemberRole = async (req, res, next) => {
  try {
    const { projectId, userId } = req.params;
    const { role } = req.body;

    const member = await prisma.projectMember.update({
      where: { projectId_userId: { projectId, userId } },
      data: { role },
      include: { user: { select: { id: true, name: true, email: true } } },
    });
    res.json({ member });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  getProjects,
  createProject,
  getProject,
  updateProject,
  deleteProject,
  addMember,
  removeMember,
  updateMemberRole,
};
