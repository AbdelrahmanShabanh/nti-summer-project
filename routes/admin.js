const express = require('express');
const { body, validationResult } = require('express-validator');
const User = require('../models/User');
const Product = require('../models/Product');
const Cart = require('../models/Cart');
const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

// All routes require admin access
router.use(protect, authorize('admin'));

// Get admin dashboard stats
router.get('/dashboard', async (req, res, next) => {
  try {
    const totalUsers = await User.countDocuments({ role: 'user' });
    const totalProducts = await Product.countDocuments();
    const activeProducts = await Product.countDocuments({ isActive: true });
    const totalCarts = await Cart.countDocuments();
    
    // Get low stock products (quantity < 10)
    const lowStockProducts = await Product.find({ 
      quantity: { $lt: 10 },
      isActive: true 
    }).select('name quantity');

    // Get recent users
    const recentUsers = await User.find({ role: 'user' })
      .select('name email createdAt isEmailConfirmed')
      .sort({ createdAt: -1 })
      .limit(5);

    // Get recent products
    const recentProducts = await Product.find()
      .select('name price quantity category createdAt')
      .sort({ createdAt: -1 })
      .limit(5);

    res.json({
      success: true,
      data: {
        stats: {
          totalUsers,
          totalProducts,
          activeProducts,
          totalCarts
        },
        lowStockProducts,
        recentUsers,
        recentProducts
      }
    });
  } catch (error) {
    next(error);
  }
});

// Get all users with pagination and search
router.get('/users', async (req, res, next) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;
    const search = req.query.search;
    const role = req.query.role;

    let query = {};

    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } }
      ];
    }

    if (role) {
      query.role = role;
    }

    const users = await User.find(query)
      .select('-password')
      .skip(skip)
      .limit(limit)
      .sort({ createdAt: -1 });

    const total = await User.countDocuments(query);

    res.json({
      success: true,
      data: {
        users,
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit)
        }
      }
    });
  } catch (error) {
    next(error);
  }
});

// Get all products with pagination and search
router.get('/products', async (req, res, next) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;
    const search = req.query.search;
    const category = req.query.category;
    const isActive = req.query.isActive;

    let query = {};

    if (search) {
      query.$text = { $search: search };
    }

    if (category) {
      query.category = category;
    }

    if (isActive !== undefined) {
      query.isActive = isActive === 'true';
    }

    const products = await Product.find(query)
      .populate('createdBy', 'name')
      .skip(skip)
      .limit(limit)
      .sort({ createdAt: -1 });

    const total = await Product.countDocuments(query);

    res.json({
      success: true,
      data: {
        products,
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit)
        }
      }
    });
  } catch (error) {
    next(error);
  }
});

// Get all carts
router.get('/carts', async (req, res, next) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const carts = await Cart.find()
      .populate('user', 'name email')
      .populate({
        path: 'items.product',
        select: 'name price image'
      })
      .skip(skip)
      .limit(limit)
      .sort({ createdAt: -1 });

    const total = await Cart.countDocuments();

    res.json({
      success: true,
      data: {
        carts,
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit)
        }
      }
    });
  } catch (error) {
    next(error);
  }
});

// Create admin user
router.post('/create-admin', [
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

    // Create admin user
    const adminUser = await User.create({
      name,
      email,
      password,
      role: 'admin',
      isEmailConfirmed: true // Admin users don't need email confirmation
    });

    res.status(201).json({
      success: true,
      message: 'Admin user created successfully',
      data: {
        user: {
          id: adminUser._id,
          name: adminUser.name,
          email: adminUser.email,
          role: adminUser.role
        }
      }
    });
  } catch (error) {
    next(error);
  }
});

// Bulk operations
router.post('/bulk-delete-products', [
  body('productIds').isArray().withMessage('Product IDs must be an array')
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

    const { productIds } = req.body;

    const result = await Product.deleteMany({ _id: { $in: productIds } });

    res.json({
      success: true,
      message: `${result.deletedCount} products deleted successfully`
    });
  } catch (error) {
    next(error);
  }
});

// Get system statistics
router.get('/stats', async (req, res, next) => {
  try {
    const totalUsers = await User.countDocuments({ role: 'user' });
    const confirmedUsers = await User.countDocuments({ 
      role: 'user', 
      isEmailConfirmed: true 
    });
    const totalProducts = await Product.countDocuments();
    const activeProducts = await Product.countDocuments({ isActive: true });
    const totalCarts = await Cart.countDocuments();
    
    // Get products by category
    const productsByCategory = await Product.aggregate([
      { $group: { _id: '$category', count: { $sum: 1 } } },
      { $sort: { count: -1 } }
    ]);

    // Get recent activity
    const recentUsers = await User.find({ role: 'user' })
      .select('name email createdAt')
      .sort({ createdAt: -1 })
      .limit(5);

    const recentProducts = await Product.find()
      .select('name price category createdAt')
      .sort({ createdAt: -1 })
      .limit(5);

    res.json({
      success: true,
      data: {
        users: {
          total: totalUsers,
          confirmed: confirmedUsers,
          unconfirmed: totalUsers - confirmedUsers
        },
        products: {
          total: totalProducts,
          active: activeProducts,
          inactive: totalProducts - activeProducts
        },
        carts: totalCarts,
        productsByCategory,
        recentUsers,
        recentProducts
      }
    });
  } catch (error) {
    next(error);
  }
});

module.exports = router; 