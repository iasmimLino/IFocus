package com.ifocus.ifocus.service;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.ifocus.ifocus.DTO.EventoDTO;
import com.ifocus.ifocus.models.Evento;
import com.ifocus.ifocus.repository.EventoRepository;

@Service
public class EventoService {
 @Autowired
  private EventoRepository repositoryEvento;

 
  public List<Evento> Listar() {
    List<Evento> eventos = repositoryEvento.findAll();
    return eventos;
  }


  public EventoDTO insert(EventoDTO dto) {
    Evento entidade = new Evento();
    entidade.setNome(dto.getNome());
    entidade.setData(dto.getData());
    entidade.setPrioridade(dto.getPrioridade() != null ? dto.getPrioridade() : false);
    copiarCamposDoCronograma(dto, entidade);
    entidade = repositoryEvento.save(entidade);
    return new EventoDTO(entidade);
  }

  public EventoDTO atualizar(Long id, EventoDTO dto) {
    Evento entidade = repositoryEvento.findById(id)
        .orElseThrow(() -> new RuntimeException("Evento não encontrado com o id: " + id));
    entidade.setNome(dto.getNome());
    entidade.setData(dto.getData());
    entidade.setPrioridade(dto.getPrioridade() != null ? dto.getPrioridade() : false);
    copiarCamposDoCronograma(dto, entidade);
    return new EventoDTO(repositoryEvento.save(entidade));
  }

  public void deletar(Long id) {
    repositoryEvento.deleteById(id);
  }

  private void copiarCamposDoCronograma(EventoDTO dto, Evento entidade) {
    entidade.setCategoria(dto.getCategoria());
    entidade.setDescricao(dto.getDescricao());
    entidade.setMateriaId(dto.getMateriaId());
    entidade.setNotificar(dto.getNotificar());
    entidade.setInicio(dto.getInicio());
    entidade.setFim(dto.getFim());
  }

  public List<Evento> listarCalendarioSincronizado(Long idUser) {
        return repositoryEvento.findEventosSincronizadosDoUsuario(idUser);
    }

}
