package com.ifocus.ifocus.models;

import java.io.Serializable;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.JoinTable;
import jakarta.persistence.ManyToMany;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
@Entity
@Table(name = "disciplina")
public class Disciplina implements Serializable { // serializa a classe oara import regras de negocios web

    @Id //identificador para o banco de dados
    @GeneratedValue(strategy = GenerationType.IDENTITY) // gera o ID automaticametne
    private long id_disciplina;

    //trocar para Enum ou trocar para Integer no banco de dados
    @Column(nullable = false)
    private String nome;

    @ManyToMany
    @JoinTable(
        name = "usuario_disciplina",
        joinColumns = @JoinColumn(name = "id_disciplina"),
        inverseJoinColumns = @JoinColumn(name = "id_user")
    )
    private java.util.List<User> usuarios;

}
