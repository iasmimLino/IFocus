package com.ifocus.ifocus.DTO;

import java.io.Serializable;

import com.ifocus.ifocus.models.UserAdmin;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor

public class UserAdminDTO implements Serializable{
    private static final long serialVersionUID = 1L;
@Id
@GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id_disciplina;
    private String nome;
    private String login;
    private String senha;
    private Boolean status;
    

    public UserAdminDTO (UserAdmin entity){
        this.id_disciplina = entity.getId_disciplina();
        this.nome = entity.getNome();
        this.login = entity.getLogin();
        this.senha = entity.getSenha();
        this.status = entity.getStatus();
        }


    public static UserAdminDTO insert(UserAdminDTO dto) {

      throw new UnsupportedOperationException("Unimplemented method 'insert'");
    } 
    }


