import { useState, useEffect } from 'react'
import DashboardLayout from '../../components/layout/DashboardLayout'
import { LoadingSpinner, PageHeader, EmptyState, Modal, Alert } from '../../components/common'
import { doctorsApi } from '../../api'

export default function AdminDoctors() {
  const [doctors, setDoctors]   = useState([])
  const [loading, setLoading]   = useState(true)
  const [search, setSearch]     = useState('')
  const [selected, setSelected] = useState(null)
  const [error, setError]       = useState('')

  useEffect(() => { fetchDoctors() }, [])

  async function fetchDoctors() {
    try {
      setLoading(true)
      const data = await doctorsApi.getAll()
      setDoctors(data)
    } catch (e) { setError(e.message) }
    finally { setLoading(false) }
  }

  async function toggleStatus(id) {
    try {
      const updated = await doctorsApi.toggleStatus(id)
      setDoctors(ds => ds.map(d => d.id === id ? updated : d))
    } catch (e) { setError(e.message) }
  }

  async function deleteDoctor(id) {
    if (!confirm('Delete this doctor?')) return
    try {
      await doctorsApi.delete(id)
      setDoctors(ds => ds.filter(d => d.id !== id))
    } catch (e) { setError(e.message) }
  }

  const filtered = doctors.filter(d =>
    `${d.firstName} ${d.lastName} ${d.specialization} ${d.email}`
      .toLowerCase().includes(search.toLowerCase()))

  return (
    <DashboardLayout>
      <PageHeader title="Manage Doctors" subtitle={`${doctors.length} doctors registered`} />

      {error && <Alert message={error} onDismiss={() => setError('')} className="mb-4" />}

      {/* Search */}
      <div className="mb-5">
        <input
          value={search} onChange={e => setSearch(e.target.value)}
          className="input-field max-w-sm"
          placeholder="Search by name, specialization…"
        />
      </div>

      {loading ? <LoadingSpinner /> : filtered.length === 0 ? (
        <EmptyState icon="👨‍⚕️" title="No doctors found" description="No doctors match your search." />
      ) : (
        <div className="card p-0 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b border-gray-100">
                <tr>
                  {['Doctor','Specialization','Department','Experience','Fee','Status','Actions'].map(h => (
                    <th key={h} className="text-left py-3 px-4 text-xs font-semibold text-gray-500 uppercase tracking-wide">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {filtered.map(d => (
                  <tr key={d.id} className="hover:bg-gray-50 transition-colors">
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-700 font-semibold text-xs">
                          {d.firstName?.[0]}{d.lastName?.[0]}
                        </div>
                        <div>
                          <p className="font-medium text-gray-900">Dr. {d.firstName} {d.lastName}</p>
                          <p className="text-xs text-gray-400">{d.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="py-3 px-4 text-gray-600">{d.specialization || '—'}</td>
                    <td className="py-3 px-4 text-gray-600">{d.department || '—'}</td>
                    <td className="py-3 px-4 text-gray-600">{d.experienceYears ? `${d.experienceYears} yr` : '—'}</td>
                    <td className="py-3 px-4 text-gray-600">{d.consultationFee ? `$${d.consultationFee}` : '—'}</td>
                    <td className="py-3 px-4">
                      <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${d.active ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'}`}>
                        {d.active ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-2">
                        <button onClick={() => setSelected(d)}
                          className="text-xs text-blue-600 hover:text-blue-800 font-medium">View</button>
                        <button onClick={() => toggleStatus(d.id)}
                          className="text-xs text-yellow-600 hover:text-yellow-800 font-medium">
                          {d.active ? 'Deactivate' : 'Activate'}
                        </button>
                        <button onClick={() => deleteDoctor(d.id)}
                          className="text-xs text-red-600 hover:text-red-800 font-medium">Delete</button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Doctor detail modal */}
      <Modal open={!!selected} onClose={() => setSelected(null)} title="Doctor Details">
        {selected && (
          <div className="space-y-3 text-sm">
            <Row label="Name" value={`Dr. ${selected.firstName} ${selected.lastName}`} />
            <Row label="Email" value={selected.email} />
            <Row label="Phone" value={selected.phone || '—'} />
            <Row label="Specialization" value={selected.specialization || '—'} />
            <Row label="Qualification" value={selected.qualification || '—'} />
            <Row label="License" value={selected.licenseNumber || '—'} />
            <Row label="Department" value={selected.department || '—'} />
            <Row label="Experience" value={selected.experienceYears ? `${selected.experienceYears} years` : '—'} />
            <Row label="Fee" value={selected.consultationFee ? `$${selected.consultationFee}` : '—'} />
            {selected.bio && (
              <div>
                <span className="font-medium text-gray-600">Bio:</span>
                <p className="mt-1 text-gray-700">{selected.bio}</p>
              </div>
            )}
          </div>
        )}
      </Modal>
    </DashboardLayout>
  )
}

function Row({ label, value }) {
  return (
    <div className="flex justify-between">
      <span className="text-gray-500 font-medium">{label}</span>
      <span className="text-gray-900">{value}</span>
    </div>
  )
}
