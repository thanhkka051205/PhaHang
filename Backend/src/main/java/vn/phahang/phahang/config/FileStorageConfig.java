package vn.phahang.phahang.config;

import java.nio.file.Path;
import java.nio.file.Paths;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.ResourceHandlerRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

// Đánh dấu đây là lớp cấu hình của Spring Boot
@Configuration
public class FileStorageConfig implements WebMvcConfigurer {

    // Lấy đường dẫn thư mục lưu ảnh từ application.properties
    @Value("${app.upload.dir}")
    private String uploadDir;

    // Cấu hình để trình duyệt có thể truy cập và hiển thị ảnh đã upload
    @Override
    public void addResourceHandlers(ResourceHandlerRegistry registry) {

        // Chuyển đường dẫn thư mục lưu ảnh thành đường dẫn tuyệt đối
        // Đồng thời chuẩn hóa đường dẫn để tránh các thành phần không cần thiết
        Path uploadPath = Paths.get(uploadDir)
                .toAbsolutePath()
                .normalize();

        // Khi người dùng truy cập URL bắt đầu bằng /uploads/
        // Spring Boot sẽ tìm file tương ứng trong thư mục uploadPath
        registry.addResourceHandler("/uploads/**")
                .addResourceLocations(uploadPath.toUri().toString());
    }
}
