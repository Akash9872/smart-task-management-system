package com.smarttask.user;

import jakarta.persistence.*;
import java.time.Instant;

@Entity
@Table(name = "users", uniqueConstraints = @UniqueConstraint(name = "uk_users_email", columnNames = "email"))
public class AppUser {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    @Column(nullable = false, length = 120)
    private String name;
    @Column(nullable = false, length = 190)
    private String email;
    @Column(nullable = false, length = 100)
    private String passwordHash;
    @Enumerated(EnumType.STRING) @Column(nullable = false, length = 20)
    private Role role = Role.USER;
    @Column(nullable = false, updatable = false)
    private Instant createdAt = Instant.now();

    protected AppUser() {}
    public AppUser(String name, String email, String passwordHash, Role role) {
        this.name = name; this.email = email; this.passwordHash = passwordHash; this.role = role;
    }
    public Long getId() { return id; }
    public String getName() { return name; }
    public String getEmail() { return email; }
    public String getPasswordHash() { return passwordHash; }
    public Role getRole() { return role; }
    public Instant getCreatedAt() { return createdAt; }
}
