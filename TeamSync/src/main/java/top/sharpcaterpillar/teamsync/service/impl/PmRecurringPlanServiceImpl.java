package top.sharpcaterpillar.teamsync.service.impl;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.baomidou.mybatisplus.extension.service.impl.ServiceImpl;
import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;
import top.sharpcaterpillar.teamsync.dto.RecurringPlanGenerateTaskResponse;
import top.sharpcaterpillar.teamsync.dto.RecurringPlanCreateRequest;
import top.sharpcaterpillar.teamsync.dto.RecurringPlanOccurrenceActionRequest;
import top.sharpcaterpillar.teamsync.dto.RecurringPlanOccurrenceQueryRequest;
import top.sharpcaterpillar.teamsync.dto.RecurringPlanQueryRequest;
import top.sharpcaterpillar.teamsync.dto.RecurringPlanUpdateRequest;
import top.sharpcaterpillar.teamsync.dto.TaskDTO;
import top.sharpcaterpillar.teamsync.dto.TaskRequest;
import top.sharpcaterpillar.teamsync.entity.PmRecurringPlan;
import top.sharpcaterpillar.teamsync.entity.PmRecurringPlanAssignee;
import top.sharpcaterpillar.teamsync.entity.PmRecurringPlanOccurrence;
import top.sharpcaterpillar.teamsync.entity.PmProject;
import top.sharpcaterpillar.teamsync.entity.PmTaskStage;
import top.sharpcaterpillar.teamsync.entity.SysUser;
import top.sharpcaterpillar.teamsync.mapper.PmRecurringPlanAssigneeMapper;
import top.sharpcaterpillar.teamsync.mapper.PmRecurringPlanMapper;
import top.sharpcaterpillar.teamsync.mapper.PmRecurringPlanOccurrenceMapper;
import top.sharpcaterpillar.teamsync.mapper.PmTaskStageMapper;
import top.sharpcaterpillar.teamsync.mapper.SysUserMapper;
import top.sharpcaterpillar.teamsync.service.PmTaskService;
import top.sharpcaterpillar.teamsync.service.PmRecurringPlanService;
import top.sharpcaterpillar.teamsync.service.ProjectPermissionService;
import top.sharpcaterpillar.teamsync.service.SysUserService;
import top.sharpcaterpillar.teamsync.vo.AssigneeVO;
import top.sharpcaterpillar.teamsync.vo.PageVO;
import top.sharpcaterpillar.teamsync.vo.RecurringPlanOccurrenceVO;
import top.sharpcaterpillar.teamsync.vo.RecurringPlanVO;

import java.time.Duration;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.Collections;
import java.util.HashMap;
import java.util.HashSet;
import java.util.LinkedHashSet;
import java.util.List;
import java.util.LinkedHashMap;
import java.util.Map;
import java.util.Objects;
import java.util.Set;
import java.util.stream.Collectors;

/**
 * 周期计划 Service 实现。
 */
