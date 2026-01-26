import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { GoogleOAuthProvider } from '@react-oauth/google';
import { Toaster } from 'react-hot-toast';
import { AuthProvider, useAuth } from './context/AuthContext';

// Pages
import HomePage from './pages/HomePage';
import LoginPage from './pages/LoginPage';
import ForgotPasswordPage from './pages/ForgotPasswordPage';
import RegisterPage from './pages/RegisterPage';
import VerifyOTPPage from './pages/VerifyOTPPage';
import ServicesPage from './pages/ServicesPage';
import ServiceDetailPage from './pages/ServiceDetailPage';
import CheckoutPage from './pages/CheckoutPage';
import DashboardPage from './pages/DashboardPage';
import GoogleAuthCallback from './pages/GoogleAuthCallback';
import AuthGoogleSuccess from './pages/AuthGoogleSuccess';
import ReviewsPage from './pages/ReviewsPage';
import TermsPage from './pages/TermsPage';
import OrderDetailsPage from "./pages/OrderDetailsPage";
import UpdatesPage from "./pages/UpdatesPage";

// 💼 JOB ASSISTANT PAGES (enabled, separate from freelancing marketplace)
import JobAssistantHub from './pages/JobAssistantHub';
import JobAssistantPage from './pages/JobAssistantPage';
import AdminJobAssistant from './pages/admin/AdminJobAssistant';
import JobApplicationStatusPage from './pages/JobApplicationStatusPage';
import MyJobApplications from './pages/MyJobApplications';

// ⭐ E-BOOK PAGES
import EBooksPage from './pages/EBooksPage';
import EBookDetailPage from './pages/EBookDetailPage';
import EBookCheckoutPage from './pages/EBookCheckoutPage';
import PaymentSuccessPage from './pages/PaymentSuccessPage';
import MyEBooks from './pages/MyEBooks';
import EBookHub from './pages/EBookHub';
import BrowseEBooks from './pages/BrowseEBooks';
import MyLibrary from './pages/MyLibrary';
import AdminEBooks from './pages/admin/AdminEBooks';

// Existing Admin Pages
import ReferralPage from "./pages/ReferralPage";
import AdminHub from "./pages/admin/AdminHub";
import AdminWithdrawals from "./pages/admin/AdminWithdrawals";
import AdminDashboard from "./pages/admin/AdminDashboard";
import AdminUpdates from "./pages/admin/AdminUpdates";
import AdminUsers from "./pages/admin/AdminUsers";
import AdminLogs from "./pages/admin/AdminLogs";
import AdminActivityMonitor from "./pages/admin/AdminActivityMonitor";
import AdminPaymentRequests from "./pages/admin/AdminPaymentRequests";
import AdminRefundApprovals from "./pages/admin/AdminRefundApprovals";
import ClientPayment from "./components/ClientPayment";
import ClientReleaseFunds from "./components/ClientReleaseFunds";

// ⭐ NEW FEATURE IMPORTS (5 Features Implementation)
import AnalyticsDashboard from "./pages/admin/AnalyticsDashboard";
import CouponManagement from "./pages/admin/CouponManagement";
import ReviewModeration from "./pages/admin/ReviewModeration";
import AdminRoleManagement from "./pages/admin/AdminRoleManagement";
// Freelancing-only admin pages disabled
// import AdminContracts from "./pages/admin/AdminContracts";
// import AdminJobs from "./pages/admin/AdminJobs";
// import AdminContractDetails from "./pages/admin/AdminContractDetails";
// import AdminDisputes from "./pages/admin/AdminDisputes";
import ReferralDashboard from "./pages/ReferralDashboard";
import UserProfilePage from "./pages/UserProfilePage";

