package com.campusfest.backend.repository;

import com.campusfest.backend.event.Event;
import com.campusfest.backend.event.EventStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Lock;
import org.springframework.data.jpa.repository.Query;
import jakarta.persistence.LockModeType;
import java.util.List;
import java.util.Optional;

public interface EventRepository extends JpaRepository<Event, Long> {
    List<Event> findByStatusOrderByStartTimeAsc(EventStatus status);
    List<Event> findAllByOrderByStartTimeAsc();
    long countByStatus(EventStatus status);

    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("select e from Event e where e.id = :id")
    Optional<Event> findByIdForUpdate(@org.springframework.data.repository.query.Param("id") Long id);
}
