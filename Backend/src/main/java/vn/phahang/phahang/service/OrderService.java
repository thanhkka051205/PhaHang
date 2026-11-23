
package vn.phahang.phahang.service;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import vn.phahang.phahang.domain.CartItem;
import vn.phahang.phahang.domain.Order;
import vn.phahang.phahang.domain.OrderItem;
import vn.phahang.phahang.domain.ProductVariant;
import vn.phahang.phahang.domain.User;
import vn.phahang.phahang.dto.OrderItemResponseDTO;
import vn.phahang.phahang.dto.OrderRequestDTO;
import vn.phahang.phahang.dto.OrderResponseDTO;
import vn.phahang.phahang.repository.CartItemRepository;
import vn.phahang.phahang.repository.OrderItemRepository;
import vn.phahang.phahang.repository.OrderRepository;
import vn.phahang.phahang.repository.ProductVariantRepository;
import vn.phahang.phahang.repository.UserRepository;

@Service
@Transactional(readOnly = true)
public class OrderService {

    private final OrderRepository orderRepository;
    private final OrderItemRepository orderItemRepository;
    private final CartItemRepository cartItemRepository;
    private final ProductVariantRepository variantRepository;
    private final UserRepository userRepository;

    public OrderService(OrderRepository orderRepository,OrderItemRepository orderItemRepository, CartItemRepository cartItemRepository, ProductVariantRepository variantRepository, UserRepository userRepository) {
        this.orderRepository = orderRepository;
        this.orderItemRepository = orderItemRepository;
        this.cartItemRepository = cartItemRepository;
        this.variantRepository = variantRepository;
        this.userRepository = userRepository;
    }

    // tạo đơn hàng từ giỏ hàng của người dùng
    @Transactional
    public OrderResponseDTO createOrder(String email, OrderRequestDTO request) {
        User user = getUserByEmail(email);
        List<CartItem> cartItems = cartItemRepository.findByUser_UserId(user.getUserId());
        if (cartItems.isEmpty()) {
            throw new RuntimeException("Giỏ hàng đang trống, không thể tạo đơn hàng");
        }
        Order order = new Order();
        order.setUser(user);
        order.setStatus("pending");
        order.setDiscountAmount(BigDecimal.ZERO);
        order.setReceiverName(request.getReceiverName().trim());
        order.setReceiverPhone(request.getReceiverPhone().trim());
        order.setShipAddress(request.getShipAddress().trim());
        BigDecimal totalAmount = BigDecimal.ZERO;
        List<OrderItem> orderItems = new ArrayList<>();
        // Kiểm tra sản phẩm và lấy giá hiện tại từ database
        for (CartItem cartItem : cartItems) {
            Integer variantId = cartItem.getProductVariant().getVariantId();
            ProductVariant variant = variantRepository.findById(variantId)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy biến thể sản phẩm ID: " + variantId));
            Integer quantity = cartItem.getQuantity();
            if (quantity == null || quantity <= 0) {
                throw new RuntimeException("Số lượng sản phẩm không hợp lệ");
            }
            if (!Boolean.TRUE.equals(variant.getProduct().getIsVisible())) {
                throw new RuntimeException("Sản phẩm hiện không được kinh doanh");
            }
            if (variant.getPrice() == null|| variant.getPrice().compareTo(BigDecimal.ZERO) < 0) {
                throw new RuntimeException("Giá sản phẩm không hợp lệ");
            }
            BigDecimal subtotal = variant.getPrice().multiply(BigDecimal.valueOf(quantity));
            totalAmount = totalAmount.add(subtotal);
            OrderItem orderItem = new OrderItem();
            orderItem.setOrder(order);
            orderItem.setProductVariant(variant);
            orderItem.setQuantity(quantity);
            orderItem.setUnitPrice(variant.getPrice());
            orderItems.add(orderItem);
        }

        order.setTotalAmount(totalAmount);
        Order savedOrder = orderRepository.save(order);
        // Lưu chi tiết sản phẩm của đơn hàng
        for (OrderItem orderItem : orderItems) {
            orderItem.setOrder(savedOrder);
            orderItemRepository.save(orderItem);
        }
        // Xóa giỏ hàng sau khi tạo đơn hàng thành công
        cartItemRepository.deleteByUser_UserId(user.getUserId());
        return toDTO(savedOrder, orderItems);
    }

    // lấy danh sách đơn hàng của người dùng
    public List<OrderResponseDTO> getMyOrders(String email) {
        User user = getUserByEmail(email);
        return orderRepository
            .findByUser_UserIdOrderByCreatedAtDesc(user.getUserId())
            .stream()
            .map(order -> toDTO(order, orderItemRepository.findByOrder_OrderId(order.getOrderId())))
            .toList();
    }

