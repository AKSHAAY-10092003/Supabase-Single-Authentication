# Complete Guide: Supabase Authentication with React + FastAPI

This is a comprehensive guide to build a React frontend with FastAPI backend using Supabase for email/password authentication.

## Table of Contents
1. [Project Overview](#project-overview)
2. [Project Structure](#project-structure)
3. [Prerequisites](#prerequisites)
4. [Supabase Setup](#supabase-setup)
5. [Frontend Setup](#frontend-setup)
6. [Backend Setup](#backend-setup)
7. [Complete Code Files](#complete-code-files)
8. [Environment Variables](#environment-variables)
9. [Running the Project](#running-the-project)
10. [Supabase Functions Reference](#supabase-functions-reference)

---

## Project Overview

**Tech Stack:**
- Frontend: React 19 + Vite + React Router DOM
- Backend: FastAPI + Python
- Authentication: Supabase Auth
- Email: Supabase SMTP (default)

**Features:**
- ✅ Email/Password Sign Up
- ✅ Email/Password Sign In
- ✅ Email Confirmation (automatic)
- ✅ Password Reset via Email
- ✅ Protected Routes
- ✅ Session Management
- ✅ Logout

---

## Project Structure

```
project-root/
│
├── frontend/
│   ├── src/
│   │   ├── pages/
│   │   │   ├── Home.jsx                 # Public home page
│   │   │   ├── Auth.jsx                 # Combined Login/Signup page
│   │   │   ├── ResetPasswordRequest.jsx # Request password reset
│   │   │   ├── ChangePassword.jsx       # Update password
│   │   │   └── Profile.jsx              # Protected profile page
│   │   ├── components/
│   │   │   └── ProtectedRoute.jsx       # Route protection wrapper
│   │   ├── supabase.js                  # Supabase client setup
│   │   ├── App.jsx                      # Main app with routing
│   │   ├── main.jsx                     # React entry point
│   │   ├── App.css                      # Styles
│   │   └── index.css                    # Global styles
│   ├── .env.local                       # Frontend environment variables
│   ├── package.json                     # Frontend dependencies
│   └── vite.config.js                   # Vite configuration
│
├── backend/
│   ├── main.py                          # FastAPI app
│   ├── auth.py                          # Authentication middleware
│   ├── supabase_client.py               # Backend Supabase client
│   ├── .env                             # Backend environment variables
│   └── requirements.txt                 # Python dependencies (optional)
│
└── README.md                            # This file
```

---

## Prerequisites

### Required Software:
1. **Node.js** v20.19.0+ or v22.12.0+ (includes npm)
2. **Python** 3.8+ (includes pip)
3. **Supabase Account** (free tier works)

### Get Supabase Credentials:
1. Create account at https://supabase.com
2. Create a new project
3. Go to **Project Settings → API**
4. Copy these values:
   - **Project URL**
   - **Publishable key** (anon key or `sb_publishable_...`)
   - **Service role key** (for backend only - keep secret!)

---

## Supabase Setup

### Step 1: Configure Email Templates

1. Go to **Supabase Dashboard → Authentication → Email Templates**
2. Select **"Reset Password"** template
3. Update the confirmation URL to:

```
{{ .SiteURL }}/update-password?token_hash={{ .TokenHash }}&type=recovery
```

4. Go to **Authentication → URL Configuration**
5. Set **Site URL**: `http://localhost:5173` (or your frontend URL)
6. Add **Redirect URL**: `http://localhost:5173/update-password`

### Step 2: Email Configuration

Supabase handles email sending automatically. For production, configure custom SMTP:
- **Dashboard → Authentication → Settings → SMTP Settings**

---

## Frontend Setup

### Step 1: Create React App with Vite

```bash
npm create vite@latest frontend -- --template react
cd frontend
```

### Step 2: Install Dependencies

```bash
npm install @supabase/supabase-js react-router-dom
```

### Step 3: Create Environment File

Create `frontend/.env.local`:

```env
VITE_SUPABASE_URL=your-project-url
VITE_SUPABASE_PUBLISHABLE_DEFAULT_KEY=your-publishable-key-or-anon-key
```

**Replace with your actual Supabase credentials.**

---

## Backend Setup

### Step 1: Create Backend Directory

```bash
mkdir backend
cd backend
```

### Step 2: Create Virtual Environment

**Windows (PowerShell):**
```bash
python -m venv venv
.\venv\Scripts\Activate.ps1
```

**Windows (CMD):**
```bash
python -m venv venv
venv\Scripts\activate.bat
```

**macOS/Linux:**
```bash
python3 -m venv venv
source venv/bin/activate
```

### Step 3: Install Python Dependencies

```bash
pip install fastapi uvicorn supabase python-dotenv
```

### Step 4: Create Environment File

Create `backend/.env`:

```env
SUPABASE_URL=your-project-url
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
```

---

## Complete Code Files

### Frontend Files

#### 1. `frontend/src/supabase.js`

```javascript
import { createClient } from "@supabase/supabase-js";

export const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_PUBLISHABLE_DEFAULT_KEY
);
```

**Purpose:** Creates the Supabase client for frontend authentication.

---

#### 2. `frontend/src/App.jsx`

```javascript
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Home from "./pages/Home";
import Auth from "./pages/Auth";
import ResetPasswordRequest from "./pages/ResetPasswordRequest";
import ChangePassword from "./pages/ChangePassword";
import Profile from "./pages/Profile";
import ProtectedRoute from "./components/ProtectedRoute";
import "./App.css";

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/auth" element={<Auth />} />
        <Route path="/reset-password" element={<ResetPasswordRequest />} />
        <Route path="/update-password" element={<ChangePassword />} />
        <Route
          path="/profile"
          element={
            <ProtectedRoute>
              <Profile />
            </ProtectedRoute>
          }
        />
      </Routes>
    </Router>
  );
}

export default App;
```

**Purpose:** Sets up routing for all pages. Profile page is protected.

---

#### 3. `frontend/src/main.jsx`

```javascript
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
```

---

#### 4. `frontend/src/components/ProtectedRoute.jsx`

```javascript
import { Navigate } from "react-router-dom";
import { supabase } from "../supabase";
import { useEffect, useState } from "react";

export default function ProtectedRoute({ children }) {
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setLoading(false);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  if (loading) {
    return <div>Loading...</div>;
  }

  if (!session) {
    return <Navigate to="/" replace />;
  }

  return children;
}
```

**Purpose:** Wrapper component that checks authentication. Redirects to home if not authenticated.

---

#### 5. `frontend/src/pages/Home.jsx`

```javascript
import { Link, useNavigate } from "react-router-dom";
import { supabase } from "../supabase";
import { useEffect, useState } from "react";

export default function Home() {
  const [session, setSession] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });

    return () => subscription.unsubscribe();
  }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate("/");
  };

  return (
    <div style={{ padding: "2rem", maxWidth: "800px", margin: "0 auto" }}>
      <h1>Welcome to Home</h1>
      <p>This is a public page accessible to everyone.</p>
      
      {session ? (
        <div>
          <p>You are logged in as: {session.user.email}</p>
          <div style={{ marginTop: "1rem", display: "flex", gap: "1rem" }}>
            <Link to="/profile">
              <button>Go to Profile</button>
            </Link>
            <button onClick={handleLogout}>Logout</button>
          </div>
        </div>
      ) : (
        <div style={{ marginTop: "1rem", display: "flex", gap: "1rem" }}>
          <Link to="/auth">
            <button>Sign In / Sign Up</button>
          </Link>
        </div>
      )}
    </div>
  );
}
```

**Purpose:** Public home page with conditional login/logout UI based on session.

---

#### 6. `frontend/src/pages/Auth.jsx`

```javascript
import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { supabase } from "../supabase";

export default function Auth() {
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [message, setMessage] = useState(null);
  const [session, setSession] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      if (session) {
        navigate("/profile");
      }
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      if (session) {
        navigate("/profile");
      }
    });

    return () => subscription.unsubscribe();
  }, [navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setMessage(null);

    try {
      if (isSignUp) {
        // Sign up with email and password
        const { data, error } = await supabase.auth.signUp({
          email: email,
          password: password,
          options: {
            emailRedirectTo: `${window.location.origin}/auth`,
          },
        });

        if (error) {
          setError(error.message);
        } else {
          setMessage("Check your email for the confirmation link!");
        }
      } else {
        // Sign in with email and password
        const { data, error } = await supabase.auth.signInWithPassword({
          email: email,
          password: password,
        });

        if (error) {
          setError(error.message);
        } else {
          navigate("/profile");
        }
      }
    } catch (err) {
      setError(err.message || "An error occurred");
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setSession(null);
    navigate("/");
  };

  if (session) {
    return (
      <div style={{ padding: "2rem", maxWidth: "400px", margin: "0 auto" }}>
        <h1>You are already logged in</h1>
        <p>Email: {session.user.email}</p>
        <button onClick={handleLogout} style={{ marginTop: "1rem" }}>
          Logout
        </button>
        <Link to="/profile" style={{ display: "block", marginTop: "1rem" }}>
          <button>Go to Profile</button>
        </Link>
      </div>
    );
  }

  return (
    <div style={{ padding: "2rem", maxWidth: "400px", margin: "0 auto" }}>
      <h1>{isSignUp ? "Sign Up" : "Sign In"}</h1>
      
      <div style={{ marginBottom: "1rem", display: "flex", gap: "1rem" }}>
        <button
          type="button"
          onClick={() => {
            setIsSignUp(false);
            setError(null);
            setMessage(null);
          }}
          style={{
            backgroundColor: !isSignUp ? "#646cff" : "transparent",
            color: !isSignUp ? "white" : "inherit",
          }}
        >
          Sign In
        </button>
        <button
          type="button"
          onClick={() => {
            setIsSignUp(true);
            setError(null);
            setMessage(null);
          }}
          style={{
            backgroundColor: isSignUp ? "#646cff" : "transparent",
            color: isSignUp ? "white" : "inherit",
          }}
        >
          Sign Up
        </button>
      </div>

      <form onSubmit={handleSubmit}>
        <div style={{ marginBottom: "1rem" }}>
          <input
            type="email"
            placeholder="Your email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            style={{
              width: "100%",
              padding: "0.6em",
              fontSize: "1em",
              borderRadius: "8px",
              border: "1px solid #ccc",
            }}
          />
        </div>
        <div style={{ marginBottom: "1rem" }}>
          <input
            type="password"
            placeholder="Your password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            style={{
              width: "100%",
              padding: "0.6em",
              fontSize: "1em",
              borderRadius: "8px",
              border: "1px solid #ccc",
            }}
          />
        </div>

        {error && (
          <div style={{ color: "red", marginBottom: "1rem" }}>{error}</div>
        )}
        {message && (
          <div style={{ color: "green", marginBottom: "1rem" }}>{message}</div>
        )}

        <button
          type="submit"
          disabled={loading}
          style={{
            width: "100%",
            padding: "0.6em",
            fontSize: "1em",
            marginBottom: "1rem",
          }}
        >
          {loading ? "Loading..." : isSignUp ? "Sign Up" : "Sign In"}
        </button>
      </form>

      {!isSignUp && (
        <Link to="/reset-password" style={{ display: "block", textAlign: "center" }}>
          Forgot password?
        </Link>
      )}

      <Link
        to="/"
        style={{ display: "block", textAlign: "center", marginTop: "1rem" }}
      >
        Back to Home
      </Link>
    </div>
  );
}
```

**Purpose:** Combined Login/Signup form with toggle. Uses `signUp()` and `signInWithPassword()` Supabase functions.

---

#### 7. `frontend/src/pages/ResetPasswordRequest.jsx`

```javascript
import { useState } from "react";
import { Link } from "react-router-dom";
import { supabase } from "../supabase";

export default function ResetPasswordRequest() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [message, setMessage] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setMessage(null);

    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/update-password`,
      });

      if (error) {
        setError(error.message);
      } else {
        setMessage("Check your email for the password reset link!");
      }
    } catch (err) {
      setError(err.message || "An error occurred");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: "2rem", maxWidth: "400px", margin: "0 auto" }}>
      <h1>Reset Password</h1>
      <p>Enter your email address and we'll send you a link to reset your password.</p>

      <form onSubmit={handleSubmit}>
        <div style={{ marginBottom: "1rem" }}>
          <input
            type="email"
            placeholder="Your email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            style={{
              width: "100%",
              padding: "0.6em",
              fontSize: "1em",
              borderRadius: "8px",
              border: "1px solid #ccc",
            }}
          />
        </div>

        {error && (
          <div style={{ color: "red", marginBottom: "1rem" }}>{error}</div>
        )}
        {message && (
          <div style={{ color: "green", marginBottom: "1rem" }}>{message}</div>
        )}

        <button
          type="submit"
          disabled={loading}
          style={{
            width: "100%",
            padding: "0.6em",
            fontSize: "1em",
            marginBottom: "1rem",
          }}
        >
          {loading ? "Loading..." : "Send Reset Link"}
        </button>
      </form>

      <Link
        to="/auth"
        style={{ display: "block", textAlign: "center", marginTop: "1rem" }}
      >
        Back to Sign In
      </Link>
      <Link
        to="/"
        style={{ display: "block", textAlign: "center", marginTop: "0.5rem" }}
      >
        Back to Home
      </Link>
    </div>
  );
}
```

**Purpose:** Form to request password reset. Calls `resetPasswordForEmail()` which triggers Supabase to send email automatically.

---

#### 8. `frontend/src/pages/ChangePassword.jsx`

```javascript
import { useState, useEffect } from "react";
import { useNavigate, useSearchParams, Link } from "react-router-dom";
import { supabase } from "../supabase";

export default function ChangePassword() {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [message, setMessage] = useState(null);
  const [session, setSession] = useState(null);
  const [verifying, setVerifying] = useState(false);
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  useEffect(() => {
    // Check if we have token_hash in URL (password reset callback)
    const token_hash = searchParams.get("token_hash");
    const type = searchParams.get("type");

    if (token_hash && type === "recovery") {
      setVerifying(true);
      // Verify the recovery token
      supabase.auth
        .verifyOtp({
          token_hash,
          type: "recovery",
        })
        .then(({ error }) => {
          if (error) {
            setError(error.message);
          } else {
            // Clear URL params
            window.history.replaceState({}, document.title, "/update-password");
          }
          setVerifying(false);
        });
    }

    // Check for existing session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      if (!session && !token_hash) {
        // If no session and no token, redirect to reset request
        navigate("/reset-password");
      }
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });

    return () => subscription.unsubscribe();
  }, [navigate, searchParams]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setMessage(null);

    if (password !== confirmPassword) {
      setError("Passwords do not match");
      setLoading(false);
      return;
    }

    if (password.length < 6) {
      setError("Password must be at least 6 characters");
      setLoading(false);
      return;
    }

    try {
      // Check if we have a session first
      const { data: { session: currentSession } } = await supabase.auth.getSession();
      
      if (!currentSession) {
        setError("Please click the link from your email first");
        setLoading(false);
        return;
      }

      const { error } = await supabase.auth.updateUser({
        password: password,
      });

      if (error) {
        setError(error.message);
      } else {
        setMessage("Password updated successfully! Redirecting...");
        setTimeout(() => {
          navigate("/profile");
        }, 2000);
      }
    } catch (err) {
      setError(err.message || "An error occurred");
    } finally {
      setLoading(false);
    }
  };

  if (verifying) {
    return (
      <div style={{ padding: "2rem", maxWidth: "400px", margin: "0 auto" }}>
        <h1>Verifying Reset Link</h1>
        <p>Please wait while we verify your password reset link...</p>
      </div>
    );
  }

  if (!session && !searchParams.get("token_hash")) {
    return null; // Will redirect
  }

  return (
    <div style={{ padding: "2rem", maxWidth: "400px", margin: "0 auto" }}>
      <h1>Change Password</h1>
      <p>Enter your new password below.</p>

      <form onSubmit={handleSubmit}>
        <div style={{ marginBottom: "1rem" }}>
          <input
            type="password"
            placeholder="New password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            style={{
              width: "100%",
              padding: "0.6em",
              fontSize: "1em",
              borderRadius: "8px",
              border: "1px solid #ccc",
            }}
          />
        </div>
        <div style={{ marginBottom: "1rem" }}>
          <input
            type="password"
            placeholder="Confirm new password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            required
            style={{
              width: "100%",
              padding: "0.6em",
              fontSize: "1em",
              borderRadius: "8px",
              border: "1px solid #ccc",
            }}
          />
        </div>

        {error && (
          <div style={{ color: "red", marginBottom: "1rem" }}>{error}</div>
        )}
        {message && (
          <div style={{ color: "green", marginBottom: "1rem" }}>{message}</div>
        )}

        <button
          type="submit"
          disabled={loading}
          style={{
            width: "100%",
            padding: "0.6em",
            fontSize: "1em",
            marginBottom: "1rem",
          }}
        >
          {loading ? "Loading..." : "Update Password"}
        </button>
      </form>

      <Link
        to="/"
        style={{ display: "block", textAlign: "center", marginTop: "1rem" }}
      >
        Back to Home
      </Link>
    </div>
  );
}
```

**Purpose:** Form to update password. Uses `verifyOtp()` to verify email token and `updateUser()` to change password.

---

#### 9. `frontend/src/pages/Profile.jsx`

```javascript
import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { supabase } from "../supabase";

