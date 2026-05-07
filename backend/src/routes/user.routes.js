const express = require('express');
const { body } = require('express-validator');
const { searchUsers, updateProfile, changePassword } = require('../controllers/user.controller');
const { authenticate } = require('../middleware/auth.middleware');
const { validate } = require('../middleware/validate.middleware');

const router = express.Router();
router.use(authenticate);

router.get('/search', searchUsers);

router.patch('/profile', [
  body('name').optional().trim().notEmpty(),
  validate,
], updateProfile);

router.patch('/password', [
  body('currentPassword').notEmpty().withMessage('Current password required'),
  body('newPassword').isLength({ min: 6 }).withMessage('New password must be at least 6 chars'),
  validate,
], changePassword);

module.exports = router;
