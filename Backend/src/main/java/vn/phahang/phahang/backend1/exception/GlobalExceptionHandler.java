package vn.phahang.phahang.backend1.exception;

import java.util.LinkedHashMap;
import java.util.Map;

import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

@RestControllerAdvice 
public class GlobalExceptionHandler {
    // 404: Không tìm thấy dữ liệu
    @ExceptionHandler(ResourceNotFoundException.class)
    public ResponseEntity<Map<String, String>> handleNotFound(
            ResourceNotFoundException e) {
        Map<String, String> response = new LinkedHashMap<>();
        response.put("message", e.getMessage());
        return ResponseEntity.status(HttpStatus.NOT_FOUND).body(response);
    }
    // 400: Dữ liệu đầu vào không hợp lệ
    @ExceptionHandler(IllegalArgumentException.class)
    public ResponseEntity<Map<String, String>> handleBadRequest(IllegalArgumentException e) {
        Map<String, String> response = new LinkedHashMap<>();
        response.put("message", e.getMessage());
        return ResponseEntity.badRequest().body(response);
    }

    // 400: Lỗi kiểm tra dữ liệu DTO (@Valid)
    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<Map<String, String>> handleValidation(
            MethodArgumentNotValidException e) {
        Map<String, String> response = new LinkedHashMap<>();
        String message = e.getBindingResult()
                .getFieldErrors()
                .stream()
                .map(error -> error.getField() + ": " + error.getDefaultMessage())
                .findFirst()
                .orElse("Dữ liệu đầu vào không hợp lệ");
        response.put("message", message);
        return ResponseEntity.badRequest().body(response);
    }
    // 409: Vi phạm ràng buộc dữ liệu trong database
    @ExceptionHandler(DataIntegrityViolationException.class)
    public ResponseEntity<Map<String, String>> handleDataIntegrity(
            DataIntegrityViolationException e) {
        Map<String, String> response = new LinkedHashMap<>();
        response.put("message", "Dữ liệu vi phạm ràng buộc trong database");
        return ResponseEntity.status(HttpStatus.CONFLICT).body(response);
    }
    // 500: Lỗi hệ thống không dự kiến
    @ExceptionHandler(Exception.class)
    public ResponseEntity<Map<String, String>> handleInternalError(Exception e) {
        Map<String, String> response = new LinkedHashMap<>();
        response.put("message", "Đã xảy ra lỗi hệ thống");
        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
            .body(response);
    }
}
