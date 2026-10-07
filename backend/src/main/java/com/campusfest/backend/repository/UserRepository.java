package com.campusfest.backend.repository;

import com.campusfest.backend.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.Optional;

public interface UserRepository extends JpaRepository<User, Long> {
    long countByRole(com.campusfest.backend.entity.Role role);
    Optional<User> findByGoogleSubject(String googleSubject);
    Optional<User> findBySupabaseSubject(String supabaseSubject);
    Optional<User> findByEmailIgnoreCase(String email);
    boolean existsByEmailIgnoreCase(String email);
}
