package com.ifocus.ifocus.DTO;

import com.ifocus.ifocus.models.SessaoDeEstudos;
import java.io.Serializable;
import java.util.Date;

public class SessaoDeEstudosDTO implements Serializable { 
    private static final long serialVersionUID = 1L;

    private Long id_sessao;
    private Date tempo;
    private Integer etapas;
    private Long idMateria; 

    public SessaoDeEstudosDTO() {}

    public SessaoDeEstudosDTO(SessaoDeEstudos entity) {
        this.id_sessao = entity.getId_sessao();
        this.tempo = (Date) entity.getTempo();
        this.etapas = entity.getEtapas();
        if (entity.getMateria() != null) {
            this.idMateria = entity.getMateria().getId_materia();
        }
    } 
    public Long getId_sessao() {
         return id_sessao; 
    }
    public void setId_sessao(Long id_sessao) { 
        this.id_sessao = id_sessao; 
    }
    public Date getTempo() {
         return tempo;
    }
    public void setTempo(Date tempo) {
        this.tempo = tempo;
    }

    public Integer getEtapas() {
         return etapas;
    }
    public void setEtapas(Integer etapas) {
        this.etapas = etapas;
    }

    public Long getIdMateria() {
        return idMateria;
    }
    public void setIdMateria(Long idMateria) {
        this.idMateria = idMateria; 
    }
}