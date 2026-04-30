// ============================================================
// Role-Based Access Control Middleware
// ============================================================

const { AppError } = require('./errorHandler');

// Check if user has required role(s)
const requireRole = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return next(new AppError('Authentication required', 401));
    }

    if (!roles.includes(req.user.role)) {
      return next(new AppError('You do not have permission to perform this action', 403));
    }

    next();
  };
};

// Check if admin has required admin role(s)
const requireAdminRole = (...adminRoles) => {
  return (req, res, next) => {
    if (!req.user) {
      return next(new AppError('Authentication required', 401));
    }

    if (req.user.role !== 'ADMIN') {
      return next(new AppError('Admin access required', 403));
    }

    const userAdminRole = req.user.adminProfile?.adminRole;
    if (!userAdminRole || !adminRoles.includes(userAdminRole)) {
      return next(new AppError('Insufficient admin permissions', 403));
    }

    next();
  };
};

// Check ownership (for users accessing their own data)
const requireOwnership = (paramField = 'id') => {
  return (req, res, next) => {
    if (!req.user) {
      return next(new AppError('Authentication required', 401));
    }

    // Super admins can access anything
    if (req.user.adminProfile?.adminRole === 'SUPER_ADMIN') {
      return next();
    }

    const resourceUserId = req.params[paramField] || req.body.userId;
    
    if (req.user.id !== resourceUserId) {
      return next(new AppError('You can only access your own resources', 403));
    }

    next();
  };
};

// Permission constants for admin features
const PERMISSIONS = {
  // CARE+ permissions
  VIEW_USERS: ['CARE', 'MANAGER', 'SUPER_ADMIN'],
  VIEW_DRIVERS: ['CARE', 'MANAGER', 'SUPER_ADMIN'],
  VIEW_RIDES: ['CARE', 'MANAGER', 'SUPER_ADMIN'],
  VIEW_ORDERS: ['CARE', 'MANAGER', 'SUPER_ADMIN'],
  APPROVE_DRIVERS: ['CARE', 'MANAGER', 'SUPER_ADMIN'],
  SUSPEND_USERS: ['CARE', 'MANAGER', 'SUPER_ADMIN'],
  VIEW_PAYOUTS: ['CARE', 'MANAGER', 'SUPER_ADMIN'],
  APPROVE_PAYOUTS_SMALL: ['CARE', 'MANAGER', 'SUPER_ADMIN'],
  VIEW_SOS: ['CARE', 'MANAGER', 'SUPER_ADMIN'],
  RESOLVE_SOS: ['CARE', 'MANAGER', 'SUPER_ADMIN'],

  // MANAGER+ permissions
  VIEW_RESTAURANTS: ['MANAGER', 'SUPER_ADMIN'],
  VIEW_PROVIDERS: ['MANAGER', 'SUPER_ADMIN'],
  APPROVE_PROVIDERS: ['MANAGER', 'SUPER_ADMIN'],
  UPDATE_PROVIDER_CATEGORY: ['MANAGER', 'SUPER_ADMIN'],
  VERIFY_CARS: ['MANAGER', 'SUPER_ADMIN'],
  VIEW_REPORTS: ['MANAGER', 'SUPER_ADMIN'],
  GENERATE_REPORTS: ['MANAGER', 'SUPER_ADMIN'],
  VIEW_HEATMAP: ['MANAGER', 'SUPER_ADMIN'],
  MANAGE_SETTINGS: ['MANAGER', 'SUPER_ADMIN'],
  APPROVE_PAYOUTS_MEDIUM: ['MANAGER', 'SUPER_ADMIN'],

  // SUPER_ADMIN only
  VIEW_PRICING: ['SUPER_ADMIN'],
  SET_PRICING: ['SUPER_ADMIN'],
  SET_COMMISSIONS: ['SUPER_ADMIN'],
  MANAGE_SURGE_ZONES: ['SUPER_ADMIN'],
  MANAGE_FEATURE_TOGGLES: ['SUPER_ADMIN'],
  MANAGE_STAFF: ['SUPER_ADMIN'],
  MANAGE_CUSTOM_ROLES: ['SUPER_ADMIN'],
  VIEW_AUDIT_LOG: ['SUPER_ADMIN'],
  UPDATE_TERMS: ['SUPER_ADMIN'],
  UPDATE_SUPPORT: ['SUPER_ADMIN'],
  MASTER_LOGIN: ['SUPER_ADMIN'],
  DELETE_USERS: ['SUPER_ADMIN'],
  CHANGE_ROLES: ['SUPER_ADMIN'],
  RESET_PASSWORD: ['SUPER_ADMIN'],
  APPROVE_PAYOUTS_LARGE: ['SUPER_ADMIN']
};

const requirePermission = (permission) => {
  return (req, res, next) => {
    if (!req.user || req.user.role !== 'ADMIN') {
      return next(new AppError('Admin access required', 403));
    }

    const adminRole = req.user.adminProfile?.adminRole;
    const allowedRoles = PERMISSIONS[permission];

    if (!allowedRoles || !allowedRoles.includes(adminRole)) {
      return next(new AppError('Insufficient permissions', 403));
    }

    next();
  };
};

module.exports = { 
  requireRole, 
  requireAdminRole, 
  requireOwnership, 
  requirePermission,
  PERMISSIONS 
};
