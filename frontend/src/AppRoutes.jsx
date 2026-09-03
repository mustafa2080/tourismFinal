import React, { useEffect, Suspense, lazy } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { GlobalTranslationSync } from './components/GlobalTranslationSync';

// Component to scroll to top on route change
const ScrollToTop = () => {
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);

  return null;
};

// Lightweight fallback shown while a lazy page chunk is loading
const PageLoadingFallback = () => (
  <div style={{
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: '40vh',
  }}>
    <div
      style={{
        width: 40,
        height: 40,
        borderRadius: '50%',
        border: '3px solid rgba(139, 92, 246, 0.15)',
        borderTopColor: '#8b5cf6',
        borderRightColor: '#3b82f6',
        animation: 'page-loader-spin 0.7s cubic-bezier(0.5, 0, 0.5, 1) infinite',
      }}
    />
    <style>{'@keyframes page-loader-spin { to { transform: rotate(360deg); } }'}</style>
  </div>
);
// HomePage stays static (first paint) — everything else is lazy-loaded per route
import HomePage from './pages/HomePage';
import { ErrorBoundary, ProtectedRoute } from './components/common';
import { ProtectedRoute as AdminProtectedRoute } from './pages/AdminDashboard/components/ProtectedRoute';

const SearchPage = lazy(() => import('./pages/SearchPage'));
const PackageDetailPage = lazy(() => import('./pages/PackageDetailPage'));
const BookingPage = lazy(() => import('./pages/BookingPage'));
const DashboardPage = lazy(() => import('./pages/DashboardPage'));
const LoginPage = lazy(() => import('./pages/LoginPage'));
const SignupPage = lazy(() => import('./pages/SignupPage'));
const ForgotPasswordPage = lazy(() => import('./pages/ForgotPasswordPage'));
const ResetPasswordPage = lazy(() => import('./pages/ResetPasswordPage'));
const AboutPage = lazy(() => import('./pages/AboutPage'));
const ContactPage = lazy(() => import('./pages/ContactPage'));
const AdminSetupPage = lazy(() => import('./pages/AdminSetupPage'));
const PrivacyPolicyPage = lazy(() => import('./pages/PrivacyPolicyPage'));
const TermsOfServicePage = lazy(() => import('./pages/TermsOfServicePage'));
const RefundPolicyPage = lazy(() => import('./pages/RefundPolicyPage'));
const CookieSettingsPage = lazy(() => import('./pages/CookieSettingsPage'));
const FAQPage = lazy(() => import('./pages/FAQPage'));
const CareersPage = lazy(() => import('./pages/CareersPage'));
const PressPage = lazy(() => import('./pages/PressPage'));

const AdminDashboard = lazy(() =>
  import('./pages/AdminDashboard/AdminDashboard').then(m => ({ default: m.AdminDashboard }))
);
const OverviewPage = lazy(() => import('./pages/AdminDashboard/pages/OverviewPage'));
const UsersPage = lazy(() => import('./pages/AdminDashboard/pages/UsersPage'));
const BookingsPage = lazy(() => import('./pages/AdminDashboard/pages/BookingsPage'));
const ReportsPage = lazy(() => import('./pages/AdminDashboard/pages/ReportsPage'));
const ReviewsPage = lazy(() => import('./pages/AdminDashboard/pages/ReviewsPage'));
const RefundsPage = lazy(() => import('./pages/AdminDashboard/pages/RefundsPage'));
const AuditLogsPage = lazy(() => import('./pages/AdminDashboard/pages/AuditLogsPage'));
const PackagesPage = lazy(() => import('./pages/AdminDashboard/pages/PackagesPage'));
const AddonsPage = lazy(() => import('./pages/AdminDashboard/pages/AddonsPage'));
const CategoriesPage = lazy(() => import('./pages/AdminDashboard/pages/CategoriesPage'));
const SettingsPage = lazy(() => import('./pages/AdminDashboard/pages/SettingsPage'));
const MyProfilePage = lazy(() => import('./pages/AdminDashboard/pages/MyProfilePage'));
const ContactMessagesPage = lazy(() => import('./pages/AdminDashboard/pages/ContactMessagesPage'));

/**
 * App Routes Configuration
 * Main routing setup for the application with all public and protected routes
 */
