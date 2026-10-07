package com.campusfest.backend.controller;

import com.campusfest.backend.dto.AuthResponse;
import com.campusfest.backend.dto.LoginRequest;
import com.campusfest.backend.entity.Role;
import com.campusfest.backend.entity.User;
import com.campusfest.backend.repository.UserRepository;
import com.campusfest.backend.service.JwtService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

@RestController
@RequestMapping("/api/auth")
public class AuthController {
    private final UserRepository users;
    private final AuthenticationManager authenticationManager;
    private final JwtService jwtService;
    public AuthController(UserRepository users, AuthenticationManager authenticationManager, JwtService jwtService) {
        this.users=users; this.authenticationManager=authenticationManager; this.jwtService=jwtService;
    }

    @PostMapping("/login")
    public AuthResponse login(@Valid @RequestBody LoginRequest request) {
        try {
            Authentication auth=authenticationManager.authenticate(new UsernamePasswordAuthenticationToken(request.email().toLowerCase().trim(),request.password()));
            User user=users.findByEmailIgnoreCase(auth.getName()).orElseThrow(()->new BadCredentialsException("Invalid credentials"));
            if(user.getRole()!=Role.ADMIN) throw new BadCredentialsException("Admin login required");
            return new AuthResponse(jwtService.createToken(user),user.getId(),user.getName(),user.getEmail(),user.getRole().name());
        } catch(Exception e) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED,"Invalid admin credentials");
        }
    }
}
