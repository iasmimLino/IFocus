package com.ifocus.ifocus.controller;

import com.ifocus.ifocus.DTO.LoginDTO;
import com.ifocus.ifocus.DTO.UserAuthResponseDTO;
import com.ifocus.ifocus.DTO.UserRegistrationRequestDTO;
import com.ifocus.ifocus.service.UserService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    private final UserService userService;

    public AuthController(UserService userService) {
        this.userService = userService;
    }

    @PostMapping("/register")
    public ResponseEntity<UserAuthResponseDTO> register(@Valid @RequestBody UserRegistrationRequestDTO request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(userService.register(request));
    }

    @PostMapping("/login")
    public UserAuthResponseDTO login(@Valid @RequestBody LoginDTO request) {
        return userService.login(request.getEmailOuCpf(), request.getSenha());
    }
}
