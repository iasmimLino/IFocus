package com.ifocus.ifocus.repository;

import com.ifocus.ifocus.models.Cronograma;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface CronogramaRepository extends JpaRepository<Cronograma, Long> {
    //Cronograma Pessoal
    @Query("SELECT c FROM Cronograma c WHERE c.usuario.id_user = :idUser")
    List<Cronograma> findByUsuario_Id_user(@Param("idUser") Long idUser);
    //Cronograma da Turma
    @Query("SELECT c FROM Cronograma c WHERE c.turma.id_turma = :idTurma")
    List<Cronograma> findByTurma_Id_turma(@Param("idTurma") Long idTurma);

    @Query("SELECT COUNT(c) > 0 FROM Cronograma c WHERE c.usuario.id_user = :idUser " +
           "AND c.dataInicio < :dataFim AND c.dataFim > :dataInicio")
    boolean existsByUsuario_Id_userAndDataInicioBeforeAndDataFimAfter(
            @Param("idUser") Long idUser, 
            @Param("dataFim") LocalDateTime dataFim, 
            @Param("dataInicio") LocalDateTime dataInicio
    );
} 