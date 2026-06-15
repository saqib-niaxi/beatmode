import { Routes, Route, Link } from 'react-router-dom';
import Home from './pages/Home.jsx';
import EventDetail from './pages/EventDetail.jsx';
import Admin from './pages/Admin.jsx';

function Layout({ children }) {
  return (
    <div className="flex min-h-screen flex-col bg-black text-white">
      <header className="flex justify-center pt-10 pb-4 sm:pt-12">
        <Link to="/" aria-label="ITS Beast Mode — home">
          <img
            src="/logo.jpeg"
            alt="ITS Beast Mode"
            className="h-24 w-24 object-cover sm:h-28 sm:w-28"
          />
        </Link>
      </header>

      <main className="flex-1">{children}</main>

      <footer className="mt-20 pb-10 text-center text-[11px] uppercase tracking-[0.3em] text-white/30">
        ITS Beast Mode
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
