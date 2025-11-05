import express from 'express';
import Task from '../models/Task.js';
import { protect, authorize } from '../middleware/auth.js';

const router = express.Router();

// @route   GET /api/tasks
// @desc    Get all tasks (filtered by role)
// @access  Private
router.get('/', protect, async (req, res) => {
  try {
    const { status, priority, assignedTo, departmentId } = req.query;
    
    let query = {};
    
    // Role-based filtering
    if (req.user.role === 'Employee') {
      // Employees only see tasks assigned to them
      const Employee = (await import('../models/Employee.js')).default;
      const employee = await Employee.findOne({ email: req.user.email });
      if (employee) {
        query.assignedTo = employee._id;
      } else {
        return res.json([]);
      }
    } else if (req.user.role === 'Manager') {
      // Managers see tasks in their departments
      if (departmentId) {
        query.departmentId = departmentId;
      }
    }
    // Admin and HR see all tasks
    
    // Apply filters
    if (status) query.status = status;
    if (priority) query.priority = priority;
    if (assignedTo) query.assignedTo = assignedTo;
    if (departmentId && req.user.role !== 'Manager') query.departmentId = departmentId;

    const tasks = await Task.find(query)
      .populate('assignedTo')
      .populate('assignedBy')
      .populate('departmentId')
      .sort({ createdAt: -1 });
    
    res.json(tasks);
  } catch (error) {
    console.error('Get tasks error:', error);
    res.status(500).json({ message: 'Server error fetching tasks' });
  }
});

// @route   GET /api/tasks/:id
// @desc    Get task by ID
// @access  Private
router.get('/:id', protect, async (req, res) => {
  try {
    const task = await Task.findById(req.params.id)
      .populate('assignedTo')
      .populate('assignedBy')
      .populate('departmentId');
    
    if (!task) {
      return res.status(404).json({ message: 'Task not found' });
    }

    res.json(task);
  } catch (error) {
    console.error('Get task error:', error);
    res.status(500).json({ message: 'Server error fetching task' });
  }
});

// @route   POST /api/tasks
// @desc    Create new task
// @access  Private (Admin, HR, Manager)
router.post('/', protect, authorize('Admin', 'HR', 'Manager'), async (req, res) => {
  try {
    const { title, description, priority, assignedTo, departmentId, dueDate } = req.body;

    const task = await Task.create({
      title,
      description,
      priority: priority || 'Medium',
      status: 'To Do',
      assignedTo,
      assignedBy: req.user._id,
      departmentId,
      dueDate
    });

    const populatedTask = await Task.findById(task._id)
      .populate('assignedTo')
      .populate('assignedBy')
      .populate('departmentId');

    res.status(201).json(populatedTask);
  } catch (error) {
    console.error('Create task error:', error);
    res.status(500).json({ message: 'Server error creating task' });
  }
});

// @route   PUT /api/tasks/:id
// @desc    Update task
// @access  Private
router.put('/:id', protect, async (req, res) => {
  try {
    const task = await Task.findById(req.params.id);

    if (!task) {
      return res.status(404).json({ message: 'Task not found' });
    }

    // Employees can only update status
    if (req.user.role === 'Employee') {
      if (req.body.status) {
        task.status = req.body.status;
      }
    } else {
      // Admin, HR, Manager can update all fields
      const { title, description, priority, status, assignedTo, departmentId, dueDate } = req.body;
      
      if (title) task.title = title;
      if (description) task.description = description;
      if (priority) task.priority = priority;
      if (status) task.status = status;
      if (assignedTo) task.assignedTo = assignedTo;
      if (departmentId) task.departmentId = departmentId;
      if (dueDate) task.dueDate = dueDate;
    }

    task.updatedAt = new Date();
    const updatedTask = await task.save();
    
    const populatedTask = await Task.findById(updatedTask._id)
      .populate('assignedTo')
      .populate('assignedBy')
      .populate('departmentId');

    res.json(populatedTask);
  } catch (error) {
    console.error('Update task error:', error);
    res.status(500).json({ message: 'Server error updating task' });
  }
});

// @route   DELETE /api/tasks/:id
// @desc    Delete task
// @access  Private (Admin, HR, Manager)
router.delete('/:id', protect, authorize('Admin', 'HR', 'Manager'), async (req, res) => {
  try {
    const task = await Task.findById(req.params.id);

    if (!task) {
      return res.status(404).json({ message: 'Task not found' });
    }

    await task.deleteOne();

    res.json({ message: 'Task removed' });
  } catch (error) {
    console.error('Delete task error:', error);
    res.status(500).json({ message: 'Server error deleting task' });
  }
});

export default router;
