# ⚡ Job AI Powder — AI-Powered MERN Job Portal

A full-stack job portal with **Gemini AI** + **NLP** for resume analysis, skill gap detection, and AI-generated job descriptions.

---

## 🏗️ Folder Structure

```
Job Ai Powder/
├── backend/
│   ├── config/
│   │   └── db.js                    # MongoDB connection
│   ├── controllers/
│   │   ├── authController.js        # Register, Login, Profile
│   │   ├── jobController.js         # Job CRUD + AI JD Generator
│   │   ├── applicationController.js # Apply, AI Analysis, Status
│   │   └── resumeController.js      # Upload, Parse, Manage
│   ├── middleware/
│   │   ├── auth.js                  # JWT protect + role authorize
│   │   └── upload.js                # Multer file upload
│   ├── models/
│   │   ├── User.js                  # Users (jobseeker/recruiter)
│   │   ├── Job.js                   # Job listings
│   │   ├── Application.js           # Applications + AI analysis
│   │   └── Resume.js                # Resume files + parsed data
│   ├── routes/
│   │   ├── authRoutes.js
│   │   ├── jobRoutes.js
│   │   ├── applicationRoutes.js
│   │   └── resumeRoutes.js
│   ├── services/
│   │   ├── geminiService.js         # Gemini AI integration
│   │   └── nlpService.js            # NLP + PDF/Word parsing
│   ├── uploads/                     # Resume file storage
│   ├── server.js                    # Express app entry
│   └── .env                         # Environment variables
│
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   └── shared/
│   │   │       ├── Navbar.jsx / .css
│   │   │       └── Footer.jsx
│   │   ├── context/
│   │   │   └── AuthContext.jsx      # Global auth state
│   │   ├── pages/
│   │   │   ├── Landing.jsx / .css   # Home page
│   │   │   ├── Login.jsx            # Auth pages
│   │   │   ├── Register.jsx
│   │   │   ├── Jobs.jsx / .css      # Job search & listing
│   │   │   ├── JobDetail.jsx / .css # Job description + Apply
│   │   │   ├── JobSeekerDashboard.jsx # AI analysis, resumes
│   │   │   ├── RecruiterDashboard.jsx # Job management
│   │   │   ├── ApplicationsPage.jsx   # Candidate review
│   │   │   ├── PostJob.jsx            # AI JD generator
│   │   │   ├── Profile.jsx            # Edit profile
│   │   │   └── NotFound.jsx
│   │   ├── services/
│   │   │   └── api.js               # Axios API service
│   │   ├── App.jsx                  # Router + route guards
│   │   ├── main.jsx                 # React entry point
│   │   └── index.css                # Global design system
│   └── vite.config.js               # Vite + proxy config
│
├── package.json                     # Root scripts
└── README.md
```

