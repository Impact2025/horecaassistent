'use client'

import { useState } from 'react'
import { signIn } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { registerUser } from './actions'

type Tab = 'login' | 'register'

export default function LoginPage() {
  const router = useRouter()
  const [tab, setTab] = useState<Tab>('login')

  const [loginEmail, setLoginEmail] = useState('')
  const [loginPassword, setLoginPassword] = useState('')
  const [loginError, setLoginError] = useState('')
  const [loginLoading, setLoginLoading] = useState(false)

  const [regName, setRegName] = useState('')
  const [regEmail, setRegEmail] = useState('')
  const [regPassword, setRegPassword] = useState('')
  const [regConfirm, setRegConfirm] = useState('')
  const [regError, setRegError] = useState('')
  const [regLoading, setRegLoading] = useState(false)
  const [regSuccess, setRegSuccess] = useState(false)

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault()
    setLoginError('')
    setLoginLoading(true)

    const result = await signIn('credentials', {
      email: loginEmail,
      password: loginPassword,
      redirect: false,
    })

    setLoginLoading(false)

    if (result?.error) {
      setLoginError('Ongeldig e-mailadres of wachtwoord')
      return
    }

    router.push('/dashboard')
    router.refresh()
  }

  async function handleRegister(e: React.FormEvent) {
    e.preventDefault()
    setRegError('')

    if (regPassword !== regConfirm) {
      setRegError('Wachtwoorden komen niet overeen')
      return
    }

    setRegLoading(true)
    const result = await registerUser(regName, regEmail, regPassword)
    setRegLoading(false)

    if (result?.error) {
      setRegError(result.error)
    } else {
      setRegSuccess(true)
    }
  }

  async function handleGoogleLogin() {
    await signIn('google', { callbackUrl: '/dashboard' })
  }

  const inputCls =
    'w-full px-4 py-3.5 rounded-2xl text-sm text-white focus:outline-none transition-all login-input'

  return (
    <div
      className="flex flex-col min-h-screen"
      style={{
        background: 'linear-gradient(160deg, #001f14 0%, #003422 45%, #0a4a30 100%)',
        minHeight: '100dvh',
      }}
    >
      {/* Decorative blobs */}
      <div
        className="pointer-events-none absolute inset-0 overflow-hidden"
        aria-hidden
      >
        <div
          className="absolute -top-32 -right-32 w-80 h-80 rounded-full opacity-20"
          style={{ background: 'radial-gradient(circle, #4ade80, transparent)' }}
        />
        <div
          className="absolute top-1/3 -left-24 w-64 h-64 rounded-full opacity-10"
          style={{ background: 'radial-gradient(circle, #86efac, transparent)' }}
        />
      </div>

      {/* Hero section */}
      <div
        className="flex flex-col items-center justify-center flex-1 px-6 pt-16 pb-8 relative z-10"
        style={{ paddingTop: 'max(4rem, env(safe-area-inset-top, 0px) + 3rem)' }}
      >
        {/* Logo mark */}
        <div
          className="w-20 h-20 rounded-3xl flex items-center justify-center mb-6 shadow-2xl"
          style={{
            background: 'linear-gradient(135deg, #b4f0d0 0%, #4ade80 100%)',
            boxShadow: '0 20px 60px rgba(74, 222, 128, 0.3)',
          }}
        >
          <span
            className="material-symbols-outlined text-4xl"
            style={{ color: '#003422', fontVariationSettings: "'FILL' 1" }}
          >
            restaurant
          </span>
        </div>

        {/* Brand name */}
        <h1
          className="font-heading font-extrabold text-4xl tracking-tight text-white mb-2"
          style={{ letterSpacing: '-0.02em' }}
        >
          HorecaAI
        </h1>
        <p className="text-sm font-medium" style={{ color: 'rgba(180,240,208,0.7)' }}>
          Slim restaurant management
        </p>

        {/* Feature pills */}
        <div className="flex items-center gap-2 mt-6 flex-wrap justify-center">
          {['AI upsell', 'Realtime keuken', 'QR bestellen'].map((f) => (
            <span
              key={f}
              className="text-xs font-semibold px-3 py-1.5 rounded-full"
              style={{
                background: 'rgba(180,240,208,0.1)',
                border: '1px solid rgba(180,240,208,0.2)',
                color: 'rgba(180,240,208,0.8)',
              }}
            >
              {f}
            </span>
          ))}
        </div>
      </div>

      {/* Card */}
      <div
        className="relative z-10 w-full"
        style={{
          background: 'rgba(0,28,18,0.85)',
          backdropFilter: 'blur(40px)',
          WebkitBackdropFilter: 'blur(40px)',
          borderTop: '1px solid rgba(180,240,208,0.12)',
          borderRadius: '28px 28px 0 0',
          paddingBottom: 'max(2rem, env(safe-area-inset-bottom, 0px) + 1.5rem)',
        }}
      >
        {/* Drag handle */}
        <div className="flex justify-center pt-3 pb-1">
          <div className="w-10 h-1 rounded-full" style={{ background: 'rgba(180,240,208,0.2)' }} />
        </div>

        <div className="px-6 pt-4 pb-2 max-w-sm mx-auto w-full">
          {/* Tab switcher */}
          <div
            className="flex p-1 rounded-2xl mb-6"
            style={{ background: 'rgba(255,255,255,0.06)' }}
          >
            {(['login', 'register'] as Tab[]).map((t) => (
              <button
                key={t}
                type="button"
                onClick={() => setTab(t)}
                className="flex-1 py-2.5 text-sm font-semibold rounded-xl transition-all"
                style={
                  tab === t
                    ? {
                        background: 'rgba(180,240,208,0.15)',
                        color: '#b4f0d0',
                        boxShadow: '0 1px 4px rgba(0,0,0,0.2)',
                      }
                    : { color: 'rgba(180,240,208,0.4)' }
                }
              >
                {t === 'login' ? 'Inloggen' : 'Registreren'}
              </button>
            ))}
          </div>

          {/* Google button */}
          <button
            type="button"
            onClick={handleGoogleLogin}
            className="w-full flex items-center justify-center gap-3 py-3.5 rounded-2xl text-sm font-semibold transition-all active:scale-[0.98] mb-5"
            style={{
              background: 'rgba(255,255,255,0.08)',
              border: '1px solid rgba(255,255,255,0.12)',
              color: 'white',
            }}
          >
            <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
              <path d="M17.64 9.205c0-.639-.057-1.252-.164-1.841H9v3.481h4.844a4.14 4.14 0 01-1.796 2.716v2.259h2.908c1.702-1.567 2.684-3.875 2.684-6.615z" fill="#4285F4" />
              <path d="M9 18c2.43 0 4.467-.806 5.956-2.18l-2.908-2.259c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 009 18z" fill="#34A853" />
              <path d="M3.964 10.71A5.41 5.41 0 013.682 9c0-.593.102-1.17.282-1.71V4.958H.957A8.996 8.996 0 000 9c0 1.452.348 2.827.957 4.042l3.007-2.332z" fill="#FBBC05" />
              <path d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 00.957 4.958L3.964 7.29C4.672 5.163 6.656 3.58 9 3.58z" fill="#EA4335" />
            </svg>
            Doorgaan met Google
          </button>

          {/* Divider */}
          <div className="flex items-center gap-3 mb-5">
            <div className="flex-1 h-px" style={{ background: 'rgba(255,255,255,0.08)' }} />
            <span className="text-xs font-medium" style={{ color: 'rgba(180,240,208,0.4)' }}>of</span>
            <div className="flex-1 h-px" style={{ background: 'rgba(255,255,255,0.08)' }} />
          </div>

          {/* Login form */}
          {tab === 'login' && (
            <form onSubmit={handleLogin} className="space-y-3">
              {loginError && (
                <div
                  className="px-4 py-3 rounded-2xl text-sm font-medium"
                  style={{ background: 'rgba(239,68,68,0.15)', border: '1px solid rgba(239,68,68,0.25)', color: '#fca5a5' }}
                >
                  {loginError}
                </div>
              )}
              <input
                type="email"
                value={loginEmail}
                onChange={(e) => setLoginEmail(e.target.value)}
                className={inputCls}
                placeholder="E-mailadres"
                required
                autoComplete="email"
              />
              <input
                type="password"
                value={loginPassword}
                onChange={(e) => setLoginPassword(e.target.value)}
                className={inputCls}
                placeholder="Wachtwoord"
                required
                autoComplete="current-password"
              />
              <button
                type="submit"
                disabled={loginLoading}
                className="w-full py-4 rounded-2xl font-bold text-sm transition-all active:scale-[0.98] disabled:opacity-60 mt-1"
                style={{
                  background: 'linear-gradient(135deg, #b4f0d0 0%, #4ade80 100%)',
                  color: '#003422',
                  boxShadow: loginLoading ? 'none' : '0 8px 32px rgba(74,222,128,0.25)',
                }}
              >
                {loginLoading ? 'Inloggen...' : 'Inloggen →'}
              </button>
            </form>
          )}

          {/* Register form */}
          {tab === 'register' && (
            <form onSubmit={handleRegister} className="space-y-3">
              {regSuccess ? (
                <div
                  className="px-4 py-4 rounded-2xl text-sm font-medium text-center"
                  style={{ background: 'rgba(74,222,128,0.12)', border: '1px solid rgba(74,222,128,0.25)', color: '#86efac' }}
                >
                  <span className="text-2xl block mb-2">🎉</span>
                  Account aangemaakt! Je kunt nu inloggen.
                </div>
              ) : (
                <>
                  {regError && (
                    <div
                      className="px-4 py-3 rounded-2xl text-sm font-medium"
                      style={{ background: 'rgba(239,68,68,0.15)', border: '1px solid rgba(239,68,68,0.25)', color: '#fca5a5' }}
                    >
                      {regError}
                    </div>
                  )}
                  <input
                    type="text"
                    value={regName}
                    onChange={(e) => setRegName(e.target.value)}
                    className={inputCls}
                    placeholder="Volledige naam"
                    required
                    autoComplete="name"
                  />
                  <input
                    type="email"
                    value={regEmail}
                    onChange={(e) => setRegEmail(e.target.value)}
                    className={inputCls}
                    placeholder="E-mailadres"
                    required
                    autoComplete="email"
                  />
                  <input
                    type="password"
                    value={regPassword}
                    onChange={(e) => setRegPassword(e.target.value)}
                    className={inputCls}
                    placeholder="Wachtwoord (min. 8 tekens)"
                    required
                    autoComplete="new-password"
                  />
                  <input
                    type="password"
                    value={regConfirm}
                    onChange={(e) => setRegConfirm(e.target.value)}
                    className={inputCls}
                    placeholder="Wachtwoord bevestigen"
                    required
                    autoComplete="new-password"
                  />
                  <button
                    type="submit"
                    disabled={regLoading}
                    className="w-full py-4 rounded-2xl font-bold text-sm transition-all active:scale-[0.98] disabled:opacity-60 mt-1"
                    style={{
                      background: 'linear-gradient(135deg, #b4f0d0 0%, #4ade80 100%)',
                      color: '#003422',
                      boxShadow: regLoading ? 'none' : '0 8px 32px rgba(74,222,128,0.25)',
                    }}
                  >
                    {regLoading ? 'Account aanmaken...' : 'Account aanmaken →'}
                  </button>
                </>
              )}
            </form>
          )}

          {/* Footer */}
          <p className="text-center text-xs mt-6" style={{ color: 'rgba(180,240,208,0.3)' }}>
            Door in te loggen ga je akkoord met onze voorwaarden
          </p>
        </div>
      </div>
    </div>
  )
}
