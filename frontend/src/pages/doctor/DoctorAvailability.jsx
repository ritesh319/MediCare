import { useState, useEffect } from 'react'
import { useAuth } from '../../context/AuthContext'
import DashboardLayout from '../../components/layout/DashboardLayout'
import { LoadingSpinner, PageHeader, Alert } from '../../components/common'
import { doctorsApi } from '../../api'

const DAYS = ['MONDAY','TUESDAY','WEDNESDAY','THURSDAY','FRIDAY','SATURDAY','SUNDAY']

const defaultSchedule = DAYS.map(day => ({
  dayOfWeek: day,
  startTime: '09:00',
  endTime: '17:00',
  slotDurationMinutes: 30,
  isAvailable: day !== 'SATURDAY' && day !== 'SUNDAY',
}))

export default function DoctorAvailability() {
  const { user } = useAuth()
  const [doctorId, setDoctorId] = useState(null)
  const [schedule, setSchedule] = useState(defaultSchedule)
  const [loading, setLoading]   = useState(true)
  const [saving, setSaving]     = useState(false)
  const [success, setSuccess]   = useState('')
  const [error, setError]       = useState('')

  useEffect(() => {
    async function load() {
      try {
        const doc = await doctorsApi.getByUserId(user.id)
        setDoctorId(doc.id)
        if (doc.availabilitySchedule?.length > 0) {
          // Merge with defaults so all 7 days appear
          const merged = DAYS.map(day => {
            const existing = doc.availabilitySchedule.find(s => s.dayOfWeek === day)
            return existing || defaultSchedule.find(d => d.dayOfWeek === day)
          })
          setSchedule(merged)
        }
      } catch (e) { setError(e.message) }
      finally { setLoading(false) }
    }
    load()
  }, [user.id])

  function updateDay(day, field, value) {
    setSchedule(s => s.map(d =>
      d.dayOfWeek === day ? { ...d, [field]: value } : d
    ))
  }

  async function handleSave() {
    setSaving(true)
    setError('')
    try {
      await doctorsApi.updateAvailability(doctorId, schedule)
      setSuccess('Availability saved!')
      setTimeout(() => setSuccess(''), 3000)
    } catch (e) { setError(e.message) }
    finally { setSaving(false) }
  }

  return (
    <DashboardLayout>
      <PageHeader title="Availability Schedule"
        subtitle="Configure your working hours for each day of the week" />

      {error   && <Alert message={error}   onDismiss={() => setError('')}   className="mb-4" />}
      {success && <Alert type="success" message={success} className="mb-4" />}

      {loading ? <LoadingSpinner /> : (
        <>
          <div className="card overflow-hidden p-0">
            <div className="px-6 py-4 border-b border-gray-100 bg-gray-50">
              <div className="grid grid-cols-12 gap-4 text-xs font-semibold text-gray-500 uppercase tracking-wide">
                <div className="col-span-2">Day</div>
                <div className="col-span-2">Available</div>
                <div className="col-span-2">Start Time</div>
                <div className="col-span-2">End Time</div>
                <div className="col-span-2">Slot (min)</div>
              </div>
            </div>
            <div className="divide-y divide-gray-50">
              {schedule.map(day => (
                <div key={day.dayOfWeek}
                  className={`px-6 py-4 grid grid-cols-12 gap-4 items-center ${!day.isAvailable ? 'opacity-50 bg-gray-50' : ''}`}>
                  <div className="col-span-2">
                    <span className="text-sm font-semibold text-gray-800">
                      {day.dayOfWeek.charAt(0) + day.dayOfWeek.slice(1).toLowerCase()}
                    </span>
                  </div>
                  <div className="col-span-2">
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input type="checkbox" checked={day.isAvailable}
                        onChange={e => updateDay(day.dayOfWeek, 'isAvailable', e.target.checked)}
                        className="sr-only peer" />
                      <div className="w-10 h-5 bg-gray-200 peer-focus:outline-none rounded-full peer
                        peer-checked:bg-primary-600 after:content-[''] after:absolute after:top-[2px]
                        after:left-[2px] after:bg-white after:rounded-full after:h-4 after:w-4
                        after:transition-all peer-checked:after:translate-x-5" />
                    </label>
                  </div>
                  <div className="col-span-2">
                    <input type="time" value={day.startTime} disabled={!day.isAvailable}
                      onChange={e => updateDay(day.dayOfWeek, 'startTime', e.target.value)}
                      className="input-field text-sm py-1.5 disabled:cursor-not-allowed" />
                  </div>
                  <div className="col-span-2">
                    <input type="time" value={day.endTime} disabled={!day.isAvailable}
                      onChange={e => updateDay(day.dayOfWeek, 'endTime', e.target.value)}
                      className="input-field text-sm py-1.5 disabled:cursor-not-allowed" />
                  </div>
                  <div className="col-span-2">
                    <select value={day.slotDurationMinutes} disabled={!day.isAvailable}
                      onChange={e => updateDay(day.dayOfWeek, 'slotDurationMinutes', Number(e.target.value))}
                      className="input-field text-sm py-1.5 disabled:cursor-not-allowed">
                      <option value={15}>15 min</option>
                      <option value={20}>20 min</option>
                      <option value={30}>30 min</option>
                      <option value={45}>45 min</option>
                      <option value={60}>60 min</option>
                    </select>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="flex justify-end mt-5">
            <button onClick={handleSave} disabled={saving} className="btn-primary">
              {saving ? 'Saving…' : 'Save Schedule'}
            </button>
          </div>
        </>
      )}
    </DashboardLayout>
  )
}
