import { useState } from 'react'
import LoginPage from './components/LoginPage'
import DashboardLayout from './components/Dashboard/Layout'

export default function App() {
  const [session, setSession] = useState(null)

  if (!session) {
    return <LoginPage onLogin={(user) => setSession(user)} />
  }

  return <DashboardLayout session={session} onLogout={() => setSession(null)} />
}
