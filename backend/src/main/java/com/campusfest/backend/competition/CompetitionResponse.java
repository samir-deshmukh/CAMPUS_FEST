package com.campusfest.backend.competition;
import java.time.Instant;
public record CompetitionResponse(Long id,Long eventId,String eventTitle,String title,String description,CompetitionStatus status,Long createdBy,Instant createdAt){static CompetitionResponse from(Competition c){return new CompetitionResponse(c.getId(),c.getEvent().getId(),c.getEvent().getTitle(),c.getTitle(),c.getDescription(),c.getStatus(),c.getCreatedBy().getId(),c.getCreatedAt());}}
