export const ROLES = {
    HUB_ADMIN: 'HUB_ADMIN', // admin@cloudbaud.com
    POWER_USER: 'POWER_USER', // jish.nath@cloudbaud.com
    STANDARD: 'STANDARD'
};

export const USERS = {
    ADMIN: 'admin@cloudbaud.com',
    POWER: 'jish.nath@cloudbaud.com'
};

/**
 * Determines the role of a user based on their email.
 * @param {Object} user - The Supabase user object
 * @returns {string} - The role constant
 */
export const getUserRole = (user) => {
    if (!user || !user.email) return ROLES.STANDARD;

    const email = user.email.toLowerCase();

    if (email === USERS.ADMIN) return ROLES.HUB_ADMIN;
    if (email === USERS.POWER) return ROLES.POWER_USER;

    return ROLES.STANDARD;
};

/**
 * Checks if the current user has access to Hub Level Settings (Database migrations, etc)
 */
export const hasHubAdminAccess = (user) => {
    return getUserRole(user) === ROLES.HUB_ADMIN;
};

/**
 * Checks if user is a Power User (Can edit content, but not global settings)
 */
export const hasPowerUserAccess = (user) => {
    const role = getUserRole(user);
    return role === ROLES.HUB_ADMIN || role === ROLES.POWER_USER;
};
