import React, { Suspense, lazy } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, Outlet } from 'react-router-dom';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import ProtectedRoute from './components/ProtectedRoute';
import LoadingSpinner from './components/LoadingSpinner';
import SessionTracker from './components/SessionTracker';
import MaintenanceCheck from './components/MaintenanceCheck';
import FaviconManager from './components/FaviconManager';
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
import { SiteSettingsProvider } from './context/SiteSettingsContext';

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
const AdminAvatars = lazy(() => import('./pages/AdminAvatars'));
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
const AdminForumSettings = lazy(() => import('./pages/AdminForumSettings'));
const AdminForumCategories = lazy(() => import('./pages/AdminForumCategories'));
const AdminGhostGenerator = lazy(() => import('./pages/AdminGhostGenerator'));
const AdminBotManager = lazy(() => import('./pages/AdminBotManager'));
const AdminModeration = lazy(() => import('./pages/AdminModeration'));
const CoupleMessages = lazy(() => import('./components/CoupleMessages'));
const ProfileSettings = lazy(() => import('./pages/ProfileSettings'));
const CommunityLayout = lazy(() => import('./pages/community/CommunityLayout'));
const CommunityHome = lazy(() => import('./pages/community/CommunityHome'));
const CommunityTopicDetail = lazy(() => import('./pages/community/CommunityTopicDetail'));
const CommunityAsk = lazy(() => import('./pages/community/CommunityAsk'));
const UserProfile = lazy(() => import('./pages/community/UserProfile'));
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

// AOS - Animate on Scroll
import AOS from 'aos';
import 'aos/dist/aos.css';
import { useEffect } from 'react';

function App() {
  // Initialize AOS
  useEffect(() => {
    AOS.init({
      duration: 800,
      easing: 'ease-out',
      once: true,
      offset: 50,
    });
  }, []);

  return (
    <AuthProvider>
      <LanguageProvider>
        <SiteSettingsProvider>
          <VendorProvider>
            <PlanningProvider>
              <Router>
                <div className="flex flex-col min-h-screen">
                  <Navbar />
                  <div className="flex-grow">
                    <MaintenanceCheck />
                    <FaviconManager />
                    <SessionTracker />
                    <Suspense fallback={<LoadingSpinner />}>
                      <Routes>
                        {/* Public Routes */}
                        <Route path="/" element={<Home />} />
                        <Route path="/login" element={<Login />} />
                        <Route path="/register" element={<Register />} />
                        <Route path="/forgot-password" element={<ForgotPassword />} />
                        <Route path="/update-password" element={<UpdatePassword />} />
                        <Route path="/pricing" element={<PricingPlans />} />
                        <Route path="/checkout" element={<Checkout />} />
                        <Route path="/vendors" element={<VendorList />} />
                        <Route path="/vendors/:slug" element={<VendorDetail />} />
                        <Route path="/vendor-landing" element={<VendorLanding />} />
                        <Route path="/blog" element={<Blog />} />
                        <Route path="/blog/:slug" element={<BlogPost />} />
                        <Route path="/faq" element={<FAQPage />} />
                        <Route path="/contact" element={<LeadForm />} />
                        <Route path="/weather" element={<Weather />} />
                        <Route path="/:vendorSlug/website" element={<PublicWedding />} />
                        <Route path="/examples/seating" element={<SeatingChart />} />
                        <Route path="/examples/timeline" element={<Timeline />} />

                        {/* Community / Forum Routes */}
                        <Route path="/community" element={<CommunityLayout />}>
                          <Route index element={<CommunityHome />} />
                          <Route path="category/:categorySlug" element={<CommunityHome />} /> {/* Added Category Route using same Home component */}
                          <Route path="ask" element={<CommunityAsk />} />
                          <Route path="topic/:slug" element={<CommunityTopicDetail />} />
                          <Route path="user/:userId" element={<UserProfile />} />
                        </Route>

                        {/* Protected Routes */}
                        <Route path="/dashboard/*" element={
                          <ProtectedRoute>
                            <UserDashboard />
                          </ProtectedRoute>
                        } />

                        <Route path="/messages" element={
                          <ProtectedRoute>
                            <CoupleMessages />
                          </ProtectedRoute>
                        } />

                        <Route path="/notifications" element={
                          <ProtectedRoute>
                            <UserNotifications />
                          </ProtectedRoute>
                        } />

                        <Route path="/profile" element={
                          <ProtectedRoute>
                            <ProfileSettings />
                          </ProtectedRoute>
                        } />

                        <Route path="/vendor/dashboard/*" element={
                          <ProtectedRoute>
                            <VendorDashboard />
                          </ProtectedRoute>
                        } />

                        {/* Tools Routes */}
                        <Route path="/tools" element={
                          <ProtectedRoute>
                            <Outlet />
                          </ProtectedRoute>
                        }>
                          <Route index element={<ToolsDashboard />} />
                          <Route path="website" element={<WeddingWebsiteSetup />} />
                          <Route path="timeline" element={<Timeline />} />
                          <Route path="budget" element={<BudgetPlanner />} />
                          <Route path="seating" element={<SeatingChart />} />
                          <Route path="weather" element={<Weather />} />
                        </Route>

                        {/* Admin Routes */}
                        <Route path="/admin" element={
                          <ProtectedRoute>
                            <AdminLayout />
                          </ProtectedRoute>
                        }>
                          <Route index element={<AdminDashboard />} />
                          <Route path="vendors" element={<AdminVendors />} />
                          <Route path="users" element={<AdminUsers />} />
                          <Route path="leads" element={<AdminLeads />} />
                          <Route path="config" element={<AdminConfig />} />
                          <Route path="translations" element={<AdminTranslations />} />
                          <Route path="categories" element={<AdminCategories />} />
                          <Route path="avatars" element={<AdminAvatars />} />
                          <Route path="blog" element={<AdminBlog />} />
                          <Route path="pricing" element={<AdminPricing />} />
                          <Route path="analytics" element={<AdminAnalytics />} />
                          <Route path="reviews" element={<AdminReviews />} />
                          <Route path="messages" element={<AdminMessages />} />
                          <Route path="credit-approval" element={<AdminCreditApproval />} />
                          <Route path="pages" element={<AdminPages />} />
                          <Route path="finance" element={<AdminFinance />} />
                          <Route path="notifications" element={<AdminNotifications />} />

                          {/* Forum Routes */}
                          <Route path="forum" element={<AdminForumSettings />} />
                          <Route path="forum-categories" element={<AdminForumCategories />} />
                          <Route path="forum-ghosts" element={<AdminGhostGenerator />} />
                          <Route path="forum-bots" element={<AdminBotManager />} />
                          <Route path="forum-moderation" element={<AdminModeration />} />

                          <Route path="pages/:pageId" element={<AdminPageEdit />} />
                          <Route path="comments" element={<AdminComments />} />
                          <Route path="faq" element={<AdminFAQ />} />
                          <Route path="messaging" element={<AdminMessaging />} />
                        </Route>


                        {/* Catch all */}
                        <Route path="*" element={<Navigate to="/" replace />} />
                      </Routes>
                    </Suspense>
                  </div>
                  <Footer />
                </div>
              </Router>
            </PlanningProvider>
          </VendorProvider>
        </SiteSettingsProvider>
      </LanguageProvider>
    </AuthProvider>
  );
}

export default App;
