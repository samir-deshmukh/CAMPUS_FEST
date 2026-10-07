package com.campusfest.backend.service;

import com.campusfest.backend.dto.*;
import com.campusfest.backend.entity.User;
import com.campusfest.backend.event.*;
import com.campusfest.backend.repository.*;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;
import java.util.List;

@Service
public class EventService {
    private final EventRepository events; private final UserRepository users;
    public EventService(EventRepository events, UserRepository users){this.events=events;this.users=users;}
    public List<EventResponse> published(){return events.findByStatusOrderByStartTimeAsc(EventStatus.PUBLISHED).stream().map(EventResponse::from).toList();}
    public List<EventResponse> all(){return events.findAllByOrderByStartTimeAsc().stream().map(EventResponse::from).toList();}
    public EventResponse get(Long id){return EventResponse.from(events.findById(id).orElseThrow(()->new ResponseStatusException(HttpStatus.NOT_FOUND,"Event not found")));}
    public EventResponse create(EventRequest r,String email){
        User u=users.findByEmailIgnoreCase(email).orElseThrow(()->new ResponseStatusException(HttpStatus.UNAUTHORIZED,"User not found"));
        Event e=new Event(); apply(e,r); e.setCreatedBy(u); return EventResponse.from(events.save(e));
    }
    public EventResponse update(Long id,EventRequest r){Event e=events.findById(id).orElseThrow(()->new ResponseStatusException(HttpStatus.NOT_FOUND,"Event not found"));apply(e,r);return EventResponse.from(events.save(e));}
    public void delete(Long id){if(!events.existsById(id))throw new ResponseStatusException(HttpStatus.NOT_FOUND,"Event not found");events.deleteById(id);}
    private void apply(Event e,EventRequest r){e.setTitle(r.title().trim());e.setDescription(r.description().trim());e.setCategory(r.category().trim());e.setVenue(r.venue().trim());e.setStartTime(r.startTime());e.setEndTime(r.endTime());e.setCapacity(r.capacity());e.setStatus(r.status()==null?EventStatus.DRAFT:r.status());}
}
