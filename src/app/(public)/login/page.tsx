'use client';

import { useState, type FormEvent, type CSSProperties } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { useAuth } from '@/hooks/useAuth';
import { APP_NAME, ROUTES } from '@/utils/constants';
import { Mail, Lock, ArrowRight, Shield, Globe, Star, Zap, Eye, EyeOff } from 'lucide-react';

/* ─── Static data (no Math.random — avoids SSR hydration mismatch) ─── */
const PARTICLES: { id: number; x: number; y: number; d: number; delay: number; color: string }[] = [
  { id: 0,  x: 12, y: 22, d: 3.5, delay: 0,   color: '#a78bfa' },
  { id: 1,  x: 87, y: 11, d: 2.8, delay: 0.6, color: '#67e8f9' },
  { id: 2,  x: 43, y: 35, d: 4.0, delay: 1.1, color: '#a78bfa' },
  { id: 3,  x: 71, y: 78, d: 2.5, delay: 1.7, color: '#67e8f9' },
  { id: 4,  x: 22, y: 88, d: 3.2, delay: 0.9, color: '#c084fc' },
  { id: 5,  x: 91, y: 52, d: 3.0, delay: 2.1, color: '#a78bfa' },
  { id: 6,  x: 8,  y: 63, d: 3.7, delay: 1.3, color: '#67e8f9' },
  { id: 7,  x: 58, y: 18, d: 2.4, delay: 0.4, color: '#a78bfa' },
  { id: 8,  x: 33, y: 72, d: 4.2, delay: 2.6, color: '#67e8f9' },
  { id: 9,  x: 79, y: 38, d: 2.9, delay: 0.8, color: '#c084fc' },
  { id: 10, x: 4,  y: 47, d: 3.4, delay: 1.9, color: '#a78bfa' },
  { id: 11, x: 62, y: 92, d: 2.6, delay: 0.3, color: '#67e8f9' },
  { id: 12, x: 18, y: 58, d: 3.1, delay: 1.7, color: '#c084fc' },
  { id: 13, x: 48, y: 5,  d: 2.7, delay: 2.3, color: '#a78bfa' },
  { id: 14, x: 95, y: 82, d: 3.8, delay: 0.5, color: '#67e8f9' },
];

const BOXES: { id: number; size: number; st: CSSProperties; c: string; dur: number; delay: number }[] = [
  { id: 0, size: 88,  st: { top: '7%',  left: '7%'   }, c: 'rgba(124,58,237,0.22)',  dur: 9.0,  delay: 0   },
  { id: 1, size: 62,  st: { top: '68%', left: '4%'   }, c: 'rgba(14,165,233,0.18)',  dur: 11.0, delay: 1.4 },
  { id: 2, size: 108, st: { top: '10%', right: '6%'  }, c: 'rgba(124,58,237,0.16)',  dur: 13.0, delay: 0.6 },
  { id: 3, size: 56,  st: { bottom: '15%', right: '10%' }, c: 'rgba(14,165,233,0.20)', dur: 8.5,  delay: 2.0 },
  { id: 4, size: 74,  st: { top: '42%', left: '2%'   }, c: 'rgba(99,102,241,0.18)',  dur: 10.5, delay: 1.1 },
];

const FEATURES = [
  { icon: Shield, title: 'Secure by default',  desc: 'JWT + refresh tokens',       color: 'purple' },
  { icon: Globe,  title: 'Live everywhere',    desc: 'Custom slug, instant publish', color: 'cyan'   },
  { icon: Star,   title: '50+ templates',      desc: 'Minimal to 3-D immersive',    color: 'amber'  },
];

const inputCls =
  'w-full rounded-xl border border-white/10 bg-white/5 py-4 pl-12 pr-4 text-sm text-white placeholder-slate-500 outline-none transition-all duration-200 focus:border-purple-500/60 focus:ring-2 focus:ring-purple-500/20 hover:border-white/20';

