package com.campusfest.backend.repository;

import com.campusfest.backend.registration.Registration;
import com.campusfest.backend.registration.RegistrationStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface RegistrationRepository extends JpaRepository<Registration,Long>{
 boolean existsByEventIdAndUserIdAndStatus(Long eventId,Long userId,RegistrationStatus status);
 long countByEventIdAndStatus(Long eventId,RegistrationStatus status);
 List<Registration> findByUserIdOrderByRegisteredAtDesc(Long userId);
 long countByStatus(RegistrationStatus status);
}
