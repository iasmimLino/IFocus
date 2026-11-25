package com.ifocus.ifocus.service;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.ifocus.ifocus.DTO.DisciplinaDTO;
import com.ifocus.ifocus.models.Disciplina;
import com.ifocus.ifocus.repository.DisciplinaRepository;
import com.ifocus.ifocus.repository.UserRepository;
import com.ifocus.ifocus.models.User;

@Service
public class DisciplinaService {
 @Autowired
  private DisciplinaRepository repositoryDisciplina;

  @Autowired
    private UserRepository repositoryUser; // Injeção necessária para buscar a entidade User

    public List<Disciplina> listar() {
        return repositoryDisciplina.findAll();
    }

    public DisciplinaDTO insert(DisciplinaDTO dto) {
        Disciplina entidade = new Disciplina();
        entidade.setNome(dto.getNome());

        // Busca os usuários pelo UserRepository e atribui à disciplina
        if (dto.getUsuarios() != null && !dto.getUsuarios().isEmpty()) {
            List<User> usuarios = repositoryUser.findAllById(dto.getUsuarios());
            entidade.setUsuarios(usuarios); // Vincula a lista à entidade
        }

        entidade = repositoryDisciplina.save(entidade);
        return new DisciplinaDTO(entidade);
    }


}