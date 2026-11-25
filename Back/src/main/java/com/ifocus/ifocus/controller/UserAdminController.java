package com.ifocus.ifocus.controller;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import com.ifocus.ifocus.DTO.UserAdminDTO;
import com.ifocus.ifocus.models.UserAdmin;
import com.ifocus.ifocus.service.UserAdminService;

@RestController
@RequestMapping("/user_admin")

public class UserAdminController {

    @Autowired

    private UserAdminService useradminService;

    @GetMapping("/listar") 
  public List<UserAdmin>Listar(){
    return useradminService.Listar(); 
  }

     @PostMapping ("/cadastrar")
    public UserAdminDTO insert (@RequestBody UserAdminDTO dto){
        return useradminService.insert(dto);
    }

}