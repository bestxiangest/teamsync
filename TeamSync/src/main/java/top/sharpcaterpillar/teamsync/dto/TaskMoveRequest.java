package top.sharpcaterpillar.teamsync.dto;

import lombok.Data;

/**
 * 任务移动请求 DTO
 */
@Data
public class TaskMoveRequest {

    /**
     * 目标阶段ID
     */
    private Long targetStageId;

    /**
     * 新的排序索引
     */
    private Integer newSort;

}

