package com.ifocus.ifocus.DTO;

import lombok.AllArgsConstructor;
import lombok.Getter;

@Getter
@AllArgsConstructor
public class UserAuthResponseDTO {

    private String token;
    private String tokenType;
    private UserDTO user;
}
