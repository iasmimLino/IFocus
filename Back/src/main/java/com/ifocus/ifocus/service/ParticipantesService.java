package com.ifocus.ifocus.service;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import com.ifocus.ifocus.DTO.ParticipantesDTO;
import com.ifocus.ifocus.models.Participantes;
import com.ifocus.ifocus.repository.ParticipantesRepository;

@Service
public class ParticipantesService {
     @Autowired
  private ParticipantesRepository repositoryParticipantes;

 
  public List<Participantes> Listar() {
    List<Participantes> participantes = repositoryParticipantes.findAll();
    return participantes;
  }


  public ParticipantesDTO insert(ParticipantesDTO dto) {
    Participantes entidade = new Participantes();
    entidade.setId_User(dto.getId_User());
    entidade.setId_Evento(dto.getId_Evento());
    entidade = repositoryParticipantes.save(entidade);
    return new ParticipantesDTO(entidade);
  }


}