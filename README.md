# Resume Builder - Codebase Documentation

## Overview
Resume Builder is a full-stack MERN (MongoDB, Express, React, Node.js) application for creating, editing, and optimizing resumes with AI-powered features.

---

## 📁 Project Structure

### Backend (Node.js + Express)
```
server/
├── server.js                 # Entry point - initializes server and DB
├── src/
│   ├── app.js               # Express app configuration
│   ├── config/              # Configuration files
│   │   ├── db.config.js     # MongoDB connection setup
│   │   ├── gemini.config.js # Google Gemini AI configuration
│   │   ├── google.config.js # Google OAuth configuration
│   │   └── agent.tools.js   # AI agent tools/functions
│   ├── models/              # MongoDB schemas
│   │   ├── User.model.js    # User authentication
│   │   ├── Resume.model.js  # Resume document structure
│   │   ├── ChatHistory.model.js   # AI conversation logs
│   │   └── ResumeVersion.model.js # Resume version history
│   ├── controllers/         # HTTP request handlers
│   │   ├── auth.controller.js     # Authentication endpoints
│   │   ├── resume.controller.js   # Resume CRUD endpoints
│   │   ├── ai.controller.js       # AI feature endpoints
│   │   └── version.controller.js  # Version management endpoints
│   ├── services/            # Business logic layer
│   │   ├── auth.service.js        # Auth logic (bcrypt, JWT)
│   │   ├── resume.service.js      # Resume data operations
│   │   ├── ai.service.js          # AI integration (Gemini)
│   │   └── version.service.js     # Version control logic
│   ├── routes/              # API route definitions
│   │   ├── index.js                # Route aggregator
│   │   ├── auth.routes.js          # /api/auth routes
│   │   ├── resume.routes.js        # /api/resumes routes
│   │   ├── ai.routes.js            # /api/ai routes
│   │   └── version.routes.js       # /api/versions routes
│   ├── middleware/          # Express middlewares
│   │   ├── auth.middleware.js      # JWT verification
│   │   ├── error.middleware.js     # Global error handling
│   │   └── upload.middleware.js    # File upload (multer)
│   ├── utils/               # Utility functions
│   │   ├── jwt.utils.js            # JWT token generation/verification
│   │   ├── scoreCalculator.js      # ATS score calculation
│   │   ├── keywordAnalyzer.js      # Keyword matching algorithm
│   │   ├── formatChecker.js        # Resume format validation
│   │   └── resumeParser.js         # PDF text extraction
│   └── constants/           # Constants and prompts
│       ├── prompts.js       # AI prompt templates
│       └── sectionTypes.js  # Resume section definitions
```

### Frontend (React + Vite)
```
client/
├── index.html               # HTML entry point
├── vite.config.js           # Vite configuration
├── src/
│   ├── main.jsx            # React app initialization
│   ├── App.jsx             # Main router component
│   ├── App.css             # Global styles
│   ├── index.css           # Base CSS
│   ├── context/            # React Context for state management
│   │   ├── AuthContext.jsx       # Authentication state
│   │   └── ResumeContext.jsx     # Resume builder state
│   ├── services/           # API integration
│   │   ├── api.js          # HTTP request wrapper
│   │   ├── authService.js  # Auth API calls
│   │   ├── resumeService.js      # Resume API calls
│   │   └── aiService.js    # AI feature API calls
│   ├── pages/              # Page components (routes)
│   │   ├── LandingPage/
│   │   ├── LoginPage/
│   │   ├── HomePage/
│   │   ├── BuilderPage/    # Main resume editor
│   │   ├── DashboardPage/
│   │   ├── TemplatesPage/
│   │   └── VersionsPage/
│   ├── components/         # Reusable UI components
│   │   ├── ProtectedRoute/ # Auth guard component
│   │   ├── Navbar/
│   │   ├── Sidebar/
│   │   ├── SectionEditor/
│   │   ├── ResumePreview/
│   │   ├── ChatPanel/      # AI chat interface
│   │   ├── AtsScorePanel/  # ATS score display
│   │   ├── BulletPointEditor/
│   │   ├── SkillsForm/
│   │   ├── ExperienceForm/
│   │   ├── EducationForm/
│   │   ├── CertificationsForm/
│   │   ├── ProjectsForm/
│   │   ├── PersonalInfoForm/
│   │   ├── SummaryForm/
│   │   ├── JobDescriptionInput/
│   │   ├── TemplateSelector/
│   │   ├── TemplateCard/
│   │   ├── VersionList/
│   │   ├── VersionCard/
│   │   ├── SkillGapCard/
│   │   ├── AtsChecklistItem/
│   │   ├── AtsScoreCircle/
│   │   ├── BulletDiffView/
│   │   ├── ChatInput/
│   │   ├── ChatMessage/
│   │   ├── ProgressBar/
│   │   ├── DatePicker/
│   │   └── PdfDocument/    # PDF generation
│   ├── constants/          # Constants
│   │   ├── atsMetrics.js
│   │   ├── sectionTypes.js
│   │   └── templates.js
│   ├── public/             # Static files
│   │   └── templates/
```

