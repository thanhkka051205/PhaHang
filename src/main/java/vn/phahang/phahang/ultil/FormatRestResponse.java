    package vn.phahang.phahang.ultil;

    import org.springframework.http.server.ServletServerHttpResponse;
    import org.springframework.web.bind.annotation.RestControllerAdvice;
    import org.springframework.web.servlet.mvc.method.annotation.ResponseBodyAdvice;
    import org.springframework.core.MethodParameter;
    import org.springframework.http.MediaType;
    import org.springframework.http.server.ServerHttpRequest;
    import org.springframework.http.server.ServerHttpResponse;
    import jakarta.servlet.http.HttpServletResponse;
    import vn.phahang.phahang.domain.RestResponse;
    @RestControllerAdvice
    public class FormatRestResponse implements ResponseBodyAdvice<Object> {

        @Override
        public boolean supports(MethodParameter returnType, Class converterType) {
            return true;
        }

        @Override
        public Object beforeBodyWrite(
                Object body, 
                MethodParameter returnType, 
                MediaType selectedContentType, 
                Class selectedConverterType, 
                ServerHttpRequest request, 
                ServerHttpResponse response) {
            HttpServletResponse serletResponse = ((ServletServerHttpResponse) response).getServletResponse();
            int status = serletResponse.getStatus();

            RestResponse<Object> res = new RestResponse<Object>();
            res.setStatusCode(status);
            //case error
            if (status >= 400) {
                res.setError(body.toString());
                res.setMessage("Error");
            }else{
                res.setMessage("Success");
                res.setData(body);
            }
            return res;
        }
    }