const AppRoutes = () => {
  return (
    <ErrorBoundary showDetails={process.env.NODE_ENV === 'development'}>
      <GlobalTranslationSync>
        <Router>
          <ScrollToTop />
          <Suspense fallback={<PageLoadingFallback />}>
          <Routes>
          {/* ============ PUBLIC ROUTES ============ */}

          {/* Home Page */}
          <Route path="/" element={<HomePage />} />

          {/* Search & Packages */}
          <Route path="/search" element={<SearchPage />} />
          <Route path="/package/:id" element={<PackageDetailPage />} />
          <Route path="/packages/:id" element={<PackageDetailPage />} />

          {/* Booking Flow */}
          <Route path="/booking/:packageId" element={<BookingPage />} />

          {/* Static Pages */}
          <Route path="/about" element={<AboutPage />} />
          <Route path="/contact" element={<ContactPage />} />

          {/* Policy & Legal Pages */}
          <Route path="/privacy" element={<PrivacyPolicyPage />} />
          <Route path="/terms" element={<TermsOfServicePage />} />
          <Route path="/refund-policy" element={<RefundPolicyPage />} />
          <Route path="/cookies" element={<CookieSettingsPage />} />

          {/* Informational Pages */}
          <Route path="/faq" element={<FAQPage />} />
          <Route path="/careers" element={<CareersPage />} />
          <Route path="/press" element={<PressPage />} />

          {/* ============ AUTHENTICATION ROUTES ============ */}

          <Route path="/login" element={<LoginPage />} />
          <Route path="/signup" element={<SignupPage />} />
          <Route path="/forgot-password" element={<ForgotPasswordPage />} />
          <Route path="/reset-password" element={<ResetPasswordPage />} />

          {/* Admin Setup - Hidden Route */}
          <Route path="/admin/setup" element={<AdminSetupPage />} />

          {/* ============ ADMIN ROUTES ============ */}
          <Route 
            path="/admin" 
            element={
              <AdminProtectedRoute>
                <AdminDashboard />
              </AdminProtectedRoute>
            }
          >
            <Route index element={<OverviewPage />} />
            <Route path="users" element={<UsersPage />} />
            <Route path="bookings" element={<BookingsPage />} />
            <Route path="reports" element={<ReportsPage />} />
            <Route path="reviews" element={<ReviewsPage />} />
            <Route path="refunds" element={<RefundsPage />} />
            <Route path="logs" element={<AuditLogsPage />} />
            <Route path="packages" element={<PackagesPage />} />
            <Route path="addons" element={<AddonsPage />} />
            <Route path="categories" element={<CategoriesPage />} />
            <Route path="settings" element={<SettingsPage />} />
            <Route path="profile" element={<MyProfilePage />} />
            <Route path="contact" element={<ContactMessagesPage />} />
          </Route>

          {/* ============ PROTECTED ROUTES ============ */}

          {/* User Dashboard */}
          <Route 
            path="/dashboard" 
            element={
              <ProtectedRoute>
                <DashboardPage />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/dashboard/*" 
            element={
              <ProtectedRoute>
                <DashboardPage />
              </ProtectedRoute>
            } 
          />

          {/* Booking Details Routes - for notification navigation */}
          <Route 
            path="/bookings" 
            element={
              <ProtectedRoute>
                <DashboardPage />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/bookings/:bookingId" 
            element={
              <ProtectedRoute>
                <DashboardPage />
              </ProtectedRoute>
            } 
          />

          {/* Dashboard Booking Routes */}
          <Route 
            path="/dashboard/bookings/:bookingId" 
            element={
              <ProtectedRoute>
                <DashboardPage />
              </ProtectedRoute>
            } 
          />

          {/* Dashboard Refund Routes */}
          <Route 
            path="/dashboard/refunds/:refundId" 
            element={
              <ProtectedRoute>
                <DashboardPage />
              </ProtectedRoute>
            } 
          />

          {/* Package Details Routes - for notification navigation */}
          <Route 
            path="/packages" 
            element={<SearchPage />}
          />
          <Route 
            path="/packages/:id" 
            element={<PackageDetailPage />}
          />

          {/* Admin Messages Route */}
          <Route 
            path="/admin/messages" 
            element={
              <AdminProtectedRoute>
                <AdminDashboard />
              </AdminProtectedRoute>
            }
          />

          {/* ============ TODO ROUTES ============ */}

          {/* Blog */}
          {/* <Route path="/blog" element={<BlogListPage />} /> */}
          {/* <Route path="/blog/:slug" element={<BlogArticlePage />} /> */}

          {/* Admin Panel */}
          {/* <Route path="/admin" element={<AdminDashboard />} /> */}
          {/* <Route path="/admin/packages" element={<AdminPackages />} /> */}
          {/* <Route path="/admin/bookings" element={<AdminBookings />} /> */}
          {/* <Route path="/admin/customers" element={<AdminCustomers />} /> */}
          {/* <Route path="/admin/blog" element={<AdminBlog />} /> */}

          {/* Password Reset */}
          {/* <Route path="/forgot-password" element={<ForgotPasswordPage />} /> */}
          {/* <Route path="/reset-password/:token" element={<ResetPasswordPage />} /> */}

          {/* ============ 404 - CATCH ALL ============ */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
        </Suspense>
      </Router>
    </GlobalTranslationSync>
    </ErrorBoundary>
  );
};

export default AppRoutes;