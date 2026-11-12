package vn.phahang.phahang.dto;

public class ResLoginDTO {
    private String accessToken;
    private UserLogin user;

    public String getAccessToken() {
        return accessToken;
    }

    public void setAccessToken(String accessToken) {
        this.accessToken = accessToken;
    }

    public UserLogin getUser() {
        return user;
    }

    public void setUser(UserLogin user) {
        this.user = user;
    }

    public static class UserLogin {
        private Integer id;
        private String email;
        private String fullName;
        private String role;

        public UserLogin() {
        }

        public UserLogin(Integer id, String email, String fullName, String role) {
            this.id = id;
            this.email = email;
            this.fullName = fullName;
            this.role = role;
        }

        public Integer getId() { return id; }
        public void setId(Integer id) { this.id = id; }

        public String getEmail() { return email; }
        public void setEmail(String email) { this.email = email; }

        public String getFullName() { return fullName; }
        public void setFullName(String fullName) { this.fullName = fullName; }

        public String getRole() { return role; }
        public void setRole(String role) { this.role = role; }
    }
}
