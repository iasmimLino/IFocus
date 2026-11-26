package com.ifocus.ifocus.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpStatus;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.HttpStatusEntryPoint;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;

import com.ifocus.ifocus.service.AdminTokenService;

@Configuration
@EnableWebSecurity
public class SecurityConfig {

    @Bean
    public SecurityFilterChain securityFilterChain(
            HttpSecurity http,
            AdminTokenService adminTokenService) throws Exception {
        http
            .csrf(csrf -> csrf.disable()) // Desabilita CSRF para APIs REST
            .sessionManagement(session -> session.sessionCreationPolicy(SessionCreationPolicy.STATELESS)) // Não guarda sessão no servidor (ideal para JWT/Moodle)
            .authorizeHttpRequests(authorize -> authorize
                .requestMatchers("/h2-console/**").permitAll() // Libera console H2 se usar
                .requestMatchers("/user_admin/login", "/api/user_admin/login").permitAll()
                .requestMatchers("/user_admin/**", "/api/user_admin/**").hasRole("ADMIN")
                .requestMatchers(
                    "/api/auth/register",
                    "/api/auth/login",
                    "/usuario/cadastrar",
                    "/usuario/login",
                    "/users/cadastrar",
                    "/users/login").permitAll()
                .anyRequest().permitAll() // As demais áreas mantêm a autorização atual.
            )
            .exceptionHandling(exceptionHandling -> exceptionHandling
                .authenticationEntryPoint(new HttpStatusEntryPoint(HttpStatus.UNAUTHORIZED)))
            .headers(headers -> headers.frameOptions(frame -> frame.disable())) // Necessário para exibir o H2 Console se utilizar
            .addFilterBefore(
                    new AdminJwtAuthenticationFilter(adminTokenService),
                    UsernamePasswordAuthenticationFilter.class);

        return http.build();
    }

    // Encoder seguro para criptografar as senhas no banco (NF011)
    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }
}
