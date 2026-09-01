import React, { useEffect } from 'react';
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
import {
  HomePage,
  SearchPage,
  PackageDetailPage,
  BookingPage,
  DashboardPage,
  LoginPage,
  SignupPage,
  ForgotPasswordPage,
  ResetPasswordPage,
  AboutPage,
  ContactPage,
  AdminSetupPage,
  PrivacyPolicyPage,
  TermsOfServicePage,
  RefundPolicyPage,
  CookieSettingsPage,
  FAQPage,
  CareersPage,
  PressPage,
} from './pages';
import { ErrorBoundary, ProtectedRoute } from './components/common';
import { ProtectedRoute as AdminProtectedRoute } from './pages/AdminDashboard/components/ProtectedRoute';
import { AdminDashboard } from './pages/AdminDashboard/AdminDashboard';
import OverviewPage from './pages/AdminDashboard/pages/OverviewPage';
import UsersPage from './pages/AdminDashboard/pages/UsersPage';
import BookingsPage from './pages/AdminDashboard/pages/BookingsPage';
import ReportsPage from './pages/AdminDashboard/pages/ReportsPage';
import ReviewsPage from './pages/AdminDashboard/pages/ReviewsPage';
import RefundsPage from './pages/AdminDashboard/pages/RefundsPage';
import AuditLogsPage from './pages/AdminDashboard/pages/AuditLogsPage';
import PackagesPage from './pages/AdminDashboard/pages/PackagesPage';
import AddonsPage from './pages/AdminDashboard/pages/AddonsPage';
import CategoriesPage from './pages/AdminDashboard/pages/CategoriesPage';
import SettingsPage from './pages/AdminDashboard/pages/SettingsPage';
import MyProfilePage from './pages/AdminDashboard/pages/MyProfilePage';
import ContactMessagesPage from './pages/AdminDashboard/pages/ContactMessagesPage';

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
      </Router>
    </GlobalTranslationSync>
    </ErrorBoundary>
  );
};

export default AppRoutes;