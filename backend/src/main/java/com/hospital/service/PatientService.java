package com.hospital.service;

import com.hospital.dto.request.MedicalRecordRequest;
import com.hospital.dto.request.PatientProfileRequest;
import com.hospital.model.Patient;

import java.util.List;

public interface PatientService {
    Patient getPatientById(String id);
    Patient getPatientByUserId(String userId);
    Patient updateProfile(String id, PatientProfileRequest request);
    Patient addMedicalRecord(String id, MedicalRecordRequest request);
    List<Patient> getAllPatients();
    List<Patient> searchPatients(String query);
    void deletePatient(String id);
}
