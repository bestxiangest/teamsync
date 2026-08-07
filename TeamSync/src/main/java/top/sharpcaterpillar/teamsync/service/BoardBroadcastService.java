package top.sharpcaterpillar.teamsync.service;

import lombok.RequiredArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;
import top.sharpcaterpillar.teamsync.dto.BoardMessage;

/**
 * 看板广播服务
 * 用于向订阅了特定项目看板的客户端发送实时更新
 */
@Service
@RequiredArgsConstructor
public class BoardBroadcastService {

    private static final Logger log = LoggerFactory.getLogger(BoardBroadcastService.class);

    private final SimpMessagingTemplate messagingTemplate;

    /**
     * 广播看板更新消息
     *
     * @param projectId 项目ID
     * @param message   消息内容
     */
    public void broadcast(Long projectId, BoardMessage message) {
        String destination = "/topic/board/" + projectId;
        log.info("广播看板更新: destination={}, action={}", destination, message.getAction());
        messagingTemplate.convertAndSend(destination, message);
    }

    /**
     * 广播任务创建
     */
    public void broadcastTaskCreated(Long projectId, Long taskId, Long userId, String username) {
        broadcast(projectId, BoardMessage.refresh("TASK_CREATED", taskId, userId, username));
    }

    /**
     * 广播任务更新
     */
    public void broadcastTaskUpdated(Long projectId, Long taskId, Long userId, String username) {
        broadcast(projectId, BoardMessage.refresh("TASK_UPDATED", taskId, userId, username));
    }

    /**
     * 广播任务删除
     */
    public void broadcastTaskDeleted(Long projectId, Long taskId, Long userId, String username) {
        broadcast(projectId, BoardMessage.refresh("TASK_DELETED", taskId, userId, username));
    }

    /**
     * 广播任务移动
     */
    public void broadcastTaskMoved(Long projectId, Long taskId, Long userId, String username) {
        broadcast(projectId, BoardMessage.refresh("TASK_MOVED", taskId, userId, username));
    }

}
