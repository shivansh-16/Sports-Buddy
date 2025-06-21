/**
 * User registration functionality
 * Handles user sign up with email and password
 */

import { auth, db } from './firebase-config.js';
import { 
    createUserWithEmailAndPassword, 
    updateProfile 
} from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js';
import { 
    doc, 
    setDoc 
} from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js';
import { checkAuthState } from './auth.js';
import { logAuthEvent, logError, logDatabaseOperation } from './logging.js';

/**
 * Initialize registration page
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
 * Set up event listeners for registration form
 */
function setupEventListeners() {
    const registerForm = document.getElementById('registerForm');
    const registerBtn = document.getElementById('registerBtn');
    
    if (registerForm) {
        registerForm.addEventListener('submit', handleRegistration);
    }
    
    // Real-time password validation
    const passwordInput = document.getElementById('password');
    const confirmPasswordInput = document.getElementById('confirmPassword');
    
    if (confirmPasswordInput) {
        confirmPasswordInput.addEventListener('input', validatePasswordMatch);
    }
    
    if (passwordInput) {
        passwordInput.addEventListener('input', validatePasswordStrength);
    }
}

/**
 * Handle user registration form submission
 * @param {Event} event - Form submit event
 */
async function handleRegistration(event) {
    event.preventDefault();
    
    const registerBtn = document.getElementById('registerBtn');
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
    registerBtn.disabled = true;
    registerBtn.textContent = 'Creating Account...';
    
    try {
        // Create user account
        const userCredential = await createUserWithEmailAndPassword(
            auth,
            formData.get('email'),
            formData.get('password')
        );
        
        const user = userCredential.user;
        
        // Update user profile with display name
        await updateProfile(user, {
            displayName: formData.get('name')
        });
        
        // Save user data to Firestore
        await setDoc(doc(db, 'users', user.uid), {
            name: formData.get('name'),
            email: formData.get('email'),
            role: 'user',
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
        });
        
        // Log successful registration
        logAuthEvent('register', {
            email: user.email,
            uid: user.uid,
            name: formData.get('name')
        });
        
        logDatabaseOperation('create', 'users', {
            id: user.uid,
            email: user.email,
            name: formData.get('name')
        });
        
        // Redirect to dashboard
        window.location.href = 'dashboard.html';
        
    } catch (error) {
        logError('Registration failed', error, { email: formData.get('email') });
        handleRegistrationError(error);
    } finally {
        // Re-enable submit button
        registerBtn.disabled = false;
        registerBtn.textContent = 'Create Account';
    }
}

/**
 * Validate registration form data
 * @param {FormData} formData - Form data to validate
 * @returns {Array} - Array of validation errors
 */
function validateForm(formData) {
    const errors = [];
    
    const name = formData.get('name');
    const email = formData.get('email');
    const password = formData.get('password');
    const confirmPassword = formData.get('confirmPassword');
    
    // Name validation
    if (!name || name.trim().length < 2) {
        errors.push({ field: 'name', message: 'Name must be at least 2 characters long' });
    }
    
    // Email validation
    if (!email || !isValidEmail(email)) {
        errors.push({ field: 'email', message: 'Please enter a valid email address' });
    }
    
    // Password validation
    if (!password || password.length < 6) {
        errors.push({ field: 'password', message: 'Password must be at least 6 characters long' });
    }
    
    // Password confirmation validation
    if (password !== confirmPassword) {
        errors.push({ field: 'confirmPassword', message: 'Passwords do not match' });
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
 * Validate password strength in real-time
 */
function validatePasswordStrength() {
    const passwordInput = document.getElementById('password');
    const passwordError = document.getElementById('passwordError');
    
    if (passwordInput.value.length > 0 && passwordInput.value.length < 6) {
        passwordError.textContent = 'Password must be at least 6 characters long';
    } else {
        passwordError.textContent = '';
    }
}

/**
 * Validate password match in real-time
 */
function validatePasswordMatch() {
    const passwordInput = document.getElementById('password');
    const confirmPasswordInput = document.getElementById('confirmPassword');
    const confirmPasswordError = document.getElementById('confirmPasswordError');
    
    if (confirmPasswordInput.value.length > 0 && 
        passwordInput.value !== confirmPasswordInput.value) {
        confirmPasswordError.textContent = 'Passwords do not match';
    } else {
        confirmPasswordError.textContent = '';
    }
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
 * Handle registration errors from Firebase
 * @param {Object} error - Firebase error object
 */
function handleRegistrationError(error) {
    let errorMessage = 'Registration failed. Please try again.';
    let errorField = 'email';
    
    switch (error.code) {
        case 'auth/email-already-in-use':
            errorMessage = 'This email is already registered. Please use a different email or try logging in.';
            break;
        case 'auth/invalid-email':
            errorMessage = 'Please enter a valid email address.';
            break;
        case 'auth/weak-password':
            errorMessage = 'Password is too weak. Please choose a stronger password.';
            errorField = 'password';
            break;
        case 'auth/network-request-failed':
            errorMessage = 'Network error. Please check your connection and try again.';
            break;
        default:
            console.error('Registration error:', error);
    }
    
    const errorElement = document.getElementById(`${errorField}Error`);
    if (errorElement) {
        errorElement.textContent = errorMessage;
    }
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', init);