    // lấy chi tiết đơn hàng
    public OrderResponseDTO getOrderById(String email, Integer orderId) {
        User user = getUserByEmail(email);
        Order order = orderRepository
            .findByOrderIdAndUser_UserId(orderId, user.getUserId())
            .orElseThrow(() -> new RuntimeException("Không tìm thấy đơn hàng hoặc bạn không có quyền xem đơn hàng này"));
        return toDTO(order,orderItemRepository.findByOrder_OrderId(orderId));
    }

    // lấy danh sách sản phẩm trong đơn hàng
    public List<OrderItemResponseDTO> getOrderItems(String email, Integer orderId) {
        User user = getUserByEmail(email);
        Order order = orderRepository
            .findByOrderIdAndUser_UserId(orderId, user.getUserId())
            .orElseThrow(() -> new RuntimeException("Không tìm thấy đơn hàng hoặc bạn không có quyền xem đơn hàng này"));
        return orderItemRepository
                .findByOrder_OrderId(order.getOrderId())
                .stream()
                .map(this::toItemDTO)
                .toList();
    }

    // Hủy đơn hàng của người dùng
    @Transactional
    public OrderResponseDTO cancelOrder(String email, Integer orderId) {
        User user = getUserByEmail(email);
        Order order = orderRepository
                .findByOrderIdAndUser_UserId(orderId, user.getUserId())
                .orElseThrow(() -> new RuntimeException( "Không tìm thấy đơn hàng hoặc bạn không có quyền hủy đơn hàng này"));
        if (!"pending".equalsIgnoreCase(order.getStatus())) {
            throw new RuntimeException("Chỉ có thể hủy đơn hàng đang chờ xác nhận");
        }
        order.setStatus("cancelled");
        Order updatedOrder = orderRepository.save(order);
        List<OrderItem> orderItems = orderItemRepository.findByOrder_OrderId(orderId);
        return toDTO(updatedOrder, orderItems);
    }

    // Tra cứu đơn hàng bằng mã đơn và số điện thoại người nhận
    public OrderResponseDTO lookupOrder(Integer orderId, String receiverPhone) {
        if (orderId == null || orderId <= 0) {
            throw new RuntimeException("Mã đơn hàng không hợp lệ");
        }
        if (receiverPhone == null || receiverPhone.trim().isEmpty()) {
            throw new RuntimeException("Vui lòng nhập số điện thoại nhận hàng");
        }
        Order order = orderRepository
            .findByOrderIdAndReceiverPhone(orderId, receiverPhone.trim())
            .orElseThrow(() -> new RuntimeException("Không tìm thấy đơn hàng với mã đơn và số điện thoại đã cung cấp"));
        List<OrderItem> orderItems = orderItemRepository.findByOrder_OrderId(order.getOrderId());
        return toDTO(order, orderItems);
    }

    // Lấy danh sách đơn hàng dành cho Admin có lọc và phân trang
    public Page<OrderResponseDTO> getAllOrdersForAdmin(
            String status,
            LocalDateTime fromDate,
            LocalDateTime toDate,
            Integer orderId,
            String receiverPhone,
            Pageable pageable) {
        if (fromDate != null && toDate != null && fromDate.isAfter(toDate)) {
            throw new RuntimeException("Ngày bắt đầu không được lớn hơn ngày kết thúc");
        }
        if (orderId != null && orderId <= 0) {
            throw new RuntimeException("Mã đơn hàng không hợp lệ");
        }
        String searchStatus = (status == null || status.trim().isEmpty())
                ? null : status.trim();
        String searchPhone = (receiverPhone == null || receiverPhone.trim().isEmpty())
                ? null : receiverPhone.trim();
        return orderRepository.searchAdminOrders(
                searchStatus,
                fromDate,
                toDate,
                orderId,
                searchPhone,
                pageable
        ).map(order -> toDTO(
                order,
                orderItemRepository.findByOrder_OrderId(order.getOrderId())
        ));
    }

