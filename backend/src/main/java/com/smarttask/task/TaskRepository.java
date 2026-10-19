package com.smarttask.task;

import java.util.Optional;
import org.springframework.data.domain.*;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface TaskRepository extends JpaRepository<Task, Long> {
    @Query("select t from Task t where t.owner.id = :ownerId and (:status is null or t.status = :status) and (:priority is null or t.priority = :priority) and (:query is null or lower(t.title) like lower(concat('%', :query, '%')) or lower(coalesce(t.description, '')) like lower(concat('%', :query, '%')))")
    Page<Task> searchMine(@Param("ownerId") Long ownerId, @Param("status") TaskStatus status, @Param("priority") TaskPriority priority, @Param("query") String query, Pageable pageable);
    @Query("select t from Task t where (:status is null or t.status = :status) and (:priority is null or t.priority = :priority) and (:query is null or lower(t.title) like lower(concat('%', :query, '%')) or lower(coalesce(t.description, '')) like lower(concat('%', :query, '%')))")
    Page<Task> searchAll(@Param("status") TaskStatus status, @Param("priority") TaskPriority priority, @Param("query") String query, Pageable pageable);
    Optional<Task> findByIdAndOwnerId(Long id, Long ownerId);
}
