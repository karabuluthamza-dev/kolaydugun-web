import React, { Suspense, lazy } from 'react';
import { Routes, Route, Navigate, Outlet } from 'react-router-dom';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import ProtectedRoute from './components/ProtectedRoute';
import LoadingSpinner from './components/LoadingSpinner';
import SessionTracker from './components/SessionTracker';
import MaintenanceCheck from './components/MaintenanceCheck';
import FaviconManager from './components/FaviconManager';
import ScrollToTop from './components/ScrollToTop';
import MobileBottomNav from './components/MobileBottomNav';
import SmartAppBanner from './components/SmartAppBanner';
import PrivacyBanner from './components/PrivacyBanner';
import { trackError } from './utils/analytics';

// Static Pages (Always loaded)
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import ForgotPassword from './pages/ForgotPassword';
import UpdatePassword from './pages/UpdatePassword';
import VendorList from './pages/VendorList';
import VendorDetail from './pages/VendorDetail';
import PricingPlans from './pages/PricingPlans';
import Checkout from './pages/Checkout';
import Blog from './pages/Blog';
import BlogPost from './pages/BlogPost';
import FAQPage from './pages/FAQPage';
import Founder from './pages/Founder';
import VendorLanding from './pages/VendorLanding';
import SeoLandingPage from './pages/SeoLandingPage';
import LiveRequestLanding from './pages/LiveRequestLanding';
import LiveDemo from './pages/LiveDemo';
import ToolsDashboard from './pages/ToolsDashboard';
import CommunityLayout from './pages/community/CommunityLayout';
import CommunityHome from './pages/community/CommunityHome';

// Lazy Dashboard Components
const VendorDashboard = lazy(() => import('./pages/VendorDashboard'));
const UserDashboard = lazy(() => import('./pages/UserDashboard'));
const Timeline = lazy(() => import('./pages/Timeline'));
const BudgetPlanner = lazy(() => import('./pages/BudgetPlanner'));
const Weather = lazy(() => import('./pages/Weather'));
const LeadForm = lazy(() => import('./pages/LeadForm'));
const WeddingWebsiteSetup = lazy(() => import('./pages/WeddingWebsiteSetup'));
const SeatingChart = lazy(() => import('./pages/SeatingChart'));
const PrintableSeatingChart = lazy(() => import('./components/seating/PrintableSeatingChart'));
const PublicWedding = lazy(() => import('./pages/PublicWedding'));
const DynamicPage = lazy(() => import('./pages/DynamicPage'));
const DirectoryPage = lazy(() => import('./pages/DirectoryPage'));

// Admin Main
const AdminLayout = lazy(() => import('./components/AdminLayout'));
const AdminDashboard = lazy(() => import('./pages/AdminDashboard'));
const AdminConfig = lazy(() => import('./pages/AdminConfig'));
const AdminTranslations = lazy(() => import('./pages/AdminTranslations'));

// Admin Modules
const AdminVendors = lazy(() => import('./pages/AdminVendors'));
const AdminUsers = lazy(() => import('./pages/AdminUsers'));
const AdminLeads = lazy(() => import('./pages/AdminLeads'));
const AdminCategories = lazy(() => import('./pages/AdminCategories'));
const AdminCategoryManager = lazy(() => import('./pages/AdminCategoryManager'));
const AdminPopularCities = lazy(() => import('./pages/AdminPopularCities'));
const AdminAvatars = lazy(() => import('./pages/AdminAvatars'));
const AdminBlog = lazy(() => import('./pages/AdminBlog'));
const AdminPricing = lazy(() => import('./pages/AdminPricing'));
const AdminAnalytics = lazy(() => import('./pages/AdminAnalytics'));
const AdminReviews = lazy(() => import('./pages/AdminReviews'));
const AdminMessages = lazy(() => import('./pages/AdminMessages'));
const AdminMessaging = lazy(() => import('./pages/AdminMessaging'));
const AdminCreditApproval = lazy(() => import('./pages/AdminCreditApproval'));
const AdminPages = lazy(() => import('./pages/AdminPages'));
const AdminPageEdit = lazy(() => import('./pages/AdminPageEdit'));
const AdminFinance = lazy(() => import('./pages/AdminFinance'));
const AdminNotifications = lazy(() => import('./pages/AdminNotifications'));
const AdminComments = lazy(() => import('./pages/AdminComments'));
const AdminFAQ = lazy(() => import('./pages/AdminFAQ'));
const AdminFounder = lazy(() => import('./pages/AdminFounder'));
const AdminHelp = lazy(() => import('./pages/AdminHelp'));
const AdminLiveRequestPanel = lazy(() => import('./pages/Admin/AdminLiveRequestPanel'));

