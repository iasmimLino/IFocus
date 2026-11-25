package com.ifocus.ifocus.models;

import java.io.Serializable;

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
@Table(name = "participantes")
public class Participantes implements Serializable{ // serializa a classe oara import regras de negocios web
  private static final long serialVersionUID = 1L; // versão da classe para controle de serialização
  @Id //identificador para o banco de dados
  @GeneratedValue (strategy = GenerationType.IDENTITY) // gera o ID automaticametne
  private long id_participantes;
@ManyToMany
  @JoinTable(
    name = "evento_participantes", 
    joinColumns = @JoinColumn(name = "id_participantes"), 
    inverseJoinColumns = @JoinColumn(name = "id_evento")
  )
  private java.util.List<Evento> evento;
public Integer getId_User() {
  throw new UnsupportedOperationException("Unimplemented method 'getId_User'");
}
public Integer getId_evento() {
  throw new UnsupportedOperationException("Unimplemented method 'getId_evento'");
}
public void setId_User(Integer id_User) {
  throw new UnsupportedOperationException("Unimplemented method 'setId_User'");
}
public void setId_Evento(Integer id_Evento) {
  throw new UnsupportedOperationException("Unimplemented method 'setId_Evento'");
}
}