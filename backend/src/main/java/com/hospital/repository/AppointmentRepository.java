package com.hospital.repository;

import com.hospital.model.Appointment;
import com.hospital.model.Appointment.AppointmentStatus;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.data.mongodb.repository.Query;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;

@Repository
public interface AppointmentRepository extends MongoRepository<Appointment, String> {

    List<Appointment> findByPatientIdOrderByAppointmentDateDescCreatedAtDesc(String patientId);

    List<Appointment> findByDoctorIdOrderByAppointmentDateDescCreatedAtDesc(String doctorId);

    List<Appointment> findByDoctorIdAndAppointmentDate(String doctorId, LocalDate date);

    List<Appointment> findByDoctorIdAndAppointmentDateAndStatus(
        String doctorId, LocalDate date, AppointmentStatus status);

    List<Appointment> findByPatientIdAndStatus(String patientId, AppointmentStatus status);

    List<Appointment> findByDoctorIdAndStatus(String doctorId, AppointmentStatus status);

    List<Appointment> findByAppointmentDateBetween(LocalDate start, LocalDate end);

    boolean existsByDoctorIdAndAppointmentDateAndTimeSlotAndStatusNot(
        String doctorId, LocalDate date, String timeSlot, AppointmentStatus status);

    long countByStatus(AppointmentStatus status);

    long countByDoctorId(String doctorId);

    long countByPatientId(String patientId);

    @Query("{'appointmentDate': {$gte: ?0, $lte: ?1}}")
    List<Appointment> findByDateRange(LocalDate start, LocalDate end);
}
