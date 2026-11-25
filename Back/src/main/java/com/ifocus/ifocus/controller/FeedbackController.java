package com.ifocus.ifocus.controller;

import com.ifocus.ifocus.DTO.FeedbackDTO;
import com.ifocus.ifocus.models.Feedback;
import com.ifocus.ifocus.service.FeedbackService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/feedbacks")
public class FeedbackController {

    @Autowired
    private FeedbackService feedbackService;

    @GetMapping("/listar")
    public List<Feedback> Listar() {
        return feedbackService.Listar();
    }

    @PostMapping("/enviar")
    public FeedbackDTO insert(@RequestBody FeedbackDTO dto) {
        return feedbackService.insert(dto);
    }
}
