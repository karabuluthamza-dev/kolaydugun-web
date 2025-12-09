import React, { Suspense, lazy } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import ProtectedRoute from './components/ProtectedRoute';
import LoadingSpinner from './components/LoadingSpinner';
import SessionTracker from './components/SessionTracker';
import MaintenanceCheck from './components/MaintenanceCheck';
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import ForgotPassword from './pages/ForgotPassword';
import UpdatePassword from './pages/UpdatePassword';
import VendorList from './pages/VendorList';
import VendorDetail from './pages/VendorDetail';
import PricingPlans from './pages/PricingPlans';
import Checkout from './pages/Checkout';


import VendorLanding from './pages/VendorLanding';
import { VendorProvider } from './context/VendorContext';
import { LanguageProvider } from './context/LanguageContext';
import { AuthProvider } from './context/AuthContext';
import { PlanningProvider } from './context/PlanningContext';

// Lazy load heavy dashboard components
const VendorDashboard = lazy(() => import('./pages/VendorDashboard'));
const ToolsDashboard = lazy(() => import('./pages/ToolsDashboard'));
const Timeline = lazy(() => import('./pages/Timeline'));
const BudgetPlanner = lazy(() => import('./pages/BudgetPlanner'));
const Weather = lazy(() => import('./pages/Weather'));
const UserDashboard = lazy(() => import('./pages/UserDashboard'));

// Marketplace pages
const LeadForm = lazy(() => import('./pages/LeadForm'));

// Admin pages
const AdminDashboard = lazy(() => import('./pages/AdminDashboard'));
const AdminCreditApproval = lazy(() => import('./pages/AdminCreditApproval'));
const AdminVendors = lazy(() => import('./pages/AdminVendors'));
const AdminConfig = lazy(() => import('./pages/AdminConfig'));
const AdminTranslations = lazy(() => import('./pages/AdminTranslations'));
const AdminCategories = lazy(() => import('./pages/AdminCategories'));
const AdminBlog = lazy(() => import('./pages/AdminBlog'));
const AdminLeads = lazy(() => import('./pages/AdminLeads'));
const AdminUsers = lazy(() => import('./pages/AdminUsers'));
const AdminPricing = lazy(() => import('./pages/AdminPricing'));
const AdminAnalytics = lazy(() => import('./pages/AdminAnalytics'));
const AdminReviews = lazy(() => import('./pages/AdminReviews')); // Lazy load
const AdminMessages = lazy(() => import('./pages/AdminMessages'));
const AdminMessaging = lazy(() => import('./pages/AdminMessaging'));
const AdminFinance = lazy(() => import('./pages/AdminFinance'));
const AdminComments = lazy(() => import('./pages/AdminComments')); // Blog comments
const AdminFAQ = lazy(() => import('./pages/AdminFAQ'));
const AdminNotifications = lazy(() => import('./pages/AdminNotifications'));
const UserNotifications = lazy(() => import('./pages/UserNotifications'));
const AdminLayout = lazy(() => import('./components/AdminLayout'));
const CoupleMessages = lazy(() => import('./components/CoupleMessages'));
const Blog = lazy(() => import('./pages/Blog'));
const BlogPost = lazy(() => import('./pages/BlogPost'));
const AdminPages = lazy(() => import('./pages/AdminPages'));
const AdminPageEdit = lazy(() => import('./pages/AdminPageEdit'));
const DynamicPage = lazy(() => import('./pages/DynamicPage'));
const AdminCategoryManager = lazy(() => import('./pages/AdminCategoryManager'));
const WeddingWebsiteSetup = lazy(() => import('./pages/WeddingWebsiteSetup'));
const SeatingChart = lazy(() => import('./pages/SeatingChart'));
const PrintableSeatingChart = lazy(() => import('./components/seating/PrintableSeatingChart'));
const PublicWedding = lazy(() => import('./pages/PublicWedding'));
const Impressum = lazy(() => import('./pages/legal/Impressum'));
const Datenschutz = lazy(() => import('./pages/legal/Datenschutz'));
const AGB = lazy(() => import('./pages/legal/AGB'));
const Widerrufsrecht = lazy(() => import('./pages/legal/Widerrufsrecht'));
const FAQPage = lazy(() => import('./pages/FAQPage'));
import PrivacyBanner from './components/PrivacyBanner';


