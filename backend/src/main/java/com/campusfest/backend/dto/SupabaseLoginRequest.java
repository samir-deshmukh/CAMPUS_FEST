package com.campusfest.backend.dto;

import jakarta.validation.constraints.NotBlank;

public record SupabaseLoginRequest(@NotBlank String accessToken) {}
