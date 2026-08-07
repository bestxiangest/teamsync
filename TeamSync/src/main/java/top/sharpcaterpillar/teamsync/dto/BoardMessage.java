package top.sharpcaterpillar.teamsync.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * 看板 WebSocket 消息
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
public class BoardMessage {

    /**
     * 操作类型
     */
    private String action;

    /**
     * 任务ID（可选）
     */
    private Long taskId;

    /**
     * 操作人ID
     */
    private Long userId;

    /**
     * 操作人用户名
     */
    private String username;

    /**
     * 时间戳
     */
    private Long timestamp;

    /**
     * 创建刷新消息
     */
    public static BoardMessage refresh(String action, Long taskId, Long userId, String username) {
        return new BoardMessage(action, taskId, userId, username, System.currentTimeMillis());
    }

    /**
     * 创建简单刷新消息
     */
    public static BoardMessage refresh(String action) {
        return new BoardMessage(action, null, null, null, System.currentTimeMillis());
    }

}

