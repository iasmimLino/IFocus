package com.ifocus.ifocus.service;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;

import org.junit.jupiter.api.Test;

import com.ifocus.ifocus.models.UserAdmin;

import io.jsonwebtoken.JwtException;

class AdminTokenServiceTest {

    private static final String SECRET = "01234567890123456789012345678901";

    @Test
    void issuesTokenWithAdminRoleAndSubject() {
        AdminTokenService service = new AdminTokenService(SECRET);
        UserAdmin admin = new UserAdmin();
        admin.setId_disciplina(42L);
        admin.setLogin("admin");

        var claims = service.parse(service.issue(admin));

        assertEquals("42", claims.getSubject());
        assertEquals("ADMIN", claims.get("role", String.class));
        assertEquals("admin", claims.get("login", String.class));
    }

    @Test
    void rejectsTokenSignedWithAnotherKey() {
        AdminTokenService issuer = new AdminTokenService(SECRET);
        AdminTokenService verifier = new AdminTokenService("abcdefghijklmnopqrstuvwxyz123456");
        UserAdmin admin = new UserAdmin();
        admin.setId_disciplina(42L);
        admin.setLogin("admin");

        String token = issuer.issue(admin);

        assertThrows(JwtException.class, () -> verifier.parse(token));
    }
}
