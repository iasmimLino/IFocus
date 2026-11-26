package com.ifocus.ifocus.service;

import java.nio.charset.StandardCharsets;
import java.util.List;
import java.util.Locale;
import java.util.Optional;

import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.http.HttpStatus;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import com.ifocus.ifocus.DTO.UserDTO;
import com.ifocus.ifocus.DTO.UserAuthResponseDTO;
import com.ifocus.ifocus.DTO.UserRegistrationRequestDTO;
import com.ifocus.ifocus.models.User;
import com.ifocus.ifocus.repository.UserRepository;

@Service
public class UserService {
    private final UserRepository repositoryUser;
    private final PasswordEncoder passwordEncoder;
    private final AdminTokenService tokenService;

    public UserService(
            UserRepository repositoryUser,
            PasswordEncoder passwordEncoder,
            AdminTokenService tokenService) {
        this.repositoryUser = repositoryUser;
        this.passwordEncoder = passwordEncoder;
        this.tokenService = tokenService;
    }

    public List<User> Listar() {
        return repositoryUser.findAll();
    }

    public User cadastrarUsuario(User user) {
        validarSenha(user.getSenha());
        user.setSenha(passwordEncoder.encode(user.getSenha()));
        return repositoryUser.save(user);
    }

    public UserDTO findById(int id) {
        User user = repositoryUser.findById((long) id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Usuário não encontrado."));
        return new UserDTO(user);
    }

    public UserDTO insert(UserDTO dto) {
        if (dto == null || dto.getNome() == null || dto.getNome().isBlank() || dto.getMatricula() == null) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Nome e matrícula são obrigatórios.");
        }
        validarSenha(dto.getSenha());
        if (repositoryUser.findByMatricula(dto.getMatricula()).isPresent()) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "Esta matrícula já está cadastrada.");
        }

        User entidade = new User();
        entidade.setNome(dto.getNome().trim());
        entidade.setMatricula(dto.getMatricula());
        entidade.setEmail(normalizarEmail(dto.getEmail()));
        entidade.setSenha(passwordEncoder.encode(dto.getSenha()));
        return new UserDTO(salvarNovoUsuario(entidade));
    }

    public UserAuthResponseDTO register(UserRegistrationRequestDTO request) {
        String nome = request.getNomeCompleto().trim();
        String email = normalizarEmail(request.getEmail());
        String cpf = normalizarCpf(request.getCpf());
        validarSenha(request.getSenha());
        if (request.getCpf() != null && !request.getCpf().isBlank()
                && (cpf == null || cpf.length() != 11)) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "O CPF deve conter 11 dígitos.");
        }

        if (repositoryUser.findByEmailIgnoreCase(email).isPresent()) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "Este e-mail já está cadastrado.");
        }
        if (cpf != null && repositoryUser.findByCpf(cpf).isPresent()) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "Este CPF já está cadastrado.");
        }

        User user = new User();
        user.setNome(nome);
        user.setEmail(email);
        user.setCpf(cpf);
        user.setPais(valorOpcional(request.getPais()));
        user.setCidade(valorOpcional(request.getCidade()));
        user.setSenha(passwordEncoder.encode(request.getSenha()));

        return respostaAutenticada(salvarNovoUsuario(user));
    }

    public UserAuthResponseDTO login(String emailOuCpf, String senha) {
        if (emailOuCpf == null || emailOuCpf.isBlank() || senha == null) {
            throw credenciaisInvalidas();
        }

        String identificador = emailOuCpf.trim();
        Optional<User> user;
        if (identificador.contains("@")) {
            user = repositoryUser.findByEmailIgnoreCase(normalizarEmail(identificador));
        } else {
            String cpf = normalizarCpf(identificador);
            user = cpf == null ? Optional.empty() : repositoryUser.findByCpf(cpf);
        }
        User usuario = user.filter(conta -> passwordEncoder.matches(senha, conta.getSenha()))
                .orElseThrow(this::credenciaisInvalidas);
        return respostaAutenticada(usuario);
    }

    public UserDTO loginByMatricula(Integer matricula, String senha) {
        if (matricula == null || senha == null) {
            throw credenciaisInvalidas();
        }
        User usuario = repositoryUser.findByMatricula(matricula)
                .filter(conta -> passwordEncoder.matches(senha, conta.getSenha()))
                .orElseThrow(this::credenciaisInvalidas);
        return new UserDTO(usuario);
    }

    private UserAuthResponseDTO respostaAutenticada(User user) {
        return new UserAuthResponseDTO(tokenService.issueStudent(user), "Bearer", new UserDTO(user));
    }

    private User salvarNovoUsuario(User user) {
        try {
            return repositoryUser.saveAndFlush(user);
        } catch (DataIntegrityViolationException exception) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "E-mail, CPF ou matrícula já cadastrado.");
        }
    }

    private String normalizarEmail(String email) {
        return email == null || email.isBlank() ? null : email.trim().toLowerCase(Locale.ROOT);
    }

    private String normalizarCpf(String cpf) {
        if (cpf == null || cpf.isBlank()) {
            return null;
        }
        String digitos = cpf.replaceAll("\\D", "");
        return digitos.isEmpty() ? null : digitos;
    }

    private String valorOpcional(String value) {
        return value == null || value.isBlank() ? null : value.trim();
    }

    private void validarSenha(String senha) {
        if (senha == null || senha.length() < 8 || senha.length() > 72 || !senha.matches("(?s).*\\d.*")
                || senha.getBytes(StandardCharsets.UTF_8).length > 72) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "A senha deve ter pelo menos 8 caracteres, 1 número e no máximo 72 bytes.");
        }
    }

    private ResponseStatusException credenciaisInvalidas() {
        return new ResponseStatusException(HttpStatus.UNAUTHORIZED, "E-mail/CPF ou senha incorretos.");
    }
}