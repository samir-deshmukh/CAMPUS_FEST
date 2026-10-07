package com.campusfest.backend.dto;

import com.campusfest.backend.event.Event;
import com.campusfest.backend.event.EventStatus;
import java.time.Instant;

public record EventResponse(Long id,String title,String description,String posterData,String category,String venue,Instant startTime,Instant endTime,Integer capacity,EventStatus status,Long createdBy) {
    public static EventResponse from(Event e){ return new EventResponse(e.getId(),e.getTitle(),e.getDescription(),e.getPosterData(),e.getCategory(),e.getVenue(),e.getStartTime(),e.getEndTime(),e.getCapacity(),e.getStatus(),e.getCreatedBy().getId()); }
}
