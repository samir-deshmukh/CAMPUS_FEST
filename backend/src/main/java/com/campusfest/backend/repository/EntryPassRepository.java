package com.campusfest.backend.repository;

import com.campusfest.backend.pass.EntryPass;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.Optional;

public interface EntryPassRepository extends JpaRepository<EntryPass,Long>{
 Optional<EntryPass> findByRegistrationId(Long registrationId);
 Optional<EntryPass> findByToken(String token);
}
