package vn.phahang.phahang.backend1.service;

import java.math.BigDecimal;
import java.util.List;
import java.util.Optional;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import vn.phahang.phahang.backend1.domain.Category;
import vn.phahang.phahang.backend1.domain.Product;
import vn.phahang.phahang.backend1.domain.ProductImage;
import vn.phahang.phahang.backend1.domain.ProductVariant;
import vn.phahang.phahang.backend1.dto.ProductDetailResponseDTO;
import vn.phahang.phahang.backend1.dto.ProductRequestDTO;
import vn.phahang.phahang.backend1.dto.ProductResponseDTO;
import vn.phahang.phahang.backend1.dto.ProductVariantResponseDTO;
import vn.phahang.phahang.backend1.repository.CategoryRepository;
import vn.phahang.phahang.backend1.repository.ProductImageRepository;
import vn.phahang.phahang.backend1.repository.ProductRepository;
import vn.phahang.phahang.backend1.repository.ProductVariantRepository;

@Service
@Transactional(readOnly = true)
public class ProductService {
    private final ProductRepository productRepository;
    private final CategoryRepository categoryRepository;
    private final ProductImageRepository imageRepository;
    private final ProductVariantRepository variantRepository;

    // Constructor
    public ProductService(ProductRepository productRepository, CategoryRepository categoryRepository, ProductImageRepository imageRepository, ProductVariantRepository variantRepository) {
        this.productRepository = productRepository;
        this.categoryRepository = categoryRepository;
        this.imageRepository = imageRepository;
        this.variantRepository = variantRepository;
    }

    // Lấy tất cả sản phẩm đang hiển thị và có biến thể
    public List<Product> getAllProducts() {
        return productRepository.findAll().stream()
                .filter(product -> Boolean.TRUE.equals(product.getIsVisible()))
                .filter(product -> hasVariants(product.getProductId()))
                .toList();
    }

    // Lấy sản phẩm theo ID
    public Optional<Product> getProductById(Integer id) {
        return productRepository.findById(id)
                .filter(product -> Boolean.TRUE.equals(product.getIsVisible()))
                .filter(product -> hasVariants(product.getProductId()));
    }

    // Thêm sản phẩm
    @Transactional
    public Product createProduct(ProductRequestDTO request) {
        Category category = categoryRepository.findById(request.getCategoryId())
                .orElseThrow(() -> new RuntimeException("Không tìm thấy danh mục"));
        Product product = new Product();
        product.setCategory(category);
        product.setName(request.getName());
        product.setBrand(request.getBrand());
        product.setDescription(request.getDescription());
        product.setWarrantyMonths(request.getWarrantyMonths() != null ? request.getWarrantyMonths() : 0);
        product.setTrackSerial(request.getTrackSerial() != null ? request.getTrackSerial() : false);
        product.setIsVisible(request.getIsVisible() != null ? request.getIsVisible() : true);
        return productRepository.save(product);
    }

    // Cập nhật sản phẩm
    @Transactional
    public Optional<Product> updateProduct(Integer id, ProductRequestDTO request) {
        return productRepository.findById(id).map(product -> {
            Category category = categoryRepository.findById(request.getCategoryId())
                    .orElseThrow(() -> new RuntimeException("Không tìm thấy danh mục"));
            product.setCategory(category);
            product.setName(request.getName());
            product.setBrand(request.getBrand());
            product.setDescription(request.getDescription());
            product.setWarrantyMonths(request.getWarrantyMonths() != null ? request.getWarrantyMonths() : 0);
            product.setTrackSerial(request.getTrackSerial() != null ? request.getTrackSerial() : false);
            product.setIsVisible(request.getIsVisible() != null ? request.getIsVisible() : true);
            return productRepository.save(product);
        });
    }

    // Kiểm tra sản phẩm có tồn tại hay không
    public boolean existsProduct(Integer id) {
        return productRepository.existsById(id);
    }

    // Xóa sản phẩm theo ID
    @Transactional
    public void deleteProduct(Integer id) {
        if (!productRepository.existsById(id)) {
            throw new RuntimeException("Không tìm thấy sản phẩm");
        }
        productRepository.deleteById(id);
    }

    // Lấy danh sách sản phẩm theo ID danh mục
    public List<Product> getProductsByCategoryId(Integer categoryId) {
        return productRepository.findByCategory_CategoryId(categoryId).stream()
                .filter(product -> Boolean.TRUE.equals(product.getIsVisible()))
                .filter(product -> hasVariants(product.getProductId()))
                .toList();
    }

    // Tìm kiếm sản phẩm theo tên hoặc thương hiệu (giữ phương thức cũ)
    public List<Product> searchProducts(String keyword) {
        return productRepository.searchProducts(keyword).stream()
                .filter(product -> Boolean.TRUE.equals(product.getIsVisible()))
                .filter(product -> hasVariants(product.getProductId()))
                .toList();
    }

    // Lọc sản phẩm theo thương hiệu, danh mục và giá (giữ phương thức cũ)
    public List<Product> filterProducts(
            String brand,
            Integer categoryId,
            BigDecimal minPrice,
            BigDecimal maxPrice) {
        return productRepository.filterProducts(brand, categoryId, minPrice, maxPrice).stream()
                .filter(product -> Boolean.TRUE.equals(product.getIsVisible()))
                .filter(product -> hasVariants(product.getProductId()))
                .toList();
    }

