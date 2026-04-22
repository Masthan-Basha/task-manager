const User = require('../models/User');
const Task = require('../models/Task');

// GET /admin/users
exports.getAllUsers = async (req, res, next) => {
  try {
    const { page = 1, limit = 20 } = req.query;
    const skip = (page - 1) * limit;

    const [users, total] = await Promise.all([
      User.find().sort({ createdAt: -1 }).skip(skip).limit(Number(limit)),
      User.countDocuments(),
    ]);

    res.json({
      success: true,
      data: {
        users,
        pagination: { total, page: Number(page), limit: Number(limit), totalPages: Math.ceil(total / limit) },
      },
    });
  } catch (err) {
    next(err);
  }
};

// PATCH /admin/users/:id/role
exports.updateUserRole = async (req, res, next) => {
  try {
    const { role } = req.body;
    if (!['user', 'admin'].includes(role)) {
      return res.status(400).json({ success: false, message: 'Invalid role' });
    }
    if (req.params.id === req.user._id.toString()) {
      return res.status(400).json({ success: false, message: 'Cannot change your own role' });
    }

    const user = await User.findByIdAndUpdate(req.params.id, { role }, { new: true });
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });

    res.json({ success: true, message: `Role updated to ${role}`, data: { user } });
  } catch (err) {
    next(err);
  }
};

// PATCH /admin/users/:id/status
exports.toggleUserStatus = async (req, res, next) => {
  try {
    if (req.params.id === req.user._id.toString()) {
      return res.status(400).json({ success: false, message: 'Cannot deactivate yourself' });
    }
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });

    user.isActive = !user.isActive;
    await user.save({ validateBeforeSave: false });

    res.json({ success: true, message: `User ${user.isActive ? 'activated' : 'deactivated'}`, data: { user } });
  } catch (err) {
    next(err);
  }
};

// GET /admin/stats
exports.getDashboardStats = async (req, res, next) => {
  try {
    const [totalUsers, totalTasks, tasksByStatus, recentUsers] = await Promise.all([
      User.countDocuments(),
      Task.countDocuments(),
      Task.aggregate([{ $group: { _id: '$status', count: { $sum: 1 } } }]),
      User.find().sort({ createdAt: -1 }).limit(5).select('name email role createdAt'),
    ]);

    res.json({
      success: true,
      data: { totalUsers, totalTasks, tasksByStatus, recentUsers },
    });
  } catch (err) {
    next(err);
  }
};
