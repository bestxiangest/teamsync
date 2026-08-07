package top.sharpcaterpillar.teamsync.service.impl;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.extension.service.impl.ServiceImpl;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import top.sharpcaterpillar.teamsync.dto.TaskDTO;
import top.sharpcaterpillar.teamsync.dto.TaskRequest;
import top.sharpcaterpillar.teamsync.entity.PmProject;
import top.sharpcaterpillar.teamsync.entity.PmTask;
import top.sharpcaterpillar.teamsync.entity.PmTaskMember;
import top.sharpcaterpillar.teamsync.entity.SysUser;
import top.sharpcaterpillar.teamsync.mapper.PmProjectMapper;
import top.sharpcaterpillar.teamsync.mapper.PmTaskMapper;
import top.sharpcaterpillar.teamsync.mapper.PmTaskMemberMapper;
import top.sharpcaterpillar.teamsync.mapper.SysUserMapper;
import top.sharpcaterpillar.teamsync.service.PmTaskService;
import top.sharpcaterpillar.teamsync.service.SysNotificationService;
import top.sharpcaterpillar.teamsync.service.TaskReminderService;
import top.sharpcaterpillar.teamsync.service.TaskLogService;
import top.sharpcaterpillar.teamsync.vo.AssigneeVO;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.*;
import java.util.stream.Collectors;

/**
 * 任务 Service 实现类
 */
@Service
@RequiredArgsConstructor
public class PmTaskServiceImpl extends ServiceImpl<PmTaskMapper, PmTask> implements PmTaskService {

    private static final String ROLE_EXECUTOR = "EXECUTOR";
    private static final String ROLE_FOLLOWER = "FOLLOWER";
    private static final DateTimeFormatter DATE_TIME_FORMATTER = DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm");

    private final SysUserMapper userMapper;
    private final PmProjectMapper projectMapper;
    private final PmTaskMemberMapper taskMemberMapper;
    private final TaskLogService taskLogService;
    private final SysNotificationService notificationService;
    private final TaskReminderService taskReminderService;

