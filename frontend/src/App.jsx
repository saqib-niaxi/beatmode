import { Routes, Route, Link } from 'react-router-dom';
import Home from './pages/Home.jsx';
import EventDetail from './pages/EventDetail.jsx';
import Admin from './pages/Admin.jsx';

function Background() {
  return (
    <div aria-hidden="true" className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
      <div
        className="orb"
        style={{ width: 520, height: 520, top: -140, left: -120, background: '#ec4899', animation: 'drift 20s ease-in-out infinite' }}
      />
      <div
        className="orb"
        style={{ width: 480, height: 480, top: '15%', right: -140, background: '#f97316', animation: 'drift 24s ease-in-out infinite reverse' }}
      />
      <div
        className="orb"
        style={{ width: 560, height: 560, bottom: -200, left: '22%', background: '#7c3aed', animation: 'drift 28s ease-in-out infinite' }}
      />
    </div>
  );
}

function Layout({ children }) {
  return (
    <div className="relative min-h-screen text-slate-100">
      <Background />
      <header className="glass sticky top-0 z-30 border-x-0 border-t-0">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
          <Link to="/" className="flex items-center gap-3 text-xl font-bold tracking-tight">
            <img
              src="/logo.jpeg"
              alt="EventHub logo"
              className="h-14 w-14 rounded-xl bg-white/90 object-contain p-1 ring-1 ring-white/25"
            />
            <span>
              ITS{' '}
              <span className="bg-gradient-to-r from-pink-400 to-orange-400 bg-clip-text text-transparent">
                Beast Mode
              </span>
            </span>
          </Link>
        </div>
      </header>
      <main className="relative z-10">{children}</main>
      <footer className="relative z-10 mt-20 border-t border-white/10 py-8 text-center text-sm text-slate-400">
        ITS Beast Mode — book your spot in seconds.
      </footer>
    </div>
  );
}

export default function App() {
  return (
    <Layout>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/events/:id" element={<EventDetail />} />
        <Route path="/admin" element={<Admin />} />
      </Routes>
    </Layout>
  );
}