export default function Profile() {
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setLoading(false);
      if (!session) {
        navigate("/");
      }
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      if (!session) {
        navigate("/");
      }
    });

    return () => subscription.unsubscribe();
  }, [navigate]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate("/");
  };

  if (loading) {
    return (
      <div style={{ padding: "2rem", maxWidth: "800px", margin: "0 auto" }}>
        <p>Loading...</p>
      </div>
    );
  }

  if (!session) {
    return null; // Will redirect
  }

  return (
    <div style={{ padding: "2rem", maxWidth: "800px", margin: "0 auto" }}>
      <h1>Profile</h1>
      <p>This page is only accessible to authenticated users.</p>
      
      <div style={{ marginTop: "2rem", padding: "1rem", backgroundColor: "#1a1a1a", borderRadius: "8px" }}>
        <h2>User Information</h2>
        <p><strong>Email:</strong> {session.user.email}</p>
        <p><strong>User ID:</strong> {session.user.id}</p>
        <p><strong>Created At:</strong> {new Date(session.user.created_at).toLocaleString()}</p>
        <p><strong>Last Sign In:</strong> {new Date(session.user.last_sign_in_at).toLocaleString()}</p>
      </div>

      <div style={{ marginTop: "2rem", display: "flex", gap: "1rem" }}>
        <Link to="/">
          <button>Back to Home</button>
        </Link>
        <Link to="/update-password">
          <button>Change Password</button>
        </Link>
        <button onClick={handleLogout}>Logout</button>
      </div>
    </div>
  );
}
```

**Purpose:** Protected profile page showing user information.

---

#### 10. `frontend/package.json`

```json
{
  "name": "frontend",
  "private": true,
  "version": "0.0.0",
  "type": "module",
  "scripts": {
    "dev": "vite",
    "build": "vite build",
    "lint": "eslint .",
    "preview": "vite preview"
  },
  "dependencies": {
    "@supabase/supabase-js": "^2.89.0",
    "react": "^19.2.0",
    "react-dom": "^19.2.0",
    "react-router-dom": "^7.11.0"
  },
  "devDependencies": {
    "@eslint/js": "^9.39.1",
    "@types/react": "^19.2.5",
    "@types/react-dom": "^19.2.3",
    "@vitejs/plugin-react": "^5.1.1",
    "eslint": "^9.39.1",
    "eslint-plugin-react-hooks": "^7.0.1",
    "eslint-plugin-react-refresh": "^0.4.24",
    "globals": "^16.5.0",
    "vite": "^7.2.4"
  }
}
```

---

### Backend Files

#### 11. `backend/supabase_client.py`

```python
import os
from supabase import create_client
from dotenv import load_dotenv

