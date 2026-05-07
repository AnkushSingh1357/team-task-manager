const express = require('express');
const { body } = require('express-validator');
const {
  getProjects, createProject, getProject,
  updateProject, deleteProject,
  addMember, removeMember, updateMemberRole,
} = require('../controllers/project.controller');
const { authenticate, requireProjectAccess } = require('../middleware/auth.middleware');
const { validate } = require('../middleware/validate.middleware');

const router = express.Router();

router.use(authenticate);

router.get('/', getProjects);

router.post('/', [
  body('name').trim().notEmpty().withMessage('Project name is required'),
  body('color').optional().isHexColor().withMessage('Invalid color'),
  validate,
], createProject);

router.get('/:projectId', requireProjectAccess(), getProject);

router.patch('/:projectId', [
  requireProjectAccess('ADMIN'),
  body('name').optional().trim().notEmpty(),
  validate,
], updateProject);

router.delete('/:projectId', requireProjectAccess('ADMIN'), deleteProject);

// Member management
router.post('/:projectId/members', [
  requireProjectAccess('ADMIN'),
  body('email').isEmail().withMessage('Valid email required'),
  validate,
], addMember);

router.delete('/:projectId/members/:userId', requireProjectAccess('ADMIN'), removeMember);

router.patch('/:projectId/members/:userId/role', [
  requireProjectAccess('ADMIN'),
  body('role').isIn(['ADMIN', 'MEMBER']).withMessage('Role must be ADMIN or MEMBER'),
  validate,
], updateMemberRole);

module.exports = router;
