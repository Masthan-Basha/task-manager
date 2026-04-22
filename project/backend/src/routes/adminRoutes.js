const express = require('express');
const router = express.Router();
const { getAllUsers, updateUserRole, toggleUserStatus, getDashboardStats } = require('../controllers/adminController');
const { protect, authorize } = require('../middleware/auth');
const { objectIdValidator } = require('../validators');
const validate = require('../middleware/validate');

router.use(protect, authorize('admin'));

/**
 * @swagger
 * /admin/stats:
 *   get:
 *     summary: Get admin dashboard stats
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200: { description: Dashboard stats }
 *       403: { description: Admin only }
 */
router.get('/stats', getDashboardStats);

/**
 * @swagger
 * /admin/users:
 *   get:
 *     summary: Get all users (admin only)
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200: { description: All users }
 */
router.get('/users', getAllUsers);

/**
 * @swagger
 * /admin/users/{id}/role:
 *   patch:
 *     summary: Update user role
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               role: { type: string, enum: [user, admin] }
 *     responses:
 *       200: { description: Role updated }
 */
router.patch('/users/:id/role', objectIdValidator, validate, updateUserRole);

/**
 * @swagger
 * /admin/users/{id}/status:
 *   patch:
 *     summary: Toggle user active status
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200: { description: Status toggled }
 */
router.patch('/users/:id/status', objectIdValidator, validate, toggleUserStatus);

module.exports = router;
