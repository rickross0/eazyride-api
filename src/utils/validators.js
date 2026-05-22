// ============================================================
// Validation Schemas — v3.0.0
// ============================================================

const { body, param, query, validationResult } = require('express-validator');

// Middleware to check validation results
const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const messages = errors.array().map(e => e.msg).join('; ');
    return res.status(400).json({ success: false, error: messages });
  }
  next();
};

// Auth validation
const registerValidation = [
  body('phone').isMobilePhone().withMessage('Valid phone required'),
  body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 chars'),
  body('firstName').trim().notEmpty().withMessage('First name required'),
  body('lastName').trim().notEmpty().withMessage('Last name required'),
  validate,
];

const loginValidation = [
  body('phone').isMobilePhone().withMessage('Valid phone required'),
  body('password').notEmpty().withMessage('Password required'),
  validate,
];

// Ride validation — coordinates are optional since controller handles both flat lat/lng and nested formats
const createRideValidation = [
  body('pickupAddress').optional().trim().notEmpty().withMessage('Pickup address required'),
  body('dropoffAddress').optional().trim().notEmpty().withMessage('Dropoff address required'),
  body('pickupCoordinates').optional().isObject().withMessage('Pickup coordinates must be an object'),
  body('dropoffCoordinates').optional().isObject().withMessage('Dropoff coordinates must be an object'),
  body('vehicleType').optional().isIn(['BAJAJ', 'CAR']).withMessage('Vehicle type must be BAJAJ or CAR'),
  validate,
];

// Order validation
const createOrderValidation = [
  body('storeId').notEmpty().withMessage('Store ID required'),
  body('items').isArray({ min: 1 }).withMessage('At least one item required'),
  body('deliveryAddress').notEmpty().withMessage('Delivery address required'),
  body('deliveryCoordinates').isObject().withMessage('Delivery coordinates required'),
  body('paymentMethod').isIn(['EVC_PLUS', 'ZAAD', 'WALLET']).withMessage('Invalid payment method'),
  validate,
];

// Booking validation
const createBookingValidation = [
  body('carId').notEmpty().withMessage('Car ID required'),
  body('startDate').isISO8601().withMessage('Valid start date required'),
  body('endDate').isISO8601().withMessage('Valid end date required'),
  body('paymentMethod').isIn(['EVC_PLUS', 'ZAAD', 'WALLET']).withMessage('Invalid payment method'),
  validate,
];

// Lottery validation
const createLotteryValidation = [
  body('title').trim().notEmpty().withMessage('Title required'),
  body('description').optional().trim(),
  body('startDate').isISO8601().withMessage('Valid start date required'),
  body('endDate').isISO8601().withMessage('Valid end date required'),
  validate,
];

// Promo code validation
const createPromoCodeValidation = [
  body('code').trim().notEmpty().withMessage('Code required'),
  body('discountType').isIn(['PERCENTAGE', 'FIXED']).withMessage('Invalid discount type'),
  body('discountValue').isFloat({ min: 0 }).withMessage('Discount value must be positive'),
  validate,
];

// Promotion validation
const createPromotionValidation = [
  body('title').trim().notEmpty().withMessage('Title required'),
  body('description').optional().trim(),
  body('startDate').isISO8601().withMessage('Valid start date required'),
  body('endDate').isISO8601().withMessage('Valid end date required'),
  validate,
];

module.exports = {
  validate,
  registerValidation,
  loginValidation,
  createRideValidation,
  createOrderValidation,
  createBookingValidation,
  createLotteryValidation,
  createPromoCodeValidation,
  createPromotionValidation,
};
