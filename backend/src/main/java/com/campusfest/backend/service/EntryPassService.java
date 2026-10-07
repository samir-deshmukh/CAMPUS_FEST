package com.campusfest.backend.service;

import com.campusfest.backend.dto.EntryPassResponse;
import com.campusfest.backend.entity.User;
import com.campusfest.backend.pass.*;
import com.campusfest.backend.registration.*;
import com.campusfest.backend.repository.*;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;
import java.security.SecureRandom;
import java.time.Instant;

@Service public class EntryPassService{
 private final EntryPassRepository passes; private final RegistrationRepository registrations; private final UserRepository users; private final SecureRandom random=new SecureRandom();
 public EntryPassService(EntryPassRepository p,RegistrationRepository r,UserRepository u){passes=p;registrations=r;users=u;}
 @Transactional public EntryPassResponse issue(Long registrationId,String email){
  User u=users.findByEmailIgnoreCase(email).orElseThrow(()->new ResponseStatusException(HttpStatus.UNAUTHORIZED,"User not found"));
  Registration r=registrations.findById(registrationId).orElseThrow(()->new ResponseStatusException(HttpStatus.NOT_FOUND,"Registration not found"));
  if(!r.getUser().getId().equals(u.getId()))throw new ResponseStatusException(HttpStatus.FORBIDDEN,"Not your registration");
  if(r.getStatus()!=RegistrationStatus.ACTIVE)throw new ResponseStatusException(HttpStatus.CONFLICT,"Registration is cancelled");
  return EntryPassResponse.from(passes.findByRegistrationId(registrationId).orElseGet(()->create(r)));
 }
 private EntryPass create(Registration r){EntryPass p=new EntryPass();p.setRegistration(r);String token;do{token=randomToken();}while(passes.findByToken(token).isPresent());p.setToken(token);return passes.save(p);}
 private String randomToken(){byte[] b=new byte[32];random.nextBytes(b);StringBuilder s=new StringBuilder(64);for(byte x:b)s.append(String.format("%02x",x));return s.toString();}
 public EntryPassResponse getMine(Long registrationId,String email){User u=users.findByEmailIgnoreCase(email).orElseThrow(()->new ResponseStatusException(HttpStatus.UNAUTHORIZED,"User not found"));EntryPass p=passes.findByRegistrationId(registrationId).orElseThrow(()->new ResponseStatusException(HttpStatus.NOT_FOUND,"Entry pass not found"));if(!p.getRegistration().getUser().getId().equals(u.getId()))throw new ResponseStatusException(HttpStatus.FORBIDDEN,"Not your pass");return EntryPassResponse.from(p);}
 @Transactional public EntryPassResponse checkIn(String token){EntryPass p=passes.findByToken(token).orElseThrow(()->new ResponseStatusException(HttpStatus.NOT_FOUND,"Invalid entry pass"));if(p.getStatus()!=EntryPassStatus.ACTIVE)throw new ResponseStatusException(HttpStatus.CONFLICT,"Entry pass is already used or revoked");if(p.getRegistration().getStatus()!=RegistrationStatus.ACTIVE)throw new ResponseStatusException(HttpStatus.CONFLICT,"Registration is cancelled");p.setStatus(EntryPassStatus.USED);p.setCheckedInAt(Instant.now());return EntryPassResponse.from(passes.save(p));}
}
