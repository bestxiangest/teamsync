package top.sharpcaterpillar.teamsync.service;

/**
 * 任务日志服务接口
 * 用于记录任务的操作日志
 */
public interface TaskLogService {

    /**
     * 日志操作类型
     */
    String ACTION_CREATE = "CREATE";
    String ACTION_UPDATE = "UPDATE";
    String ACTION_MOVE = "MOVE";
    String ACTION_DELETE = "DELETE";
    String ACTION_COMMENT = "COMMENT";
    String ACTION_SUBTASK = "SUBTASK";
    String ACTION_ATTACHMENT = "ATTACHMENT";

    /**
     * 记录创建任务日志
     *
     * @param taskId     任务ID
     * @param operatorId 操作人ID
     * @param taskTitle  任务标题
     */
    void logCreate(Long taskId, Long operatorId, String taskTitle);

    /**
     * 记录更新任务日志
     *
     * @param taskId     任务ID
     * @param operatorId 操作人ID
     */
    void logUpdate(Long taskId, Long operatorId);

    /**
     * 记录任务字段更新日志
     *
     * @param taskId     任务ID
     * @param operatorId 操作人ID
     * @param detail     更新详情
     */
    void logUpdate(Long taskId, Long operatorId, String detail);

    /**
     * 记录移动任务日志
     *
     * @param taskId          任务ID
     * @param operatorId      操作人ID
     * @param targetStageName 目标阶段名称
     */
    void logMove(Long taskId, Long operatorId, String targetStageName);

    /**
     * 记录删除任务日志
     *
     * @param taskId     任务ID
     * @param operatorId 操作人ID
     */
    void logDelete(Long taskId, Long operatorId);

    /**
     * 记录评论日志
     *
     * @param taskId     任务ID
     * @param operatorId 操作人ID
     */
    void logComment(Long taskId, Long operatorId);

    /**
     * 记录子任务操作日志
     *
     * @param taskId     任务ID
     * @param operatorId 操作人ID
     * @param detail     操作详情
     */
    void logSubTask(Long taskId, Long operatorId, String detail);

    /**
     * 记录附件操作日志
     *
     * @param taskId     任务ID
     * @param operatorId 操作人ID
     * @param detail     操作详情
     */
    void logAttachment(Long taskId, Long operatorId, String detail);

}
