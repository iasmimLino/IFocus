package com.ifocus.ifocus.DTO;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.io.Serializable;
import java.time.LocalDateTime;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import com.ifocus.ifocus.models.Cronograma;

@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
public class CronogramaDTO implements Serializable {
    private static final long serialVersionUID = 1L;

    private Long id_turma;

    private Long idCronograma;
        
    private Long id_user;

    @NotNull(message = "O título é obrigatório")
    private String titulo;

    @NotNull(message = "A carga horária é obrigatória")
    @Positive(message = "A carga horária deve ser maior que zero")
    private Long cargaHoraria;

    @NotNull(message = "A data/hora de início é obrigatória")
    private LocalDateTime dataInicio;

    @NotNull(message = "A data/hora de término é obrigatória")
    private LocalDateTime dataFim;

    public CronogramaDTO(Cronograma entity) {
        this.idCronograma = entity.getIdCronograma();
        this.titulo = entity.getTitulo();
        this.cargaHoraria = entity.getCargaHoraria();
        this.dataInicio = entity.getDataInicio();
        this.dataFim = entity.getDataFim();

        if (entity.getUsuario() != null) {
        this.id_user = entity.getUsuario().getId_user();
    }
         if (entity.getTurma() != null) {
        this.id_turma = entity.getTurma().getId_turma();
    }
    }
}