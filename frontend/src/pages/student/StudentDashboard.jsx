import { useEffect, useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { api } from '../../api'

function StudentDashboard() {
  const { user, logout } = useAuth()
  const [profile, setProfile] = useState(null)
  const [pastRecommendations, setPastRecommendations] = useState([])
  const [loading, setLoading] = useState(true)
  const navigate = useNavigate()

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [profileRes, recsRes] = await Promise.all([
          api.get(`/users/${user.id}`),
          api.get(`/recommendations/student/${user.id}`),
        ])
        setProfile(profileRes.data)
        setPastRecommendations(recsRes.data)
      } catch (err) {
        console.error(err)
      } finally {
        setLoading(false)
      }
    }
    if (user?.id) fetchData()
  }, [user])

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  if (loading) {
    return (
      <div className="page">
        <div className="card">
          <p>Loading dashboard...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="page">
      <header className="top-bar">
        <h1>Student Dashboard</h1>
        <div className="top-bar-right">
          <span>{profile?.name}</span>
          <button onClick={handleLogout}>Logout</button>
        </div>
      </header>

      <div className="layout">
        <section className="card">
          <h2>Welcome, {profile?.name}</h2>
          <p className="muted">{profile?.email}</p>
          <p className="tag">Role: Student</p>
          <button onClick={() => navigate('/student/preferences')}>
            Find Faculty
          </button>
        </section>

        <section className="card">
          <h2>Past Recommendations</h2>
          {pastRecommendations.length === 0 && (
            <p className="muted">No recommendations yet. Start by finding faculty.</p>
          )}
          <ul className="list">
            {pastRecommendations.map((rec) => (
              <li key={rec.id} className="list-item">
                <div>
                  <strong>
                    {rec.preferences.areaOfInterest} - {rec.preferences.projectType}
                  </strong>
                  <p className="muted">
                    Academic Level: {rec.preferences.academicLevel} |{' '}
                    {new Date(rec.createdAt).toLocaleString()}
                  </p>
                </div>
                <Link
                  to="/student/recommendations"
                  state={{ recommendation: rec }}
                  className="link-button"
                >
                  View
                </Link>
              </li>
            ))}
          </ul>
        </section>
      </div>
    </div>
  )
}

export default StudentDashboard

