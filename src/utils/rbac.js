/**
 * ROLE-BASED ACCESS CONTROL (RBAC) UTILITIES
 * 
 * Provides centralized logic for checking user permissions.
 * Roles are now primarily driven by the `public.profiles` table in Supabase.
 */

export const ROLES = {
    TENANT_ADMIN: 'tenant-admin',   // Full app-level control
    CLIENT_ADMIN: 'client-admin',   // Cross-tenant control (admin@cloudbaud.com)
    USER: 'user',                   // Standard user
    GUEST: 'guest',                 // Read-only or restricted
    
    // Legacy mapping for backward compatibility
    HUB_ADMIN: 'tenant-admin',
    POWER_USER: 'tenant-admin' 
};

export const USERS = {
    ADMIN: 'admin@cloudbaud.com',
    POWER: 'jish.nath@cloudbaud.com'
};

/**
 * Determines the role of a user.
 * Prioritizes database role from profiles table (merged into user object in AuthContext).
 * 
 * @param {Object} user - The Supabase user object (expected to have profile fields)
 * @returns {string} - The role string
 */
export const getUserRole = (user) => {
    if (!user) return ROLES.GUEST;

    // 1. Check for DB-backed role first (from profiles table)
    if (user.role) {
        return user.role;
    }

    // 2. Fallback to hardcoded email checks (Legacy/Initial Setup)
    const email = user.email?.toLowerCase();
    if (email === USERS.ADMIN) return ROLES.CLIENT_ADMIN;
    if (email === USERS.POWER) return ROLES.TENANT_ADMIN;

    return ROLES.USER;
};

/**
 * Checks if the current user has access to Hub/Tenant level settings.
 */
export const hasHubAdminAccess = (user) => {
    const role = getUserRole(user);
    return role === ROLES.TENANT_ADMIN || role === ROLES.CLIENT_ADMIN;
};

/**
 * Checks if user is at least a Power User.
 */
export const hasPowerUserAccess = (user) => {
    const role = getUserRole(user);
    // In the new system, Tenant Admins are basically Power Users+
    return role === ROLES.TENANT_ADMIN || role === ROLES.CLIENT_ADMIN || role === ROLES.USER;
};
