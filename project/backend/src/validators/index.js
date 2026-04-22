const { body, param, query } = require('express-validator');

exports.registerValidator = [
  body('name').trim().notEmpty().withMessage('Name is required').isLength({ min: 2, max: 50 }),
  body('email').trim().isEmail().withMessage('Valid email is required').normalizeEmail(),
  body('password')
    .isLength({ min: 8 })
    .withMessage('Password must be at least 8 characters')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
    .withMessage('Password must contain uppercase, lowercase, and a number'),
];

exports.loginValidator = [
  body('email').trim().isEmail().withMessage('Valid email is required').normalizeEmail(),
  body('password').notEmpty().withMessage('Password is required'),
];

exports.taskValidator = [
  body('title').trim().notEmpty().withMessage('Title is required').isLength({ min: 3, max: 100 }),
  body('description').optional().trim().isLength({ max: 500 }),
  body('status').optional().isIn(['todo', 'in-progress', 'done']).withMessage('Invalid status'),
  body('priority').optional().isIn(['low', 'medium', 'high']).withMessage('Invalid priority'),
  body('dueDate').optional().isISO8601().withMessage('Invalid date format').toDate(),
  body('tags').optional().isArray({ max: 10 }).withMessage('Tags must be an array (max 10)'),
];

exports.objectIdValidator = [
  param('id').isMongoId().withMessage('Invalid ID format'),
];

exports.paginationValidator = [
  query('page').optional().isInt({ min: 1 }).toInt(),
  query('limit').optional().isInt({ min: 1, max: 100 }).toInt(),
  query('status').optional().isIn(['todo', 'in-progress', 'done']),
  query('priority').optional().isIn(['low', 'medium', 'high']),
  query('sortBy').optional().isIn(['createdAt', 'dueDate', 'priority', 'title']),
  query('order').optional().isIn(['asc', 'desc']),
];
