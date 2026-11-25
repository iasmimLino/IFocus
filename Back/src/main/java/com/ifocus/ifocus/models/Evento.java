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

import java.util.Date;

@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
@Entity
@Table(name = "evento")
public class Evento implements Serializable{ // serializa a classe oara import regras de negocios web
  private static final long serialVersionUID = 1L; // versão da classe para controle de serialização
  @Id //identificador para o banco de dados
  @GeneratedValue (strategy = GenerationType.IDENTITY) // gera o ID automaticametne
  private long id_evento;
 
  @Column(nullable = false)
  private Date data;

  @Column(nullable = false)
  private Boolean prioridade;

  @Column(nullable = false)
  private String nome;

  private String categoria;

  @Column(length = 2000)
  private String descricao;

  private Long materiaId;

  private Boolean notificar;

  private String inicio;

  private String fim;

  @ManyToOne
  @JoinColumn(name = "id_turma")
  private Turma turma; // Se for um evento geral da turma

  @ManyToOne
  @JoinColumn(name = "id_user")
  private User usuario; // Se for um evento pessoal criado pelo aluno
}