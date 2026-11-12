package vn.phahang.phahang.controller;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.config.annotation.authentication.builders.AuthenticationManagerBuilder;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import jakarta.validation.Valid;
import vn.phahang.phahang.dto.LoginDTO;
import vn.phahang.phahang.dto.RegisterDTO;
import vn.phahang.phahang.dto.ResLoginDTO;
import vn.phahang.phahang.dto.UserResponseDTO;
import vn.phahang.phahang.util.error.SecurityUtil;
import vn.phahang.phahang.service.UserService;
import vn.phahang.phahang.domain.User;
import vn.phahang.phahang.domain.RestResponse;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    private final AuthenticationManagerBuilder authenticationManagerBuilder;
    private final SecurityUtil securityUtil;
    private final UserService userService;
    private final PasswordEncoder passwordEncoder; 

    public AuthController(AuthenticationManagerBuilder authenticationManagerBuilder, SecurityUtil securityUtil, UserService userService, PasswordEncoder passwordEncoder) {
        this.authenticationManagerBuilder = authenticationManagerBuilder;
        this.securityUtil = securityUtil;   
        this.userService = userService;
        this.passwordEncoder = passwordEncoder;
    }

    @PostMapping("/login")
    public ResponseEntity<ResLoginDTO> login(@Valid @RequestBody LoginDTO loginDTO) {
        UsernamePasswordAuthenticationToken authenticationToken = new UsernamePasswordAuthenticationToken(
                loginDTO.getUsername(), loginDTO.getPassword());

        // xac thuc nguoi dung
        Authentication authentication = authenticationManagerBuilder.getObject().authenticate(authenticationToken);

        //Lay thong tin tu db
        // 2. Lấy thông tin user từ database
        User currentUserDB = this.userService.handleGetUserByUsername(loginDTO.getUsername());

        ResLoginDTO resLoginDTO = new ResLoginDTO();
        if (currentUserDB != null) {
            ResLoginDTO.UserLogin userLogin = new ResLoginDTO.UserLogin(
                    currentUserDB.getUserId(),
                    currentUserDB.getEmail(),
                    currentUserDB.getFullName(),
                    currentUserDB.getRole()
            );
            resLoginDTO.setUser(userLogin);
        }
        // craete a token
        String access_token=this.securityUtil.createToken(authentication);
        SecurityContextHolder.getContext().setAuthentication(authentication);

        resLoginDTO.setAccessToken(access_token);
        
        return ResponseEntity.ok().body(resLoginDTO);
    }

    @PostMapping("/register")
    public ResponseEntity<RestResponse<UserResponseDTO>> register(@Valid @RequestBody RegisterDTO registerDTO){

        //Tao thong tin nguoi dung
        User newUser= new User();
        newUser.setFullName(registerDTO.getFullName());
        newUser.setEmail(registerDTO.getEmail());
        newUser.setPassword(registerDTO.getPassword());

        //Ma hoa password
        newUser.setPassword(this.passwordEncoder.encode(registerDTO.getPassword()));

        newUser.setRole("ROLE_CUSTOM");
        newUser.setStatus(true);

        //luu db
        User createUser=this.userService.handleCreateUser(newUser);

        //tra ve DTO
        RestResponse<UserResponseDTO> res = new RestResponse<>();
        res.setStatusCode(HttpStatus.CREATED.value());
        res.setData(this.userService.convertToDTO(createUser));
        res.setMessage("Đăng ký thành công");

        return ResponseEntity.status(HttpStatus.CREATED).body(res);
    }
}