package com.ifocus.ifocus.DTO;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
public class UserRegistrationRequestDTO {

    @NotBlank
    @Size(max = 120)
    private String nomeCompleto;

    @NotBlank
    @Email
    @Size(max = 254)
    private String email;

    @NotBlank
    @Pattern(regexp = "^(?=.*\\d).{8,72}$", message = "A senha deve ter pelo menos 8 caracteres e 1 número.")
    private String senha;

    @Size(max = 20)
    private String cpf;

    @Size(max = 100)
    private String pais;

    @Size(max = 100)
    private String cidade;
}
