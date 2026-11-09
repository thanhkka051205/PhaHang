package vn.phahang.phahang.config;

import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.http.MediaType;
import org.springframework.security.core.AuthenticationException;
import org.springframework.security.web.AuthenticationEntryPoint;
import org.springframework.stereotype.Component;
import java.io.IOException;

@Component
public class CustomAuthenticationEntryPoint implements AuthenticationEntryPoint {

    @Override
    public void commence(HttpServletRequest request, HttpServletResponse response,
                         AuthenticationException authException) throws IOException, ServletException {
        
        response.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
        response.setContentType(MediaType.APPLICATION_JSON_VALUE);
        response.setCharacterEncoding("UTF-8");

        String rawError = authException.getMessage() != null ? authException.getMessage() : "Unauthorized";
        String escapedError = rawError.replace("\"", "\\\"");

        String jsonResponse = String.format(
            "{\"statusCode\":401,\"data\":null,\"error\":\"%s\",\"message\":\"Token không hợp lệ, hết hạn hoặc không được truyền lên!\"}",
            escapedError
        );

        response.getWriter().write(jsonResponse);
    }
}
