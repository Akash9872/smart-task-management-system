package com.smarttask.auth;

import com.smarttask.auth.AuthDtos.*;
import com.smarttask.common.ConflictException;
import com.smarttask.common.NotFoundException;
import com.smarttask.user.AppUser;
import com.smarttask.user.Role;
import com.smarttask.user.UserRepository;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class AuthService {
    private final UserRepository users;
    private final PasswordEncoder encoder;
    private final AuthenticationManager authenticationManager;
    private final TokenService tokenService;

    public AuthService(UserRepository users, PasswordEncoder encoder, AuthenticationManager authenticationManager, TokenService tokenService) {
        this.users = users; this.encoder = encoder; this.authenticationManager = authenticationManager; this.tokenService = tokenService;
    }

    @Transactional
    public AuthResponse register(RegisterRequest request) {
        String email = request.email().trim().toLowerCase();
        if (users.existsByEmail(email)) throw new ConflictException("An account with this email already exists");
        AppUser user = users.save(new AppUser(request.name().trim(), email, encoder.encode(request.password()), Role.USER));
        return response(user);
    }

    public AuthResponse login(LoginRequest request) {
        String email = request.email().trim().toLowerCase();
        authenticationManager.authenticate(new UsernamePasswordAuthenticationToken(email, request.password()));
        AppUser user = users.findByEmail(email).orElseThrow(() -> new NotFoundException("User not found"));
        return response(user);
    }

    private AuthResponse response(AppUser user) {
        return new AuthResponse(tokenService.issue(user), new UserResponse(user.getId(), user.getName(), user.getEmail(), user.getRole()));
    }
}
