import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { api } from '../../api'

function FacultyDashboard() {
  const { user, logout } = useAuth()
  const [profile, setProfile] = useState(null)
  const [students, setStudents] = useState([])
  const [expertiseInput, setExpertiseInput] = useState('')
  const [availability, setAvailability] = useState('Available')
  const [saving, setSaving] = useState(false)
  const navigate = useNavigate()

  useEffect(() => {
    const fetchData = async () => {
      try {
        const facId = 1 // simple demo mapping: first seeded faculty
        const [profileRes, studentsRes] = await Promise.all([
          api.get(`/faculty/${facId}`),
          api.get(`/faculty/${facId}/students`),
        ])
        setProfile(profileRes.data)
        setStudents(studentsRes.data)
        setExpertiseInput(profileRes.data.expertiseAreas.join(', '))
        setAvailability(profileRes.data.availability)
      } catch (err) {
        console.error(err)
      }
    }
    fetchData()
  }, [])

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  const handleSave = async (e) => {
    e.preventDefault()
    if (!profile) return
    setSaving(true)
    try {
      const expertiseAreas = expertiseInput
        .split(',')
        .map((s) => s.trim())
        .filter(Boolean)
      const res = await api.put(`/faculty/${profile.id}`, {
        expertiseAreas,
        availability,
      })
      setProfile(res.data)
    } catch (err) {
      console.error(err)
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="page">
      <header className="top-bar">
        <h1>Faculty Dashboard</h1>
        <div className="top-bar-right">
          <span>{user?.name}</span>
          <button onClick={handleLogout}>Logout</button>
        </div>
      </header>

      <div className="layout">
        <section className="card">
          <h2>Profile Overview</h2>
          {profile ? (
            <>
              <p>
                <strong>Name:</strong> {profile.name}
              </p>
              <p>
                <strong>Expertise:</strong> {profile.expertiseAreas.join(', ')}
              </p>
              <p>
                <strong>Experience:</strong> {profile.experienceYears} years
              </p>
              <p>
                <strong>Rating:</strong> {profile.rating.toFixed(1)} / 5
              </p>
              <p>
                <strong>Availability:</strong> {profile.availability}
              </p>

              <h3>Edit Expertise & Availability</h3>
              <form onSubmit={handleSave} className="form">
                <label>
                  Expertise areas (comma separated)
                  <input
                    type="text"
                    value={expertiseInput}
                    onChange={(e) => setExpertiseInput(e.target.value)}
                  />
                </label>
                <label>
                  Availability
                  <select
                    value={availability}
                    onChange={(e) => setAvailability(e.target.value)}
                  >
                    <option value="Available">Available</option>
                    <option value="Limited">Limited</option>
                    <option value="Busy">Busy</option>
                  </select>
                </label>
                <button type="submit" disabled={saving}>
                  {saving ? 'Saving...' : 'Save Changes'}
                </button>
              </form>
            </>
          ) : (
            <p>Loading profile...</p>
          )}
        </section>

        <section className="card">
          <h2>Assigned / Interested Students</h2>
          {students.length === 0 ? (
            <p className="muted">No students assigned yet.</p>
          ) : (
            <ul className="list">
              {students.map((s) => (
                <li key={s.recommendationId} className="list-item">
                  <div>
                    <strong>Student ID: {s.studentId}</strong>
                    <p className="muted">
                      {s.preferences.areaOfInterest} - {s.preferences.projectType} (
                      {s.preferences.academicLevel})
                    </p>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>
    </div>
  )
}

export default FacultyDashboard

