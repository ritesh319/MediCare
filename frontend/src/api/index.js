import client from './client'

export const patientsApi = {
  getAll:           ()          => client.get('/patients'),
  getById:          (id)        => client.get(`/patients/${id}`),
  getByUserId:      (uid)       => client.get(`/patients/user/${uid}`),
  search:           (q)         => client.get('/patients/search', { params: { query: q } }),
  updateProfile:    (id, data)  => client.put(`/patients/${id}`, data),
  addMedicalRecord: (id, data)  => client.post(`/patients/${id}/medical-records`, data),
  delete:           (id)        => client.delete(`/patients/${id}`),
}

export const doctorsApi = {
  getAll:             ()          => client.get('/doctors'),
  getActive:          ()          => client.get('/doctors/active'),
  getById:            (id)        => client.get(`/doctors/${id}`),
  getByUserId:        (uid)       => client.get(`/doctors/user/${uid}`),
  search:             (q)         => client.get('/doctors/search', { params: { query: q } }),
  getBySpecialization:(spec)      => client.get(`/doctors/specialization/${spec}`),
  getAvailableSlots:  (id, date)  => client.get(`/doctors/${id}/available-slots`, { params: { date } }),
  updateProfile:      (id, data)  => client.put(`/doctors/${id}`, data),
  updateAvailability: (id, data)  => client.put(`/doctors/${id}/availability`, data),
  toggleStatus:       (id)        => client.patch(`/doctors/${id}/toggle-status`),
  delete:             (id)        => client.delete(`/doctors/${id}`),
}

export const appointmentsApi = {
  getAll:           ()              => client.get('/appointments'),
  getById:          (id)            => client.get(`/appointments/${id}`),
  getByPatient:     (pid)           => client.get(`/appointments/patient/${pid}`),
  getByDoctor:      (did)           => client.get(`/appointments/doctor/${did}`),
  getByDoctorDate:  (did, date)     => client.get(`/appointments/doctor/${did}/date`, { params: { date } }),
  book:             (pid, data)     => client.post(`/appointments/patient/${pid}`, data),
  update:           (id, data)      => client.put(`/appointments/${id}`, data),
  cancel:           (id, reason)    => client.patch(`/appointments/${id}/cancel`, { reason }),
  delete:           (id)            => client.delete(`/appointments/${id}`),
}

export const adminApi = {
  getDashboardStats: () => client.get('/admin/dashboard/stats'),
}
