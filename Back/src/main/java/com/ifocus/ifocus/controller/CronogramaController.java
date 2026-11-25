package com.ifocus.ifocus.controller;

import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.bind.annotation.RequestParam;

import com.ifocus.ifocus.DTO.CronogramaDTO;
import com.ifocus.ifocus.service.CronogramaService;

@RestController
@RequestMapping("/cronogramas") 
public class CronogramaController {

    private final CronogramaService cronogramaService;

    // Injeção via construtor (Boa prática)
    public CronogramaController(CronogramaService cronogramaService) {
        this.cronogramaService = cronogramaService;
    }

    @GetMapping
    public ResponseEntity<List<CronogramaDTO>> listar() {
        List<CronogramaDTO> cronogramas = cronogramaService.listar();
        return ResponseEntity.ok(cronogramas);
    }

    @PostMapping
    public ResponseEntity<CronogramaDTO> insert(@Validated @RequestBody CronogramaDTO dto, @RequestParam Long idUsuario) {
        CronogramaDTO novoCronograma = cronogramaService.insert(dto, idUsuario);
        return ResponseEntity.status(HttpStatus.CREATED).body(novoCronograma);
    }

    // Essencial para o RF008 (Ajustar horários/tarefas)
    @PutMapping("/{id}")
    public ResponseEntity<CronogramaDTO> atualizar(@PathVariable Long id,@Validated @RequestBody CronogramaDTO dto, @RequestParam Long idUsuario) {
        CronogramaDTO atualizado = cronogramaService.atualizar(id, dto, idUsuario);
        return ResponseEntity.ok(atualizado);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deletar(@PathVariable Long id, @RequestParam Long idUsuario) {
        cronogramaService.deletar(id,idUsuario);
        return ResponseEntity.noContent().build();
    }
    @GetMapping("/turma/{idTurma}")
    public ResponseEntity<List<CronogramaDTO>> listarPorTurma(@PathVariable Long idTurma) {
    List<CronogramaDTO> cronogramas = cronogramaService.listarPorTurma(idTurma);

    return ResponseEntity.ok(cronogramas);
    }
}