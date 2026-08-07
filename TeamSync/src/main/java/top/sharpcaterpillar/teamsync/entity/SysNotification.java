package top.sharpcaterpillar.teamsync.entity;

import com.baomidou.mybatisplus.annotation.IdType;
import com.baomidou.mybatisplus.annotation.TableId;
import com.baomidou.mybatisplus.annotation.TableName;
import lombok.Data;

import java.time.LocalDateTime;

/**
 * 站内通知。
 */
@Data
@TableName("sys_notification")
public class SysNotification {

    @TableId(type = IdType.AUTO)
    private Long id;

    private Long userId;

    private String type;

    private String title;

    private String content;

    private String sourceType;

    private Long sourceId;

    private String targetPath;

    private String dedupeKey;

    private Long actorId;

    private Boolean readFlag;

    private LocalDateTime readAt;

    private LocalDateTime createdAt;

    private LocalDateTime updatedAt;
}
