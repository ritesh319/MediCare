package com.hospital.controller;

import com.hospital.dto.request.MedicalRecordRequest;
import com.hospital.dto.request.PatientProfileRequest;
import com.hospital.dto.response.ApiResponse;
import com.hospital.model.Patient;
import com.hospital.service.PatientService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/patients")
@RequiredArgsConstructor
public class PatientController {

    private final PatientService patientService;

    @GetMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<List<Patient>>> getAllPatients() {
        return ResponseEntity.ok(ApiResponse.success(patientService.getAllPatients()));
    }

    @GetMapping("/search")
    @PreAuthorize("hasRole('ADMIN') or hasRole('DOCTOR')")
    public ResponseEntity<ApiResponse<List<Patient>>> searchPatients(
            @RequestParam String query) {
        return ResponseEntity.ok(ApiResponse.success(patientService.searchPatients(query)));
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN') or hasRole('DOCTOR') or hasRole('PATIENT')")
    public ResponseEntity<ApiResponse<Patient>> getPatientById(@PathVariable String id) {
        return ResponseEntity.ok(ApiResponse.success(patientService.getPatientById(id)));
    }

    @GetMapping("/user/{userId}")
    @PreAuthorize("hasRole('ADMIN') or hasRole('PATIENT')")
    public ResponseEntity<ApiResponse<Patient>> getPatientByUserId(@PathVariable String userId) {
        return ResponseEntity.ok(ApiResponse.success(patientService.getPatientByUserId(userId)));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN') or hasRole('PATIENT')")
    public ResponseEntity<ApiResponse<Patient>> updateProfile(
            @PathVariable String id,
            @Valid @RequestBody PatientProfileRequest request) {
        return ResponseEntity.ok(ApiResponse.success("Profile updated successfully",
                patientService.updateProfile(id, request)));
    }

    @PostMapping("/{id}/medical-records")
    @PreAuthorize("hasRole('ADMIN') or hasRole('DOCTOR')")
    public ResponseEntity<ApiResponse<Patient>> addMedicalRecord(
            @PathVariable String id,
            @Valid @RequestBody MedicalRecordRequest request) {
        return ResponseEntity.ok(ApiResponse.success("Medical record added",
                patientService.addMedicalRecord(id, request)));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<Void>> deletePatient(@PathVariable String id) {
        patientService.deletePatient(id);
        return ResponseEntity.ok(ApiResponse.success("Patient deleted", null));
    }
}
