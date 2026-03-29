package com.hospital.service;

import com.hospital.dto.request.DoctorProfileRequest;
import com.hospital.model.Doctor;

import java.time.LocalDate;
import java.util.List;

public interface DoctorService {
    Doctor getDoctorById(String id);
    Doctor getDoctorByUserId(String userId);
    Doctor updateProfile(String id, DoctorProfileRequest request);
    Doctor updateAvailability(String id, List<DoctorProfileRequest.AvailabilityRequest> schedule);
    List<Doctor> getAllDoctors();
    List<Doctor> getActiveDoctors();
    List<Doctor> getDoctorsBySpecialization(String specialization);
    List<Doctor> searchDoctors(String query);
    List<String> getAvailableSlots(String doctorId, LocalDate date);
    void deleteDoctor(String id);
    Doctor toggleDoctorStatus(String id);
}
