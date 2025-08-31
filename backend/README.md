# Class Zenith Backend

A comprehensive backend API for optimized class scheduling in higher education institutions.

## Features

- **Authentication & Authorization**: JWT-based auth with role-based access control
- **Faculty Management**: Complete faculty profiles, workload tracking, availability management
- **Classroom Management**: Room allocation, utilization tracking, equipment management
- **Subject Management**: Course catalog with prerequisites and requirements
- **Batch Management**: Student group management with preferences
- **Timetable Generation**: AI-powered optimization algorithms (Genetic Algorithm, Constraint Satisfaction, Simulated Annealing)
- **Conflict Detection**: Automatic detection and resolution suggestions
- **Review Workflow**: Multi-stage approval process for timetables
- **Multi-Department Support**: Handle multiple departments and shifts
- **Real-time Scheduling**: Live conflict detection and suggestions

## Tech Stack

- **Runtime**: Node.js
- **Framework**: Express.js
- **Database**: MongoDB with Mongoose ODM
- **Authentication**: JWT
- **Validation**: Joi & express-validator
- **Logging**: Winston
- **Security**: Helmet, CORS, Rate limiting

## Installation

1. **Clone and navigate to backend directory**
   ```bash
   cd backend
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Environment Setup**
   ```bash
   cp .env.example .env
   ```
   
   Update `.env` with your configuration:
   ```env
   MONGODB_URI=mongodb://localhost:27017/class-zenith
   JWT_SECRET=your-super-secret-jwt-key
   PORT=5000
   NODE_ENV=development
   FRONTEND_URL=http://localhost:5173
   ```

4. **Start MongoDB**
   ```bash
   # Using MongoDB service
   sudo systemctl start mongod
   
   # Or using Docker
   docker run -d -p 27017:27017 --name mongodb mongo:latest
   ```

5. **Seed Database (Optional)**
   ```bash
   npm run seed
   ```

6. **Start Development Server**
   ```bash
   npm run dev
   ```

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - User login
- `GET /api/auth/me` - Get current user
- `PUT /api/auth/profile` - Update profile
- `PUT /api/auth/change-password` - Change password

### Faculty Management
- `GET /api/faculty` - List all faculty
- `POST /api/faculty` - Create faculty
- `GET /api/faculty/:id` - Get faculty details
- `PUT /api/faculty/:id` - Update faculty
- `DELETE /api/faculty/:id` - Deactivate faculty
- `GET /api/faculty/:id/workload` - Get workload details
- `POST /api/faculty/:id/leave` - Apply for leave

### Classroom Management
- `GET /api/classrooms` - List all classrooms
- `POST /api/classrooms` - Create classroom
- `GET /api/classrooms/:id` - Get classroom details
- `PUT /api/classrooms/:id` - Update classroom
- `GET /api/classrooms/availability/:day/:startTime/:endTime` - Check availability
- `GET /api/classrooms/utilization/stats` - Utilization statistics

### Subject Management
- `GET /api/subjects` - List all subjects
- `POST /api/subjects` - Create subject
- `GET /api/subjects/:id` - Get subject details
- `PUT /api/subjects/:id` - Update subject

### Batch Management
- `GET /api/batches` - List all batches
- `POST /api/batches` - Create batch
- `GET /api/batches/:id` - Get batch details
- `PUT /api/batches/:id` - Update batch
- `POST /api/batches/:id/students` - Add students

### Timetable Management
- `GET /api/timetables` - List all timetables
- `GET /api/timetables/:id` - Get timetable details
- `PUT /api/timetables/:id` - Update timetable
- `POST /api/timetables/:id/submit-review` - Submit for review
- `POST /api/timetables/:id/review` - Review timetable
- `POST /api/timetables/:id/publish` - Publish timetable
- `GET /api/timetables/:id/conflicts` - Get conflicts
- `GET /api/timetables/:id/statistics` - Get statistics

### Optimization Engine
- `POST /api/optimizer/generate` - Generate optimized timetable
- `POST /api/optimizer/batch-generate` - Generate multiple timetables
- `POST /api/optimizer/optimize-existing` - Optimize existing timetable
- `GET /api/optimizer/algorithms` - Available algorithms
- `GET /api/optimizer/objectives` - Optimization objectives
- `POST /api/optimizer/validate-schedule` - Validate schedule

### Schedule Views
- `GET /api/schedules/faculty/:facultyId` - Faculty schedule
- `GET /api/schedules/classroom/:classroomId` - Classroom schedule
- `GET /api/schedules/batch/:batchId` - Batch schedule
- `GET /api/schedules/conflicts` - All conflicts
- `POST /api/schedules/resolve-conflict` - Resolve conflict
- `GET /api/schedules/suggestions/:timetableId` - Get suggestions

### Department Management
- `GET /api/departments` - List departments
- `POST /api/departments` - Create department
- `GET /api/departments/:id` - Get department details
- `PUT /api/departments/:id` - Update department
- `GET /api/departments/:id/shifts` - Get shifts
- `POST /api/departments/:id/shifts` - Add shift

## Optimization Algorithms

### 1. Genetic Algorithm (Default)
- **Population Size**: 50 individuals
- **Generations**: 100 iterations
- **Mutation Rate**: 10%
- **Crossover Rate**: 80%

### 2. Constraint Satisfaction
- Systematic constraint solving
- Backtracking with conflict resolution
- Optimal for smaller datasets

### 3. Simulated Annealing
- Probabilistic optimization
- Temperature-based acceptance
- Good for local optimization

## Optimization Objectives

1. **Minimize Conflicts** (40% weight)
   - Faculty double-booking
   - Classroom conflicts
   - Resource conflicts

2. **Maximize Utilization** (30% weight)
   - Faculty workload optimization
   - Classroom utilization
   - Resource efficiency

3. **Balance Workload** (20% weight)
   - Even distribution among faculty
   - Prevent overloading
   - Maintain quality

4. **Minimize Gaps** (10% weight)
   - Reduce student waiting time
   - Optimize daily schedules
   - Improve experience

## Database Schema

### Core Entities
- **Users**: Authentication and authorization
- **Departments**: Organizational units with shifts
- **Faculty**: Teaching staff with availability and preferences
- **Classrooms**: Physical resources with equipment
- **Subjects**: Course catalog with requirements
- **Batches**: Student groups with subjects
- **Timetables**: Generated schedules with optimization data

### Relationships
- Department → Faculty (1:N)
- Department → Classrooms (1:N)
- Department → Subjects (1:N)
- Department → Batches (1:N)
- Batch → Subjects (N:N)
- Faculty → Subjects (N:N)
- Timetable → All entities (references)

## Security Features

- JWT token authentication
- Role-based access control (Admin, Coordinator, Faculty, Viewer)
- Password hashing with bcrypt
- Rate limiting
- Input validation and sanitization
- CORS protection
- Security headers with Helmet

## Error Handling

- Centralized error handling middleware
- Structured error responses
- Detailed logging with Winston
- Validation error formatting
- Database error handling

## Testing

```bash
# Run tests
npm test

# Run with coverage
npm run test:coverage
```

## Deployment

### Production Setup
1. Set `NODE_ENV=production`
2. Use production MongoDB instance
3. Configure proper JWT secrets
4. Set up reverse proxy (nginx)
5. Enable SSL/TLS
6. Configure logging
7. Set up monitoring

### Docker Deployment
```bash
# Build image
docker build -t class-zenith-backend .

# Run container
docker run -d -p 5000:5000 --env-file .env class-zenith-backend
```

## Performance Optimization

- Database indexing on frequently queried fields
- Pagination for large datasets
- Caching for static data
- Connection pooling
- Query optimization
- Compression middleware

## Monitoring & Logging

- Winston for structured logging
- Error tracking and alerting
- Performance monitoring
- Database query monitoring
- API response time tracking

## Contributing

1. Fork the repository
2. Create feature branch
3. Follow coding standards
4. Add tests for new features
5. Update documentation
6. Submit pull request

## License

MIT License - see LICENSE file for details.
