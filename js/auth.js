// ========================================
// THERAPY NOTES - AUTHENTICATION SCRIPT
// ========================================

// DOM Elements
const loginContainer = document.getElementById('loginContainer');
const registerContainer = document.getElementById('registerContainer');
const loginForm = document.getElementById('loginForm');
const registerForm = document.getElementById('registerForm');
const switchToRegister = document.getElementById('switchToRegister');
const switchToLogin = document.getElementById('switchToLogin');

// Password Toggle Elements
const toggleLoginPassword = document.getElementById('toggleLoginPassword');
const toggleRegisterPassword = document.getElementById('toggleRegisterPassword');
const toggleConfirmPassword = document.getElementById('toggleConfirmPassword');

const loginPasswordInput = document.getElementById('loginPassword');
const registerPasswordInput = document.getElementById('registerPassword');
const confirmPasswordInput = document.getElementById('confirmPassword');

const passwordStreng = document.getElementById('passwordStrength');

// ========================================
// SWITCH BETWEEN LOGIN & REGISTER
// ========================================

switchToRegister.addEventListener('click', () => {
    loginContainer.style.display = 'none';
    registerContainer.style.display = 'grid';
});

switchToLogin.addEventListener('click', () => {
    registerContainer.style.display = 'none';
    loginContainer.style.display = 'grid';
    resetForms();
});

// ========================================
// PASSWORD TOGGLE FUNCTIONALITY
// ========================================

const togglePassword = (button, input) => {
    button.addEventListener('click', (e) => {
        e.preventDefault();
        const type = input.type === 'password' ? 'text' : 'password';
        input.type = type;
    });
};

togglePassword(toggleLoginPassword, loginPasswordInput);
togglePassword(toggleRegisterPassword, registerPasswordInput);
togglePassword(toggleConfirmPassword, confirmPasswordInput);

// ========================================
// PASSWORD STRENGTH INDICATOR
// ========================================

const checkPasswordStrength = (password) => {
    if (password.length === 0) return '';
    
    let strength = 0;
    
    // Length check
    if (password.length >= 8) strength++;
    if (password.length >= 12) strength++;
    
    // Has uppercase
    if (/[A-Z]/.test(password)) strength++;
    
    // Has lowercase
    if (/[a-z]/.test(password)) strength++;
    
    // Has numbers
    if (/[0-9]/.test(password)) strength++;
    
    // Has special characters
    if (/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) strength++;
    
    if (strength <= 2) return 'weak';
    if (strength <= 4) return 'medium';
    return 'strong';
};

registerPasswordInput.addEventListener('input', () => {
    const strength = checkPasswordStrength(registerPasswordInput.value);
    const strengthDisplay = document.getElementById('passwordStrength');
    
    if (registerPasswordInput.value.length > 0) {
        strengthDisplay.classList.add('show');
        strengthDisplay.className = `password-strength show ${strength}`;
    } else {
        strengthDisplay.classList.remove('show');
    }
});

// ========================================
// FORM VALIDATION
// ========================================

const validateEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
};

const validatePassword = (password) => {
    return password.length >= 8;
};

const validateName = (name) => {
    return name.trim().length >= 2;
};

const validateID = (id) => {
    return id.trim().length >= 3;
};

const showError = (input, errorElement, message) => {
    input.classList.add('error');
    errorElement.textContent = message;
    errorElement.classList.add('show');
};

const clearError = (input, errorElement) => {
    input.classList.remove('error');
    errorElement.textContent = '';
    errorElement.classList.remove('show');
};

// ========================================
// LOGIN FORM HANDLING
// ========================================

loginForm.addEventListener('submit', (e) => {
    e.preventDefault();
    
    const email = document.getElementById('loginEmail');
    const password = document.getElementById('loginPassword');
    const emailError = document.getElementById('emailError');
    const passwordError = document.getElementById('passwordError');
    
    let isValid = true;
    
    // Validate email
    if (!email.value.trim()) {
        showError(email, emailError, 'Email is required');
        isValid = false;
    } else if (!validateEmail(email.value)) {
        showError(email, emailError, 'Please enter a valid email');
        isValid = false;
    } else {
        clearError(email, emailError);
    }
    
    // Validate password
    if (!password.value.trim()) {
        showError(password, passwordError, 'Password is required');
        isValid = false;
    } else if (!validatePassword(password.value)) {
        showError(password, passwordError, 'Password must be at least 8 characters');
        isValid = false;
    } else {
        clearError(password, passwordError);
    }
    
    if (isValid) {
        // Here you would normally send the data to your backend
        console.log('Login Form Data:', {
            email: email.value,
            password: password.value
        });
        
        // Show success message
        alert('✓ Login form is valid!\n\nEmail: ' + email.value + '\n\nIn production, this would authenticate with the backend.');
        
        // Optional: Reset form
        // loginForm.reset();
    }
});

// ========================================
// REGISTER FORM HANDLING
// ========================================