---

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- MongoDB (local or Atlas)
- Gemini API Key from [aistudio.google.com](https://aistudio.google.com)

### 1. Setup Backend

```bash
cd backend
npm install
```

Edit `.env`:
```env
PORT=5001
MONGODB_URI=mongodb://localhost:27017/job_ai_powder
JWT_SECRET=your_secret_key
JWT_EXPIRE=7d
GEMINI_API_KEY=your_gemini_api_key_here
NODE_ENV=development
UPLOAD_PATH=uploads/
MAX_FILE_SIZE=10485760
```

```bash
# Start MongoDB (macOS)
mongod --dbpath /tmp/mongodb-data --port 27017 --fork --logpath /tmp/mongod.log

# Start backend
npm run dev   # or: node server.js
```

### 2. Setup Frontend

```bash
cd frontend
npm install
npm run dev
```

Frontend: `http://localhost:5173`  
Backend API: `http://localhost:5001/api`

---

## 📡 API Routes

### Authentication
| Method | Route | Access | Description |
|--------|-------|--------|-------------|
| POST | `/api/auth/register` | Public | Register user |
| POST | `/api/auth/login` | Public | Login |
| GET | `/api/auth/me` | Private | Get current user |
| PUT | `/api/auth/profile` | Private | Update profile |
| PUT | `/api/auth/change-password` | Private | Change password |

### Jobs
| Method | Route | Access | Description |
|--------|-------|--------|-------------|
| GET | `/api/jobs` | Public | List jobs (with filters) |
| GET | `/api/jobs/:id` | Public | Get single job |
| POST | `/api/jobs` | Recruiter | Create job |
| PUT | `/api/jobs/:id` | Recruiter | Update job |
| DELETE | `/api/jobs/:id` | Recruiter | Delete job |
| GET | `/api/jobs/my-jobs` | Recruiter | Get own jobs |
| POST | `/api/jobs/generate-jd` | Recruiter | **AI JD Generator** |

### Applications
| Method | Route | Access | Description |
|--------|-------|--------|-------------|
| POST | `/api/applications/:jobId/apply` | Job Seeker | Apply to job |
| GET | `/api/applications/my` | Job Seeker | Get my applications |
| GET | `/api/applications/job/:jobId` | Recruiter | Get job candidates |
| PUT | `/api/applications/:id/status` | Recruiter | Accept/Reject |
| POST | `/api/applications/:id/analyze` | Both | **Run AI Analysis** |

### Resume
| Method | Route | Access | Description |
|--------|-------|--------|-------------|
| POST | `/api/resume/upload` | Job Seeker | Upload resume (PDF/DOC) |
| GET | `/api/resume/my` | Job Seeker | Get my resumes |
| GET | `/api/resume/:id` | Both | Get resume |
| DELETE | `/api/resume/:id` | Job Seeker | Delete resume |
| PUT | `/api/resume/:id/set-default` | Job Seeker | Set default |

---

## 🤖 AI Integration

### Resume Analysis (Gemini + NLP)
```javascript
// Combined score: 60% Gemini + 40% NLP
const geminiResult = await analyzeResume(resumeText, jobDescription, requiredSkills);
const nlpResult = await analyzeWithNLP(resumeText, jobDescription, requiredSkills);
const finalScore = Math.round(geminiResult.matchScore * 0.6 + nlpResult.nlpScore * 0.4);
```

**Returns:**
- `matchScore` (0–100)
- `matchedSkills[]`
- `missingSkills[]`
- `suggestions[]` (5-7 actionable items)
- `strengths[]`
- `overallFeedback`

### JD Generation
```javascript
// POST /api/jobs/generate-jd
{
  "jobTitle": "Senior React Developer",
  "skills": ["React", "TypeScript", "Node.js"],
  "experience": "senior",
  "jobType": "full-time",
  "company": "TechCorp"
}
```

---

## 🗃️ Database Schema

### Users Collection
```json
{
  "name": "string",
  "email": "string (unique)",
  "password": "string (hashed)",
  "role": "jobseeker | recruiter",
  "skills": ["array"],
  "company": "string (recruiter)",
  "resumeUrl": "string",
  "experience": "number"
}
```

### Jobs Collection
```json
{
  "title": "string",
  "company": "string",
  "location": "string",
  "jobType": "full-time | remote | contract...",
  "experienceLevel": "entry | mid | senior...",
  "requiredSkills": ["array"],
  "description": "string",
  "recruiter": "ObjectId (ref: User)",
  "applications": ["ObjectId[]"]
}
```

### Applications Collection
```json
{
  "job": "ObjectId",
  "applicant": "ObjectId",
  "recruiter": "ObjectId",
  "resume": "ObjectId",
  "status": "pending | reviewing | shortlisted | accepted | rejected",
  "aiAnalysis": {
    "matchScore": 85,
    "matchedSkills": ["React", "Node.js"],
    "missingSkills": ["Docker"],
    "suggestions": ["Add Docker experience..."],
    "strengths": ["Strong React background"]
  }
}
```

---

## ✅ Features Checklist

### Job Seeker
- [x] Signup & Login (JWT)
- [x] Browse/search/filter jobs
- [x] View job description
- [x] Apply to jobs
- [x] Upload resume (PDF/DOC)
- [x] AI Resume Score (0-100)
- [x] Skill Gap Analysis
- [x] Improvement Suggestions
- [x] Application tracking dashboard

### Recruiter
- [x] Signup & Login (JWT)
- [x] Post jobs
- [x] AI Job Description Generator (Gemini)
- [x] View all applications per job
- [x] View candidate resume
- [x] AI-based resume score per candidate
- [x] Accept / Reject candidates
- [x] Recruiter dashboard with stats

### AI / NLP
- [x] PDF text extraction (pdf-parse)
- [x] Word document extraction (mammoth)
- [x] NLP keyword extraction (natural.js)
- [x] TF-IDF similarity scoring
- [x] Gemini AI resume analysis
- [x] Gemini AI JD generation
- [x] Combined scoring (Gemini + NLP)

---

## 🔧 Troubleshooting

| Issue | Fix |
|-------|-----|
| Port 5000 returns 403 | macOS AirPlay uses port 5000. Use port 5001 (already configured) |
| MongoDB connection error | Start MongoDB: `mongod --dbpath /tmp/mongodb-data --fork --logpath /tmp/mongod.log` |
| Gemini 404 error | Updated to `gemini-2.0-flash` model |
| Gemini 429 quota exceeded | Free tier limit hit; wait or upgrade API plan |
| File upload fails | Check `uploads/` directory exists in backend |
