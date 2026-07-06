import { Navigate } from "react-router-dom";
import { useAuth } from "../Context/AuthContext";

// Basic authentication check
export function PrivateRoute({ children }) {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-emerald-500"></div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return children;
}

// Restricts route to Doctors only
export function DoctorRoute({ children }) {
  const { user, userRole, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-emerald-500"></div>
      </div>
    );
  }

  if (!user || userRole !== "doctor") {
    // Redirect unauthorized users to the home page
    return <Navigate to="/" replace />;
  }

  return children;
}

// Restricts route to Patients only
export function PatientRoute({ children }) {
  const { user, userRole, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-emerald-500"></div>
      </div>
    );
  }

  if (!user || userRole !== "patient") {
    // Redirect unauthorized users to the home page
    return <Navigate to="/" replace />;
  }

  return children;
}
