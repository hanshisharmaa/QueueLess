import { Link, NavLink, useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { Clock4, LayoutDashboard, LogOut, Menu, X } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const navLinkClass = ({ isActive }: { isActive: boolean }) =>
  `rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
    isActive ? 'text-navy-950' : 'text-navy-500 hover:text-navy-950'
  }`;

export function Navbar() {
  const { session, profile, logout } = useAuth();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  const dashboardPath = profile?.role === 'admin' ? '/admin' : '/dashboard';

  return (
    <header className="sticky top-0 z-40 border-b border-navy-100/70 bg-white/85 backdrop-blur-lg">
      <div className="container-app flex h-16 items-center justify-between gap-4">
        <Link to="/" className="flex items-center gap-2.5" onClick={() => setOpen(false)}>
          <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-navy-950">
            <Clock4 className="h-4 w-4 text-electric-200" />
          </span>
          <span className="font-display text-lg font-medium tracking-tight text-navy-950">QueueLess</span>
        </Link>

        <nav className="hidden items-center gap-1 md:flex">
          <NavLink to="/" end className={navLinkClass}>Home</NavLink>
          <NavLink to="/explore" className={navLinkClass}>Explore Centres</NavLink>
          <NavLink to="/how-it-works" className={navLinkClass}>How It Works</NavLink>
          <NavLink to="/about" className={navLinkClass}>About</NavLink>
        </nav>

        <div className="hidden items-center gap-3 md:flex">
          {session ? (
            <>
              <Link to={dashboardPath} className="btn-secondary !py-2">
                <LayoutDashboard className="h-4 w-4" />
                {profile?.role === 'admin' ? 'Admin Panel' : 'My Dashboard'}
              </Link>
              <button onClick={handleLogout} className="btn-secondary !py-2" title="Log out">
                <LogOut className="h-4 w-4" />
                Logout
              </button>
            </>
          ) : (
            <>
              <Link to="/login" className="btn-secondary !py-2">Login / Sign Up</Link>
              <Link to="/login?mode=signup" className="btn-primary !py-2">Get Started</Link>
            </>
          )}
        </div>

        <button
          className="rounded-lg p-2 text-navy-700 transition hover:bg-navy-50 md:hidden"
          onClick={() => setOpen((o) => !o)}
          aria-label="Toggle navigation menu"
          aria-expanded={open}
        >
          {open ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
      </div>

      {open && (
        <div className="border-t border-navy-100 bg-white px-4 py-4 md:hidden animate-fade-in">
          <nav className="flex flex-col gap-1">
            <NavLink to="/" end className={navLinkClass} onClick={() => setOpen(false)}>Home</NavLink>
            <NavLink to="/explore" className={navLinkClass} onClick={() => setOpen(false)}>Explore Centres</NavLink>
            <NavLink to="/how-it-works" className={navLinkClass} onClick={() => setOpen(false)}>How It Works</NavLink>
            <NavLink to="/about" className={navLinkClass} onClick={() => setOpen(false)}>About</NavLink>
          </nav>
          <div className="mt-4 flex flex-col gap-2 border-t border-navy-100 pt-4">
            {session ? (
              <>
                <Link to={dashboardPath} className="btn-secondary w-full" onClick={() => setOpen(false)}>
                  <LayoutDashboard className="h-4 w-4" />
                  {profile?.role === 'admin' ? 'Admin Panel' : 'My Dashboard'}
                </Link>
                <button onClick={handleLogout} className="btn-secondary w-full">
                  <LogOut className="h-4 w-4" />
                  Logout
                </button>
              </>
            ) : (
              <>
                <Link to="/login" className="btn-secondary w-full" onClick={() => setOpen(false)}>Login / Sign Up</Link>
                <Link to="/login?mode=signup" className="btn-primary w-full" onClick={() => setOpen(false)}>Get Started</Link>
              </>
            )}
          </div>
        </div>
      )}
    </header>
  );
}

export function Footer() {
  return (
    <footer className="border-t border-navy-100 bg-paper">
      <div className="container-app flex flex-col gap-6 py-10 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-2.5">
          <span className="flex h-7 w-7 items-center justify-center rounded-md bg-navy-950">
            <Clock4 className="h-3.5 w-3.5 text-electric-200" />
          </span>
          <p className="font-display font-medium text-navy-950">QueueLess</p>
        </div>
        <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-sm text-navy-500">
          <Link to="/explore" className="transition hover:text-navy-950">Explore centres</Link>
          <Link to="/how-it-works" className="transition hover:text-navy-950">How it works</Link>
          <Link to="/about" className="transition hover:text-navy-950">About</Link>
        </div>
      </div>
      <div className="container-app border-t border-navy-100 py-5 text-xs text-navy-400">
        © {new Date().getFullYear()} QueueLess · College project demo, queue figures are simulated · Centre photos: Wikimedia Commons contributors, CC BY / CC BY-SA
      </div>
    </footer>
  );
}
