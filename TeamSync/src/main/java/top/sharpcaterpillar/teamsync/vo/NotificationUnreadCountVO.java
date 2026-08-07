package top.sharpcaterpillar.teamsync.vo;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * 未读通知数量。
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
public class NotificationUnreadCountVO {

    private Long unreadCount;
}
