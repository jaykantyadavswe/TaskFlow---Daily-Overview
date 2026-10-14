import { useEffect, useRef, useState } from 'react'
import './App.css'
import AuthPage from './pages/AuthPage'
import Dashboard from './pages/Dashboard'
import ProfilePage from './pages/ProfilePage'

const USER_STORAGE_KEY = 'taskflow-demo-user'

function readStoredUser() {
  try {
    const storedUser = window.localStorage.getItem(USER_STORAGE_KEY)
    if (!storedUser) return { user: null, error: '' }

    const user = JSON.parse(storedUser)
    if (
      typeof user?.name !== 'string'
      || typeof user?.email !== 'string'
      || !user.name.trim()
      || !user.email.trim()
    ) {
      throw new Error('Saved profile has an invalid format.')
    }

    return { user, error: '' }
  } catch (error) {
    console.error('Could not restore the TaskFlow demo profile.', error)
    return {
      user: null,
      error: 'Your saved demo session could not be restored. Check browser storage and try again.',
    }
  }
}

function App() {
  const [account, setAccount] = useState(readStoredUser)
  const [authMode, setAuthMode] = useState('signin')
  const [activePage, setActivePage] = useState('workspace')
  const [isLogoutConfirmationOpen, setIsLogoutConfirmationOpen] = useState(false)
  const logoutButtonRef = useRef(null)
  const { user, error: storageError } = account

  useEffect(() => {
    if (!isLogoutConfirmationOpen) return undefined

    logoutButtonRef.current?.focus()
    function handleKeyDown(event) {
      if (event.key === 'Escape') setIsLogoutConfirmationOpen(false)
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [isLogoutConfirmationOpen])

  function handleAuthenticate(profile) {
    try {
      window.localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(profile))
      setAccount({ user: profile, error: '' })
      setActivePage('workspace')
    } catch (error) {
      console.error('Could not save the TaskFlow demo profile.', error)
      setAccount((current) => ({
        ...current,
        error: 'Could not save your demo profile. Check browser storage and try again.',
      }))
    }
  }

  function handleProfileUpdate(profile) {
    try {
      window.localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(profile))
      setAccount({ user: profile, error: '' })
      return true
    } catch (error) {
      console.error('Could not update the TaskFlow demo profile.', error)
      setAccount((current) => ({
        ...current,
        error: 'Could not save your profile changes. Check browser storage and try again.',
      }))
      return false
    }
  }

  function handleLogout() {
    try {
      window.localStorage.removeItem(USER_STORAGE_KEY)
      setAccount({ user: null, error: '' })
      setIsLogoutConfirmationOpen(false)
      setActivePage('workspace')
      setAuthMode('signin')
    } catch (error) {
      console.error('Could not clear the TaskFlow demo session.', error)
      setAccount((current) => ({
        ...current,
        error: 'Could not clear the saved demo session. Check browser storage and try again.',
      }))
      setIsLogoutConfirmationOpen(false)
    }
  }

  if (!user) {
    return (
      <AuthPage
        mode={authMode}
        onModeChange={setAuthMode}
        onAuthenticate={handleAuthenticate}
        storageError={storageError}
      />
    )
  }

  return (
    <>
      {activePage === 'profile' ? (
      <ProfilePage
        user={user}
        onBack={() => setActivePage('workspace')}
        onSave={handleProfileUpdate}
        onLogout={() => setIsLogoutConfirmationOpen(true)}
        storageError={storageError}
      />
      ) : (
        <Dashboard
          user={user}
          onProfile={() => setActivePage('profile')}
          onLogout={() => setIsLogoutConfirmationOpen(true)}
        />
      )}
      {isLogoutConfirmationOpen && (
        <div
          className="fixed inset-0 z-40 flex items-center justify-center bg-slate-950/40 p-4 backdrop-blur-sm"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) setIsLogoutConfirmationOpen(false)
          }}
        >
          <section
            role="alertdialog"
            aria-modal="true"
            aria-labelledby="logout-heading"
            aria-describedby="logout-description"
            className="w-full max-w-sm rounded-2xl bg-white p-6 shadow-2xl shadow-slate-900/20"
          >
            <h2 id="logout-heading" className="text-lg font-bold text-slate-900">Log out of TaskFlow?</h2>
            <p id="logout-description" className="mt-2 text-sm leading-6 text-slate-500">
              Your demo profile will be removed from this browser. You can sign in again with any email.
            </p>
            {storageError && <p role="alert" className="mt-3 text-sm font-medium text-rose-600">{storageError}</p>}
            <div className="mt-6 flex justify-end gap-3">
              <button
                type="button"
                onClick={() => setIsLogoutConfirmationOpen(false)}
                className="rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
              >
                Cancel
              </button>
              <button
                type="button"
                ref={logoutButtonRef}
                onClick={handleLogout}
                className="rounded-xl bg-rose-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-rose-700 focus:outline-none focus:ring-4 focus:ring-rose-200"
              >
                Log out
              </button>
            </div>
          </section>
        </div>
      )}
    </>
  )
}

export default App
