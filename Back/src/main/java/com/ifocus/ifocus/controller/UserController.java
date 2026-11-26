package com.ifocus.ifocus.controller;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import jakarta.validation.Valid;

import com.ifocus.ifocus.DTO.LoginDTO;
import com.ifocus.ifocus.DTO.UserDTO;
import com.ifocus.ifocus.models.User;
import com.ifocus.ifocus.service.UserService;

@RestController
@RequestMapping("/usuario")

public class UserController {

    @Autowired

    private UserService userService;

    @GetMapping("/listar") 
  public List<User>Listar(){
    return userService.Listar(); 
  }

     @PostMapping ("/cadastrar")
    public UserDTO insert (@RequestBody UserDTO dto){
        return userService.insert(dto);

   }

  @PostMapping("/buscar")
public UserDTO findById(@RequestBody Integer id) {
    return userService.findById(id);
}
@PostMapping("/login")
public UserDTO login(@Valid @RequestBody LoginDTO loginDTO) {
    return userService.loginByMatricula(
        loginDTO.getMatricula(),
        loginDTO.getSenha()
    );
}
}