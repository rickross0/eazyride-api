// ============================================================
// Application Constants
// ============================================================

module.exports = {
  // App Info
  APP_NAME: 'EazyRide + Haye!',
  APP_VERSION: '3.0.0',
  
  // User Roles
  ROLES: {
    RIDER: 'RIDER',
    DRIVER: 'DRIVER',
    STORE_OWNER: 'STORE_OWNER',
    SERVICE_PROVIDER: 'SERVICE_PROVIDER',
    ADMIN: 'ADMIN'
  },

  // Admin Roles
  ADMIN_ROLES: {
    SUPER_ADMIN: 'SUPER_ADMIN',
    MANAGER: 'MANAGER',
    CARE: 'CARE'
  },

  // Ride Status
  RIDE_STATUS: {
    REQUESTED: 'REQUESTED',
    ACCEPTED: 'ACCEPTED',
    DRIVER_ARRIVING: 'DRIVER_ARRIVING',
    DRIVER_ARRIVED: 'DRIVER_ARRIVED',
    IN_PROGRESS: 'IN_PROGRESS',
    COMPLETED: 'COMPLETED',
    CANCELLED: 'CANCELLED'
  },

  // Order Status
  ORDER_STATUS: {
    PENDING: 'PENDING',
    CONFIRMED: 'CONFIRMED',
    PREPARING: 'PREPARING',
    READY: 'READY',
    PICKED_UP: 'PICKED_UP',
    DELIVERED: 'DELIVERED',
    CANCELLED: 'CANCELLED'
  },

  // Rental Status
  RENTAL_STATUS: {
    PENDING: 'PENDING',
    CONFIRMED: 'CONFIRMED',
    ACTIVE: 'ACTIVE',
    COMPLETED: 'COMPLETED',
    CANCELLED: 'CANCELLED',
    EXPIRED: 'EXPIRED'
  },

  // Payment Methods
  PAYMENT_METHOD: {
    EVC_PLUS: 'EVC_PLUS',
    ZAAD: 'ZAAD',
    WALLET: 'WALLET'
  },

  // Transaction Types
  TRANSACTION_TYPE: {
    DEPOSIT: 'DEPOSIT',
    WITHDRAWAL: 'WITHDRAWAL',
    PAYMENT: 'PAYMENT',
    REFUND: 'REFUND',
    COMMISSION: 'COMMISSION',
    PAYOUT: 'PAYOUT',
    LOTTERY_WIN: 'LOTTERY_WIN',
    LOTTERY_TICKET: 'LOTTERY_TICKET'
  },

  // Lottery Status
  LOTTERY_STATUS: {
    UPCOMING: 'UPCOMING',
    ACTIVE: 'ACTIVE',
    DRAWING: 'DRAWING',
    COMPLETED: 'COMPLETED',
    CANCELLED: 'CANCELLED'
  },

  // Commission Rates
  COMMISSION: {
    RIDE: 0.15,        // 15%
    FOOD: 0.10,        // 10%
    RENTAL: 0.05       // 5%
  },

  // Cancellation Fees
  CANCELLATION: {
    RIDE_FEE: 0,       // No fee for rides
    RENTAL_FREE_HOURS: 48,
    RENTAL_FEE_PERCENTAGE: 0.10  // 10% if within 48h
  },

  // Pagination
  DEFAULT_PAGE: 1,
  DEFAULT_LIMIT: 20,
  MAX_LIMIT: 100,

  // File Upload
  MAX_FILE_SIZE: 5 * 1024 * 1024, // 5MB
  ALLOWED_IMAGE_TYPES: ['image/jpeg', 'image/png', 'image/webp'],

  // Token expiry
  JWT_EXPIRY: '7d',
  JWT_REFRESH_EXPIRY: '30d',

  // Payout thresholds
  PAYOUT_THRESHOLDS: {
    CARE: 200,
    MANAGER: 1000,
    SUPER_ADMIN: Infinity
  },

  // Driver location TTL (seconds)
  DRIVER_LOCATION_TTL: 30,

  // Socket events
  SOCKET_EVENTS: {
    DRIVER_LOCATION: 'driver:location',
    RIDE_REQUEST: 'ride:request',
    RIDE_OFFER: 'ride:offer',
    RIDE_UPDATE: 'ride:update',
    ORDER_UPDATE: 'order:update',
    NOTIFICATION: 'notification',
    SOS_ALERT: 'sos:alert',
    CHAT_MESSAGE: 'chat:message',
    RESERVATION_UPDATE: 'reservation:update'
  }
};
