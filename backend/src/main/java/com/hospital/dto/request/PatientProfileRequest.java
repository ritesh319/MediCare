package com.hospital.dto.request;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class PatientProfileRequest {
    private String firstName;
    private String lastName;
    private String phone;
    private LocalDate dateOfBirth;
    private String gender;
    private String bloodGroup;
    private AddressRequest address;
    private EmergencyContactRequest emergencyContact;
    private List<String> allergies;
    private List<String> currentMedications;

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class AddressRequest {
        private String street;
        private String city;
        private String state;
        private String zipCode;
        private String country;
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class EmergencyContactRequest {
        private String name;
        private String relationship;
        private String phone;
    }
}