// ⭐ NEW FEATURE IMPORTS (Advanced Engagement Features)
import DataExportPage from "./pages/DataExportPage";
import UserLevelPage from "./pages/UserLevelPage";
import ActivityFeedPage from "./pages/ActivityFeedPage";
import MessagingPage from "./pages/MessagingPage";
import AdminMessaging from "./pages/admin/AdminMessaging";
import AdminOrderManagement from "./pages/admin/AdminOrderManagement";
import UserHub from "./pages/UserHub";
import UserLevelHub from "./pages/UserLevelHub";
import ActivityFeedHub from "./pages/ActivityFeedHub";
import MyReviewsHub from "./pages/MyReviewsHub";
import DataExportHub from "./pages/DataExportHub";

// ⭐ MARKETPLACE & FREELANCING IMPORTS (disabled)
// import MarketplaceHub from "./pages/MarketplaceHub";
// import BrowseJobsPage from "./pages/marketplace/BrowseJobsPage";
// import JobDetailsPage from "./pages/marketplace/JobDetailsPage";
// import PostJobPage from "./pages/marketplace/PostJobPage";
// import MyJobsPage from "./pages/marketplace/MyJobsPage";
// import MyApplicationsPage from "./pages/marketplace/MyApplicationsPage";
// import ApplyJobPage from "./pages/marketplace/ApplyJobPage";
// import JobApplicationsPage from "./pages/marketplace/JobApplicationsPage";
// import ContractsPage from "./pages/marketplace/ContractsPage";
// import ContractDetailsPage from "./pages/marketplace/ContractDetailsPage";
// import FreelancerProfileViewPage from "./pages/marketplace/FreelancerProfileViewPage";
// import FreelancerProfilePage from "./pages/marketplace/FreelancerProfilePage";
// import DisputesPage from "./pages/marketplace/DisputesPage";
// import BrowseTalentPage from "./pages/marketplace/BrowseTalentPage";

// // ⭐ FREELANCING HUB IMPORTS
// import FreelancingHub from "./pages/FreelancingHub";
// import AdminFreelancingHub from "./pages/admin/AdminFreelancingHub";
// import AdminWorkReviewPage from "./pages/admin/AdminWorkReviewPage";
// import AdminApplicantsPaymentDetails from "./pages/admin/AdminApplicantsPaymentDetails";

// Components
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import FloatingContact from './components/FloatingContact';


// Protected Route Wrapper
const ProtectedRoute = ({ children, adminOnly = false }) => {
  const { user, loading } = useAuth();

  if (loading) return <div className="loading-screen">Loading...</div>;

  if (!user) return <Navigate to="/login" replace />;

  if (adminOnly && !user.isAdmin) return <Navigate to="/dashboard" replace />;

  return children;
};

