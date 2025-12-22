# Clueso.io Clone - Setup Guide

This guide will help you set up and run the Clueso.io clone project locally.

## 📋 Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js** (v18 or higher) - [Download here](https://nodejs.org/)
- **MongoDB** (local installation or MongoDB Atlas) - [Download here](https://www.mongodb.com/try/download/community)
- **Git** - [Download here](https://git-scm.com/)

## 🚀 Quick Start

### 1. Clone the Repository

```bash
git clone <your-repository-url>
cd clueso-clone
```

### 2. Install Dependencies

```bash
# Install root dependencies
npm install

# Install all project dependencies (backend + frontend)
npm run install-all
```

### 3. Environment Setup

#### Backend Environment

Create `backend/.env` file:

```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/clueso
JWT_SECRET=your_super_secret_jwt_key_change_this_in_production
OPENAI_API_KEY=your_openai_api_key_or_leave_blank_for_mock_service
NODE_ENV=development
FRONTEND_URL=http://localhost:3000
```

#### Frontend Environment

Create `frontend/.env.local` file:

```env
NEXT_PUBLIC_API_URL=http://localhost:5000
NEXT_PUBLIC_SOCKET_URL=http://localhost:5000
```

### 4. Database Setup

#### Option A: Local MongoDB

1. Install MongoDB Community Edition
2. Start MongoDB service:
   ```bash
   # Windows
   net start MongoDB
   
   # macOS (with Homebrew)
   brew services start mongodb-community
   
   # Linux
   sudo systemctl start mongod
   ```

#### Option B: MongoDB Atlas (Cloud)

1. Create account at [MongoDB Atlas](https://www.mongodb.com/atlas)
2. Create a new cluster
3. Get connection string and update `MONGODB_URI` in `backend/.env`

### 5. Start the Application

```bash
# Start both backend and frontend concurrently
npm run dev
```

Or start them separately:

```bash
# Terminal 1 - Backend
npm run dev-backend

# Terminal 2 - Frontend  
npm run dev-frontend
```

### 6. Access the Application

- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:5000
- **API Health Check**: http://localhost:5000/api/health

## 🔧 Configuration Options

### AI Service Configuration

The application supports two AI modes:

#### OpenAI Integration (Recommended)
1. Get API key from [OpenAI](https://platform.openai.com/api-keys)
2. Add to `backend/.env`:
   ```env
   OPENAI_API_KEY=sk-your-openai-api-key-here
   ```

#### Mock AI Service (Fallback)
- Leave `OPENAI_API_KEY` empty or remove it
- The system will automatically use mock AI service

### Database Configuration

#### Local MongoDB
```env
MONGODB_URI=mongodb://localhost:27017/clueso
```

#### MongoDB Atlas
```env
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/clueso?retryWrites=true&w=majority
```

## 📱 Demo Account

For testing purposes, you can create a demo account or use these credentials:

- **Email**: demo@clueso.io
- **Password**: Demo123!

*Note: You'll need to create this account through the signup process first.*

## 🛠️ Development Commands

### Root Level Commands
```bash
npm run dev              # Start both backend and frontend
npm run install-all      # Install all dependencies
npm run build           # Build frontend for production
npm run test            # Run all tests
```

### Backend Commands
```bash
cd backend
npm run dev             # Start development server with nodemon
npm start               # Start production server
npm test                # Run backend tests
```

### Frontend Commands
```bash
cd frontend
npm run dev             # Start Next.js development server
npm run build           # Build for production
npm start               # Start production server
npm test                # Run frontend tests
npm run lint            # Run ESLint
```

## 🔍 Troubleshooting

### Common Issues

#### Port Already in Use
```bash
# Kill process on port 5000 (backend)
npx kill-port 5000

# Kill process on port 3000 (frontend)
npx kill-port 3000
```

#### MongoDB Connection Issues
1. Ensure MongoDB is running
2. Check connection string in `.env`
3. Verify network access (for Atlas)

#### Module Not Found Errors
```bash
# Clear node_modules and reinstall
rm -rf node_modules package-lock.json
npm install
```

#### Socket.IO Connection Issues
1. Check if backend is running on correct port
2. Verify `NEXT_PUBLIC_SOCKET_URL` in frontend `.env.local`
3. Check browser console for WebSocket errors

### Environment Variables Not Loading
1. Ensure `.env` files are in correct directories
2. Restart development servers after changing env vars
3. Check file names (`.env` for backend, `.env.local` for frontend)

## 📊 Project Structure

```
clueso-clone/
├── backend/                 # Node.js + Express API
│   ├── src/
│   │   ├── controllers/     # Request handlers
│   │   ├── models/         # MongoDB schemas
│   │   ├── routes/         # API routes
│   │   ├── middleware/     # Auth & validation
│   │   ├── services/       # Business logic
│   │   └── server.js       # Entry point
│   ├── package.json
│   └── .env
├── frontend/               # Next.js React app
│   ├── src/
│   │   ├── app/           # Next.js 13+ app directory
│   │   ├── components/    # React components
│   │   └── services/      # API & Socket clients
│   ├── package.json
│   └── .env.local
├── package.json           # Root package.json
└── README.md
```

## 🚀 Production Deployment

### Backend Deployment (Railway/Render/Heroku)
1. Set environment variables in deployment platform
2. Ensure `NODE_ENV=production`
3. Use MongoDB Atlas for database

### Frontend Deployment (Vercel/Netlify)
1. Connect GitHub repository
2. Set build command: `cd frontend && npm run build`
3. Set environment variables

### Environment Variables for Production
```env
# Backend
NODE_ENV=production
MONGODB_URI=mongodb+srv://...
JWT_SECRET=strong-production-secret
OPENAI_API_KEY=sk-...
FRONTEND_URL=https://your-frontend-domain.com

# Frontend
NEXT_PUBLIC_API_URL=https://your-backend-domain.com
NEXT_PUBLIC_SOCKET_URL=https://your-backend-domain.com
```

## 📞 Support

If you encounter issues:

1. Check this troubleshooting guide
2. Review console logs for error messages
3. Ensure all prerequisites are installed
4. Verify environment variables are set correctly

## 🎯 Next Steps

After setup:

1. Create your first user account
2. Submit test feedback
3. Explore the dashboard and AI insights
4. Test real-time updates with multiple browser tabs
5. Review the codebase to understand the architecture

Happy coding! 🚀


