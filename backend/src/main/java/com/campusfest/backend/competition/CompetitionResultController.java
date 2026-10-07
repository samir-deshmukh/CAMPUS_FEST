package com.campusfest.backend.competition;

import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/competitions")
public class CompetitionResultController {
 private final CompetitionResultService service;
 public CompetitionResultController(CompetitionResultService s){service=s;}
 @PostMapping("/{id}/publish-results")
 @PreAuthorize("hasAnyRole('ORGANIZER','ADMIN')")
 public void publish(@PathVariable Long id){service.publish(id);}
 @GetMapping("/{id}/results")
 public List<CompetitionResult> results(@PathVariable Long id){return service.calculate(id);}
}
