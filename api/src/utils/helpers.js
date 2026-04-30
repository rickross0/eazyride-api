// ============================================================
// Utility Helper Functions
// ============================================================

const crypto = require('crypto');

// Generate unique ID
const generateId = (prefix = '') => {
  const timestamp = Date.now().toString(36);
  const random = crypto.randomBytes(4).toString('hex');
  return prefix ? `${prefix}_${timestamp}${random}` : `${timestamp}${random}`;
};

// Generate order number
const generateOrderNumber = () => {
  const date = new Date();
  const datePart = date.toISOString().slice(2, 10).replace(/-/g, '');
  const random = crypto.randomInt(1000, 9999);
  return `ORD${datePart}${random}`;
};

// Generate booking number
const generateBookingNumber = () => {
  const date = new Date();
  const datePart = date.toISOString().slice(2, 10).replace(/-/g, '');
  const random = crypto.randomInt(1000, 9999);
  return `BK${datePart}${random}`;
};

// Generate PIN code
const generatePin = (length = 4) => {
  return crypto.randomInt(Math.pow(10, length - 1), Math.pow(10, length)).toString();
};

// Generate lottery ticket number
const generateTicketNumber = (lotteryId, sequence) => {
  const lotteryPart = lotteryId.slice(-6).toUpperCase();
  const seqPart = sequence.toString().padStart(6, '0');
  return `${lotteryPart}-${seqPart}`;
};

// Calculate distance between two coordinates (Haversine formula)
const calculateDistance = (coord1, coord2) => {
  const R = 6371; // Earth's radius in km
  const dLat = toRad(coord2.lat - coord1.lat);
  const dLon = toRad(coord2.lng - coord1.lng);
  const a = 
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(coord1.lat)) * Math.cos(toRad(coord2.lat)) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
};

const toRad = (deg) => deg * (Math.PI / 180);

// Format currency
const formatCurrency = (amount, currency = 'USD') => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency
  }).format(amount);
};

// Paginate results
const paginate = (page = 1, limit = 20) => {
  const p = Math.max(1, parseInt(page));
  const l = Math.min(100, Math.max(1, parseInt(limit)));
  return {
    skip: (p - 1) * l,
    take: l,
    page: p,
    limit: l
  };
};

// Create pagination response
const paginationResponse = (data, total, page, limit) => {
  const totalPages = Math.ceil(total / limit);
  return {
    data,
    pagination: {
      total,
      page,
      limit,
      totalPages,
      hasNext: page < totalPages,
      hasPrev: page > 1
    }
  };
};

// Slugify string
const slugify = (text) => {
  return text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '-')
    .replace(/[^\w\-]+/g, '')
    .replace(/\-\-+/g, '-');
};

// Sanitize string
const sanitize = (str) => {
  if (typeof str !== 'string') return str;
  return str.replace(/[<>]/g, '').trim();
};

// Check if date is in the future
const isFutureDate = (date) => {
  return new Date(date) > new Date();
};

// Calculate time difference in hours
const hoursDifference = (date1, date2) => {
  return Math.abs(date2 - date1) / (1000 * 60 * 60);
};

// Sleep function
const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

module.exports = {
  generateId,
  generateOrderNumber,
  generateBookingNumber,
  generatePin,
  generateTicketNumber,
  calculateDistance,
  formatCurrency,
  paginate,
  paginationResponse,
  slugify,
  sanitize,
  isFutureDate,
  hoursDifference,
  sleep
};
