package com.ifocus.ifocus.DTO;

import java.io.Serializable;
import java.util.List;
import com.ifocus.ifocus.models.Disciplina;
import com.ifocus.ifocus.models.User;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor

public class DisciplinaDTO implements Serializable{
    private static final long serialVersionUID = 1L;
@Id
@GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id_disciplina;
    private String nome;
    private List<Long> usuarios;
    
    public DisciplinaDTO (Disciplina entity){
        this.id_disciplina = entity.getId_disciplina();
        this.nome = entity.getNome();
        this.usuarios = entity.getUsuarios()
        .stream()
        .map(User :: getId_user )
        .toList();
        } 
    }
