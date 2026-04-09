package com.hospital.model;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.index.Indexed;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Document(collection = "doctors")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Doctor {

    @Id
    private String id;

    @Indexed(unique = true)
    private String userId;

    private String firstName;
    private String lastName;
    private String email;
    private String phone;

    private String specialization;
    private String qualification;
    private String licenseNumber;
    private int experienceYears;
    private String department;
    private String bio;

    private double consultationFee;
    private String profileImageUrl;

    @Builder.Default
    private List<Availability> availabilitySchedule = new ArrayList<>();

    private boolean active;
    private double rating;
    private int totalReviews;

    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class Availability {
        private String dayOfWeek;
        private String startTime;
        private String endTime;
        private int slotDurationMinutes;
        private boolean available;
    }
}
