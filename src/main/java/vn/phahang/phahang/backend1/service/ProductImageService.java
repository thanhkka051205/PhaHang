package vn.phahang.phahang.backend1.service;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import vn.phahang.phahang.backend1.domain.Product;
import vn.phahang.phahang.backend1.domain.ProductImage;
import vn.phahang.phahang.backend1.dto.ProductImageRequestDTO;
import vn.phahang.phahang.backend1.dto.ProductImageResponseDTO;
import vn.phahang.phahang.backend1.repository.ProductImageRepository;
import vn.phahang.phahang.backend1.repository.ProductRepository;

@Service
public class ProductImageService {
    private final ProductImageRepository imageRepository;
    private final ProductRepository productRepository;
    // Lấy đường dẫn thư mục lưu ảnh từ application.properties
    @Value("${app.upload.dir}")
    private String uploadDir;
    private static final long MAX_FILE_SIZE = 2 * 1024 * 1024;
    private static final int MAX_IMAGES = 5;
    public ProductImageService(ProductImageRepository imageRepository, ProductRepository productRepository) {
        this.imageRepository = imageRepository;
        this.productRepository = productRepository;
    }

    // Lấy tất cả ảnh trong bảng Product_Images
    public List<ProductImage> getAllImages() {
        return imageRepository.findAll();
    }

    // Lấy ảnh theo ID
    public Optional<ProductImage> getImageById(Integer id) {
        return imageRepository.findById(id);
    }

    // Lấy danh sách ảnh theo sản phẩm và sắp xếp theo thứ tự
    public List<ProductImage> getImagesByProductId(Integer productId) {
        return imageRepository.findByProduct_ProductIdOrderBySortOrderAsc(productId);
    }

    // Kiểm tra số lượng ảnh hiện có của sản phẩm
    private void checkImageLimit(Integer productId) {
        int imageCount = getImagesByProductId(productId).size();
        if (imageCount >= MAX_IMAGES) {
            throw new RuntimeException("Mỗi sản phẩm chỉ được phép có tối đa 5 ảnh");
        }
    }

    // Kiểm tra định dạng và dung lượng file ảnh
    private void validateImage(MultipartFile file) {
        // Kiểm tra file có tồn tại và không bị rỗng
        if (file == null || file.isEmpty()) {
            throw new RuntimeException("Vui lòng chọn ảnh cần tải lên");
        }
        // Kiểm tra dung lượng file không vượt quá 2 MB
        if (file.getSize() > MAX_FILE_SIZE) {
            throw new RuntimeException("Dung lượng ảnh không được vượt quá 2 MB");
        }
        // Chỉ chấp nhận định dạng JPEG và PNG
        String contentType = file.getContentType();
        if (contentType == null ||
                !(contentType.equalsIgnoreCase("image/jpeg")
                        || contentType.equalsIgnoreCase("image/png"))) {
            throw new RuntimeException("Chỉ chấp nhận ảnh JPG, JPEG hoặc PNG");
        }
    }

    // Lưu ảnh vào thư mục riêng của từng sản phẩm
    private String saveImageFile(MultipartFile file, Integer productId) {
        try {
            // Lấy thư mục gốc lưu ảnh và chuẩn hóa đường dẫn
            Path uploadPath = Paths.get(uploadDir)
                    .toAbsolutePath()
                    .normalize();
            // Tạo thư mục riêng theo ID sản phẩm
            Path productPath = uploadPath.resolve("product-" + productId)
                    .normalize();
            // Kiểm tra thư mục sản phẩm nằm trong thư mục upload
            if (!productPath.startsWith(uploadPath)) {
                throw new RuntimeException("Đường dẫn lưu ảnh không hợp lệ");
            }
            // Tự động tạo thư mục nếu chưa tồn tại
            Files.createDirectories(productPath);
            // Xác định phần mở rộng của ảnh
            String extension = file.getContentType().equalsIgnoreCase("image/png")
                    ? ".png"
                    : ".jpg";
            // Tạo tên file ngẫu nhiên để tránh trùng tên
            String fileName = UUID.randomUUID().toString() + extension;
            // Tạo đường dẫn đầy đủ của file ảnh
            Path filePath = productPath.resolve(fileName).normalize();
            // Kiểm tra file nằm trong thư mục sản phẩm
            if (!filePath.startsWith(productPath)) {
                throw new RuntimeException("Đường dẫn file không hợp lệ");
            }
            // Lưu file ảnh vào máy chủ
            Files.copy(file.getInputStream(), filePath);
            // Trả về đường dẫn để lưu vào database
            return "/uploads/" + "product-" + productId + "/" + fileName;
        } catch (IOException e) {
            throw new RuntimeException("Không thể lưu ảnh lên máy chủ", e);
        }
    }