function App() {
  return (
    <GoogleOAuthProvider clientId={process.env.REACT_APP_GOOGLE_CLIENT_ID}>
      <AuthProvider>
        <Router>
          <Navbar />

          <Routes>
            {/* Public Routes */}
            <Route path="/" element={<HomePage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/forgot-password" element={<ForgotPasswordPage />} />
            <Route path="/register" element={<RegisterPage />} />
            <Route path="/verify-otp" element={<VerifyOTPPage />} />

            {/* Referral System */}
            <Route path="/referral" element={<ReferralPage />} />
            <Route path="/referral-dashboard" element={<ReferralDashboard />} />

            {/* User Profile */}
            <Route
              path="/profile"
              element={
                <ProtectedRoute>
                  <UserProfilePage />
                </ProtectedRoute>
              }
            />

            {/* USER HUB - Consolidated User Dashboard */}
            <Route
              path="/user-hub"
              element={
                <ProtectedRoute>
                  <UserHub />
                </ProtectedRoute>
              }
            />

            {/* USER HUB SUB-ROUTES */}
            <Route
              path="/user-hub/level"
              element={
                <ProtectedRoute>
                  <UserLevelHub />
                </ProtectedRoute>
              }
            />

            <Route
              path="/user-hub/activity"
              element={
                <ProtectedRoute>
                  <ActivityFeedHub />
                </ProtectedRoute>
              }
            />

            <Route
              path="/user-hub/reviews"
              element={
                <ProtectedRoute>
                  <MyReviewsHub />
                </ProtectedRoute>
              }
            />

            <Route
              path="/user-hub/export"
              element={
                <ProtectedRoute>
                  <DataExportHub />
                </ProtectedRoute>
              }
            />

            {/* Freelancing & marketplace routes removed */}

            {/* Admin Hub - Main Admin Control Center */}
            <Route
              path="/admin"
              element={
                <ProtectedRoute adminOnly={true}>
                  <AdminHub />
                </ProtectedRoute>
              }
            />

            {/* Admin Hub - Main Admin Control Center (Alternate Path) */}
            <Route
              path="/admin/hub"
              element={
                <ProtectedRoute adminOnly={true}>
                  <AdminHub />
                </ProtectedRoute>
              }
            />

            {/* Admin freelancing hub & applicants payment routes removed */}

            {/* Admin Withdrawals */}
            <Route
              path="/admin/withdrawals"
              element={
                <ProtectedRoute adminOnly={true}>
                  <AdminWithdrawals />
                </ProtectedRoute>
              }
            />

            {/* Orders */}
            <Route path="/orders/:id" element={<OrderDetailsPage />} />

            {/* Extras */}
            <Route path="/reviews" element={<ReviewsPage />} />
            <Route path="/terms" element={<TermsPage />} />
            
            {/* Services (protected) */}
            <Route
              path="/services"
              element={
                <ProtectedRoute>
                  <ServicesPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/services/:id"
              element={
                <ProtectedRoute>
                  <ServiceDetailPage />
                </ProtectedRoute>
              }
            />

            {/* Checkout */}
            <Route
              path="/checkout/:serviceId"
              element={
                <ProtectedRoute>
                  <CheckoutPage />
                </ProtectedRoute>
              }
            />

            {/* 📚 E-BOOKS ROUTES */}
            {/* Specific routes BEFORE generic ones */}
            <Route path="/ebook/:id" element={<EBookDetailPage />} />
            <Route path="/ebooks" element={<EBooksPage />} />
            <Route
              path="/checkout/ebook"
              element={
                <ProtectedRoute>
                  <EBookCheckoutPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/payment-success/ebook"
              element={
                <ProtectedRoute>
                  <PaymentSuccessPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/ebooks-hub"
              element={
                <ProtectedRoute>
                  <EBookHub />
                </ProtectedRoute>
              }
            />
            <Route
              path="/browse-ebooks"
              element={
                <ProtectedRoute>
                  <BrowseEBooks />
                </ProtectedRoute>
              }
            />
            <Route
              path="/my-library"
              element={
                <ProtectedRoute>
                  <MyLibrary />
                </ProtectedRoute>
              }
            />
            <Route
              path="/my-ebooks"
              element={
                <ProtectedRoute>
                  <MyEBooks />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/ebooks"
              element={
                <ProtectedRoute adminOnly={true}>
                  <AdminEBooks />
                </ProtectedRoute>
              }
            />

            {/* Google OAuth */}
            <Route
              path="/auth/google/callback"
              element={<GoogleAuthCallback />}
            />
            <Route
              path="/auth/google/success"
              element={<AuthGoogleSuccess />}
            />

            {/* Dashboard */}
            <Route
              path="/dashboard"
              element={
                <ProtectedRoute>
                  <DashboardPage />
                </ProtectedRoute>
              }
            />

            {/* Updates Page */}
            <Route
              path="/updates"
              element={
                <ProtectedRoute>
                  <UpdatesPage />
                </ProtectedRoute>
              }
            />

            <Route
              path="/admin/updates"
              element={
                <ProtectedRoute adminOnly={true}>
                  <AdminUpdates />
                </ProtectedRoute>
              }
            />

            <Route
              path="/admin/logs"
              element={
                <ProtectedRoute adminOnly={true}>
                  <AdminLogs />
                </ProtectedRoute>
              }
            />



            <Route
              path="/admin/activities"
              element={
                <ProtectedRoute adminOnly={true}>
                  <AdminActivityMonitor />
                </ProtectedRoute>
              }
            />

            {/* 💳 PAYMENT SYSTEM ROUTES */}
            <Route
              path="/admin/payments"
              element={
                <ProtectedRoute adminOnly={true}>
                  <AdminPaymentRequests />
                </ProtectedRoute>
              }
            />

            <Route
              path="/admin/refunds"
              element={
                <ProtectedRoute adminOnly={true}>
                  <AdminRefundApprovals />
                </ProtectedRoute>
              }
            />

            <Route
              path="/admin/users"
              element={
                <ProtectedRoute adminOnly={true}>
                  <AdminUsers />
                </ProtectedRoute>
              }
            />

            {/* ⭐ NEW FEATURE ROUTES */}
            <Route
              path="/admin/analytics"
              element={
                <ProtectedRoute adminOnly={true}>
                  <AnalyticsDashboard />
                </ProtectedRoute>
              }
            />

            <Route
              path="/admin/coupons"
              element={
                <ProtectedRoute adminOnly={true}>
                  <CouponManagement />
                </ProtectedRoute>
              }
            />

            <Route
              path="/admin/reviews"
              element={
                <ProtectedRoute adminOnly={true}>
                  <ReviewModeration />
                </ProtectedRoute>
              }
            />

            <Route
              path="/admin/roles"
              element={
                <ProtectedRoute adminOnly={true}>
                  <AdminRoleManagement />
                </ProtectedRoute>
              }
            />

            <Route
              path="/admin/messages"
              element={
                <ProtectedRoute adminOnly={true}>
                  <AdminMessaging />
                </ProtectedRoute>
              }
            />

            <Route
              path="/admin/orders"
              element={
                <ProtectedRoute adminOnly={true}>
                  <AdminOrderManagement />
                </ProtectedRoute>
              }
            />

            {/* Admin contracts/jobs/disputes routes removed (freelancing-specific) */}

            {/* ⭐ NEW ENGAGEMENT FEATURES ROUTES */}
            <Route
              path="/data-export"
              element={
                <ProtectedRoute>
                  <DataExportPage />
                </ProtectedRoute>
              }
            />

            <Route
              path="/level"
              element={
                <ProtectedRoute>
                  <UserLevelPage />
                </ProtectedRoute>
              }
            />

            <Route
              path="/activity-feed"
              element={
                <ProtectedRoute>
                  <ActivityFeedPage />
                </ProtectedRoute>
              }
            />

            <Route
              path="/messages"
              element={
                <ProtectedRoute>
                  <MessagingPage />
                </ProtectedRoute>
              }
            />

            {/* 💼 JOB ASSISTANT ROUTES (kept, not part of freelancing marketplace) */}
            <Route
              path="/job-assistant-hub"
              element={
                <ProtectedRoute>
                  <JobAssistantHub />
                </ProtectedRoute>
              }
            />

            <Route
              path="/job-assistant"
              element={
                <ProtectedRoute>
                  <JobAssistantPage />
                </ProtectedRoute>
              }
            />

            <Route
              path="/my-job-applications"
              element={
                <ProtectedRoute>
                  <MyJobApplications />
                </ProtectedRoute>
              }
            />

            {/* Application status page can be viewed from email link without login */}
            <Route
              path="/job-application-status/:id"
              element={<JobApplicationStatusPage />}
            />

            {/* Admin Job Assistant Management */}
            <Route
              path="/admin/job-applications"
              element={
                <ProtectedRoute adminOnly={true}>
                  <AdminJobAssistant />
                </ProtectedRoute>
              }
            />

            {/* Admin Panel */}
            <Route
              path="/admin/*"
              element={
                <ProtectedRoute adminOnly={true}>
                  <AdminDashboard />
                </ProtectedRoute>
              }
            />

            {/* Fallback */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>

          <FloatingContact />
          <Footer />
          <Toaster
            position="top-right"
            toastOptions={{
              duration: 4000,
              style: {
                background: "#1e293b",
                color: "#fff",
                border: "1px solid rgba(255,255,255,0.12)",
              },
            }}
          />
        </Router>
      </AuthProvider>
    </GoogleOAuthProvider>
  );
}

export default App;
