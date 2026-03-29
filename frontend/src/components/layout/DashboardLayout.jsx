import { useState } from 'react'
import { NavLink, useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'

const icons = {
  dashboard:    '⊞',
  doctors:      '👨‍⚕️',
  patients:     '🧑‍🤝‍🧑',
  appointments: '📅',
  profile:      '👤',
  availability: '🗓',
  book:         '➕',
  history:      '📋',
  logout:       '🚪',
}

function NavItem({ to, icon, label, onClick }) {
  if (onClick) {
    return (
      <button
        onClick={onClick}
        className="flex items-center gap-3 w-full px-4 py-2.5 rounded-lg text-sm font-medium text-gray-600 hover:bg-gray-100 hover:text-gray-900 transition-colors"
      >
        <span className="text-base">{icon}</span>
        <span>{label}</span>
      </button>
    )
  }
  return (
    <NavLink
      to={to}
      className={({ isActive }) =>
        `flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-medium transition-colors ${
          isActive
            ? 'bg-primary-50 text-primary-700 font-semibold'
            : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
        }`
      }
    >
      <span className="text-base">{icon}</span>
      <span>{label}</span>
    </NavLink>
  )
}

const adminNav = [
  { to: '/admin/dashboard',    icon: icons.dashboard,    label: 'Dashboard'     },
  { to: '/admin/doctors',      icon: icons.doctors,      label: 'Doctors'       },
  { to: '/admin/patients',     icon: icons.patients,     label: 'Patients'      },
  { to: '/admin/appointments', icon: icons.appointments, label: 'Appointments'  },
]

const doctorNav = [
  { to: '/doctor/dashboard',    icon: icons.dashboard,    label: 'Dashboard'    },
  { to: '/doctor/appointments', icon: icons.appointments, label: 'Appointments' },
  { to: '/doctor/availability', icon: icons.availability, label: 'Availability' },
  { to: '/doctor/profile',      icon: icons.profile,      label: 'My Profile'   },
]

const patientNav = [
  { to: '/patient/dashboard',    icon: icons.dashboard,    label: 'Dashboard'     },
  { to: '/patient/book',         icon: icons.book,         label: 'Book Appointment' },
  { to: '/patient/appointments', icon: icons.appointments, label: 'My Appointments'  },
  { to: '/patient/history',      icon: icons.history,      label: 'Medical History'  },
  { to: '/patient/profile',      icon: icons.profile,      label: 'My Profile'       },
]

export default function DashboardLayout({ children }) {
  const { user, logout, isAdmin, isDoctor } = useAuth()
  const navigate = useNavigate()
  const [mobileOpen, setMobileOpen] = useState(false)

  const navItems = isAdmin() ? adminNav : isDoctor() ? doctorNav : patientNav
  const roleLabel = isAdmin() ? 'Administrator' : isDoctor() ? 'Doctor' : 'Patient'
  const roleColor = isAdmin() ? 'bg-purple-100 text-purple-700' : isDoctor() ? 'bg-blue-100 text-blue-700' : 'bg-green-100 text-green-700'

  function handleLogout() {
    logout()
    navigate('/login')
  }

  const sidebar = (
    <div className="flex flex-col h-full">
      {/* Logo */}
      <div className="flex items-center gap-2 px-4 py-5 border-b border-gray-100">
        <div className="w-8 h-8 rounded-lg bg-primary-600 flex items-center justify-center">
          <span className="text-white text-sm font-bold">M</span>
        </div>
        <span className="text-lg font-bold text-gray-900">MediCare</span>
      </div>

      {/* User info */}
      <div className="px-4 py-4 border-b border-gray-100">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-full bg-primary-100 flex items-center justify-center">
            <span className="text-primary-700 font-semibold text-sm">
              {user?.firstName?.[0]}{user?.lastName?.[0]}
            </span>
          </div>
          <div className="overflow-hidden">
            <p className="text-sm font-semibold text-gray-900 truncate">
              {user?.firstName} {user?.lastName}
            </p>
            <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${roleColor}`}>
              {roleLabel}
            </span>
          </div>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
        {navItems.map(item => (
          <NavItem key={item.to} {...item} />
        ))}
      </nav>

      {/* Logout */}
      <div className="px-3 py-4 border-t border-gray-100">
        <NavItem icon={icons.logout} label="Logout" onClick={handleLogout} />
      </div>
    </div>
  )

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Desktop sidebar */}
      <aside className="hidden lg:flex flex-col w-64 bg-white border-r border-gray-200 flex-shrink-0">
        {sidebar}
      </aside>

      {/* Mobile sidebar overlay */}
      {mobileOpen && (
        <div className="fixed inset-0 z-40 lg:hidden">
          <div className="absolute inset-0 bg-black/40" onClick={() => setMobileOpen(false)} />
          <aside className="relative flex flex-col w-64 h-full bg-white shadow-xl z-50">
            {sidebar}
          </aside>
        </div>
      )}

      {/* Main content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top bar */}
        <header className="bg-white border-b border-gray-200 px-4 py-3 flex items-center justify-between lg:justify-end">
          <button
            className="lg:hidden p-2 rounded-lg text-gray-500 hover:bg-gray-100"
            onClick={() => setMobileOpen(true)}
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
          <div className="text-sm text-gray-500">
            {new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-y-auto p-6">
          {children}
        </main>
      </div>
    </div>
  )
}
