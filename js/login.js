/**
 * User login functionality
 * Handles user authentication with email and password
 */

import { auth } from './firebase-config.js';
import { 
    signInWithEmailAndPassword 
} from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js';
import { checkAuthState, isAdmin } from './auth.js';
import { logAuthEvent, logError } from './logging.js';

/**
 * Initialize login page
 */
async function init() {
    try {
        // Redirect if already authenticated
        await checkAuthState(false);
    } catch (error) {
        // Expected when user is not authenticated
    }
    
    setupEventListeners();
}

/**
 * Set up event listeners for login form
 */
function setupEventListeners() {
    const loginForm = document.getElementById('loginForm');
    
    if (loginForm) {
        loginForm.addEventListener('submit', handleLogin);
    }
}

/**
 * Handle user login form submission
 * @param {Event} event - Form submit event
 */
async function handleLogin(event) {
    event.preventDefault();
    
    const loginBtn = document.getElementById('loginBtn');
    const form = event.target;
    const formData = new FormData(form);
    
    // Clear previous errors
    clearErrors();
    
    // Validate form data
    const validationErrors = validateForm(formData);
    if (validationErrors.length > 0) {
        displayErrors(validationErrors);
        return;
    }
    
    // Disable submit button
    loginBtn.disabled = true;
    loginBtn.textContent = 'Signing In...';
    
    try {
        // Sign in user
        const userCredential = await signInWithEmailAndPassword(
            auth,
            formData.get('email'),
            formData.get('password')
        );
        
        const user = userCredential.user;
        
        // Log successful login
        logAuthEvent('login', {
            email: user.email,
            uid: user.uid
        });
        
        // Check if user is admin and redirect accordingly
        if (await isAdmin(user)) {
            logAuthEvent('admin_login', {
                email: user.email,
                uid: user.uid
            });
            window.location.href = 'admin.html';
        } else {
            window.location.href = 'dashboard.html';
        }
        
    } catch (error) {
        logError('Login failed', error, { email: formData.get('email') });
        handleLoginError(error);
    } finally {
        // Re-enable submit button
        loginBtn.disabled = false;
        loginBtn.textContent = 'Sign In';
    }
}

/**
 * Validate login form data
 * @param {FormData} formData - Form data to validate
 * @returns {Array} - Array of validation errors
 */
function validateForm(formData) {
    const errors = [];
    
    const email = formData.get('email');
    const password = formData.get('password');
    
    // Email validation
    if (!email || !isValidEmail(email)) {
        errors.push({ field: 'email', message: 'Please enter a valid email address' });
    }
    
    // Password validation
    if (!password || password.length < 1) {
        errors.push({ field: 'password', message: 'Please enter your password' });
    }
    
    return errors;
}

/**
 * Validate email format
 * @param {string} email - Email to validate
 * @returns {boolean} - Whether email is valid
 */
function isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}

/**
 * Display validation errors
 * @param {Array} errors - Array of error objects
 */
function displayErrors(errors) {
    errors.forEach(error => {
        const errorElement = document.getElementById(`${error.field}Error`);
        if (errorElement) {
            errorElement.textContent = error.message;
        }
    });
}

/**
 * Clear all error messages
 */
function clearErrors() {
    const errorElements = document.querySelectorAll('.error-message');
    errorElements.forEach(element => {
        element.textContent = '';
    });
}

/**
 * Handle login errors from Firebase
 * @param {Object} error - Firebase error object
 */
function handleLoginError(error) {
    let errorMessage = 'Login failed. Please try again.';
    let errorField = 'email';
    
    switch (error.code) {
        case 'auth/user-not-found':
            errorMessage = 'No account found with this email address.';
            break;
        case 'auth/wrong-password':
            errorMessage = 'Incorrect password. Please try again.';
            errorField = 'password';
            break;
        case 'auth/invalid-email':
            errorMessage = 'Please enter a valid email address.';
            break;
        case 'auth/user-disabled':
            errorMessage = 'This account has been disabled. Please contact support.';
            break;
        case 'auth/too-many-requests':
            errorMessage = 'Too many failed attempts. Please try again later.';
            break;
        case 'auth/network-request-failed':
            errorMessage = 'Network error. Please check your connection and try again.';
            break;
        default:
            console.error('Login error:', error);
    }
    
    const errorElement = document.getElementById(`${errorField}Error`);
    if (errorElement) {
        errorElement.textContent = errorMessage;
    }
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', init);