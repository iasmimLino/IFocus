package com.ifocus.ifocus.service;

import com.ifocus.ifocus.DTO.SessaoDeEstudosDTO;
import com.ifocus.ifocus.models.Materia;
import com.ifocus.ifocus.models.SessaoDeEstudos;
import com.ifocus.ifocus.repository.SessaoDeEstudosRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Map;

@Service
public class SessaoDeEstudosService {

    @Autowired
    private SessaoDeEstudosRepository repositorySessaoDeEstudos;

    public List<SessaoDeEstudos> Listar() {
        return repositorySessaoDeEstudos.findAll();
    }

    public SessaoDeEstudosDTO insert(SessaoDeEstudosDTO dto) {
        SessaoDeEstudos entidade = new SessaoDeEstudos();
        entidade.setTempo(dto.getTempo());
        entidade.setEtapas(dto.getEtapas());

        // Associa a matéria se informada no DTO
        if (dto.getIdMateria() != null) {
            Materia materia = new Materia();
            materia.setId_materia(dto.getIdMateria());
            entidade.setMateria(materia);
        }

        entidade = repositorySessaoDeEstudos.save(entidade);
        return new SessaoDeEstudosDTO(entidade);
    }


    public List<Map<String, Object>> obterProgressoDiario() {
        return repositorySessaoDeEstudos.buscarProgressoDiario();
    }

    public Map<String, Object> obterResumoGeral() {
        return repositorySessaoDeEstudos.buscarResumoGeral();
    }

    public List<Map<String, Object>> obterTempoPorMateria() {
        return repositorySessaoDeEstudos.buscarTempoPorMateria();
    }

    public List<String> sugerirHorariosVagos() {
        return List.of(
            "08:00 - 10:00 (Manhã - Ideal para exatas)",
            "14:00 - 16:00 (Tarde - Foco intermediário)",
            "19:00 - 20:30 (Noite - Leitura e revisão)"
        );
    }
}


