package com.campusfest.backend.dto;

import com.campusfest.backend.registration.Registration;
import com.campusfest.backend.registration.RegistrationStatus;
import java.time.Instant;

public record RegistrationResponse(Long id,Long eventId,String eventTitle,RegistrationStatus status,Instant registeredAt,
                                   String name,String college,String course,String year,String email,String phone,String passToken){
 public static RegistrationResponse from(Registration r,String passToken){
  return new RegistrationResponse(r.getId(),r.getEvent().getId(),r.getEvent().getTitle(),r.getStatus(),r.getRegisteredAt(),
          r.getUser().getName(),r.getUser().getCollege(),r.getUser().getCourse(),r.getUser().getYear(),r.getUser().getEmail(),r.getUser().getPhone(),passToken);
 }
 public static RegistrationResponse from(Registration r){return from(r,null);}
}
