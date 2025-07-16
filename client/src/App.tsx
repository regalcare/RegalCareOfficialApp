import { Route, Routes, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "@/lib/auth";
import MemberDashboard from "@/pages/member-dashboard";
import CustomerPortal from "@/pages/customer-portal";
import BusinessDashboard from "@/pages/dashboard";

function ProtectedRoute({ children, role }: { children: JSX.Element; role?: string }) {
  const { user } = useAuth();

  if (!user) {
    return <Navigate to="/portal" replace />;
  }

  if (role && user.role !== role) {
    return <Navigate to="/portal" replace />;
  }

  return children;
}

function AppRoutes() {
  const { user } = useAuth();

  return (
    <Routes>
      <Route path="/portal" element={<CustomerPortal />} />
      <Route
        path="/customer/member/:id"
        element={
          <ProtectedRoute role="customer">
            <MemberDashboard />
          </ProtectedRoute>
        }
      />
      <Route
        path="/"
        element={
          user?.role === "admin" ? (
            <BusinessDashboard />
          ) : (
            <Navigate to="/portal" replace />
          )
        }
      />
    </Routes>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <AppRoutes />
    </AuthProvider>
  );
}
