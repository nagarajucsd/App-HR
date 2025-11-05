import express from 'express';
import User from '../models/User.js';
import Employee from '../models/Employee.js';
import Notification from '../models/Notification.js';
import { protect, authorize } from '../middleware/auth.js';

const router = express.Router();

// @route   GET /api/users
// @desc    Get all users
// @access  Private (Admin, HR)
router.get('/', protect, authorize('Admin', 'HR'), async (req, res) => {
  try {
    const users = await User.find().select('-password');
    res.json(users);
  } catch (error) {
    console.error('Get users error:', error);
    res.status(500).json({ message: 'Server error fetching users' });
  }
});

// @route   GET /api/users/:id
// @desc    Get user by ID
// @access  Private
router.get('/:id', protect, async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select('-password');
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json(user);
  } catch (error) {
    console.error('Get user error:', error);
    res.status(500).json({ message: 'Server error fetching user' });
  }
});

// @route   POST /api/users
// @desc    Create new user
// @access  Private (Admin, HR)
router.post('/', protect, authorize('Admin', 'HR'), async (req, res) => {
  try {
    const { name, email, password, role, avatarUrl } = req.body;

    // Check if user exists
    const userExists = await User.findOne({ email: email.toLowerCase() });

    if (userExists) {
      return res.status(400).json({ message: 'User already exists' });
    }

    const user = await User.create({
      name,
      email: email.toLowerCase(),
      password,
      role: role || 'Employee',
      avatarUrl: avatarUrl || `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=random`
    });

    res.status(201).json({
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      avatarUrl: user.avatarUrl,
      isMfaSetup: user.isMfaSetup
    });
  } catch (error) {
    console.error('Create user error:', error);
    res.status(500).json({ message: 'Server error creating user' });
  }
});

// @route   PUT /api/users/:id
// @desc    Update user
// @access  Private
router.put('/:id', protect, async (req, res) => {
  try {
    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Only allow users to update their own profile unless admin/HR
    if (req.user._id.toString() !== req.params.id && 
        !['Admin', 'HR'].includes(req.user.role)) {
      return res.status(403).json({ message: 'Not authorized to update this user' });
    }

    const { name, email, avatarUrl, role } = req.body;

    if (name) user.name = name;
    if (email) user.email = email.toLowerCase();
    if (avatarUrl) user.avatarUrl = avatarUrl;
    
    // Only admin can change roles
    if (role && req.user.role === 'Admin') {
      user.role = role;
    }

    const updatedUser = await user.save();

    // Sync changes to Employee collection
    try {
      const updateFields = {};
      if (name) updateFields.name = name;
      if (email) updateFields.email = email.toLowerCase();
      if (avatarUrl) updateFields.avatarUrl = avatarUrl;

      if (Object.keys(updateFields).length > 0) {
        await Employee.updateOne(
          { userId: user._id },
          { $set: updateFields }
        );
        console.log('✅ Employee record synced for user:', user.email);
      }
    } catch (empError) {
      console.error('❌ Error syncing employee record:', empError);
      // Don't fail the user update if employee sync fails
    }

    // Notify HR, Admin, and Managers about profile update (ONLY ONCE - DELETE OLD FIRST)
    try {
      // Only notify if employee updated their own profile AND something actually changed
      if (req.user._id.toString() === req.params.id && 
          req.user.role === 'Employee' && 
          (name || email || avatarUrl)) {
        
        const changedFields = [];
        if (name) changedFields.push('name');
        if (email) changedFields.push('email');
        if (avatarUrl) changedFields.push('profile photo');

        // Get all HR, Admin, and Manager users
        const notifyUsers = await User.find({
          role: { $in: ['Admin', 'HR', 'Manager'] },
          isActive: true
        });

        // Create a single consolidated notification message
        const message = `${updatedUser.name} updated their ${changedFields.join(', ')}`;
        const title = 'Employee Profile Updated';

        // DELETE any existing similar notifications from last 10 minutes (prevent spam)
        const tenMinutesAgo = new Date(Date.now() - 10 * 60 * 1000);
        await Notification.deleteMany({
          userId: { $in: notifyUsers.map(u => u._id) },
          title: title,
          message: { $regex: `^${updatedUser.name} updated their` },
          createdAt: { $gte: tenMinutesAgo }
        });
        
        // Now create ONE new notification for each user
        const notifications = notifyUsers.map(notifyUser => ({
          userId: notifyUser._id,
          title: title,
          message: message,
          link: `/employees/${req.params.id}`
        }));

        await Notification.insertMany(notifications);
        console.log(`✅ Created ${notifications.length} notifications (deleted old duplicates first)`);
      }
    } catch (notifyError) {
      console.error('❌ Error creating notifications:', notifyError);
      // Don't fail the update if notification fails
    }

    res.json({
      id: updatedUser._id,
      name: updatedUser.name,
      email: updatedUser.email,
      role: updatedUser.role,
      avatarUrl: updatedUser.avatarUrl,
      isMfaSetup: updatedUser.isMfaSetup
    });
  } catch (error) {
    console.error('Update user error:', error);
    res.status(500).json({ message: 'Server error updating user' });
  }
});

// @route   DELETE /api/users/:id
// @desc    Delete user
// @access  Private (Admin)
router.delete('/:id', protect, authorize('Admin'), async (req, res) => {
  try {
    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    await user.deleteOne();

    res.json({ message: 'User removed' });
  } catch (error) {
    console.error('Delete user error:', error);
    res.status(500).json({ message: 'Server error deleting user' });
  }
});

export default router;
