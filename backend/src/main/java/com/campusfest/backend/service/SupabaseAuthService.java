package com.campusfest.backend.service;

import com.campusfest.backend.entity.Role;
import com.campusfest.backend.entity.User;
import com.campusfest.backend.repository.UserRepository;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatusCode;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestClient;
import org.springframework.web.client.RestClientResponseException;
import org.springframework.security.crypto.password.PasswordEncoder;
import com.fasterxml.jackson.annotation.JsonProperty;

import java.util.Map;
import java.util.UUID;

@Service
public class SupabaseAuthService {
    private final UserRepository users;
    private final PasswordEncoder encoder;
    private final JwtService jwtService;
    private final RestClient restClient;
    private final String supabaseUrl;
    private final String publishableKey;

    public SupabaseAuthService(
            UserRepository users,
            PasswordEncoder encoder,
            JwtService jwtService,
            @Value("${supabase.url:}") String supabaseUrl,
            @Value("${supabase.publishable-key:}") String publishableKey) {
        this.users = users;
        this.encoder = encoder;
        this.jwtService = jwtService;
        this.supabaseUrl = supabaseUrl == null ? "" : supabaseUrl.replaceAll("/+$", "");
        this.publishableKey = publishableKey;
        this.restClient = RestClient.builder().build();
    }

    public SupabaseResult authenticate(String accessToken) {
        if (supabaseUrl.isBlank() || publishableKey == null || publishableKey.isBlank()) {
            throw new IllegalStateException("Supabase authentication is not configured");
        }

        SupabaseUser remote;
        try {
            remote = restClient.get()
                    .uri(supabaseUrl + "/auth/v1/user")
                    .header("apikey", publishableKey)
                    .header(HttpHeaders.AUTHORIZATION, "Bearer " + accessToken)
                    .retrieve()
                    .body(SupabaseUser.class);
        } catch (RestClientResponseException e) {
            throw new IllegalArgumentException("Invalid Supabase session");
        }

        if (remote == null || remote.id() == null || remote.email() == null || remote.email().isBlank()) {
            throw new IllegalArgumentException("Supabase account has no verified email");
        }

        User user = users.findBySupabaseSubject(remote.id()).orElseGet(
                () -> users.findByEmailIgnoreCase(remote.email()).orElse(null));

        if (user == null) {
            user = new User();
            user.setName(displayName(remote));
            user.setEmail(remote.email());
            user.setRole(Role.STUDENT);
            user.setPasswordHash(encoder.encode(UUID.randomUUID().toString()));
        }

        if (user.getRole() != Role.STUDENT && user.getRole() != Role.ADMIN) {
            throw new IllegalArgumentException("Account role is not allowed");
        }

        user.setSupabaseSubject(remote.id());
        user.setName(displayName(remote));
        user = users.save(user);

        return new SupabaseResult(user, jwtService.createToken(user));
    }

    private String displayName(SupabaseUser user) {
        if (user.userMetadata() != null) {
            Object name = user.userMetadata().get("full_name");
            if (name == null) name = user.userMetadata().get("name");
            if (name != null && !name.toString().isBlank()) return name.toString();
        }
        return user.email().split("@", 2)[0];
    }

    public record SupabaseResult(User user, String token) {}
    public record SupabaseUser(String id, String email, @JsonProperty("user_metadata") Map<String, Object> userMetadata) {}
}
