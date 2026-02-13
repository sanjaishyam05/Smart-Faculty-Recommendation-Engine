import './App.css'
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import LoginPage from './pages/LoginPage'
import RegisterPage from './pages/RegisterPage'
import StudentDashboard from './pages/student/StudentDashboard'
import StudentPreferencesPage from './pages/student/StudentPreferencesPage'
import StudentRecommendationsPage from './pages/student/StudentRecommendationsPage'
import StudentFeedbackPage from './pages/student/StudentFeedbackPage'
import FacultyDashboard from './pages/faculty/FacultyDashboard'
import AdminDashboard from './pages/admin/AdminDashboard'
import { AuthProvider, useAuth } from './context/AuthContext'

function ProtectedRoute({ children, allowedRoles }) {
  const { user } = useAuth()

  if (!user) {
    return <Navigate to="/login" replace />
  }

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    // Redirect to their dashboard if role not allowed
    if (user.role === 'student') return <Navigate to="/student" replace />
    if (user.role === 'faculty') return <Navigate to="/faculty" replace />
    if (user.role === 'admin') return <Navigate to="/admin" replace />
  }

  return children
}

function AppRoutes() {
  const { user } = useAuth()

  return (
    <Routes>
      <Route
        path="/"
        element={
          user ? (
            user.role === 'student' ? (
              <Navigate to="/student" replace />
            ) : user.role === 'faculty' ? (
              <Navigate to="/faculty" replace />
            ) : (
              <Navigate to="/admin" replace />
            )
          ) : (
            <Navigate to="/login" replace />
          )
        }
      />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />

      <Route
        path="/student"
        element={
          <ProtectedRoute allowedRoles={['student']}>
            <StudentDashboard />
          </ProtectedRoute>
        }
      />
      <Route
        path="/student/preferences"
        element={
          <ProtectedRoute allowedRoles={['student']}>
            <StudentPreferencesPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/student/recommendations"
        element={
          <ProtectedRoute allowedRoles={['student']}>
            <StudentRecommendationsPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/student/feedback"
        element={
          <ProtectedRoute allowedRoles={['student']}>
            <StudentFeedbackPage />
          </ProtectedRoute>
        }
      />

      <Route
        path="/faculty"
        element={
          <ProtectedRoute allowedRoles={['faculty']}>
            <FacultyDashboard />
          </ProtectedRoute>
        }
      />

      <Route
        path="/admin"
        element={
          <ProtectedRoute allowedRoles={['admin']}>
            <AdminDashboard />
          </ProtectedRoute>
        }
      />

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}

function App() {
  return (
    <AuthProvider>
      <Router>
        <AppRoutes />
      </Router>
    </AuthProvider>
  )
}

export default App
