package com.ifocus.ifocus.repository;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.ifocus.ifocus.models.User;


@Repository
public interface UserRepository extends JpaRepository<User, Long>{
       Optional<User> findByMatricula(int matricula);
}
