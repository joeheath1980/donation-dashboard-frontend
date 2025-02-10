# Donation Dashboard

This project is a comprehensive donation management system that allows users to track, manage, and analyze charitable contributions. It provides features for individual donors, businesses, and charities to interact and manage their donation activities.

## Project Structure

This repository contains the frontend of the Donation Dashboard. The backend is located in a separate repository at `/Users/josephheath/giving-dashboard`.

## Setup Instructions

1. Clone the repository:
   ```
   git clone <repository-url>
   cd donation-dashboard
   ```

2. Install dependencies:
   ```
   npm install
   ```

3. Set up environment variables:
   - Copy the `.env.example` file to `.env`
   - Fill in the necessary environment variables

4. Start the development server:
   ```
   npm start
   ```

## Available Scripts

In the project directory, you can run:

### `npm start`

Runs the app in the development mode.\
Open [http://localhost:3000](http://localhost:3000) to view it in your browser.

The page will reload when you make changes.\
You may also see any lint errors in the console.

### `npm test`

Launches the test runner in the interactive watch mode.

### `npm run build`

Builds the app for production to the `build` folder.

## Tech Stack

- React
- React Router for navigation
- Axios for API requests
- CSS Modules for styling

## Project Structure and Important Files

- `src/components/`: Contains all React components
- `src/contexts/`: Contains React context providers
- `src/utils/`: Contains utility functions
- `webpack.config.js`: Webpack configuration for the project
- `PROJECT_STRUCTURE.md`: Detailed information about the project structure and best practices

## Additional Documentation

- [Project Structure Guidelines](PROJECT_STRUCTURE.md)
- [Google Auth Setup](GOOGLE_AUTH_SETUP.md)
- [Microsoft Login Integration](MICROSOFT_LOGIN_INTEGRATION.md)

## Learn More

To learn React, check out the [React documentation](https://reactjs.org/).

For any project-specific questions, please refer to the project documentation or contact the project maintainers.