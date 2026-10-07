package com.campusfest.backend.competition;

import com.campusfest.backend.entity.User;
import com.campusfest.backend.event.Event;
import jakarta.persistence.*;
import java.time.Instant;

@Entity @Table(name="competitions", indexes={@Index(name="idx_competition_event",columnList="event_id"),@Index(name="idx_competition_status",columnList="status")})
public class Competition {
 @Id @GeneratedValue(strategy=GenerationType.IDENTITY) private Long id;
 @ManyToOne(fetch=FetchType.LAZY,optional=false) @JoinColumn(name="event_id",nullable=false) private Event event;
 @Column(nullable=false,length=160) private String title;
 @Column(nullable=false,length=4000) private String description;
 @Enumerated(EnumType.STRING) @Column(nullable=false,length=20) private CompetitionStatus status=CompetitionStatus.DRAFT;
 @ManyToOne(fetch=FetchType.LAZY,optional=false) @JoinColumn(name="created_by",nullable=false) private User createdBy;
 @Column(nullable=false,updatable=false) private Instant createdAt;
 @PrePersist void onCreate(){createdAt=Instant.now();}
 public Long getId(){return id;} public Event getEvent(){return event;} public void setEvent(Event v){event=v;}
 public String getTitle(){return title;} public void setTitle(String v){title=v;} public String getDescription(){return description;} public void setDescription(String v){description=v;}
 public CompetitionStatus getStatus(){return status;} public void setStatus(CompetitionStatus v){status=v;} public User getCreatedBy(){return createdBy;}
 public void setCreatedBy(User v){createdBy=v;} public Instant getCreatedAt(){return createdAt;}
}
