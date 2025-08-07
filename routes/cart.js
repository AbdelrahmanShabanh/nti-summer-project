const express = require('express');
const { body, validationResult } = require('express-validator');
const Cart = require('../models/Cart');
const Product = require('../models/Product');
const { protect, isConfirmed } = require('../middleware/auth');

const router = express.Router();

// Get user's cart
router.get('/', protect, isConfirmed, async (req, res, next) => {
  try {
    let cart = await Cart.findOne({ user: req.user._id })
      .populate({
        path: 'items.product',
        select: 'name price image description quantity isActive'
      });

    if (!cart) {
      cart = await Cart.create({
        user: req.user._id,
        items: [],
        total: 0
      });
    }

    res.json({
      success: true,
      data: { cart }
    });
  } catch (error) {
    next(error);
  }
});

// Add item to cart
router.post('/add', protect, isConfirmed, [
  body('productId').isMongoId().withMessage('Invalid product ID'),
  body('quantity').isInt({ min: 1 }).withMessage('Quantity must be at least 1')
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

    const { productId, quantity } = req.body;

    // Check if product exists and is active
    const product = await Product.findById(productId);
    if (!product || !product.isActive) {
      return res.status(404).json({
        success: false,
        message: 'Product not found or not available'
      });
    }

    // Check if quantity is available
    if (product.quantity < quantity) {
      return res.status(400).json({
        success: false,
        message: `Only ${product.quantity} items available in stock`
      });
    }

    let cart = await Cart.findOne({ user: req.user._id });

    if (!cart) {
      cart = new Cart({
        user: req.user._id,
        items: [],
        total: 0
      });
    }

    // Check if product already exists in cart
    const existingItemIndex = cart.items.findIndex(
      item => item.product.toString() === productId
    );

    if (existingItemIndex > -1) {
      // Update existing item quantity
      const newQuantity = cart.items[existingItemIndex].quantity + quantity;
      
      if (product.quantity < newQuantity) {
        return res.status(400).json({
          success: false,
          message: `Only ${product.quantity} items available in stock`
        });
      }
      
      cart.items[existingItemIndex].quantity = newQuantity;
    } else {
      // Add new item
      cart.items.push({
        product: productId,
        quantity,
        price: product.price
      });
    }

    await cart.save();

    const populatedCart = await Cart.findById(cart._id)
      .populate({
        path: 'items.product',
        select: 'name price image description quantity isActive'
      });

    res.json({
      success: true,
      message: 'Item added to cart successfully',
      data: { cart: populatedCart }
    });
  } catch (error) {
    next(error);
  }
});

// Update cart item quantity
router.put('/update/:productId', protect, isConfirmed, [
  body('quantity').isInt({ min: 1 }).withMessage('Quantity must be at least 1')
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

    const { productId } = req.params;
    const { quantity } = req.body;

    const cart = await Cart.findOne({ user: req.user._id });
    if (!cart) {
      return res.status(404).json({
        success: false,
        message: 'Cart not found'
      });
    }

    const itemIndex = cart.items.findIndex(
      item => item.product.toString() === productId
    );

    if (itemIndex === -1) {
      return res.status(404).json({
        success: false,
        message: 'Item not found in cart'
      });
    }

    // Check product availability
    const product = await Product.findById(productId);
    if (!product || !product.isActive) {
      return res.status(404).json({
        success: false,
        message: 'Product not found or not available'
      });
    }

    if (product.quantity < quantity) {
      return res.status(400).json({
        success: false,
        message: `Only ${product.quantity} items available in stock`
      });
    }

    cart.items[itemIndex].quantity = quantity;
    await cart.save();

    const populatedCart = await Cart.findById(cart._id)
      .populate({
        path: 'items.product',
        select: 'name price image description quantity isActive'
      });

    res.json({
      success: true,
      message: 'Cart item updated successfully',
      data: { cart: populatedCart }
    });
  } catch (error) {
    next(error);
  }
});

// Remove item from cart
router.delete('/remove/:productId', protect, isConfirmed, async (req, res, next) => {
  try {
    const { productId } = req.params;

    const cart = await Cart.findOne({ user: req.user._id });
    if (!cart) {
      return res.status(404).json({
        success: false,
        message: 'Cart not found'
      });
    }

    const itemIndex = cart.items.findIndex(
      item => item.product.toString() === productId
    );

    if (itemIndex === -1) {
      return res.status(404).json({
        success: false,
        message: 'Item not found in cart'
      });
    }

    cart.items.splice(itemIndex, 1);
    await cart.save();

    const populatedCart = await Cart.findById(cart._id)
      .populate({
        path: 'items.product',
        select: 'name price image description quantity isActive'
      });

    res.json({
      success: true,
      message: 'Item removed from cart successfully',
      data: { cart: populatedCart }
    });
  } catch (error) {
    next(error);
  }
});

// Clear cart
router.delete('/clear', protect, isConfirmed, async (req, res, next) => {
  try {
    const cart = await Cart.findOne({ user: req.user._id });
    if (!cart) {
      return res.status(404).json({
        success: false,
        message: 'Cart not found'
      });
    }

    cart.items = [];
    await cart.save();

    res.json({
      success: true,
      message: 'Cart cleared successfully',
      data: { cart }
    });
  } catch (error) {
    next(error);
  }
});

// Get cart total
router.get('/total', protect, isConfirmed, async (req, res, next) => {
  try {
    const cart = await Cart.findOne({ user: req.user._id });
    
    if (!cart) {
      return res.json({
        success: true,
        data: { total: 0, itemCount: 0 }
      });
    }

    const itemCount = cart.items.reduce((sum, item) => sum + item.quantity, 0);

    res.json({
      success: true,
      data: {
        total: cart.total,
        itemCount
      }
    });
  } catch (error) {
    next(error);
  }
});

module.exports = router; 