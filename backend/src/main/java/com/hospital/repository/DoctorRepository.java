package com.hospital.repository;

import com.hospital.model.Doctor;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface DoctorRepository extends MongoRepository<Doctor, String> {
    Optional<Doctor> findByUserId(String userId);
    Optional<Doctor> findByEmail(String email);
    boolean existsByUserId(String userId);
    boolean existsByLicenseNumber(String licenseNumber);
    List<Doctor> findBySpecializationIgnoreCase(String specialization);
    List<Doctor> findByActiveTrue();
    List<Doctor> findByDepartmentIgnoreCase(String department);
    List<Doctor> findByFirstNameContainingIgnoreCaseOrLastNameContainingIgnoreCase(
        String firstName, String lastName);
}
