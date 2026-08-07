package top.sharpcaterpillar.teamsync.entity;

import com.baomidou.mybatisplus.annotation.IdType;
import com.baomidou.mybatisplus.annotation.TableId;
import com.baomidou.mybatisplus.annotation.TableName;
import lombok.Data;

import java.time.LocalDateTime;

/**
 * 周期计划负责人关联表。
 */
@Data
@TableName("pm_recurring_plan_assignee")
public class PmRecurringPlanAssignee {

    @TableId(type = IdType.AUTO)
    private Long id;

    private Long planId;

    private Long userId;

    /**
     * RESPONSIBLE:负责人。
     */
    private String role;

    private LocalDateTime createdAt;
}
