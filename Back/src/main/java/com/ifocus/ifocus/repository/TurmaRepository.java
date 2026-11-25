package com.ifocus.ifocus.repository;


import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import com.ifocus.ifocus.models.Turma;

@Repository
public interface TurmaRepository extends JpaRepository<Turma, Long>{

}
