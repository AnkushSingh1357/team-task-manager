const prisma = require('../config/prisma');

// GET /api/projects/:projectId/tasks
const getProjectTasks = async (req, res, next) => {
  try {
    const { status, priority, assignedTo } = req.query;

    const where = { projectId: req.params.projectId };
    if (status) where.status = status;
    if (priority) where.priority = priority;
    if (assignedTo) where.assignedTo = assignedTo;

    const tasks = await prisma.task.findMany({
      where,
      include: {
        assignee: { select: { id: true, name: true, email: true, avatar: true } },
        creator: { select: { id: true, name: true } },
      },
      orderBy: { createdAt: 'desc' },
    });
    res.json({ tasks });
  } catch (err) {
    next(err);
  }
};

// POST /api/projects/:projectId/tasks
const createTask = async (req, res, next) => {
  try {
    const { title, description, status, priority, dueDate, assignedTo } = req.body;
    const { projectId } = req.params;

    // If assigning to someone, check they're a project member
    if (assignedTo) {
      const isMember = await prisma.projectMember.findUnique({
        where: { projectId_userId: { projectId, userId: assignedTo } },
      });
      if (!isMember) {
        return res.status(400).json({ message: 'Assignee must be a project member' });
      }
    }

    const task = await prisma.task.create({
      data: {
        title,
        description,
        status: status || 'TODO',
        priority: priority || 'MEDIUM',
        dueDate: dueDate ? new Date(dueDate) : null,
        projectId,
        assignedTo: assignedTo || null,
        createdBy: req.user.id,
      },
      include: {
        assignee: { select: { id: true, name: true, email: true, avatar: true } },
        creator: { select: { id: true, name: true } },
      },
    });
    res.status(201).json({ task });
  } catch (err) {
    next(err);
  }
};

// GET /api/tasks/:taskId
const getTask = async (req, res, next) => {
  try {
    const task = await prisma.task.findUnique({
      where: { id: req.params.taskId },
      include: {
        assignee: { select: { id: true, name: true, email: true, avatar: true } },
        creator: { select: { id: true, name: true } },
        project: { select: { id: true, name: true } },
      },
    });
    if (!task) return res.status(404).json({ message: 'Task not found' });
    res.json({ task });
  } catch (err) {
    next(err);
  }
};

// PATCH /api/tasks/:taskId
const updateTask = async (req, res, next) => {
  try {
    const { title, description, status, priority, dueDate, assignedTo } = req.body;
    const task = await prisma.task.findUnique({ where: { id: req.params.taskId } });
    if (!task) return res.status(404).json({ message: 'Task not found' });

    // Members can only update status
    if (req.membership?.role === 'MEMBER') {
      const allowedFields = ['status'];
      const requestedFields = Object.keys(req.body);
      const hasDisallowedFields = requestedFields.some(f => !allowedFields.includes(f));
      if (hasDisallowedFields) {
        return res.status(403).json({ message: 'Members can only update task status' });
      }
    }

    const updated = await prisma.task.update({
      where: { id: req.params.taskId },
      data: {
        ...(title !== undefined && { title }),
        ...(description !== undefined && { description }),
        ...(status !== undefined && { status }),
        ...(priority !== undefined && { priority }),
        ...(dueDate !== undefined && { dueDate: dueDate ? new Date(dueDate) : null }),
        ...(assignedTo !== undefined && { assignedTo }),
      },
      include: {
        assignee: { select: { id: true, name: true, email: true, avatar: true } },
        creator: { select: { id: true, name: true } },
      },
    });
    res.json({ task: updated });
  } catch (err) {
    next(err);
  }
};

// DELETE /api/tasks/:taskId
const deleteTask = async (req, res, next) => {
  try {
    await prisma.task.delete({ where: { id: req.params.taskId } });
    res.json({ message: 'Task deleted' });
  } catch (err) {
    next(err);
  }
};

// GET /api/tasks/my — tasks assigned to me across all projects
const getMyTasks = async (req, res, next) => {
  try {
    const tasks = await prisma.task.findMany({
      where: { assignedTo: req.user.id },
      include: {
        project: { select: { id: true, name: true, color: true } },
        creator: { select: { id: true, name: true } },
      },
      orderBy: { dueDate: 'asc' },
    });
    res.json({ tasks });
  } catch (err) {
    next(err);
  }
};

// GET /api/tasks/dashboard — dashboard stats for current user
const getDashboardStats = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const now = new Date();

    const [myTasks, projectCount, overdueTasks, recentTasks] = await Promise.all([
      prisma.task.groupBy({
        by: ['status'],
        where: { assignedTo: userId },
        _count: { status: true },
      }),
      prisma.projectMember.count({ where: { userId } }),
      prisma.task.count({
        where: {
          assignedTo: userId,
          dueDate: { lt: now },
          status: { not: 'DONE' },
        },
      }),
      prisma.task.findMany({
        where: { assignedTo: userId },
        include: {
          project: { select: { id: true, name: true, color: true } },
        },
        orderBy: { updatedAt: 'desc' },
        take: 5,
      }),
    ]);

    const statusCounts = { TODO: 0, IN_PROGRESS: 0, DONE: 0 };
    myTasks.forEach(g => { statusCounts[g.status] = g._count.status; });

    res.json({
      stats: {
        totalTasks: Object.values(statusCounts).reduce((a, b) => a + b, 0),
        ...statusCounts,
        overdue: overdueTasks,
        projects: projectCount,
      },
      recentTasks,
    });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  getProjectTasks,
  createTask,
  getTask,
  updateTask,
  deleteTask,
  getMyTasks,
  getDashboardStats,
};
