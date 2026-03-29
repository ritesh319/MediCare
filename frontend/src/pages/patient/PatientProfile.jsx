import { useState, useEffect } from 'react'
import { useAuth } from '../../context/AuthContext'
import DashboardLayout from '../../components/layout/DashboardLayout'
import { LoadingSpinner, PageHeader, Alert, FormField } from '../../components/common'
import { patientsApi } from '../../api'

export default function PatientProfile() {
  const { user } = useAuth()
  const [patient, setPatient] = useState(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving]   = useState(false)
  const [success, setSuccess] = useState('')
  const [error, setError]     = useState('')

  const [form, setForm] = useState({
    firstName: '', lastName: '', phone: '', dateOfBirth: '',
    gender: '', bloodGroup: '',
    allergies: '', currentMedications: '',
    address: { street: '', city: '', state: '', zipCode: '', country: '' },
    emergencyContact: { name: '', relationship: '', phone: '' },
  })

  useEffect(() => {
    async function load() {
      try {
        const p = await patientsApi.getByUserId(user.id)
        setPatient(p)
        setForm({
          firstName:          p.firstName          || '',
          lastName:           p.lastName           || '',
          phone:              p.phone              || '',
          dateOfBirth:        p.dateOfBirth        || '',
          gender:             p.gender             || '',
          bloodGroup:         p.bloodGroup         || '',
          allergies:          (p.allergies         || []).join(', '),
          currentMedications: (p.currentMedications|| []).join(', '),
          address: {
            street:  p.address?.street  || '',
            city:    p.address?.city    || '',
            state:   p.address?.state   || '',
            zipCode: p.address?.zipCode || '',
            country: p.address?.country || '',
          },
          emergencyContact: {
            name:         p.emergencyContact?.name         || '',
            relationship: p.emergencyContact?.relationship || '',
            phone:        p.emergencyContact?.phone        || '',
          },
        })
      } catch (e) { setError(e.message) }
      finally { setLoading(false) }
    }
    load()
  }, [user.id])

  function handleChange(e) {
    const { name, value } = e.target
    if (name.startsWith('address.')) {
      const key = name.split('.')[1]
      setForm(f => ({ ...f, address: { ...f.address, [key]: value } }))
    } else if (name.startsWith('emergency.')) {
      const key = name.split('.')[1]
      setForm(f => ({ ...f, emergencyContact: { ...f.emergencyContact, [key]: value } }))
    } else {
      setForm(f => ({ ...f, [name]: value }))
    }
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setSaving(true)
    setError('')
    try {
      const payload = {
        ...form,
        allergies:          form.allergies.split(',').map(s => s.trim()).filter(Boolean),
        currentMedications: form.currentMedications.split(',').map(s => s.trim()).filter(Boolean),
      }
      const updated = await patientsApi.updateProfile(patient.id, payload)
      setPatient(updated)
      setSuccess('Profile updated!')
      setTimeout(() => setSuccess(''), 3000)
    } catch (e) { setError(e.message) }
    finally { setSaving(false) }
  }

  const bloodGroups = ['A+','A-','B+','B-','AB+','AB-','O+','O-']

  return (
    <DashboardLayout>
      <PageHeader title="My Profile" subtitle="Keep your health information up to date" />

      {loading ? <LoadingSpinner /> : (
        <form onSubmit={handleSubmit} className="space-y-6 max-w-3xl">
          {error   && <Alert message={error}   onDismiss={() => setError('')} />}
          {success && <Alert type="success" message={success} />}

          {/* Personal Info */}
          <div className="card">
            <h2 className="font-semibold text-gray-900 mb-4">Personal Information</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <FormField label="First Name">
                <input name="firstName" value={form.firstName} onChange={handleChange} className="input-field" />
              </FormField>
              <FormField label="Last Name">
                <input name="lastName" value={form.lastName} onChange={handleChange} className="input-field" />
              </FormField>
              <FormField label="Phone">
                <input name="phone" value={form.phone} onChange={handleChange} className="input-field" />
              </FormField>
              <FormField label="Date of Birth">
                <input type="date" name="dateOfBirth" value={form.dateOfBirth} onChange={handleChange} className="input-field" />
              </FormField>
              <FormField label="Gender">
                <select name="gender" value={form.gender} onChange={handleChange} className="input-field">
                  <option value="">Select…</option>
                  {['Male','Female','Non-binary','Prefer not to say'].map(g => <option key={g}>{g}</option>)}
                </select>
              </FormField>
              <FormField label="Blood Group">
                <select name="bloodGroup" value={form.bloodGroup} onChange={handleChange} className="input-field">
                  <option value="">Select…</option>
                  {bloodGroups.map(b => <option key={b}>{b}</option>)}
                </select>
              </FormField>
            </div>
          </div>

          {/* Medical Info */}
          <div className="card">
            <h2 className="font-semibold text-gray-900 mb-4">Medical Information</h2>
            <div className="space-y-4">
              <FormField label="Allergies (comma-separated)">
                <input name="allergies" value={form.allergies} onChange={handleChange}
                  className="input-field" placeholder="Penicillin, Peanuts…" />
              </FormField>
              <FormField label="Current Medications (comma-separated)">
                <input name="currentMedications" value={form.currentMedications} onChange={handleChange}
                  className="input-field" placeholder="Aspirin 100mg, Metformin…" />
              </FormField>
            </div>
          </div>

          {/* Address */}
          <div className="card">
            <h2 className="font-semibold text-gray-900 mb-4">Address</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="sm:col-span-2">
                <FormField label="Street">
                  <input name="address.street" value={form.address.street} onChange={handleChange} className="input-field" />
                </FormField>
              </div>
              <FormField label="City">
                <input name="address.city" value={form.address.city} onChange={handleChange} className="input-field" />
              </FormField>
              <FormField label="State">
                <input name="address.state" value={form.address.state} onChange={handleChange} className="input-field" />
              </FormField>
              <FormField label="Zip Code">
                <input name="address.zipCode" value={form.address.zipCode} onChange={handleChange} className="input-field" />
              </FormField>
              <FormField label="Country">
                <input name="address.country" value={form.address.country} onChange={handleChange} className="input-field" />
              </FormField>
            </div>
          </div>

          {/* Emergency Contact */}
          <div className="card">
            <h2 className="font-semibold text-gray-900 mb-4">Emergency Contact</h2>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <FormField label="Name">
                <input name="emergency.name" value={form.emergencyContact.name} onChange={handleChange} className="input-field" />
              </FormField>
              <FormField label="Relationship">
                <input name="emergency.relationship" value={form.emergencyContact.relationship} onChange={handleChange} className="input-field" placeholder="Spouse, Parent…" />
              </FormField>
              <FormField label="Phone">
                <input name="emergency.phone" value={form.emergencyContact.phone} onChange={handleChange} className="input-field" />
              </FormField>
            </div>
          </div>

          <div className="flex justify-end">
            <button type="submit" disabled={saving} className="btn-primary">
              {saving ? 'Saving…' : 'Save Profile'}
            </button>
          </div>
        </form>
      )}
    </DashboardLayout>
  )
}