registerForm.addEventListener('submit', (e) => {
    e.preventDefault();
    
    const name = document.getElementById('registerName');
    const email = document.getElementById('registerEmail');
    const id = document.getElementById('registerId');
    const password = document.getElementById('registerPassword');
    const confirmPassword = document.getElementById('confirmPassword');
    const termsCheckbox = document.querySelector('input[name="terms"]');
    
    const nameError = document.getElementById('nameError');
    const emailError = document.getElementById('registerEmailError');
    const idError = document.getElementById('idError');
    const passwordError = document.getElementById('registerPasswordError');
    const confirmError = document.getElementById('confirmError');
    
    let isValid = true;
    
    // Validate name
    if (!name.value.trim()) {
        showError(name, nameError, 'Name is required');
        isValid = false;
    } else if (!validateName(name.value)) {
        showError(name, nameError, 'Name must be at least 2 characters');
        isValid = false;
    } else {
        clearError(name, nameError);
    }
    
    // Validate email
    if (!email.value.trim()) {
        showError(email, emailError, 'Email is required');
        isValid = false;
    } else if (!validateEmail(email.value)) {
        showError(email, emailError, 'Please enter a valid email');
        isValid = false;
    } else {
        clearError(email, emailError);
    }
    
    // Validate ID
    if (!id.value.trim()) {
        showError(id, idError, 'Professional ID is required');
        isValid = false;
    } else if (!validateID(id.value)) {
        showError(id, idError, 'Professional ID must be at least 3 characters');
        isValid = false;
    } else {
        clearError(id, idError);
    }
    
    // Validate password
    if (!password.value.trim()) {
        showError(password, passwordError, 'Password is required');
        isValid = false;
    } else if (!validatePassword(password.value)) {
        showError(password, passwordError, 'Password must be at least 8 characters');
        isValid = false;
    } else {
        clearError(password, passwordError);
    }
    
    // Validate confirm password
    if (!confirmPassword.value.trim()) {
        showError(confirmPassword, confirmError, 'Please confirm your password');
        isValid = false;
    } else if (password.value !== confirmPassword.value) {
        showError(confirmPassword, confirmError, 'Passwords do not match');
        isValid = false;
    } else {
        clearError(confirmPassword, confirmError);
    }
    
    // Validate terms checkbox
    if (!termsCheckbox.checked) {
        alert('Please agree to the Terms of Service and Privacy Policy');
        isValid = false;
    }
    
    if (isValid) {
        // Here you would normally send the data to your backend
        console.log('Register Form Data:', {
            name: name.value,
            email: email.value,
            id: id.value,
            password: password.value
        });
        
        // Show success message
        alert('✓ Registration form is valid!\n\nName: ' + name.value + '\nEmail: ' + email.value + '\nProf. ID: ' + id.value + '\n\nIn production, this would create your account.');
        
        // Optional: Reset form and switch to login
        registerForm.reset();
        passwordStreng.classList.remove('show');
        // switchToLogin.click();
    }
});

// ========================================
// CLEAR ERRORS ON INPUT
// ========================================

document.getElementById('loginEmail').addEventListener('input', function() {
    if (this.classList.contains('error')) {
        clearError(this, document.getElementById('emailError'));
    }
});

document.getElementById('loginPassword').addEventListener('input', function() {
    if (this.classList.contains('error')) {
        clearError(this, document.getElementById('passwordError'));
    }
});

document.getElementById('registerName').addEventListener('input', function() {
    if (this.classList.contains('error')) {
        clearError(this, document.getElementById('nameError'));
    }
});

document.getElementById('registerEmail').addEventListener('input', function() {
    if (this.classList.contains('error')) {
        clearError(this, document.getElementById('registerEmailError'));
    }
});

document.getElementById('registerId').addEventListener('input', function() {
    if (this.classList.contains('error')) {
        clearError(this, document.getElementById('idError'));
    }
});

document.getElementById('registerPassword').addEventListener('input', function() {
    if (this.classList.contains('error')) {
        clearError(this, document.getElementById('registerPasswordError'));
    }
});

document.getElementById('confirmPassword').addEventListener('input', function() {
    if (this.classList.contains('error')) {
        clearError(this, document.getElementById('confirmError'));
    }
});

// ========================================
// RESET FORMS
// ========================================

const resetForms = () => {
    loginForm.reset();
    registerForm.reset();
    
    // Clear all errors
    document.querySelectorAll('.error-message').forEach(element => {
        element.classList.remove('show');
        element.textContent = '';
    });
    
    document.querySelectorAll('.form-group input').forEach(input => {
        input.classList.remove('error');
    });
    
    document.getElementById('passwordStrength').classList.remove('show');
};

// ========================================
// ENTER KEY SUBMISSION
// ========================================

loginForm.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
        loginForm.dispatchEvent(new Event('submit'));
    }
});

registerForm.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
        registerForm.dispatchEvent(new Event('submit'));
    }
});

console.log('✓ Therapy Notes Authentication System Loaded');
