# React DSpace

## Project Description
React DSpace is a React-based project designed for managing and interacting with a DSpace repository. It utilizes TypeScript for type safety and React Router for navigation.

## Project Dependencies
The project includes the following dependencies:

### Main Dependencies:
- **react** (^19.0.0): Core React library
- **react-dom** (^19.0.0): React DOM rendering
- **react-router-dom** (^7.2.0): Routing for React applications
- **typescript** (^4.9.5): TypeScript for static typing
- **web-vitals** (^2.1.4): Performance monitoring

### Testing Dependencies:
- **@testing-library/dom** (^10.4.0): Testing utilities for the DOM
- **@testing-library/jest-dom** (^6.6.3): Custom Jest matchers for the DOM
- **@testing-library/react** (^16.2.0): Testing utilities for React components
- **@testing-library/user-event** (^13.5.0): Simulates user interactions
- **jest** (^29.7.0): JavaScript testing framework

### Type Definitions:
- **@types/jest** (^27.5.2): TypeScript definitions for Jest
- **@types/node** (^16.18.126): Type definitions for Node.js
- **@types/react** (^19.0.10): Type definitions for React
- **@types/react-dom** (^19.0.4): Type definitions for React DOM

### Scripts:
- **start**: Runs the development server (`react-scripts start`)
- **build**: Builds the project (`react-scripts build`)
- **test**: Runs tests (`react-scripts test`)
- **eject**: Ejects from Create React App configuration (`react-scripts eject`)

## Folder Structure

react-dspace/
│── public/             # Static files (index.html, favicon, etc.)
│── src/                # Main source code
│   ├── api/            # API service calls
│   ├── assets/         # Static assets (images, fonts, etc.)
│   ├── components/     # Reusable UI components
│   ├── contexts/       # React Context API for state management
│   ├── hooks/          # Custom React hooks
│   ├── models/         # TypeScript models and interfaces
│   ├── pages/          # Page components
│   ├── routing/        # Application routing setup
│   ├── security/       # Authentication and security-related logic
│   ├── shared/         # Shared utilities and helpers
│   ├── styles/         # Global and component styles
│   ├── global/         # Global configuration and constants
│── .eslintrc           # ESLint configuration
│── .gitignore          # Git ignore file
│── package.json        # Project dependencies and scripts
│── README.md           # Project documentation

## Getting Started

### Installation
1. Clone the repository:

   git clone https://github.com/your-repo/react-dspace.git
  
2. Navigate to the project directory:
 
   cd react-dspace
   
3. Install dependencies:
   
   npm install
   

### Running the Project
Start the development server:

npm start


### Building the Project
To create a production build:

npm run build


### Running Tests
Run the test suite:

npm test

