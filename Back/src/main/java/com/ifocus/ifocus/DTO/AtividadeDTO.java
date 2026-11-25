package com.ifocus.ifocus.DTO;

import java.io.Serializable;
import java.time.LocalDate;
import com.ifocus.ifocus.models.Atividade;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor

public class AtividadeDTO implements Serializable{
    private static final long serialVersionUID = 1L;
@Id
@GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id_atividade;
    private LocalDate prazo;
    private Boolean prioridade;
    private String tipo_de_atividade;
    private String status;
    private String titulo;
    private String disciplina;
    private Long materiaId;
    private Long duracaoMinutos;
    
    public AtividadeDTO (Atividade entity){
        this.id_atividade = entity.getId_atividade();
        this.prazo = entity.getPrazo();
        this.prioridade = entity.getPrioridade();
        this.tipo_de_atividade = entity.getTipo_de_atividade();
        this.titulo = entity.getTitulo();
        this.disciplina = entity.getDisciplina();
        this.materiaId = entity.getMateriaId();
        this.duracaoMinutos = entity.getDuracaoMinutos();
        // convertendo para nome
        this.status = (entity.getStatus() != null) ? entity.getStatus().name() : null;
        } 
    }
