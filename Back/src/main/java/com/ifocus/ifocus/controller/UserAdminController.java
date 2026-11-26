package com.ifocus.ifocus.controller;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.validation.annotation.Validated;
import jakarta.validation.Valid;
import com.ifocus.ifocus.DTO.AdminLoginRequest;
import com.ifocus.ifocus.DTO.AdminLoginResponseDTO;
import com.ifocus.ifocus.DTO.UserAdminDTO;
import com.ifocus.ifocus.service.UserAdminService;

@RestController
@Validated
@RequestMapping({"/user_admin", "/api/user_admin"})

public class UserAdminController {

    @Autowired

    private UserAdminService useradminService;

  @GetMapping("/listar")
  public List<UserAdminDTO> listar() {
      return useradminService.Listar();
  }

  @PostMapping("/login")
  public AdminLoginResponseDTO login(@Valid @RequestBody AdminLoginRequest request) {
      return useradminService.login(request);
  }

  @PostMapping("/cadastrar")
  public UserAdminDTO insert(@Valid @RequestBody UserAdminDTO dto) {
        return useradminService.insert(dto);
    }
}