load_dotenv()

supabase = create_client(
    os.getenv("SUPABASE_URL"),
    os.getenv("SUPABASE_SERVICE_ROLE_KEY")
)
```

**Purpose:** Creates Supabase client for backend with service role key.

---

#### 12. `backend/auth.py`

```python
from fastapi import Depends, HTTPException, status, Header
from supabase_client import supabase

def get_current_user(authorization: str = Header(None)):
    if not authorization:
        raise HTTPException(status_code=401, detail="Missing token")

    token = authorization.replace("Bearer ", "")

    try:
        user = supabase.auth.get_user(token)
        return user
    except Exception:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid or expired token",
        )
```

**Purpose:** FastAPI dependency function to verify JWT tokens from frontend.

---

#### 13. `backend/main.py`

```python
from fastapi import FastAPI, Depends
from fastapi.middleware.cors import CORSMiddleware
from auth import get_current_user

app = FastAPI()

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://localhost:3000"],  # Vite default port and common React port
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
def public():
    return {"message": "Public route"}

@app.get("/protected")
def protected(user=Depends(get_current_user)):
    return {
        "message": "Protected route",
        "email": user.user.email
    }
```

**Purpose:** FastAPI application with public and protected routes.

---

## Environment Variables

### Frontend (`frontend/.env.local`)

```env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_PUBLISHABLE_DEFAULT_KEY=your-publishable-key-here
```

**Note:** Vite requires `VITE_` prefix for environment variables.

### Backend (`backend/.env`)

```env
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key-here
```

**⚠️ Important:** Never expose the service role key in frontend code. Only use it in backend.

---

## Running the Project

### Terminal 1: Frontend

```bash
cd frontend
npm install
npm run dev
```

Frontend runs at: `http://localhost:5173`

