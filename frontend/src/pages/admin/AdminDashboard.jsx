import { useState, useEffect } from 'react'
import DashboardLayout from '../../components/layout/DashboardLayout'
import { StatCard, LoadingSpinner, PageHeader } from '../../components/common'
import { adminApi, appointmentsApi } from '../../api'

export default function AdminDashboard() {
  const [stats, setStats]             = useState(null)
  const [appointments, setAppointments] = useState([])
  const [loading, setLoading]         = useState(true)

  useEffect(() => {
    async function load() {
      try {
        const [s, appts] = await Promise.all([
          adminApi.getDashboardStats(),
          appointmentsApi.getAll(),
        ])
        setStats(s)
        setAppointments(appts.slice(0, 8))
      } catch (_) {}
      finally { setLoading(false) }
    }
    load()
  }, [])

  return (
    <DashboardLayout>
      <PageHeader title="Dashboard" subtitle="Overview of hospital activity" />

      {loading ? <LoadingSpinner /> : (
        <>
          {/* Stats grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 mb-8">
            <StatCard title="Total Patients"  value={stats?.totalPatients}     icon="🧑‍🤝‍🧑" color="blue"   />
            <StatCard title="Total Doctors"   value={stats?.totalDoctors}      icon="👨‍⚕️" color="green"  />
            <StatCard title="Appointments"    value={stats?.totalAppointments} icon="📅" color="purple" />
            <StatCard title="Today"           value={stats?.todaysAppointments} icon="🗓" color="yellow" />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 mb-8">
            <StatCard title="Pending"   value={stats?.pendingAppointments}   icon="⏳" color="yellow" />
            <StatCard title="Confirmed" value={stats?.confirmedAppointments} icon="✅" color="blue"   />
            <StatCard title="Completed" value={stats?.completedAppointments} icon="🎯" color="green"  />
            <StatCard title="Cancelled" value={stats?.cancelledAppointments} icon="❌" color="red"    />
          </div>

          {/* Recent appointments table */}
          <div className="card">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Recent Appointments</h2>
            {appointments.length === 0 ? (
              <p className="text-gray-400 text-sm text-center py-8">No appointments yet</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-gray-100">
                      {['Patient','Doctor','Date','Time Slot','Status'].map(h => (
                        <th key={h} className="text-left py-3 px-2 text-xs font-semibold text-gray-500 uppercase tracking-wide">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                    {appointments.map(a => (
                      <tr key={a.id} className="hover:bg-gray-50 transition-colors">
                        <td className="py-3 px-2 font-medium text-gray-900">{a.patientName}</td>
                        <td className="py-3 px-2 text-gray-600">Dr. {a.doctorName}</td>
                        <td className="py-3 px-2 text-gray-600">{a.appointmentDate}</td>
                        <td className="py-3 px-2 text-gray-600">{a.timeSlot}</td>
                        <td className="py-3 px-2">
                          <span className={`badge-${a.status?.toLowerCase()}`}>{a.status}</span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </>
      )}
    </DashboardLayout>
  )
}
