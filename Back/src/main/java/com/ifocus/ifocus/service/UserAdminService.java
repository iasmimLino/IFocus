package com.ifocus.ifocus.service;

import java.util.List;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import com.ifocus.ifocus.DTO.UserAdminDTO;
import com.ifocus.ifocus.models.UserAdmin;
import com.ifocus.ifocus.repository.UserAdminRepository;

@Service
public class UserAdminService {
 @Autowired
  private UserAdminRepository repositoryUserAdmin;

 
  public List<UserAdmin> Listar() {
    List<UserAdmin> useraAdmins = repositoryUserAdmin.findAll();
    return useraAdmins;
  }


  public UserAdminDTO insert(UserAdminDTO dto) {
    UserAdmin entidade = new UserAdmin();
    entidade.setNome(dto.getNome());
    entidade.setLogin(dto.getLogin());
    entidade.setSenha(dto.getSenha());
    entidade.setStatus(dto.getStatus());
    entidade = repositoryUserAdmin.save(entidade);
    return new UserAdminDTO(entidade);
  }


}