### Terminal 2: Backend

```bash
cd backend

# Activate virtual environment
# Windows PowerShell:
.\venv\Scripts\Activate.ps1
# Windows CMD:
venv\Scripts\activate.bat
# macOS/Linux:
source venv/bin/activate

# Run server
uvicorn main:app --reload
```

Backend runs at: `http://localhost:8000`

---

## Supabase Functions Reference

### Authentication Functions Used

#### 1. `supabase.auth.signUp()`
```javascript
const { data, error } = await supabase.auth.signUp({
  email: "user@example.com",
  password: "password123",
  options: {
    emailRedirectTo: "http://localhost:5173/auth"
  }
});
```
- Creates new user account
- **Automatically sends confirmation email** (if email confirmation enabled)
- Returns session if email confirmation is disabled

#### 2. `supabase.auth.signInWithPassword()`
```javascript
const { data, error } = await supabase.auth.signInWithPassword({
  email: "user@example.com",
  password: "password123"
});
```
- Authenticates user with email/password
- Returns session on success

#### 3. `supabase.auth.resetPasswordForEmail()`
```javascript
const { error } = await supabase.auth.resetPasswordForEmail(
  "user@example.com",
  {
    redirectTo: "http://localhost:5173/update-password"
  }
);
```
- **Automatically sends password reset email** via Supabase
- Email contains recovery token