    // Upload ảnh sản phẩm từ máy tính lên máy chủ
    @Transactional
    public ProductImage uploadImage(Integer productId, MultipartFile file, Integer sortOrder) {
        // Kiểm tra sản phẩm có tồn tại hay không
        Product product = productRepository.findById(productId)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy sản phẩm"));
        // Kiểm tra giới hạn 5 ảnh
        checkImageLimit(productId);
        // Kiểm tra định dạng và dung lượng ảnh
        validateImage(file);
        // Lấy thứ tự ảnh tiếp theo
        int nextSortOrder = getImagesByProductId(productId).stream()
                .map(ProductImage::getSortOrder)
                .filter(order -> order != null)
                .max(Integer::compareTo)
                .orElse(-1) + 1;
        // Nếu người dùng không truyền sortOrder thì tự tăng
        int finalSortOrder = sortOrder != null
                ? sortOrder
                : nextSortOrder;
        // Lưu file vào thư mục riêng của sản phẩm
        String imagePath = saveImageFile(file, productId);
        try {
            // Tạo đối tượng ProductImage
            ProductImage image = new ProductImage();
            image.setProduct(product);
            image.setImagePath(imagePath);
            image.setSortOrder(finalSortOrder);
            // Lưu thông tin ảnh vào database
            return imageRepository.save(image);
        } catch (RuntimeException e) {
            // Nếu lưu database thất bại thì xóa file vừa upload
            deleteImageFile(imagePath);
            throw e;
        }
    }

    // Upload nhiều ảnh cho một sản phẩm
    @Transactional
    public List<ProductImage> uploadMultipleImages(Integer productId, List<MultipartFile> files) {
        if (files == null || files.isEmpty()) {
            throw new RuntimeException("Vui lòng chọn ít nhất một ảnh");
        }
        Product product = productRepository.findById(productId)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy sản phẩm"));
        List<ProductImage> existingImages = getImagesByProductId(productId);
        // Kiểm tra tổng số ảnh sau khi upload không vượt quá 5
        if (existingImages.size() + files.size() > MAX_IMAGES) {
            throw new RuntimeException(
                    "Sản phẩm hiện có " + existingImages.size()
                    + " ảnh. Chỉ được upload thêm tối đa "
                    + (MAX_IMAGES - existingImages.size()) + " ảnh");
        }
        // Kiểm tra tất cả ảnh trước khi lưu bất kỳ file nào
        for (MultipartFile file : files) {
            validateImage(file);
        }
        // Xác định thứ tự bắt đầu của ảnh mới
        int nextSortOrder = existingImages.stream()
                .map(ProductImage::getSortOrder)
                .filter(order -> order != null)
                .max(Integer::compareTo)
                .orElse(-1) + 1;
        // Danh sách đường dẫn file đã lưu để xử lý nếu có lỗi
        List<String> savedImagePaths = new ArrayList<>();
        try {
            // Danh sách đối tượng ảnh để lưu vào database
            List<ProductImage> images = new ArrayList<>();
            for (int i = 0; i < files.size(); i++) {
                MultipartFile file = files.get(i);
                // Lưu file ảnh vào thư mục sản phẩm
                String imagePath = saveImageFile(file, productId);
                savedImagePaths.add(imagePath);
                // Tạo thông tin ảnh
                ProductImage image = new ProductImage();
                image.setProduct(product);
                image.setImagePath(imagePath);
                image.setSortOrder(nextSortOrder + i);
                images.add(image);
            }
            // Lưu danh sách ảnh vào database
            return imageRepository.saveAll(images);
        } catch (RuntimeException e) {
            // Nếu xảy ra lỗi, xóa các file đã lưu trong request này
            for (String imagePath : savedImagePaths) {
                try {
                    deleteImageFile(imagePath);
                } catch (RuntimeException cleanupException) {
                    e.addSuppressed(cleanupException);
                }
            }
            throw e;
        }
    }

