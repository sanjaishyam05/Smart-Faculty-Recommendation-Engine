const express = require('express');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// In-memory data stores for demo purposes
let users = [
  // Default admin
  {
    id: 1,
    name: 'Admin User',
    email: 'admin@example.com',
    password: 'admin123',
    role: 'admin',
  },
];

let faculty = [
  {
    id: 1,
    name: 'Dr. Alice AI',
    expertiseAreas: ['AI', 'ML'],
    experienceYears: 10,
    rating: 4.7,
    availability: 'Available',
    assignedStudents: [],
  },
  {
    id: 2,
    name: 'Dr. Bob IoT',
    expertiseAreas: ['IoT', 'Embedded'],
    experienceYears: 8,
    rating: 4.5,
    availability: 'Limited',
    assignedStudents: [],
  },
  {
    id: 3,
    name: 'Dr. Carol Web',
    expertiseAreas: ['Web', 'Full Stack'],
    experienceYears: 6,
    rating: 4.2,
    availability: 'Available',
    assignedStudents: [],
  },
  {
    id: 4,
    name: 'Dr. Dave DSP',
    expertiseAreas: ['DSP', 'Signal Processing'],
    experienceYears: 12,
    rating: 4.8,
    availability: 'Available',
    assignedStudents: [],
  },
];

let recommendations = [];
let feedbacks = [];

let nextUserId = users.length + 1;
let nextRecommendationId = 1;

// Helper: simple faculty scoring based on preferences
function scoreFacultyForPreference(pref, fac) {
  let score = 0;

  if (fac.expertiseAreas.includes(pref.areaOfInterest)) {
    score += 60;
  }

  if (
    (pref.projectType === 'Research' && fac.experienceYears >= 8) ||
    (pref.projectType === 'Final' && fac.experienceYears >= 5) ||
    (pref.projectType === 'Mini' && fac.experienceYears >= 2)
  ) {
    score += 20;
  }

  if (pref.academicLevel === 'PG') {
    score += fac.experienceYears >= 5 ? 10 : 0;
  } else {
    score += 5;
  }

  score += fac.rating;

  return Math.min(score, 100);
}

// Auth: registration
app.post('/api/auth/register', (req, res) => {
  const { name, email, password, role } = req.body;

  if (!name || !email || !password || !role) {
    return res.status(400).json({ message: 'All fields are required.' });
  }

  const existing = users.find((u) => u.email === email);
  if (existing) {
    return res.status(400).json({ message: 'Email already registered.' });
  }

  const user = { id: nextUserId++, name, email, password, role };
  users.push(user);

  // Auto-create a basic faculty profile if role is faculty
  if (role === 'faculty') {
    faculty.push({
      id: faculty.length + 1,
      name,
      expertiseAreas: ['AI'],
      experienceYears: 1,
      rating: 4.0,
      availability: 'Available',
      assignedStudents: [],
      email,
    });
  }

  res.status(201).json({ message: 'Registered successfully. Please login.' });
});

// Auth: login
app.post('/api/auth/login', (req, res) => {
  const { email, password } = req.body;

  const user = users.find((u) => u.email === email && u.password === password);
  if (!user) {
    return res.status(401).json({ message: 'Invalid credentials.' });
  }

  // For demo: no JWT, just return user
  res.json({
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role,
  });
});

// Get current user profile (simple, by id)
app.get('/api/users/:id', (req, res) => {
  const id = parseInt(req.params.id, 10);
  const user = users.find((u) => u.id === id);
  if (!user) {
    return res.status(404).json({ message: 'User not found' });
  }
  res.json({ id: user.id, name: user.name, email: user.email, role: user.role });
});

// Student: get faculty recommendations
app.post('/api/recommendations', (req, res) => {
  const { studentId, areaOfInterest, projectType, academicLevel } = req.body;

  if (!studentId || !areaOfInterest || !projectType || !academicLevel) {
    return res.status(400).json({ message: 'All fields are required.' });
  }

  const pref = { areaOfInterest, projectType, academicLevel };

  const ranked = faculty
    .map((f) => ({
      ...f,
      matchScore: scoreFacultyForPreference(pref, f),
    }))
    .sort((a, b) => b.matchScore - a.matchScore);

  const rec = {
    id: nextRecommendationId++,
    studentId,
    preferences: pref,
    results: ranked,
    createdAt: new Date().toISOString(),
  };
  recommendations.push(rec);

  res.json(rec);
});

// Student: list past recommendations
app.get('/api/recommendations/student/:studentId', (req, res) => {
  const studentId = parseInt(req.params.studentId, 10);
  const data = recommendations.filter((r) => r.studentId === studentId);
  res.json(data);
});

