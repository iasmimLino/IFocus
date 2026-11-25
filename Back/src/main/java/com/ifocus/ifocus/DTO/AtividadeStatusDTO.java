package com.ifocus.ifocus.DTO;

import com.ifocus.ifocus.models.Atividade_Status;

public record AtividadeStatusDTO(
    Atividade_Status status, 
    Long quantidade
) {}