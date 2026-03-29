import { useState, useEffect } from 'react'
import DashboardLayout from '../../components/layout/DashboardLayout'
import { LoadingSpinner, PageHeader, EmptyState, Modal, Alert } from '../../components/common'
import { patientsApi } from '../../api'

export default function AdminPatients() {
  const [patients, setPatients] = useState([])
  const [loading, setLoading]   = useState(true)
  const [search, setSearch]     = useState('')
  const [selected, setSelected] = useState(null)
  const [error, setError]       = useState('')

  useEffect(() => { fetchPatients() }, [])

  async function fetchPatients() {
    try {
      setLoading(true)
      setPatients(await patientsApi.getAll())
    } catch (e) { setError(e.message) }
    finally { setLoading(false) }
  }

  async function deletePatient(id) {
    if (!confirm('Delete this patient?')) return
    try {
      await patientsApi.delete(id)
      setPatients(ps => ps.filter(p => p.id !== id))
    } catch (e) { setError(e.message) }
  }

  const filtered = patients.filter(p =>
    `${p.firstName} ${p.lastName} ${p.email} ${p.phone}`
      .toLowerCase().includes(search.toLowerCase()))

  return (
    <DashboardLayout>
      <PageHeader title="Manage Patients" subtitle={`${patients.length} patients registered`} />

      {error && <Alert message={error} onDismiss={() => setError('')} />}

      <div className="mb-5 mt-4">
        <input value={search} onChange={e => setSearch(e.target.value)}
          className="input-field max-w-sm" placeholder="Search patients…" />
      </div>

      {loading ? <LoadingSpinner /> : filtered.length === 0 ? (
        <EmptyState icon="🧑‍🤝‍🧑" title="No patients found" />
      ) : (
        <div className="card p-0 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b border-gray-100">
                <tr>
                  {['Patient','Contact','Blood Group','Gender','Records','Actions'].map(h => (
                    <th key={h} className="text-left py-3 px-4 text-xs font-semibold text-gray-500 uppercase tracking-wide">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {filtered.map(p => (
                  <tr key={p.id} className="hover:bg-gray-50 transition-colors">
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center text-green-700 font-semibold text-xs">
                          {p.firstName?.[0]}{p.lastName?.[0]}
                        </div>
                        <div>
                          <p className="font-medium text-gray-900">{p.firstName} {p.lastName}</p>
                          <p className="text-xs text-gray-400">{p.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="py-3 px-4 text-gray-600">{p.phone || '—'}</td>
                    <td className="py-3 px-4">
                      {p.bloodGroup
                        ? <span className="px-2 py-0.5 bg-red-50 text-red-700 rounded text-xs font-medium">{p.bloodGroup}</span>
                        : '—'}
                    </td>
                    <td className="py-3 px-4 text-gray-600">{p.gender || '—'}</td>
                    <td className="py-3 px-4 text-gray-600">{p.medicalHistory?.length ?? 0} records</td>
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-2">
                        <button onClick={() => setSelected(p)}
                          className="text-xs text-blue-600 hover:text-blue-800 font-medium">View</button>
                        <button onClick={() => deletePatient(p.id)}
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

      <Modal open={!!selected} onClose={() => setSelected(null)} title="Patient Details">
        {selected && (
          <div className="space-y-3 text-sm">
            <Row label="Name" value={`${selected.firstName} ${selected.lastName}`} />
            <Row label="Email" value={selected.email} />
            <Row label="Phone" value={selected.phone || '—'} />
            <Row label="DOB" value={selected.dateOfBirth || '—'} />
            <Row label="Gender" value={selected.gender || '—'} />
            <Row label="Blood Group" value={selected.bloodGroup || '—'} />
            {selected.allergies?.length > 0 && (
              <Row label="Allergies" value={selected.allergies.join(', ')} />
            )}
            {selected.currentMedications?.length > 0 && (
              <Row label="Medications" value={selected.currentMedications.join(', ')} />
            )}
            <div>
              <p className="font-medium text-gray-600 mb-2">Medical History ({selected.medicalHistory?.length ?? 0})</p>
              {selected.medicalHistory?.slice(0, 3).map((r, i) => (
                <div key={i} className="p-2 bg-gray-50 rounded mb-1 text-xs">
                  <span className="font-medium">{r.diagnosis}</span> — {r.treatment}
                </div>
              ))}
            </div>
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
