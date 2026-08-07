package top.sharpcaterpillar.teamsync.dto;

import lombok.Data;
import java.time.LocalDateTime;

/**
 * 子任务请求 DTO
 */
@Data
public class SubTaskRequest {

    /**
     * 子任务内容
     */
    private String content;

    /**
     * 状态 0:未开始 1:已完成 2:处理中
     */
    private Integer status;

    /**
     * 截止时间
     */
    private LocalDateTime dueTime;

    /**
     * 是否清除截止时间
     */
    private Boolean clearDueTime;

}
