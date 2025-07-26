# Project Structure Guidelines

This document outlines the structure and best practices for the donation-dashboard project (frontend).

## Directory Structure

- Frontend: /Users/josephheath/donation-dashboard
- Backend: /Users/josephheath/giving-dashboard

## File Location Guidelines

1. **Mental Check**: Always verify you're in the correct project before creating or modifying files.

2. **Naming Conventions**: Use clear prefixes or suffixes to indicate file purpose (e.g., UserProfile.jsx, LoginForm.js, Dashboard.css).

3. **Project-specific Comments**: Add comments at the top of each file indicating it belongs to the frontend:
   ```javascript
   // Frontend: donation-dashboard
   // File: src/components/BusinessDashboard.js
   ```

4. **Code Review**: Ensure all pull requests include checks for correct file locations.

5. **Documentation**: Keep this document updated with any changes to the project structure.

6. **Deliberate Practice**: When working on a task, explicitly state you're updating the frontend before making changes.

## Automated Checks

Consider implementing pre-commit hooks or CI/CD pipeline checks to verify file locations based on content or naming conventions.

## Regular Review

Schedule regular team meetings to discuss and reinforce proper project structure and file management.

Remember: This is the frontend repository. All user interface components, React logic, styles, and frontend configurations belong here.