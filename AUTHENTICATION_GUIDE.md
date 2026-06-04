# Authentication System Guide

## Overview

This authentication system provides a complete login and signup flow with support for:
- ✅ Email/Password authentication
- ✅ Phone Number/Password authentication
- 🔄 Google OAuth (placeholder - ready for implementation)
- ✅ JWT token-based authentication
- ✅ Mobile-first responsive design
- ✅ Secure password hashing with bcrypt

## Features

### Frontend (Next.js + TypeScript)
- **Login Page** (`/login`) - Mobile-first responsive design
- **Signup Page** (`/signup`) - Mobile-first responsive design
- **Auth Store** (Zustand) - Global state management for authentication
- **Protected Routes** - Easy integration with existing pages

### Backend (Express + Prisma + PostgreSQL)
- **Authentication Controller** - Handles all auth logic
- **Authentication Routes** - RESTful API endpoints
- **JWT Middleware** - Protects private routes
- **Password Security** - bcrypt hashing with salt rounds of 12

## API Endpoints

### Public Endpoints

#### 1. Signup with Email
```http
POST /api/auth/signup
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "securepassword123",
  "fullName": "John Doe"
}
```

**Response:**
```json
{
  "message": "User registered successfully",
  "user": {
    "id": "uuid",
    "email": "user@example.com",
    "fullName": "John Doe",
    "provider": "local",
    "isVerified": false,
    "role": { "name": "customer" }
  },
  "token": "jwt_token_here"
}
```

#### 2. Signup with Phone
```http
POST /api/auth/signup/phone
Content-Type: application/json

{
  "phone": "+1234567890",
  "password": "securepassword123",
  "fullName": "John Doe"
}
```

#### 3. Login with Email
```http
POST /api/auth/login
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "securepassword123"
}
```

**Response:**
```json
{
  "message": "Login successful",
  "user": {
    "id": "uuid",
    "email": "user@example.com",
    "fullName": "John Doe",
    "provider": "local",
    "isVerified": false,
    "lastLogin": "2026-02-06T07:53:00.000Z"
  },
  "token": "jwt_token_here"
}
```

#### 4. Login with Phone
```http
POST /api/auth/login/phone
Content-Type: application/json

{
  "phone": "+1234567890",
  "password": "securepassword123"
}
```

#### 5. Google OAuth (Placeholder)
```http
GET /api/auth/google
```
Redirects to Google OAuth consent screen (to be implemented).

### Protected Endpoints

#### Get Current User
```http
GET /api/auth/me
Authorization: Bearer <jwt_token>
```

**Response:**
```json
{
  "user": {
    "id": "uuid",
    "email": "user@example.com",
    "fullName": "John Doe",
    "provider": "local",
    "isVerified": false
  }
}
```

## Frontend Usage

### Using the Auth Store

```typescript
import { useAuthStore } from "@/store/useAuthStore";

function MyComponent() {
  const { user, isLoggedIn, login, logout } = useAuthStore();

  const handleLogin = async () => {
    try {
      await login("user@example.com", "password123");
      // User is now logged in
    } catch (error) {
      console.error("Login failed:", error);
    }
  };

  return (
    <div>
      {isLoggedIn ? (
        <div>
          <p>Welcome, {user?.fullName}!</p>
          <button onClick={logout}>Logout</button>
        </div>
      ) : (
        <button onClick={handleLogin}>Login</button>
      )}
    </div>
  );
}
```

### Protecting Routes

```typescript
"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/store/useAuthStore";

export default function ProtectedPage() {
  const router = useRouter();
  const { isLoggedIn } = useAuthStore();

  useEffect(() => {
    if (!isLoggedIn) {
      router.push("/login");
    }
  }, [isLoggedIn, router]);

  if (!isLoggedIn) {
    return <div>Loading...</div>;
  }

  return <div>Protected Content</div>;
}
```

### Making Authenticated API Calls

```typescript
import { useAuthStore } from "@/store/useAuthStore";

const { token } = useAuthStore();

const response = await fetch(`${API_URL}/protected-endpoint`, {
  headers: {
    "Authorization": `Bearer ${token}`,
    "Content-Type": "application/json",
  },
});
```

## Setup Instructions

### Backend Setup

1. **Install Dependencies** (already installed):
   ```bash
   cd server
   npm install
   ```

2. **Configure Environment Variables**:
   ```bash
   cp .env.example .env
   ```
   
   Edit `.env` and set:
   - `DATABASE_URL` - Your PostgreSQL connection string
   - `JWT_SECRET` - A secure random string (use: `openssl rand -base64 32`)
   - `PORT` - Server port (default: 8000)

3. **Run Database Migrations**:
   ```bash
   npm run db:migrate
   ```