export default function LoginPage() {
  const { login } = useAuth();
  const [form, setForm]       = useState({ email: '', password: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError]     = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await login(form);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="relative min-h-screen overflow-hidden" style={{ background: '#050816' }}>

      {/* ── Background layer ── */}
      <div className="pointer-events-none absolute inset-0">
        {/* gradient */}
        <div className="absolute inset-0 bg-linear-to-br from-[#050816] via-[#0b1230] to-[#060a1f]" />

        {/* glowing orbs */}
        <motion.div
          className="absolute -left-40 -top-40 h-160 w-160 rounded-full bg-purple-700/25 blur-[140px]"
          animate={{ scale: [1, 1.18, 1], opacity: [0.22, 0.38, 0.22] }}
          transition={{ duration: 9, repeat: Infinity, ease: 'easeInOut' }}
        />
        <motion.div
          className="absolute -bottom-40 -right-40 h-130 w-130 rounded-full bg-cyan-600/18 blur-[130px]"
          animate={{ scale: [1, 1.22, 1], opacity: [0.15, 0.28, 0.15] }}
          transition={{ duration: 11, repeat: Infinity, ease: 'easeInOut', delay: 2.5 }}
        />
        <motion.div
          className="absolute left-1/2 top-1/2 h-90 w-90 -translate-x-1/2 -translate-y-1/2 rounded-full bg-indigo-700/12 blur-[110px]"
          animate={{ scale: [1, 1.35, 1] }}
          transition={{ duration: 14, repeat: Infinity, ease: 'easeInOut', delay: 5 }}
        />

        {/* dot grid */}
        <div
          className="absolute inset-0 opacity-[0.035]"
          style={{ backgroundImage: 'radial-gradient(circle, rgba(255,255,255,0.8) 1px, transparent 1px)', backgroundSize: '38px 38px' }}
        />

        {/* 3-D wireframe boxes */}
        {BOXES.map(b => (
          <div key={b.id} className="absolute" style={{ ...b.st }}>
            <motion.div
              style={{ width: b.size, height: b.size, border: `1px solid ${b.c}`, transformPerspective: 500 }}
              animate={{ rotateX: [0, 360], rotateY: [0, 360], opacity: [0.3, 0.65, 0.3] }}
              transition={{ duration: b.dur, delay: b.delay, repeat: Infinity, ease: 'linear' }}
            />
          </div>
        ))}

        {/* inner diagonal lines (right side) */}
        <div className="absolute inset-0 opacity-[0.025]"
          style={{ backgroundImage: 'repeating-linear-gradient(45deg, rgba(124,58,237,0.5) 0px, rgba(124,58,237,0.5) 1px, transparent 1px, transparent 60px)' }}
        />

        {/* floating particles */}
        {PARTICLES.map(p => (
          <motion.div
            key={p.id}
            className="absolute h-1 w-1 rounded-full"
            style={{ left: `${p.x}%`, top: `${p.y}%`, backgroundColor: p.color }}
            animate={{ y: [-22, 22, -22], opacity: [0, 0.75, 0], scale: [0, 1, 0] }}
            transition={{ duration: p.d, delay: p.delay, repeat: Infinity, ease: 'easeInOut' }}
          />
        ))}
      </div>

      {/* ── Content ── */}
      <div className="relative z-10 flex min-h-screen">

        {/* LEFT PANEL */}
        <motion.div
          initial={{ x: -80, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ duration: 0.85, ease: [0.22, 1, 0.36, 1] }}
          className="hidden flex-col items-center justify-center p-12 lg:flex lg:w-1/2 xl:p-20"
        >
          <div className="w-full max-w-lg">

            {/* badge */}
            <motion.div
              initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.2 }}
              className="mb-6 inline-flex items-center gap-2 rounded-full border border-purple-500/30 bg-purple-500/10 px-4 py-2"
            >
              <Zap size={13} className="text-purple-400" />
              <span className="text-xs font-medium text-purple-300">Portfolio Platform</span>
            </motion.div>

            {/* headline */}
            <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.3 }}>
              <h1 className="text-5xl font-bold leading-[1.1]">
                <span className="bg-linear-to-r from-white via-slate-200 to-white bg-clip-text text-transparent">
                  Welcome back
                </span>
                <br />
                <span className="bg-linear-to-r from-purple-400 via-cyan-400 to-purple-400 bg-clip-text text-transparent">
                  to {APP_NAME}
                </span>
              </h1>
              <p className="mt-4 leading-relaxed text-slate-400">
                Your portfolio is waiting. Sign in and keep building something remarkable.
              </p>
            </motion.div>

            {/* feature cards */}
            <div className="mt-8 space-y-3">
              {FEATURES.map((f, i) => (
                <motion.div
                  key={f.title}
                  initial={{ x: -30, opacity: 0 }} animate={{ x: 0, opacity: 1 }}
                  transition={{ delay: 0.45 + i * 0.12 }}
                  className="flex items-center gap-4 rounded-2xl border border-white/5 bg-white/3 p-4 backdrop-blur-sm transition-all hover:border-purple-500/20 hover:bg-white/5"
                >
                  <div className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ${
                    f.color === 'purple' ? 'bg-linear-to-br from-purple-600/40 to-purple-900/40' :
                    f.color === 'cyan'   ? 'bg-linear-to-br from-cyan-600/40   to-cyan-900/40'   :
                                          'bg-linear-to-br from-amber-600/40   to-amber-900/40'
                  }`}>
                    <f.icon size={17} className={
                      f.color === 'purple' ? 'text-purple-400' :
                      f.color === 'cyan'   ? 'text-cyan-400'   : 'text-amber-400'
                    } />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-white/90">{f.title}</p>
                    <p className="text-xs text-slate-500">{f.desc}</p>
                  </div>
                </motion.div>
              ))}
            </div>

            {/* stats */}
            <motion.div
              initial={{ y: 16, opacity: 0 }} animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.85 }}
              className="mt-8 flex gap-8"
            >
              {[['10 K+', 'Developers'], ['50+', 'Templates'], ['99.9 %', 'Uptime']].map(([n, l]) => (
                <div key={l}>
                  <p className="text-xl font-bold bg-linear-to-r from-purple-400 to-cyan-400 bg-clip-text text-transparent">{n}</p>
                  <p className="text-xs text-slate-500">{l}</p>
                </div>
              ))}
            </motion.div>
          </div>
        </motion.div>

        {/* RIGHT PANEL — form */}
        <motion.div
          initial={{ x: 80, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ duration: 0.85, ease: [0.22, 1, 0.36, 1] }}
          className="flex w-full items-center justify-center p-6 sm:p-10 lg:w-1/2"
        >
          <div className="w-full max-w-md">

            {/* mobile brand */}
            <div className="mb-8 text-center lg:hidden">
              <Link href={ROUTES.HOME} className="inline-flex items-center justify-center gap-2">
                <img src="/Portfolio.png" alt={APP_NAME} className="h-8 w-8 rounded-sm" />
                <span className="text-3xl font-bold bg-linear-to-r from-purple-400 to-cyan-400 bg-clip-text text-transparent">{APP_NAME}</span>
              </Link>
            </div>

            {/* glass card */}
            <div className="relative overflow-hidden rounded-3xl border border-white/10 bg-white/4 p-8 shadow-[0_8px_80px_rgba(124,58,237,0.22)] backdrop-blur-2xl sm:p-10">

              {/* top accent line */}
              <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-linear-to-r from-transparent via-purple-400/70 to-transparent" />
              {/* inner glow overlay */}
              <div className="pointer-events-none absolute inset-0 rounded-3xl bg-linear-to-br from-purple-500/8 via-transparent to-cyan-500/4" />

              <div className="relative">
                <h2 className="text-2xl font-bold text-white">Sign in</h2>
                <p className="mt-1.5 text-sm text-slate-400">
                  Welcome back to <Link href={ROUTES.HOME} className="text-purple-400 font-semibold">{APP_NAME}</Link>
                </p>

                <form onSubmit={handleSubmit} className="mt-7 space-y-4">

                  {error && (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
                      className="flex items-center gap-2 rounded-xl border border-red-500/25 bg-red-500/10 px-4 py-3 text-sm text-red-300"
                    >
                      <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-red-400" />
                      {error}
                    </motion.div>
                  )}

                  {/* Email */}
                  <motion.div
                    initial={{ y: 12, opacity: 0 }} animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.15 }}
                    className="group relative"
                  >
                    <Mail size={16} className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 transition-colors group-focus-within:text-purple-400" />
                    <input
                      type="email" placeholder="Email address" required autoComplete="email"
                      value={form.email}
                      onChange={e => setForm({ ...form, email: e.target.value })}
                      className={inputCls}
                    />
                  </motion.div>

                  {/* Password */}
                  <motion.div
                    initial={{ y: 12, opacity: 0 }} animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.22 }}
                    className="group relative"
                  >
                    <Lock size={16} className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 transition-colors group-focus-within:text-purple-400" />
                    <input
                      type={showPassword ? 'text' : 'password'} placeholder="Password" required autoComplete="current-password"
                      value={form.password}
                      onChange={e => setForm({ ...form, password: e.target.value })}
                      className={inputCls}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(s => !s)}
                      aria-label={showPassword ? 'Hide password' : 'Show password'}
                      className="absolute right-3 top-1/2 -translate-y-1/2 flex h-8 w-8 items-center justify-center rounded-lg text-slate-400 transition-colors hover:text-white"
                    >
                      {showPassword ? <Eye size={15} /> : <EyeOff size={15} />}
                    </button>
                  </motion.div>

                  <div className="flex justify-end">
                    <Link href="#" className="text-xs text-slate-500 transition-colors hover:text-purple-400">Forgot password?</Link>
                  </div>

                  {/* Submit */}
                  <motion.div initial={{ y: 12, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.28 }}>
                    <motion.button
                      type="submit" disabled={loading}
                      whileHover={{ scale: 1.02, boxShadow: '0 0 50px rgba(124,58,237,0.55)' }}
                      whileTap={{ scale: 0.98 }}
                      className="relative w-full overflow-hidden rounded-xl bg-linear-to-r from-purple-600 via-indigo-600 to-purple-700 py-4 text-sm font-semibold text-white shadow-[0_0_30px_rgba(124,58,237,0.38)] transition-all disabled:cursor-not-allowed disabled:opacity-60"
                    >
                      {/* shimmer sweep */}
                      <motion.span
                        className="pointer-events-none absolute inset-0 bg-linear-to-r from-transparent via-white/15 to-transparent"
                        animate={{ x: ['-100%', '200%'] }}
                        transition={{ duration: 2, repeat: Infinity, repeatDelay: 2.5 }}
                      />
                      <span className="relative flex items-center justify-center gap-2">
                        {loading ? (
                          <>
                            <motion.span
                              className="h-4 w-4 rounded-full border-2 border-white/30 border-t-white"
                              animate={{ rotate: 360 }}
                              transition={{ duration: 0.7, repeat: Infinity, ease: 'linear' }}
                            />
                            Signing in…
                          </>
                        ) : (
                          <>Sign In <ArrowRight size={15} /></>
                        )}
                      </span>
                    </motion.button>
                  </motion.div>
                </form>

                <div className="my-6 flex items-center gap-3">
                  <div className="h-px flex-1 bg-linear-to-r from-transparent via-white/10 to-transparent" />
                  <span className="text-xs text-slate-600">or</span>
                  <div className="h-px flex-1 bg-linear-to-r from-transparent via-white/10 to-transparent" />
                </div>

                <p className="text-center text-sm text-slate-400">
                  No account?{' '}
                  <Link href={ROUTES.REGISTER} className="font-semibold text-purple-400 transition-colors hover:text-purple-300">
                    Create one free →
                  </Link>
                </p>
              </div>
            </div>

            <p className="mt-5 text-center text-xs text-slate-600">
              By signing in you agree to our{' '}
              <Link href={ROUTES.TERMS_OF_SERVICE} className="underline underline-offset-2 hover:text-slate-400 transition-colors">Terms</Link>
              {' '}and{' '}
              <Link href={ROUTES.PRIVACY_POLICY} className="underline underline-offset-2 hover:text-slate-400 transition-colors">Privacy Policy</Link>
            </p>
          </div>
        </motion.div>
      </div>
    </div>
  );
}

