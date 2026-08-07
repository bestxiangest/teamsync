package top.sharpcaterpillar.teamsync.service;

import top.sharpcaterpillar.teamsync.dto.StageDTO;
import top.sharpcaterpillar.teamsync.dto.TaskMoveRequest;

import java.util.List;

/**
 * 看板 Service 接口
 */
public interface PmBoardService {

    /**
     * 获取项目看板数据
     * 返回所有阶段及其下属任务
     *
     * @param projectId 项目ID
     * @return 阶段列表（包含任务）
     */
    List<StageDTO> getBoard(Long projectId);

    /**
     * 移动任务
     * 支持跨阶段移动和同阶段内排序
     *
     * @param taskId  任务ID
     * @param request 移动请求（目标阶段ID和新排序）
     * @param userId  操作人ID
     */
    void moveTask(Long taskId, TaskMoveRequest request, Long userId);

}

