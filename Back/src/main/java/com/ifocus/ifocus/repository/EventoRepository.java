package com.ifocus.ifocus.repository;

import com.ifocus.ifocus.models.Evento;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface EventoRepository extends JpaRepository<Evento, Long> {

    @Query("SELECT e FROM Evento e WHERE e.usuario.id_user = :idUser OR e.turma.id_turma = (SELECT u.turma.id_turma FROM User u WHERE u.id_user = :idUser)")
    List<Evento> findEventosSincronizadosDoUsuario(@Param("idUser") Long idUser);
}
