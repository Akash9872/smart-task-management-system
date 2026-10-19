package com.smarttask.task;

import jakarta.validation.constraints.*;
import java.time.Instant;
import java.time.LocalDate;

public final class TaskDtos {
    private TaskDtos() {}
    public record TaskRequest(@NotBlank @Size(max=160) String title, @Size(max=4000) String description,
                              TaskStatus status, TaskPriority priority, @FutureOrPresent LocalDate deadline) {}
    public record TaskResponse(Long id, String title, String description, TaskStatus status, TaskPriority priority,
                               LocalDate deadline, Long ownerId, String ownerName, Instant createdAt, Instant updatedAt) {
        static TaskResponse from(Task task) { return new TaskResponse(task.getId(), task.getTitle(), task.getDescription(), task.getStatus(), task.getPriority(), task.getDeadline(), task.getOwner().getId(), task.getOwner().getName(), task.getCreatedAt(), task.getUpdatedAt()); }
    }
}
