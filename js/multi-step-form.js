/**
 * Multi-step form functionality for event creation
 * Handles step navigation and form validation
 */

let currentStep = 1;
const totalSteps = 4;

/**
 * Initialize multi-step form
 */
export function initMultiStepForm() {
    setupStepNavigation();
    updateStepDisplay();
}

/**
 * Setup step navigation event listeners
 */
function setupStepNavigation() {
    const nextBtn = document.getElementById('nextStep');
    const prevBtn = document.getElementById('prevStep');
    const submitBtn = document.getElementById('submitEvent');
    
    if (nextBtn) {
        nextBtn.addEventListener('click', handleNextStep);
    }
    
    if (prevBtn) {
        prevBtn.addEventListener('click', handlePrevStep);
    }
    
    // Reset form when modal opens
    const createEventBtn = document.getElementById('createEventBtn');
    if (createEventBtn) {
        createEventBtn.addEventListener('click', resetForm);
    }
    
    const closeModal = document.getElementById('closeModal');
    const cancelEvent = document.getElementById('cancelEvent');
    
    if (closeModal) closeModal.addEventListener('click', resetForm);
    if (cancelEvent) cancelEvent.addEventListener('click', resetForm);
}

/**
 * Handle next step
 */
function handleNextStep() {
    if (validateCurrentStep()) {
        if (currentStep < totalSteps) {
            currentStep++;
            updateStepDisplay();
            showToast('✅ Step completed!', 'success');
        }
    }
}

/**
 * Handle previous step
 */
function handlePrevStep() {
    if (currentStep > 1) {
        currentStep--;
        updateStepDisplay();
    }
}

/**
 * Reset form to first step
 */
function resetForm() {
    currentStep = 1;
    updateStepDisplay();
    
    // Reset form fields
    const form = document.getElementById('createEventForm');
    if (form) {
        form.reset();
        
        // Reset dropdowns
        const citySelect = document.getElementById('city');
        const customCityGroup = document.getElementById('customCityGroup');
        
        if (citySelect) {
            citySelect.innerHTML = '<option value="">Select State First</option>';
        }
        
        if (customCityGroup) {
            customCityGroup.style.display = 'none';
        }
    }
}

/**
 * Update step display
 */
function updateStepDisplay() {
    // Update step indicators
    document.querySelectorAll('.step').forEach((step, index) => {
        const stepNumber = index + 1;
        step.classList.remove('active', 'completed');
        
        if (stepNumber === currentStep) {
            step.classList.add('active');
        } else if (stepNumber < currentStep) {
            step.classList.add('completed');
        }
    });
    
    // Update form steps
    document.querySelectorAll('.form-step').forEach((step, index) => {
        const stepNumber = index + 1;
        step.classList.remove('active');
        
        if (stepNumber === currentStep) {
            step.classList.add('active');
        }
    });
    
    // Update navigation buttons
    const nextBtn = document.getElementById('nextStep');
    const prevBtn = document.getElementById('prevStep');
    const submitBtn = document.getElementById('submitEvent');
    
    if (prevBtn) {
        prevBtn.style.display = currentStep > 1 ? 'inline-flex' : 'none';
    }
    
    if (nextBtn && submitBtn) {
        if (currentStep === totalSteps) {
            nextBtn.style.display = 'none';
            submitBtn.style.display = 'inline-flex';
        } else {
            nextBtn.style.display = 'inline-flex';
            submitBtn.style.display = 'none';
        }
    }
}

/**
 * Validate current step
 */
function validateCurrentStep() {
    const currentStepElement = document.querySelector(`.form-step[data-step="${currentStep}"]`);
    if (!currentStepElement) return false;
    
    const requiredFields = currentStepElement.querySelectorAll('[required]');
    let isValid = true;
    
    requiredFields.forEach(field => {
        if (!field.value.trim()) {
            isValid = false;
            field.style.borderColor = 'var(--error)';
            
            // Show error message
            showToast(`❌ Please fill in all required fields`, 'error');
            
            // Reset border color after animation
            setTimeout(() => {
                field.style.borderColor = '';
            }, 2000);
        } else {
            field.style.borderColor = '';
        }
    });
    
    // Special validation for step 2 (location)
    if (currentStep === 2) {
        const citySelect = document.getElementById('city');
        const customCityInput = document.getElementById('customCity');
        
        if (citySelect && citySelect.value === 'Other') {
            if (!customCityInput || !customCityInput.value.trim()) {
                isValid = false;
                if (customCityInput) {
                    customCityInput.style.borderColor = 'var(--error)';
                }
                showToast('❌ Please enter your city name', 'error');
            }
        }
    }
    
    return isValid;
}

/**
 * Show toast notification
 */
function showToast(message, type = 'success') {
    // Remove existing toasts
    const existingToasts = document.querySelectorAll('.toast');
    existingToasts.forEach(toast => toast.remove());
    
    // Create new toast
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    toast.textContent = message;
    
    document.body.appendChild(toast);
    
    // Show toast
    setTimeout(() => {
        toast.classList.add('show');
    }, 100);
    
    // Hide toast after 3 seconds
    setTimeout(() => {
        toast.classList.remove('show');
        setTimeout(() => {
            toast.remove();
        }, 300);
    }, 3000);
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', initMultiStepForm);