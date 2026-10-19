import { useEffect, useState } from 'react'
import AuthPage from './pages/AuthPage.jsx'
import Dashboard from './pages/Dashboard.jsx'

function readUser() {
  try { return JSON.parse(sessionStorage.getItem('smart-task-user')) } catch { return null }
}

export default function App() {
  const [user, setUser] = useState(readUser)

  useEffect(() => {
    const expire = () => setUser(null)
    window.addEventListener('auth-expired', expire)
    return () => window.removeEventListener('auth-expired', expire)
  }, [])

  function onAuthenticated(payload) {
    sessionStorage.setItem('smart-task-token', payload.token)
    sessionStorage.setItem('smart-task-user', JSON.stringify(payload.user))
    setUser(payload.user)
  }

  function signOut() {
    sessionStorage.removeItem('smart-task-token')
    sessionStorage.removeItem('smart-task-user')
    setUser(null)
  }

  return user ? <Dashboard user={user} onSignOut={signOut} /> : <AuthPage onAuthenticated={onAuthenticated} />
}
