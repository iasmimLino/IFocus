package com.ifocus.ifocus.repository;

import java.util.List;
import java.util.Map;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import com.ifocus.ifocus.models.SessaoDeEstudos;

@Repository
public interface SessaoDeEstudosRepository extends JpaRepository<SessaoDeEstudos, Long>{
    // Total de etapas concluídas agrupadas por data (Progresso diário)
    @Query(value = "SELECT CAST(tempo AS DATE) AS data, SUM(etapas) AS totalEtapas FROM sessao_de_estudos GROUP BY CAST(tempo AS DATE) ORDER BY CAST(tempo AS DATE) ASC", nativeQuery = true)
    List<Map<String, Object>> buscarProgressoDiario();

    // Resumo geral (Total de sessões e soma total de etapas)
    @Query(value = "SELECT COUNT(id_sessao) AS totalSessoes, SUM(etapas) AS totalEtapas FROM sessao_de_estudos", nativeQuery = true)
    Map<String, Object> buscarResumoGeral();

    @Query(value = "SELECT m.nome AS materia, SUM(s.etapas) AS totalEtapas FROM sessao_de_estudos s JOIN materia m ON s.id_materia = m.id_materia GROUP BY m.nome", nativeQuery = true)
    List<Map<String, Object>> buscarTempoPorMateria();
}