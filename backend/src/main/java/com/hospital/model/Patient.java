package com.hospital.model;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.index.Indexed;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Document(collection = "patients")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Patient {

    @Id
    private String id;

    @Indexed(unique = true)
    private String userId;

    private String firstName;
    private String lastName;
    private String email;
    private String phone;

    private LocalDate dateOfBirth;
    private String gender;
    private String bloodGroup;

    private Address address;
    private EmergencyContact emergencyContact;

    @Builder.Default
    private List<MedicalRecord> medicalHistory = new ArrayList<>();

    @Builder.Default
    private List<String> allergies = new ArrayList<>();

    @Builder.Default
    private List<String> currentMedications = new ArrayList<>();

    private String profileImageUrl;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class Address {
        private String street;
        private String city;
        private String state;
        private String zipCode;
        private String country;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class EmergencyContact {
        private String name;
        private String relationship;
        private String phone;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class MedicalRecord {
        private String id;
        private String diagnosis;
        private String treatment;
        private String prescribedBy;
        private LocalDate date;
        private String notes;
    }
}
