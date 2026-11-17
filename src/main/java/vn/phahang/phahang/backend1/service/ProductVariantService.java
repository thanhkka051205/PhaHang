package vn.phahang.phahang.backend1.service;

import java.util.List;
import java.util.Optional;

import org.springframework.stereotype.Service;

import vn.phahang.phahang.backend1.domain.Product;
import vn.phahang.phahang.backend1.domain.ProductVariant;
import vn.phahang.phahang.backend1.dto.ProductVariantRequestDTO;
import vn.phahang.phahang.backend1.dto.ProductVariantResponseDTO;
import vn.phahang.phahang.backend1.repository.ProductRepository;
import vn.phahang.phahang.backend1.repository.ProductVariantRepository;

@Service
public class ProductVariantService {
    private final ProductVariantRepository variantRepository;
    private final ProductRepository productRepository;

    public ProductVariantService(ProductVariantRepository variantRepository, ProductRepository productRepository) {
        this.variantRepository = variantRepository;
        this.productRepository = productRepository;
    }
    //Lấy tất cả phiên bản trong bảng Product_Variants
    public List<ProductVariant> getAllVariants() {
        return variantRepository.findAll();
    }
    //Lấy phiên bản theo ID
    public Optional<ProductVariant> getVariantById(Integer id) {
        return variantRepository.findById(id);
    }
    //Lấy phiên bản theo sản phẩm
    public List<ProductVariant> getVariantsByProductId(Integer productId) {
        return variantRepository.findByProduct_ProductId(productId);
    }
    // Thêm phiên bản
    public ProductVariant createVariant(ProductVariantRequestDTO request) {
        Product product = productRepository.findById(request.getProductId())
                .orElseThrow(() -> new RuntimeException("Không tìm thấy sản phẩm"));
        ProductVariant variant = new ProductVariant();
        variant.setProduct(product);
        variant.setSpec(request.getSpec());
        variant.setColor(request.getColor());
        variant.setPrice(request.getPrice());
        variant.setStockQty(request.getStockQty());
        return variantRepository.save(variant);
    }
    // Cập nhật phiên bản
    public Optional<ProductVariant> updateVariant(Integer id, ProductVariantRequestDTO request) {
        return variantRepository.findById(id).map(variant -> {
            Product product = productRepository.findById(request.getProductId())
                    .orElseThrow(() -> new RuntimeException("Không tìm thấy sản phẩm"));
            variant.setProduct(product);
            variant.setSpec(request.getSpec());
            variant.setColor(request.getColor());
            variant.setPrice(request.getPrice());
            variant.setStockQty(request.getStockQty());
            return variantRepository.save(variant);
        });
    }
    // Xóa phiên bản
    public void deleteVariant(Integer id) {
        variantRepository.deleteById(id);
    }
    // Chuyển Entity sang DTO
    public ProductVariantResponseDTO convertToDTO(ProductVariant variant) {
        ProductVariantResponseDTO dto = new ProductVariantResponseDTO();
        dto.setVariantId(variant.getVariantId());
        dto.setProductId(variant.getProduct().getProductId());
        dto.setProductName(variant.getProduct().getName());
        dto.setSpec(variant.getSpec());
        dto.setColor(variant.getColor());
        dto.setPrice(variant.getPrice());
        dto.setStockQty(variant.getStockQty());
        return dto;
    }
}


    

