package top.sharpcaterpillar.teamsync.service.impl;

import lombok.RequiredArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;
import top.sharpcaterpillar.teamsync.entity.PmTaskLog;
import top.sharpcaterpillar.teamsync.entity.SysUser;
import top.sharpcaterpillar.teamsync.mapper.PmTaskLogMapper;
import top.sharpcaterpillar.teamsync.mapper.SysUserMapper;
import top.sharpcaterpillar.teamsync.service.TaskLogService;

import java.time.LocalDateTime;

/**
 * 任务日志服务实现类
 * 使用异步方式记录日志，不影响主业务性能
 */
@Service
@RequiredArgsConstructor
public class TaskLogServiceImpl implements TaskLogService {

    private static final Logger log = LoggerFactory.getLogger(TaskLogServiceImpl.class);
    private static final String EXCLUDED_USERNAME = "zzn";

    private final PmTaskLogMapper taskLogMapper;
    private final SysUserMapper userMapper;

    @Override
    @Async
    public void logCreate(Long taskId, Long operatorId, String taskTitle) {
        saveLog(taskId, operatorId, ACTION_CREATE, "创建了任务「" + taskTitle + "」");
    }

    @Override
    @Async
    public void logUpdate(Long taskId, Long operatorId) {
        saveLog(taskId, operatorId, ACTION_UPDATE, "更新了任务详情");
    }

    @Override
    @Async
    public void logUpdate(Long taskId, Long operatorId, String detail) {
        saveLog(taskId, operatorId, ACTION_UPDATE, truncateDetail(detail));
    }

    @Override
    @Async
    public void logMove(Long taskId, Long operatorId, String targetStageName) {
        saveLog(taskId, operatorId, ACTION_MOVE, "将任务移动到「" + targetStageName + "」");
    }

    @Override
    @Async
    public void logDelete(Long taskId, Long operatorId) {
        saveLog(taskId, operatorId, ACTION_DELETE, "删除了任务");
    }

    @Override
    @Async
    public void logComment(Long taskId, Long operatorId) {
        saveLog(taskId, operatorId, ACTION_COMMENT, "发表了评论");
    }

    @Override
    @Async
    public void logSubTask(Long taskId, Long operatorId, String detail) {
        saveLog(taskId, operatorId, ACTION_SUBTASK, truncateDetail(detail));
    }

    @Override
    @Async
    public void logAttachment(Long taskId, Long operatorId, String detail) {
        saveLog(taskId, operatorId, ACTION_ATTACHMENT, truncateDetail(detail));
    }

    /**
     * 保存日志到数据库
     */
    private void saveLog(Long taskId, Long operatorId, String actionType, String detail) {
        try {
            SysUser operator = userMapper.selectById(operatorId);
            if (operator != null && EXCLUDED_USERNAME.equalsIgnoreCase(operator.getUsername())) {
                log.debug("已跳过测试账号的任务日志: taskId={}, operatorId={}, action={}",
                        taskId, operatorId, actionType);
                return;
            }

            PmTaskLog taskLog = new PmTaskLog();
            taskLog.setTaskId(taskId);
            taskLog.setOperatorId(operatorId);
            taskLog.setActionType(actionType);
            taskLog.setDetail(detail);
            taskLog.setCreatedAt(LocalDateTime.now());
            taskLogMapper.insert(taskLog);
            log.debug("任务日志已记录: taskId={}, action={}", taskId, actionType);
        } catch (Exception e) {
            log.error("记录任务日志失败: taskId={}, action={}, error={}", taskId, actionType, e.getMessage());
        }
    }

    private String truncateDetail(String detail) {
        if (detail == null || detail.isBlank()) {
            return "更新了任务详情";
        }
        return detail.length() <= 500 ? detail : detail.substring(0, 497) + "...";
    }

}
