// ============================================================
// Validation Schemas — v3.0.0
// ============================================================

const { body, param, query, validationResult } = require('express-validator');

// Middleware to check validation results
const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ success: false, errors: errors.array() });
  }
  next();
};

// Auth validation
const registerValidation = [
  body('phone').isMobilePhone().withMessage('Valid phone required'),
  body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 chars'),
  body('firstName').trim().notEmpty().withMessage('First name required'),
  body('lastName').trim().notEmpty().withMessage('Last name required'),
  body('role').isIn(['RIDER', 'DRIVER', 'STORE_OWNER', 'SERVICE_PROVIDER']).withMessage('Invalid role'),
  validate,
];

const loginValidation = [
  body('phone').isMobilePhone().withMessage('Valid phone required'),
  body('password').notEmpty().withMessage('Password required'),
  validate,
];

// Ride validation
const createRideValidation = [
  body("pickupAddress").optional().notEmpty().withMessage('Pickup address required'),
  body("dropoffAddress").optional().notEmpty().withMessage('Dropoff address required'),
  body('pickupCoordinates').isObject().withMessage('Pickup coordinates required'),
  body('dropoffCoordinates').isObject().withMessage('Dropoff coordinates required'),
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
  
  body('entryLimit').optional().isInt({ min: 1 }).withMessage('Valid entry limit'),
  body('prizePool').isFloat({ min: 1 }).withMessage('Prize pool required'),
  body('drawDate').isISO8601().withMessage('Valid draw date required'),
  validate,
];

// Promo code validation
const createPromoCodeValidation = [
  body('code').trim().notEmpty().isLength({ min: 3 }).withMessage('Code must be at least 3 chars'),
  body('discountType').isIn(['PERCENTAGE', 'FLAT']).withMessage('Invalid discount type'),
  body('discountValue').isFloat({ min: 0.01 }).withMessage('Valid discount value required'),
  validate,
];

// Promotion validation
const createPromotionValidation = [
  body('title').trim().notEmpty().withMessage('Title required'),
  body('type').isIn(['BANNER', 'POPUP', 'NOTIFICATION', 'IN_APP']).withMessage('Invalid promotion type'),
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