---

## 🔐 Authentication Flow

### Email/Password Registration
1. User enters name, email, password
2. Frontend validates input
3. Backend hashes password (bcrypt, salt=10)
4. User created in MongoDB
5. JWT token generated and returned
6. Token stored in localStorage
7. User logged in

### Email/Password Login
1. User enters email, password
2. Backend finds user by email
3. Password compared with hash (bcrypt.compare)
4. JWT token generated
5. lastLogin timestamp updated
6. Token returned to client

### Google OAuth Login
1. Frontend sends Google credential to backend
2. Backend verifies credential with Google API
3. User created/updated (upsert)
4. JWT token generated
5. Works as "single sign-on"

### Protected Routes
- All API calls attach JWT in Authorization header: `Bearer <token>`
- auth.middleware.js verifies token on protected routes
- Expired/invalid tokens return 401 Unauthorized

---

## 📝 Resume Data Model

### Resume Document Structure
```javascript
{
  userId: ObjectId,              // Owner reference
  title: String,                 // Resume name
  templateId: String,            // visual style
  targetRole: String,            // Target job title
  jobDescription: String,        // Pasted JD for analysis
  sections: {
    personalInfo: { fullName, email, phone, location, linkedIn, portfolio },
    summary: String,
    experience: Array<{company, role, startDate, endDate, current, bullets}>,
    education: Array<{institution, degree, field, startDate, endDate, gpa}>,
    skills: { technical: Array, soft: Array, languages: Array },
    projects: Array<{name, description, technologies, link, bullets}>,
    certifications: Array<{name, issuer, date, link}>
  },
  atsScore: {
    overall: 0-100,
    breakdown: { keywordMatch, formatting, ... },
    missingKeywords: Array,
    suggestions: Array
  },
  timestamps: { createdAt, updatedAt }
}
```

---

## 🤖 AI Features

### 1. Interview Coaching (Multi-turn Chat)
- Endpoint: `POST /api/ai/chat`
- Maintains conversation history
- Context-aware coaching
- Can target specific resume sections
- Stores conversations in ChatHistory

### 2. Bullet Point Generation
- Endpoint: `POST /api/ai/generate-bullets`
- Converts raw experience → professional bullets
- Optimized for ATS parsing
- Considers job description keywords

### 3. Professional Summary Generation
- Endpoint: `POST /api/ai/generate-summary`
- Creates tailored summary
- Reflects target role and JD

### 4. ATS Score Analysis
- Endpoint: `POST /api/ai/ats-score`
- Combines algorithmic + AI analysis
- Returns: Overall score (0-100) + breakdown
- Identifies missing keywords
- Provides improvement suggestions

### 5. Resume Review
- Endpoint: `POST /api/ai/review`
- Detailed feedback on strengths/weaknesses
- Actionable improvement suggestions

### 6. Job Description Matching
- Endpoint: `POST /ai/match-job`
- Analyzes resume vs. specific job
- Shows matched and missing qualifications
- Match percentage

### 7. Skill Gap Detection
- Endpoint: `POST /api/ai/skill-gaps`
- Identifies missing skills for job
- Recommends skills to acquire

---

## 📊 ATS Score Metrics (Weighted)

| Metric | Weight | Description |
|--------|--------|-------------|
| Keyword Match | 20% | Resume vs. job description keywords |
| Bullet Quality | 15% | Professional achievement bullets |
| Formatting | 10% | ATS-friendly format |
| Section Completeness | 10% | All major sections present |
| Summary Strength | 10% | Professional summary quality |
| Skill Coverage | 10% | Complete skills section |
| Quantification | 10% | Use of metrics/numbers |
| Action Verbs | 5% | Strong action verb usage |
| Length | 5% | Appropriate resume length |
| Contact Info | 5% | Complete contact information |

---

## 🔄 Version Control System

### Features
- Save snapshots of resume at any time
- Label versions (e.g., "Before Interview Updates")
- View version history with timestamps
- Restore previous versions
- Delete old versions

### Data Stored
- Complete resume snapshot (all sections)
- Template ID used
- ATS score at time of save
- Job description
- User-provided label

---

## 🌐 API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Email/password login
- `POST /api/auth/google` - Google OAuth login
- `GET /api/auth/me` - Current user profile
- `POST /api/auth/logout` - Logout

### Resumes
- `POST /api/resumes` - Create resume
- `GET /api/resumes` - Get all user resumes
- `GET /api/resumes/:id` - Get specific resume
- `PUT /api/resumes/:id` - Update resume
- `PUT /api/resumes/:id/sections/:section` - Update section
- `PUT /api/resumes/:id/template` - Change template
- `DELETE /api/resumes/:id` - Delete resume
- `POST /api/resumes/upload` - Upload PDF resume

