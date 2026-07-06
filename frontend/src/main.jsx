import { StrictMode, Suspense, lazy } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import "./index.css";

import App from "./App.jsx";
import Login from "./Auth/Login.jsx";
import ForgotPassword from "./Auth/ForgotPassword.jsx";
import CreateAccount from "./Auth/CreateAccount.jsx";
import ResetPassword from "./Auth/ResetPassword.jsx";
import { AuthProvider } from "./Context/AuthContext";
import { ThemeProvider } from "./Context/ThemeContext";
import ResetSuccess from "./ResetSuccess.jsx";
import PatientForm from "./pateint form/PatientForm.jsx";
// import AvailableDoctors from "./pateint form/AvailableDoctors.jsx";
import DoctorsAvailable from "./pateint form/DoctorsAvailable.jsx";
import ChatPage from "./chat/pages/ChatPage.jsx";
import DoctorForm from "./Doctor-Ui/pages/DoctorForm.jsx";
import DoctorSearch from "./pateint form/DoctorSearch.jsx";
import DoctorProfile from "./pateint form/DoctorProfile.jsx";
import ConsultationPayment from "./pateint form/ConsultationPayment.jsx";
import CallRoom from "./chat/pages/CallRoom.jsx";
import AppointmentHistory from "./pateint form/AppointmentHistory.jsx";
import { PrivateRoute, DoctorRoute, PatientRoute } from "./components/ProtectedRoute.jsx";

// Lazy load dashboards
const PatientDashboard = lazy(() => import("./pateint form/patient dashboard/PatientDashboard.jsx"));
const DoctorDashboard = lazy(() => import("./Doctor-Ui/pages/DoctorDashboard.jsx"));

const PageLoader = () => (
  <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-teal-50 flex items-center justify-center">
    <div className="text-center">
      <div className="inline-flex items-center justify-center h-12 w-12 rounded-full bg-emerald-100 animate-spin mb-4">
        <div className="h-8 w-8 rounded-full border-4 border-emerald-200 border-t-emerald-600" />
      </div>
      <p className="text-slate-600 font-medium">Loading...</p>
    </div>
  </div>
);

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <ThemeProvider>
      <AuthProvider>
        <BrowserRouter>
          <Suspense fallback={<PageLoader />}>
            <Routes>
              <Route path="/" element={<App />} />
              <Route path="/login" element={<Login />} />
              <Route path="/forgot-password" element={<ForgotPassword />} />
              <Route path="/create-account" element={<CreateAccount />} />
              <Route path="/reset-password" element={<ResetPassword />} />
              <Route path="/resetsuccess" element={<ResetSuccess />} />
              
              {/* Patient Routes */}
              <Route path="/patient-form" element={<PatientRoute><PatientForm /></PatientRoute>} />
              <Route path="/available-doctors" element={<PatientRoute><DoctorsAvailable /></PatientRoute>} />
              <Route path="/patient-dashboard" element={<PatientRoute><PatientDashboard /></PatientRoute>} />
              <Route path="/doctor-search" element={<PatientRoute><DoctorSearch /></PatientRoute>} />
              <Route path="/doctor-profile/:doctorId" element={<PatientRoute><DoctorProfile /></PatientRoute>} />
              <Route path="/consultation-payment/:doctorId" element={<PatientRoute><ConsultationPayment /></PatientRoute>} />
              <Route path="/appointment-history" element={<PatientRoute><AppointmentHistory /></PatientRoute>} />
              
              {/* Doctor Routes */}
              <Route path="/doc" element={<DoctorRoute><DoctorForm /></DoctorRoute>} />
              <Route path="/doctor-dashboard" element={<DoctorRoute><DoctorDashboard /></DoctorRoute>} />
              
              {/* Shared Protected Routes */}
              <Route path="/chat/:consultationId" element={<PrivateRoute><ChatPage /></PrivateRoute>} />
              <Route path="/call-room/:consultationId" element={<PrivateRoute><CallRoom /></PrivateRoute>} />
            </Routes>
          </Suspense>
        </BrowserRouter>
      </AuthProvider>
    </ThemeProvider>
  </StrictMode>
);

