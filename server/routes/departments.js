import express from 'express';
import Department from '../models/Department.js';
import { protect, authorize } from '../middleware/auth.js';

const router = express.Router();

// @route   GET /api/departments
// @desc    Get all departments
// @access  Private
router.get('/', protect, async (req, res) => {
  try {
    const departments = await Department.find().populate('managerId');
    res.json(departments);
  } catch (error) {
    console.error('Get departments error:', error);
    res.status(500).json({ message: 'Server error fetching departments' });
  }
});

// @route   GET /api/departments/:id
// @desc    Get department by ID
// @access  Private
router.get('/:id', protect, async (req, res) => {
  try {
    const department = await Department.findById(req.params.id).populate('managerId');
    
    if (!department) {
      return res.status(404).json({ message: 'Department not found' });
    }

    res.json(department);
  } catch (error) {
    console.error('Get department error:', error);
    res.status(500).json({ message: 'Server error fetching department' });
  }
});

// @route   POST /api/departments
// @desc    Create new department
// @access  Private (Admin, HR)
router.post('/', protect, authorize('Admin', 'HR'), async (req, res) => {
  try {
    const { name, managerId } = req.body;

    // Check if department exists
    const departmentExists = await Department.findOne({ name });

    if (departmentExists) {
      return res.status(400).json({ message: 'Department already exists' });
    }

    const department = await Department.create({
      name,
      managerId: managerId || null
    });

    const populatedDepartment = await Department.findById(department._id).populate('managerId');

    res.status(201).json(populatedDepartment);
  } catch (error) {
    console.error('Create department error:', error);
    res.status(500).json({ message: 'Server error creating department' });
  }
});

// @route   PUT /api/departments/:id
// @desc    Update department
// @access  Private (Admin, HR)
router.put('/:id', protect, authorize('Admin', 'HR'), async (req, res) => {
  try {
    const department = await Department.findById(req.params.id);

    if (!department) {
      return res.status(404).json({ message: 'Department not found' });
    }

    const { name, managerId } = req.body;

    if (name) department.name = name;
    if (managerId !== undefined) department.managerId = managerId || null;

    const updatedDepartment = await department.save();
    const populatedDepartment = await Department.findById(updatedDepartment._id).populate('managerId');

    res.json(populatedDepartment);
  } catch (error) {
    console.error('Update department error:', error);
    res.status(500).json({ message: 'Server error updating department' });
  }
});

// @route   DELETE /api/departments/:id
// @desc    Delete department
// @access  Private (Admin, HR)
router.delete('/:id', protect, authorize('Admin', 'HR'), async (req, res) => {
  try {
    const department = await Department.findById(req.params.id);

    if (!department) {
      return res.status(404).json({ message: 'Department not found' });
    }

    await department.deleteOne();

    res.json({ message: 'Department removed' });
  } catch (error) {
    console.error('Delete department error:', error);
    res.status(500).json({ message: 'Server error deleting department' });
  }
});

export default router;
