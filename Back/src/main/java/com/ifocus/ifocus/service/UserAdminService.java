package com.ifocus.ifocus.service;

import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.util.List;
import java.util.Optional;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.context.event.ApplicationReadyEvent;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.server.ResponseStatusException;
import org.springframework.context.event.EventListener;

import com.ifocus.ifocus.DTO.AdminLoginRequest;
import com.ifocus.ifocus.DTO.AdminLoginResponseDTO;
import com.ifocus.ifocus.DTO.UserAdminDTO;
import com.ifocus.ifocus.models.UserAdmin;
import com.ifocus.ifocus.repository.UserAdminRepository;

@Service
public class UserAdminService {
  private static final Logger logger = LoggerFactory.getLogger(UserAdminService.class);

  private final UserAdminRepository repositoryUserAdmin;
  private final PasswordEncoder passwordEncoder;
  private final AdminTokenService tokenService;

  @Value("${IFOCUS_ADMIN_LOGIN:}")
  private String bootstrapLogin;

  @Value("${IFOCUS_ADMIN_PASSWORD:}")
  private String bootstrapPassword;

  public UserAdminService(
      UserAdminRepository repositoryUserAdmin,
      PasswordEncoder passwordEncoder,
      AdminTokenService tokenService) {
    this.repositoryUserAdmin = repositoryUserAdmin;
    this.passwordEncoder = passwordEncoder;
    this.tokenService = tokenService;
  }

  @EventListener(ApplicationReadyEvent.class)
  public void createInitialAdminIfConfigured() {
    if (repositoryUserAdmin.count() > 0) {
      return;
    }
    if (bootstrapLogin.isBlank() && bootstrapPassword.isBlank()) {
      logger.warn("No Admin account exists. Set IFOCUS_ADMIN_LOGIN and IFOCUS_ADMIN_PASSWORD to create the initial account.");
      return;
    }
    if (bootstrapLogin.isBlank() || bootstrapPassword.isBlank()) {
      throw new IllegalStateException("Set both IFOCUS_ADMIN_LOGIN and IFOCUS_ADMIN_PASSWORD to create the initial Admin account.");
    }

    UserAdmin admin = new UserAdmin();
    admin.setNome(bootstrapLogin.trim());
    admin.setLogin(bootstrapLogin.trim());
    admin.setSenha(passwordEncoder.encode(bootstrapPassword));
    admin.setStatus(true);
    repositoryUserAdmin.save(admin);
    logger.info("Initial Admin account created from environment configuration.");
  }

  public List<UserAdminDTO> Listar() {
    return repositoryUserAdmin.findAll().stream().map(UserAdminDTO::new).toList();
  }


  public UserAdminDTO insert(UserAdminDTO dto) {
    UserAdmin entidade = new UserAdmin();
    entidade.setNome(dto.getNome());
    entidade.setLogin(dto.getLogin());
    entidade.setSenha(passwordEncoder.encode(dto.getSenha()));
    entidade.setStatus(dto.getStatus());
    entidade = repositoryUserAdmin.save(entidade);
    return new UserAdminDTO(entidade);
  }

  public AdminLoginResponseDTO login(AdminLoginRequest request) {
    Optional<UserAdmin> adminOptional = repositoryUserAdmin.findByLoginIgnoreCase(request.getLogin().trim());
    if (adminOptional.isEmpty()) {
      throw credenciaisInvalidas();
    }

    UserAdmin admin = adminOptional.get();
    if (!Boolean.TRUE.equals(admin.getStatus()) || !senhaValida(admin.getSenha(), request.getSenha())) {
      throw credenciaisInvalidas();
    }

    if (!senhaEstaCriptografada(admin.getSenha())) {
      admin.setSenha(passwordEncoder.encode(request.getSenha()));
      admin = repositoryUserAdmin.save(admin);
    }

    return new AdminLoginResponseDTO(tokenService.issue(admin), "Bearer", new UserAdminDTO(admin));
  }

  private boolean senhaValida(String senhaArmazenada, String senhaInformada) {
    if (senhaArmazenada == null) {
      return false;
    }
    if (senhaEstaCriptografada(senhaArmazenada)) {
      return passwordEncoder.matches(senhaInformada, senhaArmazenada);
    }
    return MessageDigest.isEqual(
            senhaInformada.getBytes(StandardCharsets.UTF_8),
            senhaArmazenada.getBytes(StandardCharsets.UTF_8));
  }

  private boolean senhaEstaCriptografada(String senha) {
    return senha != null && (senha.startsWith("$2a$") || senha.startsWith("$2b$") || senha.startsWith("$2y$"));
  }

  private ResponseStatusException credenciaisInvalidas() {
    return new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Login ou senha incorretos.");
  }

}