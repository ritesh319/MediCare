import { useState, useEffect } from 'react'
import { useAuth } from '../../context/AuthContext'
import DashboardLayout from '../../components/layout/DashboardLayout'
import { LoadingSpinner, PageHeader, Alert, FormField } from '../../components/common'
import { doctorsApi } from '../../api'

export default function DoctorProfile() {
  const { user } = useAuth()
  const [doctor, setDoctor]   = useState(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving]   = useState(false)
  const [success, setSuccess] = useState('')
  const [error, setError]     = useState('')

  const [form, setForm] = useState({
    specialization: '', qualification: '', licenseNumber: '',
    experienceYears: 0, department: '', bio: '', consultationFee: 0,
  })

  useEffect(() => {
    async function load() {
      try {
        const doc = await doctorsApi.getByUserId(user.id)
        setDoctor(doc)
        setForm({
          specialization:  doc.specialization  || '',
          qualification:   doc.qualification   || '',
          licenseNumber:   doc.licenseNumber   || '',
          experienceYears: doc.experienceYears || 0,
          department:      doc.department      || '',
          bio:             doc.bio             || '',
          consultationFee: doc.consultationFee || 0,
        })
      } catch (e) { setError(e.message) }
      finally { setLoading(false) }
    }
    load()
  }, [user.id])

  const handleChange = e => {
    const { name, value } = e.target
    setForm(p => ({ ...p, [name]: name === 'experienceYears' || name === 'consultationFee' ? Number(value) : value }))
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setSaving(true)
    setError('')
    try {
      const updated = await doctorsApi.updateProfile(doctor.id, form)
      setDoctor(updated)
      setSuccess('Profile updated successfully!')
      setTimeout(() => setSuccess(''), 3000)
    } catch (e) { setError(e.message) }
    finally { setSaving(false) }
  }

  const specializations = [
    'General Practice','Cardiology','Dermatology','Endocrinology',
    'Gastroenterology','Neurology','Oncology','Orthopedics',
    'Pediatrics','Psychiatry','Radiology','Surgery','Urology',
  ]

  return (
    <DashboardLayout>
      <PageHeader title="My Profile" subtitle="Keep your professional information up to date" />

      {loading ? <LoadingSpinner /> : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left – identity card */}
          <div className="card flex flex-col items-center text-center">
            <div className="w-20 h-20 rounded-2xl bg-blue-100 flex items-center justify-center text-blue-700 font-bold text-3xl mb-3">
              {user.firstName?.[0]}{user.lastName?.[0]}
            </div>
            <h3 className="font-semibold text-gray-900 text-lg">Dr. {user.firstName} {user.lastName}</h3>
            <p className="text-sm text-gray-500">{doctor?.specialization || 'Specialization not set'}</p>
            <p className="text-xs text-gray-400 mt-1">{user.email}</p>
            {doctor?.licenseNumber && (
              <span className="mt-3 text-xs bg-blue-50 text-blue-700 px-3 py-1 rounded-full">
                Lic: {doctor.licenseNumber}
              </span>
            )}
          </div>

          {/* Right – editable form */}
          <div className="lg:col-span-2 card">
            <h2 className="text-lg font-semibold text-gray-900 mb-5">Professional Details</h2>

            {error   && <Alert message={error}   onDismiss={() => setError('')}   className="mb-4" />}
            {success && <Alert type="success" message={success} className="mb-4" />}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <FormField label="Specialization" required>
                  <select name="specialization" value={form.specialization}
                    onChange={handleChange} className="input-field">
                    <option value="">Select…</option>
                    {specializations.map(s => <option key={s} value={s}>{s}</option>)}
                  </select>
                </FormField>

                <FormField label="Qualification" required>
                  <input name="qualification" value={form.qualification}
                    onChange={handleChange} className="input-field" placeholder="MBBS, MD…" />
                </FormField>

                <FormField label="License Number" required>
                  <input name="licenseNumber" value={form.licenseNumber}
                    onChange={handleChange} className="input-field" placeholder="MED-12345" />
                </FormField>

                <FormField label="Department">
                  <input name="department" value={form.department}
                    onChange={handleChange} className="input-field" placeholder="Cardiology Dept." />
                </FormField>

                <FormField label="Years of Experience">
                  <input type="number" name="experienceYears" value={form.experienceYears}
                    onChange={handleChange} className="input-field" min="0" max="60" />
                </FormField>

                <FormField label="Consultation Fee ($)">
                  <input type="number" name="consultationFee" value={form.consultationFee}
                    onChange={handleChange} className="input-field" min="0" step="0.01" />
                </FormField>
              </div>

              <FormField label="Bio">
                <textarea name="bio" value={form.bio} onChange={handleChange}
                  className="input-field resize-none" rows={4}
                  placeholder="Brief professional introduction…" />
              </FormField>

              <div className="flex justify-end">
                <button type="submit" disabled={saving} className="btn-primary">
                  {saving ? 'Saving…' : 'Save Changes'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </DashboardLayout>
  )
}
