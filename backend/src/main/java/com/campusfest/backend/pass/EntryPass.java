package com.campusfest.backend.pass;

import com.campusfest.backend.registration.Registration;
import jakarta.persistence.*;
import java.time.Instant;

@Entity
@Table(name="entry_passes", uniqueConstraints=@UniqueConstraint(name="uk_entry_pass_registration",columnNames="registration_id"), indexes=@Index(name="idx_entry_pass_token",columnList="token",unique=true))
public class EntryPass {
 @Id @GeneratedValue(strategy=GenerationType.IDENTITY) private Long id;
 @OneToOne(fetch=FetchType.LAZY,optional=false) @JoinColumn(name="registration_id",nullable=false,unique=true) private Registration registration;
 @Column(nullable=false,unique=true,length=64,updatable=false) private String token;
 @Enumerated(EnumType.STRING) @Column(nullable=false,length=20) private EntryPassStatus status=EntryPassStatus.ACTIVE;
 @Column(nullable=false,updatable=false) private Instant issuedAt;
 private Instant checkedInAt;
 @PrePersist void onCreate(){issuedAt=Instant.now();}
 public Long getId(){return id;} public Registration getRegistration(){return registration;} public void setRegistration(Registration v){registration=v;} public String getToken(){return token;} public void setToken(String v){token=v;} public EntryPassStatus getStatus(){return status;} public void setStatus(EntryPassStatus v){status=v;} public Instant getIssuedAt(){return issuedAt;} public Instant getCheckedInAt(){return checkedInAt;} public void setCheckedInAt(Instant v){checkedInAt=v;}
}
