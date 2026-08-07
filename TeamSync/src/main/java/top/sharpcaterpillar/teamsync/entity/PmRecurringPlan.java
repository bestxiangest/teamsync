package top.sharpcaterpillar.teamsync.entity;

import com.baomidou.mybatisplus.annotation.IdType;
import com.baomidou.mybatisplus.annotation.TableId;
import com.baomidou.mybatisplus.annotation.TableLogic;
import com.baomidou.mybatisplus.annotation.TableName;
import lombok.Data;

import java.time.LocalDateTime;

/**
 * 周期计划表。
 */
@Data
@TableName("pm_recurring_plan")
public class PmRecurringPlan {

    @TableId(type = IdType.AUTO)
    private Long id;

    /**
     * 可选关联项目，允许周期计划独立存在。
     */
    private Long projectId;

    /**
     * 可选关联看板列，用于后续自动生成项目任务。
     */
    private Long stageId;

    private String title;

    private String description;

    /**
     * 优先级 1:普通 2:紧急 3:非常紧急。
     */
    private Integer priority;

    /**
     * ACTIVE/PAUSED/FINISHED。
     */
    private String status;

    /**
     * DAY/WEEK/MONTH/QUARTER/HALF_YEAR/YEAR。
     */
    private String recurrenceUnit;

    /**
     * 周期间隔数量，例如 recurrenceUnit=MONTH 且 intervalCount=3 表示每三个月。
     */
    private Integer intervalCount;

    /**
     * 首次计划开始时间，也是后续周期计算锚点。
     */
    private LocalDateTime startTime;

    /**
     * 首次计划截止时间，用于推算后续实例截止时间。
     */
    private LocalDateTime dueTime;

    /**
     * 周期计划结束时间，空表示长期有效。
     */
    private LocalDateTime endTime;

    /**
     * 下一次应执行时间。
     */
    private LocalDateTime nextRunAt;

    /**
     * 最近一次生成/执行时间。
     */
    private LocalDateTime lastRunAt;

    private String timezone;

    private Boolean reminderEnabled;

    private Integer reminderMinutesBefore;

    /**
     * 后续是否自动创建看板任务。
     */
    private Boolean autoCreateTask;

    /**
     * 最多生成次数，空表示不限制。
     */
    private Integer maxOccurrences;

    /**
     * 已生成次数。
     */
    private Integer generatedCount;

    private Long creatorId;

    @TableLogic
    private Integer isDeleted;

    private LocalDateTime createdAt;

    private LocalDateTime updatedAt;
}
