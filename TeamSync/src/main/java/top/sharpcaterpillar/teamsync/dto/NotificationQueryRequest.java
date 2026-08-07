package top.sharpcaterpillar.teamsync.dto;

import lombok.Data;

/**
 * 站内通知查询请求。
 */
@Data
public class NotificationQueryRequest {

    private Integer current = 1;

    private Integer size = 20;

    private String type;

    private Boolean unreadOnly;
}
