package com.ifocus.ifocus.DTO;

import java.io.Serializable;

import com.ifocus.ifocus.models.Turma;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor

public class TurmaDTO implements Serializable{
      
    private static final long serialVersionUID=1L;

    private Long id_turma;
    private Integer ano;
    private Integer curso;

     public TurmaDTO (Turma entity){
        this.id_turma = entity.getId_turma();
        this.ano= entity.getAno();
        this.curso = entity.getCurso();
        } 
}