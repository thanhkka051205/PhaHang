package vn.phahang.phahang.service;

import java.math.BigDecimal;
import java.util.List;
import java.util.Optional;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.web.servlet.support.ServletUriComponentsBuilder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import vn.phahang.phahang.domain.Category;
import vn.phahang.phahang.domain.Product;
import vn.phahang.phahang.domain.ProductImage;
import vn.phahang.phahang.domain.ProductVariant;
import vn.phahang.phahang.dto.ProductDetailResponseDTO;
import vn.phahang.phahang.dto.ProductRequestDTO;
import vn.phahang.phahang.dto.ProductResponseDTO;
import vn.phahang.phahang.dto.ProductVariantResponseDTO;
import vn.phahang.phahang.repository.CategoryRepository;
import vn.phahang.phahang.repository.ProductImageRepository;
import vn.phahang.phahang.repository.ProductRepository;
import vn.phahang.phahang.repository.ProductVariantRepository;

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
        Category category = categoryRepository.findById(request.resolveCategoryId())
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
            Category category = categoryRepository.findById(request.resolveCategoryId())
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
        Product product = productRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy sản phẩm"));
        product.setIsVisible(false);
        productRepository.save(product);
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
        if (!sortDirection.equals("asc") && !sortDirection.equals("desc")
                && !sortDirection.equals("newest")) {
            throw new IllegalArgumentException("Chiều sắp xếp không hợp lệ");
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
        dto.setId(product.getProductId());
        dto.setProductId(product.getProductId());
        dto.setName(product.getName());
        dto.setBrand(product.getBrand());
        dto.setDescription(product.getDescription());
        dto.setWarrantyMonths(product.getWarrantyMonths());
        dto.setTrackSerial(product.getTrackSerial());
        dto.setIsVisible(product.getIsVisible());
        if (product.getCategory() != null) {
            dto.setCategoryId(product.getCategory().getCategoryId());
            dto.setCategoryName(product.getCategory().getName());
        }
        List<ProductImage> productImages = imageRepository
                .findByProduct_ProductIdOrderBySortOrderAsc(product.getProductId());
        List<String> images = productImages.stream()
                .limit(5)
                .map(image -> toPublicImageUrl(image.getImagePath()))
                .toList();
        dto.setImages(images);
        if (!images.isEmpty()) {
            dto.setImage(images.get(0));
            dto.setImageUrl(images.get(0));
            dto.setThumbnail(images.get(0));
        }
        List<ProductVariant> variants = variantRepository.findByProduct_ProductId(product.getProductId());
        List<ProductVariantResponseDTO> variantDTOs = variants.stream()
                .map(this::convertVariantToDTO)
                .toList();
        dto.setVariants(variantDTOs);
        BigDecimal minPrice = variants.stream()
                .map(ProductVariant::getPrice)
                .filter(price -> price != null)
                .min(BigDecimal::compareTo)
                .orElse(null);
        dto.setPrice(minPrice);
        dto.setOriginalPrice(minPrice);
        return dto;
    }

    // Chuyển đổi Product sang ProductDetailResponseDTO
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

        List<String> images = imageRepository
                .findByProduct_ProductIdOrderBySortOrderAsc(product.getProductId())
                .stream()
                .limit(5)
                .map(image -> toPublicImageUrl(image.getImagePath()))
                .toList();
        dto.setImages(images);

        List<ProductVariantResponseDTO> variants = variantRepository
                .findByProduct_ProductId(product.getProductId())
                .stream()
                .map(this::convertVariantToDTO)
                .toList();
        dto.setVariants(variants);
        return dto;
    }

    // Chuyển đổi ProductVariant sang ProductVariantResponseDTO
    private ProductVariantResponseDTO convertVariantToDTO(ProductVariant variant) {
        ProductVariantResponseDTO dto = new ProductVariantResponseDTO();
        dto.setId(variant.getVariantId());
        dto.setVariantId(variant.getVariantId());
        dto.setProductId(variant.getProduct().getProductId());
        dto.setProductName(variant.getProduct().getName());
        dto.setName(variant.getSpec());
        dto.setSpec(variant.getSpec());
        dto.setColor(variant.getColor());
        dto.setPrice(variant.getPrice());
        dto.setListPrice(variant.getPrice());
        dto.setStockQty(variant.getStockQty());
        return dto;
    }

    // Chuyển đường dẫn ảnh thành URL công khai
    private String toPublicImageUrl(String imagePath) {
        if (imagePath == null || imagePath.isBlank()) {
            return imagePath;
        }
        if (imagePath.startsWith("http://") || imagePath.startsWith("https://")) {
            return imagePath;
        }
        try {
            String path = imagePath.startsWith("/") ? imagePath : "/" + imagePath;
            return ServletUriComponentsBuilder.fromCurrentContextPath()
                    .path(path)
                    .toUriString();
        } catch (IllegalStateException e) {
            return imagePath;
        }
    }

}