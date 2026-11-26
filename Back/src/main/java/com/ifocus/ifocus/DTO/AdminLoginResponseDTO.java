package com.ifocus.ifocus.DTO;

import lombok.AllArgsConstructor;
import lombok.Getter;

@Getter
@AllArgsConstructor
public class AdminLoginResponseDTO {

    private String token;
    private String tokenType;
    private UserAdminDTO user;
}
