package com.ifocus.ifocus.controller;

import java.util.List;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.ifocus.ifocus.DTO.ParticipantesDTO;
import com.ifocus.ifocus.models.Participantes;
import com.ifocus.ifocus.service.ParticipantesService;

@RestController
@RequestMapping("/participantes")

public class ParticipantesController {
  @Autowired

private ParticipantesService participantesService;

@GetMapping("/listar") 
  public List<Participantes> Listar(){
    return participantesService.Listar(); 
  }

 @PostMapping ("/cadastrar")
    public ParticipantesDTO insert (@RequestBody ParticipantesDTO dto){
        return participantesService.insert(dto);
    }

}
