package com.ifocus.ifocus.controller;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import com.jayway.jsonpath.JsonPath;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.webmvc.test.autoconfigure.AutoConfigureMockMvc;
import org.springframework.http.MediaType;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.test.web.servlet.MockMvc;

import com.ifocus.ifocus.models.UserAdmin;
import com.ifocus.ifocus.repository.UserAdminRepository;

@SpringBootTest
@AutoConfigureMockMvc
class UserAdminAuthIntegrationTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private UserAdminRepository repository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @BeforeEach
    void prepareAdmin() {
        repository.deleteAll();
        UserAdmin admin = new UserAdmin();
        admin.setNome("Admin de teste");
        admin.setLogin("admin-teste");
        admin.setSenha(passwordEncoder.encode("senha123"));
        admin.setStatus(true);
        repository.saveAndFlush(admin);
    }

    @Test
    void loginIssuesTokenAndProtectsAdminRoutes() throws Exception {
        String response = mockMvc.perform(post("/api/user_admin/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"login\":\"admin-teste\",\"senha\":\"senha123\"}"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.token").isNotEmpty())
                .andExpect(jsonPath("$.user.senha").doesNotExist())
                .andReturn()
                .getResponse()
                .getContentAsString();
        String token = JsonPath.parse(response).read("$.token", String.class);

        mockMvc.perform(get("/api/user_admin/listar")
                        .header("Authorization", "Bearer " + token))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].senha").doesNotExist());

        mockMvc.perform(get("/api/user_admin/listar"))
                .andExpect(status().isUnauthorized());
    }

    @Test
    void loginRejectsIncorrectPassword() throws Exception {
        mockMvc.perform(post("/api/user_admin/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"login\":\"admin-teste\",\"senha\":\"incorreta\"}"))
                .andExpect(status().isUnauthorized());
    }
}
