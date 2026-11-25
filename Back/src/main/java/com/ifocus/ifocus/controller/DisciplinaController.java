package com.ifocus.ifocus.controller;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import com.ifocus.ifocus.DTO.DisciplinaDTO;
import com.ifocus.ifocus.models.Disciplina;
import com.ifocus.ifocus.service.DisciplinaService;

@RestController
@RequestMapping("/disciplina")

public class DisciplinaController {

    @Autowired

    private DisciplinaService disciplinaService;

    @GetMapping("/listar") 
  public List<Disciplina>Listar(){
    return disciplinaService.listar(); 
  }

     @PostMapping ("/cadastrar")
    public DisciplinaDTO insert (@RequestBody DisciplinaDTO dto){
        return disciplinaService.insert(dto);
    }
}
