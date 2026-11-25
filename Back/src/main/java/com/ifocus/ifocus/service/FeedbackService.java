package com.ifocus.ifocus.service;

import com.ifocus.ifocus.DTO.FeedbackDTO;
import com.ifocus.ifocus.models.Feedback;
import com.ifocus.ifocus.models.User;
import com.ifocus.ifocus.repository.FeedbackRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;

@Service
public class FeedbackService {

    @Autowired
    private FeedbackRepository repositoryFeedback;

    public List<Feedback> Listar() {
        return repositoryFeedback.findAll();
    }

    public FeedbackDTO insert(FeedbackDTO dto) {
        Feedback entidade = new Feedback();
        entidade.setTipo(dto.getTipo());
        entidade.setMensagem(dto.getMensagem());
        entidade.setDataEnvio(LocalDateTime.now());

        if (dto.getIdUsuario() != null) {
            User usuario = new User();
            usuario.setId_user(dto.getIdUsuario());
            entidade.setUsuario(usuario);
        }

        entidade = repositoryFeedback.save(entidade);
        return new FeedbackDTO(entidade);
    }
}