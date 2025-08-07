const express = require('express');
const { body, validationResult } = require('express-validator');
const Product = require('../models/Product');
const { protect, authorize, isConfirmed } = require('../middleware/auth');

const router = express.Router();

// Get all products (public)
router.get('/', async (req, res, next) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;
    const category = req.query.category;
    const search = req.query.search;

    let query = { isActive: true };

    if (category) {
      query.category = category;
    }

    if (search) {
      query.$text = { $search: search };
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

// Get product by ID (public)
router.get('/:id', async (req, res, next) => {
  try {
    const product = await Product.findById(req.params.id)
      .populate('createdBy', 'name');

    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }

    res.json({
      success: true,
      data: { product }
    });
  } catch (error) {
    next(error);
  }
});

// Create product (admin only)
router.post('/', protect, authorize('admin'), [
  body('name').trim().isLength({ min: 2, max: 100 }).withMessage('Product name must be between 2 and 100 characters'),
  body('description').trim().isLength({ min: 10, max: 500 }).withMessage('Description must be between 10 and 500 characters'),
  body('price').isFloat({ min: 0 }).withMessage('Price must be a positive number'),
  body('quantity').isInt({ min: 0 }).withMessage('Quantity must be a non-negative integer'),
  body('category').isIn(['Electronics', 'Clothing', 'Books', 'Home', 'Sports', 'Other']).withMessage('Invalid category'),
  body('image').notEmpty().withMessage('Product image is required')
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

    const { name, description, price, quantity, category, image } = req.body;

    const product = await Product.create({
      name,
      description,
      price,
      quantity,
      category,
      image,
      createdBy: req.user._id
    });

    const populatedProduct = await Product.findById(product._id)
      .populate('createdBy', 'name');

    res.status(201).json({
      success: true,
      message: 'Product created successfully',
      data: { product: populatedProduct }
    });
  } catch (error) {
    next(error);
  }
});

// Update product (admin only)
router.put('/:id', protect, authorize('admin'), [
  body('name').optional().trim().isLength({ min: 2, max: 100 }).withMessage('Product name must be between 2 and 100 characters'),
  body('description').optional().trim().isLength({ min: 10, max: 500 }).withMessage('Description must be between 10 and 500 characters'),
  body('price').optional().isFloat({ min: 0 }).withMessage('Price must be a positive number'),
  body('quantity').optional().isInt({ min: 0 }).withMessage('Quantity must be a non-negative integer'),
  body('category').optional().isIn(['Electronics', 'Clothing', 'Books', 'Home', 'Sports', 'Other']).withMessage('Invalid category'),
  body('image').optional().notEmpty().withMessage('Product image cannot be empty'),
  body('isActive').optional().isBoolean().withMessage('isActive must be a boolean')
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

    const product = await Product.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    ).populate('createdBy', 'name');

    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }

    res.json({
      success: true,
      message: 'Product updated successfully',
      data: { product }
    });
  } catch (error) {
    next(error);
  }
});

// Update product quantity (admin only)
router.patch('/:id/quantity', protect, authorize('admin'), [
  body('quantity').isInt({ min: 0 }).withMessage('Quantity must be a non-negative integer')
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

    const { quantity } = req.body;

    const product = await Product.findByIdAndUpdate(
      req.params.id,
      { quantity },
      { new: true, runValidators: true }
    ).populate('createdBy', 'name');

    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }

    res.json({
      success: true,
      message: 'Product quantity updated successfully',
      data: { product }
    });
  } catch (error) {
    next(error);
  }
});

// Delete product (admin only)
router.delete('/:id', protect, authorize('admin'), async (req, res, next) => {
  try {
    const product = await Product.findByIdAndDelete(req.params.id);

    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }

    res.json({
      success: true,
      message: 'Product deleted successfully'
    });
  } catch (error) {
    next(error);
  }
});

// Get products by category
router.get('/category/:category', async (req, res, next) => {
  try {
    const { category } = req.params;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const products = await Product.find({ 
      category, 
      isActive: true 
    })
      .populate('createdBy', 'name')
      .skip(skip)
      .limit(limit)
      .sort({ createdAt: -1 });

    const total = await Product.countDocuments({ category, isActive: true });

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

// Search products
router.get('/search/:query', async (req, res, next) => {
  try {
    const { query } = req.params;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const products = await Product.find({
      $text: { $search: query },
      isActive: true
    })
      .populate('createdBy', 'name')
      .skip(skip)
      .limit(limit)
      .sort({ createdAt: -1 });

    const total = await Product.countDocuments({
      $text: { $search: query },
      isActive: true
    });

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

module.exports = router; 