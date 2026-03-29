import { useState, useEffect } from 'react'
import DashboardLayout from '../../components/layout/DashboardLayout'
import { LoadingSpinner, PageHeader, EmptyState, StatusBadge, Alert } from '../../components/common'
import { appointmentsApi } from '../../api'

export default function AdminAppointments() {
  const [appointments, setAppointments] = useState([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter]   = useState('ALL')
  const [error, setError]     = useState('')

  useEffect(() => { fetchAll() }, [])

  async function fetchAll() {
    try { setAppointments(await appointmentsApi.getAll()) }
    catch (e) { setError(e.message) }
    finally { setLoading(false) }
  }

  async function handleDelete(id) {
    if (!confirm('Delete this appointment?')) return
    try {
      await appointmentsApi.delete(id)
      setAppointments(a => a.filter(x => x.id !== id))
    } catch (e) { setError(e.message) }
  }

  const statuses = ['ALL', 'PENDING', 'CONFIRMED', 'COMPLETED', 'CANCELLED']
  const filtered = filter === 'ALL' ? appointments
    : appointments.filter(a => a.status === filter)

  return (
    <DashboardLayout>
      <PageHeader title="All Appointments" subtitle={`${appointments.length} total appointments`} />

      {error && <Alert message={error} onDismiss={() => setError('')} />}

      {/* Filter tabs */}
      <div className="flex gap-2 mb-5 flex-wrap mt-4">
        {statuses.map(s => (
          <button key={s} onClick={() => setFilter(s)}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
              filter === s ? 'bg-primary-600 text-white' : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50'
            }`}>
            {s}
          </button>
        ))}
      </div>

      {loading ? <LoadingSpinner /> : filtered.length === 0 ? (
        <EmptyState icon="📅" title="No appointments" description="No appointments match the current filter." />
      ) : (
        <div className="card p-0 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b border-gray-100">
                <tr>
                  {['Patient','Doctor','Date','Time Slot','Reason','Status','Fee','Actions'].map(h => (
                    <th key={h} className="text-left py-3 px-4 text-xs font-semibold text-gray-500 uppercase tracking-wide">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {filtered.map(a => (
                  <tr key={a.id} className="hover:bg-gray-50 transition-colors">
                    <td className="py-3 px-4 font-medium text-gray-900">{a.patientName}</td>
                    <td className="py-3 px-4 text-gray-600">Dr. {a.doctorName}</td>
                    <td className="py-3 px-4 text-gray-600">{a.appointmentDate}</td>
                    <td className="py-3 px-4 text-gray-600">{a.timeSlot}</td>
                    <td className="py-3 px-4 text-gray-600 max-w-xs truncate">{a.reasonForVisit}</td>
                    <td className="py-3 px-4"><StatusBadge status={a.status} /></td>
                    <td className="py-3 px-4 text-gray-600">{a.consultationFee ? `$${a.consultationFee}` : '—'}</td>
                    <td className="py-3 px-4">
                      <button onClick={() => handleDelete(a.id)}
                        className="text-xs text-red-600 hover:text-red-800 font-medium">Delete</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </DashboardLayout>
  )
}
