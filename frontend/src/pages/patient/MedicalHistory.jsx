import { useState, useEffect } from 'react'
import { useAuth } from '../../context/AuthContext'
import DashboardLayout from '../../components/layout/DashboardLayout'
import { LoadingSpinner, PageHeader, EmptyState, Alert } from '../../components/common'
import { patientsApi } from '../../api'

export default function MedicalHistory() {
  const { user } = useAuth()
  const [patient, setPatient] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError]     = useState('')

  useEffect(() => {
    async function load() {
      try { setPatient(await patientsApi.getByUserId(user.id)) }
      catch (e) { setError(e.message) }
      finally { setLoading(false) }
    }
    load()
  }, [user.id])

  return (
    <DashboardLayout>
      <PageHeader title="Medical History" subtitle="Your complete health records" />

      {error && <Alert message={error} onDismiss={() => setError('')} />}

      {loading ? <LoadingSpinner /> : (
        <>
          {/* Quick health summary */}
          {patient && (
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
              <div className="card text-center">
                <p className="text-2xl font-bold text-red-500">{patient.bloodGroup || '—'}</p>
                <p className="text-xs text-gray-500 mt-1">Blood Group</p>
              </div>
              <div className="card">
                <p className="text-xs font-semibold text-gray-500 uppercase mb-2">Allergies</p>
                {patient.allergies?.length > 0
                  ? <div className="flex flex-wrap gap-1">
                      {patient.allergies.map(a => (
                        <span key={a} className="px-2 py-0.5 bg-orange-100 text-orange-700 rounded text-xs">{a}</span>
                      ))}
                    </div>
                  : <p className="text-sm text-gray-400">None recorded</p>
                }
              </div>
              <div className="card">
                <p className="text-xs font-semibold text-gray-500 uppercase mb-2">Current Medications</p>
                {patient.currentMedications?.length > 0
                  ? <div className="flex flex-wrap gap-1">
                      {patient.currentMedications.map(m => (
                        <span key={m} className="px-2 py-0.5 bg-blue-100 text-blue-700 rounded text-xs">{m}</span>
                      ))}
                    </div>
                  : <p className="text-sm text-gray-400">None recorded</p>
                }
              </div>
            </div>
          )}

          {/* Medical records timeline */}
          <div className="card">
            <h2 className="text-lg font-semibold text-gray-900 mb-5">
              Medical Records ({patient?.medicalHistory?.length ?? 0})
            </h2>
            {!patient?.medicalHistory?.length ? (
              <EmptyState icon="📋" title="No medical records"
                description="Your medical history will appear here after doctor visits." />
            ) : (
              <div className="relative">
                <div className="absolute left-4 top-0 bottom-0 w-px bg-gray-200" />
                <div className="space-y-6">
                  {patient.medicalHistory.map((record, i) => (
                    <div key={record.id || i} className="relative pl-12">
                      <div className="absolute left-2.5 top-1.5 w-3 h-3 rounded-full bg-primary-500 border-2 border-white shadow" />
                      <div className="bg-gray-50 rounded-xl p-4 border border-gray-100">
                        <div className="flex items-start justify-between gap-4 mb-2">
                          <h3 className="font-semibold text-gray-900">{record.diagnosis}</h3>
                          <span className="text-xs text-gray-400 flex-shrink-0">{record.date || 'Date unknown'}</span>
                        </div>
                        <p className="text-sm text-gray-600 mb-2">
                          <span className="font-medium">Treatment:</span> {record.treatment}
                        </p>
                        {record.prescribedBy && (
                          <p className="text-xs text-gray-500">
                            <span className="font-medium">By:</span> {record.prescribedBy}
                          </p>
                        )}
                        {record.notes && (
                          <p className="text-xs text-gray-500 mt-2 italic">"{record.notes}"</p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </>
      )}
    </DashboardLayout>
  )
}
