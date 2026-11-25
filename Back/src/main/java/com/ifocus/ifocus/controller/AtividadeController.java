package com.ifocus.ifocus.controller;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import com.ifocus.ifocus.DTO.AtividadeDTO;
import com.ifocus.ifocus.DTO.AtividadeResumoDTO;
import com.ifocus.ifocus.models.Atividade;
import com.ifocus.ifocus.models.Atividade_Status;
import com.ifocus.ifocus.service.AtividadeService;

@RestController
@RequestMapping({"/atividade", "/api/atividade"})

public class AtividadeController {
    @Autowired

    private AtividadeService atividadeService;

    @GetMapping("/listar") 
    public List<AtividadeDTO>Listar(){
        return atividadeService.listar().stream().map(AtividadeDTO::new).toList();
  }
    // criar/cadastrar atividade
    @PostMapping ("/cadastrar")
    public AtividadeDTO insert (@RequestBody AtividadeDTO dto){
        return atividadeService.insert(dto);
    }

    @GetMapping("/resumo")
    public ResponseEntity<AtividadeResumoDTO> obterResumo() {
        return ResponseEntity.ok(atividadeService.obterResumoAtividades());
    }

    // Mover de fase no Kanban / Alterar Status 
    @PatchMapping("/{id}/status")
    public ResponseEntity<Atividade> atualizarStatus(
            @PathVariable Long id, 
            @RequestParam Atividade_Status novoStatus) {
        return ResponseEntity.ok(atividadeService.atualizarStatus(id, novoStatus));
    }

    // Excluir atividade (RF007)[cite: 1]
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deletar(@PathVariable Long id) {
        atividadeService.deletar(id);
        return ResponseEntity.noContent().build();
    }

}