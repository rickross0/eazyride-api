// ============================================================
// Input Validation Middleware
// ============================================================

const { AppError } = require('./errorHandler');

// Validation rules
const validators = {
  isPhone: (phone) => /^\+252\d{8,9}$/.test(phone),
  isEmail: (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email),
  isString: (value) => typeof value === 'string' && value.trim().length > 0,
  isNumber: (value) => typeof value === 'number' && !isNaN(value),
  isPositiveNumber: (value) => typeof value === 'number' && value > 0,
  isBoolean: (value) => typeof value === 'boolean',
  isArray: (Array.isArray),
  isCoordinate: (coord) => coord && typeof coord.lat === 'number' && typeof coord.lng === 'number'
};

// Validate request body
const validate = (schema) => {
  return (req, res, next) => {
    const errors = [];
    const body = req.body;

    for (const [field, rules] of Object.entries(schema)) {
      const value = body[field];

      // Check required
      if (rules.required && (value === undefined || value === null || value === '')) {
        errors.push(`${field} is required`);
        continue;
      }

      // Skip if not required and not provided
      if (!rules.required && (value === undefined || value === null)) {
        continue;
      }

      // Type validations
      if (rules.type === 'phone' && !validators.isPhone(value)) {
        errors.push(`${field} must be a valid Somali phone number (+252XXXXXXXXX)`);
      }
      if (rules.type === 'email' && !validators.isEmail(value)) {
        errors.push(`${field} must be a valid email`);
      }
      if (rules.type === 'string' && !validators.isString(value)) {
        errors.push(`${field} must be a non-empty string`);
      }
      if (rules.type === 'number' && !validators.isNumber(value)) {
        errors.push(`${field} must be a number`);
      }
      if (rules.type === 'positiveNumber' && !validators.isPositiveNumber(value)) {
        errors.push(`${field} must be a positive number`);
      }
      if (rules.type === 'boolean' && !validators.isBoolean(value)) {
        errors.push(`${field} must be a boolean`);
      }
      if (rules.type === 'array' && !validators.isArray(value)) {
        errors.push(`${field} must be an array`);
      }

      // Length validations
      if (rules.minLength && value.length < rules.minLength) {
        errors.push(`${field} must be at least ${rules.minLength} characters`);
      }
      if (rules.maxLength && value.length > rules.maxLength) {
        errors.push(`${field} must be at most ${rules.maxLength} characters`);
      }
      if (rules.min !== undefined && value < rules.min) {
        errors.push(`${field} must be at least ${rules.min}`);
      }
      if (rules.max !== undefined && value > rules.max) {
        errors.push(`${field} must be at most ${rules.max}`);
      }

      // Enum validation
      if (rules.enum && !rules.enum.includes(value)) {
        errors.push(`${field} must be one of: ${rules.enum.join(', ')}`);
      }

      // Custom validation
      if (rules.validate && !rules.validate(value)) {
        errors.push(rules.message || `${field} is invalid`);
      }
    }

    if (errors.length > 0) {
      return next(new AppError(errors.join('. '), 400));
    }

    next();
  };
};

// Pre-built validation schemas
const schemas = {
  register: {
    phone: { required: true, type: 'phone' },
    password: { required: true, type: 'string', minLength: 6 },
    firstName: { required: true, type: 'string', minLength: 2 },
    lastName: { required: true, type: 'string', minLength: 2 }
  },
  
  login: {
    phone: { required: true, type: 'phone' },
    password: { required: true, type: 'string' }
  },

  createRide: {
    pickupCoordinates: { required: true, type: 'object' },
    dropoffCoordinates: { required: true, type: 'object' },
    pickupAddress: { required: true, type: 'string' },
    dropoffAddress: { required: true, type: 'string' }
  },

  createOrder: {
    storeId: { required: true, type: 'string' },
    items: { required: true, type: 'array' },
    deliveryAddress: { required: true, type: 'string' },
    deliveryCoordinates: { required: true, type: 'object' }
  },

  createBooking: {
    carId: { required: true, type: 'string' },
    startDate: { required: true, type: 'string' },
    endDate: { required: true, type: 'string' }
  },

  createPromoCode: {
    code: { required: true, type: 'string', minLength: 3 },
    discountType: { required: true, type: 'string', enum: ['PERCENTAGE', 'FLAT'] },
    discountValue: { required: true, type: 'positiveNumber' },
    startDate: { required: true, type: 'string' },
    endDate: { required: true, type: 'string' }
  },

  createLottery: {
    title: { required: true, type: 'string' },
    entryLimit: { required: false, type: 'positiveNumber' },

    prizePool: { required: true, type: 'positiveNumber' },
    startDate: { required: true, type: 'string' },
    endDate: { required: true, type: 'string' },
    drawDate: { required: true, type: 'string' }
  }
};

module.exports = { validate, schemas, validators };
