package com.smarttask.task;

import com.smarttask.task.TaskDtos.*;
import com.smarttask.common.PageResponse;
import jakarta.validation.Valid;
import org.springframework.data.domain.Page;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

@RestController @RequestMapping("/api/tasks")
public class TaskController {
    private final TaskService service;
    public TaskController(TaskService service){this.service=service;}
    @GetMapping public PageResponse<TaskResponse> list(Authentication auth, @RequestParam(required=false) TaskStatus status,
            @RequestParam(required=false) TaskPriority priority, @RequestParam(required=false) String q,
            @RequestParam(defaultValue="0") int page, @RequestParam(defaultValue="20") int size,
            @RequestParam(defaultValue="createdAt") String sort, @RequestParam(defaultValue="desc") String direction) {
        if(page<0 || size<1 || size>100) throw new IllegalArgumentException("Page must be non-negative and size must be between 1 and 100");
        boolean admin=auth.getAuthorities().stream().anyMatch(a->a.getAuthority().equals("ROLE_ADMIN"));
        return PageResponse.from(service.list(auth.getName(),admin,status,priority,q,page,size,sort,direction), value -> value);
    }
    @GetMapping("/{id}") public TaskResponse get(Authentication auth,@PathVariable Long id){return service.get(auth.getName(),id);}
    @PostMapping @ResponseStatus(HttpStatus.CREATED) public TaskResponse create(Authentication auth,@Valid @RequestBody TaskRequest request){return service.create(auth.getName(),request);}
    @PutMapping("/{id}") public TaskResponse update(Authentication auth,@PathVariable Long id,@Valid @RequestBody TaskRequest request){return service.update(auth.getName(),id,request);}
    @DeleteMapping("/{id}") @ResponseStatus(HttpStatus.NO_CONTENT) public void delete(Authentication auth,@PathVariable Long id){service.delete(auth.getName(),id);}
}