    // Thêm ảnh bằng đường dẫn có sẵn (giữ chức năng cũ)
    public ProductImage createImage(ProductImageRequestDTO request) {
        // Kiểm tra sản phẩm có tồn tại hay không
        Product product = productRepository.findById(request.getProductId())
                .orElseThrow(() -> new RuntimeException("Không tìm thấy sản phẩm"));
        // Kiểm tra giới hạn 5 ảnh
        checkImageLimit(request.getProductId());
        // Tạo đối tượng ảnh
        ProductImage image = new ProductImage();
        image.setProduct(product);
        image.setImagePath(request.getImagePath());
        image.setSortOrder(request.getSortOrder() != null ? request.getSortOrder() : 0);
        return imageRepository.save(image);
    }

    // Cập nhật thông tin ảnh
    public Optional<ProductImage> updateImage(Integer id, ProductImageRequestDTO request) {
        return imageRepository.findById(id).map(image -> {
            // Kiểm tra sản phẩm mới có tồn tại hay không
            Product product = productRepository.findById(request.getProductId())
                    .orElseThrow(() -> new RuntimeException("Không tìm thấy sản phẩm"));
            // Nếu chuyển ảnh sang sản phẩm khác thì kiểm tra giới hạn ảnh
            if (!image.getProduct().getProductId().equals(product.getProductId())) {
                checkImageLimit(product.getProductId());
            }
            // Cập nhật thông tin ảnh
            image.setProduct(product);
            image.setImagePath(request.getImagePath());
            image.setSortOrder(request.getSortOrder() != null ? request.getSortOrder() : 0);
            return imageRepository.save(image);
        });
    }
    // Xóa file ảnh trên máy chủ
    private void deleteImageFile(String imagePath) {
        try {
            // Chỉ xử lý file có đường dẫn do API upload tạo ra
            if (imagePath == null || !imagePath.startsWith("/uploads/")) {
                return;
            }
            // Lấy tên file và thư mục sản phẩm từ đường dẫn
            String relativePath = imagePath.substring("/uploads/".length());
            // Lấy thư mục gốc lưu ảnh
            Path uploadPath = Paths.get(uploadDir)
                    .toAbsolutePath()
                    .normalize();
            // Tạo đường dẫn file cần xóa
            Path filePath = uploadPath.resolve(relativePath).normalize();
            // Đảm bảo file nằm trong thư mục upload
            if (filePath.startsWith(uploadPath)) {
                Files.deleteIfExists(filePath);
            }
        } catch (IOException e) {
            throw new RuntimeException("Không thể xóa file ảnh", e);
        }
    }

    // Xóa ảnh trong database và file ảnh trên máy chủ
    @Transactional
    public void deleteImage(Integer id) {
        // Tìm ảnh cần xóa
        ProductImage image = imageRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy ảnh"));
        // Xóa file ảnh trên máy chủ
        deleteImageFile(image.getImagePath());
        // Xóa thông tin ảnh trong database
        imageRepository.delete(image);
    }

    // Chuyển Entity sang DTO
    public ProductImageResponseDTO convertToDTO(ProductImage image) {
        ProductImageResponseDTO dto = new ProductImageResponseDTO();
        dto.setImageId(image.getImageId());
        dto.setProductId(image.getProduct().getProductId());
        dto.setImagePath(image.getImagePath());
        dto.setSortOrder(image.getSortOrder());
        return dto;
    }
}