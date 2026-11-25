package com.ifocus.ifocus.models;

import java.io.Serializable;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
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
@Table(name = "turma")
public class Turma implements Serializable{ // serializa a classe oara import regras de negocios web
  private static final long serialVersionUID = 1L; // versão da classe para controle de serialização

  @Id //identificador para o banco de dados
  @GeneratedValue (strategy = GenerationType.IDENTITY) // gera o ID automaticametne
  private long id_turma;
 
  //trocar para Enum ou trocar para Integer no banco de dados
  @Column(nullable = false)
  private Integer ano;

  @Column(nullable = false)
  private Integer curso;

  @ManyToOne
  @JoinColumn(name = "id_lider")
  private User lider;

  @ManyToOne
  @JoinColumn(name = "id_vice")
  private User vice;

}
