package com.ifocus.ifocus.DTO;


import com.fasterxml.jackson.annotation.JsonProperty;
import com.ifocus.ifocus.models.User;

public class UserDTO {

    private long id_user;

    private String nome;

    private int matricula;

    @JsonProperty(access = JsonProperty.Access.WRITE_ONLY)
    private String senha;

    public UserDTO(User entity) {
        this.id_user = entity.getId_user();
        this.nome = entity.getNome();
        this.matricula = entity.getMatricula();
        this.senha = entity.getSenha();
    }

    public long getId_user() {
        return id_user;
    }

    public String getNome() {
        return nome;
    }

    public int getMatricula() {
        return matricula;
    }

    public String getSenha() {
        return senha;
    }
}