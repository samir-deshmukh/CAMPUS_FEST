package com.campusfest.backend.dto;

import com.campusfest.backend.registration.Registration;
import com.campusfest.backend.registration.RegistrationStatus;
import java.time.Instant;

public record RegistrationResponse(Long id,Long eventId,String eventTitle,RegistrationStatus status,Instant registeredAt){
 public static RegistrationResponse from(Registration r){return new RegistrationResponse(r.getId(),r.getEvent().getId(),r.getEvent().getTitle(),r.getStatus(),r.getRegisteredAt());}
}
