import { useEffect, useRef, useState } from 'react'
import './App.css'
import AuthPage from './pages/AuthPage'
import Dashboard from './pages/Dashboard'
import ProfilePage from './pages/ProfilePage'
import { taskApi } from './services/taskApi'

const TOKEN_STORAGE_KEY = 'taskflow-auth-token'

function readStoredToken() {
  try {
    return window.localStorage.getItem(TOKEN_STORAGE_KEY)
  } catch (error) {
    console.error('Could not read the TaskFlow session token.', error)
    return null
  }
}

function App() {
  const [initialToken] = useState(readStoredToken)
  const [account, setAccount] = useState(() => ({
    user: null,
    token: initialToken,
    loading: Boolean(initialToken),
    error: '',
  }))
  const [authMode, setAuthMode] = useState('signin')
  const [activePage, setActivePage] = useState('workspace')
  const [isLogoutConfirmationOpen, setIsLogoutConfirmationOpen] = useState(false)
  const logoutButtonRef = useRef(null)
  const { user, token, loading, error: accountError } = account

  useEffect(() => {
    let isMounted = true
    if (!initialToken) return () => { isMounted = false }

    taskApi.currentUser(initialToken)
      .then(({ user: currentUser }) => {
        if (isMounted) setAccount({ user: currentUser, token: initialToken, loading: false, error: '' })
      })
      .catch((requestError) => {
        if (requestError.status === 401) {
          try {
            window.localStorage.removeItem(TOKEN_STORAGE_KEY)
          } catch (storageError) {
            console.error('Could not remove the expired TaskFlow session token.', storageError)
          }
        }
        if (isMounted) {
          setAccount({ user: null, token: null, loading: false, error: requestError.message })
        }
      })

    return () => { isMounted = false }
  }, [initialToken])

  useEffect(() => {
    if (!isLogoutConfirmationOpen) return undefined

    logoutButtonRef.current?.focus()
    function handleKeyDown(event) {
      if (event.key === 'Escape') setIsLogoutConfirmationOpen(false)
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [isLogoutConfirmationOpen])

  async function handleAuthenticate(credentials, mode) {
    const result = mode === 'signup'
      ? await taskApi.signUp(credentials)
      : await taskApi.signIn(credentials)
    try {
      window.localStorage.setItem(TOKEN_STORAGE_KEY, result.token)
    } catch (storageError) {
      await taskApi.logout(result.token).catch((logoutError) => {
        console.error('Could not revoke a session after browser storage failed.', logoutError)
      })
      throw new Error(
        'Could not save your session in this browser. Check browser storage and try again.',
        { cause: storageError },
      )
    }
    setAccount({ user: result.user, token: result.token, loading: false, error: '' })
    setActivePage('workspace')
  }

  async function handleProfileUpdate(profile) {
    const { user: updatedUser } = await taskApi.updateProfile(token, profile)
    setAccount((current) => ({ ...current, user: updatedUser }))
    return true
  }

  async function handleLogout() {
    let logoutError = ''
    try {
      await taskApi.logout(token)
    } catch (requestError) {
      console.error('Could not revoke the TaskFlow session on the server.', requestError)
      logoutError = `Your browser session was cleared, but server sign-out failed: ${requestError.message}`
    }
    try {
      window.localStorage.removeItem(TOKEN_STORAGE_KEY)
    } catch (storageError) {
      console.error('Could not clear the saved TaskFlow session.', storageError)
      logoutError = `Could not clear the saved session from this browser: ${storageError.message}`
    }
    setAccount({ user: null, token: null, loading: false, error: logoutError })
    setIsLogoutConfirmationOpen(false)
    setActivePage('workspace')
    setAuthMode('signin')
  }

  if (loading) {
    return (
      <main className="grid min-h-screen place-items-center bg-slate-50 text-sm font-medium text-slate-500">
        Loading your TaskFlow workspace…
      </main>
    )
  }

  if (!user) {
    return (
      <AuthPage
        mode={authMode}
        onModeChange={setAuthMode}
        onAuthenticate={handleAuthenticate}
        accountError={accountError}
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
          storageError={accountError}
        />
      ) : (
        <Dashboard
          user={user}
          token={token}
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
              You will need to sign in again to access your workspace.
            </p>
            {accountError && <p role="alert" className="mt-3 text-sm font-medium text-rose-600">{accountError}</p>}
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
