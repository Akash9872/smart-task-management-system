package com.smarttask.common;

import java.time.Instant;
import java.util.Map;
import java.util.stream.Collectors;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.http.*;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.web.HttpMediaTypeNotSupportedException;
import org.springframework.http.converter.HttpMessageNotReadableException;
import org.springframework.web.method.annotation.MethodArgumentTypeMismatchException;
import org.springframework.web.bind.MissingServletRequestParameterException;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.*;

@RestControllerAdvice
public class ApiExceptionHandler {
    public record ApiError(Instant timestamp, int status, String error, String message, Map<String, String> fields) {}
    @ExceptionHandler(NotFoundException.class) ResponseEntity<ApiError> notFound(NotFoundException ex) { return error(HttpStatus.NOT_FOUND, ex.getMessage(), Map.of()); }
    @ExceptionHandler(ConflictException.class) ResponseEntity<ApiError> conflict(ConflictException ex) { return error(HttpStatus.CONFLICT, ex.getMessage(), Map.of()); }
    @ExceptionHandler(BadCredentialsException.class) ResponseEntity<ApiError> badCredentials() { return error(HttpStatus.UNAUTHORIZED, "Email or password is incorrect", Map.of()); }
    @ExceptionHandler(MethodArgumentNotValidException.class) ResponseEntity<ApiError> invalid(MethodArgumentNotValidException ex) {
        Map<String, String> fields = ex.getBindingResult().getFieldErrors().stream().collect(Collectors.toMap(
                e -> e.getField(), e -> e.getDefaultMessage() == null ? "Invalid value" : e.getDefaultMessage(), (a,b) -> a));
        return error(HttpStatus.BAD_REQUEST, "Request validation failed", fields);
    }
    @ExceptionHandler({HttpMessageNotReadableException.class, MethodArgumentTypeMismatchException.class, MissingServletRequestParameterException.class})
    ResponseEntity<ApiError> malformedRequest(Exception ex) { return error(HttpStatus.BAD_REQUEST, "The request contains an invalid or missing value", Map.of()); }
    @ExceptionHandler(HttpMediaTypeNotSupportedException.class)
    ResponseEntity<ApiError> unsupportedMediaType() { return error(HttpStatus.UNSUPPORTED_MEDIA_TYPE, "Content-Type must be application/json", Map.of()); }
    @ExceptionHandler(DataIntegrityViolationException.class) ResponseEntity<ApiError> integrity() { return error(HttpStatus.CONFLICT, "The request conflicts with existing data", Map.of()); }
    @ExceptionHandler(IllegalArgumentException.class) ResponseEntity<ApiError> illegalArgument(IllegalArgumentException ex) { return error(HttpStatus.BAD_REQUEST, ex.getMessage(), Map.of()); }
    @ExceptionHandler(Exception.class) ResponseEntity<ApiError> unexpected(Exception ex) { return error(HttpStatus.INTERNAL_SERVER_ERROR, "An unexpected error occurred", Map.of()); }
    private ResponseEntity<ApiError> error(HttpStatus status, String message, Map<String,String> fields) {
        return ResponseEntity.status(status).body(new ApiError(Instant.now(), status.value(), status.getReasonPhrase(), message, fields));
    }
}
