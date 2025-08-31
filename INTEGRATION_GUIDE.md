# Class Zenith - Backend Integration Guide

## Overview

This guide provides complete instructions for integrating the Class Zenith backend with the existing React frontend.

## Backend Architecture

The backend is built with:
- **Node.js + Express.js** - REST API server
- **MongoDB + Mongoose** - Database and ODM
- **JWT Authentication** - Secure user authentication
- **Advanced Scheduling Algorithms** - Genetic Algorithm, Constraint Satisfaction, Simulated Annealing
- **Real-time Conflict Detection** - Automatic conflict resolution
- **Multi-department Support** - Handle multiple departments and shifts

## Quick Start

### 1. Backend Setup

```bash
# Navigate to backend directory
cd backend

# Install dependencies
npm install

# Copy environment file
cp .env.example .env

# Update .env with your MongoDB URI and JWT secret
# MONGODB_URI=mongodb://localhost:27017/class-zenith
# JWT_SECRET=your-super-secret-jwt-key-here

# Seed database with sample data
npm run seed

# Start development server
npm run dev
```

### 2. Frontend Integration

Update your frontend API configuration to connect to the backend:

```typescript
// src/lib/api.ts
const API_BASE_URL = 'http://localhost:5000/api';

export const api = {
  // Authentication
  login: (credentials) => fetch(`${API_BASE_URL}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(credentials)
  }),

  // Faculty Management
  getFaculty: (params) => fetch(`${API_BASE_URL}/faculty?${new URLSearchParams(params)}`, {
    headers: { 'Authorization': `Bearer ${getToken()}` }
  }),

  // Classroom Management
  getClassrooms: (params) => fetch(`${API_BASE_URL}/classrooms?${new URLSearchParams(params)}`, {
    headers: { 'Authorization': `Bearer ${getToken()}` }
  }),

  // Timetable Generation
  generateTimetable: (data) => fetch(`${API_BASE_URL}/optimizer/generate`, {
    method: 'POST',
    headers: { 
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${getToken()}`
    },
    body: JSON.stringify(data)
  })
};
```

## Key API Endpoints

### Authentication
- `POST /api/auth/login` - User login
- `GET /api/auth/me` - Get current user
- `POST /api/auth/register` - Register new user

### Faculty Management
- `GET /api/faculty` - List faculty with filters
- `POST /api/faculty` - Create new faculty
- `PUT /api/faculty/:id` - Update faculty
- `GET /api/faculty/:id/workload` - Get workload details

### Classroom Management
- `GET /api/classrooms` - List classrooms
- `GET /api/classrooms/availability/:day/:startTime/:endTime` - Check availability
- `GET /api/classrooms/utilization/stats` - Utilization statistics

### Timetable Generation
- `POST /api/optimizer/generate` - Generate optimized timetable
- `GET /api/optimizer/algorithms` - Available algorithms
- `POST /api/optimizer/validate-schedule` - Validate schedule

### Schedule Management
- `GET /api/schedules/faculty/:facultyId` - Faculty schedule
- `GET /api/schedules/classroom/:classroomId` - Classroom schedule
- `GET /api/schedules/batch/:batchId` - Batch schedule
- `GET /api/schedules/conflicts` - All conflicts

## Frontend Component Updates

### 1. Update FacultyManager Component

```typescript
// Update src/components/FacultyManager.tsx
import { useEffect, useState } from 'react';
import { api } from '@/lib/api';

const FacultyManager = () => {
  const [faculty, setFaculty] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchFaculty = async () => {
      try {
        const response = await api.getFaculty({});
        const data = await response.json();
        if (data.success) {
          setFaculty(data.data.faculty);
        }
      } catch (error) {
        console.error('Failed to fetch faculty:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchFaculty();
  }, []);

  // Rest of component logic...
};
```

### 2. Update ClassroomManager Component

```typescript
// Update src/components/ClassroomManager.tsx
const ClassroomManager = () => {
  const [classrooms, setClassrooms] = useState([]);

  useEffect(() => {
    const fetchClassrooms = async () => {
      try {
        const response = await api.getClassrooms({});
        const data = await response.json();
        if (data.success) {
          setClassrooms(data.data.classrooms);
        }
      } catch (error) {
        console.error('Failed to fetch classrooms:', error);
      }
    };

    fetchClassrooms();
  }, []);

  // Rest of component logic...
};
```

### 3. Create TimetableGenerator Component

```typescript
// Create src/components/TimetableGenerator.tsx
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

const TimetableGenerator = () => {
  const [selectedBatch, setSelectedBatch] = useState('');
  const [algorithm, setAlgorithm] = useState('genetic');
  const [generating, setGenerating] = useState(false);

  const handleGenerate = async () => {
    if (!selectedBatch) return;

    setGenerating(true);
    try {
      const response = await api.generateTimetable({
        batchId: selectedBatch,
        algorithm,
        constraints: {
          maxClassesPerDay: 6,
          maxConsecutiveClasses: 3
        }
      });

      const data = await response.json();
      if (data.success) {
        // Handle successful generation
        console.log('Timetable generated:', data.data.timetable);
      }
    } catch (error) {
      console.error('Generation failed:', error);
    } finally {
      setGenerating(false);
    }
  };

  return (
    <div className="space-y-4">
      <Select value={selectedBatch} onValueChange={setSelectedBatch}>
        <SelectTrigger>
          <SelectValue placeholder="Select Batch" />
        </SelectTrigger>
        <SelectContent>
          {/* Populate with actual batches */}
        </SelectContent>
      </Select>

      <Select value={algorithm} onValueChange={setAlgorithm}>
        <SelectTrigger>
          <SelectValue placeholder="Select Algorithm" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="genetic">Genetic Algorithm</SelectItem>
          <SelectItem value="constraint_satisfaction">Constraint Satisfaction</SelectItem>
          <SelectItem value="simulated_annealing">Simulated Annealing</SelectItem>
        </SelectContent>
      </Select>

      <Button onClick={handleGenerate} disabled={generating || !selectedBatch}>
        {generating ? 'Generating...' : 'Generate Timetable'}
      </Button>
    </div>
  );
};
```

## Authentication Integration

### 1. Create Auth Context

```typescript
// Create src/contexts/AuthContext.tsx
import { createContext, useContext, useState, useEffect } from 'react';

interface AuthContextType {
  user: any;
  login: (credentials: any) => Promise<boolean>;
  logout: () => void;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | null>(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  const login = async (credentials) => {
    try {
      const response = await api.login(credentials);
      const data = await response.json();
      
      if (data.success) {
        localStorage.setItem('token', data.data.token);
        setUser(data.data.user);
        setIsAuthenticated(true);
        return true;
      }
      return false;
    } catch (error) {
      console.error('Login failed:', error);
      return false;
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    setUser(null);
    setIsAuthenticated(false);
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, isAuthenticated }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
};
```

### 2. Add Login Component

```typescript
// Create src/components/Login.tsx
import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

const Login = () => {
  const [credentials, setCredentials] = useState({ email: '', password: '' });
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    const success = await login(credentials);
    if (!success) {
      // Handle login error
      alert('Login failed');
    }
    
    setLoading(false);
  };

  return (
    <Card className="w-96 mx-auto mt-20">
      <CardHeader>
        <CardTitle>Login to Class Zenith</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            type="email"
            placeholder="Email"
            value={credentials.email}
            onChange={(e) => setCredentials({...credentials, email: e.target.value})}
            required
          />
          <Input
            type="password"
            placeholder="Password"
            value={credentials.password}
            onChange={(e) => setCredentials({...credentials, password: e.target.value})}
            required
          />
          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? 'Logging in...' : 'Login'}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};
```

## Data Flow Integration

### Sample Data Structures

The backend provides data in the following formats:

```typescript
// Faculty Data
interface Faculty {
  id: string;
  name: string;
  code: string;
  department: string;
  subjects: string[];
  maxHours: number;
  currentHours: number;
  availability: 'Available' | 'High Load' | 'Overloaded';
  email: string;
}

// Classroom Data
interface Classroom {
  id: string;
  name: string;
  type: 'Theory' | 'Practical Lab' | 'Seminar Hall';
  capacity: number;
  building: string;
  floor: string;
  equipment: string[];
  utilization: number;
  status: 'Available' | 'High Demand';
}

// Timetable Data
interface Timetable {
  id: string;
  name: string;
  batch: string;
  department: string;
  status: 'draft' | 'generated' | 'approved' | 'published';
  schedule: DaySchedule[];
  conflicts: number;
  optimization: {
    algorithm: string;
    score: number;
  };
}
```

## Testing the Integration

### 1. Start Backend Server

```bash
cd backend
npm run dev
```

### 2. Test API Endpoints

```bash
# Test health endpoint
curl http://localhost:5000/health

# Test login (after seeding database)
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@classzenith.com","password":"admin123"}'

# Test faculty endpoint (with token)
curl http://localhost:5000/api/faculty \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

### 3. Frontend Development

```bash
# Start frontend development server
npm run dev
```

## Production Deployment

### Backend Deployment

1. **Environment Setup**
   ```bash
   NODE_ENV=production
   MONGODB_URI=mongodb://your-production-db
   JWT_SECRET=your-production-secret
   ```

2. **Build and Start**
   ```bash
   npm install --production
   npm start
   ```

### Frontend Build

```bash
# Build for production
npm run build

# Preview build
npm run preview
```

## Troubleshooting

### Common Issues

1. **CORS Errors**
   - Ensure `FRONTEND_URL` is set correctly in backend `.env`
   - Check CORS configuration in `server.js`

2. **Authentication Issues**
   - Verify JWT token is being sent in headers
   - Check token expiration

3. **Database Connection**
   - Ensure MongoDB is running
   - Verify connection string in `.env`

4. **API Errors**
   - Check backend logs for detailed error messages
   - Verify request format matches API expectations

## Next Steps

1. **Implement Real-time Updates** - Add WebSocket support for live timetable updates
2. **Add File Upload** - CSV import for bulk data entry
3. **Enhanced Analytics** - Advanced reporting and analytics dashboard
4. **Mobile Responsiveness** - Optimize for mobile devices
5. **Performance Optimization** - Add caching and query optimization

## Support

For issues or questions:
1. Check the backend logs in `logs/` directory
2. Review API documentation in `README.md`
3. Test individual endpoints using the provided curl commands
4. Verify database seeding completed successfully

The backend is now fully integrated and ready for production use with advanced scheduling optimization capabilities.
