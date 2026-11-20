package vn.phahang.phahang.domain;

public class RestResponse<T> {
    private int statusCode;
    private Object message;
    private String error;
    private T data;

    public RestResponse() {
    }
    
    public RestResponse(int statusCode, Object message, String error, T data) {
        this.statusCode = statusCode;
        this.message = message;
        this.error = error;
        this.data = data;
    }

    public int getStatusCode() {
        return statusCode;
    }

    public void setStatusCode(int statusCode) {
        this.statusCode = statusCode;
    }

    public Object getMessage() {
        return message;
    }

    public void setMessage(Object message) {
        this.message = message;
    }

    public String getError() {
        return error;
    }

    public void setError(String error) {
        this.error = error;
    }

    public T getData() {
        return data;
    }

    public void setData(T data) {
        this.data = data;
    }
}
