package com.campusfest.backend.event;

import com.campusfest.backend.entity.User;
import jakarta.persistence.*;
import java.time.Instant;

@Entity
@Table(name = "events", indexes = {
        @Index(name = "idx_events_start_time", columnList = "start_time"),
        @Index(name = "idx_events_status", columnList = "status")
})
public class Event {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    @Column(nullable = false, length = 160) private String title;
    @Column(nullable = false, length = 4000) private String description;
    @Column(nullable = false, length = 80) private String category;
    @Column(nullable = false, length = 160) private String venue;
    @Column(nullable = false) private Instant startTime;
    @Column(nullable = false) private Instant endTime;
    @Column(nullable = false) private Integer capacity;
    @Enumerated(EnumType.STRING) @Column(nullable = false, length = 20) private EventStatus status = EventStatus.DRAFT;
    @ManyToOne(fetch = FetchType.LAZY, optional = false) @JoinColumn(name = "created_by", nullable = false) private User createdBy;
    @Column(nullable = false, updatable = false) private Instant createdAt;
    @Column(nullable = false) private Instant updatedAt;

    @PrePersist void onCreate() { Instant now = Instant.now(); createdAt = now; updatedAt = now; }
    @PreUpdate void onUpdate() { updatedAt = Instant.now(); }
    public Long getId(){return id;} public String getTitle(){return title;} public void setTitle(String v){title=v;}
    public String getDescription(){return description;} public void setDescription(String v){description=v;}
    public String getCategory(){return category;} public void setCategory(String v){category=v;}
    public String getVenue(){return venue;} public void setVenue(String v){venue=v;}
    public Instant getStartTime(){return startTime;} public void setStartTime(Instant v){startTime=v;}
    public Instant getEndTime(){return endTime;} public void setEndTime(Instant v){endTime=v;}
    public Integer getCapacity(){return capacity;} public void setCapacity(Integer v){capacity=v;}
    public EventStatus getStatus(){return status;} public void setStatus(EventStatus v){status=v;}
    public User getCreatedBy(){return createdBy;} public void setCreatedBy(User v){createdBy=v;}
    public Instant getCreatedAt(){return createdAt;} public Instant getUpdatedAt(){return updatedAt;}
}
