import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';

import StaffLayout from './layouts/StaffLayout';
import AdminLayout from './layouts/AdminLayout';

// Customer Pages
// Removed LandingPage as Menu is now the main entry
import ProductDetail from './pages/customer/ProductDetail';
import Menu from './pages/customer/Menu';
import AIRecommendations from './pages/customer/AIRecommendations';
import Cart from './pages/customer/Cart';
import OrderSuccess from './pages/customer/OrderSuccess';
import OrderTracking from './pages/customer/OrderTracking';

// Staff Pages
import StaffLogin from './pages/staff/StaffLogin';
import OrderDashboard from './pages/staff/OrderDashboard';
import NewOrder from './pages/staff/NewOrder';

// Admin Pages
import AdminDashboard from './pages/admin/AdminDashboard';
import Analytics from './pages/admin/Analytics';
import MenuManagement from './pages/admin/MenuManagement';
import TableManagement from './pages/admin/TableManagement';
import StaffManagement from './pages/admin/StaffManagement';

function App() {
  return (
    <Router>
      <Routes>
        {/* Customer Routes */}
        <Route path="/" element={<Menu />} />
        <Route path="/ai-suggest" element={<AIRecommendations />} />
        <Route path="/product/:id" element={<ProductDetail />} />
        <Route path="/menu" element={<Navigate to="/" replace />} />
        <Route path="/cart" element={<Cart />} />
        <Route path="/order-success" element={<OrderSuccess />} />
        <Route path="/tracking" element={<OrderTracking />} />

        {/* Staff Routes */}
        <Route path="/staff/login" element={<StaffLogin />} />
        <Route path="/staff" element={<StaffLayout />}>
          <Route index element={<Navigate to="orders" replace />} />
          <Route path="orders" element={<OrderDashboard />} />
          <Route path="new-order" element={<NewOrder />} />
        </Route>

        {/* Admin Routes */}
        <Route path="/admin" element={<AdminLayout />}>
          <Route index element={<AdminDashboard />} />
          <Route path="analytics" element={<Analytics />} />
          <Route path="menu" element={<MenuManagement />} />
          <Route path="tables" element={<TableManagement />} />
          <Route path="staff" element={<StaffManagement />} />
        </Route>
      </Routes>
    </Router>
  );
}

export default App;
