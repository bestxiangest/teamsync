package top.sharpcaterpillar.teamsync.service.impl;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import top.sharpcaterpillar.teamsync.dto.StageDTO;
import top.sharpcaterpillar.teamsync.dto.TaskDTO;
import top.sharpcaterpillar.teamsync.dto.TaskMoveRequest;
import top.sharpcaterpillar.teamsync.entity.PmTask;
import top.sharpcaterpillar.teamsync.entity.PmTaskStage;
import top.sharpcaterpillar.teamsync.entity.SysUser;
import top.sharpcaterpillar.teamsync.entity.PmTaskMember;
import top.sharpcaterpillar.teamsync.mapper.PmTaskMapper;
import top.sharpcaterpillar.teamsync.mapper.PmTaskMemberMapper;
import top.sharpcaterpillar.teamsync.mapper.PmTaskStageMapper;
import top.sharpcaterpillar.teamsync.mapper.SysUserMapper;
import top.sharpcaterpillar.teamsync.service.PmBoardService;
import top.sharpcaterpillar.teamsync.service.TaskLogService;
import top.sharpcaterpillar.teamsync.vo.AssigneeVO;

import java.time.LocalDateTime;
import java.util.*;
import java.util.function.Function;
import java.util.stream.Collectors;

/**
 * 看板 Service 实现类
 */
@Service
@RequiredArgsConstructor
public class PmBoardServiceImpl implements PmBoardService {

    private static final String ROLE_EXECUTOR = "EXECUTOR";
    private static final String ROLE_FOLLOWER = "FOLLOWER";

    private final PmTaskStageMapper taskStageMapper;
    private final PmTaskMapper taskMapper;
    private final PmTaskMemberMapper taskMemberMapper;
    private final SysUserMapper userMapper;
    private final TaskLogService taskLogService;

