package com.ifocus.ifocus.repository;


import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import com.ifocus.ifocus.models.UserAdmin;

@Repository
public interface UserAdminRepository extends JpaRepository<UserAdmin, Long>{

}
