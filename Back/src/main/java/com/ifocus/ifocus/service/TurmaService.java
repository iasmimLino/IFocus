package com.ifocus.ifocus.service;

import java.util.List;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import com.ifocus.ifocus.DTO.TurmaDTO;
import com.ifocus.ifocus.models.Turma;
import com.ifocus.ifocus.repository.TurmaRepository;

@Service
public class TurmaService {
@Autowired
  private TurmaRepository repositoryTurma;

 
  public List<Turma> Listar() {
    List<Turma> turmas = repositoryTurma.findAll();
    return turmas;
  }


  public TurmaDTO insert(TurmaDTO dto) {
    Turma entidade = new Turma();
    entidade.setAno(dto.getAno());
    entidade.setCurso(dto.getCurso());
    entidade = repositoryTurma.save(entidade);
    return new TurmaDTO(entidade);
  }


}