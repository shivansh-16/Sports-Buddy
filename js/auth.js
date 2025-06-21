/**
 * Authentication utilities and helper functions
 * Handles user authentication state and common auth operations
 */

import { auth } from './firebase-config.js';
import { 
    onAuthStateChanged, 
    signOut as firebaseSignOut 
} from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js';
import { logAuthEvent, logError } from './logging.js';

/**
 * Check if user is authenticated and redirect if needed
 * @param {boolean} requireAuth - Whether authentication is required
 * @param {string} redirectUrl - URL to redirect to if auth check fails
 */
export function checkAuthState(requireAuth = true, redirectUrl = 'login.html') {
    return new Promise((resolve, reject) => {
        onAuthStateChanged(auth, (user) => {
            if (requireAuth && !user) {
                // User not authenticated but auth required
                window.location.href = redirectUrl;
                reject(new Error('Authentication required'));
            } else if (!requireAuth && user) {
                // User authenticated but on auth page
                window.location.href = 'dashboard.html';
                reject(new Error('Already authenticated'));
            } else {
                // Auth state matches requirement
                resolve(user);
            }
        });
    });
}

/**
 * Check if current user is admin
 * @param {Object} user - Firebase user object
 * @returns {Promise<boolean>} - Whether user is admin
 */
export async function isAdmin(user) {
    if (!user) return false;
    
    try {
        // Check for hardcoded admin email (simple approach)
        const adminEmails = ['admin@sportsbuddy.com', 'admin@test.com'];
        if (adminEmails.includes(user.email)) {
            return true;
        }
        
        // Alternative: Check user role in Firestore
        // const userDoc = await getDoc(doc(db, 'users', user.uid));
        // return userDoc.exists() && userDoc.data().role === 'admin';
        
        return false;
    } catch (error) {
        logError('Error checking admin status', error);
        return false;
    }
}

/**
 * Sign out current user
 */
export async function signOut() {
    try {
        const user = auth.currentUser;
        await firebaseSignOut(auth);
        
        logAuthEvent('logout', {
            email: user?.email,
            uid: user?.uid
        });
        
        // Redirect to home page
        window.location.href = 'index.html';
    } catch (error) {
        logError('Sign out error', error);
        throw error;
    }
}

/**
 * Get current user display name or email
 * @param {Object} user - Firebase user object
 * @returns {string} - User display name
 */
export function getUserDisplayName(user) {
    if (!user) return 'Guest';
    return user.displayName || user.email || 'User';
}

/**
 * Initialize auth state listener for protected pages
 * @param {Function} onAuthenticated - Callback when user is authenticated
 * @param {Function} onUnauthenticated - Callback when user is not authenticated
 */
export function initAuthListener(onAuthenticated, onUnauthenticated) {
    onAuthStateChanged(auth, (user) => {
        if (user) {
            onAuthenticated(user);
        } else {
            onUnauthenticated();
        }
    });
}

/**
 * Wait for auth state to be determined
 * @returns {Promise<Object|null>} - Current user or null
 */
export function waitForAuth() {
    return new Promise((resolve) => {
        const unsubscribe = onAuthStateChanged(auth, (user) => {
            unsubscribe();
            resolve(user);
        });
    });
}

/**
 * Redirect to admin panel if user is admin
 * @param {Object} user - Firebase user object
 */
export async function redirectIfAdmin(user) {
    if (await isAdmin(user)) {
        window.location.href = 'admin.html';
    }
}

// Set up global logout handler
document.addEventListener('DOMContentLoaded', () => {
    const logoutBtn = document.getElementById('logoutBtn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', async (e) => {
            e.preventDefault();
            try {
                await signOut();
            } catch (error) {
                console.error('Logout failed:', error);
            }
        });
    }
});