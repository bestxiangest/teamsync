package top.sharpcaterpillar.teamsync.service.impl;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;
import top.sharpcaterpillar.teamsync.dto.CalendarEventQueryRequest;
import top.sharpcaterpillar.teamsync.entity.PmProject;
import top.sharpcaterpillar.teamsync.entity.PmProjectMember;
import top.sharpcaterpillar.teamsync.entity.PmRecurringPlan;
import top.sharpcaterpillar.teamsync.entity.PmRecurringPlanAssignee;
import top.sharpcaterpillar.teamsync.entity.PmTask;
import top.sharpcaterpillar.teamsync.entity.PmTaskMember;
import top.sharpcaterpillar.teamsync.entity.SysUser;
import top.sharpcaterpillar.teamsync.mapper.PmProjectMapper;
import top.sharpcaterpillar.teamsync.mapper.PmProjectMemberMapper;
import top.sharpcaterpillar.teamsync.mapper.PmRecurringPlanAssigneeMapper;
import top.sharpcaterpillar.teamsync.mapper.PmRecurringPlanMapper;
import top.sharpcaterpillar.teamsync.mapper.PmTaskMapper;
import top.sharpcaterpillar.teamsync.mapper.PmTaskMemberMapper;
import top.sharpcaterpillar.teamsync.service.CalendarService;
import top.sharpcaterpillar.teamsync.service.SysUserService;
import top.sharpcaterpillar.teamsync.vo.AssigneeVO;
import top.sharpcaterpillar.teamsync.vo.CalendarEventVO;

import java.time.Duration;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.temporal.ChronoUnit;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.Collections;
import java.util.Comparator;
import java.util.HashMap;
import java.util.HashSet;
import java.util.LinkedHashSet;
import java.util.List;
import java.util.Locale;
import java.util.Map;
import java.util.Objects;
import java.util.Set;
import java.util.stream.Collectors;

/**
 * 日历视图服务实现。
 */
@Service
@RequiredArgsConstructor
public class CalendarServiceImpl implements CalendarService {

    private static final String SOURCE_TASK = "TASK";
    private static final String SOURCE_RECURRING_PLAN_RUN = "RECURRING_PLAN_RUN";
    private static final String PLAN_STATUS_ACTIVE = "ACTIVE";
    private static final String TASK_ROLE_EXECUTOR = "EXECUTOR";
    private static final String ASSIGNEE_ROLE_RESPONSIBLE = "RESPONSIBLE";
    private static final String STATUS_NOT_STARTED = "NOT_STARTED";
    private static final String STATUS_IN_PROGRESS = "IN_PROGRESS";
    private static final String STATUS_COMPLETED = "COMPLETED";
    private static final String STATUS_OVERDUE = "OVERDUE";
    private static final int TASK_STATUS_DONE = 1;
    private static final int TASK_STATUS_IN_PROGRESS = 2;
    private static final int MAX_RANGE_DAYS = 370;

    private final PmProjectMapper projectMapper;
    private final PmProjectMemberMapper projectMemberMapper;
    private final PmTaskMapper taskMapper;
    private final PmTaskMemberMapper taskMemberMapper;
    private final PmRecurringPlanMapper recurringPlanMapper;
    private final PmRecurringPlanAssigneeMapper recurringPlanAssigneeMapper;
    private final SysUserService sysUserService;

