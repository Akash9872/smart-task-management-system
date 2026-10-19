package com.smarttask.admin;

import com.smarttask.task.*;
import com.smarttask.common.PageResponse;
import org.springframework.data.domain.Page;
import org.springframework.web.bind.annotation.*;

@RestController @RequestMapping("/api/admin")
public class AdminController {
    private final TaskService tasks;
    public AdminController(TaskService tasks){this.tasks=tasks;}
    @GetMapping("/tasks") public PageResponse<TaskDtos.TaskResponse> allTasks(@RequestParam(required=false) TaskStatus status,
        @RequestParam(required=false) TaskPriority priority,@RequestParam(required=false) String q,
        @RequestParam(defaultValue="0") int page,@RequestParam(defaultValue="20") int size,
        @RequestParam(defaultValue="createdAt") String sort,@RequestParam(defaultValue="desc") String direction){
        if(page<0 || size<1 || size>100) throw new IllegalArgumentException("Page must be non-negative and size must be between 1 and 100");
        return PageResponse.from(tasks.list("",true,status,priority,q,page,size,sort,direction), value -> value);
    }
}
