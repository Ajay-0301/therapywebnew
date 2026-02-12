// ========================================
// THERAPY NOTES - AUTHENTICATION SCRIPT (TypeScript)
// ========================================

// Type definitions
interface UserData {
    email: string;
    name: string;
    id?: string;
    registeredAt: string;
}

type PasswordStrength = 'weak' | 'medium' | 'strong' | '';

// DOM Elements
const loginContainer = document.getElementById('loginContainer')! as HTMLDivElement;
const registerContainer = document.getElementById('registerContainer')! as HTMLDivElement;
const loginForm = document.getElementById('loginForm')! as HTMLFormElement;
const registerForm = document.getElementById('registerForm')! as HTMLFormElement;
const switchToRegister = document.getElementById('switchToRegister')! as HTMLButtonElement;
const switchToLogin = document.getElementById('switchToLogin')! as HTMLButtonElement;

// Password Toggle Elements
const toggleLoginPassword = document.getElementById('toggleLoginPassword')! as HTMLButtonElement;
const toggleRegisterPassword = document.getElementById('toggleRegisterPassword')! as HTMLButtonElement;
const toggleConfirmPassword = document.getElementById('toggleConfirmPassword')! as HTMLButtonElement;

const loginPasswordInput = document.getElementById('loginPassword')! as HTMLInputElement;
const registerPasswordInput = document.getElementById('registerPassword')! as HTMLInputElement;
const confirmPasswordInput = document.getElementById('confirmPassword')! as HTMLInputElement;

const passwordStrengthElement = document.getElementById('passwordStrength')! as HTMLDivElement;

// ========================================
// SWITCH BETWEEN LOGIN & REGISTER
// ========================================

switchToRegister.addEventListener('click', (): void => {
    loginContainer.style.display = 'none';
    registerContainer.style.display = 'grid';
});

switchToLogin.addEventListener('click', (): void => {
    registerContainer.style.display = 'none';
    loginContainer.style.display = 'grid';
    resetForms();
});

// ========================================
// PASSWORD TOGGLE FUNCTIONALITY
// ========================================