    @Override
    public List<CalendarEventVO> listEvents(CalendarEventQueryRequest request, Long operatorId) {
        requireLogin(operatorId);
        CalendarEventQueryRequest safeRequest = request == null ? new CalendarEventQueryRequest() : request;
        CalendarRange range = resolveRange(safeRequest);
        Set<String> sourceTypes = resolveSourceTypes(safeRequest.getSourceType());
        Set<String> statuses = resolveTaskStatuses(safeRequest.getStatuses());
        boolean platformAdmin = sysUserService.isSuperAdmin(operatorId);
        boolean adminView = platformAdmin && Boolean.TRUE.equals(safeRequest.getAdminView());
        Set<Long> assigneeIds = adminView
                ? parseIds(safeRequest.getAssigneeIds())
                : Collections.emptySet();

        Map<Long, PmProject> visibleProjectMap = loadVisibleProjectMap(operatorId, platformAdmin);
        Set<Long> filteredProjectIds = resolveFilteredProjectIds(safeRequest.getProjectId(), visibleProjectMap);

        List<CalendarEventVO> events = new ArrayList<>();
        if (sourceTypes.contains(SOURCE_TASK)) {
            events.addAll(loadTaskEvents(
                    range,
                    filteredProjectIds,
                    visibleProjectMap,
                    statuses,
                    assigneeIds,
                    Boolean.TRUE.equals(safeRequest.getIncludeNoDueDate()),
                    operatorId,
                    adminView
            ));
        }
        if (sourceTypes.contains(SOURCE_RECURRING_PLAN_RUN)) {
            events.addAll(loadRecurringPlanRunEvents(
                    range,
                    safeRequest.getProjectId(),
                    visibleProjectMap,
                    operatorId,
                    adminView,
                    assigneeIds
            ));
        }

        events.sort(Comparator
                .comparing(CalendarEventVO::getStartTime, Comparator.nullsLast(Comparator.naturalOrder()))
                .thenComparing(CalendarEventVO::getSourceType, Comparator.nullsLast(String::compareTo))
                .thenComparing(CalendarEventVO::getId, Comparator.nullsLast(String::compareTo)));
        return events;
    }

    @Override
    public List<AssigneeVO> listAssignees(Long projectId, Long operatorId) {
        requireLogin(operatorId);
        boolean platformAdmin = sysUserService.isSuperAdmin(operatorId);
        Map<Long, PmProject> visibleProjectMap = loadVisibleProjectMap(operatorId, platformAdmin);
        Set<Long> projectIds = resolveFilteredProjectIds(projectId, visibleProjectMap);
        if (projectIds.isEmpty()) {
            return Collections.emptyList();
        }

        Set<Long> userIds = visibleProjectMap.values().stream()
                .filter(project -> projectIds.contains(project.getId()))
                .map(PmProject::getOwnerId)
                .filter(Objects::nonNull)
                .collect(Collectors.toCollection(HashSet::new));

        LambdaQueryWrapper<PmProjectMember> memberQuery = new LambdaQueryWrapper<>();
        memberQuery.in(PmProjectMember::getProjectId, projectIds);
        projectMemberMapper.selectList(memberQuery).stream()
                .map(PmProjectMember::getUserId)
                .filter(Objects::nonNull)
                .forEach(userIds::add);

        if (userIds.isEmpty()) {
            return Collections.emptyList();
        }
        return sysUserService.listByIds(userIds).stream()
                .filter(user -> user.getId() != null)
                .map(this::toAssigneeVO)
                .sorted(Comparator.comparing(AssigneeVO::getNickname, Comparator.nullsLast(String::compareToIgnoreCase)))
                .toList();
    }

