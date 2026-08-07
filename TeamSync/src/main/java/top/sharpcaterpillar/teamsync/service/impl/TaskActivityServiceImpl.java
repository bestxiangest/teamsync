package top.sharpcaterpillar.teamsync.service.impl;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import lombok.RequiredArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import top.sharpcaterpillar.teamsync.entity.PmTaskComment;
import top.sharpcaterpillar.teamsync.entity.PmTaskLog;
import top.sharpcaterpillar.teamsync.entity.SysUser;
import top.sharpcaterpillar.teamsync.mapper.PmTaskCommentMapper;
import top.sharpcaterpillar.teamsync.mapper.PmTaskLogMapper;
import top.sharpcaterpillar.teamsync.mapper.SysUserMapper;
import top.sharpcaterpillar.teamsync.service.TaskActivityService;
import top.sharpcaterpillar.teamsync.service.TaskLogService;
import top.sharpcaterpillar.teamsync.vo.ActivityVO;

import java.time.LocalDateTime;
import java.util.*;
import java.util.function.Function;
import java.util.stream.Collectors;

/**
 * 任务活动服务实现类
 */
@Service
@RequiredArgsConstructor
public class TaskActivityServiceImpl implements TaskActivityService {

    private static final Logger log = LoggerFactory.getLogger(TaskActivityServiceImpl.class);

    private final PmTaskCommentMapper commentMapper;
    private final PmTaskLogMapper logMapper;
    private final SysUserMapper userMapper;
    private final TaskLogService taskLogService;

    @Override
    public List<ActivityVO> getTaskActivities(Long taskId) {
        // 1. 查询所有评论
        LambdaQueryWrapper<PmTaskComment> commentQuery = new LambdaQueryWrapper<>();
        commentQuery.eq(PmTaskComment::getTaskId, taskId);
        List<PmTaskComment> comments = commentMapper.selectList(commentQuery);

        // 2. 查询所有日志
        LambdaQueryWrapper<PmTaskLog> logQuery = new LambdaQueryWrapper<>();
        logQuery.eq(PmTaskLog::getTaskId, taskId);
        List<PmTaskLog> logs = logMapper.selectList(logQuery);

        // 3. 收集所有用户ID
        Set<Long> userIds = new HashSet<>();
        comments.forEach(c -> userIds.add(c.getUserId()));
        logs.forEach(l -> userIds.add(l.getOperatorId()));

        // 4. 批量查询用户信息
        Map<Long, SysUser> userMap = Collections.emptyMap();
        if (!userIds.isEmpty()) {
            List<SysUser> users = userMapper.selectBatchIds(userIds);
            userMap = users.stream()
                    .collect(Collectors.toMap(SysUser::getId, Function.identity()));
        }

        // 5. 转换为 ActivityVO 并合并
        List<ActivityVO> activities = new ArrayList<>();

        // 添加评论活动
        for (PmTaskComment comment : comments) {
            activities.add(convertCommentToActivity(comment, userMap));
        }

        // 添加日志活动
        for (PmTaskLog taskLog : logs) {
            activities.add(convertLogToActivity(taskLog, userMap));
        }

        // 6. 按时间倒序排列
        activities.sort((a, b) -> b.getCreatedAt().compareTo(a.getCreatedAt()));

        return activities;
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public ActivityVO addComment(Long taskId, Long userId, String content) {
        // 1. 参数校验
        if (content == null || content.trim().isEmpty()) {
            throw new RuntimeException("评论内容不能为空");
        }

        // 2. 保存评论
        PmTaskComment comment = new PmTaskComment();
        comment.setTaskId(taskId);
        comment.setUserId(userId);
        comment.setContent(content.trim());
        comment.setCreatedAt(LocalDateTime.now());
        commentMapper.insert(comment);

        log.info("评论已发表: taskId={}, userId={}", taskId, userId);

        // 3. 记录评论日志
        taskLogService.logComment(taskId, userId);

        // 4. 查询用户信息并返回
        SysUser user = userMapper.selectById(userId);
        Map<Long, SysUser> userMap = new HashMap<>();
        if (user != null) {
            userMap.put(userId, user);
        }

        return convertCommentToActivity(comment, userMap);
    }

    /**
     * 将评论转换为活动VO
     */
    private ActivityVO convertCommentToActivity(PmTaskComment comment, Map<Long, SysUser> userMap) {
        ActivityVO vo = new ActivityVO();
        vo.setId(comment.getId());
        vo.setType("comment");
        vo.setTaskId(comment.getTaskId());
        vo.setUserId(comment.getUserId());
        vo.setContent(comment.getContent());
        vo.setCreatedAt(comment.getCreatedAt());

        // 填充用户信息
        SysUser user = userMap.get(comment.getUserId());
        if (user != null) {
            vo.setUsername(user.getUsername());
            vo.setNickname(user.getNickname());
            vo.setAvatar(user.getAvatar());
        }

        return vo;
    }

    /**
     * 将日志转换为活动VO
     */
    private ActivityVO convertLogToActivity(PmTaskLog taskLog, Map<Long, SysUser> userMap) {
        ActivityVO vo = new ActivityVO();
        vo.setId(taskLog.getId());
        vo.setType("log");
        vo.setTaskId(taskLog.getTaskId());
        vo.setUserId(taskLog.getOperatorId());
        vo.setContent(taskLog.getDetail());
        vo.setActionType(taskLog.getActionType());
        vo.setCreatedAt(taskLog.getCreatedAt());

        // 填充用户信息
        SysUser user = userMap.get(taskLog.getOperatorId());
        if (user != null) {
            vo.setUsername(user.getUsername());
            vo.setNickname(user.getNickname());
            vo.setAvatar(user.getAvatar());
        }

        return vo;
    }

}
