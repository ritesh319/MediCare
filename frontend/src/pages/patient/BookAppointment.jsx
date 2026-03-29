import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import DashboardLayout from '../../components/layout/DashboardLayout'
import { LoadingSpinner, PageHeader, Alert, FormField } from '../../components/common'
import { doctorsApi, patientsApi, appointmentsApi } from '../../api'

export default function BookAppointment() {
  const { user } = useAuth()
  const navigate = useNavigate()

  const [step, setStep]         = useState(1)
  const [doctors, setDoctors]   = useState([])
  const [slots, setSlots]       = useState([])
  const [patientId, setPatientId] = useState(null)
  const [loading, setLoading]   = useState(true)
  const [slotsLoading, setSlotsLoading] = useState(false)
  const [booking, setBooking]   = useState(false)
  const [error, setError]       = useState('')

  const [form, setForm] = useState({
    doctorId: '', appointmentDate: '', timeSlot: '',
    startTime: '', endTime: '', reasonForVisit: '', symptoms: '', notes: '',
  })

  useEffect(() => {
    async function load() {
      try {
        const [docs, patient] = await Promise.all([
          doctorsApi.getActive(),
          patientsApi.getByUserId(user.id),
        ])
        setDoctors(docs)
        setPatientId(patient.id)
      } catch (e) { setError(e.message) }
      finally { setLoading(false) }
    }
    load()
  }, [user.id])

  useEffect(() => {
    if (form.doctorId && form.appointmentDate) {
      fetchSlots()
    }
  }, [form.doctorId, form.appointmentDate])

  async function fetchSlots() {
    setSlotsLoading(true)
    setSlots([])
    setForm(f => ({ ...f, timeSlot: '', startTime: '', endTime: '' }))
    try {
      const available = await doctorsApi.getAvailableSlots(form.doctorId, form.appointmentDate)
      setSlots(available)
    } catch (e) { setError(e.message) }
    finally { setSlotsLoading(false) }
  }

  function selectSlot(slot) {
    const [start, end] = slot.split('-')
    setForm(f => ({ ...f, timeSlot: slot, startTime: start, endTime: end }))
  }

  async function handleBook() {
    if (!form.doctorId || !form.appointmentDate || !form.timeSlot || !form.reasonForVisit) {
      setError('Please fill all required fields.')
      return
    }
    setBooking(true)
    setError('')
    try {
      await appointmentsApi.book(patientId, form)
      navigate('/patient/appointments', { state: { success: true } })
    } catch (e) { setError(e.message) }
    finally { setBooking(false) }
  }

  const selectedDoctor = doctors.find(d => d.id === form.doctorId)
  const today = new Date().toISOString().split('T')[0]

  return (
    <DashboardLayout>
      <PageHeader title="Book Appointment" subtitle="Schedule a visit with a doctor" />

      {error && <Alert message={error} onDismiss={() => setError('')} className="mb-4" />}

      {loading ? <LoadingSpinner /> : (
        <div className="max-w-2xl">
          {/* Step indicator */}
          <div className="flex items-center gap-3 mb-8">
            {[1, 2, 3].map(s => (
              <div key={s} className="flex items-center gap-2">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold transition-colors ${
                  step >= s ? 'bg-primary-600 text-white' : 'bg-gray-200 text-gray-500'
                }`}>{s}</div>
                <span className={`text-sm font-medium hidden sm:block ${step >= s ? 'text-primary-600' : 'text-gray-400'}`}>
                  {['Choose Doctor', 'Select Slot', 'Confirm'][s - 1]}
                </span>
                {s < 3 && <div className={`h-px w-8 ${step > s ? 'bg-primary-400' : 'bg-gray-200'}`} />}
              </div>
            ))}
          </div>

          {/* Step 1: Choose doctor & date */}
          {step === 1 && (
            <div className="card space-y-5">
              <h2 className="font-semibold text-gray-900">Select Doctor & Date</h2>

              <FormField label="Doctor" required>
                <select value={form.doctorId} onChange={e => setForm(f => ({ ...f, doctorId: e.target.value }))}
                  className="input-field">
                  <option value="">Select a doctor…</option>
                  {doctors.map(d => (
                    <option key={d.id} value={d.id}>
                      Dr. {d.firstName} {d.lastName} — {d.specialization || 'General'}
                      {d.consultationFee ? ` ($${d.consultationFee})` : ''}
                    </option>
                  ))}
                </select>
              </FormField>

              {selectedDoctor && (
                <div className="p-3 bg-blue-50 rounded-xl border border-blue-100 flex items-start gap-3">
                  <div className="w-10 h-10 rounded-full bg-blue-200 flex items-center justify-center text-blue-800 font-bold">
                    {selectedDoctor.firstName?.[0]}
                  </div>
                  <div>
                    <p className="font-semibold text-blue-900">Dr. {selectedDoctor.firstName} {selectedDoctor.lastName}</p>
                    <p className="text-xs text-blue-600">{selectedDoctor.specialization} · {selectedDoctor.experienceYears} yr exp</p>
                    {selectedDoctor.consultationFee > 0 &&
                      <p className="text-xs text-blue-700 mt-0.5">Fee: ${selectedDoctor.consultationFee}</p>}
                  </div>
                </div>
              )}

              <FormField label="Appointment Date" required>
                <input type="date" value={form.appointmentDate}
                  onChange={e => setForm(f => ({ ...f, appointmentDate: e.target.value }))}
                  min={today} className="input-field" />
              </FormField>

              <button
                onClick={() => { if (form.doctorId && form.appointmentDate) setStep(2) }}
                disabled={!form.doctorId || !form.appointmentDate}
                className="btn-primary w-full">Next →</button>
            </div>
          )}

          {/* Step 2: Time slot */}
          {step === 2 && (
            <div className="card space-y-5">
              <h2 className="font-semibold text-gray-900">Select Time Slot</h2>
              <p className="text-sm text-gray-500">
                Dr. {selectedDoctor?.firstName} {selectedDoctor?.lastName} — {form.appointmentDate}
              </p>

              {slotsLoading ? <LoadingSpinner size="sm" /> : slots.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-gray-400 text-sm">No available slots for this date.</p>
                  <p className="text-xs text-gray-300 mt-1">Try selecting a different date.</p>
                </div>
              ) : (
                <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
                  {slots.map(slot => (
                    <button key={slot} onClick={() => selectSlot(slot)}
                      className={`py-2 px-3 rounded-lg text-xs font-semibold border transition-colors ${
                        form.timeSlot === slot
                          ? 'bg-primary-600 text-white border-primary-600'
                          : 'bg-white text-gray-700 border-gray-200 hover:border-primary-400 hover:text-primary-600'
                      }`}>{slot}</button>
                  ))}
                </div>
              )}

              <div className="flex gap-3">
                <button onClick={() => setStep(1)} className="btn-secondary flex-1">← Back</button>
                <button onClick={() => { if (form.timeSlot) setStep(3) }}
                  disabled={!form.timeSlot} className="btn-primary flex-1">Next →</button>
              </div>
            </div>
          )}

          {/* Step 3: Confirm */}
          {step === 3 && (
            <div className="card space-y-5">
              <h2 className="font-semibold text-gray-900">Appointment Details</h2>

              <div className="p-4 bg-gray-50 rounded-xl space-y-2 text-sm">
                <Row label="Doctor" value={`Dr. ${selectedDoctor?.firstName} ${selectedDoctor?.lastName}`} />
                <Row label="Date"   value={form.appointmentDate} />
                <Row label="Time"   value={form.timeSlot} />
                {selectedDoctor?.consultationFee > 0 && (
                  <Row label="Fee" value={`$${selectedDoctor.consultationFee}`} />
                )}
              </div>

              <FormField label="Reason for Visit" required>
                <input value={form.reasonForVisit}
                  onChange={e => setForm(f => ({ ...f, reasonForVisit: e.target.value }))}
                  className="input-field" placeholder="E.g. Annual checkup, chest pain…" />
              </FormField>

              <FormField label="Symptoms (optional)">
                <textarea value={form.symptoms}
                  onChange={e => setForm(f => ({ ...f, symptoms: e.target.value }))}
                  className="input-field resize-none" rows={3}
                  placeholder="Describe any symptoms…" />
              </FormField>

              <FormField label="Additional Notes (optional)">
                <textarea value={form.notes}
                  onChange={e => setForm(f => ({ ...f, notes: e.target.value }))}
                  className="input-field resize-none" rows={2} placeholder="Any other information…" />
              </FormField>

              <div className="flex gap-3">
                <button onClick={() => setStep(2)} className="btn-secondary flex-1">← Back</button>
                <button onClick={handleBook} disabled={booking} className="btn-primary flex-1">
                  {booking ? (
                    <span className="flex items-center gap-2 justify-center">
                      <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      Booking…
                    </span>
                  ) : '✓ Confirm Booking'}
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </DashboardLayout>
  )
}

function Row({ label, value }) {
  return (
    <div className="flex justify-between">
      <span className="text-gray-500">{label}</span>
      <span className="font-medium text-gray-900">{value}</span>
    </div>
  )
}
