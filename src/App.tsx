import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';

import CustomerLayout from './layouts/CustomerLayout';
import StaffLayout from './layouts/StaffLayout';
import AdminLayout from './layouts/AdminLayout';
import SystemAdminLayout from './layouts/SystemAdminLayout';

// Auth Pages
import Login from './pages/Login';
import DemoLanding from './pages/DemoLanding';
import DemoBackoffice from './pages/DemoBackoffice';
import OwnerSignup from './pages/OwnerSignup';
import VerifyEmail from './pages/VerifyEmail';

// Customer Pages
import ProductDetail from './pages/customer/ProductDetail';
import Menu from './pages/customer/Menu';
import AIRecommendations from './pages/customer/AIRecommendations';
import Cart from './pages/customer/Cart';
import OrderSuccess from './pages/customer/OrderSuccess';
import OrderTracking from './pages/customer/OrderTracking';
import QRLanding from './pages/customer/QRLanding';
import Profile from './pages/customer/Profile';
import OrderHistory from './pages/customer/OrderHistory';

// Staff Pages
import StaffOrderDashboard from './pages/staff/StaffOrderDashboard';
import StaffDashboard from './pages/staff/StaffDashboard';
import NewOrder from './pages/staff/NewOrder';
import StaffLogin from './pages/staff/StaffLogin';

// Admin Pages (Store Owner)
import AdminDashboard from './pages/admin/AdminDashboard';
import Analytics from './pages/admin/Analytics';
import MenuManagement from './pages/admin/MenuManagement';
import InventoryManagement from './pages/admin/InventoryManagement';
import TableManagement from './pages/admin/TableManagement';
import StaffManagement from './pages/admin/StaffManagement';
import PaymentSettings from './pages/admin/PaymentSettings';
import SubscriptionManagement from './pages/admin/SubscriptionManagement';

// Super Admin Pages (SaaS Platform Master)
import SystemAdminDashboard from './pages/system-admin/SystemAdminDashboard';
import TenantManagement from './pages/system-admin/TenantManagement';
import SaaSPlansSettings from './pages/system-admin/SaaSPlansSettings';
import AnalyticsTracker from './components/AnalyticsTracker';
import SubscriptionFeatureGate from './components/SubscriptionFeatureGate';
import ProtectedRoute from './components/ProtectedRoute';
import NotificationProvider from './components/NotificationProvider';

function App() {
  return (
    <NotificationProvider><Router>
      <AnalyticsTracker />
      <Routes>
        {/* Auth Route */}
        <Route path="/login" element={<Login />} />
        <Route path="/system-admin/login" element={<Login />} />
        <Route path="/demo" element={<DemoLanding />} />
        <Route path="/demo/backoffice" element={<Navigate to="/demo/owner/dashboard" replace />} />
        <Route path="/demo/owner" element={<Navigate to="/demo/owner/dashboard" replace />} />
        <Route path="/demo/owner/:page" element={<DemoBackoffice />} />
        <Route path="/demo/staff" element={<Navigate to="/demo/staff/orders" replace />} />
        <Route path="/demo/staff/:page" element={<DemoBackoffice />} />
        <Route path="/signup" element={<OwnerSignup />} />
        <Route path="/verify-email" element={<VerifyEmail />} />
        <Route path="/staff/login" element={<StaffLogin />} />

        {/* QR Code Landing - Outside CustomerLayout for custom styling */}
        <Route path="/qr" element={<QRLanding />} />
        <Route path="/qr/:qrToken" element={<QRLanding />} />
        <Route path="/table/:storeId/:tableId" element={<QRLanding />} />

        {/* Customer Routes - Wrapped in CustomerLayout */}
        <Route element={<CustomerLayout />}>
          <Route path="/" element={<Menu />} />
          <Route path="/menu" element={<Navigate to="/" replace />} />
          <Route path="/ai-suggest" element={<AIRecommendations />} />
          <Route path="/product/:id" element={<ProductDetail />} />
          <Route path="/cart" element={<Cart />} />
          <Route path="/order-success" element={<OrderSuccess />} />
          <Route path="/tracking" element={<OrderTracking />} />
          <Route path="/profile" element={(
            <ProtectedRoute allowedRoles={['Customer']}>
              <Profile />
            </ProtectedRoute>
          )} />
          <Route path="/history" element={<OrderHistory />} />
        </Route>

        {/* Staff Routes - Wrapped in StaffLayout */}
        <Route path="/staff" element={(
          <ProtectedRoute allowedRoles={['Staff', 'Owner', 'TenantOwner']}>
            <StaffLayout />
          </ProtectedRoute>
        )}>
          <Route index element={<Navigate to="orders" replace />} />
          <Route path="orders" element={<StaffOrderDashboard />} />
          <Route path="dashboard" element={<StaffDashboard />} />
          <Route path="new-order" element={<NewOrder />} />
        </Route>

        {/* Store Owner / Store Admin Routes - Wrapped in AdminLayout */}
        <Route path="/admin" element={(
          <ProtectedRoute allowedRoles={['Owner', 'TenantOwner']}>
            <AdminLayout />
          </ProtectedRoute>
        )}>
          <Route index element={<AdminDashboard />} />
          <Route path="analytics" element={<SubscriptionFeatureGate feature="advanced_analytics" requiredPlan="Premium"><Analytics /></SubscriptionFeatureGate>} />
          <Route path="menu" element={<MenuManagement />} />
          <Route path="inventory" element={<SubscriptionFeatureGate feature="inventory" requiredPlan="Premium"><InventoryManagement /></SubscriptionFeatureGate>} />
          <Route path="tables" element={<TableManagement />} />
          <Route path="staff" element={<StaffManagement />} />
          <Route path="settings" element={<PaymentSettings />} />
          <Route path="subscription" element={<SubscriptionManagement />} />
          <Route path="payments" element={<Navigate to="/admin/settings" replace />} />
        </Route>

        {/* Super Admin Platform Routes - Wrapped in SystemAdminLayout */}
        <Route path="/system-admin" element={(
          <ProtectedRoute allowedRoles={['SystemAdmin']}>
            <SystemAdminLayout />
          </ProtectedRoute>
        )}>
          <Route index element={<SystemAdminDashboard />} />
          <Route path="tenants" element={<TenantManagement />} />
          <Route path="plans" element={<SaaSPlansSettings />} />
        </Route>
      </Routes>
    </Router></NotificationProvider>
  );
}

export default App;