#### 4. `supabase.auth.verifyOtp()`
```javascript
const { error } = await supabase.auth.verifyOtp({
  token_hash: "token-from-url",
  type: "recovery"
});
```
- Verifies token from email link
- Creates session if valid

#### 5. `supabase.auth.updateUser()`
```javascript
const { error } = await supabase.auth.updateUser({
  password: "newpassword123"
});
```
- Updates user password
- Requires active session

#### 6. `supabase.auth.signOut()`
```javascript
await supabase.auth.signOut();
```
- Logs out current user
- Clears session

#### 7. `supabase.auth.getSession()`
```javascript
const { data: { session } } = await supabase.auth.getSession();
```
- Gets current session
- Returns `null` if not authenticated

#### 8. `supabase.auth.onAuthStateChange()`
```javascript
const { data: { subscription } } = supabase.auth.onAuthStateChange(
  (event, session) => {
    console.log(event, session);
  }
);

// Cleanup
subscription.unsubscribe();
```
- Listens for authentication state changes
- Returns subscription object for cleanup

---

## Testing the Application

### 1. Test Sign Up
1. Go to `http://localhost:5173`
2. Click "Sign In / Sign Up"
3. Click "Sign Up" tab
4. Enter email and password
5. Submit form
6. Check email for confirmation link

