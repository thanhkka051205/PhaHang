package vn.trungthucmobile.trungthucmobile.service.error;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;
import org.springframework.http.HttpStatus;
import vn.trungthucmobile.trungthucmobile.domain.RestResponse;

@RestControllerAdvice
public class GlobalException {
    
    @ExceptionHandler(value = IdInvalidException.class)
    public ResponseEntity<RestResponse<Object>> handledIdException(IdInvalidException idException) {
        RestResponse<Object> res = new RestResponse<Object>();
        
        res.setStatusCode(HttpStatus.BAD_REQUEST.value());
        res.setError(idException.getMessage());
        res.setMessage("IdInvalidException");
        
        return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(res);
    }
}
