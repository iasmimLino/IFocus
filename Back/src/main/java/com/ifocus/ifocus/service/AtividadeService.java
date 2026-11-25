package com.ifocus.ifocus.service;

import java.util.EnumMap;
import java.util.List;
import java.util.Map;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.ifocus.ifocus.DTO.AtividadeDTO;
import com.ifocus.ifocus.DTO.AtividadeResumoDTO;
import com.ifocus.ifocus.DTO.AtividadeStatusDTO;
import com.ifocus.ifocus.models.Atividade;
import com.ifocus.ifocus.models.Atividade_Status;
import com.ifocus.ifocus.repository.AtividadeRepository;

@Service
public class AtividadeService {

    @Autowired
    private AtividadeRepository repositoryAtividade;

    public List<Atividade> listar() {
        return repositoryAtividade.findAll();
    }

    public AtividadeDTO insert(AtividadeDTO dto) {
        Atividade entidade = new Atividade();
        entidade.setPrazo(dto.getPrazo());
        entidade.setTitulo(dto.getTitulo());
        entidade.setDisciplina(dto.getDisciplina() != null ? dto.getDisciplina() : "Geral");
        entidade.setMateriaId(dto.getMateriaId());
        entidade.setDuracaoMinutos(dto.getDuracaoMinutos());
        entidade.setPrioridade(dto.getPrioridade());
        entidade.setTipo_de_atividade(dto.getTipo_de_atividade());
        
        // convertendo para enum
        if (dto.getStatus() != null) {
        entidade.setStatus(Atividade_Status.valueOf(dto.getStatus()));
      }

        entidade = repositoryAtividade.save(entidade);
        return new AtividadeDTO(entidade);
    }

    public AtividadeResumoDTO obterResumoAtividades() {
        Map<Atividade_Status, Long> contagemPorStatus = new EnumMap<>(Atividade_Status.class);
        
        // Garante valor 0 para todas as fases do enum
        for (Atividade_Status status : Atividade_Status.values()) {
            contagemPorStatus.put(status, 0L);
        }

        // Sobrescreve com os valores existentes no banco
        List<AtividadeStatusDTO> resultados = repositoryAtividade.contarAtividadesGroupByStatus();
        for (AtividadeStatusDTO dto : resultados) {
            if (dto.status() != null) {
                contagemPorStatus.put(dto.status(), dto.quantidade());
            }
        }

        long quantidadeGeral = contagemPorStatus.values().stream().mapToLong(Long::longValue).sum();

        return new AtividadeResumoDTO(quantidadeGeral, contagemPorStatus);
    }
    
    //  Atualiza/altera a fase no Kanban (A_FAZER, FAZENDO, FEITA)
    public Atividade atualizarStatus(Long id, Atividade_Status novoStatus) {
        Atividade atividade = repositoryAtividade.findById(id)
                .orElseThrow(() -> new RuntimeException("Atividade não encontrada com ID: " + id));
        
        atividade.setStatus(novoStatus);
        return repositoryAtividade.save(atividade);
    }

    //  Exclui atividades do cronograma/calendário
    public void deletar(Long id) {
        repositoryAtividade.deleteById(id);
    }


}