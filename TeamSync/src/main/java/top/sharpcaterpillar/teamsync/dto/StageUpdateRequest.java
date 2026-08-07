package top.sharpcaterpillar.teamsync.dto;

import lombok.Data;

/**
 * 更新阶段请求 DTO
 */
@Data
public class StageUpdateRequest {

    /**
     * 阶段名称
     */
    private String name;

    /**
     * 排序号（从小到大排列）
     */
    private Integer sort;

}
