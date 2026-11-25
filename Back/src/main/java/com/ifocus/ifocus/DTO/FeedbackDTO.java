package com.ifocus.ifocus.DTO;

import com.ifocus.ifocus.models.Feedback;
import java.io.Serializable;
import java.time.LocalDateTime;

public class FeedbackDTO implements Serializable {
    private static final long serialVersionUID = 1L;

    private Long id_feedback;
    private String tipo;
    private String mensagem;
    private LocalDateTime dataEnvio;
    private Long idUsuario;

    public FeedbackDTO() {}

    public FeedbackDTO(Feedback entity) {
        this.id_feedback = entity.getId_feedback();
        this.tipo = entity.getTipo();
        this.mensagem = entity.getMensagem();
        this.dataEnvio = entity.getDataEnvio();
        if (entity.getUsuario() != null) {
            this.idUsuario = entity.getUsuario().getId_user();
        }
    }
    public Long getId_feedback() {
        return id_feedback;
    }
    public void setId_feedback(Long id_feedback) {
         this.id_feedback = id_feedback;
    }

    public String getTipo() {
         return tipo;
    }
    public void setTipo(String tipo) {
         this.tipo = tipo; 
    }

    public String getMensagem() {
         return mensagem;
    }
    public void setMensagem(String mensagem) {
         this.mensagem = mensagem;
    }

    public LocalDateTime getDataEnvio() {
         return dataEnvio;
    }
    public void setDataEnvio(LocalDateTime dataEnvio) { 
        this.dataEnvio = dataEnvio; 
    }
    public Long getIdUsuario() {
        return idUsuario; 
    }
    public void setIdUsuario(Long idUsuario) { 
        this.idUsuario = idUsuario;
    }
}