    // Lấy danh sách sản phẩm có phân trang, tìm kiếm và lọc kết hợp
    public Page<ProductResponseDTO> getProducts(
            String keyword,
            String brand,
            Integer categoryId,
            String spec,
            String color,
            BigDecimal minPrice,
            BigDecimal maxPrice,
            int page,
            int size,
            String sortDirection) {
        // Kiểm tra số trang
        if (page < 0) {
            throw new IllegalArgumentException("Số trang không được âm");
        }
        // Mỗi trang mặc định 12 sản phẩm và tối đa 12 sản phẩm
        if (size <= 0) {
            size = 12;
        }
        size = Math.min(size, 12);
        // Chuẩn hóa chiều sắp xếp
        sortDirection = sortDirection == null
                ? "asc"
                : sortDirection.trim().toLowerCase();
        if (!sortDirection.equals("asc") && !sortDirection.equals("desc")) {
            throw new IllegalArgumentException("Chiều sắp xếp chỉ nhận asc hoặc desc");
        }
        // Kiểm tra ID danh mục
        if (categoryId != null && categoryId <= 0) {
            throw new IllegalArgumentException("ID danh mục phải lớn hơn 0");
        }
        // Kiểm tra giá
        if ((minPrice != null && minPrice.compareTo(BigDecimal.ZERO) < 0)
                || (maxPrice != null && maxPrice.compareTo(BigDecimal.ZERO) < 0)) {
            throw new IllegalArgumentException("Giá không được âm");
        }
        if (minPrice != null && maxPrice != null
                && minPrice.compareTo(maxPrice) > 0) {
            throw new IllegalArgumentException(
                    "Giá thấp nhất không được lớn hơn giá cao nhất");
        }
        // Chuẩn hóa dữ liệu đầu vào
        keyword = normalize(keyword);
        brand = normalize(brand);
        spec = normalize(spec);
        color = normalize(color);
        Pageable pageable = PageRequest.of(page, size);
        Page<Product> products = productRepository.findProductsWithFilters(
                keyword,
                brand,
                categoryId,
                spec,
                color,
                minPrice,
                maxPrice,
                sortDirection,
                pageable);
        return products.map(this::convertToDTO);
    }

    // Chuẩn hóa chuỗi tìm kiếm và lọc
    private String normalize(String value) {
        if (value == null || value.trim().isEmpty()) {
            return null;
        }
        return value.trim();
    }

    // Kiểm tra sản phẩm có biến thể hay không
    private boolean hasVariants(Integer productId) {
        return !variantRepository.findByProduct_ProductId(productId).isEmpty();
    }

    // Chuyển Entity sang DTO danh sách sản phẩm
    public ProductResponseDTO convertToDTO(Product product) {
        ProductResponseDTO dto = new ProductResponseDTO();
        dto.setProductId(product.getProductId());
        dto.setName(product.getName());
        dto.setBrand(product.getBrand());
        if (product.getCategory() != null) {
            dto.setCategoryId(product.getCategory().getCategoryId());
            dto.setCategoryName(product.getCategory().getName());
        }
        // Lấy ảnh đầu tiên của sản phẩm
        List<ProductImage> images = imageRepository.findByProduct_ProductIdOrderBySortOrderAsc(product.getProductId());
        if (!images.isEmpty()) {
            dto.setImage(images.get(0).getImagePath());
        }
        // Lấy danh sách biến thể của sản phẩm
        List<ProductVariant> variants = variantRepository.findByProduct_ProductId(product.getProductId());
        // Lấy giá thấp nhất của sản phẩm
        BigDecimal minPrice = variants.stream()
                .map(ProductVariant::getPrice)
                .filter(price -> price != null)
                .min(BigDecimal::compareTo)
                .orElse(null);
        dto.setPrice(minPrice);
        return dto;
    }

    // Chuyển Entity sang DTO chi tiết sản phẩm
    public ProductDetailResponseDTO convertToDetailDTO(Product product) {
        ProductDetailResponseDTO dto = new ProductDetailResponseDTO();
        dto.setProductId(product.getProductId());
        dto.setName(product.getName());
        dto.setBrand(product.getBrand());
        dto.setDescription(product.getDescription());
        dto.setWarrantyMonths(product.getWarrantyMonths());
        if (product.getCategory() != null) {
            dto.setCategoryId(product.getCategory().getCategoryId());
            dto.setCategoryName(product.getCategory().getName());
        }

        // Lấy tối đa 5 hình ảnh theo thứ tự sắp xếp
        List<String> images = imageRepository
                .findByProduct_ProductIdOrderBySortOrderAsc(product.getProductId())
                .stream()
                .limit(5)
                .map(ProductImage::getImagePath)
                .toList();
        dto.setImages(images);

        // Lấy danh sách phiên bản sản phẩm
        List<ProductVariant> variants = variantRepository.findByProduct_ProductId(product.getProductId());
        List<ProductVariantResponseDTO> variantDTOs = variants.stream()
                .map(variant -> {
                    ProductVariantResponseDTO variantDTO = new ProductVariantResponseDTO();
                    variantDTO.setVariantId(variant.getVariantId());
                    variantDTO.setProductId(product.getProductId());
                    variantDTO.setProductName(product.getName());
                    variantDTO.setSpec(variant.getSpec());
                    variantDTO.setColor(variant.getColor());
                    variantDTO.setPrice(variant.getPrice());
                    variantDTO.setStockQty(variant.getStockQty());
                    return variantDTO;
                })
                .toList();
        dto.setVariants(variantDTOs);
        return dto;
    }
}