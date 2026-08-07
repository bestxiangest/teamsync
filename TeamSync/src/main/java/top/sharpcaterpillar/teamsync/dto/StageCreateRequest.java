package top.sharpcaterpillar.teamsync.dto;

import lombok.Data;

/**
 * 创建阶段请求 DTO
 */
@Data
public class StageCreateRequest {

    /**
     * 项目ID
     */
    private Long projectId;

    /**
     * 阶段名称
     */
    private String name;

}

