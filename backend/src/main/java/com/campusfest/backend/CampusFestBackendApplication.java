package com.campusfest.backend;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.security.crypto.password.PasswordEncoder;
import com.campusfest.backend.entity.Role;
import com.campusfest.backend.entity.User;
import com.campusfest.backend.repository.UserRepository;

@SpringBootApplication
public class CampusFestBackendApplication {
    @Bean
    CommandLineRunner adminBootstrap(UserRepository users, PasswordEncoder encoder) {
        return args -> {
            String username = System.getenv("ADMIN_USERNAME");
            String password = System.getenv("ADMIN_PASSWORD");
            if (username == null || username.isBlank() || password == null || password.length() < 8) return;
            if (users.existsByUsernameIgnoreCase(username)) return;
            User admin = new User(); admin.setName("CampusFest Administrator"); admin.setUsername(username.trim());
            admin.setEmail(username.trim().toLowerCase() + "@campusfest.local");
            admin.setPasswordHash(encoder.encode(password)); admin.setRole(Role.ADMIN); users.save(admin);
        };
    }

	public static void main(String[] args) {
		SpringApplication.run(CampusFestBackendApplication.class, args);
	}

}
