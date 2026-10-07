package com.campusfest.backend.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record PublicRegistrationRequest(
        @NotBlank @Size(max=120) String name,
        @NotBlank @Size(max=160) String college,
        @NotBlank @Size(max=80) String course,
        @NotBlank @Size(max=30) String year,
        @NotBlank @Email @Size(max=180) String email,
        @NotBlank @Size(max=30) String phone
) {}
