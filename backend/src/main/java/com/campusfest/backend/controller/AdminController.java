package com.campusfest.backend.controller;

import com.campusfest.backend.entity.Role;
import com.campusfest.backend.event.Event;
import com.campusfest.backend.event.EventStatus;
import com.campusfest.backend.registration.Registration;
import com.campusfest.backend.registration.RegistrationStatus;
import com.campusfest.backend.repository.EventRepository;
import com.campusfest.backend.repository.RegistrationRepository;
import com.campusfest.backend.repository.UserRepository;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import java.util.*;

@RestController
@RequestMapping("/api/admin")
@PreAuthorize("hasRole('ADMIN')")
public class AdminController {
    private final EventRepository events; private final RegistrationRepository registrations; private final UserRepository users;
    public AdminController(EventRepository e, RegistrationRepository r, UserRepository u){events=e;registrations=r;users=u;}
    @GetMapping("/dashboard")
    public Map<String,Object> dashboard(){
        return Map.of("events", events.count(), "publishedEvents", events.countByStatus(EventStatus.PUBLISHED), "draftEvents", events.countByStatus(EventStatus.DRAFT), "students", users.countByRole(Role.STUDENT), "registrations", registrations.countByStatus(RegistrationStatus.ACTIVE));
    }
    @GetMapping("/registrations")
    public List<Map<String,Object>> registrationList(){
        return registrations.findAll().stream().map(r -> Map.<String,Object>of("id",r.getId(),"eventId",r.getEvent().getId(),"eventTitle",r.getEvent().getTitle(),"studentId",r.getUser().getId(),"studentName",r.getUser().getName(),"studentEmail",r.getUser().getEmail(),"status",r.getStatus().name(),"registeredAt",r.getRegisteredAt())).toList();
    }
}
