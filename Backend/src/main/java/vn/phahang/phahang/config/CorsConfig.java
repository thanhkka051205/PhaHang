package vn.phahang.phahang.config;

import java.util.Arrays;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

@Configuration
public class CorsConfig {

    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration config = new CorsConfiguration();

        config.setAllowedOrigins(Arrays.asList(
            "http://localhost:3000",
            "http://127.0.0.1:5500",
            "http://localhost:5500",
            "http://localhost:54653",
            "http://127.0.0.1:5501",
            "http://localhost:5501",
            "http://localhost:5173",
            "http://127.0.0.1:5502",
            "http://localhost:5502",
            "https://zz-ten-jet.vercel.app",
            "https://phahang.vercel.app",
            "https://phahang99.vercel.app"
        ));

        config.setAllowedMethods(Arrays.asList(
            "GET",
            "POST",
            "PUT",
            "DELETE",
            "PATCH",
            "OPTIONS"
        ));

        config.setAllowedHeaders(Arrays.asList("*"));
        config.setAllowCredentials(true);
        config.setMaxAge(3600L);

        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", config);

        return source;
    }
}