package com.campusfest.backend.dto;

import com.campusfest.backend.pass.EntryPass;
import java.time.Instant;

public record EntryPassResponse(Long id,Long registrationId,Long eventId,String eventTitle,String token,String status,Instant issuedAt,Instant checkedInAt){
 public static EntryPassResponse from(EntryPass p){return new EntryPassResponse(p.getId(),p.getRegistration().getId(),p.getRegistration().getEvent().getId(),p.getRegistration().getEvent().getTitle(),p.getToken(),p.getStatus().name(),p.getIssuedAt(),p.getCheckedInAt());}
}
