package com.campusfest.backend.dto;

import com.campusfest.backend.event.EventStatus;
import jakarta.validation.constraints.*;
import java.time.Instant;

public record EventRequest(
        @NotBlank @Size(max=160) String title,
        @NotBlank @Size(max=4000) String description,
        @Size(max=3000000) String posterData,
        @NotBlank @Size(max=80) String category,
        @NotBlank @Size(max=160) String venue,
        @NotNull Instant startTime,
        @NotNull Instant endTime,
        @NotNull @Min(1) @Max(100000) Integer capacity,
        EventStatus status) {
    @AssertTrue(message="endTime must be after startTime")
    public boolean validTimeRange(){ return startTime != null && endTime != null && endTime.isAfter(startTime); }
}
