/**
 * Cấu hình kết nối Backend PhaHang (Spring Boot 3 + MySQL)
 * Repo tham chiếu: https://github.com/thanhkka051205/PhaHang
 */

export const API_CONFIG = {
  // Cổng mặc định của Backend Spring Boot theo application.properties
  //BASE_URL: 'http://localhost:8081/api',
  BASE_URL: "https://mayflower-aspect-profusely.ngrok-free.dev/api",

  // Mặc định sẵn sàng kết nối trực tiếp Backend (Backend có gì lấy nấy)
  USE_API: true,

  // Cấu hình chế độ theo từng Domain: 'hybrid' | 'remote' | 'local'
  DOMAINS: {
    catalog: "hybrid",
    auth: "hybrid",
    users: "hybrid",
    cart: "local",
    order: "local",
    warranty: "local",
    coupon: "local",
  },

  // Thời gian timeout tối đa cho request đến Backend (ms)
  TIMEOUT_MS: 4000,

  // Tự động chuyển về Mock nếu mất kết nối mạng hoặc BE chưa khởi động
  FALLBACK_TO_MOCK: true,
};