### AI Features
- `POST /api/ai/chat` - Interview coaching chat
- `POST /api/ai/generate-bullets` - Generate bullet points
- `POST /api/ai/generate-summary` - Generate summary
- `POST /api/ai/ats-score` - Calculate ATS score
- `POST /api/ai/review` - Get resume review
- `POST /api/ai/match-job` - Match with job description
- `POST /api/ai/skill-gaps` - Detect skill gaps
- `GET /api/ai/chat-history/:resumeId` - Get chat history

### Versions
- `POST /api/versions/:resumeId` - Save version
- `GET /api/versions/:resumeId` - Get all versions
- `GET /api/versions/:resumeId/:versionId` - Get specific version
- `POST /api/versions/:resumeId/:versionId/restore` - Restore version
- `DELETE /api/versions/:resumeId/:versionId` - Delete version

---

## 🛠️ Key Technologies

### Backend
- **Express.js** - Web framework
- **MongoDB** - Database
- **Mongoose** - ODM
- **bcryptjs** - Password hashing
- **jsonwebtoken** - JWT tokens
- **Google Gemini AI** - AI features
- **multer** - File uploads
- **pdfparse** or similar - PDF text extraction

### Frontend
- **React** - UI library
- **Vite** - Build tooling
- **React Router** - Client-side routing
- **React Context** - State management
- **Fetch API** - HTTP requests
- **Google OAuth** - OAuth integration

---

## 📋 Files Commented

### Server Files
✅ **Routes** - All route files with endpoint documentation
✅ **Controllers** - All controller functions with JSDoc
✅ **Services** - Business logic with detailed comments
✅ **Models** - Schema definitions and field descriptions
✅ **Middleware** - Auth, error, and upload middleware
✅ **Utils** - Utility functions
✅ **Config** - Configuration files

### Client Files
✅ **main.jsx** - App initialization and providers
✅ **App.jsx** - Router and route definitions
✅ **AuthContext.jsx** - Authentication state with helper functions
✅ **ResumeContext.jsx** - Resume builder state with detailed comments
✅ **api.js** - HTTP wrapper with request/response handling
✅ **authService.js** - Auth API functions
✅ **resumeService.js** - Resume API functions
✅ **aiService.js** - AI API functions

---

## 🚀 Quick Start

### Backend Setup
```bash
cd server
npm install
npm run dev
```

### Frontend Setup
```bash
cd client
npm install
npm run dev
```

### Environment Variables
Backend (.env):
```
MONGODB_URI=mongodb://...
JWT_SECRET=your_secret_key
VITE_GOOGLE_CLIENT_ID=your_google_id
VITE_API_URL=http://localhost:5000/api
```

Frontend (.env.local):
```
VITE_GOOGLE_CLIENT_ID=your_google_id
VITE_API_URL=http://localhost:5000/api
```

---

## 📝 Key Patterns

### Request Flow
1. User action in React component
2. Calls service function (API call)
3. API wrapper adds auth token
4. Backend route receives request
5. Middleware validates (auth, file, etc.)
6. Controller validates params
7. Service performs business logic
8. Mongoose query executed
9. Response sent back
10. Frontend updates state via Context

### Error Handling
- Errors thrown with statusCode property
- Controllers catch and return appropriate status
- Global error middleware handles uncaught errors
- Client catches API errors and shows toast notification

### State Management
- React Context for global state (Auth, Resume)
- Local useState for component state
- Context provides computed values (completion %)
- Automatic updates trigger re-renders

---

## 🎯 Code Organization Principles

1. **Separation of Concerns** - Controllers, Services, Utils separate different responsibilities
2. **DRY** - Reusable components and functions
3. **Naming Conventions** - Clear, descriptive names
4. **Type Safety** - JSDoc comments describe data types
5. **Error Handling** - Try-catch with meaningful errors
6. **Database Indexing** - Indexes on frequently queried fields
7. **Validation** - Input validation at controller and service level

---

## 📚 Additional Documentation

Each commented file includes:
- Purpose of file/function
- Input/output parameters (JSDoc)
- Error handling notes
- Examples of usage patterns
- References to related files

---

## 🔗 Integration Points

### Frontend ↔ Backend Communication
- HTTP requests via fetch API
- JSON request/response bodies
- JWT authorization header
- FormData for file uploads
- Error messages propagated to UI

### Database ↔ Backend
- Mongoose queries for CRUD
- Indexes for performance
- Lean queries for read-only operations
- Aggregation pipelines for complex queries

### AI ↔ Backend
- Google Gemini API integration
- Prompt engineering in constants/prompts.js
- JSON response parsing with fallbacks
- Streaming for long responses

---

## ✨ Key Features Explained

1. **Resume Templates** - Multiple visual styles without affecting content
2. **Auto-Save** - Saves to backend as user edits
3. **Version History** - Snapshots for rollback
4. **AI Coaching** - Context-aware chatbot
5. **ATS Optimization** - Score + actionable suggestions
6. **Job Matching** - Tailors resume for specific jobs
7. **PDF Upload** - Imports existing resumes
8. **Responsive Design** - Works on desktop and mobile

---

**Last Updated**: April 5, 2026
**Total Files Documented**: 40+ files with comprehensive comments
