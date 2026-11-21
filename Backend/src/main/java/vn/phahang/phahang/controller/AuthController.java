package vn.phahang.phahang.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.config.annotation.authentication.builders.AuthenticationManagerBuilder;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import jakarta.validation.Valid;
import vn.phahang.phahang.domain.User;
import vn.phahang.phahang.dto.LoginDTO;
import vn.phahang.phahang.service.UserService;
import vn.phahang.phahang.util.error.SecurityUtil;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    private final AuthenticationManagerBuilder authenticationManagerBuilder;
    private final SecurityUtil securityUtil;
    private final UserService userService;

    public AuthController(AuthenticationManagerBuilder authenticationManagerBuilder, SecurityUtil securityUtil, UserService userService) {
        this.authenticationManagerBuilder = authenticationManagerBuilder;
        this.securityUtil = securityUtil;   
        this.userService = userService;
    }

    @PostMapping("/login")
    public ResponseEntity<LoginDTO> login(@Valid @RequestBody LoginDTO loginDTO) {
        UsernamePasswordAuthenticationToken authenticationToken = new UsernamePasswordAuthenticationToken(
                loginDTO.getUsername(), loginDTO.getPassword());

        // Xác thực người dùng
        Authentication authentication = authenticationManagerBuilder.getObject().authenticate(authenticationToken);
        SecurityContextHolder.getContext().setAuthentication(authentication);

        // Tạo token
        String accessToken = this.securityUtil.createToken(authentication);

        User currentUserDB = this.userService.handleGetUserByUsername(loginDTO.getUsername());

        LoginDTO resLoginDTO = new LoginDTO();
        resLoginDTO.setAccessToken(accessToken);
        if (currentUserDB != null) {
            currentUserDB.setPassword(null);
            resLoginDTO.setUser(currentUserDB);
        }

        return ResponseEntity.ok().body(resLoginDTO);
    }
}