4. **Start the Server**:
   ```bash
   npm start
   ```

### Frontend Setup

1. **Install Dependencies** (already installed):
   ```bash
   cd client
   npm install
   ```

2. **Configure Environment Variables**:
   ```bash
   cp .env.example .env.local
   ```
   
   Edit `.env.local` and set:
   - `NEXT_PUBLIC_API_URL` - Your backend API URL (default: http://localhost:8000/api)

3. **Start the Development Server**:
   ```bash
   npm run dev
   ```

4. **Access the Application**:
   - Homepage: http://localhost:3000
   - Login: http://localhost:3000/login
   - Signup: http://localhost:3000/signup

## Database Schema

The authentication system uses the existing `User` model in Prisma:

```prisma
model User {
  id           String       @id @default(uuid()) @db.Uuid
  fullName     String       @map("full_name") @db.VarChar(150)
  email        String       @unique @db.VarChar(150)
  phone        String?      @unique @db.VarChar(20)
  passwordHash String?      @map("password_hash")
  profileImage String?      @map("profile_image")
  provider     AuthProvider @default(local)
  providerId   String?      @map("provider_id")
  roleId       String?      @map("role_id") @db.Uuid
  isVerified   Boolean      @default(false) @map("is_verified")
  isBlocked    Boolean      @default(false) @map("is_blocked")
  lastLogin    DateTime?    @map("last_login")
  createdAt    DateTime     @default(now()) @map("created_at")
  updatedAt    DateTime     @updatedAt @map("updated_at")

  role              Role?              @relation(fields: [roleId], references: [id])
  // ... other relations
}

enum AuthProvider {
  local
  google
  facebook
}
```

## Security Features

1. **Password Hashing**: Passwords are hashed using bcrypt with 12 salt rounds
2. **JWT Tokens**: Secure token-based authentication with 30-day expiration
3. **Account Blocking**: Blocked users cannot log in
4. **Input Validation**: All inputs are validated and sanitized
5. **Secure Headers**: Sensitive fields (passwordHash, providerId) are removed from responses

## Future Enhancements

### Google OAuth Implementation
To implement Google OAuth, you'll need to:

1. Install passport.js:
   ```bash
   npm install passport passport-google-oauth20
   ```

2. Configure Google OAuth in the controller
3. Update the frontend to handle OAuth callbacks

### Phone Number Verification
To add SMS verification:

1. Install Twilio SDK:
   ```bash
   npm install twilio
   ```

2. Implement OTP generation and verification
3. Update signup flow to include verification step

### Email Verification
To add email verification:

1. Install nodemailer:
   ```bash
   npm install nodemailer
   ```

2. Create email templates
3. Implement verification token system

## Troubleshooting

### Common Issues

1. **"JWT_SECRET is not defined"**
   - Make sure you have a `.env` file in the server directory
   - Set `JWT_SECRET` to a secure random string

2. **"Database connection failed"**
   - Check your `DATABASE_URL` in `.env`
   - Ensure PostgreSQL is running
   - Run `npm run db:migrate` to create tables

3. **"CORS error"**
   - Ensure `FRONTEND_URL` is set correctly in server `.env`
   - Check that the server is running on the correct port

4. **"User already exists"**
   - Email and phone numbers must be unique
   - Use a different email/phone or login instead

## Testing

### Manual Testing

1. **Test Signup**:
   - Go to http://localhost:3000/signup
   - Fill in the form with valid data
   - Submit and verify you're redirected to homepage

2. **Test Login**:
   - Go to http://localhost:3000/login
   - Use the credentials from signup
   - Verify successful login

3. **Test Phone Auth**:
   - Toggle to "Phone" tab
   - Enter phone number and password
   - Verify authentication works

### API Testing with cURL

```bash
# Signup
curl -X POST http://localhost:8000/api/auth/signup \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"password123","fullName":"Test User"}'

# Login
curl -X POST http://localhost:8000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"password123"}'

# Get Current User (replace TOKEN with actual token)
curl -X GET http://localhost:8000/api/auth/me \
  -H "Authorization: Bearer TOKEN"
```

## Design System

The authentication pages follow the BALERYON design system:

- **Colors**: Black (#0F0F0F) primary, white background
- **Typography**: Inter for body, Plus Jakarta Sans for headings
- **Spacing**: Consistent padding and margins
- **Mobile-First**: Optimized for mobile devices
- **Animations**: Smooth transitions and hover effects
- **Accessibility**: Proper labels, focus states, and ARIA attributes

## Support

For issues or questions:
1. Check this documentation
2. Review the code comments
3. Check the console for error messages
4. Ensure all environment variables are set correctly

---

**Created**: February 6, 2026
**Version**: 1.0.0
**Status**: ✅ Production Ready (except Google OAuth)
