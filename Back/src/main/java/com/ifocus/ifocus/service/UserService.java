package com.ifocus.ifocus.service;
import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import com.ifocus.ifocus.DTO.UserDTO;
import com.ifocus.ifocus.models.User;
import com.ifocus.ifocus.repository.UserRepository;

@Service
public class UserService {
 @Autowired
  private UserRepository repositoryUser;

 
  public List<User> Listar() {
    List<User> users = repositoryUser.findAll();
    return users;
  }
  
  @Autowired
    private PasswordEncoder passwordEncoder;

    public User cadastrarUsuario(User user) {
        // Criptografa a senha antes de salvar no banco de dados
        String senhaCriptografada = passwordEncoder.encode(user.getSenha());
        user.setSenha(senhaCriptografada);
        
        return repositoryUser.save(user);
    }

  public UserDTO findById(int matricula) {
    long id = Long.parseLong(String.valueOf(matricula));
    User user = repositoryUser.findById(id).orElseThrow(() -> new RuntimeException("User not found"));
    return new UserDTO(user);
  }

  public UserDTO insert(UserDTO dto) {
    User entidade = new User();
    entidade.setNome(dto.getNome());
    entidade.setMatricula(dto.getMatricula());
    entidade.setSenha(dto.getSenha());
    entidade = repositoryUser.save(entidade);
    return new UserDTO(entidade);
  }

  public UserDTO login(int matricula) {

    User usuario = repositoryUser.findByMatricula(matricula)
            .orElseThrow(() -> new RuntimeException("Usuário não encontrado."));
            return new UserDTO(usuario);
}
   

}