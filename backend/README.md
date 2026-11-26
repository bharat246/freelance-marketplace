# Freelance Marketplace – Backend

## About the Project
The backend of the Freelance Marketplace handles server-side operations, API requests, authentication, and database connectivity.

## Technologies Used
- Node.js
- Express.js
- MongoDB
- Mongoose
- JavaScript

## Features
- REST API
- User Authentication
- User Registration
- Login Functionality
- MongoDB Database Integration
- Environment Variable Configuration

## Installation and Setup

### 1. Navigate to Backend
```bash
cd backend
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Configure Environment Variables
Create a `.env` file inside the backend folder.

Example:

```env
PORT=5000
MONGO_URI=mongodb+srv://bharatsh246_db_user:SEVPqGSIBDfEoMGc@cluster0.rpjpygx.mongodb.net/
JWT_SECRET=Dxg6P7j6GbK8e8hzcdnNEsWlhFwnmY5e2UthFifaLlb
```

Use the actual environment variable names required by your backend code. Never upload your real `.env` file or secrets to GitHub.

### 4. Run Backend Locally
```bash
npm run dev
```

For production:
```bash
npm start
```

## Deployment
The backend is deployed using Render.

Add the required environment variables in the Render dashboard.

## Frontend
The frontend source code and setup instructions are available in the `../frontend` folder.
