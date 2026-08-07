package top.sharpcaterpillar.teamsync.service;

import top.sharpcaterpillar.teamsync.vo.ActivityVO;

import java.util.List;

/**
 * 任务活动服务接口
 * 用于获取任务的评论和日志混合动态流
 */
public interface TaskActivityService {

    /**
     * 获取任务的活动流（评论 + 日志 混合，按时间倒序）
     *
     * @param taskId 任务ID
     * @return 活动列表
     */
    List<ActivityVO> getTaskActivities(Long taskId);

    /**
     * 发表评论
     *
     * @param taskId  任务ID
     * @param userId  用户ID
     * @param content 评论内容
     * @return 新评论的活动VO
     */
    ActivityVO addComment(Long taskId, Long userId, String content);

}
