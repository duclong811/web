import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';

import CustomerLayout from './layouts/CustomerLayout';
import StaffLayout from './layouts/StaffLayout';
import AdminLayout from './layouts/AdminLayout';

// Auth Pages
import Login from './pages/Login';

// Customer Pages
import ProductDetail from './pages/customer/ProductDetail';
import Menu from './pages/customer/Menu';
import AIRecommendations from './pages/customer/AIRecommendations';
import Cart from './pages/customer/Cart';
import OrderSuccess from './pages/customer/OrderSuccess';
import OrderTracking from './pages/customer/OrderTracking';
import QRLanding from './pages/customer/QRLanding';

// Staff Pages
import StaffOrderDashboard from './pages/staff/StaffOrderDashboard';
import StaffDashboard from './pages/staff/StaffDashboard';
import NewOrder from './pages/staff/NewOrder';

// Admin Pages
import AdminDashboard from './pages/admin/AdminDashboard';
import Analytics from './pages/admin/Analytics';
import MenuManagement from './pages/admin/MenuManagement';
import InventoryManagement from './pages/admin/InventoryManagement';
import TableManagement from './pages/admin/TableManagement';
import StaffManagement from './pages/admin/StaffManagement';

function App() {
  return (
    <Router>
      <Routes>
        {/* Auth Route */}
        <Route path="/login" element={<Login />} />

        {/* QR Code Landing - Outside CustomerLayout for custom styling */}
        <Route path="/qr" element={<QRLanding />} />
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
        </Route>

        {/* Staff Routes - Wrapped in StaffLayout */}
        <Route path="/staff" element={<StaffLayout />}>
          <Route index element={<Navigate to="orders" replace />} />
          <Route path="orders" element={<StaffOrderDashboard />} />
          <Route path="dashboard" element={<StaffDashboard />} />
          <Route path="new-order" element={<NewOrder />} />
        </Route>

        {/* Admin Routes - Wrapped in AdminLayout */}
        <Route path="/admin" element={<AdminLayout />}>
          <Route index element={<AdminDashboard />} />
          <Route path="analytics" element={<Analytics />} />
          <Route path="menu" element={<MenuManagement />} />
          <Route path="inventory" element={<InventoryManagement />} />
          <Route path="tables" element={<TableManagement />} />
          <Route path="staff" element={<StaffManagement />} />
        </Route>
      </Routes>
    </Router>
  );
}

export default App;
