# Construct0r Backend Setup Guide

## Overview

This guide provides complete instructions for building the backend infrastructure for **construct0r**, a visual node-based workflow editor. The backend will replace the current mock services with production-ready APIs for authentication, project management, content extraction, transcription, web scraping, and AI chat proxying.

---

## Table of Contents

1. [Tech Stack](#tech-stack)
2. [Project Structure](#project-structure)
3. [Initial Setup](#initial-setup)
4. [Database Schema](#database-schema)
5. [Authentication Implementation](#authentication-implementation)
6. [Core API Endpoints](#core-api-endpoints)
7. [Specialized Services](#specialized-services)
8. [Environment Configuration](#environment-configuration)
9. [Docker Setup](#docker-setup)
10. [Testing & Deployment](#testing--deployment)

---

## Tech Stack

### Core Framework
- **Runtime:** Node.js 20+
- **Server:** Express.js (well-documented, large ecosystem)
- **Language:** TypeScript (strict mode)

### Database & ORM
- **Database:** PostgreSQL 15+ (via Supabase or local instance)
- **ORM:** Prisma (excellent TypeScript support, migrations, seeding)

### Authentication
- **Strategy:** JWT (Access + Refresh tokens)
- **Library:** `jsonwebtoken` + `bcrypt`
- **Optional:** Integrate OAuth2 (Google) using `passport` or direct API calls

### File Storage
- **Service:** AWS S3 or Supabase Storage
- **Library:** `@aws-sdk/client-s3` or `@supabase/storage-js`

### Specialized Services
- **Transcription:** OpenAI Whisper API or Deepgram
- **YouTube:** `@distube/ytdl-core` or `yt-dlp` wrapper
- **Instagram:** `instaloader` (Python CLI) - download posts, reels, stories with captions
- **TikTok:** `yt-dlp` (supports TikTok video downloads)
- **Web Scraping:** Puppeteer (for JS-rendered sites) + Cheerio (for static HTML)
- **Google Drive:** `googleapis` (official Google API client)
- **Python Bridge:** `child_process` to execute Python scripts from Node.js

### AI Proxy
- **Model:** Google Gemini 2.5 Flash
- **Library:** `@google/genai`

---

## Project Structure

```
server/
├── src/
│   ├── index.ts                 # Entry point
│   ├── app.ts                   # Express app configuration
│   ├── config/
│   │   ├── database.ts          # Prisma client instance
│   │   ├── env.ts               # Environment variable validation
│   │   └── storage.ts           # S3/Supabase storage config
│   ├── middleware/
│   │   ├── auth.ts              # JWT verification middleware
│   │   ├── errorHandler.ts     # Global error handler
│   │   └── validators.ts        # Request validation middleware
│   ├── routes/
│   │   ├── auth.routes.ts       # /auth/* endpoints
│   │   ├── projects.routes.ts   # /projects/* endpoints
│   │   ├── content.routes.ts    # /api/transcribe, /api/scrape
│   │   ├── chat.routes.ts       # /api/chat/completions
│   │   └── drive.routes.ts      # /api/drive/* endpoints
│   ├── controllers/
│   │   ├── auth.controller.ts
│   │   ├── projects.controller.ts
│   │   ├── content.controller.ts
│   │   ├── chat.controller.ts
│   │   └── drive.controller.ts
│   ├── services/
│   │   ├── auth.service.ts      # User auth logic, token generation
│   │   ├── project.service.ts   # CRUD for projects
│   │   ├── transcription.service.ts  # YouTube + audio/video transcription
│   │   ├── instagram.service.ts # Instagram content extraction
│   │   ├── scraper.service.ts   # Web scraping service
│   │   ├── gemini.service.ts    # AI chat proxy
│   │   └── drive.service.ts     # Google Drive OAuth & file fetching
│   ├── types/
│   │   ├── express.d.ts         # Extended Express types
│   │   └── index.ts             # Shared types
│   └── utils/
│       ├── jwt.ts               # JWT helpers
│       ├── logger.ts            # Winston/Pino logger
│       └── validation.ts        # Zod schemas
├── scripts/
│   └── instagram_downloader.py  # Instaloader script for Instagram content
├── prisma/
│   ├── schema.prisma            # Database schema
│   ├── migrations/              # Auto-generated migrations
│   └── seed.ts                  # Seed data (optional)
├── .env.example
├── .env
├── docker-compose.yml
├── Dockerfile
├── package.json
├── tsconfig.json
└── README.md
```

---

## Initial Setup

### Step 1: Initialize Node.js Project

```bash
mkdir server
cd server
npm init -y
```

### Step 2: Install Dependencies

```bash
# Core dependencies
npm install express cors dotenv
npm install @prisma/client bcrypt jsonwebtoken
npm install @google/generative-ai
npm install axios cheerio puppeteer
npm install googleapis @distube/ytdl-core
npm install multer uuid
npm install @aws-sdk/client-s3 @aws-sdk/lib-storage

# Development dependencies
npm install -D typescript @types/node @types/express
npm install -D @types/bcrypt @types/jsonwebtoken
npm install -D @types/cors @types/multer
npm install -D prisma tsx nodemon
npm install -D @types/uuid
```

### Step 2b: Install Python Dependencies for Instagram

Instaloader requires Python 3.8+. Install it system-wide or in a virtual environment:

```bash
# Check Python version
python3 --version

# Install instaloader globally
pip3 install instaloader

# OR use a virtual environment (recommended)
python3 -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
pip install instaloader

# Verify installation
instaloader --version
```

**Note:** If you use a virtual environment, make sure to activate it before running the server, or update the Python path in your Instagram service.

### Step 3: Configure TypeScript

Create `tsconfig.json`:

```json
{
  "compilerOptions": {
    "target": "ES2022",
    "module": "NodeNext",
    "moduleResolution": "NodeNext",
    "lib": ["ES2022"],
    "outDir": "./dist",
    "rootDir": "./src",
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true,
    "resolveJsonModule": true,
    "declaration": true,
    "declarationMap": true,
    "sourceMap": true
  },
  "include": ["src/**/*"],
  "exclude": ["node_modules", "dist"]
}
```

### Step 4: Update `package.json` Scripts

```json
{
  "name": "constructor-backend",
  "version": "1.0.0",
  "type": "module",
  "scripts": {
    "dev": "nodemon --exec tsx src/index.ts",
    "build": "tsc",
    "start": "node dist/index.js",
    "db:generate": "prisma generate",
    "db:migrate": "prisma migrate dev",
    "db:push": "prisma db push",
    "db:seed": "tsx prisma/seed.ts",
    "db:studio": "prisma studio"
  }
}
```

---

## Database Schema

Create `prisma/schema.prisma`:

```prisma
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

model User {
  id            String    @id @default(uuid())
  email         String    @unique
  name          String
  password      String?   // null if OAuth-only user
  avatar        String?
  googleId      String?   @unique
  refreshToken  String?
  createdAt     DateTime  @default(now())
  updatedAt     DateTime  @updatedAt

  projects      Project[]

  @@index([email])
  @@index([googleId])
}

model Project {
  id        String   @id @default(uuid())
  userId    String
  name      String
  nodes     Json     // Store React Flow nodes as JSON
  edges     Json     // Store React Flow edges as JSON
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  user      User     @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@index([userId])
  @@index([updatedAt])
}
```

Initialize Prisma:

```bash
npx prisma init
npx prisma generate
npx prisma migrate dev --name init
```

---

## Authentication Implementation

### `src/config/env.ts`

```typescript
import dotenv from 'dotenv';
dotenv.config();

export const env = {
  PORT: process.env.PORT || '3001',
  NODE_ENV: process.env.NODE_ENV || 'development',

  // Database
  DATABASE_URL: process.env.DATABASE_URL!,

  // JWT
  JWT_ACCESS_SECRET: process.env.JWT_ACCESS_SECRET!,
  JWT_REFRESH_SECRET: process.env.JWT_REFRESH_SECRET!,
  JWT_ACCESS_EXPIRY: process.env.JWT_ACCESS_EXPIRY || '15m',
  JWT_REFRESH_EXPIRY: process.env.JWT_REFRESH_EXPIRY || '7d',

  // API Keys
  GEMINI_API_KEY: process.env.GEMINI_API_KEY!,
  OPENAI_API_KEY: process.env.OPENAI_API_KEY,
  DEEPGRAM_API_KEY: process.env.DEEPGRAM_API_KEY,

  // Google OAuth
  GOOGLE_CLIENT_ID: process.env.GOOGLE_CLIENT_ID,
  GOOGLE_CLIENT_SECRET: process.env.GOOGLE_CLIENT_SECRET,
  GOOGLE_REDIRECT_URI: process.env.GOOGLE_REDIRECT_URI,

  // Storage
  AWS_REGION: process.env.AWS_REGION,
  AWS_ACCESS_KEY_ID: process.env.AWS_ACCESS_KEY_ID,
  AWS_SECRET_ACCESS_KEY: process.env.AWS_SECRET_ACCESS_KEY,
  AWS_S3_BUCKET: process.env.AWS_S3_BUCKET,

  // CORS
  FRONTEND_URL: process.env.FRONTEND_URL || 'http://localhost:5173',
};

// Validate required env vars
const required = [
  'DATABASE_URL',
  'JWT_ACCESS_SECRET',
  'JWT_REFRESH_SECRET',
  'GEMINI_API_KEY',
];

for (const key of required) {
  if (!process.env[key]) {
    throw new Error(`Missing required environment variable: ${key}`);
  }
}
```

### `src/utils/jwt.ts`

```typescript
import jwt from 'jsonwebtoken';
import { env } from '../config/env.js';

export interface JWTPayload {
  userId: string;
  email: string;
}

export const generateAccessToken = (payload: JWTPayload): string => {
  return jwt.sign(payload, env.JWT_ACCESS_SECRET, {
    expiresIn: env.JWT_ACCESS_EXPIRY,
  });
};

export const generateRefreshToken = (payload: JWTPayload): string => {
  return jwt.sign(payload, env.JWT_REFRESH_SECRET, {
    expiresIn: env.JWT_REFRESH_EXPIRY,
  });
};

export const verifyAccessToken = (token: string): JWTPayload => {
  return jwt.verify(token, env.JWT_ACCESS_SECRET) as JWTPayload;
};

export const verifyRefreshToken = (token: string): JWTPayload => {
  return jwt.verify(token, env.JWT_REFRESH_SECRET) as JWTPayload;
};
```

### `src/middleware/auth.ts`

```typescript
import { Request, Response, NextFunction } from 'express';
import { verifyAccessToken } from '../utils/jwt.js';

export interface AuthRequest extends Request {
  user?: {
    userId: string;
    email: string;
  };
}

export const authenticate = (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader?.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'Missing or invalid authorization header' });
    }

    const token = authHeader.substring(7);
    const payload = verifyAccessToken(token);

    req.user = payload;
    next();
  } catch (error) {
    return res.status(401).json({ error: 'Invalid or expired token' });
  }
};
```

### `src/services/auth.service.ts`

```typescript
import bcrypt from 'bcrypt';
import { PrismaClient } from '@prisma/client';
import { generateAccessToken, generateRefreshToken } from '../utils/jwt.js';

const prisma = new PrismaClient();

export const signup = async (email: string, password: string, name: string) => {
  const existingUser = await prisma.user.findUnique({ where: { email } });

  if (existingUser) {
    throw new Error('User already exists');
  }

  const hashedPassword = await bcrypt.hash(password, 12);

  const user = await prisma.user.create({
    data: {
      email,
      password: hashedPassword,
      name,
    },
  });

  const accessToken = generateAccessToken({ userId: user.id, email: user.email });
  const refreshToken = generateRefreshToken({ userId: user.id, email: user.email });

  await prisma.user.update({
    where: { id: user.id },
    data: { refreshToken },
  });

  return {
    user: {
      id: user.id,
      email: user.email,
      name: user.name,
      avatar: user.avatar,
    },
    accessToken,
    refreshToken,
  };
};

export const login = async (email: string, password: string) => {
  const user = await prisma.user.findUnique({ where: { email } });

  if (!user || !user.password) {
    throw new Error('Invalid credentials');
  }

  const isValidPassword = await bcrypt.compare(password, user.password);

  if (!isValidPassword) {
    throw new Error('Invalid credentials');
  }

  const accessToken = generateAccessToken({ userId: user.id, email: user.email });
  const refreshToken = generateRefreshToken({ userId: user.id, email: user.email });

  await prisma.user.update({
    where: { id: user.id },
    data: { refreshToken },
  });

  return {
    user: {
      id: user.id,
      email: user.email,
      name: user.name,
      avatar: user.avatar,
    },
    accessToken,
    refreshToken,
  };
};

export const googleAuth = async (googleId: string, email: string, name: string, avatar?: string) => {
  let user = await prisma.user.findUnique({ where: { googleId } });

  if (!user) {
    user = await prisma.user.create({
      data: {
        googleId,
        email,
        name,
        avatar,
      },
    });
  }

  const accessToken = generateAccessToken({ userId: user.id, email: user.email });
  const refreshToken = generateRefreshToken({ userId: user.id, email: user.email });

  await prisma.user.update({
    where: { id: user.id },
    data: { refreshToken },
  });

  return {
    user: {
      id: user.id,
      email: user.email,
      name: user.name,
      avatar: user.avatar,
    },
    accessToken,
    refreshToken,
  };
};
```

### `src/controllers/auth.controller.ts`

```typescript
import { Request, Response } from 'express';
import * as authService from '../services/auth.service.js';
import { verifyRefreshToken } from '../utils/jwt.js';
import { PrismaClient } from '@prisma/client';
import { AuthRequest } from '../middleware/auth.js';

const prisma = new PrismaClient();

export const signupHandler = async (req: Request, res: Response) => {
  try {
    const { email, password, name } = req.body;

    if (!email || !password || !name) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const result = await authService.signup(email, password, name);

    return res.status(201).json(result);
  } catch (error) {
    if (error instanceof Error) {
      return res.status(400).json({ error: error.message });
    }
    return res.status(500).json({ error: 'Internal server error' });
  }
};

export const loginHandler = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const result = await authService.login(email, password);

    return res.status(200).json(result);
  } catch (error) {
    if (error instanceof Error) {
      return res.status(401).json({ error: error.message });
    }
    return res.status(500).json({ error: 'Internal server error' });
  }
};

export const meHandler = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.userId;

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        name: true,
        avatar: true,
      },
    });

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    return res.status(200).json({ user });
  } catch (error) {
    return res.status(500).json({ error: 'Internal server error' });
  }
};

export const refreshHandler = async (req: Request, res: Response) => {
  try {
    const { refreshToken } = req.body;

    if (!refreshToken) {
      return res.status(400).json({ error: 'Refresh token required' });
    }

    const payload = verifyRefreshToken(refreshToken);

    const user = await prisma.user.findUnique({
      where: { id: payload.userId },
    });

    if (!user || user.refreshToken !== refreshToken) {
      return res.status(401).json({ error: 'Invalid refresh token' });
    }

    const { generateAccessToken } = await import('../utils/jwt.js');
    const newAccessToken = generateAccessToken({ userId: user.id, email: user.email });

    return res.status(200).json({ accessToken: newAccessToken });
  } catch (error) {
    return res.status(401).json({ error: 'Invalid or expired refresh token' });
  }
};

// Google OAuth handler - requires implementing OAuth2 flow
export const googleAuthHandler = async (req: Request, res: Response) => {
  // Implement Google OAuth2 callback handling
  // This requires setting up OAuth2 flow with Google
  // See: https://developers.google.com/identity/protocols/oauth2
  res.status(501).json({ error: 'Not implemented yet' });
};
```

### `src/routes/auth.routes.ts`

```typescript
import { Router } from 'express';
import * as authController from '../controllers/auth.controller.js';
import { authenticate } from '../middleware/auth.js';

const router = Router();

router.post('/signup', authController.signupHandler);
router.post('/login', authController.loginHandler);
router.post('/refresh', authController.refreshHandler);
router.get('/me', authenticate, authController.meHandler);
router.post('/google', authController.googleAuthHandler);

export default router;
```

---

## Core API Endpoints

### `src/services/project.service.ts`

```typescript
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export const getProjects = async (userId: string) => {
  return await prisma.project.findMany({
    where: { userId },
    orderBy: { updatedAt: 'desc' },
  });
};

export const getProject = async (projectId: string, userId: string) => {
  const project = await prisma.project.findFirst({
    where: { id: projectId, userId },
  });

  if (!project) {
    throw new Error('Project not found');
  }

  return project;
};

export const createProject = async (userId: string, name: string) => {
  return await prisma.project.create({
    data: {
      userId,
      name,
      nodes: [],
      edges: [],
    },
  });
};

export const updateProject = async (
  projectId: string,
  userId: string,
  data: { name?: string; nodes?: any; edges?: any }
) => {
  const project = await prisma.project.findFirst({
    where: { id: projectId, userId },
  });

  if (!project) {
    throw new Error('Project not found');
  }

  return await prisma.project.update({
    where: { id: projectId },
    data,
  });
};

export const deleteProject = async (projectId: string, userId: string) => {
  const project = await prisma.project.findFirst({
    where: { id: projectId, userId },
  });

  if (!project) {
    throw new Error('Project not found');
  }

  await prisma.project.delete({
    where: { id: projectId },
  });
};
```

### `src/controllers/projects.controller.ts`

```typescript
import { Response } from 'express';
import { AuthRequest } from '../middleware/auth.js';
import * as projectService from '../services/project.service.js';

export const getProjectsHandler = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user!.userId;
    const projects = await projectService.getProjects(userId);
    return res.json({ projects });
  } catch (error) {
    return res.status(500).json({ error: 'Failed to fetch projects' });
  }
};

export const getProjectHandler = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user!.userId;
    const { id } = req.params;

    const project = await projectService.getProject(id, userId);
    return res.json({ project });
  } catch (error) {
    if (error instanceof Error && error.message === 'Project not found') {
      return res.status(404).json({ error: error.message });
    }
    return res.status(500).json({ error: 'Failed to fetch project' });
  }
};

export const createProjectHandler = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user!.userId;
    const { name } = req.body;

    if (!name) {
      return res.status(400).json({ error: 'Project name is required' });
    }

    const project = await projectService.createProject(userId, name);
    return res.status(201).json({ project });
  } catch (error) {
    return res.status(500).json({ error: 'Failed to create project' });
  }
};

export const updateProjectHandler = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user!.userId;
    const { id } = req.params;
    const { name, nodes, edges } = req.body;

    const project = await projectService.updateProject(id, userId, { name, nodes, edges });
    return res.json({ project });
  } catch (error) {
    if (error instanceof Error && error.message === 'Project not found') {
      return res.status(404).json({ error: error.message });
    }
    return res.status(500).json({ error: 'Failed to update project' });
  }
};

export const deleteProjectHandler = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user!.userId;
    const { id } = req.params;

    await projectService.deleteProject(id, userId);
    return res.status(204).send();
  } catch (error) {
    if (error instanceof Error && error.message === 'Project not found') {
      return res.status(404).json({ error: error.message });
    }
    return res.status(500).json({ error: 'Failed to delete project' });
  }
};
```

### `src/routes/projects.routes.ts`

```typescript
import { Router } from 'express';
import { authenticate } from '../middleware/auth.js';
import * as projectsController from '../controllers/projects.controller.js';

const router = Router();

router.use(authenticate); // All project routes require auth

router.get('/', projectsController.getProjectsHandler);
router.get('/:id', projectsController.getProjectHandler);
router.post('/', projectsController.createProjectHandler);
router.put('/:id', projectsController.updateProjectHandler);
router.delete('/:id', projectsController.deleteProjectHandler);

export default router;
```

---

## Specialized Services

### 1. Transcription Service

`src/services/transcription.service.ts`:

```typescript
import ytdl from '@distube/ytdl-core';
import { createWriteStream } from 'fs';
import { unlink } from 'fs/promises';
import { join } from 'path';
import { randomUUID } from 'crypto';
import axios from 'axios';
import { env } from '../config/env.js';

interface TranscriptionResult {
  text: string;
  title?: string;
  platform?: string;
}

/**
 * Detect platform from URL
 */
export const detectPlatform = (url: string): string => {
  if (url.includes('youtube.com') || url.includes('youtu.be')) return 'youtube';
  if (url.includes('tiktok.com')) return 'tiktok';
  if (url.includes('instagram.com')) return 'instagram';
  return 'unknown';
};

/**
 * Transcribe YouTube video using ytdl-core + Whisper
 */
export const transcribeYouTube = async (url: string): Promise<TranscriptionResult> => {
  try {
    const info = await ytdl.getInfo(url);
    const title = info.videoDetails.title;

    // Check if captions are available
    const captionTracks = info.player_response?.captions?.playerCaptionsTracklistRenderer?.captionTracks;

    if (captionTracks && captionTracks.length > 0) {
      // Use existing captions if available
      const captionUrl = captionTracks[0].baseUrl;
      const response = await axios.get(captionUrl);

      // Parse XML captions (YouTube returns XML format)
      const text = response.data
        .replace(/<[^>]*>/g, ' ')
        .replace(/&quot;/g, '"')
        .replace(/&amp;/g, '&')
        .replace(/\s+/g, ' ')
        .trim();

      return { text, title, platform: 'youtube' };
    }

    // No captions available - download audio and transcribe
    const audioPath = join('/tmp', `${randomUUID()}.mp3`);

    await new Promise<void>((resolve, reject) => {
      ytdl(url, { filter: 'audioonly', quality: 'lowestaudio' })
        .pipe(createWriteStream(audioPath))
        .on('finish', () => resolve())
        .on('error', reject);
    });

    // Send to Whisper API
    const transcription = await transcribeAudioFile(audioPath);

    // Clean up
    await unlink(audioPath);

    return { text: transcription, title, platform: 'youtube' };
  } catch (error) {
    throw new Error(`Failed to transcribe YouTube video: ${error}`);
  }
};

/**
 * Transcribe audio/video file using OpenAI Whisper
 */
export const transcribeAudioFile = async (filePath: string): Promise<string> => {
  if (!env.OPENAI_API_KEY) {
    throw new Error('OpenAI API key not configured');
  }

  const FormData = (await import('form-data')).default;
  const fs = (await import('fs')).default;

  const formData = new FormData();
  formData.append('file', fs.createReadStream(filePath));
  formData.append('model', 'whisper-1');

  try {
    const response = await axios.post(
      'https://api.openai.com/v1/audio/transcriptions',
      formData,
      {
        headers: {
          ...formData.getHeaders(),
          'Authorization': `Bearer ${env.OPENAI_API_KEY}`,
        },
      }
    );

    return response.data.text;
  } catch (error) {
    throw new Error(`Whisper API error: ${error}`);
  }
};

/**
 * Alternative: Use Deepgram for transcription
 */
export const transcribeWithDeepgram = async (audioUrl: string): Promise<string> => {
  if (!env.DEEPGRAM_API_KEY) {
    throw new Error('Deepgram API key not configured');
  }

  try {
    const response = await axios.post(
      'https://api.deepgram.com/v1/listen',
      { url: audioUrl },
      {
        headers: {
          'Authorization': `Token ${env.DEEPGRAM_API_KEY}`,
          'Content-Type': 'application/json',
        },
      }
    );

    return response.data.results.channels[0].alternatives[0].transcript;
  } catch (error) {
    throw new Error(`Deepgram API error: ${error}`);
  }
};

/**
 * Main transcription endpoint handler
 */
export const transcribe = async (url?: string, filePath?: string): Promise<TranscriptionResult> => {
  if (url) {
    const platform = detectPlatform(url);

    if (platform === 'youtube') {
      return await transcribeYouTube(url);
    }

    if (platform === 'instagram') {
      // Import Instagram service dynamically to avoid circular dependencies
      const { extractInstagramContent } = await import('./instagram.service.js');
      return await extractInstagramContent(url);
    }

    // For TikTok, could use yt-dlp wrapper (similar approach)
    throw new Error(`Platform ${platform} not yet supported`);
  }

  if (filePath) {
    const text = await transcribeAudioFile(filePath);
    return { text };
  }

  throw new Error('Either URL or file path required');
};
```

### 2. Instagram Service with Instaloader

**Important Notes:**
- Instaloader works without authentication for public posts
- Instagram may rate-limit requests; consider implementing caching
- For private accounts or stories, Instaloader requires Instagram login credentials (not covered in this basic implementation)
- Instagram's policies are strict - use responsibly and respect rate limits

First, create the Python script that uses Instaloader:

`scripts/instagram_downloader.py`:

```python
#!/usr/bin/env python3
"""
Instagram content downloader using Instaloader
Usage: python instagram_downloader.py <post_url> <output_dir>
"""

import sys
import json
import instaloader
from pathlib import Path
import tempfile

def download_instagram_content(url: str, output_dir: str = None):
    """
    Download Instagram post/reel and extract metadata

    Args:
        url: Instagram post/reel URL
        output_dir: Directory to save downloads (optional)

    Returns:
        JSON with title, caption, media info
    """

    if output_dir is None:
        output_dir = tempfile.mkdtemp()

    # Create Instaloader instance
    L = instaloader.Instaloader(
        download_videos=True,
        download_video_thumbnails=False,
        download_geotags=False,
        download_comments=False,
        save_metadata=False,
        compress_json=False,
        post_metadata_txt_pattern='',
        dirname_pattern=output_dir,
        filename_pattern='{shortcode}'
    )

    try:
        # Extract shortcode from URL
        # URLs can be:
        # https://www.instagram.com/p/{shortcode}/
        # https://www.instagram.com/reel/{shortcode}/
        # https://instagram.com/p/{shortcode}/

        parts = url.rstrip('/').split('/')

        # Find shortcode (comes after /p/ or /reel/)
        shortcode = None
        for i, part in enumerate(parts):
            if part in ['p', 'reel', 'reels'] and i + 1 < len(parts):
                shortcode = parts[i + 1]
                break

        if not shortcode:
            raise ValueError(f"Could not extract shortcode from URL: {url}")

        # Get post
        post = instaloader.Post.from_shortcode(L.context, shortcode)

        # Extract data
        result = {
            'success': True,
            'title': f"Instagram post by @{post.owner_username}",
            'caption': post.caption or '',
            'username': post.owner_username,
            'likes': post.likes,
            'comments': post.comments,
            'is_video': post.is_video,
            'url': url,
            'media_type': 'video' if post.is_video else 'image',
            'timestamp': post.date_local.isoformat(),
        }

        # Download media if it's a video (for potential transcription)
        if post.is_video:
            L.download_post(post, target=output_dir)

            # Find downloaded video file
            video_path = None
            output_path = Path(output_dir)

            for ext in ['.mp4', '.mov']:
                video_file = output_path / f"{shortcode}{ext}"
                if video_file.exists():
                    video_path = str(video_file)
                    break

            result['video_path'] = video_path

        return result

    except Exception as e:
        return {
            'success': False,
            'error': str(e)
        }

def main():
    if len(sys.argv) < 2:
        print(json.dumps({
            'success': False,
            'error': 'Usage: python instagram_downloader.py <instagram_url> [output_dir]'
        }))
        sys.exit(1)

    url = sys.argv[1]
    output_dir = sys.argv[2] if len(sys.argv) > 2 else None

    result = download_instagram_content(url, output_dir)

    # Output as JSON
    print(json.dumps(result, indent=2))

    # Exit with appropriate code
    sys.exit(0 if result['success'] else 1)

if __name__ == '__main__':
    main()
```

Now create the Node.js service that calls this Python script:

`src/services/instagram.service.ts`:

```typescript
import { spawn } from 'child_process';
import { join } from 'path';
import { unlink } from 'fs/promises';
import { transcribeAudioFile } from './transcription.service.js';

interface InstagramResult {
  title: string;
  text: string;
  url: string;
  platform: string;
  username?: string;
  mediaType?: string;
}

/**
 * Extract Instagram post content using Instaloader Python script
 */
export const extractInstagramContent = async (url: string): Promise<InstagramResult> => {
  return new Promise((resolve, reject) => {
    // Path to Python script
    const scriptPath = join(process.cwd(), 'scripts', 'instagram_downloader.py');

    // Temporary directory for downloads
    const tempDir = join('/tmp', `instagram_${Date.now()}`);

    // Spawn Python process
    const python = spawn('python3', [scriptPath, url, tempDir]);

    let stdout = '';
    let stderr = '';

    python.stdout.on('data', (data) => {
      stdout += data.toString();
    });

    python.stderr.on('data', (data) => {
      stderr += data.toString();
    });

    python.on('close', async (code) => {
      if (code !== 0) {
        console.error('Instagram downloader error:', stderr);
        return reject(new Error(`Instagram download failed: ${stderr}`));
      }

      try {
        const result = JSON.parse(stdout);

        if (!result.success) {
          return reject(new Error(result.error || 'Unknown error'));
        }

        let text = result.caption || '';

        // If it's a video, transcribe the audio
        if (result.is_video && result.video_path) {
          try {
            const transcription = await transcribeAudioFile(result.video_path);
            text = `Caption: ${result.caption}\n\n[Video Transcription]:\n${transcription}`;

            // Clean up video file
            await unlink(result.video_path);
          } catch (error) {
            console.error('Video transcription failed:', error);
            // Continue with just the caption
          }
        }

        resolve({
          title: result.title,
          text,
          url: result.url,
          platform: 'instagram',
          username: result.username,
          mediaType: result.media_type,
        });
      } catch (error) {
        reject(new Error(`Failed to parse Instagram result: ${error}`));
      }
    });

    // Timeout after 60 seconds
    setTimeout(() => {
      python.kill();
      reject(new Error('Instagram download timeout'));
    }, 60000);
  });
};

/**
 * Validate Instagram URL
 */
export const isInstagramUrl = (url: string): boolean => {
  return url.includes('instagram.com/p/') ||
         url.includes('instagram.com/reel/') ||
         url.includes('instagram.com/reels/');
};
```

### 3. Web Scraper Service

`src/services/scraper.service.ts`:

```typescript
import axios from 'axios';
import * as cheerio from 'cheerio';
import puppeteer from 'puppeteer';

interface ScrapedContent {
  title: string;
  text: string;
  url: string;
}

/**
 * Simple scraper using Cheerio (for static HTML)
 */
export const scrapeWithCheerio = async (url: string): Promise<ScrapedContent> => {
  try {
    const response = await axios.get(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; Construct0rBot/1.0)',
      },
      timeout: 10000,
    });

    const $ = cheerio.load(response.data);

    // Remove script and style tags
    $('script, style, nav, footer, iframe, noscript').remove();

    // Extract title
    const title = $('title').text() || $('h1').first().text() || 'Untitled Page';

    // Extract main content
    let text = '';

    // Try to find main content areas
    const contentSelectors = ['article', 'main', '[role="main"]', '.content', '#content', 'body'];

    for (const selector of contentSelectors) {
      const content = $(selector).first();
      if (content.length > 0) {
        text = content.text();
        break;
      }
    }

    // Clean up whitespace
    text = text
      .replace(/\s+/g, ' ')
      .replace(/\n+/g, '\n')
      .trim();

    if (!text || text.length < 100) {
      throw new Error('Unable to extract meaningful content');
    }

    return { title, text, url };
  } catch (error) {
    throw new Error(`Failed to scrape URL with Cheerio: ${error}`);
  }
};

/**
 * Advanced scraper using Puppeteer (for JavaScript-rendered pages)
 */
export const scrapeWithPuppeteer = async (url: string): Promise<ScrapedContent> => {
  let browser;

  try {
    browser = await puppeteer.launch({
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox'],
    });

    const page = await browser.newPage();

    await page.setUserAgent('Mozilla/5.0 (compatible; Construct0rBot/1.0)');
    await page.goto(url, { waitUntil: 'networkidle2', timeout: 30000 });

    // Extract content
    const data = await page.evaluate(() => {
      // Remove unwanted elements
      const unwanted = document.querySelectorAll('script, style, nav, footer, iframe, noscript');
      unwanted.forEach(el => el.remove());

      const title = document.title || document.querySelector('h1')?.textContent || 'Untitled Page';

      const contentSelectors = ['article', 'main', '[role="main"]', '.content', '#content', 'body'];
      let text = '';

      for (const selector of contentSelectors) {
        const element = document.querySelector(selector);
        if (element && element.textContent) {
          text = element.textContent;
          break;
        }
      }

      return {
        title: title.trim(),
        text: text.replace(/\s+/g, ' ').trim(),
      };
    });

    await browser.close();

    if (!data.text || data.text.length < 100) {
      throw new Error('Unable to extract meaningful content');
    }

    return { ...data, url };
  } catch (error) {
    if (browser) await browser.close();
    throw new Error(`Failed to scrape URL with Puppeteer: ${error}`);
  }
};

/**
 * Main scraper that tries Cheerio first, falls back to Puppeteer
 */
export const scrapeUrl = async (url: string): Promise<ScrapedContent> => {
  // Validate URL
  try {
    new URL(url);
  } catch {
    throw new Error('Invalid URL');
  }

  try {
    // Try Cheerio first (faster, cheaper)
    return await scrapeWithCheerio(url);
  } catch (error) {
    console.log('Cheerio failed, trying Puppeteer...', error);

    // Fall back to Puppeteer for JS-heavy sites
    return await scrapeWithPuppeteer(url);
  }
};
```

### 3. Google Drive Service

`src/services/drive.service.ts`:

```typescript
import { google } from 'googleapis';
import { env } from '../config/env.js';

const oauth2Client = new google.auth.OAuth2(
  env.GOOGLE_CLIENT_ID,
  env.GOOGLE_CLIENT_SECRET,
  env.GOOGLE_REDIRECT_URI
);

/**
 * Generate Google OAuth URL for user authorization
 */
export const getAuthUrl = (): string => {
  return oauth2Client.generateAuthUrl({
    access_type: 'offline',
    scope: [
      'https://www.googleapis.com/auth/drive.readonly',
      'https://www.googleapis.com/auth/userinfo.email',
      'https://www.googleapis.com/auth/userinfo.profile',
    ],
  });
};

/**
 * Exchange authorization code for tokens
 */
export const getTokensFromCode = async (code: string) => {
  const { tokens } = await oauth2Client.getToken(code);
  return tokens;
};

/**
 * Set credentials for authenticated requests
 */
export const setCredentials = (accessToken: string, refreshToken?: string) => {
  oauth2Client.setCredentials({
    access_token: accessToken,
    refresh_token: refreshToken,
  });
};

/**
 * Get file metadata from Google Drive
 */
export const getFileMetadata = async (fileId: string) => {
  const drive = google.drive({ version: 'v3', auth: oauth2Client });

  const response = await drive.files.get({
    fileId,
    fields: 'id, name, mimeType, size, createdTime',
  });

  return response.data;
};

/**
 * Download file content from Google Drive
 */
export const downloadFile = async (fileId: string): Promise<string> => {
  const drive = google.drive({ version: 'v3', auth: oauth2Client });

  // Get file metadata first
  const metadata = await getFileMetadata(fileId);

  // Handle Google Docs, Sheets, Slides (export as text/plain)
  if (metadata.mimeType?.startsWith('application/vnd.google-apps')) {
    const exportMimeType = 'text/plain';

    const response = await drive.files.export(
      { fileId, mimeType: exportMimeType },
      { responseType: 'text' }
    );

    return response.data as string;
  }

  // Handle regular files
  const response = await drive.files.get(
    { fileId, alt: 'media' },
    { responseType: 'text' }
  );

  return response.data as string;
};

/**
 * List files in user's Drive
 */
export const listFiles = async (pageSize = 10) => {
  const drive = google.drive({ version: 'v3', auth: oauth2Client });

  const response = await drive.files.list({
    pageSize,
    fields: 'files(id, name, mimeType, thumbnailLink)',
  });

  return response.data.files;
};
```

### 4. Gemini Chat Service

`src/services/gemini.service.ts`:

```typescript
import { GoogleGenerativeAI } from '@google/generative-ai';
import { env } from '../config/env.js';

const genAI = new GoogleGenerativeAI(env.GEMINI_API_KEY);

interface Message {
  role: 'user' | 'model';
  text: string;
}

interface ContextSource {
  type: string;
  title?: string;
  content: string;
}

export const generateChatResponse = async (
  currentMessage: string,
  history: Message[],
  contextSources: ContextSource[],
  userSystemInstruction?: string
): Promise<string> => {
  // Build context block
  const contextBlock = contextSources
    .map((source, index) => {
      return `--- SOURCE ${index + 1} (${source.type.toUpperCase()}: ${source.title || 'Untitled'}) ---\n${source.content}\n----------------------------------`;
    })
    .join('\n\n');

  // System instruction with context
  const systemInstruction = `
You are an AI assistant in a node-based workflow app.
Use the provided CONTEXT SOURCES to answer the user's query.

${userSystemInstruction ? `USER DEFINED ROLE/INSTRUCTION: ${userSystemInstruction}` : ''}

CONTEXT SOURCES:
${contextBlock}
`;

  // Convert message history to Gemini format
  const contents = [
    ...history.map(msg => ({
      role: msg.role,
      parts: [{ text: msg.text }],
    })),
    {
      role: 'user' as const,
      parts: [{ text: currentMessage }],
    },
  ];

  try {
    const model = genAI.getGenerativeModel({
      model: 'gemini-2.0-flash-exp',
      systemInstruction,
    });

    const result = await model.generateContent({
      contents,
    });

    return result.response.text();
  } catch (error) {
    console.error('Gemini API Error:', error);
    throw new Error('Failed to generate response');
  }
};
```

### Controllers & Routes for Specialized Services

`src/controllers/content.controller.ts`:

```typescript
import { Response } from 'express';
import { AuthRequest } from '../middleware/auth.js';
import * as transcriptionService from '../services/transcription.service.js';
import * as scraperService from '../services/scraper.service.js';
import multer from 'multer';

const upload = multer({ dest: '/tmp/' });

export const transcribeHandler = async (req: AuthRequest, res: Response) => {
  try {
    const { url } = req.body;
    const file = (req as any).file;

    if (!url && !file) {
      return res.status(400).json({ error: 'URL or file required' });
    }

    const result = await transcriptionService.transcribe(
      url,
      file?.path
    );

    return res.json(result);
  } catch (error) {
    if (error instanceof Error) {
      return res.status(500).json({ error: error.message });
    }
    return res.status(500).json({ error: 'Transcription failed' });
  }
};

export const scrapeHandler = async (req: AuthRequest, res: Response) => {
  try {
    const { url } = req.body;

    if (!url) {
      return res.status(400).json({ error: 'URL required' });
    }

    const result = await scraperService.scrapeUrl(url);

    return res.json(result);
  } catch (error) {
    if (error instanceof Error) {
      return res.status(500).json({ error: error.message });
    }
    return res.status(500).json({ error: 'Scraping failed' });
  }
};

export { upload };
```

`src/controllers/chat.controller.ts`:

```typescript
import { Response } from 'express';
import { AuthRequest } from '../middleware/auth.js';
import * as geminiService from '../services/gemini.service.js';

export const chatCompletionHandler = async (req: AuthRequest, res: Response) => {
  try {
    const { message, history, contextSources, systemInstruction } = req.body;

    if (!message) {
      return res.status(400).json({ error: 'Message is required' });
    }

    const response = await geminiService.generateChatResponse(
      message,
      history || [],
      contextSources || [],
      systemInstruction
    );

    return res.json({ response });
  } catch (error) {
    if (error instanceof Error) {
      return res.status(500).json({ error: error.message });
    }
    return res.status(500).json({ error: 'Chat completion failed' });
  }
};
```

`src/controllers/drive.controller.ts`:

```typescript
import { Request, Response } from 'express';
import { AuthRequest } from '../middleware/auth.js';
import * as driveService from '../services/drive.service.js';

export const getAuthUrlHandler = (req: Request, res: Response) => {
  const authUrl = driveService.getAuthUrl();
  return res.json({ authUrl });
};

export const callbackHandler = async (req: Request, res: Response) => {
  try {
    const { code } = req.query;

    if (!code || typeof code !== 'string') {
      return res.status(400).json({ error: 'Authorization code required' });
    }

    const tokens = await driveService.getTokensFromCode(code);

    // Store tokens securely (associate with user session/DB)
    // For now, return them to frontend
    return res.json({ tokens });
  } catch (error) {
    return res.status(500).json({ error: 'OAuth callback failed' });
  }
};

export const downloadFileHandler = async (req: AuthRequest, res: Response) => {
  try {
    const { fileId, accessToken } = req.body;

    if (!fileId || !accessToken) {
      return res.status(400).json({ error: 'fileId and accessToken required' });
    }

    driveService.setCredentials(accessToken);

    const metadata = await driveService.getFileMetadata(fileId);
    const content = await driveService.downloadFile(fileId);

    return res.json({
      title: metadata.name,
      content,
      mimeType: metadata.mimeType,
    });
  } catch (error) {
    if (error instanceof Error) {
      return res.status(500).json({ error: error.message });
    }
    return res.status(500).json({ error: 'Failed to download file' });
  }
};
```

`src/routes/content.routes.ts`:

```typescript
import { Router } from 'express';
import { authenticate } from '../middleware/auth.js';
import * as contentController from '../controllers/content.controller.js';

const router = Router();

router.use(authenticate);

router.post('/transcribe', contentController.upload.single('file'), contentController.transcribeHandler);
router.post('/scrape', contentController.scrapeHandler);

export default router;
```

`src/routes/chat.routes.ts`:

```typescript
import { Router } from 'express';
import { authenticate } from '../middleware/auth.js';
import * as chatController from '../controllers/chat.controller.js';

const router = Router();

router.use(authenticate);

router.post('/completions', chatController.chatCompletionHandler);

export default router;
```

`src/routes/drive.routes.ts`:

```typescript
import { Router } from 'express';
import { authenticate } from '../middleware/auth.js';
import * as driveController from '../controllers/drive.controller.js';

const router = Router();

router.get('/auth', driveController.getAuthUrlHandler);
router.get('/callback', driveController.callbackHandler);
router.post('/download', authenticate, driveController.downloadFileHandler);

export default router;
```

---

## App Configuration

### `src/config/database.ts`

```typescript
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient({
  log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
});

export default prisma;
```

### `src/middleware/errorHandler.ts`

```typescript
import { Request, Response, NextFunction } from 'express';

export const errorHandler = (
  err: Error,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  console.error('Error:', err);

  res.status(500).json({
    error: process.env.NODE_ENV === 'development' ? err.message : 'Internal server error',
  });
};
```

### `src/app.ts`

```typescript
import express from 'express';
import cors from 'cors';
import { env } from './config/env.js';
import { errorHandler } from './middleware/errorHandler.js';

import authRoutes from './routes/auth.routes.js';
import projectsRoutes from './routes/projects.routes.js';
import contentRoutes from './routes/content.routes.js';
import chatRoutes from './routes/chat.routes.js';
import driveRoutes from './routes/drive.routes.js';

const app = express();

// Middleware
app.use(cors({
  origin: env.FRONTEND_URL,
  credentials: true,
}));
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Routes
app.use('/auth', authRoutes);
app.use('/projects', projectsRoutes);
app.use('/api', contentRoutes);
app.use('/api/chat', chatRoutes);
app.use('/api/drive', driveRoutes);

// Error handler (must be last)
app.use(errorHandler);

export default app;
```

### `src/index.ts`

```typescript
import app from './app.js';
import { env } from './config/env.js';
import prisma from './config/database.js';

const PORT = parseInt(env.PORT, 10);

async function main() {
  try {
    // Test database connection
    await prisma.$connect();
    console.log('Database connected successfully');

    app.listen(PORT, '0.0.0.0', () => {
      console.log(`Server running on http://localhost:${PORT}`);
      console.log(`Environment: ${env.NODE_ENV}`);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
}

main();

// Graceful shutdown
process.on('SIGINT', async () => {
  await prisma.$disconnect();
  process.exit(0);
});
```

---

## Environment Configuration

Create `.env.example`:

```env
# Server
PORT=3001
NODE_ENV=development
FRONTEND_URL=http://localhost:5173

# Database
DATABASE_URL=postgresql://user:password@localhost:5432/constructor_db

# JWT Secrets (generate with: openssl rand -base64 32)
JWT_ACCESS_SECRET=your-access-secret-here
JWT_REFRESH_SECRET=your-refresh-secret-here
JWT_ACCESS_EXPIRY=15m
JWT_REFRESH_EXPIRY=7d

# AI API Keys
GEMINI_API_KEY=your-gemini-api-key
OPENAI_API_KEY=your-openai-api-key-optional
DEEPGRAM_API_KEY=your-deepgram-api-key-optional

# Google OAuth (optional)
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret
GOOGLE_REDIRECT_URI=http://localhost:3001/api/drive/callback

# AWS S3 (optional)
AWS_REGION=us-east-1
AWS_ACCESS_KEY_ID=your-aws-access-key
AWS_SECRET_ACCESS_KEY=your-aws-secret-key
AWS_S3_BUCKET=constructor-uploads

# Supabase (alternative to AWS)
SUPABASE_URL=your-supabase-url
SUPABASE_ANON_KEY=your-supabase-anon-key
SUPABASE_SERVICE_KEY=your-supabase-service-key
```

---

## Docker Setup

### `docker-compose.yml`

```yaml
version: '3.8'

services:
  postgres:
    image: postgres:15-alpine
    container_name: constructor-db
    environment:
      POSTGRES_USER: postgres
      POSTGRES_PASSWORD: postgres
      POSTGRES_DB: constructor_db
    ports:
      - '5432:5432'
    volumes:
      - postgres_data:/var/lib/postgresql/data
    healthcheck:
      test: ['CMD-SHELL', 'pg_isready -U postgres']
      interval: 10s
      timeout: 5s
      retries: 5

  redis:
    image: redis:7-alpine
    container_name: constructor-redis
    ports:
      - '6379:6379'
    volumes:
      - redis_data:/data

volumes:
  postgres_data:
  redis_data:
```

### `Dockerfile` (for production deployment)

```dockerfile
FROM node:20-alpine AS builder

WORKDIR /app

# Install Python and pip
RUN apk add --no-cache python3 py3-pip

COPY package*.json ./
COPY prisma ./prisma/

RUN npm ci

COPY . .

RUN npx prisma generate
RUN npm run build

FROM node:20-alpine

WORKDIR /app

# Install Python, pip, and Instaloader
RUN apk add --no-cache python3 py3-pip && \
    pip3 install --no-cache-dir instaloader

COPY package*.json ./
COPY prisma ./prisma/

RUN npm ci --only=production

COPY --from=builder /app/dist ./dist
COPY --from=builder /app/node_modules/.prisma ./node_modules/.prisma

# Copy Python scripts
COPY scripts ./scripts

EXPOSE 3001

CMD ["npm", "start"]
```

---

## Testing & Deployment

### Testing Setup

Install testing dependencies:

```bash
npm install -D jest @types/jest ts-jest supertest @types/supertest
```

Create `jest.config.js`:

```javascript
export default {
  preset: 'ts-jest',
  testEnvironment: 'node',
  extensionsToTreatAsEsm: ['.ts'],
  moduleNameMapper: {
    '^(\\.{1,2}/.*)\\.js$': '$1',
  },
  transform: {
    '^.+\\.tsx?$': ['ts-jest', { useESM: true }],
  },
};
```

### Deployment Checklist

1. **Environment Variables**
   - Set all production environment variables
   - Generate strong JWT secrets
   - Configure production database URL

2. **Database**
   - Run migrations: `npx prisma migrate deploy`
   - Set up database backups

3. **Security**
   - Enable HTTPS (use reverse proxy like Nginx)
   - Set up rate limiting (use `express-rate-limit`)
   - Enable helmet middleware: `npm install helmet`

4. **Monitoring**
   - Set up logging (Winston, Pino)
   - Configure error tracking (Sentry)
   - Set up uptime monitoring

5. **Deployment Platforms**
   - Railway: Easy deployment with Postgres
   - Render: Free tier available
   - Fly.io: Global edge deployment
   - AWS/GCP/Azure: Full control

---

## API Endpoint Summary

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| POST | `/auth/signup` | Create new user account | No |
| POST | `/auth/login` | Login with email/password | No |
| POST | `/auth/refresh` | Refresh access token | No |
| GET | `/auth/me` | Get current user info | Yes |
| POST | `/auth/google` | Google OAuth callback | No |
| GET | `/projects` | List all user projects | Yes |
| GET | `/projects/:id` | Get project by ID | Yes |
| POST | `/projects` | Create new project | Yes |
| PUT | `/projects/:id` | Update project | Yes |
| DELETE | `/projects/:id` | Delete project | Yes |
| POST | `/api/transcribe` | Transcribe video/audio | Yes |
| POST | `/api/scrape` | Scrape web page | Yes |
| POST | `/api/chat/completions` | Generate AI response | Yes |
| GET | `/api/drive/auth` | Get Google Drive auth URL | No |
| GET | `/api/drive/callback` | OAuth callback | No |
| POST | `/api/drive/download` | Download Drive file | Yes |

---

## Getting Started

1. **Clone and install dependencies:**
```bash
mkdir server && cd server
npm init -y
# Install all dependencies from Step 2 above
```

2. **Set up environment variables:**
```bash
cp .env.example .env
# Edit .env with your values
```

3. **Start local database:**
```bash
docker-compose up -d
```

4. **Initialize Prisma:**
```bash
npx prisma generate
npx prisma migrate dev --name init
```

5. **Start development server:**
```bash
npm run dev
```

6. **Test the API:**
```bash
curl http://localhost:3001/health
```

---

## Frontend Integration

Update your frontend services to call the backend API:

```typescript
// frontend/src/config/api.ts
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

export const api = {
  // Auth
  signup: (data: { email: string; password: string; name: string }) =>
    fetch(`${API_URL}/auth/signup`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    }),

  login: (data: { email: string; password: string }) =>
    fetch(`${API_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    }),

  // Projects (with auth token)
  getProjects: (token: string) =>
    fetch(`${API_URL}/projects`, {
      headers: { Authorization: `Bearer ${token}` },
    }),

  // Transcribe (supports YouTube and Instagram URLs)
  transcribe: (token: string, url: string) =>
    fetch(`${API_URL}/api/transcribe`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ url }),
    }),

  // Scrape
  scrape: (token: string, url: string) =>
    fetch(`${API_URL}/api/scrape`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ url }),
    }),

  // Chat
  chat: (token: string, data: any) =>
    fetch(`${API_URL}/api/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(data),
    }),
};
```

### Instagram Usage Example

Update your frontend extractor service to handle Instagram URLs:

```typescript
// frontend/src/services/extractor.ts
export const extractContent = async (
  url: string,
  type: 'video' | 'web',
  token: string
): Promise<Partial<SourceNodeData>> => {
  try {
    // Detect Instagram URLs
    if (url.includes('instagram.com/p/') ||
        url.includes('instagram.com/reel/') ||
        url.includes('instagram.com/reels/')) {

      const response = await fetch('http://localhost:3001/api/transcribe', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ url }),
      });

      if (!response.ok) {
        throw new Error('Failed to extract Instagram content');
      }

      const data = await response.json();

      return {
        status: 'success',
        platform: 'instagram',
        title: data.title,
        text: data.text,
        url: data.url,
      };
    }

    // Handle YouTube
    if (url.includes('youtube.com') || url.includes('youtu.be')) {
      const response = await fetch('http://localhost:3001/api/transcribe', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ url }),
      });

      const data = await response.json();

      return {
        status: 'success',
        platform: 'youtube',
        title: data.title,
        text: data.text,
        url: data.url,
      };
    }

    // Handle regular web pages
    const response = await fetch('http://localhost:3001/api/scrape', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ url }),
    });

    const data = await response.json();

    return {
      status: 'success',
      platform: 'web',
      title: data.title,
      text: data.text,
      url: data.url,
    };
  } catch (error) {
    return {
      status: 'error',
      errorMessage: error instanceof Error ? error.message : 'Unknown error',
    };
  }
};
```

---

## Next Steps

1. Implement additional authentication methods (OAuth providers)
2. Add file upload functionality for audio/video transcription
3. Implement rate limiting and request validation
4. Set up comprehensive error logging
5. Add unit and integration tests
6. Implement caching layer (Redis) for expensive operations
7. Add WebSocket support for real-time collaboration
8. Implement usage tracking and analytics

---

## Support & Resources

- [Express.js Documentation](https://expressjs.com/)
- [Prisma Documentation](https://www.prisma.io/docs/)
- [Google Gemini API](https://ai.google.dev/docs)
- [OpenAI Whisper API](https://platform.openai.com/docs/guides/speech-to-text)
- [Google Drive API](https://developers.google.com/drive)
- [Instaloader Documentation](https://instaloader.github.io/) - Instagram content downloader
- [ytdl-core Documentation](https://github.com/distube/ytdl-core) - YouTube video downloader
- [Puppeteer Documentation](https://pptr.dev/) - Headless Chrome for web scraping

---

**Good luck building the backend for construct0r!** This guide provides a complete foundation for a production-ready API server. Follow the steps sequentially, test each component, and iterate as needed.
