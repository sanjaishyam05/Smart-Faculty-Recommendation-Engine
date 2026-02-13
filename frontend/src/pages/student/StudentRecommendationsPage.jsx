import { useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'

function StudentRecommendationsPage() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const recommendation = location.state?.recommendation

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  if (!recommendation) {
    return (
      <div className="page">
        <div className="card">
          <p>No recommendation selected.</p>
          <button onClick={() => navigate('/student/preferences')}>
            Find Faculty
          </button>
        </div>
      </div>
    )
  }

  const { preferences, results } = recommendation

  return (
    <div className="page">
      <header className="top-bar">
        <h1>Recommended Faculty</h1>
        <div className="top-bar-right">
          <span>{user?.name}</span>
          <button onClick={handleLogout}>Logout</button>
        </div>
      </header>

      <div className="layout">
        <section className="card">
          <h2>Your Preferences</h2>
          <p>
            <strong>Area:</strong> {preferences.areaOfInterest}
          </p>
          <p>
            <strong>Project type:</strong> {preferences.projectType}
          </p>
          <p>
            <strong>Academic level:</strong> {preferences.academicLevel}
          </p>
        </section>

        <section className="card">
          <h2>Ranked List</h2>
          <ul className="list">
            {results.map((f) => (
              <li key={f.id} className="list-item faculty-item">
                <div>
                  <h3>{f.name}</h3>
                  <p className="muted">
                    Expertise: {f.expertiseAreas.join(', ')} | Experience:{' '}
                    {f.experienceYears} years
                  </p>
                  <p className="muted">
                    Rating: {f.rating.toFixed(1)} / 5 | Availability: {f.availability}
                  </p>
                </div>
                <div className="faculty-score">
                  <span>{Math.round(f.matchScore)}%</span>
                  <span className="muted">match</span>
                </div>
              </li>
            ))}
          </ul>
          <div className="actions-row">
            <button onClick={() => navigate('/student/feedback', { state: { recommendation } })}>
              Give Feedback Later
            </button>
            <button
              className="primary"
              onClick={() =>
                navigate('/student/feedback', {
                  state: { recommendation, immediate: true },
                })
              }
            >
              Proceed & Give Feedback
            </button>
          </div>
        </section>
      </div>
    </div>
  )
}

export default StudentRecommendationsPage