    private List<CalendarEventVO> loadTaskEvents(CalendarRange range,
                                                 Set<Long> projectIds,
                                                 Map<Long, PmProject> projectMap,
                                                 Set<String> statuses,
                                                 Set<Long> assigneeIds,
                                                 boolean includeNoDueDate,
                                                 Long operatorId,
                                                 boolean adminView) {
        if (projectIds.isEmpty()) {
            return Collections.emptyList();
        }

        Set<Long> scopedAssigneeIds = adminView ? assigneeIds : Set.of(operatorId);
        Set<Long> assignedTaskIds = loadAssignedTaskIds(scopedAssigneeIds);
        if (adminView && !assigneeIds.isEmpty() && assignedTaskIds.isEmpty()) {
            return Collections.emptyList();
        }

        LambdaQueryWrapper<PmTask> query = new LambdaQueryWrapper<>();
        query.in(PmTask::getProjectId, projectIds)
                .eq(PmTask::getIsDeleted, 0)
                .and(wrapper -> wrapper
                        .lt(PmTask::getStartTime, range.endExclusive())
                        .or(nested -> nested
                                .isNull(PmTask::getStartTime)
                                .lt(PmTask::getCreatedAt, range.endExclusive())))
                .orderByAsc(PmTask::getStartTime)
                .orderByAsc(PmTask::getCreatedAt)
                .orderByAsc(PmTask::getId);
        if (adminView) {
            query.in(!assigneeIds.isEmpty(), PmTask::getId, assignedTaskIds);
        } else {
            query.and(wrapper -> {
                wrapper.eq(PmTask::getCreatorId, operatorId);
                if (!assignedTaskIds.isEmpty()) {
                    wrapper.or().in(PmTask::getId, assignedTaskIds);
                }
            });
        }

        LocalDateTime now = LocalDateTime.now();
        List<CalendarEventVO> events = new ArrayList<>();
        for (PmTask task : taskMapper.selectList(query)) {
            if (!adminView
                    && !Objects.equals(task.getCreatorId(), operatorId)
                    && !assignedTaskIds.contains(task.getId())) {
                continue;
            }
            if (adminView && !assigneeIds.isEmpty() && !assignedTaskIds.contains(task.getId())) {
                continue;
            }
            LocalDateTime effectiveStart = task.getStartTime() == null ? task.getCreatedAt() : task.getStartTime();
            if (effectiveStart == null || !effectiveStart.isBefore(range.endExclusive())) {
                continue;
            }
            boolean overdue = task.getDueTime() != null
                    && task.getDueTime().isBefore(now)
                    && !Objects.equals(task.getStatus(), TASK_STATUS_DONE);
            String derivedStatus = resolveTaskStatus(task.getStatus(), overdue);
            if (!statuses.contains(derivedStatus)) {
                continue;
            }

            LocalDateTime effectiveEnd;
            if (task.getDueTime() == null) {
                if (!includeNoDueDate) {
                    continue;
                }
                effectiveEnd = Objects.equals(task.getStatus(), TASK_STATUS_DONE) && task.getUpdatedAt() != null
                        ? task.getUpdatedAt()
                        : range.endExclusive().minusNanos(1);
            } else {
                effectiveEnd = overdue ? range.endExclusive().minusNanos(1) : task.getDueTime();
            }
            if (effectiveEnd.isBefore(effectiveStart) || effectiveEnd.isBefore(range.startAt())) {
                continue;
            }

            PmProject project = projectMap.get(task.getProjectId());
            CalendarEventVO event = baseEvent(SOURCE_TASK, task.getId(), task.getTitle(), effectiveStart);
            event.setEndTime(effectiveEnd);
            event.setDueTime(task.getDueTime());
            event.setStatus(task.getStatus() == null ? null : String.valueOf(task.getStatus()));
            event.setPriority(task.getPriority());
            event.setProjectId(task.getProjectId());
            event.setProjectName(project == null ? null : project.getName());
            event.setOverdue(overdue);
            event.setColorType(resolveTaskColor(false, task.getStatus(), task.getPriority()));
            event.setTargetPath(boardPath(task.getProjectId(), task.getId()));
            events.add(event);
        }
        return events;
    }

