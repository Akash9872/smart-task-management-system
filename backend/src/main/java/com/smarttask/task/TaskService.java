package com.smarttask.task;

import com.smarttask.auth.CustomUserDetailsService;
import com.smarttask.common.NotFoundException;
import com.smarttask.user.*;
import java.util.Set;
import org.springframework.data.domain.*;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import static com.smarttask.task.TaskDtos.*;

@Service
public class TaskService {
    private static final Set<String> SORT_FIELDS = Set.of("title", "status", "priority", "deadline", "createdAt", "updatedAt");
    private final TaskRepository tasks; private final UserRepository users;
    public TaskService(TaskRepository tasks, UserRepository users) { this.tasks=tasks; this.users=users; }

    @Transactional(readOnly=true)
    public Page<TaskResponse> list(String email, boolean admin, TaskStatus status, TaskPriority priority, String q, int page, int size, String sort, String direction) {
        String safeSort = SORT_FIELDS.contains(sort) ? sort : "createdAt";
        Sort.Direction safeDirection = "asc".equalsIgnoreCase(direction) ? Sort.Direction.ASC : Sort.Direction.DESC;
        Pageable pageable = PageRequest.of(page, size, Sort.by(safeDirection, safeSort));
        Page<Task> found;
        if (admin) found=tasks.searchAll(status, priority, normalize(q), pageable);
        else {
            AppUser user=users.findByEmail(email).orElseThrow(() -> new NotFoundException("User not found"));
            found=tasks.searchMine(user.getId(), status, priority, normalize(q), pageable);
        }
        return found.map(TaskResponse::from);
    }

    @Transactional
    public TaskResponse create(String email, TaskRequest request) {
        AppUser user=users.findByEmail(email).orElseThrow(() -> new NotFoundException("User not found"));
        Task task=new Task(request.title().trim(), request.description(), value(request.status(), TaskStatus.TODO), value(request.priority(), TaskPriority.MEDIUM), request.deadline(), user);
        return TaskResponse.from(tasks.save(task));
    }

    @Transactional
    public TaskResponse update(String email, Long id, TaskRequest request) {
        Task task=ownedTask(email, id);
        task.update(request.title().trim(), request.description(), value(request.status(), task.getStatus()), value(request.priority(), task.getPriority()), request.deadline());
        return TaskResponse.from(task);
    }

    @Transactional
    public void delete(String email, Long id) { tasks.delete(ownedTask(email,id)); }

    @Transactional(readOnly=true)
    public TaskResponse get(String email, Long id) { return TaskResponse.from(ownedTask(email,id)); }

    private Task ownedTask(String email, Long id) {
        AppUser user=users.findByEmail(email).orElseThrow(() -> new NotFoundException("User not found"));
        return tasks.findByIdAndOwnerId(id,user.getId()).orElseThrow(() -> new NotFoundException("Task not found"));
    }
    private static String normalize(String q) { return q == null || q.isBlank() ? null : q.trim(); }
    private static <T> T value(T value, T fallback) { return value == null ? fallback : value; }
}