// Admin Forum
const AdminForumSettings = lazy(() => import('./pages/AdminForumSettings'));
const AdminForumCategories = lazy(() => import('./pages/AdminForumCategories'));
const AdminGhostGenerator = lazy(() => import('./pages/AdminGhostGenerator'));
const AdminBotManager = lazy(() => import('./pages/AdminBotManager'));
const AdminModeration = lazy(() => import('./pages/AdminModeration'));

// Shop Module
const Shop = lazy(() => import('./pages/Shop'));
const ShopCategory = lazy(() => import('./pages/ShopCategory'));
const ShopProduct = lazy(() => import('./pages/ShopProduct'));
const ShopStorefront = lazy(() => import('./pages/ShopStorefront'));
const ShopApplication = lazy(() => import('./pages/ShopApplication'));

// Shop Owner
const ShopOwnerLayout = lazy(() => import('./components/ShopOwnerLayout'));
const ShopOwnerDashboard = lazy(() => import('./pages/shop-owner/ShopOwnerDashboard'));
const ShopOwnerProducts = lazy(() => import('./pages/shop-owner/ShopOwnerProducts'));
const ShopOwnerProfile = lazy(() => import('./pages/shop-owner/ShopOwnerProfile'));
const ShopOwnerAffiliates = lazy(() => import('./pages/shop-owner/ShopOwnerAffiliates'));
const ShopOwnerAnalytics = lazy(() => import('./pages/shop-owner/ShopOwnerAnalytics'));
const ShopOwnerHelp = lazy(() => import('./pages/shop-owner/ShopOwnerHelp'));
const ShopOwnerCategories = lazy(() => import('./pages/shop-owner/ShopOwnerCategories'));
const ShopOwnerGallery = lazy(() => import('./pages/shop-owner/ShopOwnerGallery'));
const ShopPanelDemo = lazy(() => import('./pages/shop-owner/ShopPanelDemo'));

// Admin Shop Support
const AdminShopAccounts = lazy(() => import('./pages/AdminShopAccounts'));
const AdminShopCategories = lazy(() => import('./pages/AdminShopCategories'));
const AdminShopProducts = lazy(() => import('./pages/AdminShopProducts'));
const AdminShopInquiries = lazy(() => import('./pages/AdminShopInquiries'));
const AdminShopApplications = lazy(() => import('./pages/AdminShopApplications'));
const AdminShopSettings = lazy(() => import('./pages/AdminShopSettings'));
const AdminShopPlans = lazy(() => import('./pages/admin/AdminShopPlans'));
const AdminShopFaqs = lazy(() => import('./pages/AdminShopFaqs'));
const AdminShopAnnouncements = lazy(() => import('./pages/AdminShopAnnouncements'));
const AdminShopProductRequests = lazy(() => import('./pages/AdminShopProductRequests'));
const AdminShopCommissions = lazy(() => import('./pages/AdminShopCommissions'));

// Affiliate & Poaching
const AdminAmazonDashboard = lazy(() => import('./pages/AdminAmazonDashboard'));
const AdminAmazonProducts = lazy(() => import('./pages/AdminAmazonProducts'));
const AdminAmazonAdd = lazy(() => import('./pages/AdminAmazonAdd'));
const AdminAmazonSettings = lazy(() => import('./pages/AdminAmazonSettings'));
const AdminClaims = lazy(() => import('./pages/AdminClaims'));
const AdminPoachedInquiries = lazy(() => import('./pages/AdminPoachedInquiries'));
const AdminCityAliases = lazy(() => import('./pages/AdminCityAliases'));
const AdminImports = lazy(() => import('./pages/AdminImports'));

// Legal
const Impressum = lazy(() => import('./pages/legal/Impressum'));
const Datenschutz = lazy(() => import('./pages/legal/Datenschutz'));
const AGB = lazy(() => import('./pages/legal/AGB'));
const Widerrufsrecht = lazy(() => import('./pages/legal/Widerrufsrecht'));

