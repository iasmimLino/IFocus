package com.ifocus.ifocus.controller;

import java.util.List;
import java.util.Map;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import com.ifocus.ifocus.DTO.SessaoDeEstudosDTO;
import com.ifocus.ifocus.models.SessaoDeEstudos;
import com.ifocus.ifocus.service.SessaoDeEstudosService;

@RestController
@RequestMapping("/sessaodeestudos")

public class SessaoDeEstudosController {
@Autowired

private SessaoDeEstudosService sessaodeestudosService;

@GetMapping("/listar") 
  public List<SessaoDeEstudos> Listar(){
    return sessaodeestudosService.Listar(); 
  }

 @PostMapping ("/cadastrar")
    public SessaoDeEstudosDTO insert (@RequestBody SessaoDeEstudosDTO dto){
        return sessaodeestudosService.insert(dto);
    }
  @GetMapping("/grafico/progresso")
     public List<Map<String, Object>> getGraficoProgresso() {
        return sessaodeestudosService.obterProgressoDiario();
    }
  @GetMapping("/grafico/resumo")
    public Map<String, Object> getResumoGeral() {
        return sessaodeestudosService.obterResumoGeral();
  }
    @GetMapping("/grafico/materia")
    public List<Map<String, Object>> getGraficoMateria() {
        return sessaodeestudosService.obterTempoPorMateria();
    }

    @GetMapping("/horarios-sugeridos")
    public List<String> getHorariosSugeridos() {
        return sessaodeestudosService.sugerirHorariosVagos();
    }
}

