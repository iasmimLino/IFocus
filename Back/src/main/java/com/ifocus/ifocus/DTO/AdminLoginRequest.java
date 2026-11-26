package com.ifocus.ifocus.DTO;

import jakarta.validation.constraints.NotBlank;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
public class AdminLoginRequest {

    @NotBlank
    private String login;

    @NotBlank
    private String senha;
}