    private List<CalendarEventVO> loadRecurringPlanRunEvents(CalendarRange range,
                                                             Long projectId,
                                                             Map<Long, PmProject> projectMap,
                                                             Long operatorId,
                                                             boolean adminView,
                                                             Set<Long> assigneeIds) {
        Set<Long> ownResponsiblePlanIds = adminView
                ? Collections.emptySet()
                : loadResponsiblePlanIds(Set.of(operatorId));
        LambdaQueryWrapper<PmRecurringPlan> query = recurringPlanBaseQuery(
                projectId,
                projectMap,
                operatorId,
                adminView,
                assigneeIds,
                ownResponsiblePlanIds
        );
        if (query == null) {
            return Collections.emptyList();
        }
        query.isNotNull(PmRecurringPlan::getNextRunAt)
                .ge(PmRecurringPlan::getNextRunAt, range.startAt())
                .lt(PmRecurringPlan::getNextRunAt, range.endExclusive())
                .orderByAsc(PmRecurringPlan::getNextRunAt)
                .orderByAsc(PmRecurringPlan::getId);

        List<CalendarEventVO> events = new ArrayList<>();
        for (PmRecurringPlan plan : recurringPlanMapper.selectList(query)) {
            if (!adminView
                    && !Objects.equals(plan.getCreatorId(), operatorId)
                    && !ownResponsiblePlanIds.contains(plan.getId())) {
                continue;
            }
            PmProject project = projectMap.get(plan.getProjectId());
            CalendarEventVO event = baseEvent(SOURCE_RECURRING_PLAN_RUN, plan.getId(), "执行：" + plan.getTitle(), plan.getNextRunAt());
            event.setStatus(plan.getStatus());
            event.setPriority(plan.getPriority());
            event.setProjectId(plan.getProjectId());
            event.setProjectName(project == null ? null : project.getName());
            event.setDueTime(calculateNextDueTime(plan));
            event.setOverdue(false);
            event.setColorType("primary");
            event.setTargetPath(recurringPlanPath(plan.getId()));
            events.add(event);
        }
        return events;
    }

    private LambdaQueryWrapper<PmRecurringPlan> recurringPlanBaseQuery(Long projectId,
                                                                       Map<Long, PmProject> projectMap,
                                                                       Long operatorId,
                                                                       boolean adminView,
                                                                       Set<Long> assigneeIds,
                                                                       Set<Long> ownResponsiblePlanIds) {
        if (projectId != null && !projectMap.containsKey(projectId)) {
            return null;
        }

        LambdaQueryWrapper<PmRecurringPlan> query = new LambdaQueryWrapper<>();
        query.eq(PmRecurringPlan::getIsDeleted, 0)
                .eq(PmRecurringPlan::getStatus, PLAN_STATUS_ACTIVE);
        if (projectId != null) {
            query.eq(PmRecurringPlan::getProjectId, projectId);
        }

        if (!adminView) {
            query.and(wrapper -> {
                wrapper.eq(PmRecurringPlan::getCreatorId, operatorId);
                if (!ownResponsiblePlanIds.isEmpty()) {
                    wrapper.or().in(PmRecurringPlan::getId, ownResponsiblePlanIds);
                }
            });
        }

        if (!assigneeIds.isEmpty()) {
            Set<Long> planIds = loadResponsiblePlanIds(assigneeIds);
            if (planIds.isEmpty()) {
                return null;
            }
            query.in(PmRecurringPlan::getId, planIds);
        }
        return query;
    }

    private CalendarEventVO baseEvent(String sourceType, Long sourceId, String title, LocalDateTime startTime) {
        CalendarEventVO event = new CalendarEventVO();
        event.setId(sourceType + "-" + sourceId);
        event.setSourceType(sourceType);
        event.setSourceId(sourceId);
        event.setTitle(title);
        event.setStartTime(startTime);
        event.setEndTime(startTime);
        event.setAllDay(false);
        event.setOverdue(false);
        return event;
    }

    private Map<Long, PmProject> loadVisibleProjectMap(Long operatorId, boolean platformAdmin) {
        LambdaQueryWrapper<PmProject> query = new LambdaQueryWrapper<>();
        query.eq(PmProject::getIsDeleted, 0)
                .eq(PmProject::getIsArchived, 0)
                .orderByDesc(PmProject::getUpdatedAt);

        if (!platformAdmin) {
            Set<Long> memberProjectIds = loadMemberProjectIds(operatorId);
            query.and(wrapper -> {
                wrapper.eq(PmProject::getOwnerId, operatorId);
                if (!memberProjectIds.isEmpty()) {
                    wrapper.or().in(PmProject::getId, memberProjectIds);
                }
            });
        }

        Map<Long, PmProject> result = new HashMap<>();
        for (PmProject project : projectMapper.selectList(query)) {
            if (project.getId() != null) {
                result.put(project.getId(), project);
            }
        }
        return result;
    }