function App() {
  return (
    <AuthProvider>
      <VendorProvider>
        <PlanningProvider>
          <Router>
            <div className="app">
              <SessionTracker />
              <MaintenanceCheck />
              <Navbar />
              <Suspense fallback={
                <div className="section container" style={{ marginTop: '100px', display: 'flex', justifyContent: 'center' }}>
                  <LoadingSpinner size="large" />
                </div>
              }>
                <PrivacyBanner />
                <Routes>
                  <Route path="/" element={<Home />} />
                  <Route path="/login" element={<Login />} />
                  <Route path="/register" element={<Register />} />
                  <Route path="/forgot-password" element={<ForgotPassword />} />
                  <Route path="/update-password" element={<UpdatePassword />} />
                  <Route path="/vendors" element={<VendorList />} />
                  <Route path="/services" element={<VendorList />} /> {/* Alias for vendors */}
                  <Route path="/vendors/:slug" element={<VendorDetail />} />

                  <Route path="/blog" element={<Blog />} />
                  <Route path="/blog/:slug" element={<BlogPost />} />
                  <Route path="/faq" element={<FAQPage />} />
                  <Route path="/vendor-register" element={<VendorLanding />} />
                  <Route path="/tools" element={
                    <ProtectedRoute allowedTypes={['couple', 'admin']}>
                      <ToolsDashboard />
                    </ProtectedRoute>
                  } />
                  <Route path="/tools/timeline" element={
                    <ProtectedRoute allowedTypes={['couple', 'admin']}>
                      <Timeline />
                    </ProtectedRoute>
                  } />
                  <Route path="/tools/budget" element={
                    <ProtectedRoute allowedTypes={['couple', 'admin']}>
                      <BudgetPlanner />
                    </ProtectedRoute>
                  } />
                  <Route path="/tools/weather" element={
                    <ProtectedRoute allowedTypes={['couple', 'admin']}>
                      <Weather />
                    </ProtectedRoute>
                  } />
                  <Route path="/tools/website" element={
                    <ProtectedRoute allowedTypes={['couple', 'admin']}>
                      <WeddingWebsiteSetup />
                    </ProtectedRoute>
                  } />
                  <Route path="/tools/seating" element={
                    <ProtectedRoute allowedTypes={['couple', 'admin']}>
                      <SeatingChart />
                    </ProtectedRoute>
                  } />
                  <Route path="/tools/seating/print" element={
                    <ProtectedRoute allowedTypes={['couple', 'admin']}>
                      <PrintableSeatingChart />
                    </ProtectedRoute>
                  } />
                  <Route path="/lead-form" element={<LeadForm />} />

                  {/* Dynamic CMS Pages */}
                  <Route path="/p/:slug" element={<DynamicPage />} />
                  <Route path="/w/:slug" element={<PublicWedding />} />

                  {/* Vendor Dashboard */}
                  <Route path="/checkout" element={
                    <ProtectedRoute allowedTypes={['vendor']}>
                      <Checkout />
                    </ProtectedRoute>
                  } />
                  <Route path="/vendor/dashboard" element={
                    <ProtectedRoute allowedTypes={['vendor']}>
                      <VendorDashboard />
                    </ProtectedRoute>
                  } />
                  <Route path="/vendor/pricing" element={<PricingPlans />} />

                  {/* Legal Pages - Dynamic */}
                  {/* Route already defined above at line 137, but keeping one instance here for clarity if preferred, or just removing duplicates */}

                  {/* User Dashboard */}
                  <Route path="/user-dashboard" element={
                    <ProtectedRoute allowedTypes={['couple']}>
                      <UserDashboard />
                    </ProtectedRoute>
                  } />

                  {/* Couple Messages */}
                  <Route path="/messages" element={
                    <ProtectedRoute allowedTypes={['couple', 'admin']}>
                      <CoupleMessages />
                    </ProtectedRoute>
                  } />

                  {/* Admin Routes */}
                  <Route path="/admin" element={
                    <ProtectedRoute allowedTypes={['admin']}>
                      <AdminLayout />
                    </ProtectedRoute>
                  }>
                    <Route index element={<AdminDashboard />} />
                    <Route path="config" element={<AdminConfig />} />
                    <Route path="pages" element={<AdminPages />} />
                    <Route path="pages/new" element={<AdminPageEdit />} />
                    <Route path="pages/new" element={<AdminPageEdit />} />
                    <Route path="pages/edit/:id" element={<AdminPageEdit />} />
                    <Route path="categories" element={<AdminCategoryManager />} />
                    <Route path="faq" element={<AdminFAQ />} />
                    <Route path="translations" element={<AdminTranslations />} />
                    <Route path="blog" element={<AdminBlog />} />
                    <Route path="vendors" element={<AdminVendors />} />
                    <Route path="leads" element={<AdminLeads />} />
                    <Route path="users" element={<AdminUsers />} />
                    <Route path="credit-approval" element={<AdminCreditApproval />} />
                    <Route path="pricing" element={<AdminPricing />} />
                    <Route path="analytics" element={<AdminAnalytics />} />
                    <Route path="reviews" element={<AdminReviews />} />
                    <Route path="finance" element={<AdminFinance />} />
                    <Route path="messages" element={<AdminMessages />} />
                    <Route path="messaging" element={<AdminMessaging />} />
                    <Route path="comments" element={<AdminComments />} />
                    <Route path="notifications" element={<AdminNotifications />} />
                  </Route>

                  {/* User Routes */}
                  <Route path="/notifications" element={<ProtectedRoute allowedTypes={['couple', 'admin', 'vendor']}><UserNotifications /></ProtectedRoute>} />

                  <Route path="*" element={<Navigate to="/" replace />} />
                </Routes >
              </Suspense >
              <Footer />
            </div >
          </Router >
        </PlanningProvider >
      </VendorProvider >
    </AuthProvider >
  );
}

export default App;