### 2. Test Sign In
1. Go to `/auth`
2. Enter confirmed credentials
3. Should redirect to `/profile`

### 3. Test Password Reset
1. Go to `/reset-password`
2. Enter email
3. Check email for reset link
4. Click link → redirects to `/update-password`
5. Enter new password
6. Should redirect to `/profile`

### 4. Test Protected Route
1. Try accessing `/profile` without login → redirects to `/`
2. Login → can access `/profile`

### 5. Test Logout
1. Click logout button
2. Session cleared
3. Redirected to home

---

## Important Notes

1. **Email Confirmation**: Supabase automatically sends confirmation emails when `signUp()` is called. Configure in Dashboard → Authentication → Settings.

2. **Password Reset Emails**: Sent automatically by `resetPasswordForEmail()`. Configure email template in Dashboard → Authentication → Email Templates.

3. **SMTP Configuration**: Supabase provides default SMTP (limited rate). For production, configure custom SMTP in Dashboard → Authentication → Settings → SMTP Settings.

4. **Service Role Key**: Only use in backend. Never expose in frontend code.

5. **CORS**: Backend CORS must include frontend URL.

6. **Environment Variables**:
   - Frontend: Use `.env.local` (gitignored by default)
   - Backend: Use `.env` (add to `.gitignore`)

---

## Troubleshooting

### Issue: Email not received
- Check Supabase Dashboard → Authentication → Logs
- Verify email template configuration
- Check spam folder
- Verify redirect URLs in Dashboard

### Issue: CORS errors
- Ensure backend CORS includes frontend URL
- Check backend CORS middleware configuration

### Issue: "Invalid or expired token"
- Token may have expired
- Check token format
- Verify Supabase credentials

### Issue: Session not persisting
- Check browser cookies/localStorage
- Verify Supabase client configuration
- Check `onAuthStateChange` listener

---

## Summary

This project uses **Supabase's built-in authentication functions**. We **did NOT write any code** for:
- ❌ Email sending
- ❌ SMTP configuration
- ❌ Token generation
- ❌ Password hashing
- ❌ Database operations

All of this is handled by Supabase's backend. We only:
- ✅ Created React UI components
- ✅ Called Supabase SDK functions
- ✅ Handled errors and user feedback

The backend uses FastAPI with token verification middleware to protect routes, but all authentication logic is handled by Supabase.

Good luck building! 🚀