    private Set<Long> resolveFilteredProjectIds(Long projectId, Map<Long, PmProject> visibleProjectMap) {
        if (projectId != null) {
            return visibleProjectMap.containsKey(projectId) ? Set.of(projectId) : Set.of();
        }
        return visibleProjectMap.keySet();
    }

    private Set<Long> loadMemberProjectIds(Long operatorId) {
        LambdaQueryWrapper<PmProjectMember> query = new LambdaQueryWrapper<>();
        query.eq(PmProjectMember::getUserId, operatorId);
        return projectMemberMapper.selectList(query).stream()
                .map(PmProjectMember::getProjectId)
                .filter(Objects::nonNull)
                .collect(Collectors.toCollection(HashSet::new));
    }

    private Set<Long> loadAssignedTaskIds(Set<Long> assigneeIds) {
        if (assigneeIds.isEmpty()) {
            return Collections.emptySet();
        }
        LambdaQueryWrapper<PmTaskMember> query = new LambdaQueryWrapper<>();
        query.in(PmTaskMember::getUserId, assigneeIds)
                .eq(PmTaskMember::getRole, TASK_ROLE_EXECUTOR);
        return taskMemberMapper.selectList(query).stream()
                .map(PmTaskMember::getTaskId)
                .filter(Objects::nonNull)
                .collect(Collectors.toCollection(HashSet::new));
    }

    private Set<Long> loadResponsiblePlanIds(Set<Long> assigneeIds) {
        LambdaQueryWrapper<PmRecurringPlanAssignee> query = new LambdaQueryWrapper<>();
        query.in(PmRecurringPlanAssignee::getUserId, assigneeIds)
                .eq(PmRecurringPlanAssignee::getRole, ASSIGNEE_ROLE_RESPONSIBLE);
        return recurringPlanAssigneeMapper.selectList(query).stream()
                .map(PmRecurringPlanAssignee::getPlanId)
                .filter(Objects::nonNull)
                .collect(Collectors.toCollection(HashSet::new));
    }

    private CalendarRange resolveRange(CalendarEventQueryRequest request) {
        LocalDate today = LocalDate.now();
        LocalDate startDate = request.getStartDate();
        LocalDate endDate = request.getEndDate();
        if (startDate == null && endDate == null) {
            startDate = today.withDayOfMonth(1);
            endDate = startDate.plusMonths(1).minusDays(1);
        } else if (startDate == null) {
            startDate = endDate.minusDays(30);
        } else if (endDate == null) {
            endDate = startDate.plusDays(30);
        }
        if (endDate.isBefore(startDate)) {
            throw new RuntimeException("结束日期不能早于开始日期");
        }
        long days = ChronoUnit.DAYS.between(startDate, endDate) + 1;
        if (days > MAX_RANGE_DAYS) {
            throw new RuntimeException("日历查询范围不能超过 " + MAX_RANGE_DAYS + " 天");
        }
        return new CalendarRange(startDate.atStartOfDay(), endDate.plusDays(1).atStartOfDay());
    }

    private Set<String> resolveSourceTypes(String sourceType) {
        if (!StringUtils.hasText(sourceType)) {
            return defaultSourceTypes();
        }
        Set<String> result = new LinkedHashSet<>();
        Arrays.stream(sourceType.split(","))
                .map(item -> item == null ? "" : item.trim().toUpperCase(Locale.ROOT))
                .filter(StringUtils::hasText)
                .forEach(item -> {
                    if ("ALL".equals(item)) {
                        result.addAll(defaultSourceTypes());
                    } else if ("RECURRING_PLAN".equals(item) || "RECURRING".equals(item)) {
                        result.add(SOURCE_RECURRING_PLAN_RUN);
                    } else if (SOURCE_TASK.equals(item)
                            || SOURCE_RECURRING_PLAN_RUN.equals(item)) {
                        result.add(item);
                    }
                });
        return result.isEmpty() ? defaultSourceTypes() : result;
    }

