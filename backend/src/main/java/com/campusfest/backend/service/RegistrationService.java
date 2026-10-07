package com.campusfest.backend.service;

import com.campusfest.backend.dto.RegistrationResponse;
import com.campusfest.backend.entity.User;
import com.campusfest.backend.event.*;
import com.campusfest.backend.registration.*;
import com.campusfest.backend.repository.*;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;
import java.util.List;

@Service public class RegistrationService{
 private final RegistrationRepository registrations; private final EventRepository events; private final UserRepository users;
 public RegistrationService(RegistrationRepository r,EventRepository e,UserRepository u){registrations=r;events=e;users=u;}
 @Transactional public RegistrationResponse register(Long eventId,String email){
  User u=users.findByEmailIgnoreCase(email).orElseThrow(()->new ResponseStatusException(HttpStatus.UNAUTHORIZED,"User not found"));
  Event e=events.findByIdForUpdate(eventId).orElseThrow(()->new ResponseStatusException(HttpStatus.NOT_FOUND,"Event not found"));
  if(e.getStatus()!=EventStatus.PUBLISHED)throw new ResponseStatusException(HttpStatus.CONFLICT,"Event is not open for registration");
  if(registrations.existsByEventIdAndUserIdAndStatus(eventId,u.getId(),RegistrationStatus.ACTIVE))throw new ResponseStatusException(HttpStatus.CONFLICT,"Already registered");
  if(registrations.countByEventIdAndStatus(eventId,RegistrationStatus.ACTIVE)>=e.getCapacity())throw new ResponseStatusException(HttpStatus.CONFLICT,"Event is full");
  Registration r=new Registration();r.setEvent(e);r.setUser(u);return RegistrationResponse.from(registrations.save(r));
 }
 public List<RegistrationResponse> mine(String email){User u=users.findByEmailIgnoreCase(email).orElseThrow(()->new ResponseStatusException(HttpStatus.UNAUTHORIZED,"User not found"));return registrations.findByUserIdOrderByRegisteredAtDesc(u.getId()).stream().map(RegistrationResponse::from).toList();}
 @Transactional public void cancel(Long id,String email){User u=users.findByEmailIgnoreCase(email).orElseThrow(()->new ResponseStatusException(HttpStatus.UNAUTHORIZED,"User not found"));Registration r=registrations.findById(id).orElseThrow(()->new ResponseStatusException(HttpStatus.NOT_FOUND,"Registration not found"));if(!r.getUser().getId().equals(u.getId()))throw new ResponseStatusException(HttpStatus.FORBIDDEN,"Not your registration");r.setStatus(RegistrationStatus.CANCELLED);registrations.save(r);}
}
