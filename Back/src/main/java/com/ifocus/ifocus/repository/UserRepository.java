package com.ifocus.ifocus.repository;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.ifocus.ifocus.models.User;


@Repository
public interface UserRepository extends JpaRepository<User, Long>{
       Optional<User> findByMatricula(Integer matricula);
       Optional<User> findByEmailIgnoreCase(String email);
       Optional<User> findByCpf(String cpf);
}
