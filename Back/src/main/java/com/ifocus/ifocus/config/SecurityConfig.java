package com.ifocus.ifocus.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;

@Configuration
@EnableWebSecurity
public class SecurityConfig {

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        http
            .csrf(csrf -> csrf.disable()) // Desabilita CSRF para APIs REST
            .sessionManagement(session -> session.sessionCreationPolicy(SessionCreationPolicy.STATELESS)) // Não guarda sessão no servidor (ideal para JWT/Moodle)
            .authorizeHttpRequests(authorize -> authorize
                .requestMatchers("/h2-console/**").permitAll() // Libera console H2 se usar
                .requestMatchers("/users/cadastrar", "/users/login").permitAll() // Endpoints públicos
                .anyRequest().permitAll() // Altere para .authenticated() quando terminar de integrar o login/Moodle
            )
            .headers(headers -> headers.frameOptions(frame -> frame.disable())); // Necessário para exibir o H2 Console se utilizar

        return http.build();
    }

    // Encoder seguro para criptografar as senhas no banco (NF011)
    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }
}
