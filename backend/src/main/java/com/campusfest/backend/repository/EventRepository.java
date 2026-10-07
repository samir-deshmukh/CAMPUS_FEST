package com.campusfest.backend.repository;

import com.campusfest.backend.event.Event;
import com.campusfest.backend.event.EventStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Lock;
import jakarta.persistence.LockModeType;
import java.util.List;
import java.util.Optional;

public interface EventRepository extends JpaRepository<Event, Long> {
    List<Event> findByStatusOrderByStartTimeAsc(EventStatus status);
    List<Event> findAllByOrderByStartTimeAsc();

    @Lock(LockModeType.PESSIMISTIC_WRITE)
    Optional<Event> findByIdForUpdate(Long id);
}
