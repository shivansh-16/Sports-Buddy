/**
 * Utility functions for logging application events
 * Provides structured logging with timestamps and context
 */

/**
 * Log an action with timestamp and structured data
 * @param {string} action - Description of the action
 * @param {Object} data - Additional data context
 */
export function logAction(action, data = {}) {
    const timestamp = new Date().toISOString();
    const logEntry = {
        timestamp,
        action,
        data,
        userAgent: navigator.userAgent,
        url: window.location.href
    };
    
    console.log(`[${timestamp}] ${action}:`, data);
    
    // In a production environment, you might want to send logs to a service
    // sendToLoggingService(logEntry);
}

/**
 * Log user authentication events
 * @param {string} event - Auth event type (login, logout, register, etc.)
 * @param {Object} userData - User data (without sensitive info)
 */
export function logAuthEvent(event, userData = {}) {
    logAction(`User ${event}`, {
        email: userData.email,
        uid: userData.uid,
        timestamp: userData.timestamp || new Date().toISOString()
    });
}

/**
 * Log database operations
 * @param {string} operation - Database operation (create, read, update, delete)
 * @param {string} collection - Firestore collection name
 * @param {Object} data - Operation data
 */
export function logDatabaseOperation(operation, collection, data = {}) {
    logAction(`Database ${operation} - ${collection}`, {
        collection,
        operation,
        documentId: data.id,
        data: data
    });
}

/**
 * Log admin actions
 * @param {string} action - Admin action description
 * @param {Object} data - Action data
 */
export function logAdminAction(action, data = {}) {
    logAction(`Admin: ${action}`, {
        adminAction: true,
        ...data
    });
}

/**
 * Log user events and interactions
 * @param {string} event - Event description
 * @param {Object} data - Event data
 */
export function logUserEvent(event, data = {}) {
    logAction(`User Event: ${event}`, data);
}

/**
 * Log errors with context
 * @param {string} error - Error description
 * @param {Error} errorObj - Error object
 * @param {Object} context - Additional context
 */
export function logError(error, errorObj = null, context = {}) {
    const errorData = {
        error,
        message: errorObj?.message,
        stack: errorObj?.stack,
        ...context
    };
    
    console.error(`[${new Date().toISOString()}] ERROR: ${error}`, errorData);
    logAction(`Error: ${error}`, errorData);
}

/**
 * Log performance metrics
 * @param {string} metric - Metric name
 * @param {number} value - Metric value
 * @param {Object} context - Additional context
 */
export function logPerformance(metric, value, context = {}) {
    logAction(`Performance: ${metric}`, {
        metric,
        value,
        unit: context.unit || 'ms',
        ...context
    });
}