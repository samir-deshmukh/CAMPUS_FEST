package com.campusfest.backend.service;

import com.campusfest.backend.dto.PublicRegistrationRequest;
import com.campusfest.backend.dto.RegistrationResponse;
import com.campusfest.backend.entity.Role;
import com.campusfest.backend.entity.User;
import com.campusfest.backend.event.*;
import com.campusfest.backend.pass.EntryPass;
import com.campusfest.backend.repository.*;
import com.campusfest.backend.registration.*;
import org.springframework.http.HttpStatus;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;
import java.security.SecureRandom;
import java.util.List;
import java.util.UUID;

@Service
public class RegistrationService{
 private final RegistrationRepository registrations; private final EventRepository events; private final UserRepository users; private final EntryPassRepository passes; private final PasswordEncoder encoder;
 private final SecureRandom random=new SecureRandom();
 public RegistrationService(RegistrationRepository r,EventRepository e,UserRepository u,EntryPassRepository p,PasswordEncoder pe){registrations=r;events=e;users=u;passes=p;encoder=pe;}

 @Transactional
 public RegistrationResponse register(Long eventId, PublicRegistrationRequest request){
  Event e=events.findByIdForUpdate(eventId).orElseThrow(()->new ResponseStatusException(HttpStatus.NOT_FOUND,"Event not found"));
  if(e.getStatus()!=EventStatus.PUBLISHED)throw new ResponseStatusException(HttpStatus.CONFLICT,"Event is not open for registration");
  if(registrations.countByEventIdAndStatus(eventId,RegistrationStatus.ACTIVE)>=e.getCapacity())throw new ResponseStatusException(HttpStatus.CONFLICT,"Event is full");

  String email=request.email().trim().toLowerCase();
  User u=users.findByEmailIgnoreCase(email).orElse(null);
  if(u!=null && u.getRole()==Role.ADMIN) throw new ResponseStatusException(HttpStatus.CONFLICT,"This email cannot be used for a student registration");
  if(u==null){
   u=new User(); u.setName(request.name().trim()); u.setEmail(email); u.setPasswordHash(encoder.encode(UUID.randomUUID().toString())); u.setRole(Role.STUDENT);
  } else if(u.getRole()!=Role.STUDENT) throw new ResponseStatusException(HttpStatus.CONFLICT,"This email is not available for student registration");
  u.setName(request.name().trim()); u.setCollege(request.college().trim()); u.setCourse(request.course().trim()); u.setYear(request.year().trim()); u.setPhone(request.phone().trim());
  u=users.save(u);

  if(registrations.existsByEventIdAndUserIdAndStatus(eventId,u.getId(),RegistrationStatus.ACTIVE))
   throw new ResponseStatusException(HttpStatus.CONFLICT,"This email is already registered for this event");

  Registration r=new Registration(); r.setEvent(e); r.setUser(u); Registration saved=registrations.save(r);
  EntryPass pass=new EntryPass(); pass.setRegistration(saved); pass.setToken(randomToken()); passes.save(pass);
  return RegistrationResponse.from(saved,pass.getToken());
 }

 public RegistrationResponse mine(String passToken){
  EntryPass p=passes.findByToken(passToken).orElseThrow(()->new ResponseStatusException(HttpStatus.NOT_FOUND,"Pass not found"));
  return RegistrationResponse.from(p.getRegistration(),p.getToken());
 }

 @Transactional public void cancel(String passToken){
  EntryPass p=passes.findByToken(passToken).orElseThrow(()->new ResponseStatusException(HttpStatus.NOT_FOUND,"Pass not found"));
  Registration r=p.getRegistration();
  if(r.getStatus()!=RegistrationStatus.ACTIVE)throw new ResponseStatusException(HttpStatus.CONFLICT,"Registration is already cancelled");
  r.setStatus(RegistrationStatus.CANCELLED); registrations.save(r);
 }

 private String randomToken(){
  byte[] b=new byte[32]; random.nextBytes(b); StringBuilder s=new StringBuilder(64);
  for(byte x:b)s.append(String.format("%02x",x)); return s.toString();
 }
}
