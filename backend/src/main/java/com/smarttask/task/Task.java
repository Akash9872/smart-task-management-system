package com.smarttask.task;

import com.smarttask.user.AppUser;
import jakarta.persistence.*;
import java.time.Instant;
import java.time.LocalDate;

@Entity @Table(name="tasks", indexes={@Index(name="idx_tasks_owner_status", columnList="owner_id,status"), @Index(name="idx_tasks_deadline", columnList="deadline")})
public class Task {
    @Id @GeneratedValue(strategy=GenerationType.IDENTITY) private Long id;
    @Column(nullable=false, length=160) private String title;
    @Column(length=4000) private String description;
    @Enumerated(EnumType.STRING) @Column(nullable=false, length=20) private TaskStatus status = TaskStatus.TODO;
    @Enumerated(EnumType.STRING) @Column(nullable=false, length=20) private TaskPriority priority = TaskPriority.MEDIUM;
    private LocalDate deadline;
    @ManyToOne(fetch=FetchType.LAZY, optional=false) @JoinColumn(name="owner_id", nullable=false) private AppUser owner;
    @Column(nullable=false, updatable=false) private Instant createdAt = Instant.now();
    @Column(nullable=false) private Instant updatedAt = Instant.now();
    protected Task() {}
    public Task(String title, String description, TaskStatus status, TaskPriority priority, LocalDate deadline, AppUser owner) {
        this.title=title; this.description=description; this.status=status; this.priority=priority; this.deadline=deadline; this.owner=owner;
    }
    @PreUpdate void onUpdate() { updatedAt=Instant.now(); }
    public Long getId(){return id;} public String getTitle(){return title;} public String getDescription(){return description;}
    public TaskStatus getStatus(){return status;} public TaskPriority getPriority(){return priority;} public LocalDate getDeadline(){return deadline;}
    public AppUser getOwner(){return owner;} public Instant getCreatedAt(){return createdAt;} public Instant getUpdatedAt(){return updatedAt;}
    public void update(String title,String description,TaskStatus status,TaskPriority priority,LocalDate deadline){
        this.title=title; this.description=description; this.status=status; this.priority=priority; this.deadline=deadline;
    }
}
