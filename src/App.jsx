import { lazy, Suspense, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Link, useLocation } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './context/AuthContext';
import { CompareProvider } from './context/CompareContext';
import Navbar from './components/Navbar/Navbar';
import Footer from './components/Footer/Footer';
import ErrorBoundary from './components/ErrorBoundary';
import './App.css';

// Retry wrapper — retries lazy import up to 2 times on chunk load failure
function lazyRetry(importFn) {
  return lazy(() =>
    importFn().catch(() =>
      new Promise(resolve => setTimeout(resolve, 1500)).then(() =>
        importFn().catch(() =>
          new Promise(resolve => setTimeout(resolve, 2000)).then(() => importFn())
        )
      )
    )
  );
}

// Lazy-load all pages — loads each chunk only when navigated to
const Home = lazyRetry(() => import('./pages/Home'));
const PropertyListing = lazyRetry(() => import('./pages/PropertyListing'));
const PropertyDetails = lazyRetry(() => import('./pages/PropertyDetails'));
const Login = lazyRetry(() => import('./pages/Auth/Login'));
const Register = lazyRetry(() => import('./pages/Auth/Register'));
const ForgotPassword = lazyRetry(() => import('./pages/Auth/ForgotPassword'));
const Profile = lazyRetry(() => import('./pages/Profile'));
const EditProfile = lazyRetry(() => import('./pages/EditProfile'));
const MyListings = lazyRetry(() => import('./pages/MyListings'));
const PropertyLeads = lazyRetry(() => import('./pages/PropertyLeads'));
const Favorites = lazyRetry(() => import('./pages/Favorites'));
const Notifications = lazyRetry(() => import('./pages/Notifications'));
const Inquiries = lazyRetry(() => import('./pages/Inquiries'));
const About = lazyRetry(() => import('./pages/About'));
const AddProperty = lazyRetry(() => import('./pages/AddProperty'));
const MapExplore = lazyRetry(() => import('./pages/MapExplore'));
const CompareProperties = lazyRetry(() => import('./pages/CompareProperties'));
const PrivacyPolicy = lazyRetry(() => import('./pages/PrivacyPolicy'));

import CompareFloatingButton from './components/CompareFloatingButton/CompareFloatingButton';

// Loading skeleton shown while a page chunk is downloading
function PageLoader() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4 pt-[100px]">
      <div className="w-10 h-10 border-[3px] border-neutral-200 border-t-neutral-900 rounded-full animate-spin" />
      <p className="text-sm font-medium text-neutral-400" style={{ fontFamily: 'Raleway, sans-serif' }}>Loading...</p>
    </div>
  );
}

function ScrollToTop() {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);
  return null;
}

function App() {
  return (
    <AuthProvider>
      <CompareProvider>
      <BrowserRouter>
        <ScrollToTop />
        <div className="app">
          <Navbar />
          <main className="main-content">
            <ErrorBoundary>
              <Suspense fallback={<PageLoader />}>
                <Routes>
                  <Route path="/" element={<Home />} />
                  <Route path="/properties" element={<PropertyListing />} />
                  <Route path="/property/:slug" element={<PropertyDetails />} />
                  <Route path="/login" element={<Login />} />
                  <Route path="/register" element={<Register />} />
                  <Route path="/forgot-password" element={<ForgotPassword />} />
                  <Route path="/profile" element={<Profile />} />
                  <Route path="/edit-profile" element={<EditProfile />} />
                  <Route path="/my-listings" element={<MyListings />} />
                  <Route path="/my-listings/:id/leads" element={<PropertyLeads />} />
                  <Route path="/favorites" element={<Favorites />} />
                  <Route path="/notifications" element={<Notifications />} />
                  <Route path="/inquiries" element={<Inquiries />} />
                  <Route path="/about" element={<About />} />
                  <Route path="/list-property" element={<AddProperty />} />
                <Route path="/map" element={<MapExplore />} />
                  <Route path="/compare" element={<CompareProperties />} />
                  <Route path="/privacy-policy" element={<PrivacyPolicy />} />
                  <Route path="*" element={
                    <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4 pt-[100px]">
                      <h1 className="text-[72px] font-black text-neutral-900">404</h1>
                      <p className="text-lg text-neutral-400">Page not found</p>
                      <a href="/" className="btn btn-primary">Go Home</a>
                    </div>
                  } />
                </Routes>
              </Suspense>
            </ErrorBoundary>
          </main>
          <Footer />
          <CompareFloatingButton />
          <Toaster position="top-right" toastOptions={{ duration: 3000, style: { background: '#0A0A0A', color: '#fff', borderRadius: '16px', fontSize: '14px', fontWeight: 600, fontFamily: 'Raleway, sans-serif' }, success: { iconTheme: { primary: '#10B981', secondary: '#fff' } }, error: { iconTheme: { primary: '#EF4444', secondary: '#fff' } } }} />
        </div>
      </BrowserRouter>
      </CompareProvider>
    </AuthProvider>
  );
}

export default App;
