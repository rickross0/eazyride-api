// ============================================================
// Role Hierarchy Utility
// Defines parent-child relationships for roles
// ============================================================

// Role hierarchy mapping: child role -> parent role
const ROLE_HIERARCHY = {
  RENTAL_COMPANY: 'SERVICE_PROVIDER',
  // Add more sub-roles here as needed
};

// Check if a role is a sub-role of a parent role
const isSubRoleOf = (role, parentRole) => {
  let currentRole = role;
  
  // Traverse up the hierarchy
  while (currentRole) {
    if (currentRole === parentRole) {
      return true;
    }
    currentRole = ROLE_HIERARCHY[currentRole];
  }
  
  return false;
};

// Check if user has the required role or is a sub-role of it
const hasRole = (userRole, requiredRole) => {
  // Direct match
  if (userRole === requiredRole) {
    return true;
  }
  
  // Check if userRole is a sub-role of requiredRole
  return isSubRoleOf(userRole, requiredRole);
};

// Get all roles that inherit from a parent role (including the parent)
const getInheritedRoles = (parentRole) => {
  const roles = [parentRole];
  
  for (const [child, parent] of Object.entries(ROLE_HIERARCHY)) {
    if (parent === parentRole) {
      roles.push(child);
    }
  }
  
  return roles;
};

// Get the parent role of a given role
const getParentRole = (role) => {
  return ROLE_HIERARCHY[role] || null;
};

module.exports = {
  ROLE_HIERARCHY,
  isSubRoleOf,
  hasRole,
  getInheritedRoles,
  getParentRole,
};
