package com.ifocus.ifocus.repository;

import java.time.LocalDate;
import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import com.ifocus.ifocus.DTO.AtividadeStatusDTO;
import com.ifocus.ifocus.models.Atividade;

@Repository
public interface AtividadeRepository extends JpaRepository<Atividade, Long> {

    // "DTO" em maiúsculo para corresponder ao seu pacote com.ifocus.ifocus.DTO
    @Query("SELECT new com.ifocus.ifocus.DTO.AtividadeStatusDTO(a.status, COUNT(a)) " +
           "FROM Atividade a GROUP BY a.status")
    List<AtividadeStatusDTO> contarAtividadesGroupByStatus();

    List<Atividade> findByPrazo(LocalDate data);

    // Buscar atividades entre duas datas (útil para o alerta de tarefas pendentes)
    List<Atividade> findByPrazoBetween(LocalDate inicio, LocalDate fim);
}