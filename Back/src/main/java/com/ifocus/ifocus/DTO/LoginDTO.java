package com.ifocus.ifocus.DTO;

import jakarta.validation.constraints.NotBlank;

public class LoginDTO {

    private Integer matricula;
    private String emailOuCpf;

    @NotBlank
    private String senha;

    public Integer getMatricula() {
        return matricula;
    }

    public void setMatricula(Integer matricula) {
        this.matricula = matricula;
    }

    public String getEmailOuCpf() {
        return emailOuCpf;
    }

    public void setEmailOuCpf(String emailOuCpf) {
        this.emailOuCpf = emailOuCpf;
    }

    public String getSenha() {
        return senha;
    }

    public void setSenha(String senha) {
        this.senha = senha;
    }
}