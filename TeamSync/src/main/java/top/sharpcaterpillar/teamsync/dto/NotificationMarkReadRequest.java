package top.sharpcaterpillar.teamsync.dto;

import lombok.Data;

import java.util.List;

/**
 * 批量标记已读请求。
 */
@Data
public class NotificationMarkReadRequest {

    private List<Long> ids;
}
