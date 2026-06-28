import { StrictMode, useState, useEffect } from 'react'
import { createRoot } from 'react-dom/client'
import { registerSW } from 'virtual:pwa-register'
import './index.css'
import App from './App.jsx'
import AdminPanel from './pages/AdminPanel.jsx'
import BarberPortal from './pages/BarberPortal.jsx'

registerSW({ immediate: true })

function Root() {
  const [hash, setHash] = useState(window.location.hash)
  useEffect(() => {
    const handler = () => setHash(window.location.hash)
    window.addEventListener('hashchange', handler)
    return () => window.removeEventListener('hashchange', handler)
  }, [])
  if (hash.startsWith('#/admin')) return <AdminPanel />
  if (hash.startsWith('#/barber')) return <BarberPortal />
  return <App />
}

createRoot(document.getElementById('root')).render(
  <StrictMode><Root /></StrictMode>
)
