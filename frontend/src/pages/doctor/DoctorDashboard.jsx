import { useState, useEffect } from 'react'
import { useAuth } from '../../context/AuthContext'
import DashboardLayout from '../../components/layout/DashboardLayout'
import { StatCard, LoadingSpinner, PageHeader, StatusBadge, EmptyState } from '../../components/common'
import { doctorsApi, appointmentsApi } from '../../api'

export default function DoctorDashboard() {
  const { user } = useAuth()
  const [doctor, setDoctor]           = useState(null)
  const [appointments, setAppointments] = useState([])
  const [loading, setLoading]         = useState(true)

  useEffect(() => {
    async function load() {
      try {
        const doc = await doctorsApi.getByUserId(user.id)
        setDoctor(doc)
        const appts = await appointmentsApi.getByDoctor(doc.id)
        setAppointments(appts)
      } catch (_) {}
      finally { setLoading(false) }
    }
    load()
  }, [user.id])

  const today = new Date().toISOString().split('T')[0]
  const todayAppts  = appointments.filter(a => a.appointmentDate === today)
  const pending     = appointments.filter(a => a.status === 'PENDING').length
  const completed   = appointments.filter(a => a.status === 'COMPLETED').length

  async function confirmAppointment(id) {
    try {
      const updated = await appointmentsApi.update(id, { status: 'CONFIRMED' })
      setAppointments(prev => prev.map(a => a.id === id ? updated : a))
    } catch (_) {}
  }

  async function completeAppointment(id) {
    try {
      const updated = await appointmentsApi.update(id, { status: 'COMPLETED' })
      setAppointments(prev => prev.map(a => a.id === id ? updated : a))
    } catch (_) {}
  }

  return (
    <DashboardLayout>
      <PageHeader
        title={`Good morning, Dr. ${user.firstName}!`}
        subtitle="Here's your schedule overview"
      />

      {loading ? <LoadingSpinner /> : (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 mb-8">
            <StatCard title="Total Appointments" value={appointments.length} icon="📅" color="blue"   />
            <StatCard title="Today's Schedule"   value={todayAppts.length}  icon="🗓" color="green"  />
            <StatCard title="Pending"            value={pending}            icon="⏳" color="yellow" />
            <StatCard title="Completed"          value={completed}          icon="✅" color="teal"   />
          </div>

          {/* Doctor profile card */}
          {doctor && (
            <div className="card mb-6 flex items-start gap-4">
              <div className="w-14 h-14 rounded-xl bg-blue-100 flex items-center justify-center text-blue-700 font-bold text-xl flex-shrink-0">
                {doctor.firstName?.[0]}{doctor.lastName?.[0]}
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">Dr. {doctor.firstName} {doctor.lastName}</h3>
                <p className="text-sm text-gray-500">{doctor.specialization || 'Specialization not set'}</p>
                <p className="text-xs text-gray-400 mt-1">{doctor.department} • {doctor.experienceYears} years experience</p>
                {!doctor.specialization && (
                  <p className="mt-2 text-xs text-yellow-600 bg-yellow-50 px-2 py-1 rounded">
                    ⚠️ Complete your profile to start receiving appointments.
                  </p>
                )}
              </div>
            </div>
          )}

          {/* Today's appointments */}
          <div className="card">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Today's Appointments</h2>
            {todayAppts.length === 0 ? (
              <EmptyState icon="🗓" title="No appointments today" description="Enjoy your day off!" />
            ) : (
              <div className="space-y-3">
                {todayAppts.map(a => (
                  <div key={a.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-xl border border-gray-100">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-full bg-green-100 flex items-center justify-center text-green-700 text-sm font-bold">
                        {a.patientName?.[0]}
                      </div>
                      <div>
                        <p className="font-medium text-gray-900 text-sm">{a.patientName}</p>
                        <p className="text-xs text-gray-500">{a.timeSlot} • {a.reasonForVisit}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <StatusBadge status={a.status} />
                      {a.status === 'PENDING' && (
                        <button onClick={() => confirmAppointment(a.id)}
                          className="text-xs btn-primary py-1 px-2">Confirm</button>
                      )}
                      {a.status === 'CONFIRMED' && (
                        <button onClick={() => completeAppointment(a.id)}
                          className="text-xs bg-green-600 text-white rounded px-2 py-1 hover:bg-green-700">Complete</button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </>
      )}
    </DashboardLayout>
  )
}