@Service
@RequiredArgsConstructor
public class PmRecurringPlanServiceImpl extends ServiceImpl<PmRecurringPlanMapper, PmRecurringPlan>
        implements PmRecurringPlanService {

    private static final String STATUS_ACTIVE = "ACTIVE";
    private static final String STATUS_PAUSED = "PAUSED";
    private static final String STATUS_FINISHED = "FINISHED";
    private static final String OCCURRENCE_STATUS_PENDING = "PENDING";
    private static final String OCCURRENCE_STATUS_DONE = "DONE";
    private static final String OCCURRENCE_STATUS_SKIPPED = "SKIPPED";
    private static final String OCCURRENCE_STATUS_DEFERRED = "DEFERRED";
    private static final String OCCURRENCE_STATUS_CANCELLED = "CANCELLED";
    private static final String OCCURRENCE_STATUS_OVERDUE = "OVERDUE";
    private static final String CURRENT_OCCURRENCE_STATUS_NONE = "NONE";
    private static final String ASSIGNEE_ROLE_RESPONSIBLE = "RESPONSIBLE";
    private static final String DEFAULT_TIMEZONE = "Asia/Shanghai";

    private static final Set<String> ALLOWED_STATUS = Set.of(STATUS_ACTIVE, STATUS_PAUSED, STATUS_FINISHED);
    private static final Set<String> ALLOWED_OCCURRENCE_STATUS = Set.of(
            OCCURRENCE_STATUS_PENDING,
            OCCURRENCE_STATUS_DONE,
            OCCURRENCE_STATUS_SKIPPED,
            OCCURRENCE_STATUS_CANCELLED,
            OCCURRENCE_STATUS_OVERDUE,
            OCCURRENCE_STATUS_DEFERRED
    );
    private static final Set<String> ALLOWED_RECURRENCE_UNITS = Set.of(
            "DAY",
            "WEEK",
            "MONTH",
            "QUARTER",
            "HALF_YEAR",
            "YEAR"
    );

    private final PmRecurringPlanAssigneeMapper assigneeMapper;
    private final PmRecurringPlanOccurrenceMapper occurrenceMapper;
    private final PmTaskStageMapper taskStageMapper;
    private final SysUserMapper userMapper;
    private final SysUserService sysUserService;
    private final PmTaskService pmTaskService;
    private final ProjectPermissionService permissionService;
    private final ObjectMapper objectMapper;

    @Override
    public PageVO<RecurringPlanVO> listPlans(RecurringPlanQueryRequest request, Long operatorId) {
        requireLogin(operatorId);
        RecurringPlanQueryRequest safeRequest = request == null ? new RecurringPlanQueryRequest() : request;
        boolean platformAdmin = sysUserService.isSuperAdmin(operatorId);

        Page<PmRecurringPlan> page = new Page<>(normalizeCurrent(safeRequest.getCurrent()), normalizeSize(safeRequest.getSize()));
        LambdaQueryWrapper<PmRecurringPlan> query = new LambdaQueryWrapper<>();

        if (platformAdmin) {
            if (safeRequest.getCreatorId() != null) {
                query.eq(PmRecurringPlan::getCreatorId, safeRequest.getCreatorId());
            }
        } else {
            Set<Long> responsiblePlanIds = loadResponsiblePlanIds(operatorId);
            query.and(wrapper -> {
                wrapper.eq(PmRecurringPlan::getCreatorId, operatorId);
                if (!responsiblePlanIds.isEmpty()) {
                    wrapper.or().in(PmRecurringPlan::getId, responsiblePlanIds);
                }
            });
        }

        if (StringUtils.hasText(safeRequest.getKeyword())) {
            String keyword = safeRequest.getKeyword().trim();
            query.and(wrapper -> wrapper.like(PmRecurringPlan::getTitle, keyword)
                    .or()
                    .like(PmRecurringPlan::getDescription, keyword));
        }
        if (StringUtils.hasText(safeRequest.getStatus())) {
            query.eq(PmRecurringPlan::getStatus, normalizeStatus(safeRequest.getStatus()));
        }
        if (StringUtils.hasText(safeRequest.getRecurrenceUnit())) {
            query.eq(PmRecurringPlan::getRecurrenceUnit, normalizeRecurrenceUnit(safeRequest.getRecurrenceUnit()));
        }
        if (safeRequest.getNextRunStart() != null) {
            query.ge(PmRecurringPlan::getNextRunAt, safeRequest.getNextRunStart());
        }
        if (safeRequest.getNextRunEnd() != null) {
            query.le(PmRecurringPlan::getNextRunAt, safeRequest.getNextRunEnd());
        }

        query.orderByAsc(PmRecurringPlan::getNextRunAt)
                .orderByDesc(PmRecurringPlan::getUpdatedAt);

        Page<PmRecurringPlan> resultPage = this.page(page, query);
        List<RecurringPlanVO> records = convertToVOs(resultPage.getRecords());
        return PageVO.of(records, resultPage.getTotal(), (int) resultPage.getCurrent(), (int) resultPage.getSize());
    }

    @Override
    public RecurringPlanVO getPlan(Long planId, Long operatorId) {
        PmRecurringPlan plan = requireAccessiblePlan(planId, operatorId);
        return convertToVOs(Collections.singletonList(plan)).get(0);
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public RecurringPlanVO createPlan(RecurringPlanCreateRequest request, Long creatorId) {
        requireLogin(creatorId);
        validateCreateRequest(request);
        List<Long> assigneeIds = normalizeAndValidateAssigneeIds(request.getAssigneeIds());

        LocalDateTime now = LocalDateTime.now();
        String recurrenceUnit = normalizeRecurrenceUnit(request.getRecurrenceUnit());
        int intervalCount = normalizeIntervalCount(request.getIntervalCount());

        PmRecurringPlan plan = new PmRecurringPlan();
        plan.setProjectId(request.getProjectId());
        plan.setStageId(request.getStageId());
        plan.setTitle(request.getTitle().trim());
        plan.setDescription(request.getDescription());
        plan.setPriority(normalizePriority(request.getPriority()));
        plan.setStatus(STATUS_ACTIVE);
        plan.setRecurrenceUnit(recurrenceUnit);
        plan.setIntervalCount(intervalCount);
        plan.setStartTime(request.getStartTime());
        plan.setDueTime(request.getDueTime());
        plan.setEndTime(request.getEndTime());
        plan.setTimezone(StringUtils.hasText(request.getTimezone()) ? request.getTimezone().trim() : DEFAULT_TIMEZONE);
        plan.setReminderEnabled(Boolean.TRUE.equals(request.getReminderEnabled()));
        plan.setReminderMinutesBefore(normalizeReminderMinutes(request.getReminderMinutesBefore()));
        plan.setAutoCreateTask(Boolean.TRUE.equals(request.getAutoCreateTask()));
        plan.setMaxOccurrences(normalizeMaxOccurrences(request.getMaxOccurrences()));
        plan.setGeneratedCount(0);
        plan.setCreatorId(creatorId);
        plan.setIsDeleted(0);
        plan.setCreatedAt(now);
        plan.setUpdatedAt(now);
        refreshNextRunAt(plan, now);

        this.save(plan);
        replaceAssignees(plan.getId(), assigneeIds);
        return getPlan(plan.getId(), creatorId);
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public RecurringPlanVO updatePlan(Long planId, RecurringPlanUpdateRequest request, Long operatorId) {
        if (request == null) {
            throw new RuntimeException("周期计划更新内容不能为空");
        }
        PmRecurringPlan plan = requireAccessiblePlan(planId, operatorId);

        if (request.getAssigneeIds() != null) {
            List<Long> assigneeIds = normalizeAndValidateAssigneeIds(request.getAssigneeIds());
            replaceAssignees(plan.getId(), assigneeIds);
        }

        if (request.getProjectId() != null) {
            plan.setProjectId(request.getProjectId());
        }
        if (request.getStageId() != null) {
            plan.setStageId(request.getStageId());
        }
        if (request.getTitle() != null) {
            if (!StringUtils.hasText(request.getTitle())) {
                throw new RuntimeException("周期计划标题不能为空");
            }
            plan.setTitle(request.getTitle().trim());
        }
        if (request.getDescription() != null) {
            plan.setDescription(request.getDescription());
        }
        if (request.getPriority() != null) {
            plan.setPriority(normalizePriority(request.getPriority()));
        }
        if (StringUtils.hasText(request.getRecurrenceUnit())) {
            plan.setRecurrenceUnit(normalizeRecurrenceUnit(request.getRecurrenceUnit()));
        }
        if (request.getIntervalCount() != null) {
            plan.setIntervalCount(normalizeIntervalCount(request.getIntervalCount()));
        }
        if (request.getStartTime() != null) {
            plan.setStartTime(request.getStartTime());
        }
        if (request.getDueTime() != null) {
            plan.setDueTime(request.getDueTime());
        }
        if (request.getEndTime() != null) {
            plan.setEndTime(request.getEndTime());
        }
        if (request.getTimezone() != null) {
            plan.setTimezone(StringUtils.hasText(request.getTimezone()) ? request.getTimezone().trim() : DEFAULT_TIMEZONE);
        }
        if (request.getReminderEnabled() != null) {
            plan.setReminderEnabled(request.getReminderEnabled());
        }
        if (request.getReminderMinutesBefore() != null) {
            plan.setReminderMinutesBefore(normalizeReminderMinutes(request.getReminderMinutesBefore()));
        }
        if (request.getAutoCreateTask() != null) {
            plan.setAutoCreateTask(request.getAutoCreateTask());
        }
        if (request.getMaxOccurrences() != null) {
            plan.setMaxOccurrences(normalizeMaxOccurrences(request.getMaxOccurrences()));
        }

        validatePlanTime(plan);
        plan.setUpdatedAt(LocalDateTime.now());
        if (STATUS_ACTIVE.equals(plan.getStatus())) {
            refreshNextRunAt(plan, LocalDateTime.now());
        }
        this.updateById(plan);
        return getPlan(plan.getId(), operatorId);
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public RecurringPlanVO updateStatus(Long planId, String status, Long operatorId) {
        PmRecurringPlan plan = requireAccessiblePlan(planId, operatorId);
        plan.setStatus(normalizeStatus(status));
        plan.setUpdatedAt(LocalDateTime.now());
        if (STATUS_ACTIVE.equals(plan.getStatus())) {
            refreshNextRunAt(plan, LocalDateTime.now());
        }
        this.updateById(plan);
        return getPlan(plan.getId(), operatorId);
    }

    @Override
    public PageVO<RecurringPlanOccurrenceVO> listOccurrences(Long planId,
                                                             RecurringPlanOccurrenceQueryRequest request,
                                                             Long operatorId) {
        requireAccessiblePlan(planId, operatorId);
        RecurringPlanOccurrenceQueryRequest safeRequest =
                request == null ? new RecurringPlanOccurrenceQueryRequest() : request;

        Page<PmRecurringPlanOccurrence> page =
                new Page<>(normalizeCurrent(safeRequest.getCurrent()), normalizeSize(safeRequest.getSize()));
        LambdaQueryWrapper<PmRecurringPlanOccurrence> query = new LambdaQueryWrapper<>();
        query.eq(PmRecurringPlanOccurrence::getPlanId, planId);
        if (StringUtils.hasText(safeRequest.getStatus())) {
            String occurrenceStatus = normalizeOccurrenceStatus(safeRequest.getStatus());
            if (OCCURRENCE_STATUS_OVERDUE.equals(occurrenceStatus)) {
                query.notIn(PmRecurringPlanOccurrence::getStatus,
                                OCCURRENCE_STATUS_DONE,
                                OCCURRENCE_STATUS_SKIPPED,
                                OCCURRENCE_STATUS_DEFERRED,
                                OCCURRENCE_STATUS_CANCELLED)
                        .lt(PmRecurringPlanOccurrence::getDueTime, LocalDateTime.now());
            } else {
                query.eq(PmRecurringPlanOccurrence::getStatus, occurrenceStatus);
            }
        }
        query.orderByDesc(PmRecurringPlanOccurrence::getOccurrenceNo)
                .orderByDesc(PmRecurringPlanOccurrence::getCreatedAt);

        Page<PmRecurringPlanOccurrence> resultPage = occurrenceMapper.selectPage(page, query);
        List<RecurringPlanOccurrenceVO> records = convertOccurrencesToVOs(resultPage.getRecords());
        return PageVO.of(records, resultPage.getTotal(), (int) resultPage.getCurrent(), (int) resultPage.getSize());
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public RecurringPlanGenerateTaskResponse generateCurrentOccurrenceTask(Long planId, Long operatorId) {
        PmRecurringPlan plan = requireExistingPlan(planId, operatorId);
        validateGenerateTaskPlan(plan, operatorId);

        LocalDateTime now = LocalDateTime.now();
        PmRecurringPlanOccurrence occurrence = getOrCreateCurrentPendingOccurrence(plan, now);
        if (occurrence.getGeneratedTaskId() != null) {
            TaskDTO task = requireGeneratedTask(occurrence.getGeneratedTaskId());
            return buildGenerateTaskResponse(plan, occurrence, task, true);
        }

        TaskRequest taskRequest = buildTaskRequest(plan, occurrence);
        TaskDTO task = pmTaskService.createTask(taskRequest, operatorId);
        occurrence.setGeneratedTaskId(task.getId());
        occurrence.setUpdatedAt(LocalDateTime.now());
        occurrenceMapper.updateById(occurrence);
        return buildGenerateTaskResponse(plan, occurrence, task, false);
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public RecurringPlanVO completeCurrentOccurrence(Long planId,
                                                     RecurringPlanOccurrenceActionRequest request,
                                                     Long operatorId) {
        return handleCurrentOccurrence(planId, OCCURRENCE_STATUS_DONE, request, operatorId);
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public RecurringPlanVO skipCurrentOccurrence(Long planId,
                                                 RecurringPlanOccurrenceActionRequest request,
                                                 Long operatorId) {
        return handleCurrentOccurrence(planId, OCCURRENCE_STATUS_SKIPPED, request, operatorId);
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public RecurringPlanVO deferCurrentOccurrence(Long planId,
                                                  RecurringPlanOccurrenceActionRequest request,
                                                  Long operatorId) {
        return handleCurrentOccurrence(planId, OCCURRENCE_STATUS_DEFERRED, request, operatorId);
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public void deletePlan(Long planId, Long operatorId) {
        PmRecurringPlan plan = requireDeletablePlan(planId, operatorId);
        this.removeById(plan.getId());

        LambdaQueryWrapper<PmRecurringPlanAssignee> deleteAssignees = new LambdaQueryWrapper<>();
        deleteAssignees.eq(PmRecurringPlanAssignee::getPlanId, plan.getId());
        assigneeMapper.delete(deleteAssignees);
    }

    private RecurringPlanVO handleCurrentOccurrence(Long planId,
                                                    String occurrenceStatus,
                                                    RecurringPlanOccurrenceActionRequest request,
                                                    Long operatorId) {
        PmRecurringPlan plan = requireAccessiblePlan(planId, operatorId);
        if (!STATUS_ACTIVE.equals(plan.getStatus())) {
            throw new RuntimeException("只有启用中的周期计划才能处理本期");
        }
        if (plan.getNextRunAt() == null) {
            throw new RuntimeException("周期计划暂无下一次执行时间");
        }

        LocalDateTime now = LocalDateTime.now();
        PmRecurringPlanOccurrence occurrence = findCurrentPendingOccurrence(plan);
        if (occurrence == null) {
            occurrence = buildCurrentOccurrence(plan, occurrenceStatus, now);
        } else {
            occurrence.setStatus(occurrenceStatus);
        }
        occurrence.setCompletedAt(now);
        occurrence.setCompletedBy(operatorId);
        occurrence.setNotes(normalizeOccurrenceNotes(request == null ? null : request.getNotes(), occurrenceStatus));
        occurrence.setUpdatedAt(now);
        if (occurrence.getId() == null) {
            occurrenceMapper.insert(occurrence);
        } else {
            occurrenceMapper.updateById(occurrence);
        }

        plan.setLastRunAt(occurrence.getScheduledStartAt());
        plan.setGeneratedCount(Math.max(plan.getGeneratedCount() == null ? 0 : plan.getGeneratedCount(),
                occurrence.getOccurrenceNo() == null ? 0 : occurrence.getOccurrenceNo()));
        plan.setUpdatedAt(now);
        refreshNextRunAt(plan, now);
        this.updateById(plan);
        return getPlan(plan.getId(), operatorId);
    }

    private void validateGenerateTaskPlan(PmRecurringPlan plan, Long operatorId) {
        if (!STATUS_ACTIVE.equals(plan.getStatus())) {
            throw new RuntimeException("只有启用中的周期计划才能生成本期任务");
        }
        if (!Boolean.TRUE.equals(plan.getAutoCreateTask())) {
            throw new RuntimeException("该周期计划未开启自动生成任务");
        }
        if (plan.getNextRunAt() == null) {
            throw new RuntimeException("周期计划暂无下一次执行时间");
        }
        if (plan.getProjectId() == null || plan.getStageId() == null) {
            throw new RuntimeException("自动生成任务需要先配置项目和看板阶段");
        }

        PmProject project = permissionService.getProject(plan.getProjectId());
        if (project == null) {
            throw new RuntimeException("关联项目不存在或已删除");
        }
        PmTaskStage stage = taskStageMapper.selectById(plan.getStageId());
        if (stage == null) {
            throw new RuntimeException("关联看板阶段不存在");
        }
        if (!Objects.equals(stage.getProjectId(), plan.getProjectId())) {
            throw new RuntimeException("关联看板阶段不属于该项目");
        }

        if (!canGenerateTaskForPlan(plan, operatorId)) {
            permissionService.checkTaskWritePermission(plan.getProjectId(), operatorId);
        }
    }

    private boolean canGenerateTaskForPlan(PmRecurringPlan plan, Long operatorId) {
        return sysUserService.isSuperAdmin(operatorId)
                || Objects.equals(plan.getCreatorId(), operatorId)
                || isResponsibleAssignee(plan.getId(), operatorId);
    }

    private PmRecurringPlanOccurrence getOrCreateCurrentPendingOccurrence(PmRecurringPlan plan, LocalDateTime now) {
        PmRecurringPlanOccurrence existing = findCurrentPendingOccurrence(plan);
        if (existing != null) {
            return existing;
        }
        PmRecurringPlanOccurrence occurrence = buildCurrentOccurrence(plan, OCCURRENCE_STATUS_PENDING, now);
        occurrenceMapper.insert(occurrence);
        return occurrence;
    }

    private PmRecurringPlanOccurrence buildCurrentOccurrence(PmRecurringPlan plan,
                                                             String occurrenceStatus,
                                                             LocalDateTime now) {
        PmRecurringPlanOccurrence occurrence = new PmRecurringPlanOccurrence();
        occurrence.setPlanId(plan.getId());
        occurrence.setOccurrenceNo(resolveNextOccurrenceNo(plan.getId(), plan.getGeneratedCount()));
        occurrence.setTitle(plan.getTitle());
        occurrence.setStatus(occurrenceStatus);
        occurrence.setScheduledStartAt(plan.getNextRunAt());
        occurrence.setDueTime(calculateNextDueTime(plan));
        occurrence.setAssigneeSnapshot(buildAssigneeSnapshot(plan.getId()));
        occurrence.setCreatedAt(now);
        occurrence.setUpdatedAt(now);
        return occurrence;
    }

    private PmRecurringPlanOccurrence findCurrentPendingOccurrence(PmRecurringPlan plan) {
        if (plan == null || plan.getId() == null || plan.getNextRunAt() == null) {
            return null;
        }
        LambdaQueryWrapper<PmRecurringPlanOccurrence> query = new LambdaQueryWrapper<>();
        query.eq(PmRecurringPlanOccurrence::getPlanId, plan.getId())
                .eq(PmRecurringPlanOccurrence::getStatus, OCCURRENCE_STATUS_PENDING)
                .eq(PmRecurringPlanOccurrence::getScheduledStartAt, plan.getNextRunAt())
                .orderByDesc(PmRecurringPlanOccurrence::getOccurrenceNo)
                .last("LIMIT 1");
        return occurrenceMapper.selectOne(query);
    }

    private TaskRequest buildTaskRequest(PmRecurringPlan plan, PmRecurringPlanOccurrence occurrence) {
        List<Long> assigneeIds = loadResponsibleAssigneeIds(plan.getId());
        TaskRequest request = new TaskRequest();
        request.setProjectId(plan.getProjectId());
        request.setStageId(plan.getStageId());
        request.setTitle(buildGeneratedTaskTitle(plan, occurrence));
        request.setDescription(buildGeneratedTaskDescription(plan, occurrence));
        request.setPriority(normalizePriority(plan.getPriority()));
        request.setDueTime(occurrence.getDueTime());
        request.setAssigneeIds(assigneeIds);
        request.setFollowerIds(buildGeneratedTaskFollowerIds(plan, assigneeIds));
        return request;
    }

    private String buildGeneratedTaskTitle(PmRecurringPlan plan, PmRecurringPlanOccurrence occurrence) {
        String title = plan.getTitle() + "（第" + occurrence.getOccurrenceNo() + "期）";
        return title.length() <= 200 ? title : title.substring(0, 200);
    }

    private String buildGeneratedTaskDescription(PmRecurringPlan plan, PmRecurringPlanOccurrence occurrence) {
        StringBuilder description = new StringBuilder();
        if (StringUtils.hasText(plan.getDescription())) {
            description.append(plan.getDescription().trim());
            description.append("\n\n");
        }
        description.append("来源：周期计划 #")
                .append(plan.getId())
                .append("，第")
                .append(occurrence.getOccurrenceNo())
                .append("期。");
        description.append("\n本期开始：").append(occurrence.getScheduledStartAt());
        if (occurrence.getDueTime() != null) {
            description.append("\n本期截止：").append(occurrence.getDueTime());
        }
        return description.toString();
    }

    private List<Long> buildGeneratedTaskFollowerIds(PmRecurringPlan plan, List<Long> assigneeIds) {
        if (plan.getCreatorId() == null) {
            return Collections.emptyList();
        }
        Set<Long> assigneeSet = assigneeIds == null ? Collections.emptySet() : new HashSet<>(assigneeIds);
        return assigneeSet.contains(plan.getCreatorId())
                ? Collections.emptyList()
                : Collections.singletonList(plan.getCreatorId());
    }

    private TaskDTO requireGeneratedTask(Long taskId) {
        try {
            return pmTaskService.getTaskDetail(taskId);
        } catch (RuntimeException e) {
            throw new RuntimeException("本期已关联生成任务，但任务不存在或已删除");
        }
    }

    private RecurringPlanGenerateTaskResponse buildGenerateTaskResponse(PmRecurringPlan plan,
                                                                        PmRecurringPlanOccurrence occurrence,
                                                                        TaskDTO task,
                                                                        boolean reused) {
        RecurringPlanGenerateTaskResponse response = new RecurringPlanGenerateTaskResponse();
        response.setPlanId(plan.getId());
        response.setOccurrenceId(occurrence.getId());
        response.setOccurrenceNo(occurrence.getOccurrenceNo());
        response.setProjectId(plan.getProjectId());
        response.setStageId(plan.getStageId());
        response.setGeneratedTaskId(occurrence.getGeneratedTaskId());
        response.setReused(reused);
        response.setTask(task);
        response.setOccurrence(convertOccurrenceToVO(occurrence, Collections.emptyMap(), LocalDateTime.now()));
        return response;
    }

    private Integer resolveNextOccurrenceNo(Long planId, Integer generatedCount) {
        int countValue = generatedCount == null ? 0 : generatedCount;
        LambdaQueryWrapper<PmRecurringPlanOccurrence> query = new LambdaQueryWrapper<>();
        query.eq(PmRecurringPlanOccurrence::getPlanId, planId)
                .orderByDesc(PmRecurringPlanOccurrence::getOccurrenceNo)
                .last("LIMIT 1");
        PmRecurringPlanOccurrence latest = occurrenceMapper.selectOne(query);
        int latestNo = latest == null || latest.getOccurrenceNo() == null ? 0 : latest.getOccurrenceNo();
        return Math.max(countValue, latestNo) + 1;
    }

    private String buildAssigneeSnapshot(Long planId) {
        List<PmRecurringPlanAssignee> assigneeLinks =
                loadAssigneeMap(Collections.singleton(planId)).getOrDefault(planId, Collections.emptyList());
        Set<Long> userIds = assigneeLinks.stream()
                .map(PmRecurringPlanAssignee::getUserId)
                .filter(Objects::nonNull)
                .collect(Collectors.toCollection(LinkedHashSet::new));
        Map<Long, SysUser> userMap = loadUserMap(userIds);
        List<Map<String, Object>> snapshot = new ArrayList<>();
        for (PmRecurringPlanAssignee link : assigneeLinks) {
            SysUser user = userMap.get(link.getUserId());
            Map<String, Object> item = new LinkedHashMap<>();
            item.put("userId", link.getUserId());
            item.put("nickname", resolveUserDisplayName(user));
            item.put("avatar", user == null ? null : user.getAvatar());
            snapshot.add(item);
        }
        try {
            return objectMapper.writeValueAsString(snapshot);
        } catch (JsonProcessingException e) {
            return "[]";
        }
    }

    private String normalizeOccurrenceNotes(String notes, String occurrenceStatus) {
        String trimmed = notes == null ? "" : notes.trim();
        if (StringUtils.hasText(trimmed)) {
            return trimmed.length() > 500 ? trimmed.substring(0, 500) : trimmed;
        }
        if (OCCURRENCE_STATUS_DEFERRED.equals(occurrenceStatus)) {
            return "本期已延期到下一期";
        }
        return null;
    }

    private void validateCreateRequest(RecurringPlanCreateRequest request) {
        if (request == null) {
            throw new RuntimeException("周期计划创建内容不能为空");
        }
        if (!StringUtils.hasText(request.getTitle())) {
            throw new RuntimeException("周期计划标题不能为空");
        }
        normalizeRecurrenceUnit(request.getRecurrenceUnit());
        normalizeIntervalCount(request.getIntervalCount());
        if (request.getStartTime() == null) {
            throw new RuntimeException("计划开始时间不能为空");
        }
        if (request.getDueTime() != null && request.getDueTime().isBefore(request.getStartTime())) {
            throw new RuntimeException("截止时间不能早于开始时间");
        }
        if (request.getEndTime() != null && request.getEndTime().isBefore(request.getStartTime())) {
            throw new RuntimeException("周期结束时间不能早于开始时间");
        }
    }

    private void validatePlanTime(PmRecurringPlan plan) {
        if (plan.getStartTime() == null) {
            throw new RuntimeException("计划开始时间不能为空");
        }
        if (plan.getDueTime() != null && plan.getDueTime().isBefore(plan.getStartTime())) {
            throw new RuntimeException("截止时间不能早于开始时间");
        }
        if (plan.getEndTime() != null && plan.getEndTime().isBefore(plan.getStartTime())) {
            throw new RuntimeException("周期结束时间不能早于开始时间");
        }
    }

    private void refreshNextRunAt(PmRecurringPlan plan, LocalDateTime from) {
        RecurringPlanScheduleCalculator.OccurrenceWindow nextWindow =
                RecurringPlanScheduleCalculator.calculateNextWindow(
                        plan.getStartTime(),
                        plan.getDueTime(),
                        plan.getRecurrenceUnit(),
                        plan.getIntervalCount(),
                        from
                );
        if (plan.getEndTime() != null && nextWindow.startAt().isAfter(plan.getEndTime())) {
            plan.setStatus(STATUS_FINISHED);
            plan.setNextRunAt(null);
            return;
        }
        if (plan.getMaxOccurrences() != null
                && plan.getGeneratedCount() != null
                && plan.getGeneratedCount() >= plan.getMaxOccurrences()) {
            plan.setStatus(STATUS_FINISHED);
            plan.setNextRunAt(null);
            return;
        }
        plan.setNextRunAt(nextWindow.startAt());
    }

    private PmRecurringPlan requireAccessiblePlan(Long planId, Long operatorId) {
        PmRecurringPlan plan = requireExistingPlan(planId, operatorId);
        if (!canViewOrEditPlan(plan, operatorId)) {
            throw new RuntimeException("无权访问该周期计划");
        }
        return plan;
    }

    private PmRecurringPlan requireDeletablePlan(Long planId, Long operatorId) {
        PmRecurringPlan plan = requireExistingPlan(planId, operatorId);
        if (!sysUserService.isSuperAdmin(operatorId) && !Objects.equals(plan.getCreatorId(), operatorId)) {
            throw new RuntimeException("无权删除该周期计划");
        }
        return plan;
    }

    private PmRecurringPlan requireExistingPlan(Long planId, Long operatorId) {
        requireLogin(operatorId);
        if (planId == null) {
            throw new RuntimeException("周期计划ID不能为空");
        }
        PmRecurringPlan plan = this.getById(planId);
        if (plan == null) {
            throw new RuntimeException("周期计划不存在");
        }
        return plan;
    }

    private boolean canViewOrEditPlan(PmRecurringPlan plan, Long operatorId) {
        return sysUserService.isSuperAdmin(operatorId)
                || Objects.equals(plan.getCreatorId(), operatorId)
                || isResponsibleAssignee(plan.getId(), operatorId);
    }

    private boolean isResponsibleAssignee(Long planId, Long userId) {
        if (planId == null || userId == null) {
            return false;
        }
        LambdaQueryWrapper<PmRecurringPlanAssignee> query = new LambdaQueryWrapper<>();
        query.eq(PmRecurringPlanAssignee::getPlanId, planId)
                .eq(PmRecurringPlanAssignee::getUserId, userId)
                .eq(PmRecurringPlanAssignee::getRole, ASSIGNEE_ROLE_RESPONSIBLE);
        Long count = assigneeMapper.selectCount(query);
        return count != null && count > 0;
    }

    private Set<Long> loadResponsiblePlanIds(Long userId) {
        if (userId == null) {
            return Collections.emptySet();
        }
        LambdaQueryWrapper<PmRecurringPlanAssignee> query = new LambdaQueryWrapper<>();
        query.eq(PmRecurringPlanAssignee::getUserId, userId)
                .eq(PmRecurringPlanAssignee::getRole, ASSIGNEE_ROLE_RESPONSIBLE);
        return assigneeMapper.selectList(query).stream()
                .map(PmRecurringPlanAssignee::getPlanId)
                .filter(Objects::nonNull)
                .collect(Collectors.toSet());
    }

    private List<Long> normalizeAndValidateAssigneeIds(List<Long> assigneeIds) {
        if (assigneeIds == null || assigneeIds.isEmpty()) {
            throw new RuntimeException("负责人不能为空");
        }
        LinkedHashSet<Long> normalized = assigneeIds.stream()
                .filter(Objects::nonNull)
                .filter(id -> id > 0)
                .collect(Collectors.toCollection(LinkedHashSet::new));
        if (normalized.isEmpty()) {
            throw new RuntimeException("负责人不能为空");
        }

        List<SysUser> users = userMapper.selectBatchIds(normalized);
        Set<Long> existingUserIds = users.stream().map(SysUser::getId).collect(Collectors.toSet());
        for (Long userId : normalized) {
            if (!existingUserIds.contains(userId)) {
                throw new RuntimeException("负责人不存在：" + userId);
            }
        }
        return new ArrayList<>(normalized);
    }

    private List<Long> loadResponsibleAssigneeIds(Long planId) {
        if (planId == null) {
            return Collections.emptyList();
        }
        LambdaQueryWrapper<PmRecurringPlanAssignee> query = new LambdaQueryWrapper<>();
        query.eq(PmRecurringPlanAssignee::getPlanId, planId)
                .eq(PmRecurringPlanAssignee::getRole, ASSIGNEE_ROLE_RESPONSIBLE)
                .orderByAsc(PmRecurringPlanAssignee::getId);
        return assigneeMapper.selectList(query).stream()
                .map(PmRecurringPlanAssignee::getUserId)
                .filter(Objects::nonNull)
                .distinct()
                .collect(Collectors.toList());
    }

    private void replaceAssignees(Long planId, List<Long> assigneeIds) {
        LambdaQueryWrapper<PmRecurringPlanAssignee> deleteQuery = new LambdaQueryWrapper<>();
        deleteQuery.eq(PmRecurringPlanAssignee::getPlanId, planId);
        assigneeMapper.delete(deleteQuery);

        LocalDateTime now = LocalDateTime.now();
        for (Long assigneeId : assigneeIds) {
            PmRecurringPlanAssignee assignee = new PmRecurringPlanAssignee();
            assignee.setPlanId(planId);
            assignee.setUserId(assigneeId);
            assignee.setRole(ASSIGNEE_ROLE_RESPONSIBLE);
            assignee.setCreatedAt(now);
            assigneeMapper.insert(assignee);
        }
    }

    private List<RecurringPlanVO> convertToVOs(List<PmRecurringPlan> plans) {
        if (plans == null || plans.isEmpty()) {
            return Collections.emptyList();
        }

        Set<Long> planIds = new HashSet<>();
        Set<Long> userIds = new HashSet<>();
        for (PmRecurringPlan plan : plans) {
            if (plan.getId() != null) {
                planIds.add(plan.getId());
            }
            if (plan.getCreatorId() != null) {
                userIds.add(plan.getCreatorId());
            }
        }

        Map<Long, List<PmRecurringPlanAssignee>> assigneeMap = loadAssigneeMap(planIds);
        for (List<PmRecurringPlanAssignee> assignees : assigneeMap.values()) {
            for (PmRecurringPlanAssignee assignee : assignees) {
                if (assignee.getUserId() != null) {
                    userIds.add(assignee.getUserId());
                }
            }
        }

        Map<Long, SysUser> userMap = loadUserMap(userIds);
        Map<Long, PmRecurringPlanOccurrence> currentOccurrenceMap = loadCurrentPendingOccurrenceMap(plans);
        List<RecurringPlanVO> result = new ArrayList<>();
        LocalDateTime now = LocalDateTime.now();
        for (PmRecurringPlan plan : plans) {
            result.add(convertToVO(plan,
                    assigneeMap.getOrDefault(plan.getId(), Collections.emptyList()),
                    userMap,
                    currentOccurrenceMap.get(plan.getId()),
                    now));
        }
        return result;
    }

    private Map<Long, PmRecurringPlanOccurrence> loadCurrentPendingOccurrenceMap(List<PmRecurringPlan> plans) {
        if (plans == null || plans.isEmpty()) {
            return Collections.emptyMap();
        }
        Set<Long> planIds = new HashSet<>();
        Map<Long, LocalDateTime> nextRunAtMap = new HashMap<>();
        for (PmRecurringPlan plan : plans) {
            if (plan.getId() != null && plan.getNextRunAt() != null) {
                planIds.add(plan.getId());
                nextRunAtMap.put(plan.getId(), plan.getNextRunAt());
            }
        }
        if (planIds.isEmpty()) {
            return Collections.emptyMap();
        }

        LambdaQueryWrapper<PmRecurringPlanOccurrence> query = new LambdaQueryWrapper<>();
        query.in(PmRecurringPlanOccurrence::getPlanId, planIds)
                .eq(PmRecurringPlanOccurrence::getStatus, OCCURRENCE_STATUS_PENDING)
                .orderByDesc(PmRecurringPlanOccurrence::getOccurrenceNo);
        Map<Long, PmRecurringPlanOccurrence> result = new HashMap<>();
        List<PmRecurringPlanOccurrence> occurrences = occurrenceMapper.selectList(query);
        if (occurrences == null || occurrences.isEmpty()) {
            return result;
        }
        for (PmRecurringPlanOccurrence occurrence : occurrences) {
            LocalDateTime nextRunAt = nextRunAtMap.get(occurrence.getPlanId());
            if (Objects.equals(nextRunAt, occurrence.getScheduledStartAt())) {
                result.putIfAbsent(occurrence.getPlanId(), occurrence);
            }
        }
        return result;
    }

    private List<RecurringPlanOccurrenceVO> convertOccurrencesToVOs(List<PmRecurringPlanOccurrence> occurrences) {
        if (occurrences == null || occurrences.isEmpty()) {
            return Collections.emptyList();
        }
        Set<Long> userIds = occurrences.stream()
                .map(PmRecurringPlanOccurrence::getCompletedBy)
                .filter(Objects::nonNull)
                .collect(Collectors.toCollection(HashSet::new));
        Map<Long, SysUser> userMap = loadUserMap(userIds);
        LocalDateTime now = LocalDateTime.now();
        return occurrences.stream()
                .map(occurrence -> convertOccurrenceToVO(occurrence, userMap, now))
                .collect(Collectors.toList());
    }

    private RecurringPlanOccurrenceVO convertOccurrenceToVO(PmRecurringPlanOccurrence occurrence,
                                                            Map<Long, SysUser> userMap,
                                                            LocalDateTime now) {
        RecurringPlanOccurrenceVO vo = new RecurringPlanOccurrenceVO();
        vo.setId(occurrence.getId());
        vo.setPlanId(occurrence.getPlanId());
        vo.setOccurrenceNo(occurrence.getOccurrenceNo());
        vo.setTitle(occurrence.getTitle());
        vo.setStatus(occurrence.getStatus());
        vo.setScheduledStartAt(occurrence.getScheduledStartAt());
        vo.setDueTime(occurrence.getDueTime());
        vo.setCompletedAt(occurrence.getCompletedAt());
        vo.setCompletedBy(occurrence.getCompletedBy());
        vo.setCompletedByName(resolveUserDisplayName(userMap.get(occurrence.getCompletedBy())));
        vo.setGeneratedTaskId(occurrence.getGeneratedTaskId());
        vo.setAssignees(parseAssigneeSnapshot(occurrence.getAssigneeSnapshot()));
        vo.setNotes(occurrence.getNotes());
        OverdueState overdueState = resolveOccurrenceOverdueState(occurrence, now);
        vo.setOverdue(overdueState.overdue());
        vo.setOverdueReason(overdueState.reason());
        vo.setCreatedAt(occurrence.getCreatedAt());
        vo.setUpdatedAt(occurrence.getUpdatedAt());
        return vo;
    }

    private List<AssigneeVO> parseAssigneeSnapshot(String snapshot) {
        if (!StringUtils.hasText(snapshot)) {
            return Collections.emptyList();
        }
        try {
            List<AssigneeVO> assignees = objectMapper.readValue(snapshot, new TypeReference<List<AssigneeVO>>() {
            });
            return assignees == null ? Collections.emptyList() : assignees;
        } catch (JsonProcessingException e) {
            return Collections.emptyList();
        }
    }

    private OverdueState resolveOccurrenceOverdueState(PmRecurringPlanOccurrence occurrence, LocalDateTime now) {
        if (isOccurrenceResolved(occurrence)) {
            return OverdueState.notOverdue();
        }
        LocalDateTime dueAt = occurrence.getDueTime();
        if (dueAt != null && dueAt.isBefore(now)) {
            return new OverdueState(true, "本期截止时间已早于当前时间，且该执行记录未完成、未跳过或未延期");
        }
        return OverdueState.notOverdue();
    }

    private boolean isOccurrenceResolved(PmRecurringPlanOccurrence occurrence) {
        String status = occurrence.getStatus();
        return OCCURRENCE_STATUS_DONE.equals(status)
                || OCCURRENCE_STATUS_SKIPPED.equals(status)
                || OCCURRENCE_STATUS_DEFERRED.equals(status)
                || OCCURRENCE_STATUS_CANCELLED.equals(status);
    }

    private Map<Long, List<PmRecurringPlanAssignee>> loadAssigneeMap(Set<Long> planIds) {
        if (planIds == null || planIds.isEmpty()) {
            return Collections.emptyMap();
        }
        LambdaQueryWrapper<PmRecurringPlanAssignee> query = new LambdaQueryWrapper<>();
        query.in(PmRecurringPlanAssignee::getPlanId, planIds)
                .eq(PmRecurringPlanAssignee::getRole, ASSIGNEE_ROLE_RESPONSIBLE)
                .orderByAsc(PmRecurringPlanAssignee::getId);
        List<PmRecurringPlanAssignee> assignees = assigneeMapper.selectList(query);
        return assignees.stream().collect(Collectors.groupingBy(PmRecurringPlanAssignee::getPlanId));
    }

    private Map<Long, SysUser> loadUserMap(Set<Long> userIds) {
        if (userIds == null || userIds.isEmpty()) {
            return Collections.emptyMap();
        }
        Map<Long, SysUser> userMap = new HashMap<>();
        for (SysUser user : userMapper.selectBatchIds(userIds)) {
            if (user != null && user.getId() != null) {
                userMap.put(user.getId(), user);
            }
        }
        return userMap;
    }

    private RecurringPlanVO convertToVO(PmRecurringPlan plan,
                                        List<PmRecurringPlanAssignee> assigneeLinks,
                                        Map<Long, SysUser> userMap,
                                        PmRecurringPlanOccurrence currentOccurrence,
                                        LocalDateTime now) {
        RecurringPlanVO vo = new RecurringPlanVO();
        vo.setId(plan.getId());
        vo.setProjectId(plan.getProjectId());
        vo.setStageId(plan.getStageId());
        vo.setTitle(plan.getTitle());
        vo.setDescription(plan.getDescription());
        vo.setPriority(plan.getPriority());
        vo.setStatus(plan.getStatus());
        vo.setRecurrenceUnit(plan.getRecurrenceUnit());
        vo.setIntervalCount(plan.getIntervalCount());
        vo.setStartTime(plan.getStartTime());
        vo.setDueTime(plan.getDueTime());
        vo.setEndTime(plan.getEndTime());
        vo.setNextRunAt(plan.getNextRunAt());
        vo.setNextDueTime(calculateNextDueTime(plan));
        vo.setLastRunAt(plan.getLastRunAt());
        vo.setTimezone(plan.getTimezone());
        vo.setReminderEnabled(Boolean.TRUE.equals(plan.getReminderEnabled()));
        vo.setReminderMinutesBefore(plan.getReminderMinutesBefore());
        vo.setAutoCreateTask(Boolean.TRUE.equals(plan.getAutoCreateTask()));
        vo.setMaxOccurrences(plan.getMaxOccurrences());
        vo.setGeneratedCount(plan.getGeneratedCount());
        vo.setCreatorId(plan.getCreatorId());
        SysUser creator = userMap.get(plan.getCreatorId());
        vo.setCreatorName(resolveUserDisplayName(creator));
        vo.setCreatorAvatar(creator == null ? null : creator.getAvatar());
        vo.setAssignees(convertAssignees(assigneeLinks, userMap));
        vo.setAssigneeIds(vo.getAssignees().stream().map(AssigneeVO::getUserId).collect(Collectors.toList()));
        OverdueState overdueState = resolvePlanOverdueState(plan, vo.getNextDueTime(), now);
        vo.setOverdue(overdueState.overdue());
        vo.setOverdueReason(overdueState.reason());
        vo.setCurrentOccurrenceStatus(resolveCurrentOccurrenceStatus(plan, overdueState));
        vo.setCurrentOccurrenceActionable(isCurrentOccurrenceActionable(plan));
        if (currentOccurrence != null) {
            vo.setCurrentOccurrenceId(currentOccurrence.getId());
            vo.setCurrentOccurrenceNo(currentOccurrence.getOccurrenceNo());
            vo.setCurrentGeneratedTaskId(currentOccurrence.getGeneratedTaskId());
        }
        vo.setCreatedAt(plan.getCreatedAt());
        vo.setUpdatedAt(plan.getUpdatedAt());
        return vo;
    }

    private List<AssigneeVO> convertAssignees(List<PmRecurringPlanAssignee> assigneeLinks, Map<Long, SysUser> userMap) {
        List<AssigneeVO> assignees = new ArrayList<>();
        for (PmRecurringPlanAssignee link : assigneeLinks) {
            SysUser user = userMap.get(link.getUserId());
            AssigneeVO vo = new AssigneeVO();
            vo.setUserId(link.getUserId());
            vo.setNickname(resolveUserDisplayName(user));
            vo.setAvatar(user == null ? null : user.getAvatar());
            assignees.add(vo);
        }
        return assignees;
    }

    private LocalDateTime calculateNextDueTime(PmRecurringPlan plan) {
        if (plan.getNextRunAt() == null || plan.getDueTime() == null) {
            return null;
        }
        Duration duration = Duration.between(plan.getStartTime(), plan.getDueTime());
        return duration.isNegative() ? plan.getNextRunAt() : plan.getNextRunAt().plus(duration);
    }

    private OverdueState resolvePlanOverdueState(PmRecurringPlan plan, LocalDateTime nextDueTime, LocalDateTime now) {
        if (!STATUS_ACTIVE.equals(plan.getStatus()) || plan.getNextRunAt() == null) {
            return OverdueState.notOverdue();
        }
        if (nextDueTime != null) {
            if (nextDueTime.isBefore(now)) {
                return new OverdueState(true, "本期截止时间已早于当前时间，且当前执行实例未完成、未跳过或未延期");
            }
            return OverdueState.notOverdue();
        }
        return OverdueState.notOverdue();
    }

    private String resolveCurrentOccurrenceStatus(PmRecurringPlan plan, OverdueState overdueState) {
        if (!STATUS_ACTIVE.equals(plan.getStatus()) || plan.getNextRunAt() == null) {
            return CURRENT_OCCURRENCE_STATUS_NONE;
        }
        return overdueState.overdue() ? OCCURRENCE_STATUS_OVERDUE : OCCURRENCE_STATUS_PENDING;
    }

    private boolean isCurrentOccurrenceActionable(PmRecurringPlan plan) {
        return STATUS_ACTIVE.equals(plan.getStatus()) && plan.getNextRunAt() != null;
    }

    private String resolveUserDisplayName(SysUser user) {
        if (user == null) {
            return "";
        }
        if (StringUtils.hasText(user.getNickname())) {
            return user.getNickname();
        }
        return user.getUsername();
    }

    private void requireLogin(Long operatorId) {
        if (operatorId == null) {
            throw new RuntimeException("用户未登录");
        }
    }

    private int normalizeCurrent(Integer current) {
        return current == null || current < 1 ? 1 : current;
    }

    private int normalizeSize(Integer size) {
        if (size == null || size < 1) {
            return 10;
        }
        return Math.min(size, 100);
    }

    private int normalizePriority(Integer priority) {
        if (priority == null) {
            return 1;
        }
        if (priority < 1 || priority > 3) {
            throw new RuntimeException("优先级只能为 1、2、3");
        }
        return priority;
    }

    private int normalizeIntervalCount(Integer intervalCount) {
        if (intervalCount == null) {
            return 1;
        }
        if (intervalCount < 1 || intervalCount > 120) {
            throw new RuntimeException("周期间隔必须在 1 到 120 之间");
        }
        return intervalCount;
    }

    private Integer normalizeReminderMinutes(Integer reminderMinutesBefore) {
        if (reminderMinutesBefore == null) {
            return null;
        }
        if (reminderMinutesBefore < 0 || reminderMinutesBefore > 43200) {
            throw new RuntimeException("提醒提前分钟数必须在 0 到 43200 之间");
        }
        return reminderMinutesBefore;
    }

    private Integer normalizeMaxOccurrences(Integer maxOccurrences) {
        if (maxOccurrences == null) {
            return null;
        }
        if (maxOccurrences < 1) {
            throw new RuntimeException("最多生成次数必须大于 0");
        }
        return maxOccurrences;
    }

    private String normalizeRecurrenceUnit(String recurrenceUnit) {
        if (!StringUtils.hasText(recurrenceUnit)) {
            throw new RuntimeException("周期单位不能为空");
        }
        String normalized = recurrenceUnit.trim().toUpperCase();
        if (!ALLOWED_RECURRENCE_UNITS.contains(normalized)) {
            throw new RuntimeException("不支持的周期单位：" + recurrenceUnit);
        }
        return normalized;
    }

    private String normalizeStatus(String status) {
        if (!StringUtils.hasText(status)) {
            throw new RuntimeException("状态不能为空");
        }
        String normalized = status.trim().toUpperCase();
        if (!ALLOWED_STATUS.contains(normalized)) {
            throw new RuntimeException("不支持的状态：" + status);
        }
        return normalized;
    }

    private String normalizeOccurrenceStatus(String status) {
        if (!StringUtils.hasText(status)) {
            throw new RuntimeException("执行记录状态不能为空");
        }
        String normalized = status.trim().toUpperCase();
        if (!ALLOWED_OCCURRENCE_STATUS.contains(normalized)) {
            throw new RuntimeException("不支持的执行记录状态：" + status);
        }
        return normalized;
    }

    private record OverdueState(boolean overdue, String reason) {

        private static OverdueState notOverdue() {
            return new OverdueState(false, null);
        }
    }
}
