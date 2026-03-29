package com.hospital.service;

import com.hospital.dto.request.AppointmentRequest;
import com.hospital.dto.request.UpdateAppointmentRequest;
import com.hospital.model.Appointment;

import java.time.LocalDate;
import java.util.List;

public interface AppointmentService {
    Appointment bookAppointment(String patientId, AppointmentRequest request);
    Appointment getAppointmentById(String id);
    Appointment updateAppointment(String id, UpdateAppointmentRequest request);
    Appointment cancelAppointment(String id, String reason);
    List<Appointment> getAppointmentsByPatient(String patientId);
    List<Appointment> getAppointmentsByDoctor(String doctorId);
    List<Appointment> getAppointmentsByDoctorAndDate(String doctorId, LocalDate date);
    List<Appointment> getAllAppointments();
    void deleteAppointment(String id);
}
