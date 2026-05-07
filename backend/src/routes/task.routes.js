const express = require('express');
const { body } = require('express-validator');
const {
  getProjectTasks, createTask, getTask,
  updateTask, deleteTask, getMyTasks, getDashboardStats,
} = require('../controllers/task.controller');
const { authenticate, requireProjectAccess } = require('../middleware/auth.middleware');
const { validate } = require('../middleware/validate.middleware');
const prisma = require('../config/prisma');

const router = express.Router();
router.use(authenticate);

// Dashboard & personal views
router.get('/dashboard', getDashboardStats);
router.get('/my', getMyTasks);

// Project-scoped tasks
router.get('/project/:projectId', requireProjectAccess(), getProjectTasks);

router.post('/project/:projectId', [
  requireProjectAccess('ADMIN'),
  body('title').trim().notEmpty().withMessage('Task title is required'),
  body('status').optional().isIn(['TODO', 'IN_PROGRESS', 'DONE']),
  body('priority').optional().isIn(['LOW', 'MEDIUM', 'HIGH']),
  body('dueDate').optional().isISO8601().withMessage('Invalid date format'),
  validate,
], createTask);

// Single task operations — inject membership on the fly
router.get('/:taskId', async (req, res, next) => {
  try {
    const task = await prisma.task.findUnique({ where: { id: req.params.taskId } });
    if (!task) return res.status(404).json({ message: 'Task not found' });
    req.params.projectId = task.projectId;
    requireProjectAccess()(req, res, () => getTask(req, res, next));
  } catch (err) { next(err); }
});

router.patch('/:taskId', async (req, res, next) => {
  try {
    const task = await prisma.task.findUnique({ where: { id: req.params.taskId } });
    if (!task) return res.status(404).json({ message: 'Task not found' });
    req.params.projectId = task.projectId;
    requireProjectAccess()(req, res, () => updateTask(req, res, next));
  } catch (err) { next(err); }
});

router.delete('/:taskId', async (req, res, next) => {
  try {
    const task = await prisma.task.findUnique({ where: { id: req.params.taskId } });
    if (!task) return res.status(404).json({ message: 'Task not found' });
    req.params.projectId = task.projectId;
    requireProjectAccess('ADMIN')(req, res, () => deleteTask(req, res, next));
  } catch (err) { next(err); }
});

module.exports = router;
