package com.campusfest.backend.repository;

import com.campusfest.backend.event.Event;
import com.campusfest.backend.event.EventStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface EventRepository extends JpaRepository<Event, Long> {
    List<Event> findByStatusOrderByStartTimeAsc(EventStatus status);
    List<Event> findAllByOrderByStartTimeAsc();
}
