package com.smarttask.auth;

import com.smarttask.user.UserRepository;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.*;
import org.springframework.stereotype.Service;

@Service
public class CustomUserDetailsService implements UserDetailsService {
    private final UserRepository users;
    public CustomUserDetailsService(UserRepository users) { this.users = users; }
    @Override public UserDetails loadUserByUsername(String email) throws UsernameNotFoundException {
        var user = users.findByEmail(email).orElseThrow(() -> new UsernameNotFoundException("User not found"));
        return User.withUsername(user.getEmail()).password(user.getPasswordHash())
                .authorities(new SimpleGrantedAuthority("ROLE_" + user.getRole().name())).build();
    }
}
