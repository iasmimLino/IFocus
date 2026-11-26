package com.ifocus.ifocus.models;

import java.io.Serializable;
import java.util.List;

import com.fasterxml.jackson.annotation.JsonProperty;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToMany;
import jakarta.persistence.ManyToOne;
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
@Table(name = "usuario")


public class User implements Serializable{ // serializa a classe oara import regras de negocios web
  private static final long serialVersionUID = 1L; // versão da classe para controle de serialização
  @Id //identificador para o banco de dados
  @GeneratedValue (strategy = GenerationType.IDENTITY) // gera o ID automaticametne
  @Column(name = "id_user")
  private long id_user;

  @Column(nullable = false)
  private String nome;

  @Column(unique = true)
  private Integer matricula;

  @Column(nullable = false)
  @JsonProperty(access = JsonProperty.Access.WRITE_ONLY)
  private String senha;

  @Column(unique = true, length = 254)
  private String email;

  @Column(unique = true, length = 11)
  private String cpf;

  private String pais;

  private String cidade;

  @ManyToOne
  @JoinColumn(name = "id_turma")
    private Turma turma;


  @ManyToMany(mappedBy="usuarios") 
  private List<Disciplina> disciplina;


}
