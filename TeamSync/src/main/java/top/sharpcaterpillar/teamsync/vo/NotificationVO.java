package top.sharpcaterpillar.teamsync.vo;

import lombok.Data;

import java.time.LocalDateTime;

/**
 * 站内通知响应对象。
 */
@Data
public class NotificationVO {

    private Long id;

    private Long userId;

    private String type;

    private String title;

    private String content;

    private String sourceType;

    private Long sourceId;

    private String targetPath;

    private Long actorId;

    private Boolean read;

    private LocalDateTime readAt;

    private LocalDateTime createdAt;
}