    @Override
    @Transactional(rollbackFor = Exception.class)
    public TaskDTO createTask(TaskRequest request, Long userId) {
        // 参数校验
        if (request.getProjectId() == null) {
            throw new RuntimeException("项目ID不能为空");
        }
        if (request.getStageId() == null) {
            throw new RuntimeException("阶段ID不能为空");
        }
        if (request.getTitle() == null || request.getTitle().trim().isEmpty()) {
            throw new RuntimeException("任务标题不能为空");
        }
        validateTaskTimeRange(request.getStartTime(), request.getDueTime());

        // 1. 计算新任务的 sort 值（该阶段内最大 sort + 1）
        Integer maxSort = getMaxSortInStage(request.getStageId());
        int newSort = (maxSort == null) ? 0 : maxSort + 1;

        // 2. 创建任务实体
        PmTask task = new PmTask();
        task.setProjectId(request.getProjectId());
        task.setStageId(request.getStageId());
        task.setTitle(request.getTitle().trim());
        task.setDescription(request.getDescription());
        task.setPriority(request.getPriority() != null ? request.getPriority() : 1);
        task.setStatus(0); // 新任务默认未完成
        task.setStartTime(request.getStartTime());
        task.setDueTime(request.getDueTime());
        task.setCreatorId(userId);
        task.setSort(newSort);
        task.setIsDeleted(0);
        task.setCreatedAt(LocalDateTime.now());
        task.setUpdatedAt(LocalDateTime.now());

        // 3. 保存到数据库
        this.save(task);

        // 4. 保存负责人关联
        List<Long> assigneeIds = normalizeIds(request.getAssigneeIds());
        List<Long> followerIds = excludeIds(normalizeIds(request.getFollowerIds()), assigneeIds);
        saveTaskMembers(task.getId(), assigneeIds, ROLE_EXECUTOR);
        saveTaskMembers(task.getId(), followerIds, ROLE_FOLLOWER);

        // 5. 记录创建日志
        taskLogService.logCreate(task.getId(), userId, task.getTitle());

        // 6. 返回 TaskDTO
        return convertToTaskDTO(task);
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public TaskDTO updateTask(Long taskId, TaskRequest request, Long userId) {
        // 1. 获取任务
        PmTask task = this.getById(taskId);
        if (task == null) {
            throw new RuntimeException("任务不存在");
        }

        String oldTitle = task.getTitle();
        String oldDescription = task.getDescription();
        Integer oldPriority = task.getPriority();
        Integer oldStatus = task.getStatus();
        LocalDateTime oldStartTime = task.getStartTime();
        LocalDateTime oldDueTime = task.getDueTime();
        List<Long> oldAssigneeIds = getTaskMemberIds(taskId, ROLE_EXECUTOR);
        List<Long> oldFollowerIds = getTaskMemberIds(taskId, ROLE_FOLLOWER);

        // 2. 更新字段（不更新 stageId 和 sort）
        if (request.getTitle() != null && !request.getTitle().trim().isEmpty()) {
            task.setTitle(request.getTitle().trim());
        }
        if (request.getDescription() != null) {
            task.setDescription(request.getDescription());
        }
        if (request.getPriority() != null) {
            task.setPriority(request.getPriority());
        }
        // 更新任务状态（支持快速切换完成状态）
        if (request.getStatus() != null) {
            task.setStatus(request.getStatus());
        }
        if (request.getStartTime() != null || Boolean.TRUE.equals(request.getClearStartTime())) {
            task.setStartTime(Boolean.TRUE.equals(request.getClearStartTime()) ? null : request.getStartTime());
        }
        if (request.getDueTime() != null || Boolean.TRUE.equals(request.getClearDueTime())) {
            task.setDueTime(Boolean.TRUE.equals(request.getClearDueTime()) ? null : request.getDueTime());
        }
        validateTaskTimeRange(task.getStartTime(), task.getDueTime());
        task.setUpdatedAt(LocalDateTime.now());

        // 3. 保存更新
        this.updateById(task);

        // 4. 更新负责人/关注人关联（全量更新）
        List<Long> nextAssigneeIds = oldAssigneeIds;
        List<Long> nextFollowerIds = oldFollowerIds;
        if (request.getAssigneeIds() != null) {
            nextAssigneeIds = normalizeIds(request.getAssigneeIds());
            updateTaskMembers(taskId, ROLE_EXECUTOR, nextAssigneeIds);
        }
        if (request.getFollowerIds() != null) {
            nextFollowerIds = excludeIds(normalizeIds(request.getFollowerIds()), nextAssigneeIds);
            updateTaskMembers(taskId, ROLE_FOLLOWER, nextFollowerIds);
        } else if (request.getAssigneeIds() != null) {
            nextFollowerIds = excludeIds(oldFollowerIds, nextAssigneeIds);
            if (!sameIdSet(oldFollowerIds, nextFollowerIds)) {
                updateTaskMembers(taskId, ROLE_FOLLOWER, nextFollowerIds);
            }
        }

        // 5. 记录更新日志
        List<String> changeDetails = buildTaskChangeDetails(
                request,
                oldTitle,
                oldDescription,
                oldPriority,
                oldStatus,
                oldStartTime,
                oldDueTime,
                oldAssigneeIds,
                oldFollowerIds,
                task,
                nextAssigneeIds,
                nextFollowerIds
        );
        if (!changeDetails.isEmpty()) {
            taskLogService.logUpdate(taskId, userId, "更新了任务：" + String.join("；", changeDetails));
        }

        notifyTaskCompleted(oldStatus, task, nextFollowerIds, userId);

        // 6. 返回更新后的 TaskDTO
        return convertToTaskDTO(task);
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public void deleteTask(Long taskId, Long userId) {
        // 获取任务
        PmTask task = this.getById(taskId);
        if (task == null) {
            throw new RuntimeException("任务不存在");
        }

        // 记录删除日志（需要在删除前记录，否则任务信息可能丢失）
        taskLogService.logDelete(taskId, userId);

        // 使用 MyBatis Plus 的 removeById 进行逻辑删除
        // @TableLogic 注解会自动将 is_deleted 设置为 1
        this.removeById(taskId);
    }

    @Override
    public TaskDTO getTaskDetail(Long taskId) {
        PmTask task = this.getById(taskId);
        if (task == null) {
            throw new RuntimeException("任务不存在");
        }
        return convertToTaskDTO(task);
    }

    /**
     * 获取阶段内最大的 sort 值
     */
    private Integer getMaxSortInStage(Long stageId) {
        LambdaQueryWrapper<PmTask> query = new LambdaQueryWrapper<>();
        query.eq(PmTask::getStageId, stageId)
                .orderByDesc(PmTask::getSort)
                .last("LIMIT 1");
        PmTask task = this.getOne(query);
        return task != null ? task.getSort() : null;
    }

    /**
     * 转换为 TaskDTO
     */
    private TaskDTO convertToTaskDTO(PmTask task) {
        TaskDTO dto = new TaskDTO();
        dto.setId(task.getId());
        dto.setStageId(task.getStageId());
        dto.setTitle(task.getTitle());
        dto.setDescription(task.getDescription());
        dto.setPriority(task.getPriority());
        dto.setStatus(task.getStatus() != null ? task.getStatus() : 0);
        dto.setStartTime(task.getStartTime());
        dto.setDueTime(task.getDueTime());
        dto.setSort(task.getSort());
        dto.setCreatorId(task.getCreatorId());
        dto.setCreatedAt(task.getCreatedAt());
        dto.setUpdatedAt(task.getUpdatedAt());

        // 填充创建者信息
        if (task.getCreatorId() != null) {
            SysUser creator = userMapper.selectById(task.getCreatorId());
            if (creator != null) {
                dto.setCreatorName(creator.getNickname());
                dto.setCreatorAvatar(creator.getAvatar());
            }
        }

        // 填充负责人信息
        List<AssigneeVO> assignees = getTaskMembers(task.getId(), ROLE_EXECUTOR);
        dto.setAssignees(assignees);
        dto.setAssigneeIds(assignees.stream().map(AssigneeVO::getUserId).collect(Collectors.toList()));

        List<AssigneeVO> followers = getTaskMembers(task.getId(), ROLE_FOLLOWER);
        dto.setFollowers(followers);
        dto.setFollowerIds(followers.stream().map(AssigneeVO::getUserId).collect(Collectors.toList()));

        return dto;
    }

    /**
     * 获取任务成员列表
     */
    private List<AssigneeVO> getTaskMembers(Long taskId, String role) {
        LambdaQueryWrapper<PmTaskMember> query = new LambdaQueryWrapper<>();
        query.eq(PmTaskMember::getTaskId, taskId)
                .eq(PmTaskMember::getRole, role);
        List<PmTaskMember> members = taskMemberMapper.selectList(query);

        if (members.isEmpty()) {
            return new ArrayList<>();
        }

        // 获取用户ID列表
        List<Long> userIds = members.stream()
                .map(PmTaskMember::getUserId)
                .collect(Collectors.toList());

        // 批量查询用户信息
        List<SysUser> users = userMapper.selectBatchIds(userIds);

        // 转换为 AssigneeVO
        return users.stream().map(user -> {
            AssigneeVO vo = new AssigneeVO();
            vo.setUserId(user.getId());
            vo.setNickname(user.getNickname());
            vo.setAvatar(user.getAvatar());
            return vo;
        }).collect(Collectors.toList());
    }

    /**
     * 获取任务成员ID列表
     */
    private List<Long> getTaskMemberIds(Long taskId, String role) {
        LambdaQueryWrapper<PmTaskMember> query = new LambdaQueryWrapper<>();
        query.eq(PmTaskMember::getTaskId, taskId)
                .eq(PmTaskMember::getRole, role);
        return taskMemberMapper.selectList(query).stream()
                .map(PmTaskMember::getUserId)
                .collect(Collectors.toList());
    }

    /**
     * 保存任务成员关联
     */
    private void saveTaskMembers(Long taskId, List<Long> userIds, String role) {
        for (Long userId : normalizeIds(userIds)) {
            PmTaskMember member = new PmTaskMember();
            member.setTaskId(taskId);
            member.setUserId(userId);
            member.setRole(role);
            taskMemberMapper.insert(member);
        }
    }

    /**
     * 更新任务成员（全量更新：先删后增）
     */
    private void updateTaskMembers(Long taskId, String role, List<Long> userIds) {
        List<Long> normalizedIds = normalizeIds(userIds);

        // 1. 删除旧的同角色关联
        LambdaQueryWrapper<PmTaskMember> deleteQuery = new LambdaQueryWrapper<>();
        deleteQuery.eq(PmTaskMember::getTaskId, taskId)
                .eq(PmTaskMember::getRole, role);
        taskMemberMapper.delete(deleteQuery);

        // 2. 清理同一用户的其他角色，避免 (task_id, user_id) 主键冲突
        if (!normalizedIds.isEmpty()) {
            LambdaQueryWrapper<PmTaskMember> conflictQuery = new LambdaQueryWrapper<>();
            conflictQuery.eq(PmTaskMember::getTaskId, taskId)
                    .in(PmTaskMember::getUserId, normalizedIds)
                    .ne(PmTaskMember::getRole, role);
            taskMemberMapper.delete(conflictQuery);
        }

        // 3. 插入新的成员关联
        saveTaskMembers(taskId, normalizedIds, role);
    }

    private List<String> buildTaskChangeDetails(
            TaskRequest request,
            String oldTitle,
            String oldDescription,
            Integer oldPriority,
            Integer oldStatus,
            LocalDateTime oldStartTime,
            LocalDateTime oldDueTime,
            List<Long> oldAssigneeIds,
            List<Long> oldFollowerIds,
            PmTask task,
            List<Long> nextAssigneeIds,
            List<Long> nextFollowerIds
    ) {
        List<String> changes = new ArrayList<>();

        if (request.getTitle() != null && !Objects.equals(oldTitle, task.getTitle())) {
            changes.add("标题从「" + displayText(oldTitle) + "」改为「" + displayText(task.getTitle()) + "」");
        }
        if (request.getDescription() != null && !Objects.equals(oldDescription, task.getDescription())) {
            changes.add("更新了描述");
        }
        if (request.getPriority() != null && !Objects.equals(oldPriority, task.getPriority())) {
            changes.add("优先级从「" + priorityText(oldPriority) + "」改为「" + priorityText(task.getPriority()) + "」");
        }
        if (request.getStatus() != null && !Objects.equals(oldStatus, task.getStatus())) {
            changes.add("状态从「" + statusText(oldStatus) + "」改为「" + statusText(task.getStatus()) + "」");
        }
        if ((request.getStartTime() != null || Boolean.TRUE.equals(request.getClearStartTime()))
                && !Objects.equals(oldStartTime, task.getStartTime())) {
            changes.add("开始时间从「" + formatDateTime(oldStartTime) + "」改为「" + formatDateTime(task.getStartTime()) + "」");
        }
        if ((request.getDueTime() != null || Boolean.TRUE.equals(request.getClearDueTime()))
                && !Objects.equals(oldDueTime, task.getDueTime())) {
            changes.add("截止时间从「" + formatDateTime(oldDueTime) + "」改为「" + formatDateTime(task.getDueTime()) + "」");
        }
        if (request.getAssigneeIds() != null && !sameIdSet(oldAssigneeIds, nextAssigneeIds)) {
            changes.add("负责人从「" + formatUserNames(oldAssigneeIds) + "」改为「" + formatUserNames(nextAssigneeIds) + "」");
        }
        if ((request.getFollowerIds() != null || request.getAssigneeIds() != null)
                && !sameIdSet(oldFollowerIds, nextFollowerIds)) {
            changes.add("关注人从「" + formatUserNames(oldFollowerIds) + "」改为「" + formatUserNames(nextFollowerIds) + "」");
        }

        return changes;
    }

    private void validateTaskTimeRange(LocalDateTime startTime, LocalDateTime dueTime) {
        if (startTime != null && dueTime != null && !startTime.isBefore(dueTime)) {
            throw new RuntimeException("开始时间必须早于截止时间");
        }
    }

    private List<Long> normalizeIds(List<Long> ids) {
        if (ids == null || ids.isEmpty()) {
            return new ArrayList<>();
        }
        return ids.stream()
                .filter(Objects::nonNull)
                .distinct()
                .collect(Collectors.toList());
    }

    private List<Long> excludeIds(List<Long> ids, Collection<Long> excludedIds) {
        if (ids == null || ids.isEmpty()) {
            return new ArrayList<>();
        }
        Set<Long> excluded = excludedIds == null ? Collections.emptySet() : new HashSet<>(excludedIds);
        return ids.stream()
                .filter(id -> !excluded.contains(id))
                .distinct()
                .collect(Collectors.toList());
    }

    private boolean sameIdSet(List<Long> left, List<Long> right) {
        return new LinkedHashSet<>(normalizeIds(left)).equals(new LinkedHashSet<>(normalizeIds(right)));
    }

    private void notifyTaskCompleted(Integer oldStatus, PmTask task, List<Long> followerIds, Long actorId) {
        if (!isTaskCompletedTransition(oldStatus, task)) {
            return;
        }
        PmProject project = task.getProjectId() == null ? null : projectMapper.selectById(task.getProjectId());
        List<Long> recipientIds = buildTaskCompletedRecipientIds(task, project, followerIds, actorId);
        if (recipientIds.isEmpty()) {
            return;
        }

        LocalDateTime completedAt = task.getUpdatedAt() != null ? task.getUpdatedAt() : LocalDateTime.now();
        notificationService.notifyTaskCompleted(task, recipientIds, actorId, completedAt);
        taskReminderService.sendTaskCompletedReminder(task, recipientIds, actorId);
    }

    private boolean isTaskCompletedTransition(Integer oldStatus, PmTask task) {
        return task != null && !Objects.equals(oldStatus, 1) && Objects.equals(task.getStatus(), 1);
    }

    private List<Long> buildTaskCompletedRecipientIds(PmTask task,
                                                      PmProject project,
                                                      List<Long> followerIds,
                                                      Long actorId) {
        LinkedHashSet<Long> recipientIds = new LinkedHashSet<>();
        recipientIds.addAll(normalizeIds(followerIds));
        if (task.getCreatorId() != null) {
            recipientIds.add(task.getCreatorId());
        }
        if (project != null && project.getOwnerId() != null) {
            recipientIds.add(project.getOwnerId());
        }
        if (actorId != null) {
            recipientIds.remove(actorId);
        }
        return new ArrayList<>(recipientIds);
    }

    private String formatUserNames(List<Long> userIds) {
        List<Long> ids = normalizeIds(userIds);
        if (ids.isEmpty()) {
            return "无";
        }
        List<SysUser> users = userMapper.selectBatchIds(ids);
        Map<Long, SysUser> userMap = users.stream()
                .collect(Collectors.toMap(SysUser::getId, user -> user));
        return ids.stream()
                .map(id -> {
                    SysUser user = userMap.get(id);
                    if (user == null) {
                        return String.valueOf(id);
                    }
                    if (user.getNickname() != null && !user.getNickname().isBlank()) {
                        return user.getNickname();
                    }
                    return user.getUsername();
                })
                .collect(Collectors.joining("、"));
    }

    private String priorityText(Integer priority) {
        if (priority == null) {
            return "未设置";
        }
        return switch (priority) {
            case 3 -> "非常紧急";
            case 2 -> "紧急";
            default -> "普通";
        };
    }

    private String statusText(Integer status) {
        if (status == null) {
            return "未开始";
        }
        return switch (status) {
            case 1 -> "已完成";
            case 2 -> "处理中";
            default -> "未开始";
        };
    }

    private String formatDateTime(LocalDateTime dateTime) {
        return dateTime == null ? "无" : DATE_TIME_FORMATTER.format(dateTime);
    }

    private String displayText(String value) {
        if (value == null || value.isBlank()) {
            return "空";
        }
        String text = value.trim().replaceAll("\\s+", " ");
        return text.length() <= 40 ? text : text.substring(0, 37) + "...";
    }

}
