package com.hospital.service.impl;

import com.hospital.dto.request.DoctorProfileRequest;
import com.hospital.exception.ResourceNotFoundException;
import com.hospital.model.Appointment;
import com.hospital.model.Doctor;
import com.hospital.repository.AppointmentRepository;
import com.hospital.repository.DoctorRepository;
import com.hospital.service.DoctorService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.time.LocalTime;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class DoctorServiceImpl implements DoctorService {

    private final DoctorRepository doctorRepository;
    private final AppointmentRepository appointmentRepository;

    @Override
    public Doctor getDoctorById(String id) {
        if (id == null) {
            throw new ResourceNotFoundException("Doctor", "id", id);
        }
        return doctorRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Doctor", "id", id));
    }

    @Override
    public Doctor getDoctorByUserId(String userId) {
        return doctorRepository.findByUserId(userId)
                .orElseThrow(() -> new ResourceNotFoundException("Doctor", "userId", userId));
    }

    @Override
    public Doctor updateProfile(String id, DoctorProfileRequest request) {
        Doctor doctor = getDoctorById(id);

        if (request.getSpecialization() != null) doctor.setSpecialization(request.getSpecialization());
        if (request.getQualification()   != null) doctor.setQualification(request.getQualification());
        if (request.getLicenseNumber()   != null) doctor.setLicenseNumber(request.getLicenseNumber());
        if (request.getDepartment()      != null) doctor.setDepartment(request.getDepartment());
        if (request.getBio()             != null) doctor.setBio(request.getBio());
        doctor.setExperienceYears(request.getExperienceYears());
        doctor.setConsultationFee(request.getConsultationFee());

        if (request.getAvailabilitySchedule() != null) {
            doctor.setAvailabilitySchedule(mapAvailability(request.getAvailabilitySchedule()));
        }

        doctor.setUpdatedAt(java.time.LocalDateTime.now());
        return doctorRepository.save(doctor);
    }

    @Override
    public Doctor updateAvailability(String id, List<DoctorProfileRequest.AvailabilityRequest> schedule) {
        Doctor doctor = getDoctorById(id);
        doctor.setAvailabilitySchedule(mapAvailability(schedule));
        doctor.setUpdatedAt(java.time.LocalDateTime.now());
        return doctorRepository.save(doctor);
    }

    @Override
    public List<Doctor> getAllDoctors() {
        return doctorRepository.findAll();
    }

    @Override
    public List<Doctor> getActiveDoctors() {
        return doctorRepository.findByActiveTrue();
    }

    @Override
    public List<Doctor> getDoctorsBySpecialization(String specialization) {
        return doctorRepository.findBySpecializationIgnoreCase(specialization);
    }

    @Override
    public List<Doctor> searchDoctors(String query) {
        return doctorRepository
                .findByFirstNameContainingIgnoreCaseOrLastNameContainingIgnoreCase(query, query);
    }

    @Override
    public List<String> getAvailableSlots(String doctorId, LocalDate date) {
        Doctor doctor = getDoctorById(doctorId);
        String dayOfWeek = date.getDayOfWeek().name();

        Doctor.Availability availability = doctor.getAvailabilitySchedule().stream()
                .filter(a -> a.getDayOfWeek().equalsIgnoreCase(dayOfWeek) && a.isAvailable())
                .findFirst()
                .orElse(null);

        if (availability == null) return List.of();

        List<String> bookedSlots = appointmentRepository
                .findByDoctorIdAndAppointmentDateAndStatus(
                        doctorId, date, Appointment.AppointmentStatus.CONFIRMED)
                .stream()
                .map(Appointment::getTimeSlot)
                .collect(Collectors.toList());

        return generateTimeSlots(
                availability.getStartTime(),
                availability.getEndTime(),
                availability.getSlotDurationMinutes(),
                bookedSlots);
    }

    @Override
    public void deleteDoctor(String id) {
        if (id == null || !doctorRepository.existsById(id)) {
            throw new ResourceNotFoundException("Doctor", "id", id);
        }
        doctorRepository.deleteById(id);
    }

    @Override
    public Doctor toggleDoctorStatus(String id) {
        Doctor doctor = getDoctorById(id);
        doctor.setActive(!doctor.isActive());
        doctor.setUpdatedAt(java.time.LocalDateTime.now());
        return doctorRepository.save(doctor);
    }

    private List<Doctor.Availability> mapAvailability(
            List<DoctorProfileRequest.AvailabilityRequest> requests) {
        return requests.stream().map(r -> Doctor.Availability.builder()
                .dayOfWeek(r.getDayOfWeek())
                .startTime(r.getStartTime())
                .endTime(r.getEndTime())
                .slotDurationMinutes(r.getSlotDurationMinutes())
                .available(r.isAvailable())
                .build()).collect(Collectors.toList());
    }

    private List<String> generateTimeSlots(String startTime, String endTime,
            int durationMinutes, List<String> bookedSlots) {
        List<String> slots = new ArrayList<>();
        DateTimeFormatter fmt = DateTimeFormatter.ofPattern("HH:mm");
        LocalTime current = LocalTime.parse(startTime, fmt);
        LocalTime end = LocalTime.parse(endTime, fmt);

        while (current.plusMinutes(durationMinutes).compareTo(end) <= 0) {
            LocalTime slotEnd = current.plusMinutes(durationMinutes);
            String slot = current.format(fmt) + "-" + slotEnd.format(fmt);
            if (!bookedSlots.contains(slot)) {
                slots.add(slot);
            }
            current = slotEnd;
        }
        return slots;
    }
}
