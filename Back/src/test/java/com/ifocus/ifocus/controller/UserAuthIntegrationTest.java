package com.ifocus.ifocus.controller;

import static org.junit.jupiter.api.Assertions.assertNotEquals;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import com.ifocus.ifocus.models.User;
import com.ifocus.ifocus.repository.UserRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.webmvc.test.autoconfigure.AutoConfigureMockMvc;
import org.springframework.http.MediaType;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.test.web.servlet.MockMvc;

@SpringBootTest
@AutoConfigureMockMvc
class UserAuthIntegrationTest {

    private static final String EMAIL = "persistencia-teste@ifocus.invalid";
    private static final String PASSWORD = "FocusTest2026";

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @BeforeEach
    void clearUsers() {
        userRepository.deleteAll();
    }

    @Test
    void registrationStoresBCryptPasswordAndLoginValidatesIt() throws Exception {
        mockMvc.perform(post("/api/auth/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {"nomeCompleto":"Conta de teste","email":"persistencia-teste@ifocus.invalid","senha":"FocusTest2026"}
                                """))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.token").isNotEmpty())
                .andExpect(jsonPath("$.user.email").value(EMAIL))
                .andExpect(jsonPath("$.user.senha").doesNotExist());

        User saved = userRepository.findByEmailIgnoreCase(EMAIL).orElseThrow();
        assertNotEquals(PASSWORD, saved.getSenha());
        assertTrue(passwordEncoder.matches(PASSWORD, saved.getSenha()));

        mockMvc.perform(post("/api/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {"emailOuCpf":"persistencia-teste@ifocus.invalid","senha":"FocusTest2026"}
                                """))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.token").isNotEmpty())
                .andExpect(jsonPath("$.user.senha").doesNotExist());

        mockMvc.perform(post("/api/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {"emailOuCpf":"persistencia-teste@ifocus.invalid","senha":"WrongPass2026"}
                                """))
                .andExpect(status().isUnauthorized());
    }

    @Test
    void registrationRejectsDuplicateEmailRegardlessOfCase() throws Exception {
        String body = """
                {"nomeCompleto":"Conta de teste","email":"persistencia-teste@ifocus.invalid","senha":"FocusTest2026"}
                """;
        mockMvc.perform(post("/api/auth/register").contentType(MediaType.APPLICATION_JSON).content(body))
                .andExpect(status().isCreated());

        mockMvc.perform(post("/api/auth/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {"nomeCompleto":"Outra conta","email":"PERSISTENCIA-TESTE@ifocus.invalid","senha":"FocusTest2026"}
                                """))
                .andExpect(status().isConflict());
    }
}
