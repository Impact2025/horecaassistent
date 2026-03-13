'use client'

import { useState } from 'react'
import { signIn } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { registerUser } from './actions'

type Tab = 'login' | 'register'

export default function LoginPage() {
  const router = useRouter()
  const [tab, setTab] = useState<Tab>('login')

  // Login state
  const [loginEmail, setLoginEmail] = useState('')
  const [loginPassword, setLoginPassword] = useState('')
  const [loginError, setLoginError] = useState('')
  const [loginLoading, setLoginLoading] = useState(false)

  // Register state
  const [regName, setRegName] = useState('')
  const [regEmail, setRegEmail] = useState('')
  const [regPassword, setRegPassword] = useState('')
  const [regConfirm, setRegConfirm] = useState('')
  const [regError, setRegError] = useState('')
  const [regLoading, setRegLoading] = useState(false)

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
    }
  }

  async function handleGoogleLogin() {
    await signIn('google', { callbackUrl: '/dashboard' })
  }

  const inputCls =
    'w-full px-4 py-3 rounded-xl border border-outline-variant bg-white text-on-surface text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 placeholder:text-on-surface-variant/60'

  const primaryBtnCls =
    'w-full py-3 rounded-xl bg-primary text-white font-semibold text-sm hover:bg-primary/90 transition-colors disabled:opacity-60'

  return (
    <main className="min-h-screen flex items-center justify-center bg-[#fbf9f6] p-4">
      <div className="w-full max-w-sm">
        {/* Brand */}
        <div className="text-center mb-8">
          <h1 className="font-heading text-3xl font-bold text-primary">
            HorecaAI
          </h1>
          <p className="text-on-surface-variant text-sm mt-2">
            Restaurant management
          </p>
        </div>

        {/* Card */}
        <div className="bg-white rounded-2xl shadow-sm border border-outline-variant overflow-hidden">
          {/* Tabs */}
          <div className="flex border-b border-outline-variant">
            {(['login', 'register'] as Tab[]).map((t) => (
              <button
                key={t}
                onClick={() => setTab(t)}
                className={`flex-1 py-3.5 text-sm font-medium transition-colors ${
                  tab === t
                    ? 'text-primary border-b-2 border-primary'
                    : 'text-on-surface-variant hover:text-on-surface'
                }`}
              >
                {t === 'login' ? 'Inloggen' : 'Registreren'}
              </button>
            ))}
          </div>

          <div className="p-6">
            {/* Google OAuth */}
            <button
              type="button"
              onClick={handleGoogleLogin}
              className="w-full flex items-center justify-center gap-3 py-3 rounded-xl border border-outline-variant text-sm font-medium text-on-surface hover:bg-surface-container transition-colors mb-5"
            >
              {/* Google icon SVG */}
              <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
                <path
                  d="M17.64 9.205c0-.639-.057-1.252-.164-1.841H9v3.481h4.844a4.14 4.14 0 01-1.796 2.716v2.259h2.908c1.702-1.567 2.684-3.875 2.684-6.615z"
                  fill="#4285F4"
                />
                <path
                  d="M9 18c2.43 0 4.467-.806 5.956-2.18l-2.908-2.259c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 009 18z"
                  fill="#34A853"
                />
                <path
                  d="M3.964 10.71A5.41 5.41 0 013.682 9c0-.593.102-1.17.282-1.71V4.958H.957A8.996 8.996 0 000 9c0 1.452.348 2.827.957 4.042l3.007-2.332z"
                  fill="#FBBC05"
                />
                <path
                  d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 00.957 4.958L3.964 7.29C4.672 5.163 6.656 3.58 9 3.58z"
                  fill="#EA4335"
                />
              </svg>
              Doorgaan met Google
            </button>

            <div className="flex items-center gap-3 mb-5">
              <div className="flex-1 h-px bg-outline-variant" />
              <span className="text-xs text-on-surface-variant">of</span>
              <div className="flex-1 h-px bg-outline-variant" />
            </div>

            {/* Login form */}
            {tab === 'login' && (
              <form onSubmit={handleLogin} className="space-y-4">
                {loginError && (
                  <div className="bg-[#fce4ec] text-[#880e4f] px-4 py-3 rounded-lg text-sm">
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
                  className={primaryBtnCls}
                >
                  {loginLoading ? 'Bezig...' : 'Inloggen'}
                </button>
              </form>
            )}

            {/* Register form */}
            {tab === 'register' && (
              <form onSubmit={handleRegister} className="space-y-4">
                {regError && (
                  <div className="bg-[#fce4ec] text-[#880e4f] px-4 py-3 rounded-lg text-sm">
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
                  className={primaryBtnCls}
                >
                  {regLoading ? 'Aanmaken...' : 'Account aanmaken'}
                </button>
              </form>
            )}
          </div>
        </div>
      </div>
    </main>
  )
}
