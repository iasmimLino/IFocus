package com.ifocus.ifocus.DTO;

import java.io.Serializable;

import com.fasterxml.jackson.annotation.JsonProperty;
import com.ifocus.ifocus.models.UserAdmin;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
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
    @NotBlank
    private String nome;
    @NotBlank
    private String login;
    @NotBlank
    @JsonProperty(access = JsonProperty.Access.WRITE_ONLY)
    private String senha;
    @NotNull
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


