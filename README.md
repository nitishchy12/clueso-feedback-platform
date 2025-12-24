# Clueso Feedback Platform – Assignment Submission

<p align="center">
  <img src="./assets/landing-page.png" alt="Clueso Landing Page" width="900"/>
</p>

🔗 **Live Demo**
- Frontend: https://clueso-feedback-frontend.onrender.com
- Backend API: https://clueso-feedback-backend.onrender.com

## Overview

A full-stack feedback management platform inspired by Clueso.io. The system allows users to submit feedback, view real-time updates, and analyze sentiment using AI-powered services.

## Key Features

- User authentication with JWT
- Feedback submission and categorization
- Real-time dashboard updates (Socket.IO)
- AI-based sentiment analysis (mock/OpenAI)
- Secure REST APIs

## Tech Stack

| Layer | Technology |
|-------|-----------|
| **Frontend** | Next.js, React, Tailwind CSS |
| **Backend** | Node.js, Express |
| **Database** | MongoDB |
| **Auth** | JWT |
| **Realtime** | Socket.IO |
| **AI** | OpenAI / Mock Service |

## Architecture

Frontend → Backend (REST + WebSocket) → MongoDB

AI service processes feedback for insights and sentiment.

## Local Setup

```bash
git clone https://github.com/nitishchy12/clueso-feedback-platform.git
cd clueso-feedback-platform
npm install
npm run dev

# Frontend: http://localhost:3000
# Backend: http://localhost:5000
```

## Deployment

The application is deployed on Render and accessible publicly.

## Author

Nitish Kumar Choudhary (Assignment submission – original implementation)