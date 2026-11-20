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
        
        // 1. FE: http://localhost:3000
        config.setAllowedOrigins(Arrays.asList("http://localhost:3000", "http://localhost:54653", 
        "http://localhost:5173", "https://zz-ten-jet.vercel.app", "https://phahang.vercel.app"));
        
        // 2. methods
        config.setAllowedMethods(Arrays.asList("GET", "POST", "PUT", "DELETE", "OPTIONS"));
        
        // 3. Content-Type, Authoriazation, ..
        config.setAllowedHeaders(Arrays.asList("*"));
        
        config.setAllowCredentials(true);

        //Luu thoi gian cords trong 1 gio
        config.setMaxAge(3600L);
        
        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", config);
        return source;
    }
}
