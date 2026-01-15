// import React from 'react';
import { BrowserRouter, Routes, Route, Navigate, Outlet } from 'react-router-dom';
import Login from './pages/Login';
import Signup from './pages/Signup';
import Tracking from './pages/Tracking';
import Dashboard from './pages/Dashboard';
import DriverDashboard from './pages/DriverDashboard';
import ShopDashboard from './pages/ShopDashboard'; // NEW
import BookParcel from './pages/BookParcel'; // NEW 2
import DeliverParcel from './pages/DeliverParcel'; // NEW 2
import Shops from './pages/Shops';
import Drivers from './pages/Drivers';
import Parcels from './pages/Parcels';
import CreateRoute from './pages/CreateRoute';
import RoutesPage from './pages/Routes';
import Settlements from './pages/Settlements';
import ShopSettlements from './pages/ShopSettlements';
import FranchiseReports from './pages/FranchiseReports'; // NEW
import Analytics from './pages/Analytics';
import Areas from './pages/Areas';
import Sidebar from './components/Sidebar';

// Protected Route Wrapper
const ProtectedLayout = () => {
  const token = localStorage.getItem('token');
  if (!token) return <Navigate to="/login" replace />;

  return (
    <div style={{ display: 'flex', minHeight: '100vh' }}>
      <Sidebar />
      <div style={{ flex: 1, padding: '2rem', overflowY: 'auto' }}>
        <Outlet />
      </div>
    </div>
  );
};

import { Role } from './types';

// Role Based Route Wrapper
const RoleRoute = ({ children, allowedRoles }: { children: any, allowedRoles: string[] }) => {
  const userStr = localStorage.getItem('user');
  const user = userStr ? JSON.parse(userStr) : null;

  if (!user || !allowedRoles.includes(user.role)) {
    // Redirect to their appropriate home if unauthorized
    if (user?.role === Role.DRIVER) return <Navigate to="/driver-dashboard" replace />;
    if (user?.role === Role.SHOP) return <Navigate to="/shop-dashboard" replace />;
    if (user?.role === Role.SUPER_ADMIN || user?.role === Role.DISTRICT_ADMIN || user?.role === Role.ADMIN) return <Navigate to="/dashboard" replace />;
    return <Navigate to="/login" replace />;
  }
  return children;
};

const SmartRedirect = () => {
  const userStr = localStorage.getItem('user');
  const user = userStr ? JSON.parse(userStr) : null;

  if (user?.role === Role.DRIVER) return <Navigate to="/driver-dashboard" replace />;
  if (user?.role === Role.SHOP) return <Navigate to="/shop-dashboard" replace />;
  return <Navigate to="/dashboard" replace />;
}

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/tracking" element={<Tracking />} />

        <Route element={<ProtectedLayout />}>
          {/* Smart Redirect for Root */}
          <Route path="/" element={<SmartRedirect />} />

          {/* ADMIN Routes (Super & District) */}
          <Route path="/dashboard" element={<RoleRoute allowedRoles={[Role.SUPER_ADMIN, Role.DISTRICT_ADMIN, Role.ADMIN]}><Dashboard /></RoleRoute>} />
          <Route path="/shops" element={<RoleRoute allowedRoles={[Role.SUPER_ADMIN, Role.DISTRICT_ADMIN, Role.ADMIN]}><Shops /></RoleRoute>} />
          <Route path="/drivers" element={<RoleRoute allowedRoles={[Role.SUPER_ADMIN, Role.DISTRICT_ADMIN, Role.ADMIN]}><Drivers /></RoleRoute>} />
          <Route path="/routes" element={<RoleRoute allowedRoles={[Role.SUPER_ADMIN, Role.DISTRICT_ADMIN, Role.ADMIN]}><RoutesPage /></RoleRoute>} />
          <Route path="/routes/new" element={<RoleRoute allowedRoles={[Role.SUPER_ADMIN, Role.DISTRICT_ADMIN, Role.ADMIN]}><CreateRoute /></RoleRoute>} />
          <Route path="/analytics" element={<RoleRoute allowedRoles={[Role.SUPER_ADMIN, Role.DISTRICT_ADMIN, Role.ADMIN]}><Analytics /></RoleRoute>} />
          <Route path="/franchise-reports" element={<RoleRoute allowedRoles={[Role.SUPER_ADMIN]}><FranchiseReports /></RoleRoute>} />
          {/* Area Management */}
          <Route path="/areas" element={<RoleRoute allowedRoles={[Role.SUPER_ADMIN, Role.DISTRICT_ADMIN]}><Areas /></RoleRoute>} />
          <Route path="/shops/:shopId/settlements" element={<RoleRoute allowedRoles={[Role.SUPER_ADMIN, Role.DISTRICT_ADMIN, Role.ADMIN]}><ShopSettlements /></RoleRoute>} />

          {/* DRIVER Routes */}
          <Route path="/driver-dashboard" element={<RoleRoute allowedRoles={[Role.DRIVER]}><DriverDashboard /></RoleRoute>} />

          {/* SHOP Routes */}
          <Route path="/shop-dashboard" element={<RoleRoute allowedRoles={[Role.SHOP]}><ShopDashboard /></RoleRoute>} />
          <Route path="/book-parcel" element={<RoleRoute allowedRoles={[Role.SHOP]}><BookParcel /></RoleRoute>} />
          <Route path="/deliver-parcel" element={<RoleRoute allowedRoles={[Role.SHOP]}><DeliverParcel /></RoleRoute>} />

          {/* SHARED Routes */}
          <Route path="/parcels" element={<RoleRoute allowedRoles={[Role.SUPER_ADMIN, Role.DISTRICT_ADMIN, Role.ADMIN, Role.SHOP]}><Parcels /></RoleRoute>} />
          <Route path="/settlements" element={<RoleRoute allowedRoles={[Role.SUPER_ADMIN, Role.DISTRICT_ADMIN, Role.ADMIN, Role.SHOP]}><Settlements /></RoleRoute>} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
