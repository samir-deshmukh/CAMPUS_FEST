package com.campusfest.backend.controller;

import com.campusfest.backend.dto.PublicRegistrationRequest;
import com.campusfest.backend.dto.RegistrationResponse;
import com.campusfest.backend.service.RegistrationService;
import jakarta.validation.Valid;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/registrations")
public class RegistrationController{
 private final RegistrationService service; public RegistrationController(RegistrationService s){service=s;}
 @PostMapping("/events/{eventId}") public RegistrationResponse register(@PathVariable Long eventId,@Valid @RequestBody PublicRegistrationRequest request){return service.register(eventId,request);}
 @GetMapping("/me") public RegistrationResponse mine(@RequestParam String passToken){return service.mine(passToken);}
 @DeleteMapping("/me") public void cancel(@RequestParam String passToken){service.cancel(passToken);}
}
