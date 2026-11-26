package com.ifocus.ifocus.service;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import java.util.Optional;

import org.junit.jupiter.api.Test;
import org.springframework.http.HttpStatus;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.web.server.ResponseStatusException;

import com.ifocus.ifocus.DTO.AdminLoginRequest;
import com.ifocus.ifocus.models.UserAdmin;
import com.ifocus.ifocus.repository.UserAdminRepository;

class UserAdminServiceTest {

    private static final String SECRET = "01234567890123456789012345678901";

    @Test
    void logsInActiveAdminAndReturnsSignedToken() {
        UserAdminRepository repository = mock(UserAdminRepository.class);
        BCryptPasswordEncoder passwordEncoder = new BCryptPasswordEncoder();
        AdminTokenService tokenService = new AdminTokenService(SECRET);
        UserAdmin admin = admin(passwordEncoder.encode("senha123"));
        when(repository.findByLoginIgnoreCase("admin")).thenReturn(Optional.of(admin));
        UserAdminService service = new UserAdminService(repository, passwordEncoder, tokenService);

        var response = service.login(request("admin", "senha123"));

        assertEquals("Bearer", response.getTokenType());
        assertEquals("ADMIN", tokenService.parse(response.getToken()).get("role", String.class));
        assertEquals("17", tokenService.parse(response.getToken()).getSubject());
    }

    @Test
    void rejectsIncorrectPassword() {
        UserAdminRepository repository = mock(UserAdminRepository.class);
        BCryptPasswordEncoder passwordEncoder = new BCryptPasswordEncoder();
        UserAdmin admin = admin(passwordEncoder.encode("senha123"));
        when(repository.findByLoginIgnoreCase("admin")).thenReturn(Optional.of(admin));
        UserAdminService service = new UserAdminService(
                repository,
                passwordEncoder,
                new AdminTokenService(SECRET));

        ResponseStatusException exception = assertThrows(
                ResponseStatusException.class,
                () -> service.login(request("admin", "senha-incorreta")));

        assertEquals(HttpStatus.UNAUTHORIZED, exception.getStatusCode());
    }

    @Test
    void upgradesLegacyPlaintextPasswordAfterSuccessfulLogin() {
        UserAdminRepository repository = mock(UserAdminRepository.class);
        BCryptPasswordEncoder passwordEncoder = new BCryptPasswordEncoder();
        UserAdmin admin = admin("senha-antiga");
        when(repository.findByLoginIgnoreCase("admin")).thenReturn(Optional.of(admin));
        when(repository.save(admin)).thenReturn(admin);
        UserAdminService service = new UserAdminService(
                repository,
                passwordEncoder,
                new AdminTokenService(SECRET));

        service.login(request("admin", "senha-antiga"));

        assertTrue(admin.getSenha().startsWith("$2"));
        assertTrue(passwordEncoder.matches("senha-antiga", admin.getSenha()));
        verify(repository).save(admin);
    }

    private UserAdmin admin(String senha) {
        UserAdmin admin = new UserAdmin();
        admin.setId_disciplina(17L);
        admin.setNome("Admin");
        admin.setLogin("admin");
        admin.setSenha(senha);
        admin.setStatus(true);
        return admin;
    }

    private AdminLoginRequest request(String login, String senha) {
        AdminLoginRequest request = new AdminLoginRequest();
        request.setLogin(login);
        request.setSenha(senha);
        return request;
    }
}