// Community Lazy
const CommunityTopicDetail = lazy(() => import('./pages/community/CommunityTopicDetail'));
const CommunityAsk = lazy(() => import('./pages/community/CommunityAsk'));
const UserProfile = lazy(() => import('./pages/community/UserProfile'));
const CoupleMessages = lazy(() => import('./components/CoupleMessages'));
const UserNotifications = lazy(() => import('./pages/UserNotifications'));
const ProfileSettings = lazy(() => import('./pages/ProfileSettings'));

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

  // Tracking: Global Error & Rejection Monitoring
  useEffect(() => {
    const handleError = (event) => {
      trackError(event.message, event.filename || 'unknown', false);
    };

    const handleRejection = (event) => {
      trackError(event.reason?.message || 'Promise rejection', 'promise', false);
    };

    window.addEventListener('error', handleError);
    window.addEventListener('unhandledrejection', handleRejection);

    return () => {
      window.removeEventListener('error', handleError);
      window.removeEventListener('unhandledrejection', handleRejection);
    };
  }, []);

  return (
    <>
      <ScrollToTop />
      <SmartAppBanner />
      <div className="flex flex-col min-h-screen">
        <MobileBottomNav />
        <Navbar />
        <div className="flex-grow">
          <MaintenanceCheck />
          <FaviconManager />
          <SessionTracker />
          <Suspense fallback={<div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '50vh' }}><LoadingSpinner /></div>}>
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
              <Route path="/locations/:city/:categorySlug" element={<SeoLandingPage />} />
              <Route path="/locations/:city" element={<SeoLandingPage />} />
              <Route path="/vendor-landing" element={<VendorLanding />} />
              <Route path="/tedarikci-basvuru" element={<VendorLanding />} />
              <Route path="/canli-istek-sistemi" element={<LiveRequestLanding />} />
              <Route path="/de/live-wunsch-system" element={<LiveRequestLanding />} />
              <Route path="/en/live-request-system" element={<LiveRequestLanding />} />
              <Route path="/live-demo" element={<LiveDemo />} />
              <Route path="/blog" element={<Blog />} />
              <Route path="/blog/:slug" element={<BlogPost />} />
              <Route path="/faq" element={<FAQPage />} />
              <Route path="/directory" element={<DirectoryPage />} />
              <Route path="/kurucumuz" element={<Founder />} />
              <Route path="/vizyonumuz" element={<Founder />} />

              <Route path="/de/shop" element={<Shop />} />
              <Route path="/de/shop/produkt/:id" element={<ShopProduct />} />
              <Route path="/de/shop/kategorie/:slug" element={<ShopCategory />} />
              <Route path="/tr/shop" element={<Shop />} />
              <Route path="/tr/shop/urun/:id" element={<ShopProduct />} />
              <Route path="/tr/shop/kategori/:slug" element={<ShopCategory />} />
              <Route path="/en/shop" element={<Shop />} />
              <Route path="/en/shop/product/:id" element={<ShopProduct />} />
              <Route path="/en/shop/category/:slug" element={<ShopCategory />} />

              <Route path="/shop" element={<Shop />} />
              <Route path="/shop/basvuru" element={<ShopApplication />} />
              <Route path="/shop/urun/:id" element={<ShopProduct />} />
              <Route path="/shop/kategori/:slug" element={<ShopCategory />} />
              <Route path="/shop/magaza/:slug" element={<ShopStorefront />} />
              <Route path="/shop/:slug" element={<ShopCategory />} />
              <Route path="/p/:slug" element={<DynamicPage />} />
              <Route path="/contact" element={<LeadForm />} />
              <Route path="/weather" element={<Weather />} />
              <Route path="/w/:slug" element={<PublicWedding />} />
              <Route path="/:vendorSlug/website" element={<PublicWedding />} />
              <Route path="/examples/seating" element={<SeatingChart />} />
              <Route path="/examples/timeline" element={<Timeline />} />

              <Route path="/community" element={<CommunityLayout />}>
                <Route index element={<CommunityHome />} />
                <Route path="category/:categorySlug" element={<CommunityHome />} />
                <Route path="ask" element={<CommunityAsk />} />
                <Route path="topic/:slug" element={<CommunityTopicDetail />} />
                <Route path="user/:userId" element={<UserProfile />} />
              </Route>

              <Route path="/dashboard/*" element={<ProtectedRoute><UserDashboard /></ProtectedRoute>} />
              <Route path="/messages" element={<ProtectedRoute><CoupleMessages /></ProtectedRoute>} />
              <Route path="/notifications" element={<ProtectedRoute><UserNotifications /></ProtectedRoute>} />
              <Route path="/profile" element={<ProtectedRoute><ProfileSettings /></ProtectedRoute>} />
              <Route path="/vendor/dashboard/*" element={<ProtectedRoute><VendorDashboard /></ProtectedRoute>} />

              <Route path="/tools" element={<ProtectedRoute><Outlet /></ProtectedRoute>}>
                <Route index element={<ToolsDashboard />} />
                <Route path="website" element={<WeddingWebsiteSetup />} />
                <Route path="timeline" element={<Timeline />} />
                <Route path="budget" element={<BudgetPlanner />} />
                <Route path="seating" element={<SeatingChart />} />
                <Route path="weather" element={<Weather />} />
              </Route>

              <Route path="/shop-panel/demo" element={<ShopPanelDemo />} />
              <Route path="/shop-panel" element={<ProtectedRoute><ShopOwnerLayout /></ProtectedRoute>}>
                <Route index element={<ShopOwnerDashboard />} />
                <Route path="products" element={<ShopOwnerProducts />} />
                <Route path="categories" element={<ShopOwnerCategories />} />
                <Route path="profile" element={<ShopOwnerProfile />} />
                <Route path="gallery" element={<ShopOwnerGallery />} />
                <Route path="affiliate" element={<ShopOwnerAffiliates />} />
                <Route path="analytics" element={<ShopOwnerAnalytics />} />
                <Route path="help" element={<ShopOwnerHelp />} />
              </Route>

              <Route path="/admin" element={<ProtectedRoute requireAdmin={true}><AdminLayout /></ProtectedRoute>}>
                <Route index element={<AdminDashboard />} />
                <Route path="vendors" element={<AdminVendors />} />
                <Route path="users" element={<AdminUsers />} />
                <Route path="leads" element={<AdminLeads />} />
                <Route path="config" element={<AdminConfig />} />
                <Route path="translations" element={<AdminTranslations />} />
                <Route path="categories" element={<AdminCategories />} />
                <Route path="popular-cities" element={<AdminPopularCities />} />
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
                <Route path="forum" element={<AdminForumSettings />} />
                <Route path="forum-categories" element={<AdminForumCategories />} />
                <Route path="forum-ghosts" element={<AdminGhostGenerator />} />
                <Route path="forum-bots" element={<AdminBotManager />} />
                <Route path="forum-moderation" element={<AdminModeration />} />
                <Route path="shop-accounts" element={<AdminShopAccounts />} />
                <Route path="shop-categories" element={<AdminShopCategories />} />
                <Route path="shop-products" element={<AdminShopProducts />} />
                <Route path="shop-inquiries" element={<AdminShopInquiries />} />
                <Route path="shop-applications" element={<AdminShopApplications />} />
                <Route path="shop-settings" element={<AdminShopSettings />} />
                <Route path="shop-plans" element={<AdminShopPlans />} />
                <Route path="shop-faqs" element={<AdminShopFaqs />} />
                <Route path="shop-announcements" element={<AdminShopAnnouncements />} />
                <Route path="shop-product-requests" element={<AdminShopProductRequests />} />
                <Route path="shop-commissions" element={<AdminShopCommissions />} />
                <Route path="amazon" element={<AdminAmazonDashboard />} />
                <Route path="amazon/products" element={<AdminAmazonProducts />} />
                <Route path="amazon/add" element={<AdminAmazonAdd />} />
                <Route path="amazon/bulk" element={<AdminAmazonAdd />} />
                <Route path="amazon/settings" element={<AdminAmazonSettings />} />
                <Route path="pages/:pageId" element={<AdminPageEdit />} />
                <Route path="comments" element={<AdminComments />} />
                <Route path="faq" element={<AdminFAQ />} />
                <Route path="messaging" element={<AdminMessaging />} />
                <Route path="claims" element={<AdminClaims />} />
                <Route path="poached-inquiries" element={<AdminPoachedInquiries />} />
                <Route path="city-aliases" element={<AdminCityAliases />} />
                <Route path="imports" element={<AdminImports />} />
                <Route path="/admin/founder" element={<AdminFounder />} />
                <Route path="help" element={<AdminHelp />} />
                <Route path="live-requests" element={<AdminLiveRequestPanel />} />

              </Route>

              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </Suspense>
        </div>
        <Footer />
      </div>
    </>
  );
}

export default App;
