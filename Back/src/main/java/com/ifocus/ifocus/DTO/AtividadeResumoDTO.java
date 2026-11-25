package com.ifocus.ifocus.DTO;

import java.util.Map;
import com.ifocus.ifocus.models.Atividade_Status;

public record AtividadeResumoDTO(
    long quantidadeGeral,
    Map<Atividade_Status, Long> quantidadePorFase
) {}