package com.ifocus.ifocus.models;

import java.io.Serializable;
import java.time.LocalDate;
import java.util.List;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
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

@Table(name = "atividade")







public class Atividade implements Serializable{

  private static final long serialVersionUID = 1L;

  @Id

  @GeneratedValue (strategy = GenerationType.IDENTITY)

  private long id_atividade;



  @Column(nullable = false)

  private LocalDate prazo;

 



   @Column(nullable = false)

  private String disciplina;

  private String titulo;

  private Long materiaId;

  private Long duracaoMinutos;

 

 

  @Column(nullable = false)

  private Boolean prioridade;

 

  //trocar para Enum aqui ou String no banco de dados

  @Column(nullable = false)

  private String tipo_de_atividade;



  //trocar para Enum aqui ou String no banco de dados

  @Enumerated(EnumType.STRING)

  private Atividade_Status status = Atividade_Status.A_FAZER;



  @ManyToMany

  @JoinTable(

    name = "atividade_usuario",

    joinColumns = @JoinColumn(name = "id_atividade"),

    inverseJoinColumns = @JoinColumn(name = "id_user")

  )

  private List<User> usuarios;

 

} 

