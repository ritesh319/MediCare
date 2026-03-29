import { useState, useEffect } from 'react'
import { useAuth } from '../../context/AuthContext'
import DashboardLayout from '../../components/layout/DashboardLayout'
import { LoadingSpinner, PageHeader, StatusBadge, EmptyState, Modal, Alert } from '../../components/common'
import { doctorsApi, appointmentsApi } from '../../api'

export default function DoctorAppointments() {
  const { user } = useAuth()
  const [appointments, setAppointments] = useState([])
  const [doctorId, setDoctorId] = useState(null)
  const [loading, setLoading]   = useState(true)
  const [filter, setFilter]     = useState('ALL')
  const [selected, setSelected] = useState(null)
  const [notes, setNotes]       = useState({ diagnosis: '', prescription: '', notes: '' })
  const [saving, setSaving]     = useState(false)
  const [error, setError]       = useState('')

  useEffect(() => {
    async function load() {
      try {
        const doc = await doctorsApi.getByUserId(user.id)
        setDoctorId(doc.id)
        setAppointments(await appointmentsApi.getByDoctor(doc.id))
      } catch (e) { setError(e.message) }
      finally { setLoading(false) }
    }
    load()
  }, [user.id])

  async function updateStatus(id, status) {
    try {
      const updated = await appointmentsApi.update(id, { status })
      setAppointments(prev => prev.map(a => a.id === id ? updated : a))
      if (selected?.id === id) setSelected(updated)
    } catch (e) { setError(e.message) }
  }

  async function saveNotes(id) {
    setSaving(true)
    try {
      const updated = await appointmentsApi.update(id, notes)
      setAppointments(prev => prev.map(a => a.id === id ? updated : a))
      setSelected(updated)
    } catch (e) { setError(e.message) }
    finally { setSaving(false) }
  }

  function openDetail(a) {
    setSelected(a)
    setNotes({ diagnosis: a.diagnosis || '', prescription: a.prescription || '', notes: a.notes || '' })
  }

  const statuses = ['ALL', 'PENDING', 'CONFIRMED', 'COMPLETED', 'CANCELLED']
  const filtered = filter === 'ALL' ? appointments : appointments.filter(a => a.status === filter)

  return (
    <DashboardLayout>
      <PageHeader title="My Appointments" subtitle={`${appointments.length} total appointments`} />

      {error && <Alert message={error} onDismiss={() => setError('')} />}

      <div className="flex gap-2 mb-5 mt-4 flex-wrap">
        {statuses.map(s => (
          <button key={s} onClick={() => setFilter(s)}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
              filter === s ? 'bg-primary-600 text-white' : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50'
            }`}>{s}
          </button>
        ))}
      </div>

      {loading ? <LoadingSpinner /> : filtered.length === 0 ? (
        <EmptyState icon="📅" title="No appointments" />
      ) : (
        <div className="space-y-3">
          {filtered.map(a => (
            <div key={a.id} className="card flex items-center justify-between gap-4">
              <div className="flex items-center gap-4 flex-1 min-w-0">
                <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center text-green-700 font-semibold flex-shrink-0">
                  {a.patientName?.[0]}
                </div>
                <div className="min-w-0">
                  <p className="font-semibold text-gray-900">{a.patientName}</p>
                  <p className="text-xs text-gray-500">{a.appointmentDate} · {a.timeSlot}</p>
                  <p className="text-xs text-gray-400 truncate">{a.reasonForVisit}</p>
                </div>
              </div>
              <div className="flex items-center gap-3 flex-shrink-0">
                <StatusBadge status={a.status} />
                {a.status === 'PENDING' && (
                  <button onClick={() => updateStatus(a.id, 'CONFIRMED')}
                    className="btn-primary text-xs py-1 px-2">Confirm</button>
                )}
                {a.status === 'CONFIRMED' && (
                  <button onClick={() => updateStatus(a.id, 'COMPLETED')}
                    className="text-xs bg-green-600 text-white rounded px-2 py-1 hover:bg-green-700">Complete</button>
                )}
                <button onClick={() => openDetail(a)}
                  className="btn-secondary text-xs py-1 px-2">Details</button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Detail modal */}
      <Modal open={!!selected} onClose={() => setSelected(null)} title="Appointment Details"
        footer={
          <div className="flex justify-between">
            {selected?.status === 'CONFIRMED' && (
              <button onClick={() => saveNotes(selected.id)} disabled={saving}
                className="btn-primary">
                {saving ? 'Saving…' : 'Save Notes'}
              </button>
            )}
            {(selected?.status === 'PENDING' || selected?.status === 'CONFIRMED') && (
              <button onClick={() => { appointmentsApi.cancel(selected.id, 'Cancelled by doctor'); updateStatus(selected.id, 'CANCELLED') }}
                className="btn-danger">Cancel</button>
            )}
          </div>
        }>
        {selected && (
          <div className="space-y-4 text-sm">
            <div className="grid grid-cols-2 gap-3">
              <Info label="Patient"  value={selected.patientName} />
              <Info label="Date"     value={selected.appointmentDate} />
              <Info label="Time"     value={selected.timeSlot} />
              <Info label="Status"   value={<StatusBadge status={selected.status} />} />
              <Info label="Fee"      value={selected.consultationFee ? `$${selected.consultationFee}` : '—'} />
              <Info label="Paid"     value={selected.isPaid ? 'Yes' : 'No'} />
            </div>
            <Info label="Reason"   value={selected.reasonForVisit} />
            {selected.symptoms && <Info label="Symptoms" value={selected.symptoms} />}

            {(selected.status === 'CONFIRMED' || selected.status === 'COMPLETED') && (
              <div className="space-y-3 border-t pt-4">
                <h4 className="font-semibold text-gray-800">Clinical Notes</h4>
                {['diagnosis','prescription','notes'].map(f => (
                  <div key={f}>
                    <label className="block text-xs font-medium text-gray-600 mb-1 capitalize">{f}</label>
                    <textarea value={notes[f]} onChange={e => setNotes(n => ({ ...n, [f]: e.target.value }))}
                      className="input-field resize-none text-xs" rows={2}
                      readOnly={selected.status === 'COMPLETED'}
                      placeholder={`Enter ${f}…`} />
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </Modal>
    </DashboardLayout>
  )
}

function Info({ label, value }) {
  return (
    <div>
      <span className="text-xs text-gray-500 font-medium block">{label}</span>
      <span className="text-sm text-gray-900">{value}</span>
    </div>
  )
}
