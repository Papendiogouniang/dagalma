# Kanzey Billetterie

A ticketing system for events built with React, TypeScript, and Express.js.

## Project Structure

This project is separated into two parts for easy deployment:

- `src/` - Frontend (React + Vite)
- `server/` - Backend (Express.js + MongoDB)

## Local Development

1. Install dependencies for both parts:
   ```bash
   npm install
   ```

2. Start both frontend and backend:
   ```bash
   npm run dev
   ```

This will start the backend on `http://localhost:5000` and frontend on `http://localhost:5173`.

## Deployment

### Frontend (Vercel)
- Deploy the `src/` directory to Vercel.
- Set environment variable: `VITE_API_URL=https://your-backend-url.com/api`

### Backend (Render)
- Deploy the entire project to Render (or just the `server/` directory).
- **Important:** In Render settings, set the **Start Command** to `npm start`
- If deploying the entire project, keep the Root Directory as default (empty)
- If deploying only `server/`, set Root Directory to `server`
- Set environment variables in Render dashboard (MONGODB_URI, JWT_SECRET, etc.)

## Environment Variables

### Frontend (.env in src/)
```
VITE_API_URL=http://localhost:5000/api
```

### Backend (.env in server/)
```
MONGODB_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret
PAYTECH_API_KEY=your_paytech_api_key
PAYTECH_SECRET_KEY=your_paytech_secret_key
PAYTECH_API_URL=https://paytech.sn/api
FRONTEND_URL=http://localhost:5173
PORT=5000
