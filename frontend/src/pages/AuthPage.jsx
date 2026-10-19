import { useState } from 'react'
import { ArrowRight, Check, CircleCheck, Layers3, ShieldCheck, Sparkles } from 'lucide-react'
import { api, errorMessage } from '../api/client.js'

export default function AuthPage({ onAuthenticated }) {
  const [mode, setMode] = useState('login')
  const [form, setForm] = useState({ name: '', email: '', password: '' })
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)
  const isRegister = mode === 'register'

  async function submit(event) {
    event.preventDefault(); setError(''); setBusy(true)
    try {
      const { data } = await api.post(`/auth/${mode}`, form)
      onAuthenticated(data)
    } catch (requestError) { setError(errorMessage(requestError)) }
    finally { setBusy(false) }
  }

  return <main className="auth-shell">
    <section className="auth-story">
      <div className="brand brand-light"><span className="brand-mark"><Layers3 size={18} /></span><span>taskflow<span className="brand-dot">.</span></span></div>
      <div className="story-copy">
        <span className="eyebrow"><Sparkles size={14} /> A calmer way to get things done</span>
        <h1>Make room for<br /><span>meaningful work.</span></h1>
        <p>Bring your plans, priorities, and progress into one clear space.</p>
        <div className="story-points">
          <div><span><Check size={14} /></span><p>See every task at a glance</p></div>
          <div><span><Check size={14} /></span><p>Keep momentum with simple workflows</p></div>
          <div><span><Check size={14} /></span><p>Stay focused on what matters today</p></div>
        </div>
      </div>
      <div className="story-footer"><ShieldCheck size={15} /> Your work stays private and protected</div>
    </section>
    <section className="auth-panel">
      <div className="mobile-brand brand"><span className="brand-mark"><Layers3 size={18} /></span><span>taskflow<span className="brand-dot">.</span></span></div>
      <div className="auth-card">
        <div className="auth-symbol"><CircleCheck size={22} /></div>
        <span className="eyebrow">{isRegister ? 'YOUR WORKSPACE STARTS HERE' : 'WELCOME BACK'}</span>
        <h2>{isRegister ? 'Create your account' : 'Sign in to Taskflow'}</h2>
        <p className="auth-subtitle">{isRegister ? 'A little structure goes a long way.' : 'Your next clear day starts right here.'}</p>
        <form onSubmit={submit} className="auth-form">
          {isRegister && <label>Your name<input autoComplete="name" value={form.name} onChange={e => setForm({...form, name:e.target.value})} placeholder="Alex Morgan" required maxLength="120" /></label>}
          <label>Email address<input type="email" autoComplete="email" value={form.email} onChange={e => setForm({...form, email:e.target.value})} placeholder="you@example.com" required maxLength="190" /></label>
          <label>Password<input type="password" autoComplete={isRegister ? 'new-password' : 'current-password'} value={form.password} onChange={e => setForm({...form, password:e.target.value})} placeholder={isRegister ? 'At least 8 characters' : 'Enter your password'} required minLength={isRegister ? 8 : 1} maxLength="72" /></label>
          {error && <div className="form-error" role="alert">{error}</div>}
          <button className="button button-primary auth-submit" disabled={busy}>{busy ? 'Please wait…' : isRegister ? 'Create account' : 'Sign in'}<ArrowRight size={16} /></button>
        </form>
        <p className="auth-switch">{isRegister ? 'Already have an account?' : 'New to Taskflow?'} <button onClick={() => {setMode(isRegister ? 'login' : 'register');setError('')}}>{isRegister ? 'Sign in' : 'Create an account'}</button></p>
      </div>
      <div className="auth-bottom">Simple plans. Steady progress.</div>
    </section>
  </main>
}
