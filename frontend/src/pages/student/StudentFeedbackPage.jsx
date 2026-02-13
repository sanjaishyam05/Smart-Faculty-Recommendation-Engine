import { useLocation, useNavigate } from 'react-router-dom'
import { useState } from 'react'
import { useAuth } from '../../context/AuthContext'
import { api } from '../../api'

function StudentFeedbackPage() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const recommendation = location.state?.recommendation

  const [selectedFacultyId, setSelectedFacultyId] = useState(
    recommendation?.results?.[0]?.id || ''
  )
  const [rating, setRating] = useState(5)
  const [comment, setComment] = useState('')
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState('')
  const [error, setError] = useState('')

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  if (!recommendation) {
    return (
      <div className="page">
        <div className="card">
          <p>No recommendation selected for feedback.</p>
          <button onClick={() => navigate('/student')}>Back to Dashboard</button>
        </div>
      </div>
    )
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setSuccess('')
    setLoading(true)
    try {
      await api.post('/feedback', {
        studentId: user.id,
        facultyId: Number(selectedFacultyId),
        rating: Number(rating),
        comment,
      })
      setSuccess('Feedback submitted successfully.')
      setTimeout(() => navigate('/student'), 1200)
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to submit feedback')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="page">
      <header className="top-bar">
        <h1>Faculty Feedback</h1>
        <div className="top-bar-right">
          <span>{user?.name}</span>
          <button onClick={handleLogout}>Logout</button>
        </div>
      </header>

      <div className="layout">
        <section className="card">
          <h2>Rate your recommended faculty</h2>
          <form onSubmit={handleSubmit} className="form">
            <label>
              Faculty
              <select
                value={selectedFacultyId}
                onChange={(e) => setSelectedFacultyId(e.target.value)}
              >
                {recommendation.results.map((f) => (
                  <option key={f.id} value={f.id}>
                    {f.name} ({Math.round(f.matchScore)}% match)
                  </option>
                ))}
              </select>
            </label>

            <label>
              Rating (1 to 5)
              <input
                type="number"
                min="1"
                max="5"
                value={rating}
                onChange={(e) => setRating(e.target.value)}
                required
              />
            </label>

            <label>
              Feedback
              <textarea
                rows="4"
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                placeholder="Share your thoughts about the recommendation..."
              />
            </label>

            {error && <p className="error-text">{error}</p>}
            {success && <p className="success-text">{success}</p>}

            <button type="submit" disabled={loading}>
              {loading ? 'Submitting...' : 'Submit Feedback'}
            </button>
          </form>
        </section>
      </div>
    </div>
  )
}

export default StudentFeedbackPage

