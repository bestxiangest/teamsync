package top.sharpcaterpillar.teamsync.vo;

import lombok.Data;

import java.time.LocalDateTime;

/**
 * 日历事件响应对象。
 */
@Data
public class CalendarEventVO {

    private String id;

    private String sourceType;

    private Long sourceId;

    private String title;

    private LocalDateTime startTime;

    private LocalDateTime endTime;

    private LocalDateTime dueTime;

    private Boolean allDay;

    private String status;

    private Integer priority;

    private Long projectId;

    private String projectName;

    private String colorType;

    private Boolean overdue;

    private String targetPath;
}
