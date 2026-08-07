package top.sharpcaterpillar.teamsync.dto;

import lombok.Data;
import top.sharpcaterpillar.teamsync.vo.RecurringPlanOccurrenceVO;

/**
 * 周期计划生成任务响应。
 */
@Data
public class RecurringPlanGenerateTaskResponse {

    private Long planId;

    private Long occurrenceId;

    private Integer occurrenceNo;

    private Long projectId;

    private Long stageId;

    private Long generatedTaskId;

    private Boolean reused;

    private TaskDTO task;

    private RecurringPlanOccurrenceVO occurrence;
}
