package com.ifocus.ifocus.DTO;

import java.io.Serializable;
import com.ifocus.ifocus.models.Participantes;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor

public class ParticipantesDTO implements Serializable{
      
    private static final long serialVersionUID=1L;

     private Long Id_Participantes;
     private Integer Id_User;
     private Integer Id_Evento;

   

     public ParticipantesDTO (Participantes entity){
        this.Id_Participantes = entity.getId_participantes();
        this.Id_User= entity.getId_User();
        this.Id_Evento = entity.getId_evento();
        } 

    }