package com.campusfest.backend.controller;

import com.campusfest.backend.dto.*;
import com.campusfest.backend.service.EventService;
import jakarta.validation.Valid;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/events")
public class EventController {
    private final EventService service;
    public EventController(EventService service){this.service=service;}
    @GetMapping public List<EventResponse> list(){return service.published();}
    @GetMapping("/all") @PreAuthorize("hasRole('ADMIN')") public List<EventResponse> all(){return service.all();}
    @GetMapping("/{id}") public EventResponse get(@PathVariable Long id){return service.get(id);}
    @PostMapping @PreAuthorize("hasRole('ADMIN')")
    public EventResponse create(@Valid @RequestBody EventRequest r,org.springframework.security.core.Authentication a){return service.create(r,a.getName());}
    @PutMapping("/{id}") @PreAuthorize("hasRole('ADMIN')")
    public EventResponse update(@PathVariable Long id,@Valid @RequestBody EventRequest r,org.springframework.security.core.Authentication a){return service.update(id,r,a.getName());}
    @DeleteMapping("/{id}") @PreAuthorize("hasRole('ADMIN')") public void delete(@PathVariable Long id,org.springframework.security.core.Authentication a){service.delete(id,a.getName());}
}
