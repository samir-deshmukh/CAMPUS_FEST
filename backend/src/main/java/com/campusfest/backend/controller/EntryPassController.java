package com.campusfest.backend.controller;

import com.campusfest.backend.dto.EntryPassResponse;
import com.campusfest.backend.service.EntryPassService;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController @RequestMapping("/api/passes") public class EntryPassController{
 private final EntryPassService service; public EntryPassController(EntryPassService s){service=s;}
 @PostMapping("/registrations/{registrationId}") @PreAuthorize("hasRole('STUDENT')") public EntryPassResponse issue(@PathVariable Long registrationId,org.springframework.security.core.Authentication a){return service.issue(registrationId,a.getName());}
 @GetMapping("/registrations/{registrationId}") @PreAuthorize("hasRole('STUDENT')") public EntryPassResponse mine(@PathVariable Long registrationId,org.springframework.security.core.Authentication a){return service.getMine(registrationId,a.getName());}
 @PostMapping("/check-in") @PreAuthorize("hasAnyRole('ORGANIZER','ADMIN')") public EntryPassResponse checkIn(@RequestParam String token){return service.checkIn(token);}
}
