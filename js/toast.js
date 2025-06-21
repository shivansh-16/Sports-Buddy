/**
 * Toast notification system
 * Provides user feedback with styled notifications
 */

/**
 * Show toast notification
 * @param {string} message - Message to display
 * @param {string} type - Toast type (success, error, warning, info)
 * @param {number} duration - Duration in milliseconds
 */
export function showToast(message, type = 'success', duration = 3000) {
    // Remove existing toasts
    const existingToasts = document.querySelectorAll('.toast');
    existingToasts.forEach(toast => {
        toast.classList.remove('show');
        setTimeout(() => toast.remove(), 300);
    });
    
    // Create new toast
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    
    // Add icon based on type
    const icons = {
        success: '✅',
        error: '❌',
        warning: '⚠️',
        info: 'ℹ️'
    };
    
    toast.innerHTML = `
        <span style="margin-right: 8px; font-size: 1.2em;">${icons[type] || icons.info}</span>
        <span>${message}</span>
    `;
    
    document.body.appendChild(toast);
    
    // Show toast with animation
    requestAnimationFrame(() => {
        toast.classList.add('show');
    });
    
    // Auto-hide toast
    setTimeout(() => {
        toast.classList.remove('show');
        setTimeout(() => {
            if (toast.parentNode) {
                toast.remove();
            }
        }, 300);
    }, duration);
    
    return toast;
}

/**
 * Show success toast
 */
export function showSuccess(message, duration = 3000) {
    return showToast(message, 'success', duration);
}

/**
 * Show error toast
 */
export function showError(message, duration = 4000) {
    return showToast(message, 'error', duration);
}

/**
 * Show warning toast
 */
export function showWarning(message, duration = 3500) {
    return showToast(message, 'warning', duration);
}

/**
 * Show info toast
 */
export function showInfo(message, duration = 3000) {
    return showToast(message, 'info', duration);
}

// Make functions available globally
window.showToast = showToast;
window.showSuccess = showSuccess;
window.showError = showError;
window.showWarning = showWarning;
window.showInfo = showInfo;