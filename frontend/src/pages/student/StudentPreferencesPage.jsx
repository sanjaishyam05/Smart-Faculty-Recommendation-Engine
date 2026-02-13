import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { api } from '../../api'

const AREAS = ['AI', 'IoT', 'Web', 'DSP', 'ML', 'Embedded', 'Full Stack']
const PROJECT_TYPES = ['Mini', 'Final', 'Research']
const LEVELS = ['UG', 'PG']

function StudentPreferencesPage() {
  const { user, logout } = useAuth()
  const [areaOfInterest, setAreaOfInterest] = useState(AREAS[0])
  const [projectType, setProjectType] = useState(PROJECT_TYPES[0])
  const [academicLevel, setAcademicLevel] = useState(LEVELS[0])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const navigate = useNavigate()

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      const res = await api.post('/recommendations', {
        studentId: user.id,
        areaOfInterest,
        projectType,
        academicLevel,
      })
      navigate('/student/recommendations', { state: { recommendation: res.data } })
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to get recommendations')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="page">
      <header className="top-bar">
        <h1>Student Preferences</h1>
        <div className="top-bar-right">
          <span>{user?.name}</span>
          <button onClick={handleLogout}>Logout</button>
        </div>
      </header>
      <div className="layout">
        <section className="card">
          <h2>Tell us about your project</h2>
          <form onSubmit={handleSubmit} className="form">
            <label>
              Area of interest
              <select
                value={areaOfInterest}
                onChange={(e) => setAreaOfInterest(e.target.value)}
              >
                {AREAS.map((a) => (
                  <option key={a} value={a}>
                    {a}
                  </option>
                ))}
              </select>
            </label>
            <label>
              Project type
              <select
                value={projectType}
                onChange={(e) => setProjectType(e.target.value)}
              >
                {PROJECT_TYPES.map((p) => (
                  <option key={p} value={p}>
                    {p}
                  </option>
                ))}
              </select>
            </label>
            <label>
              Academic level
              <select
                value={academicLevel}
                onChange={(e) => setAcademicLevel(e.target.value)}
              >
                {LEVELS.map((l) => (
                  <option key={l} value={l}>
                    {l}
                  </option>
                ))}
              </select>
            </label>
            {error && <p className="error-text">{error}</p>}
            <button type="submit" disabled={loading}>
              {loading ? 'Finding faculty...' : 'Submit'}
            </button>
          </form>
        </section>
      </div>
    </div>
  )
}

export default StudentPreferencesPage

