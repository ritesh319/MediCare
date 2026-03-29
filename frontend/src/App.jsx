import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider, useAuth } from './context/AuthContext'
import { ProtectedRoute } from './routes/ProtectedRoute'

// Auth Pages
import LoginPage    from './pages/auth/LoginPage'
import RegisterPage from './pages/auth/RegisterPage'

// Admin Pages
import AdminDashboard   from './pages/admin/AdminDashboard'
import AdminDoctors     from './pages/admin/AdminDoctors'
import AdminPatients    from './pages/admin/AdminPatients'
import AdminAppointments from './pages/admin/AdminAppointments'

// Doctor Pages
import DoctorDashboard     from './pages/doctor/DoctorDashboard'
import DoctorProfile       from './pages/doctor/DoctorProfile'
import DoctorAppointments  from './pages/doctor/DoctorAppointments'
import DoctorAvailability  from './pages/doctor/DoctorAvailability'

// Patient Pages
import PatientDashboard    from './pages/patient/PatientDashboard'
import PatientProfile      from './pages/patient/PatientProfile'
import PatientAppointments from './pages/patient/PatientAppointments'
import BookAppointment     from './pages/patient/BookAppointment'
import MedicalHistory      from './pages/patient/MedicalHistory'

import UnauthorizedPage from './pages/UnauthorizedPage'
import NotFoundPage     from './pages/NotFoundPage'

function RoleRedirect() {
  const { user, isAdmin, isDoctor, isPatient } = useAuth()
  if (!user)      return <Navigate to="/login" replace />
  if (isAdmin())  return <Navigate to="/admin/dashboard" replace />
  if (isDoctor()) return <Navigate to="/doctor/dashboard" replace />
  if (isPatient()) return <Navigate to="/patient/dashboard" replace />
  return <Navigate to="/login" replace />
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          {/* Public */}
          <Route path="/"         element={<RoleRedirect />} />
          <Route path="/login"    element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/unauthorized" element={<UnauthorizedPage />} />

          {/* Admin */}
          <Route path="/admin/dashboard"    element={<ProtectedRoute roles={['ADMIN']}><AdminDashboard /></ProtectedRoute>} />
          <Route path="/admin/doctors"      element={<ProtectedRoute roles={['ADMIN']}><AdminDoctors /></ProtectedRoute>} />
          <Route path="/admin/patients"     element={<ProtectedRoute roles={['ADMIN']}><AdminPatients /></ProtectedRoute>} />
          <Route path="/admin/appointments" element={<ProtectedRoute roles={['ADMIN']}><AdminAppointments /></ProtectedRoute>} />

          {/* Doctor */}
          <Route path="/doctor/dashboard"    element={<ProtectedRoute roles={['DOCTOR']}><DoctorDashboard /></ProtectedRoute>} />
          <Route path="/doctor/profile"      element={<ProtectedRoute roles={['DOCTOR']}><DoctorProfile /></ProtectedRoute>} />
          <Route path="/doctor/appointments" element={<ProtectedRoute roles={['DOCTOR']}><DoctorAppointments /></ProtectedRoute>} />
          <Route path="/doctor/availability" element={<ProtectedRoute roles={['DOCTOR']}><DoctorAvailability /></ProtectedRoute>} />

          {/* Patient */}
          <Route path="/patient/dashboard"    element={<ProtectedRoute roles={['PATIENT']}><PatientDashboard /></ProtectedRoute>} />
          <Route path="/patient/profile"      element={<ProtectedRoute roles={['PATIENT']}><PatientProfile /></ProtectedRoute>} />
          <Route path="/patient/appointments" element={<ProtectedRoute roles={['PATIENT']}><PatientAppointments /></ProtectedRoute>} />
          <Route path="/patient/book"         element={<ProtectedRoute roles={['PATIENT']}><BookAppointment /></ProtectedRoute>} />
          <Route path="/patient/history"      element={<ProtectedRoute roles={['PATIENT']}><MedicalHistory /></ProtectedRoute>} />

          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  )
}
