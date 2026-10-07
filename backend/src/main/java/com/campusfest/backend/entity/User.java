package com.campusfest.backend.entity;

import jakarta.persistence.*;
import java.time.Instant;

@Entity
@Table(name="users",uniqueConstraints=@UniqueConstraint(name="uk_user_email",columnNames="email"))
public class User {
 @Id @GeneratedValue(strategy=GenerationType.IDENTITY) private Long id;
 @Column(nullable=false,length=120) private String name;
 @Column(nullable=false,unique=true,length=180) private String email;
 @Column(nullable=false) private String passwordHash;
 @Enumerated(EnumType.STRING) @Column(nullable=false,length=20) private Role role=Role.STUDENT;
 @Column(nullable=false) private boolean active=true;
 @Column(nullable=false,updatable=false) private Instant createdAt;
 @Column(length=255) private String googleSubject;
 @Column(unique=true,length=255) private String supabaseSubject;
 @Column(length=160) private String college;
 @Column(length=80) private String course;
 @Column(length=30) private String year;
 @Column(length=30) private String phone;
 @PrePersist void onCreate(){createdAt=Instant.now();}
 public Long getId(){return id;} public String getName(){return name;} public void setName(String v){name=v;} public String getEmail(){return email;} public void setEmail(String v){email=v;} public String getPasswordHash(){return passwordHash;} public void setPasswordHash(String v){passwordHash=v;} public Role getRole(){return role;} public void setRole(Role v){role=v;} public boolean isActive(){return active;} public void setActive(boolean v){active=v;} public Instant getCreatedAt(){return createdAt;} public String getGoogleSubject(){return googleSubject;} public void setGoogleSubject(String v){googleSubject=v;} public String getSupabaseSubject(){return supabaseSubject;} public void setSupabaseSubject(String v){supabaseSubject=v;} public String getCollege(){return college;} public void setCollege(String v){college=v;} public String getCourse(){return course;} public void setCourse(String v){course=v;} public String getYear(){return year;} public void setYear(String v){year=v;} public String getPhone(){return phone;} public void setPhone(String v){phone=v;}
}
