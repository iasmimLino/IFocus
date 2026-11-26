package com.ifocus.ifocus.DTO;

import com.fasterxml.jackson.annotation.JsonProperty;
import com.ifocus.ifocus.models.User;

public class UserDTO {

    private long id_user;
    private String nome;
    private String nomeCompleto;
    private Integer matricula;
    private String email;

    @JsonProperty(access = JsonProperty.Access.WRITE_ONLY)
    private String senha;

    public UserDTO() {
    }

    public UserDTO(User entity) {
        this.id_user = entity.getId_user();
        this.nome = entity.getNome();
        this.nomeCompleto = entity.getNome();
        this.matricula = entity.getMatricula();
        this.email = entity.getEmail();
    }

    public long getId_user() {
        return id_user;
    }

    public String getNome() {
        return nome;
    }

    public String getNomeCompleto() {
        return nomeCompleto;
    }

    public Integer getMatricula() {
        return matricula;
    }

    public String getEmail() {
        return email;
    }

    public String getSenha() {
        return senha;
    }

    public void setId_user(long id_user) {
        this.id_user = id_user;
    }

    public void setNome(String nome) {
        this.nome = nome;
    }

    public void setNomeCompleto(String nomeCompleto) {
        this.nomeCompleto = nomeCompleto;
        this.nome = nomeCompleto;
    }

    public void setMatricula(Integer matricula) {
        this.matricula = matricula;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public void setSenha(String senha) {
        this.senha = senha;
    }
}