# Frontend Validation Test Checklist

## Login Form (/login)

### Email Validation
- [ ] Empty email shows "Email is required" on blur
- [ ] Invalid email format shows "Please enter a valid email address"
- [ ] Valid email clears error message

### Password Validation
- [ ] Empty password shows "Password is required" on blur
- [ ] Field-specific errors are displayed below each field
- [ ] Backend validation errors are properly displayed

## Signup Form (/signup)

### Name Validation
- [ ] Empty name shows "Name is required"
- [ ] Name < 2 chars shows "Name must be at least 2 characters"
- [ ] Name > 100 chars shows "Name must be less than 100 characters"

### Email Validation
- [ ] Empty email shows "Email is required"
- [ ] Invalid email format shows "Please enter a valid email address"
- [ ] Valid email clears error message

### Password Strength Indicator
- [ ] Shows real-time password strength bar
- [ ] Displays requirements checklist:
  - [ ] At least 8 characters
  - [ ] One uppercase letter
  - [ ] One lowercase letter
  - [ ] One number
  - [ ] One special character
- [ ] Each requirement shows ✓ when met, × when not met
- [ ] Strength levels: Weak, Medium, Strong, Very Strong

### Confirm Password
- [ ] Shows "Passwords do not match" when different
- [ ] Clears error when passwords match

### Backend Integration
- [ ] Backend validation errors are displayed per field
- [ ] Form prevents submission if validation fails
- [ ] Success message shows on successful registration

## Testing Steps

1. **Login Form Testing**
   - Navigate to http://localhost:3000/login
   - Test empty form submission
   - Test invalid email formats
   - Test valid credentials

2. **Signup Form Testing**
   - Navigate to http://localhost:3000/signup
   - Test empty form submission
   - Test password strength indicator with various passwords:
     - "pass" - Weak
     - "Password1" - Medium
     - "Password1!" - Strong/Very Strong
   - Test mismatched passwords
   - Test successful registration

3. **Backend Error Testing**
   - Try to register with an existing email
   - Try to login with incorrect credentials
   - Verify field-specific error messages appear