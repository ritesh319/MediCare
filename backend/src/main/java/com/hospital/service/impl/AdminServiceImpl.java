package com.hospital.service.impl;

import com.hospital.dto.response.DashboardStatsResponse;
import com.hospital.model.Appointment.AppointmentStatus;
import com.hospital.repository.AppointmentRepository;
import com.hospital.repository.DoctorRepository;
import com.hospital.repository.PatientRepository;
import com.hospital.service.AdminService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDate;

@Service
@RequiredArgsConstructor
public class AdminServiceImpl implements AdminService {

    private final PatientRepository patientRepository;
    private final DoctorRepository doctorRepository;
    private final AppointmentRepository appointmentRepository;

    @Override
    public DashboardStatsResponse getDashboardStats() {
        long todaysCount = appointmentRepository
                .findByDateRange(LocalDate.now(), LocalDate.now()).size();

        return DashboardStatsResponse.builder()
                .totalPatients(patientRepository.count())
                .totalDoctors(doctorRepository.count())
                .totalAppointments(appointmentRepository.count())
                .pendingAppointments(appointmentRepository.countByStatus(AppointmentStatus.PENDING))
                .confirmedAppointments(appointmentRepository.countByStatus(AppointmentStatus.CONFIRMED))
                .completedAppointments(appointmentRepository.countByStatus(AppointmentStatus.COMPLETED))
                .cancelledAppointments(appointmentRepository.countByStatus(AppointmentStatus.CANCELLED))
                .todaysAppointments(todaysCount)
                .build();
    }
}
