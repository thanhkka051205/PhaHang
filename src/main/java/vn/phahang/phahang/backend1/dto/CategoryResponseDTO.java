package vn.phahang.phahang.backend1.dto;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class CategoryResponseDTO {
    private Integer categoryId;
    private String name;
    private Integer parentId;
    private String parentName;
}