    private Set<String> defaultSourceTypes() {
        return new LinkedHashSet<>(List.of(
                SOURCE_TASK,
                SOURCE_RECURRING_PLAN_RUN
        ));
    }

    private Set<String> resolveTaskStatuses(String statuses) {
        if (!StringUtils.hasText(statuses)) {
            return new LinkedHashSet<>(List.of(STATUS_NOT_STARTED, STATUS_IN_PROGRESS, STATUS_OVERDUE));
        }
        Set<String> result = Arrays.stream(statuses.split(","))
                .map(item -> item == null ? "" : item.trim().toUpperCase(Locale.ROOT))
                .filter(item -> STATUS_NOT_STARTED.equals(item)
                        || STATUS_IN_PROGRESS.equals(item)
                        || STATUS_COMPLETED.equals(item)
                        || STATUS_OVERDUE.equals(item))
                .collect(Collectors.toCollection(LinkedHashSet::new));
        return result.isEmpty()
                ? new LinkedHashSet<>(List.of(STATUS_NOT_STARTED, STATUS_IN_PROGRESS, STATUS_OVERDUE))
                : result;
    }

    private Set<Long> parseIds(String rawIds) {
        if (!StringUtils.hasText(rawIds)) {
            return Collections.emptySet();
        }
        Set<Long> ids = new LinkedHashSet<>();
        for (String item : rawIds.split(",")) {
            try {
                long value = Long.parseLong(item.trim());
                if (value > 0) {
                    ids.add(value);
                }
            } catch (NumberFormatException ignored) {
                // 忽略无效筛选值，避免单个脏参数使整个日历不可用。
            }
        }
        return ids;
    }

    private String resolveTaskStatus(Integer status, boolean overdue) {
        if (overdue) {
            return STATUS_OVERDUE;
        }
        if (Objects.equals(status, TASK_STATUS_DONE)) {
            return STATUS_COMPLETED;
        }
        if (Objects.equals(status, TASK_STATUS_IN_PROGRESS)) {
            return STATUS_IN_PROGRESS;
        }
        return STATUS_NOT_STARTED;
    }

    private LocalDateTime calculateNextDueTime(PmRecurringPlan plan) {
        if (plan.getNextRunAt() == null || plan.getDueTime() == null || plan.getStartTime() == null) {
            return null;
        }
        Duration duration = Duration.between(plan.getStartTime(), plan.getDueTime());
        return duration.isNegative() ? plan.getNextRunAt() : plan.getNextRunAt().plus(duration);
    }

    private String resolveTaskColor(Boolean overdue, Integer status, Integer priority) {
        if (Boolean.TRUE.equals(overdue)) {
            return "danger";
        }
        if (status != null && status == TASK_STATUS_DONE) {
            return "success";
        }
        if (priority != null && priority >= 3) {
            return "danger";
        }
        if (priority != null && priority == 2) {
            return "warning";
        }
        return "primary";
    }

    private AssigneeVO toAssigneeVO(SysUser user) {
        AssigneeVO assignee = new AssigneeVO();
        assignee.setUserId(user.getId());
        assignee.setNickname(StringUtils.hasText(user.getNickname()) ? user.getNickname() : user.getUsername());
        assignee.setAvatar(user.getAvatar());
        return assignee;
    }

    private String boardPath(Long projectId, Long taskId) {
        if (projectId == null) {
            return "/project/list";
        }
        return taskId == null ? "/project/board/" + projectId : "/project/board/" + projectId + "?taskId=" + taskId;
    }

    private String recurringPlanPath(Long planId) {
        return planId == null ? "/project/recurring-plan" : "/project/recurring-plan?planId=" + planId;
    }

    private void requireLogin(Long operatorId) {
        if (operatorId == null) {
            throw new RuntimeException("用户未登录");
        }
    }

    private record CalendarRange(LocalDateTime startAt, LocalDateTime endExclusive) {
    }
}
