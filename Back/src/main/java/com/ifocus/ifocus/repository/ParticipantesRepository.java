package com.ifocus.ifocus.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.ifocus.ifocus.models.Participantes;

@Repository
public interface ParticipantesRepository extends JpaRepository<Participantes, Long>{

}