// Student: submit feedback
app.post('/api/feedback', (req, res) => {
  const { studentId, facultyId, rating, comment } = req.body;

  if (!studentId || !facultyId || !rating) {
    return res.status(400).json({ message: 'studentId, facultyId and rating are required.' });
  }

  const fb = {
    id: feedbacks.length + 1,
    studentId,
    facultyId,
    rating,
    comment: comment || '',
    createdAt: new Date().toISOString(),
  };
  feedbacks.push(fb);

  const fac = faculty.find((f) => f.id === facultyId);
  if (fac) {
    const facFeedbacks = feedbacks.filter((f) => f.facultyId === facultyId);
    const avg =
      facFeedbacks.reduce((sum, f) => sum + Number(f.rating || 0), 0) /
      (facFeedbacks.length || 1);
    fac.rating = Math.round(avg * 10) / 10;
  }

  res.status(201).json({ message: 'Feedback submitted successfully.' });
});

// Faculty: get profile by user/faculty id
app.get('/api/faculty/:id', (req, res) => {
  const id = parseInt(req.params.id, 10);
  const fac = faculty.find((f) => f.id === id);
  if (!fac) {
    return res.status(404).json({ message: 'Faculty not found' });
  }
  res.json(fac);
});

// Faculty: update expertise and availability
app.put('/api/faculty/:id', (req, res) => {
  const id = parseInt(req.params.id, 10);
  const { expertiseAreas, availability } = req.body;
  const fac = faculty.find((f) => f.id === id);
  if (!fac) {
    return res.status(404).json({ message: 'Faculty not found' });
  }
  if (Array.isArray(expertiseAreas)) {
    fac.expertiseAreas = expertiseAreas;
  }
  if (availability) {
    fac.availability = availability;
  }
  res.json(fac);
});

// Faculty: assigned students (from recommendations)
app.get('/api/faculty/:id/students', (req, res) => {
  const id = parseInt(req.params.id, 10);
  const recsForFaculty = recommendations
    .flatMap((r) =>
      r.results
        .filter((f) => f.id === id)
        .map(() => ({
          studentId: r.studentId,
          preferences: r.preferences,
          recommendationId: r.id,
        }))
    );
  res.json(recsForFaculty);
});

// Admin: list all users
app.get('/api/admin/users', (req, res) => {
  res.json(users.map(({ password, ...rest }) => rest));
});

// Admin: list all faculty
app.get('/api/admin/faculty', (req, res) => {
  res.json(faculty);
});

// Admin: add new faculty record
app.post('/api/admin/faculty', (req, res) => {
  const { name, expertiseAreas, experienceYears, availability } = req.body;
  if (!name) {
    return res.status(400).json({ message: 'Name is required.' });
  }
  const fac = {
    id: faculty.length + 1,
    name,
    expertiseAreas: expertiseAreas || ['AI'],
    experienceYears: experienceYears || 1,
    rating: 4.0,
    availability: availability || 'Available',
    assignedStudents: [],
  };
  faculty.push(fac);
  res.status(201).json(fac);
});

// Admin: update faculty record
app.put('/api/admin/faculty/:id', (req, res) => {
  const id = parseInt(req.params.id, 10);
  const fac = faculty.find((f) => f.id === id);
  if (!fac) {
    return res.status(404).json({ message: 'Faculty not found' });
  }
  const { name, expertiseAreas, experienceYears, availability } = req.body;
  if (name) fac.name = name;
  if (Array.isArray(expertiseAreas)) fac.expertiseAreas = expertiseAreas;
  if (experienceYears !== undefined) fac.experienceYears = experienceYears;
  if (availability) fac.availability = availability;
  res.json(fac);
});

// Admin: delete faculty record
app.delete('/api/admin/faculty/:id', (req, res) => {
  const id = parseInt(req.params.id, 10);
  faculty = faculty.filter((f) => f.id !== id);
  res.status(204).send();
});

// Admin: basic statistics
app.get('/api/admin/stats', (req, res) => {
  const totalUsers = users.length;
  const totalStudents = users.filter((u) => u.role === 'student').length;
  const totalFaculty = users.filter((u) => u.role === 'faculty').length;
  const totalAdmins = users.filter((u) => u.role === 'admin').length;
  const totalRecommendations = recommendations.length;

  const facultyWorkload = faculty.map((f) => {
    const recCount = recommendations.filter((r) =>
      r.results.some((res) => res.id === f.id)
    ).length;
    return {
      facultyId: f.id,
      name: f.name,
      recommendationCount: recCount,
    };
  });

  res.json({
    totalUsers,
    totalStudents,
    totalFaculty,
    totalAdmins,
    totalRecommendations,
    facultyWorkload,
  });
});

app.get('/', (req, res) => {
  res.send('Smart Faculty Recommendation Engine API is running.');
});

app.listen(PORT, () => {
  console.log(`Backend server running on http://localhost:${PORT}`);
});

