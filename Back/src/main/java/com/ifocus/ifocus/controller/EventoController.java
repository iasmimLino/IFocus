package com.ifocus.ifocus.controller;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import com.ifocus.ifocus.DTO.EventoDTO;
import com.ifocus.ifocus.models.Evento;
import com.ifocus.ifocus.service.EventoService;

@RestController
@RequestMapping({"/evento", "/eventos", "/api/eventos"})

public class EventoController {
    @Autowired

    EventoService eventoService;

    @GetMapping("/listar") 
  public List<Evento>Listar(){
    return eventoService.Listar(); 
  }

     @PostMapping ("/cadastrar")
    public EventoDTO insert (@RequestBody EventoDTO dto){
        return eventoService.insert(dto);
    }
    @GetMapping("/calendario/{idUser}")
    public List<Evento> obterCalendarioSincronizado(@PathVariable Long idUser) {
        return eventoService.listarCalendarioSincronizado(idUser);
    }

    @GetMapping({"", "/"})
    public List<EventoDTO> listarEventos() {
      return eventoService.Listar().stream().map(EventoDTO::new).toList();
    }

    @PostMapping({"", "/"})
    public EventoDTO criarEvento(@RequestBody EventoDTO dto) {
      return eventoService.insert(dto);
    }

    @PutMapping("/{id}")
    public EventoDTO atualizarEvento(@PathVariable Long id, @RequestBody EventoDTO dto) {
      return eventoService.atualizar(id, dto);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deletarEvento(@PathVariable Long id) {
      eventoService.deletar(id);
      return ResponseEntity.noContent().build();
    }
}    