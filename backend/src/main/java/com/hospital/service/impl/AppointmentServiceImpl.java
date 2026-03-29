package com.hospital.service.impl;

import com.hospital.dto.request.AppointmentRequest;
import com.hospital.dto.request.UpdateAppointmentRequest;
import com.hospital.exception.AppointmentConflictException;
import com.hospital.exception.ResourceNotFoundException;
import com.hospital.model.Appointment;
import com.hospital.model.Appointment.AppointmentStatus;
import com.hospital.model.Doctor;
import com.hospital.model.Patient;
import com.hospital.repository.AppointmentRepository;
import com.hospital.repository.DoctorRepository;
import com.hospital.repository.PatientRepository;
import com.hospital.service.AppointmentService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
public class AppointmentServiceImpl implements AppointmentService {

    private final AppointmentRepository appointmentRepository;
    private final PatientRepository patientRepository;
    private final DoctorRepository doctorRepository;

    @Override
    public Appointment bookAppointment(String patientId, AppointmentRequest request) {
        if (patientId == null) {
            throw new IllegalArgumentException("Patient ID cannot be null");
        }
        Patient patient = patientRepository.findById(patientId)
                .orElseThrow(() -> new ResourceNotFoundException("Patient", "id", patientId));

        String doctorId = request.getDoctorId();
        if (doctorId == null) {
            throw new IllegalArgumentException("Doctor ID cannot be null");
        }
        Doctor doctor = doctorRepository.findById(doctorId)
                .orElseThrow(() -> new ResourceNotFoundException("Doctor", "id", doctorId));

        boolean slotTaken = appointmentRepository
                .existsByDoctorIdAndAppointmentDateAndTimeSlotAndStatusNot(
                        request.getDoctorId(),
                        request.getAppointmentDate(),
                        request.getTimeSlot(),
                        AppointmentStatus.CANCELLED);

        if (slotTaken) {
            throw new AppointmentConflictException(
                    "The selected time slot is already booked. Please choose another slot.");
        }

        Appointment appointment = Appointment.builder()
                .patientId(patientId)
                .patientName(patient.getFirstName() + " " + patient.getLastName())
                .patientEmail(patient.getEmail())
                .doctorId(doctor.getId())
                .doctorName(doctor.getFirstName() + " " + doctor.getLastName())
                .doctorSpecialization(doctor.getSpecialization())
                .appointmentDate(request.getAppointmentDate())
                .timeSlot(request.getTimeSlot())
                .startTime(request.getStartTime())
                .endTime(request.getEndTime())
                .status(AppointmentStatus.PENDING)
                .reasonForVisit(request.getReasonForVisit())
                .symptoms(request.getSymptoms())
                .notes(request.getNotes())
                .consultationFee(doctor.getConsultationFee())
                .paid(false)
                .createdAt(LocalDateTime.now())
                .updatedAt(LocalDateTime.now())
                .build();

        if (appointment == null) {
            throw new IllegalStateException("Failed to create appointment");
        }
        return appointmentRepository.save(appointment);
    }

    @Override
    public Appointment getAppointmentById(String id) {
        if (id == null) {
            throw new IllegalArgumentException("Appointment ID cannot be null");
        }
        return appointmentRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Appointment", "id", id));
    }

    @Override
    public Appointment updateAppointment(String id, UpdateAppointmentRequest request) {
        Appointment appointment = getAppointmentById(id);

        if (request.getStatus() != null) {
            appointment.setStatus(AppointmentStatus.valueOf(request.getStatus()));
        }
        if (request.getDiagnosis() != null) appointment.setDiagnosis(request.getDiagnosis());
        if (request.getPrescription() != null) appointment.setPrescription(request.getPrescription());
        if (request.getNotes() != null) appointment.setNotes(request.getNotes());

        appointment.setUpdatedAt(LocalDateTime.now());
        return appointmentRepository.save(appointment);
    }

    @Override
    public Appointment cancelAppointment(String id, String reason) {
        Appointment appointment = getAppointmentById(id);

        if (appointment.getStatus() == AppointmentStatus.COMPLETED) {
            throw new IllegalStateException("Cannot cancel a completed appointment.");
        }

        appointment.setStatus(AppointmentStatus.CANCELLED);
        appointment.setCancellationReason(reason);
        appointment.setCancelledAt(LocalDateTime.now());
        appointment.setUpdatedAt(LocalDateTime.now());
        return appointmentRepository.save(appointment);
    }

    @Override
    public List<Appointment> getAppointmentsByPatient(String patientId) {
        return appointmentRepository
                .findByPatientIdOrderByAppointmentDateDescCreatedAtDesc(patientId);
    }

    @Override
    public List<Appointment> getAppointmentsByDoctor(String doctorId) {
        return appointmentRepository
                .findByDoctorIdOrderByAppointmentDateDescCreatedAtDesc(doctorId);
    }

    @Override
    public List<Appointment> getAppointmentsByDoctorAndDate(String doctorId, LocalDate date) {
        return appointmentRepository.findByDoctorIdAndAppointmentDate(doctorId, date);
    }

    @Override
    public List<Appointment> getAllAppointments() {
        return appointmentRepository.findAll();
    }

    @Override
    public void deleteAppointment(String id) {
        if (id == null) {
            throw new IllegalArgumentException("Appointment ID cannot be null");
        }
        if (!appointmentRepository.existsById(id)) {
            throw new ResourceNotFoundException("Appointment", "id", id);
        }
        appointmentRepository.deleteById(id);
    }
}
