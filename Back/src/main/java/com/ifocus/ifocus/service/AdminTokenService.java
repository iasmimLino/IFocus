package com.ifocus.ifocus.service;

import java.nio.charset.StandardCharsets;
import java.time.Duration;
import java.time.Instant;
import java.util.Date;

import javax.crypto.SecretKey;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import com.ifocus.ifocus.models.User;
import com.ifocus.ifocus.models.UserAdmin;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.SignatureAlgorithm;
import io.jsonwebtoken.security.Keys;

@Service
public class AdminTokenService {

    private static final Logger logger = LoggerFactory.getLogger(AdminTokenService.class);
    private static final Duration TOKEN_LIFETIME = Duration.ofHours(8);

    private final SecretKey signingKey;

    public AdminTokenService(@Value("${IFOCUS_JWT_SECRET:}") String configuredSecret) {
        if (configuredSecret == null || configuredSecret.isBlank()) {
            signingKey = Keys.secretKeyFor(SignatureAlgorithm.HS256);
            logger.warn("IFOCUS_JWT_SECRET is unset; admin tokens will be invalidated when the backend restarts.");
        } else {
            byte[] secretBytes = configuredSecret.getBytes(StandardCharsets.UTF_8);
            if (secretBytes.length < 32) {
                throw new IllegalArgumentException("IFOCUS_JWT_SECRET must contain at least 32 bytes.");
            }
            signingKey = Keys.hmacShaKeyFor(secretBytes);
        }
    }

    public String issue(UserAdmin admin) {
        Instant issuedAt = Instant.now();
        return Jwts.builder()
                .setSubject(Long.toString(admin.getId_disciplina()))
                .claim("login", admin.getLogin())
                .claim("role", "ADMIN")
                .setIssuedAt(Date.from(issuedAt))
                .setExpiration(Date.from(issuedAt.plus(TOKEN_LIFETIME)))
                .signWith(signingKey, SignatureAlgorithm.HS256)
                .compact();
    }

    public String issueStudent(User user) {
        Instant issuedAt = Instant.now();
        return Jwts.builder()
                .setSubject(Long.toString(user.getId_user()))
                .claim("email", user.getEmail())
                .claim("role", "STUDENT")
                .setIssuedAt(Date.from(issuedAt))
                .setExpiration(Date.from(issuedAt.plus(TOKEN_LIFETIME)))
                .signWith(signingKey, SignatureAlgorithm.HS256)
                .compact();
    }

    public Claims parse(String token) {
        return Jwts.parserBuilder()
                .setSigningKey(signingKey)
                .build()
                .parseClaimsJws(token)
                .getBody();
    }
}
