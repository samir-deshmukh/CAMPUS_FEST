package com.campusfest.backend.controller;

import com.campusfest.backend.dto.RegistrationResponse;
import com.campusfest.backend.service.RegistrationService;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController @RequestMapping("/api/registrations") @PreAuthorize("hasAnyRole('STUDENT','ORGANIZER','ADMIN')")
public class RegistrationController{
 private final RegistrationService service; public RegistrationController(RegistrationService s){service=s;}
 @PostMapping("/events/{eventId}") public RegistrationResponse register(@PathVariable Long eventId,org.springframework.security.core.Authentication a){return service.register(eventId,a.getName());}
 @GetMapping("/me") public List<RegistrationResponse> mine(org.springframework.security.core.Authentication a){return service.mine(a.getName());}
 @DeleteMapping("/{id}") public void cancel(@PathVariable Long id,org.springframework.security.core.Authentication a){service.cancel(id,a.getName());}
}
