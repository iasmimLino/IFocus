package com.ifocus.ifocus.controller;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import com.ifocus.ifocus.DTO.TurmaDTO;
import com.ifocus.ifocus.models.Turma;
import com.ifocus.ifocus.service.TurmaService;

@RestController
@RequestMapping("/turma")

public class TurmaController {
     @Autowired

    TurmaService turmaService;

    @GetMapping("/listar") 
  public List<Turma>Listar(){
    return turmaService.Listar(); 
  }

     @PostMapping ("/cadastrar")
    public TurmaDTO insert (@RequestBody TurmaDTO dto){
        return turmaService.insert(dto);
    }
}
