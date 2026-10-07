package com.campusfest.backend.registration;

import com.campusfest.backend.entity.User;
import com.campusfest.backend.event.Event;
import jakarta.persistence.*;
import java.time.Instant;

@Entity
@Table(name="registrations", uniqueConstraints=@UniqueConstraint(name="uk_registration_event_user", columnNames={"event_id","user_id"}), indexes=@Index(name="idx_registration_user", columnList="user_id"))
public class Registration {
 @Id @GeneratedValue(strategy=GenerationType.IDENTITY) private Long id;
 @ManyToOne(fetch=FetchType.LAZY,optional=false) @JoinColumn(name="event_id",nullable=false) private Event event;
 @ManyToOne(fetch=FetchType.LAZY,optional=false) @JoinColumn(name="user_id",nullable=false) private User user;
 @Enumerated(EnumType.STRING) @Column(nullable=false,length=20) private RegistrationStatus status=RegistrationStatus.ACTIVE;
 @Column(nullable=false,updatable=false) private Instant registeredAt;
 @PrePersist void onCreate(){registeredAt=Instant.now();}
 public Long getId(){return id;} public Event getEvent(){return event;} public void setEvent(Event v){event=v;} public User getUser(){return user;} public void setUser(User v){user=v;} public RegistrationStatus getStatus(){return status;} public void setStatus(RegistrationStatus v){status=v;} public Instant getRegisteredAt(){return registeredAt;}
}
