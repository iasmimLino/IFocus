package com.ifocus.ifocus.service;

import java.util.List;
import java.util.stream.Collectors;
import org.springframework.stereotype.Service;
import com.ifocus.ifocus.DTO.CronogramaDTO;
import com.ifocus.ifocus.models.Cronograma;
import com.ifocus.ifocus.models.Turma;
import com.ifocus.ifocus.models.User;
import com.ifocus.ifocus.repository.CronogramaRepository;
import com.ifocus.ifocus.repository.TurmaRepository;
import com.ifocus.ifocus.repository.UserRepository;
import org.springframework.transaction.annotation.Transactional;

@Service
public class CronogramaService {

    private final CronogramaRepository cronogramaRepository;
    private final UserRepository repositoryUser;
    private final TurmaRepository turmaRepository;

    public CronogramaService(CronogramaRepository cronogramaRepository, UserRepository repositoryUser, TurmaRepository turmaRepository ) {
        this.cronogramaRepository = cronogramaRepository;
        this.repositoryUser = repositoryUser;
        this.turmaRepository = turmaRepository;
    }
    @Transactional(readOnly = true)
    public List<CronogramaDTO> listar() {
        List<Cronograma> list = cronogramaRepository.findAll();
        return list.stream().map(CronogramaDTO::new).collect(Collectors.toList());
    }
    @Transactional(readOnly= true)
    public List<CronogramaDTO> listarPorTurma(Long idTurma){
        List<Cronograma> list = 
            cronogramaRepository.findByTurma_Id_turma(idTurma);
        return list.stream()
                .map(CronogramaDTO :: new)
                .collect(Collectors.toList());
    }
    @Transactional
    public CronogramaDTO insert(CronogramaDTO dto, Long idUsuario) {
        // Validação simples de intervalo de datas
        if (dto.getDataFim().isBefore(dto.getDataInicio())) {
            throw new IllegalArgumentException("A data final não pode ser anterior à data de início.");
        }

        Cronograma entidade = new Cronograma();
        copiarDtoParaEntidade(dto, entidade, idUsuario);
        entidade = cronogramaRepository.save(entidade);
        return new CronogramaDTO(entidade);
    }
    @Transactional
    public CronogramaDTO atualizar(Long id, CronogramaDTO dto, Long idUsuario) {
        Cronograma entidade = cronogramaRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Cronograma não encontrado com o id: " + id));
        //Cronograma da turma
        if (entidade.getTurma() != null) {
            verificarPermissaoTurma(entidade.getTurma(),idUsuario);
        }
        //Cronograma pessoal
        else if (entidade.getUsuario() != null) {
            if(entidade.getUsuario().getId_user() != idUsuario){
                throw new RuntimeException("Você não tem permissão para editar esse cronograma.");
            }
        }
        copiarDtoParaEntidade(dto, entidade, idUsuario);    
        entidade = cronogramaRepository.save(entidade);
        return new CronogramaDTO(entidade);
    }
    @Transactional
    public void deletar(Long id, Long idUsuario) {
        Cronograma entidade = cronogramaRepository.findById(id)
                .orElseThrow(() -> new RuntimeException(  "Cronograma não encontrado com o id: " + id ));
        // Cronograma da turma
         if (entidade.getTurma() != null) {
             verificarPermissaoTurma(entidade.getTurma(),idUsuario );
        }

        // Cronograma pessoal
        else if (entidade.getUsuario() != null) {
            if (entidade.getUsuario().getId_user() != idUsuario) {
                 throw new RuntimeException("Você não tem permissão para excluir esse cronograma." );
            }
        }
        cronogramaRepository.delete(entidade);
    }
    private void copiarDtoParaEntidade(CronogramaDTO dto, Cronograma entidade, Long idUsuario) {
        entidade.setTitulo(dto.getTitulo());
        entidade.setCargaHoraria(dto.getCargaHoraria());
        entidade.setDataInicio(dto.getDataInicio());
        entidade.setDataFim(dto.getDataFim());
        if (dto.getId_turma() != null) {
            // Vincula o usuário ao cronograma compartilhado da turma
            Turma turma = turmaRepository.findById(dto.getId_turma())
                .orElseThrow(() -> new RuntimeException("Turma não encontrada."));
            verificarPermissaoTurma(turma, idUsuario);
           entidade.setTurma(turma);
            entidade.setUsuario(null);
        }
        else{
            // Vincula o usuário ao cronograma pessoal
            User usuario = repositoryUser.findById(dto.getId_user())
                .orElseThrow(() -> new RuntimeException("Usuário não encontrado com o id: " + dto.getId_user()));
            entidade.setUsuario(usuario);
            entidade.setTurma(null);
        }
    }
    private void verificarPermissaoTurma(Turma turma, Long idUsuario){
        boolean ehLider = turma.getLider() != null && Long.valueOf(turma.getLider().getId_user()).equals(idUsuario);
        boolean ehVice = turma.getVice() != null &&  Long.valueOf(turma.getVice().getId_user()).equals(idUsuario);

    if (!ehLider && !ehVice) {
        throw new RuntimeException(
                "Você não possui permissão para alterar o cronograma da turma."
           );
        }
    }
}
