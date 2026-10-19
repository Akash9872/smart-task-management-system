package com.smarttask.auth;

import com.smarttask.user.AppUser;
import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.List;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.oauth2.jose.jws.MacAlgorithm;
import org.springframework.security.oauth2.jwt.JwtClaimsSet;
import org.springframework.security.oauth2.jwt.JwtEncoder;
import org.springframework.security.oauth2.jwt.JwtEncoderParameters;
import org.springframework.stereotype.Service;

@Service
public class TokenService {
    private final JwtEncoder encoder;
    private final long expirationMinutes;
    public TokenService(JwtEncoder encoder, @Value("${app.jwt.expiration-minutes:60}") long expirationMinutes) {
        this.encoder = encoder; this.expirationMinutes = expirationMinutes;
    }
    public String issue(AppUser user) {
        Instant now = Instant.now();
        JwtClaimsSet claims = JwtClaimsSet.builder().issuer("smart-task-api").issuedAt(now)
                .expiresAt(now.plus(expirationMinutes, ChronoUnit.MINUTES)).subject(user.getEmail())
                .claim("uid", user.getId()).claim("roles", List.of("ROLE_" + user.getRole().name())).build();
        return encoder.encode(JwtEncoderParameters.from(
                org.springframework.security.oauth2.jwt.JwsHeader.with(MacAlgorithm.HS256).build(), claims)).getTokenValue();
    }
}
