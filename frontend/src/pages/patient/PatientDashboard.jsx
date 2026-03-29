import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import DashboardLayout from '../../components/layout/DashboardLayout'
import { StatCard, LoadingSpinner, PageHeader, StatusBadge, EmptyState } from '../../components/common'
import { patientsApi, appointmentsApi } from '../../api'

export default function PatientDashboard() {
  const { user } = useAuth()
  const [patient, setPatient]         = useState(null)
  const [appointments, setAppointments] = useState([])
  const [loading, setLoading]         = useState(true)

  useEffect(() => {
    async function load() {
      try {
        const p = await patientsApi.getByUserId(user.id)
        setPatient(p)
        const appts = await appointmentsApi.getByPatient(p.id)
        setAppointments(appts)
      } catch (_) {}
      finally { setLoading(false) }
    }
    load()
  }, [user.id])

  const upcoming  = appointments.filter(a => a.status === 'CONFIRMED' || a.status === 'PENDING')
  const completed = appointments.filter(a => a.status === 'COMPLETED').length

  return (
    <DashboardLayout>
      <PageHeader
        title={`Hello, ${user.firstName}!`}
        subtitle="Manage your health with MediCare"
        action={
          <Link to="/patient/book" className="btn-primary">+ Book Appointment</Link>
        }
      />

      {loading ? <LoadingSpinner /> : (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 mb-8">
            <StatCard title="Total Appointments" value={appointments.length}              icon="📅" color="blue"   />
            <StatCard title="Upcoming"           value={upcoming.length}                  icon="🗓" color="green"  />
            <StatCard title="Completed Visits"   value={completed}                        icon="✅" color="teal"   />
            <StatCard title="Medical Records"    value={patient?.medicalHistory?.length ?? 0} icon="📋" color="purple" />
          </div>

          {/* Profile completeness warning */}
          {patient && !patient.bloodGroup && (
            <div className="mb-6 p-4 bg-yellow-50 border border-yellow-200 rounded-xl flex items-start gap-3">
              <span className="text-yellow-500 text-lg">⚠️</span>
              <div>
                <p className="text-sm font-semibold text-yellow-800">Complete your profile</p>
                <p className="text-xs text-yellow-600 mt-0.5">
                  Add your blood group, allergies, and emergency contact for better care.{' '}
                  <Link to="/patient/profile" className="underline font-medium">Update now →</Link>
                </p>
              </div>
            </div>
          )}

          {/* Upcoming appointments */}
          <div className="card mb-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-900">Upcoming Appointments</h2>
              <Link to="/patient/appointments" className="text-sm text-primary-600 hover:text-primary-700 font-medium">
                View all →
              </Link>
            </div>
            {upcoming.length === 0 ? (
              <EmptyState icon="📅" title="No upcoming appointments"
                description="Book an appointment to get started."
                action={<Link to="/patient/book" className="btn-primary text-sm">Book Now</Link>} />
            ) : (
              <div className="space-y-3">
                {upcoming.slice(0, 4).map(a => (
                  <div key={a.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-xl border border-gray-100">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-700 font-semibold text-sm">
                        {a.doctorName?.[0]}
                      </div>
                      <div>
                        <p className="font-medium text-gray-900 text-sm">Dr. {a.doctorName}</p>
                        <p className="text-xs text-gray-500">{a.doctorSpecialization}</p>
                        <p className="text-xs text-gray-400">{a.appointmentDate} · {a.timeSlot}</p>
                      </div>
                    </div>
                    <StatusBadge status={a.status} />
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Quick links */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {[
              { to: '/patient/book',    icon: '➕', label: 'Book Appointment', desc: 'Schedule a new visit'  },
              { to: '/patient/history', icon: '📋', label: 'Medical History',  desc: 'View past records'     },
              { to: '/patient/profile', icon: '👤', label: 'Update Profile',   desc: 'Manage your info'     },
            ].map(c => (
              <Link key={c.to} to={c.to}
                className="card hover:shadow-md transition-shadow cursor-pointer flex items-center gap-4 group">
                <span className="text-3xl">{c.icon}</span>
                <div>
                  <p className="font-semibold text-gray-900 group-hover:text-primary-600 transition-colors">{c.label}</p>
                  <p className="text-xs text-gray-400">{c.desc}</p>
                </div>
              </Link>
            ))}
          </div>
        </>
      )}
    </DashboardLayout>
  )
}
