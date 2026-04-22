const Task = require('../models/Task');

// GET /tasks
exports.getTasks = async (req, res, next) => {
  try {
    const { page = 1, limit = 10, status, priority, sortBy = 'createdAt', order = 'desc', search } = req.query;

    const filter = { owner: req.user._id };
    if (status) filter.status = status;
    if (priority) filter.priority = priority;
    if (search) filter.title = { $regex: search, $options: 'i' };

    const sortOrder = order === 'asc' ? 1 : -1;
    const skip = (page - 1) * limit;

    const [tasks, total] = await Promise.all([
      Task.find(filter).sort({ [sortBy]: sortOrder }).skip(skip).limit(Number(limit)),
      Task.countDocuments(filter),
    ]);

    res.json({
      success: true,
      data: {
        tasks,
        pagination: {
          total,
          page: Number(page),
          limit: Number(limit),
          totalPages: Math.ceil(total / limit),
        },
      },
    });
  } catch (err) {
    next(err);
  }
};

// GET /tasks/:id
exports.getTaskById = async (req, res, next) => {
  try {
    const task = await Task.findOne({ _id: req.params.id, owner: req.user._id });
    if (!task) return res.status(404).json({ success: false, message: 'Task not found' });
    res.json({ success: true, data: { task } });
  } catch (err) {
    next(err);
  }
};

// POST /tasks
exports.createTask = async (req, res, next) => {
  try {
    const task = await Task.create({ ...req.body, owner: req.user._id });
    res.status(201).json({ success: true, message: 'Task created', data: { task } });
  } catch (err) {
    next(err);
  }
};

// PUT /tasks/:id
exports.updateTask = async (req, res, next) => {
  try {
    const task = await Task.findOneAndUpdate(
      { _id: req.params.id, owner: req.user._id },
      req.body,
      { new: true, runValidators: true }
    );
    if (!task) return res.status(404).json({ success: false, message: 'Task not found' });
    res.json({ success: true, message: 'Task updated', data: { task } });
  } catch (err) {
    next(err);
  }
};

// DELETE /tasks/:id
exports.deleteTask = async (req, res, next) => {
  try {
    const task = await Task.findOneAndDelete({ _id: req.params.id, owner: req.user._id });
    if (!task) return res.status(404).json({ success: false, message: 'Task not found' });
    res.json({ success: true, message: 'Task deleted' });
  } catch (err) {
    next(err);
  }
};

// GET /tasks/stats
exports.getStats = async (req, res, next) => {
  try {
    const stats = await Task.aggregate([
      { $match: { owner: req.user._id } },
      { $group: { _id: '$status', count: { $sum: 1 } } },
    ]);
    const priorityStats = await Task.aggregate([
      { $match: { owner: req.user._id } },
      { $group: { _id: '$priority', count: { $sum: 1 } } },
    ]);
    res.json({ success: true, data: { statusStats: stats, priorityStats } });
  } catch (err) {
    next(err);
  }
};