    @Override
    public List<StageDTO> getBoard(Long projectId) {
        // 1. 查询项目的所有阶段，按 sort 升序排列
        LambdaQueryWrapper<PmTaskStage> stageQuery = new LambdaQueryWrapper<>();
        stageQuery.eq(PmTaskStage::getProjectId, projectId)
                .orderByAsc(PmTaskStage::getSort)
                .orderByAsc(PmTaskStage::getId);
        List<PmTaskStage> stages = taskStageMapper.selectList(stageQuery);

        if (stages.isEmpty()) {
            return Collections.emptyList();
        }

        // 2. 查询项目的所有任务，按 sort 升序排列
        LambdaQueryWrapper<PmTask> taskQuery = new LambdaQueryWrapper<>();
        taskQuery.eq(PmTask::getProjectId, projectId)
                .orderByAsc(PmTask::getSort);
        List<PmTask> tasks = taskMapper.selectList(taskQuery);

        // 3. 获取所有任务创建者的用户信息
        Map<Long, SysUser> userMap = getUserMap(tasks);

        // 4. 获取所有任务的负责人/关注人信息（批量查询优化）
        List<Long> taskIds = tasks.stream().map(PmTask::getId).collect(Collectors.toList());
        Map<Long, List<AssigneeVO>> assigneeMap = getTaskMemberMap(taskIds, ROLE_EXECUTOR, userMap);
        Map<Long, List<AssigneeVO>> followerMap = getTaskMemberMap(taskIds, ROLE_FOLLOWER, userMap);

        // 5. 将任务按阶段ID分组
        Map<Long, List<TaskDTO>> tasksByStage = tasks.stream()
                .map(task -> convertToTaskDTO(task, userMap, assigneeMap, followerMap))
                .collect(Collectors.groupingBy(TaskDTO::getStageId));

        // 6. 组装阶段DTO并填充任务
        return stages.stream()
                .map(stage -> {
                    StageDTO dto = convertToStageDTO(stage);
                    // 获取该阶段的任务列表，如果没有则返回空列表
                    dto.setTasks(tasksByStage.getOrDefault(stage.getId(), new ArrayList<>()));
                    return dto;
                })
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public void moveTask(Long taskId, TaskMoveRequest request, Long userId) {
        // 1. 获取任务
        PmTask task = taskMapper.selectById(taskId);
        if (task == null) {
            throw new RuntimeException("任务不存在");
        }

        // 2. 获取目标阶段名称（用于日志）
        PmTaskStage targetStage = taskStageMapper.selectById(request.getTargetStageId());
        String stageName = targetStage != null ? targetStage.getName() : "未知阶段";

        // 3. 更新任务的阶段和排序
        task.setStageId(request.getTargetStageId());
        task.setSort(request.getNewSort());
        task.setUpdatedAt(LocalDateTime.now());

        // 4. 更新数据库
        taskMapper.updateById(task);

        // 5. 记录移动日志
        taskLogService.logMove(taskId, userId, stageName);
    }

    /**
     * 获取用户信息Map（用于批量查询优化）
     */
    private Map<Long, SysUser> getUserMap(List<PmTask> tasks) {
        if (tasks.isEmpty()) {
            return Collections.emptyMap();
        }

        // 收集所有创建者ID
        Set<Long> creatorIds = tasks.stream()
                .map(PmTask::getCreatorId)
                .filter(Objects::nonNull)
                .collect(Collectors.toSet());

        if (creatorIds.isEmpty()) {
            return Collections.emptyMap();
        }

        // 批量查询用户
        List<SysUser> users = userMapper.selectBatchIds(creatorIds);
        return users.stream()
                .collect(Collectors.toMap(SysUser::getId, Function.identity()));
    }

    /**
     * 批量获取任务负责人Map
     */
    private Map<Long, List<AssigneeVO>> getTaskMemberMap(List<Long> taskIds, String role, Map<Long, SysUser> existingUserMap) {
        if (taskIds.isEmpty()) {
            return Collections.emptyMap();
        }

        // 查询所有任务的指定角色成员关联
        LambdaQueryWrapper<PmTaskMember> query = new LambdaQueryWrapper<>();
        query.in(PmTaskMember::getTaskId, taskIds)
                .eq(PmTaskMember::getRole, role);
        List<PmTaskMember> taskMembers = taskMemberMapper.selectList(query);

        if (taskMembers.isEmpty()) {
            return Collections.emptyMap();
        }

        // 收集需要查询的用户ID（排除已有的）
        Set<Long> userIdsToQuery = taskMembers.stream()
                .map(PmTaskMember::getUserId)
                .filter(id -> !existingUserMap.containsKey(id))
                .collect(Collectors.toSet());

        // 合并用户Map
        Map<Long, SysUser> allUserMap = new HashMap<>(existingUserMap);
        if (!userIdsToQuery.isEmpty()) {
            List<SysUser> additionalUsers = userMapper.selectBatchIds(userIdsToQuery);
            additionalUsers.forEach(u -> allUserMap.put(u.getId(), u));
        }

        // 按任务ID分组转换为 AssigneeVO
        return taskMembers.stream()
                .collect(Collectors.groupingBy(
                        PmTaskMember::getTaskId,
                        Collectors.mapping(
                                tm -> {
                                    SysUser user = allUserMap.get(tm.getUserId());
                                    if (user == null) return null;
                                    AssigneeVO vo = new AssigneeVO();
                                    vo.setUserId(user.getId());
                                    vo.setNickname(user.getNickname());
                                    vo.setAvatar(user.getAvatar());
                                    return vo;
                                },
                                Collectors.filtering(Objects::nonNull, Collectors.toList())
                        )
                ));
    }

    /**
     * 转换为 TaskDTO
     */
    private TaskDTO convertToTaskDTO(
            PmTask task,
            Map<Long, SysUser> userMap,
            Map<Long, List<AssigneeVO>> assigneeMap,
            Map<Long, List<AssigneeVO>> followerMap
    ) {
        TaskDTO dto = new TaskDTO();
        dto.setId(task.getId());
        dto.setStageId(task.getStageId());
        dto.setTitle(task.getTitle());
        dto.setDescription(task.getDescription());
        dto.setPriority(task.getPriority());
        dto.setStatus(task.getStatus() != null ? task.getStatus() : 0); // 添加 status 字段
        dto.setStartTime(task.getStartTime());
        dto.setDueTime(task.getDueTime());
        dto.setSort(task.getSort());
        dto.setCreatorId(task.getCreatorId());
        dto.setCreatedAt(task.getCreatedAt());
        dto.setUpdatedAt(task.getUpdatedAt());

        // 填充创建者信息
        if (task.getCreatorId() != null && userMap.containsKey(task.getCreatorId())) {
            SysUser creator = userMap.get(task.getCreatorId());
            dto.setCreatorName(creator.getNickname());
            dto.setCreatorAvatar(creator.getAvatar());
        }

        // 填充负责人信息
        List<AssigneeVO> assignees = assigneeMap.getOrDefault(task.getId(), new ArrayList<>());
        dto.setAssignees(assignees);
        dto.setAssigneeIds(assignees.stream().map(AssigneeVO::getUserId).collect(Collectors.toList()));

        List<AssigneeVO> followers = followerMap.getOrDefault(task.getId(), new ArrayList<>());
        dto.setFollowers(followers);
        dto.setFollowerIds(followers.stream().map(AssigneeVO::getUserId).collect(Collectors.toList()));

        return dto;
    }

    /**
     * 转换为 StageDTO
     */
    private StageDTO convertToStageDTO(PmTaskStage stage) {
        StageDTO dto = new StageDTO();
        dto.setId(stage.getId());
        dto.setProjectId(stage.getProjectId());
        dto.setName(stage.getName());
        dto.setSort(stage.getSort());
        return dto;
    }

}