    // Admin cập nhật trạng thái đơn hàng
    @Transactional
    public OrderResponseDTO updateOrderStatus(Integer orderId, String newStatus) {
        if (newStatus == null || newStatus.trim().isEmpty()) {
            throw new RuntimeException("Trạng thái đơn hàng không được để trống");
        }
        String status = newStatus.trim().toLowerCase();
        if (!List.of("confirmed", "shipping", "completed", "cancelled").contains(status)) {
            throw new RuntimeException("Trạng thái đơn hàng không hợp lệ");
        }
        Order order = orderRepository.findByIdForUpdate(orderId)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy đơn hàng"));
        String currentStatus = order.getStatus().toLowerCase();
        List<OrderItem> orderItems = orderItemRepository.findByOrder_OrderId(orderId);
        // Admin xác nhận đơn hàng: kiểm tra và trừ tồn kho
        if ("pending".equals(currentStatus) && "confirmed".equals(status)) {
            for (OrderItem orderItem : orderItems) {
                Integer variantId = orderItem.getProductVariant().getVariantId();
                ProductVariant variant = variantRepository.findByIdForUpdate(variantId)
                    .orElseThrow(() -> new RuntimeException("Không tìm thấy biến thể sản phẩm ID: " + variantId));
                Integer quantity = orderItem.getQuantity();
                if (variant.getStockQty() == null || variant.getStockQty() < quantity) {
                    throw new RuntimeException(
                        "Sản phẩm " + variant.getProduct().getName()
                        + " không đủ tồn kho để xác nhận đơn hàng");
                }
                variant.setStockQty(variant.getStockQty() - quantity);
                variantRepository.save(variant);
            }
        }
        // Admin hủy đơn: chỉ hoàn kho nếu đơn đã được xác nhận
        if ("cancelled".equals(status)) {
            if (!"pending".equals(currentStatus) && !"confirmed".equals(currentStatus) && !"shipping".equals(currentStatus)) {
                throw new RuntimeException("Không thể hủy đơn hàng ở trạng thái hiện tại");
            }
            if ("confirmed".equals(currentStatus) || "shipping".equals(currentStatus)) {
                for (OrderItem orderItem : orderItems) {
                    Integer variantId = orderItem.getProductVariant().getVariantId();
                    ProductVariant variant = variantRepository.findByIdForUpdate(variantId)
                        .orElseThrow(() -> new RuntimeException("Không tìm thấy biến thể sản phẩm ID: " + variantId));
                    variant.setStockQty(variant.getStockQty() + orderItem.getQuantity());
                    variantRepository.save(variant);
                }
            }
        }

        // Kiểm tra quy trình chuyển trạng thái
        boolean validTransition =
                ("pending".equals(currentStatus) && "confirmed".equals(status))
                || ("confirmed".equals(currentStatus) && "shipping".equals(status))
                || ("shipping".equals(currentStatus) && "completed".equals(status))
                || ("pending".equals(currentStatus) && "cancelled".equals(status))
                || ("confirmed".equals(currentStatus) && "cancelled".equals(status))
                || ("shipping".equals(currentStatus) && "cancelled".equals(status));
        if (!validTransition) {
            throw new RuntimeException("Không thể chuyển trạng thái từ " + currentStatus + " sang " + status);
        }
        order.setStatus(status);
        Order updatedOrder = orderRepository.save(order);
        return toDTO(updatedOrder, orderItems);
    }

    // order sang OrderResponseDTO
    private OrderResponseDTO toDTO(Order order, List<OrderItem> orderItems) {
        OrderResponseDTO dto = new OrderResponseDTO();
        dto.setOrderId(order.getOrderId());
        dto.setUserId(order.getUser().getUserId());
        dto.setStatus(order.getStatus());
        dto.setDiscountAmount(order.getDiscountAmount());
        dto.setTotalAmount(order.getTotalAmount());
        dto.setReceiverName(order.getReceiverName());
        dto.setReceiverPhone(order.getReceiverPhone());
        dto.setShipAddress(order.getShipAddress());
        dto.setCreatedAt(order.getCreatedAt());
        dto.setItems(orderItems.stream()
            .map(this::toItemDTO)
            .toList());
        return dto;
    }

    // orderItem sang OrderResponseDTO
    private OrderItemResponseDTO toItemDTO(OrderItem item) {
        ProductVariant variant = item.getProductVariant();
        OrderItemResponseDTO dto = new OrderItemResponseDTO();
        dto.setOrderItemId(item.getOrderItemId());
        dto.setVariantId(variant.getVariantId());
        dto.setProductId(variant.getProduct().getProductId());
        dto.setProductName(variant.getProduct().getName());
        dto.setSpec(variant.getSpec());
        dto.setColor(variant.getColor());
        dto.setQuantity(item.getQuantity());
        dto.setUnitPrice(item.getUnitPrice());
        dto.setSubtotal(item.getUnitPrice().multiply(BigDecimal.valueOf(item.getQuantity())));
        dto.setSerialNo(item.getSerialNo());
        return dto;
    }

    // Tìm người dùng thông qua email trong JWT
    private User getUserByEmail(String email) {
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy người dùng"));
    }
}