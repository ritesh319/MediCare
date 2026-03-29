package com.hospital.dto.request;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class DoctorProfileRequest {

    @NotBlank(message = "Specialization is required")
    private String specialization;

    @NotBlank(message = "Qualification is required")
    private String qualification;

    @NotBlank(message = "License number is required")
    private String licenseNumber;

    @Min(value = 0, message = "Experience years must be non-negative")
    private int experienceYears;

    private String department;
    private String bio;

    @DecimalMin(value = "0.0", message = "Consultation fee must be non-negative")
    private double consultationFee;

    private List<AvailabilityRequest> availabilitySchedule;

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class AvailabilityRequest {
        private String dayOfWeek;
        private String startTime;
        private String endTime;
        private int slotDurationMinutes;
        private boolean available;
    }
}
