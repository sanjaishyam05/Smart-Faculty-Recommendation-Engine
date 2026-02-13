import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { api } from '../../api'

function AdminDashboard() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const [users, setUsers] = useState([])
  const [faculty, setFaculty] = useState([])
  const [stats, setStats] = useState(null)

  const [newFaculty, setNewFaculty] = useState({
    name: '',
    expertiseAreas: '',
    experienceYears: 1,
    availability: 'Available',
  })

  const [loading, setLoading] = useState(true)

  const loadData = async () => {
    try {
      const [usersRes, facRes, statsRes] = await Promise.all([
        api.get('/admin/users'),
        api.get('/admin/faculty'),
        api.get('/admin/stats'),
      ])
      setUsers(usersRes.data)
      setFaculty(facRes.data)
      setStats(statsRes.data)
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadData()
  }, [])

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  const handleAddFaculty = async (e) => {
    e.preventDefault()
    try {
      const payload = {
        name: newFaculty.name,
        expertiseAreas: newFaculty.expertiseAreas
          .split(',')
          .map((s) => s.trim())
          .filter(Boolean),
        experienceYears: Number(newFaculty.experienceYears),
        availability: newFaculty.availability,
      }
      await api.post('/admin/faculty', payload)
      setNewFaculty({
        name: '',
        expertiseAreas: '',
        experienceYears: 1,
        availability: 'Available',
      })
      loadData()
    } catch (err) {
      console.error(err)
    }
  }

  const handleDeleteFaculty = async (id) => {
    if (!window.confirm('Delete this faculty record?')) return
    try {
      await api.delete(`/admin/faculty/${id}`)
      loadData()
    } catch (err) {
      console.error(err)
    }
  }

  return (
    <div className="page">
      <header className="top-bar">
        <h1>Admin Dashboard</h1>
        <div className="top-bar-right">
          <span>{user?.name}</span>
          <button onClick={handleLogout}>Logout</button>
        </div>
      </header>

      {loading ? (
        <div className="page">
          <div className="card">
            <p>Loading admin data...</p>
          </div>
        </div>
      ) : (
        <div className="layout layout-admin">
          <section className="card">
            <h2>System Statistics</h2>
            {stats && (
              <ul className="stats-grid">
                <li>
                  <strong>Total users</strong>
                  <span>{stats.totalUsers}</span>
                </li>
                <li>
                  <strong>Students</strong>
                  <span>{stats.totalStudents}</span>
                </li>
                <li>
                  <strong>Faculty</strong>
                  <span>{stats.totalFaculty}</span>
                </li>
                <li>
                  <strong>Admins</strong>
                  <span>{stats.totalAdmins}</span>
                </li>
                <li>
                  <strong>Recommendations</strong>
                  <span>{stats.totalRecommendations}</span>
                </li>
              </ul>
            )}
          </section>

          <section className="card">
            <h2>Users</h2>
            <ul className="list small">
              {users.map((u) => (
                <li key={u.id} className="list-item">
                  <div>
                    <strong>{u.name}</strong>
                    <p className="muted">
                      {u.email} | Role: {u.role}
                    </p>
                  </div>
                </li>
              ))}
            </ul>
          </section>

          <section className="card">
            <h2>Faculty Records</h2>
            <form onSubmit={handleAddFaculty} className="form inline-form">
              <input
                type="text"
                placeholder="Name"
                value={newFaculty.name}
                onChange={(e) => setNewFaculty({ ...newFaculty, name: e.target.value })}
                required
              />
              <input
                type="text"
                placeholder="Expertise areas (comma separated)"
                value={newFaculty.expertiseAreas}
                onChange={(e) =>
                  setNewFaculty({ ...newFaculty, expertiseAreas: e.target.value })
                }
              />
              <input
                type="number"
                min="0"
                placeholder="Experience (years)"
                value={newFaculty.experienceYears}
                onChange={(e) =>
                  setNewFaculty({ ...newFaculty, experienceYears: e.target.value })
                }
              />
              <select
                value={newFaculty.availability}
                onChange={(e) =>
                  setNewFaculty({ ...newFaculty, availability: e.target.value })
                }
              >
                <option value="Available">Available</option>
                <option value="Limited">Limited</option>
                <option value="Busy">Busy</option>
              </select>
              <button type="submit">Add Faculty</button>
            </form>

            <ul className="list small">
              {faculty.map((f) => (
                <li key={f.id} className="list-item">
                  <div>
                    <strong>{f.name}</strong>
                    <p className="muted">
                      {f.expertiseAreas.join(', ')} | {f.experienceYears} years |{' '}
                      {f.availability}
                    </p>
                  </div>
                  <button
                    className="danger"
                    onClick={() => handleDeleteFaculty(f.id)}
                  >
                    Remove
                  </button>
                </li>
              ))}
            </ul>
          </section>

          <section className="card">
            <h2>Faculty Workload</h2>
            {stats && (
              <ul className="list small">
                {stats.facultyWorkload.map((fw) => (
                  <li key={fw.facultyId} className="list-item">
                    <div>
                      <strong>{fw.name}</strong>
                      <p className="muted">
                        Recommendations count: {fw.recommendationCount}
                      </p>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </section>
        </div>
      )}
    </div>
  )
}

export default AdminDashboard

