package com.hospital.dto.request;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class UpdateAppointmentRequest {
    private String status;
    private String diagnosis;
    private String prescription;
    private String notes;
    private String cancellationReason;
}
