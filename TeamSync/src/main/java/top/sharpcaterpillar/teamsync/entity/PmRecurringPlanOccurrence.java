package top.sharpcaterpillar.teamsync.entity;

import com.baomidou.mybatisplus.annotation.IdType;
import com.baomidou.mybatisplus.annotation.TableId;
import com.baomidou.mybatisplus.annotation.TableName;
import lombok.Data;

import java.time.LocalDateTime;

/**
 * 周期计划执行实例。
 */
@Data
@TableName("pm_recurring_plan_occurrence")
public class PmRecurringPlanOccurrence {

    @TableId(type = IdType.AUTO)
    private Long id;

    private Long planId;

    private Integer occurrenceNo;

    private String title;

    private String status;

    private LocalDateTime scheduledStartAt;

    private LocalDateTime dueTime;

    private LocalDateTime completedAt;

    private Long completedBy;

    private Long generatedTaskId;

    private String assigneeSnapshot;

    private String notes;

    private LocalDateTime createdAt;

    private LocalDateTime updatedAt;
}
