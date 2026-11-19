import { BrowserRouter, Link, Navigate, Route, Routes } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ToastProvider } from './context/ToastContext';
import { Footer, Navbar } from './components/Navbar';
import { LandingPage } from './pages/LandingPage';
import { ExplorePage } from './pages/ExplorePage';
import { AboutPage } from './pages/AboutPage';
import { HowItWorksPage } from './pages/HowItWorksPage';
import { LoginPage } from './pages/LoginPage';
import { DashboardPage } from './pages/DashboardPage';
import { CentreDetailPage } from './pages/CentreDetailPage';
import { TrackQueuePage } from './pages/TrackQueuePage';
import { TokenHistoryPage } from './pages/TokenHistoryPage';
import { PlaceDetailPage } from './pages/PlaceDetailPage';
import { AIAssistant } from './components/AIAssistant';

function AdminRoute() {
  const { profile, loading, session } = useAuth();
  if (loading) return <div className="container-app py-16 text-center text-navy-500">Loading your account…</div>;
  if (!session) return <Navigate to="/login" replace />;
  if (profile?.role !== 'admin') return <Navigate to="/dashboard" replace />;

  // The uploaded project has admin database policies but does not contain
  // an admin UI/page. Explain this rather than rendering a blank screen.
  return (
    <main className="container-app max-w-2xl py-16">
      <div className="card p-8 text-center">
        <h1 className="text-2xl font-semibold text-navy-900">Admin access confirmed</h1>
        <p className="mt-3 text-navy-500">
          Your account has the admin role, but this project upload does not include an
          admin management screen yet. The customer-facing queue pages are available below.
        </p>
        <div className="mt-6 flex flex-wrap justify-center gap-3">
          <Link to="/explore" className="btn-primary">Explore centres</Link>
          <Link to="/dashboard" className="btn-secondary">Open dashboard</Link>
        </div>
      </div>
    </main>
  );
}

function NotFound() {
  return (
    <main className="container-app py-20 text-center">
      <p className="text-sm font-bold uppercase tracking-widest text-electric-600">404 · Page not found</p>
      <h1 className="mt-3 text-3xl font-semibold text-navy-900">This page doesn’t exist</h1>
      <p className="mt-2 text-navy-500">Use the navigation to return to QueueLess.</p>
      <Link to="/" className="btn-primary mt-6 inline-flex">Back to home</Link>
    </main>
  );
}

function AppLayout() {
  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />
      <div className="flex-1">
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/explore" element={<ExplorePage />} />
        <Route path="/about" element={<AboutPage />} />
        <Route path="/how-it-works" element={<HowItWorksPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/dashboard" element={<DashboardPage />} />
        <Route path="/admin" element={<AdminRoute />} />
        <Route path="/centre/:id" element={<CentreDetailPage />} />
        <Route path="/place/:placeId" element={<PlaceDetailPage />} />
        <Route path="/track/:tokenId" element={<TrackQueuePage />} />
        <Route path="/history" element={<TokenHistoryPage />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
      </div>
      <Footer />
      <AIAssistant />
    </div>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <ToastProvider>
        <AuthProvider>
          <AppLayout />
        </AuthProvider>
      </ToastProvider>
    </BrowserRouter>
  );
}