const togglePassword = (button: HTMLButtonElement, input: HTMLInputElement): void => {
    button.addEventListener('click', (e: MouseEvent): void => {
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

const checkPasswordStrength = (password: string): PasswordStrength => {
    if (password.length === 0) return '';
    
    let strength: number = 0;
    
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

registerPasswordInput.addEventListener('input', (): void => {
    const strength: PasswordStrength = checkPasswordStrength(registerPasswordInput.value);
    const strengthDisplay = document.getElementById('passwordStrength') as HTMLDivElement;
    
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

const validateEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
};

const validatePassword = (password: string): boolean => {
    return password.length >= 8;
};

const validateName = (name: string): boolean => {
    return name.trim().length >= 2;
};

const validateID = (id: string): boolean => {
    return id.trim().length >= 3;
};

const showError = (input: HTMLInputElement, errorElement: HTMLElement, message: string): void => {
    input.classList.add('error');
    errorElement.textContent = message;
    errorElement.classList.add('show');
};

const clearError = (input: HTMLInputElement, errorElement: HTMLElement): void => {
    input.classList.remove('error');
    errorElement.textContent = '';
    errorElement.classList.remove('show');
};

// ========================================
// SUCCESS MESSAGE (for auth pages)
// ========================================

const displaySuccessMessage = (): void => {
    const modal = document.getElementById('successModal') as HTMLElement;
    if (modal) {
        modal.classList.add('show');
    }
};

// ========================================
// LOGIN FORM HANDLING
// ========================================

loginForm.addEventListener('submit', (e: SubmitEvent): void => {
    e.preventDefault();
    
    const email = document.getElementById('loginEmail') as HTMLInputElement;
    const password = document.getElementById('loginPassword') as HTMLInputElement;
    const emailError = document.getElementById('emailError') as HTMLElement;
    const passwordError = document.getElementById('passwordError') as HTMLElement;
    
    let isValid: boolean = true;
    
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
        // Check if it's demo login
        const isDemoLogin: boolean = email.value === 'demo@therapy.com' && password.value === 'Demo@12345';
        
        // Save user data to localStorage
        const userData: UserData = {
            email: email.value,
            name: isDemoLogin ? 'Dr. Demo Therapist' : 'Dr. ' + email.value.split('@')[0],
            registeredAt: new Date().toISOString()
        };
        
        localStorage.setItem('userData', JSON.stringify(userData));
        
        // Show success message
        displaySuccessMessage();
        
        // Redirect to dashboard
        setTimeout((): void => {
            window.location.href = 'dashboard.html';
        }, 2000);
    }
});

// ========================================
// REGISTER FORM HANDLING
// ========================================

registerForm.addEventListener('submit', (e: SubmitEvent): void => {
    e.preventDefault();
    
    const name = document.getElementById('registerName') as HTMLInputElement;
    const email = document.getElementById('registerEmail') as HTMLInputElement;
    const id = document.getElementById('registerId') as HTMLInputElement;
    const password = document.getElementById('registerPassword') as HTMLInputElement;
    const confirmPassword = document.getElementById('confirmPassword') as HTMLInputElement;
    const termsCheckbox = document.querySelector('input[name="terms"]') as HTMLInputElement;
    
    const nameError = document.getElementById('nameError') as HTMLElement;
    const emailError = document.getElementById('registerEmailError') as HTMLElement;
    const idError = document.getElementById('idError') as HTMLElement;
    const passwordError = document.getElementById('registerPasswordError') as HTMLElement;
    const confirmError = document.getElementById('confirmError') as HTMLElement;
    
    let isValid: boolean = true;
    
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
        // Save user data to localStorage
        const userData: UserData = {
            name: name.value,
            email: email.value,
            id: id.value,
            registeredAt: new Date().toISOString()
        };
        
        localStorage.setItem('userData', JSON.stringify(userData));
        
        // Show success message
        displaySuccessMessage();
        
        // Optional: Reset form
        registerForm.reset();
        passwordStrengthElement.classList.remove('show');
        
        // Redirect to dashboard
        setTimeout((): void => {
            window.location.href = 'dashboard.html';
        }, 2000);
    }
});

// ========================================
// CLEAR ERRORS ON INPUT
// ========================================

(document.getElementById('loginEmail') as HTMLInputElement).addEventListener('input', function(): void {
    if (this.classList.contains('error')) {
        clearError(this, document.getElementById('emailError') as HTMLElement);
    }
});

(document.getElementById('loginPassword') as HTMLInputElement).addEventListener('input', function(): void {
    if (this.classList.contains('error')) {
        clearError(this, document.getElementById('passwordError') as HTMLElement);
    }
});

(document.getElementById('registerName') as HTMLInputElement).addEventListener('input', function(): void {
    if (this.classList.contains('error')) {
        clearError(this, document.getElementById('nameError') as HTMLElement);
    }
});

(document.getElementById('registerEmail') as HTMLInputElement).addEventListener('input', function(): void {
    if (this.classList.contains('error')) {
        clearError(this, document.getElementById('registerEmailError') as HTMLElement);
    }
});

(document.getElementById('registerId') as HTMLInputElement).addEventListener('input', function(): void {
    if (this.classList.contains('error')) {
        clearError(this, document.getElementById('idError') as HTMLElement);
    }
});

(document.getElementById('registerPassword') as HTMLInputElement).addEventListener('input', function(): void {
    if (this.classList.contains('error')) {
        clearError(this, document.getElementById('registerPasswordError') as HTMLElement);
    }
});

(document.getElementById('confirmPassword') as HTMLInputElement).addEventListener('input', function(): void {
    if (this.classList.contains('error')) {
        clearError(this, document.getElementById('confirmError') as HTMLElement);
    }
});

// ========================================
// RESET FORMS
// ========================================

const resetForms = (): void => {
    loginForm.reset();
    registerForm.reset();
    
    // Clear all errors
    document.querySelectorAll('.error-message').forEach((element: Element): void => {
        element.classList.remove('show');
        (element as HTMLElement).textContent = '';
    });
    
    document.querySelectorAll('.form-group input').forEach((input: Element): void => {
        input.classList.remove('error');
    });
    
    (document.getElementById('passwordStrength') as HTMLElement).classList.remove('show');
};

// ========================================
// ENTER KEY SUBMISSION
// ========================================

loginForm.addEventListener('keypress', (e: KeyboardEvent): void => {
    if (e.key === 'Enter') {
        loginForm.dispatchEvent(new Event('submit'));
    }
});

registerForm.addEventListener('keypress', (e: KeyboardEvent): void => {
    if (e.key === 'Enter') {
        registerForm.dispatchEvent(new Event('submit'));
    }
});

console.log('✓ Therapy Notes Authentication System Loaded (TypeScript)');
