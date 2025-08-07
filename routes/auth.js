const express = require('express');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const { body, validationResult } = require('express-validator');
const User = require('../models/User');
const { sendConfirmationEmail, sendPasswordResetEmail } = require('../utils/emailService');
const { protect } = require('../middleware/auth');

const router = express.Router();

// Generate JWT token
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: '30d'
  });
};

// User signup
router.post('/signup', [
  body('name').trim().isLength({ min: 2 }).withMessage('Name must be at least 2 characters'),
  body('email').isEmail().normalizeEmail().withMessage('Please provide a valid email'),
  body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters')
], async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation errors',
        errors: errors.array()
      });
    }

    const { name, email, password } = req.body;

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'User with this email already exists'
      });
    }

    // Generate confirmation token
    const confirmationToken = crypto.randomBytes(32).toString('hex');
    const confirmationExpires = Date.now() + 24 * 60 * 60 * 1000; // 24 hours

    // Create user
    const user = await User.create({
      name,
      email,
      password,
      emailConfirmationToken: confirmationToken,
      emailConfirmationExpires: confirmationExpires
    });

    // Send confirmation email
    const emailSent = await sendConfirmationEmail(email, confirmationToken);
    
    if (!emailSent) {
      // If email fails, still create user but notify about email issue
      return res.status(201).json({
        success: true,
        message: 'User created successfully. Please check your email for confirmation link.',
        data: {
          user: {
            id: user._id,
            name: user.name,
            email: user.email,
            isEmailConfirmed: user.isEmailConfirmed
          }
        }
      });
    }

    res.status(201).json({
      success: true,
      message: 'User created successfully. Please check your email for confirmation link.',
      data: {
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          isEmailConfirmed: user.isEmailConfirmed
        }
      }
    });
  } catch (error) {
    next(error);
  }
});

// User login
router.post('/login', [
  body('email').isEmail().normalizeEmail().withMessage('Please provide a valid email'),
  body('password').notEmpty().withMessage('Password is required')
], async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation errors',
        errors: errors.array()
      });
    }

    const { email, password } = req.body;

    // Find user and include password for comparison
    const user = await User.findOne({ email }).select('+password');
    
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials'
      });
    }

    // Check password
    const isPasswordValid = await user.comparePassword(password);
    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials'
      });
    }

    // Check if email is confirmed
    if (!user.isEmailConfirmed) {
      return res.status(403).json({
        success: false,
        message: 'Please confirm your email before logging in',
        data: {
          user: {
            id: user._id,
            name: user.name,
            email: user.email,
            isEmailConfirmed: user.isEmailConfirmed
          }
        }
      });
    }

    // Generate token
    const token = generateToken(user._id);

    res.json({
      success: true,
      message: 'Login successful',
      data: {
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
          isEmailConfirmed: user.isEmailConfirmed
        },
        token
      }
    });
  } catch (error) {
    next(error);
  }
});

// Admin login (separate endpoint)
router.post('/admin/login', [
  body('email').isEmail().normalizeEmail().withMessage('Please provide a valid email'),
  body('password').notEmpty().withMessage('Password is required')
], async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation errors',
        errors: errors.array()
      });
    }

    const { email, password } = req.body;

    // Find admin user
    const user = await User.findOne({ email, role: 'admin' }).select('+password');
    
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid admin credentials'
      });
    }

    // Check password
    const isPasswordValid = await user.comparePassword(password);
    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        message: 'Invalid admin credentials'
      });
    }

    // Generate token
    const token = generateToken(user._id);

    res.json({
      success: true,
      message: 'Admin login successful',
      data: {
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          role: user.role
        },
        token
      }
    });
  } catch (error) {
    next(error);
  }
});

// Confirm email
router.get('/confirm-email/:token', async (req, res, next) => {
  try {
    const { token } = req.params;

    const user = await User.findOne({
      emailConfirmationToken: token,
      emailConfirmationExpires: { $gt: Date.now() }
    });

    if (!user) {
      return res.status(400).json({
        success: false,
        message: 'Invalid or expired confirmation token'
      });
    }

    user.isEmailConfirmed = true;
    user.emailConfirmationToken = undefined;
    user.emailConfirmationExpires = undefined;
    await user.save();

    res.json({
      success: true,
      message: 'Email confirmed successfully'
    });
  } catch (error) {
    next(error);
  }
});

// Resend confirmation email
router.post('/resend-confirmation', [
  body('email').isEmail().normalizeEmail().withMessage('Please provide a valid email')
], async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation errors',
        errors: errors.array()
      });
    }

    const { email } = req.body;

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    if (user.isEmailConfirmed) {
      return res.status(400).json({
        success: false,
        message: 'Email is already confirmed'
      });
    }

    // Generate new confirmation token
    const confirmationToken = crypto.randomBytes(32).toString('hex');
    const confirmationExpires = Date.now() + 24 * 60 * 60 * 1000; // 24 hours

    user.emailConfirmationToken = confirmationToken;
    user.emailConfirmationExpires = confirmationExpires;
    await user.save();

    // Send confirmation email
    const emailSent = await sendConfirmationEmail(email, confirmationToken);
    
    if (!emailSent) {
      return res.status(500).json({
        success: false,
        message: 'Failed to send confirmation email. Please try again.'
      });
    }

    res.json({
      success: true,
      message: 'Confirmation email sent successfully'
    });
  } catch (error) {
    next(error);
  }
});

// Get current user
router.get('/me', protect, async (req, res, next) => {
  try {
    res.json({
      success: true,
      data: {
        user: {
          id: req.user._id,
          name: req.user.name,
          email: req.user.email,
          role: req.user.role,
          isEmailConfirmed: req.user.isEmailConfirmed
        }
      }
    });
  } catch (error) {
    next(error);
  }
});

module.exports = router; 