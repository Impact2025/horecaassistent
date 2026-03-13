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
    'w-full bg-white text-[#1b1c1a] px-8 py-5 rounded-xl border-none focus:outline-none focus:ring-1 focus:ring-[#c0c9c1] transition-all placeholder:text-[#404943]/50 text-base'
  const inputShadow = { boxShadow: '0 10px 40px -10px rgba(27,28,26,0.08)' }

  return (
    <div
      className="flex flex-col min-h-screen"
      style={{ backgroundColor: '#fbf9f6', color: '#1b1c1a', minHeight: '100dvh' }}
    >
      {/* Top App Bar */}
      <header className="w-full flex justify-center items-center py-8 px-6">
        <div className="max-w-7xl w-full flex items-center justify-between">
          <button
            type="button"
            onClick={() => router.back()}
            className="p-2 text-[#404943] hover:text-[#1b1c1a] transition-colors"
          >
            <span className="material-symbols-outlined">close</span>
          </button>
          <h1 className="font-headline font-extrabold text-2xl tracking-tight text-[#003422]">
            TafelAI
          </h1>
          <div className="w-10" />
        </div>
      </header>

      {/* Main content */}
      <main className="flex-grow flex items-center justify-center px-6 pb-24">
        <div className="w-full max-w-md">
          {/* Hero header */}
          <div className="text-center mb-12">
            <h2 className="font-headline text-4xl font-extrabold tracking-tight text-[#003422] mb-4">
              {tab === 'login' ? 'Welkom terug' : 'Account aanmaken'}
            </h2>
            <p className="text-[#404943] font-body text-lg max-w-xs mx-auto">
              {tab === 'login'
                ? 'Beheer je restaurant met intelligentie.'
                : 'Start vandaag met slim restaurantbeheer.'}
            </p>
          </div>

          {/* Login form */}
          {tab === 'login' && (
            <form onSubmit={handleLogin} className="space-y-6">
              {loginError && (
                <div className="px-4 py-3 rounded-xl text-sm font-medium bg-[#ffdad6] text-[#93000a]">
                  {loginError}
                </div>
              )}
              <div className="space-y-4">
                <input
                  type="email"
                  value={loginEmail}
                  onChange={(e) => setLoginEmail(e.target.value)}
                  className={inputCls}
                  style={inputShadow}
                  placeholder="E-mailadres"
                  required
                  autoComplete="email"
                />
                <input
                  type="password"
                  value={loginPassword}
                  onChange={(e) => setLoginPassword(e.target.value)}
                  className={inputCls}
                  style={inputShadow}
                  placeholder="Wachtwoord"
                  required
                  autoComplete="current-password"
                />
              </div>
              <div className="pt-4">
                <button
                  type="submit"
                  disabled={loginLoading}
                  className="w-full font-headline font-bold py-5 rounded-full transition-all text-lg active:scale-[0.98] disabled:opacity-60 text-white"
                  style={{
                    backgroundColor: '#732d00',
                    boxShadow: loginLoading ? 'none' : '0 8px 32px rgba(115,45,0,0.2)',
                  }}
                >
                  {loginLoading ? 'Inloggen...' : 'Inloggen'}
                </button>
              </div>
              <div className="flex flex-col items-center pt-4">
                <a
                  href="#"
                  className="text-[#155039] font-label font-medium text-sm hover:underline underline-offset-4"
                >
                  Wachtwoord vergeten?
                </a>
              </div>
            </form>
          )}

          {/* Register form */}
          {tab === 'register' && (
            <form onSubmit={handleRegister} className="space-y-6">
              {regSuccess ? (
                <div className="px-4 py-6 rounded-xl text-sm font-medium text-center bg-[#d6e7db] text-[#111e17]">
                  <span className="text-2xl block mb-2">🎉</span>
                  Account aangemaakt! Je kunt nu inloggen.
                </div>
              ) : (
                <>
                  {regError && (
                    <div className="px-4 py-3 rounded-xl text-sm font-medium bg-[#ffdad6] text-[#93000a]">
                      {regError}
                    </div>
                  )}
                  <div className="space-y-4">
                    <input
                      type="text"
                      value={regName}
                      onChange={(e) => setRegName(e.target.value)}
                      className={inputCls}
                      style={inputShadow}
                      placeholder="Volledige naam"
                      required
                      autoComplete="name"
                    />
                    <input
                      type="email"
                      value={regEmail}
                      onChange={(e) => setRegEmail(e.target.value)}
                      className={inputCls}
                      style={inputShadow}
                      placeholder="E-mailadres"
                      required
                      autoComplete="email"
                    />
                    <input
                      type="password"
                      value={regPassword}
                      onChange={(e) => setRegPassword(e.target.value)}
                      className={inputCls}
                      style={inputShadow}
                      placeholder="Wachtwoord (min. 8 tekens)"
                      required
                      autoComplete="new-password"
                    />
                    <input
                      type="password"
                      value={regConfirm}
                      onChange={(e) => setRegConfirm(e.target.value)}
                      className={inputCls}
                      style={inputShadow}
                      placeholder="Wachtwoord bevestigen"
                      required
                      autoComplete="new-password"
                    />
                  </div>
                  <div className="pt-4">
                    <button
                      type="submit"
                      disabled={regLoading}
                      className="w-full font-headline font-bold py-5 rounded-full transition-all text-lg active:scale-[0.98] disabled:opacity-60 text-white"
                      style={{
                        backgroundColor: '#732d00',
                        boxShadow: regLoading ? 'none' : '0 8px 32px rgba(115,45,0,0.2)',
                      }}
                    >
                      {regLoading ? 'Account aanmaken...' : 'Account aanmaken'}
                    </button>
                  </div>
                </>
              )}
            </form>
          )}

          {/* Divider */}
          <div className="relative my-12 flex items-center justify-center">
            <div className="w-full h-px bg-[#e4e2df]" />
            <span className="absolute bg-[#fbf9f6] px-4 text-[#404943] font-label text-xs uppercase tracking-widest">
              of doorgaan met
            </span>
          </div>

          {/* Social logins */}
          <div className="grid grid-cols-2 gap-4 mb-12">
            <button
              type="button"
              className="flex items-center justify-center space-x-2 py-4 rounded-xl transition-colors"
              style={{ backgroundColor: '#f5f3f0', boxShadow: '0 10px 40px -10px rgba(27,28,26,0.08)' }}
              onClick={() => signIn('apple', { callbackUrl: '/dashboard' })}
            >
              <span className="material-symbols-outlined text-[#0f4c35]">ios</span>
              <span className="font-label text-sm font-semibold text-[#003422]">Apple</span>
            </button>
            <button
              type="button"
              className="flex items-center justify-center space-x-2 py-4 rounded-xl transition-colors"
              style={{ backgroundColor: '#f5f3f0', boxShadow: '0 10px 40px -10px rgba(27,28,26,0.08)' }}
              onClick={handleGoogleLogin}
            >
              <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
                <path d="M17.64 9.205c0-.639-.057-1.252-.164-1.841H9v3.481h4.844a4.14 4.14 0 01-1.796 2.716v2.259h2.908c1.702-1.567 2.684-3.875 2.684-6.615z" fill="#4285F4" />
                <path d="M9 18c2.43 0 4.467-.806 5.956-2.18l-2.908-2.259c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 009 18z" fill="#34A853" />
                <path d="M3.964 10.71A5.41 5.41 0 013.682 9c0-.593.102-1.17.282-1.71V4.958H.957A8.996 8.996 0 000 9c0 1.452.348 2.827.957 4.042l3.007-2.332z" fill="#FBBC05" />
                <path d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 00.957 4.958L3.964 7.29C4.672 5.163 6.656 3.58 9 3.58z" fill="#EA4335" />
              </svg>
              <span className="font-label text-sm font-semibold text-[#003422]">Google</span>
            </button>
          </div>

          <div className="text-center">
            {tab === 'login' ? (
              <p className="text-[#404943] text-sm">
                Nog geen account?{' '}
                <button
                  type="button"
                  onClick={() => setTab('register')}
                  className="text-[#003422] font-bold hover:underline underline-offset-4 ml-1"
                >
                  Account aanmaken
                </button>
              </p>
            ) : (
              <p className="text-[#404943] text-sm">
                Al een account?{' '}
                <button
                  type="button"
                  onClick={() => setTab('login')}
                  className="text-[#003422] font-bold hover:underline underline-offset-4 ml-1"
                >
                  Inloggen
                </button>
              </p>
            )}
          </div>
        </div>
      </main>

      {/* Intelligence Note */}
      <div className="max-w-md mx-auto mb-10 px-6 w-full">
        <div
          className="p-6 rounded-xl relative overflow-hidden"
          style={{ backgroundColor: 'rgba(214,231,219,0.4)' }}
        >
          <div className="flex items-start space-x-3">
            <span className="material-symbols-outlined text-[#003422] mt-1">auto_awesome</span>
            <div>
              <p className="font-headline font-bold text-[#003422] text-sm mb-1 italic">
                Intelligence Note
              </p>
              <p className="text-[#3b4a42] text-xs leading-relaxed">
                Jouw dashboard staat klaar met de afsluitrapporten van gisternacht. Bekijk je AI-inzichten zodra je bent ingelogd.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
