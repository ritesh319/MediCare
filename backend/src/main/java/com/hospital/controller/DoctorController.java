package com.hospital.controller;

import com.hospital.dto.request.DoctorProfileRequest;
import com.hospital.dto.response.ApiResponse;
import com.hospital.model.Doctor;
import com.hospital.service.DoctorService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;

@RestController
@RequestMapping("/doctors")
@RequiredArgsConstructor
public class DoctorController {

    private final DoctorService doctorService;

    @GetMapping
    public ResponseEntity<ApiResponse<List<Doctor>>> getAllDoctors() {
        return ResponseEntity.ok(ApiResponse.success(doctorService.getAllDoctors()));
    }

    @GetMapping("/active")
    public ResponseEntity<ApiResponse<List<Doctor>>> getActiveDoctors() {
        return ResponseEntity.ok(ApiResponse.success(doctorService.getActiveDoctors()));
    }

    @GetMapping("/search")
    public ResponseEntity<ApiResponse<List<Doctor>>> searchDoctors(
            @RequestParam String query) {
        return ResponseEntity.ok(ApiResponse.success(doctorService.searchDoctors(query)));
    }

    @GetMapping("/specialization/{spec}")
    public ResponseEntity<ApiResponse<List<Doctor>>> getDoctorsBySpecialization(
            @PathVariable String spec) {
        return ResponseEntity.ok(ApiResponse.success(
                doctorService.getDoctorsBySpecialization(spec)));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<Doctor>> getDoctorById(@PathVariable String id) {
        return ResponseEntity.ok(ApiResponse.success(doctorService.getDoctorById(id)));
    }

    @GetMapping("/user/{userId}")
    @PreAuthorize("hasRole('ADMIN') or hasRole('DOCTOR')")
    public ResponseEntity<ApiResponse<Doctor>> getDoctorByUserId(@PathVariable String userId) {
        return ResponseEntity.ok(ApiResponse.success(doctorService.getDoctorByUserId(userId)));
    }

    @GetMapping("/{id}/available-slots")
    public ResponseEntity<ApiResponse<List<String>>> getAvailableSlots(
            @PathVariable String id,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date) {
        return ResponseEntity.ok(ApiResponse.success(
                doctorService.getAvailableSlots(id, date)));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN') or hasRole('DOCTOR')")
    public ResponseEntity<ApiResponse<Doctor>> updateProfile(
            @PathVariable String id,
            @Valid @RequestBody DoctorProfileRequest request) {
        return ResponseEntity.ok(ApiResponse.success("Profile updated successfully",
                doctorService.updateProfile(id, request)));
    }

    @PutMapping("/{id}/availability")
    @PreAuthorize("hasRole('ADMIN') or hasRole('DOCTOR')")
    public ResponseEntity<ApiResponse<Doctor>> updateAvailability(
            @PathVariable String id,
            @RequestBody List<DoctorProfileRequest.AvailabilityRequest> schedule) {
        return ResponseEntity.ok(ApiResponse.success("Availability updated",
                doctorService.updateAvailability(id, schedule)));
    }

    @PatchMapping("/{id}/toggle-status")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<Doctor>> toggleDoctorStatus(@PathVariable String id) {
        return ResponseEntity.ok(ApiResponse.success("Doctor status updated",
                doctorService.toggleDoctorStatus(id)));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<Void>> deleteDoctor(@PathVariable String id) {
        doctorService.deleteDoctor(id);
        return ResponseEntity.ok(ApiResponse.success("Doctor deleted", null));
    }
}
