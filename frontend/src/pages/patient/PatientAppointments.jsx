import { useState, useEffect } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import DashboardLayout from '../../components/layout/DashboardLayout'
import { LoadingSpinner, PageHeader, StatusBadge, EmptyState, Modal, Alert } from '../../components/common'
import { patientsApi, appointmentsApi } from '../../api'

export default function PatientAppointments() {
  const { user } = useAuth()
  const location = useLocation()
  const [appointments, setAppointments] = useState([])
  const [patientId, setPatientId] = useState(null)
  const [loading, setLoading]     = useState(true)
  const [filter, setFilter]       = useState('ALL')
  const [selected, setSelected]   = useState(null)
  const [cancelReason, setCancelReason] = useState('')
  const [cancelling, setCancelling]     = useState(false)
  const [error, setError]         = useState('')
  const [success, setSuccess]     = useState(location.state?.success ? 'Appointment booked successfully!' : '')

  useEffect(() => {
    async function load() {
      try {
        const p = await patientsApi.getByUserId(user.id)
        setPatientId(p.id)
        setAppointments(await appointmentsApi.getByPatient(p.id))
      } catch (e) { setError(e.message) }
      finally { setLoading(false) }
    }
    load()
    if (success) setTimeout(() => setSuccess(''), 4000)
  }, [user.id])

  async function handleCancel() {
    if (!cancelReason.trim()) { setError('Please provide a reason.'); return }
    setCancelling(true)
    try {
      await appointmentsApi.cancel(selected.id, cancelReason)
      setAppointments(prev => prev.map(a =>
        a.id === selected.id ? { ...a, status: 'CANCELLED', cancellationReason: cancelReason } : a
      ))
      setSelected(null)
      setCancelReason('')
    } catch (e) { setError(e.message) }
    finally { setCancelling(false) }
  }

  const statuses = ['ALL', 'PENDING', 'CONFIRMED', 'COMPLETED', 'CANCELLED']
  const filtered = filter === 'ALL' ? appointments : appointments.filter(a => a.status === filter)

  return (
    <DashboardLayout>
      <PageHeader title="My Appointments"
        subtitle={`${appointments.length} total appointments`}
        action={<Link to="/patient/book" className="btn-primary">+ Book New</Link>}
      />

      {success && <Alert type="success" message={success} className="mb-4" />}
      {error   && <Alert message={error} onDismiss={() => setError('')} className="mb-4" />}

      <div className="flex gap-2 mb-5 flex-wrap">
        {statuses.map(s => (
          <button key={s} onClick={() => setFilter(s)}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
              filter === s ? 'bg-primary-600 text-white' : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50'
            }`}>{s}
          </button>
        ))}
      </div>

      {loading ? <LoadingSpinner /> : filtered.length === 0 ? (
        <EmptyState icon="📅" title="No appointments found"
          description="Book your first appointment to get started."
          action={<Link to="/patient/book" className="btn-primary">Book Now</Link>}
        />
      ) : (
        <div className="space-y-3">
          {filtered.map(a => (
            <div key={a.id} className="card flex items-center justify-between gap-4">
              <div className="flex items-center gap-4 flex-1 min-w-0">
                <div className="w-12 h-12 rounded-xl bg-blue-50 flex items-center justify-center text-blue-700 font-bold text-lg flex-shrink-0">
                  {a.doctorName?.[0]}
                </div>
                <div className="min-w-0">
                  <p className="font-semibold text-gray-900">Dr. {a.doctorName}</p>
                  <p className="text-xs text-gray-500">{a.doctorSpecialization}</p>
                  <p className="text-xs text-gray-400 mt-0.5">{a.appointmentDate} · {a.timeSlot}</p>
                </div>
              </div>
              <div className="flex items-center gap-3 flex-shrink-0">
                <StatusBadge status={a.status} />
                <button onClick={() => setSelected(a)} className="btn-secondary text-xs py-1 px-2">Details</button>
                {(a.status === 'PENDING' || a.status === 'CONFIRMED') && (
                  <button onClick={() => setSelected(a)} className="btn-danger text-xs py-1 px-2">Cancel</button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Detail / Cancel modal */}
      <Modal open={!!selected} onClose={() => { setSelected(null); setCancelReason('') }}
        title="Appointment Details"
        footer={
          (selected?.status === 'PENDING' || selected?.status === 'CONFIRMED') ? (
            <div className="space-y-3">
              <textarea value={cancelReason} onChange={e => setCancelReason(e.target.value)}
                className="input-field resize-none text-sm" rows={2}
                placeholder="Reason for cancellation…" />
              <button onClick={handleCancel} disabled={cancelling} className="btn-danger w-full">
                {cancelling ? 'Cancelling…' : 'Cancel Appointment'}
              </button>
            </div>
          ) : null
        }>
        {selected && (
          <div className="space-y-3 text-sm">
            <Info label="Doctor"        value={`Dr. ${selected.doctorName}`} />
            <Info label="Specialization" value={selected.doctorSpecialization || '—'} />
            <Info label="Date"          value={selected.appointmentDate} />
            <Info label="Time"          value={selected.timeSlot} />
            <Info label="Status"        value={<StatusBadge status={selected.status} />} />
            <Info label="Reason"        value={selected.reasonForVisit} />
            {selected.symptoms    && <Info label="Symptoms"     value={selected.symptoms} />}
            {selected.diagnosis   && <Info label="Diagnosis"    value={selected.diagnosis} />}
            {selected.prescription && <Info label="Prescription" value={selected.prescription} />}
            {selected.consultationFee > 0 && (
              <Info label="Fee" value={`$${selected.consultationFee} (${selected.isPaid ? 'Paid' : 'Unpaid'})`} />
            )}
            {selected.cancellationReason && (
              <Info label="Cancellation Reason" value={selected.cancellationReason} />
            )}
          </div>
        )}
      </Modal>
    </DashboardLayout>
  )
}

function Info({ label, value }) {
  return (
    <div className="flex justify-between items-start gap-4">
      <span className="text-gray-500 font-medium flex-shrink-0">{label}</span>
      <span className="text-gray-900 text-right">{value}</span>
    </div>
  )
}
