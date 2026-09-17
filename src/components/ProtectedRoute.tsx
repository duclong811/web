import { Navigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';

interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedRoles?: string[];
}

export default function ProtectedRoute({ children, allowedRoles }: ProtectedRouteProps) {
  const { isAuthenticated, user } = useAuthStore();

  // Chưa đăng nhập -> redirect về login
  if (!isAuthenticated || !user) {
    return <Navigate to="/login" replace />;
  }

  // Kiểm tra role nếu có yêu cầu
  if (allowedRoles && allowedRoles.length > 0) {
    if (!allowedRoles.includes(user.role)) {
      // Không đủ quyền -> redirect về trang phù hợp với role
      if (user.role === 'SystemAdmin' || user.role === 'Owner' || user.role === 'Manager') {
        return <Navigate to="/admin/dashboard" replace />;
      } else if (user.role === 'Staff' || user.role === 'Kitchen' || user.role === 'Cashier') {
        return <Navigate to="/staff/orders" replace />;
      } else {
        return <Navigate to="/menu" replace />;
      }
    }
  }

  return <>{children}</>;
}
