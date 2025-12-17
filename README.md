# FileVault - Secure File Sharing Application

## Introduction

FileVault is a modern, full-stack file-sharing application that allows users to securely upload, manage, and share files with other users or via shareable links. Built with the latest technologies for type safety, performance, and scalability.


## 🌐 Live Application

https://filevault-phi.vercel.app


**Key Features:**
- User authentication with JWT
- File upload to AWS S3
- Share files with specific users
- Generate expirable shareable links
- Complete access control and authorization
- Real-time file management dashboard

---

## Tech Stack

### Frontend
- React 18 + TypeScript
- Vite (build tool)
- TanStack Query (data fetching)
- React Hook Form + Zod (validation)
- Tailwind CSS (styling)
- React Router v7 (routing)
- Axios (HTTP client)

### Backend
- Node.js + Express + TypeScript
- Prisma ORM (database abstraction)
- MongoDB (database)
- AWS S3 (file storage)
- JWT (authentication)
- bcryptjs (password hashing)
- Zod (validation)

### Hosting
- Frontend: Vercel
- Backend: Render
- Database: MongoDB Atlas
- Storage: AWS S3

---

## Getting Started

### Prerequisites
- Node.js v16+
- npm or yarn
- MongoDB Atlas account (free tier)
- AWS account with S3 bucket
- GitHub account

### Backend Setup

bash
cd backend
npm install


**Create .env file:**

- DATABASE_URL=mongodb+srv://username:password@cluster.mongodb.net/filevault
- JWT_SECRET=generate-random-32-char-string
- JWT_EXPIRE=7d
- PORT=5000
- NODE_ENV=development
- AWS_ACCESS_KEY_ID=your-access-key
- AWS_SECRET_ACCESS_KEY=your-secret-key
- AWS_REGION=ap-south-1
- AWS_S3_BUCKET_NAME=filevault-files-unique-name
- FRONTEND_URL=http://localhost:3000


**Initialize database:**
bash
npx prisma generate
npx prisma migrate dev --name init


**Start backend:**
bash
npm run dev

Backend runs on `http://localhost:5000`

### Frontend Setup

bash
cd frontend
npm install
=

**Create .env file:**

VITE_API_URL=http://localhost:5000/api


**Start frontend:**
bash
npm run dev

Frontend runs on `http://localhost:3000` or `http://localhost:5173`



## API Endpoints

### Authentication
- `POST /api/auth/register` - Register user
- `POST /api/auth/login` - Login user

### Files
- `POST /api/files/upload` - Upload file
- `GET /api/files` - Get user's files
- `DELETE /api/files/:fileId` - Delete file
- `GET /api/files/download/:fileId` - Download file

### Sharing
- `POST /api/shares/share-user` - Share with user
- `POST /api/shares/generate-link` - Generate share link
- `GET /api/shares/link/:shareLink` - Access shared file
- `DELETE /api/shares/:shareId` - Revoke share

---

## AWS S3 Setup

1. Create S3 bucket: `filevault-files-{unique-name}`
2. Block all public access (Permissions)
3. Configure CORS (Permissions → CORS):
json
-[
  {
    "AllowedOrigins": ["http://localhost:3000", "https://your-frontend.vercel.app"],
    "AllowedMethods": ["GET", "PUT", "POST", "DELETE"],
    "AllowedHeaders": ["*"],
    "ExposeHeaders": ["ETag"]
  }
]

4. Create IAM user with `AmazonS3FullAccess` policy
5. Generate access keys and add to .env



## Deployment

### Backend (Render)
1. Push to GitHub
2. Go to render.com → New Web Service
3. Connect repository (backend folder)
4. Add environment variables from .env
5. Deploy

### Frontend (Vercel)
1. Go to vercel.com → Import project
2. Set `VITE_API_URL` environment variable (backend URL)
3. Deploy



## Environment Variables Checklist

### Backend
- [ ] DATABASE_URL (MongoDB)
- [ ] JWT_SECRET (32+ characters)
- [ ] JWT_EXPIRE (7d)
- [ ] PORT (5000)
- [ ] NODE_ENV (development/production)
- [ ] AWS_ACCESS_KEY_ID
- [ ] AWS_SECRET_ACCESS_KEY
- [ ] AWS_REGION
- [ ] AWS_S3_BUCKET_NAME
- [ ] FRONTEND_URL

### Frontend
- [ ] VITE_API_URL (backend API URL)





