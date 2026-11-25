package com.ifocus.ifocus.DTO;

import com.ifocus.ifocus.models.Evento;
import java.io.Serializable;
import java.util.Date;

public class EventoDTO implements Serializable {
    private static final long serialVersionUID = 1L;

    private Long id_evento;
    private Date data;
    private Boolean prioridade;
    private String nome;
    private String categoria;
    private String descricao;
    private Long materiaId;
    private Boolean notificar;
    private String inicio;
    private String fim;
    private Long idTurma;
    private Long idUsuario;

    public EventoDTO() {
    }

    public EventoDTO(Evento entity) {
        this.id_evento = entity.getId_evento();
        this.data = entity.getData();
        this.prioridade = entity.getPrioridade();
        this.nome = entity.getNome();
        this.categoria = entity.getCategoria();
        this.descricao = entity.getDescricao();
        this.materiaId = entity.getMateriaId();
        this.notificar = entity.getNotificar();
        this.inicio = entity.getInicio();
        this.fim = entity.getFim();
        if (entity.getTurma() != null) {
            this.idTurma = entity.getTurma().getId_turma();
        }
        if (entity.getUsuario() != null) {
            this.idUsuario = entity.getUsuario().getId_user();
        }
    }
    public Long getId_evento() { return id_evento; }
    public void setId_evento(Long id_evento) { this.id_evento = id_evento; }

    public Date getData() { return data; }
    public void setData(Date data) { this.data = data; }

    public Boolean getPrioridade() { return prioridade; }
    public void setPrioridade(Boolean prioridade) { this.prioridade = prioridade; }

    public String getNome() { return nome; }
    public void setNome(String nome) { this.nome = nome; }

    public String getCategoria() { return categoria; }
    public void setCategoria(String categoria) { this.categoria = categoria; }

    public String getDescricao() { return descricao; }
    public void setDescricao(String descricao) { this.descricao = descricao; }

    public Long getMateriaId() { return materiaId; }
    public void setMateriaId(Long materiaId) { this.materiaId = materiaId; }

    public Boolean getNotificar() { return notificar; }
    public void setNotificar(Boolean notificar) { this.notificar = notificar; }

    public String getInicio() { return inicio; }
    public void setInicio(String inicio) { this.inicio = inicio; }

    public String getFim() { return fim; }
    public void setFim(String fim) { this.fim = fim; }

    public Long getIdTurma() { return idTurma; }
    public void setIdTurma(Long idTurma) { this.idTurma = idTurma; }

    public Long getIdUsuario() { return idUsuario; }
    public void setIdUsuario(Long idUsuario) { this.idUsuario = idUsuario; }
}