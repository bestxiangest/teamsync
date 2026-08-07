package top.sharpcaterpillar.teamsync.service.impl;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import org.springframework.stereotype.Service;
import top.sharpcaterpillar.teamsync.common.ProjectMemberRole;
import top.sharpcaterpillar.teamsync.entity.PmProject;
import top.sharpcaterpillar.teamsync.entity.PmProjectMember;
import top.sharpcaterpillar.teamsync.entity.PmRecurringPlan;
import top.sharpcaterpillar.teamsync.entity.PmRecurringPlanAssignee;
import top.sharpcaterpillar.teamsync.entity.PmRecurringPlanOccurrence;
import top.sharpcaterpillar.teamsync.entity.PmTask;
import top.sharpcaterpillar.teamsync.entity.PmTaskComment;
import top.sharpcaterpillar.teamsync.entity.PmTaskLog;
import top.sharpcaterpillar.teamsync.entity.PmTaskMember;
import top.sharpcaterpillar.teamsync.entity.PmTaskStage;
import top.sharpcaterpillar.teamsync.entity.SysUser;
import top.sharpcaterpillar.teamsync.mapper.PmProjectMapper;
import top.sharpcaterpillar.teamsync.mapper.PmProjectMemberMapper;
import top.sharpcaterpillar.teamsync.mapper.PmRecurringPlanAssigneeMapper;
import top.sharpcaterpillar.teamsync.mapper.PmRecurringPlanMapper;
import top.sharpcaterpillar.teamsync.mapper.PmRecurringPlanOccurrenceMapper;
import top.sharpcaterpillar.teamsync.mapper.PmTaskCommentMapper;
import top.sharpcaterpillar.teamsync.mapper.PmTaskLogMapper;
import top.sharpcaterpillar.teamsync.mapper.PmTaskMapper;
import top.sharpcaterpillar.teamsync.mapper.PmTaskMemberMapper;
import top.sharpcaterpillar.teamsync.mapper.PmTaskStageMapper;
import top.sharpcaterpillar.teamsync.mapper.SysUserMapper;
import top.sharpcaterpillar.teamsync.service.DashboardService;
import top.sharpcaterpillar.teamsync.service.PmProjectService;
import top.sharpcaterpillar.teamsync.service.SysUserService;
import top.sharpcaterpillar.teamsync.vo.DashboardActivityHeatVO;
import top.sharpcaterpillar.teamsync.vo.DashboardActivityVO;
import top.sharpcaterpillar.teamsync.vo.DashboardInsightVO;
import top.sharpcaterpillar.teamsync.vo.DashboardManagementVO;
import top.sharpcaterpillar.teamsync.vo.DashboardOverviewHealthVO;
import top.sharpcaterpillar.teamsync.vo.DashboardOverviewProjectVO;
import top.sharpcaterpillar.teamsync.vo.DashboardOverviewSummaryVO;
import top.sharpcaterpillar.teamsync.vo.DashboardOverviewVO;
import top.sharpcaterpillar.teamsync.vo.DashboardPriorityDistributionVO;
import top.sharpcaterpillar.teamsync.vo.DashboardProjectHealthVO;
import top.sharpcaterpillar.teamsync.vo.DashboardProjectVO;
import top.sharpcaterpillar.teamsync.vo.DashboardStatsVO;
import top.sharpcaterpillar.teamsync.vo.DashboardTaskTrendVO;
import top.sharpcaterpillar.teamsync.vo.DashboardTaskVO;
import top.sharpcaterpillar.teamsync.vo.DashboardVO;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.Duration;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.Collections;
import java.util.Comparator;
import java.util.HashMap;
import java.util.HashSet;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.Objects;
import java.util.Set;
import java.util.function.Function;
import java.util.stream.Collectors;

/**
 * 控制台聚合服务实现。
 */
@Service
public class DashboardServiceImpl implements DashboardService {

    private static final List<String> DONE_STAGE_KEYWORDS = Arrays.asList("完成", "Done", "done", "DONE", "✅");
    private static final DateTimeFormatter DAY_FORMATTER = DateTimeFormatter.ofPattern("MM-dd");
    private static final int TASK_LIMIT = 8;
    private static final int ACTIVITY_LIMIT = 12;
    private static final String RECURRING_PLAN_STATUS_ACTIVE = "ACTIVE";
    private static final String RECURRING_PLAN_ASSIGNEE_ROLE = "RESPONSIBLE";
    private static final String OCCURRENCE_STATUS_PENDING = "PENDING";
    private static final String OCCURRENCE_STATUS_DONE = "DONE";
    private static final String OCCURRENCE_STATUS_SKIPPED = "SKIPPED";
    private static final String OCCURRENCE_STATUS_DEFERRED = "DEFERRED";
    private static final String OCCURRENCE_STATUS_CANCELLED = "CANCELLED";
    private static final String OCCURRENCE_STATUS_OVERDUE = "OVERDUE";
    private static final String TASK_EXECUTOR_ROLE = "EXECUTOR";
    private static final String TASK_SOURCE_PROJECT = "PROJECT_TASK";
    private static final String TASK_SOURCE_RECURRING_PLAN = "RECURRING_PLAN";

    private final PmProjectMemberMapper projectMemberMapper;
    private final PmProjectMapper projectMapper;
    private final PmRecurringPlanMapper recurringPlanMapper;
    private final PmRecurringPlanAssigneeMapper recurringPlanAssigneeMapper;
    private final PmRecurringPlanOccurrenceMapper recurringPlanOccurrenceMapper;
    private final PmTaskMemberMapper taskMemberMapper;
    private final PmTaskMapper taskMapper;
    private final PmTaskStageMapper taskStageMapper;
    private final PmTaskLogMapper taskLogMapper;
    private final PmTaskCommentMapper commentMapper;
    private final SysUserMapper userMapper;
    private final PmProjectService pmProjectService;
    private final SysUserService sysUserService;

    public DashboardServiceImpl(PmProjectMemberMapper projectMemberMapper,
                                PmProjectMapper projectMapper,
                                PmRecurringPlanMapper recurringPlanMapper,
                                PmRecurringPlanAssigneeMapper recurringPlanAssigneeMapper,
                                PmRecurringPlanOccurrenceMapper recurringPlanOccurrenceMapper,
                                PmTaskMemberMapper taskMemberMapper,
                                PmTaskMapper taskMapper,
                                PmTaskStageMapper taskStageMapper,
                                PmTaskLogMapper taskLogMapper,
                                PmTaskCommentMapper commentMapper,
                                SysUserMapper userMapper,
                                PmProjectService pmProjectService,
                                SysUserService sysUserService) {
        this.projectMemberMapper = projectMemberMapper;
        this.projectMapper = projectMapper;
        this.recurringPlanMapper = recurringPlanMapper;
        this.recurringPlanAssigneeMapper = recurringPlanAssigneeMapper;
        this.recurringPlanOccurrenceMapper = recurringPlanOccurrenceMapper;
        this.taskMemberMapper = taskMemberMapper;
        this.taskMapper = taskMapper;
        this.taskStageMapper = taskStageMapper;
        this.taskLogMapper = taskLogMapper;
        this.commentMapper = commentMapper;
        this.userMapper = userMapper;
        this.pmProjectService = pmProjectService;
        this.sysUserService = sysUserService;
    }

    @Override
    public DashboardVO getWorkbenchData(Long userId) {
        DashboardVO vo = new DashboardVO();
        LocalDateTime now = LocalDateTime.now();

        List<Long> memberProjectIds = getMyProjectIds(userId);
        List<PmProject> activeProjects = getActiveProjects(memberProjectIds);
        pmProjectService.fillCalculatedProgress(activeProjects);
        Set<Long> activeProjectIds = activeProjects.stream()
                .map(PmProject::getId)
                .collect(Collectors.toCollection(HashSet::new));
        Map<Long, PmProject> activeProjectMap = activeProjects.stream()
                .collect(Collectors.toMap(PmProject::getId, Function.identity()));
        Map<Long, Integer> roleTypeMap = getProjectRoleTypeMap(userId, activeProjectIds);

        List<PmTask> projectTasks = getProjectTasks(activeProjectIds);
        Map<Long, PmTask> projectTaskMap = projectTasks.stream()
                .collect(Collectors.toMap(PmTask::getId, Function.identity()));
        Map<Long, PmTaskStage> stageMap = getStageMap(projectTasks.stream()
                .map(PmTask::getStageId)
                .filter(Objects::nonNull)
                .collect(Collectors.toSet()));

        Set<Long> executorTaskIds = getExecutorTaskIds(userId);
        List<PmTask> myTasks = projectTasks.stream()
                .filter(task -> executorTaskIds.contains(task.getId()))
                .collect(Collectors.toList());
        List<PmTask> pendingTasks = myTasks.stream()
                .filter(task -> !isTaskDone(task, stageMap))
                .sorted(buildPendingTaskComparator(now))
                .collect(Collectors.toList());
        List<DashboardTaskVO> projectTaskVos = buildMyTaskVos(pendingTasks, activeProjectMap, stageMap);
        List<DashboardTaskVO> recurringTaskVos = buildRecurringPlanTaskVos(getAssignedRecurringPlans(userId));
        List<DashboardTaskVO> pendingTaskVos = mergeDashboardTasks(projectTaskVos, recurringTaskVos, now);

        List<PmTaskLog> latestLogs = getLatestTaskLogs(projectTaskMap, ACTIVITY_LIMIT);
        List<PmTaskLog> logsIn7Days = getTaskLogsSince(projectTaskMap, LocalDate.now().minusDays(6).atStartOfDay());

        DashboardStatsVO stats = buildStats(userId, activeProjects.size(), myTasks, stageMap);
        stats.setPendingTaskCount(stats.getPendingTaskCount() + recurringTaskVos.size());
        vo.setStats(stats);
        vo.setMyTasks(pendingTaskVos.stream().limit(TASK_LIMIT).collect(Collectors.toList()));
        vo.setActivities(buildActivityVos(latestLogs, projectTaskMap, activeProjectMap));
        vo.setProjects(buildProjectVos(userId, activeProjects, roleTypeMap));
        vo.setInsight(buildInsight(myTasks, stageMap, recurringTaskVos, activeProjects.size(), logsIn7Days.size(), now));
        vo.setTaskTrend7d(buildTaskTrend(myTasks, stageMap, now));
        vo.setPriorityDistribution(buildDashboardTaskPriorityDistribution(pendingTaskVos));
        vo.setActivityHeat7d(buildActivityHeat(logsIn7Days));
        vo.setProjectHealth(buildProjectHealth(userId, activeProjects, roleTypeMap, projectTasks, stageMap, now));
        return vo;
    }

    @Override
    public DashboardOverviewVO getOverviewData(Long userId) {
        DashboardOverviewVO vo = new DashboardOverviewVO();
        LocalDateTime now = LocalDateTime.now();

        boolean platformAdmin = sysUserService.isSuperAdmin(userId);
        List<PmProject> activeProjects = getVisibleActiveProjects(userId, platformAdmin);
        pmProjectService.fillCalculatedProgress(activeProjects);
        Set<Long> projectIds = activeProjects.stream()
                .map(PmProject::getId)
                .collect(Collectors.toCollection(HashSet::new));

        List<PmTask> allTasks = projectIds.isEmpty() ? Collections.emptyList() : getProjectTasks(projectIds);
        Map<Long, List<PmTask>> tasksByProject = allTasks.stream()
                .filter(task -> task.getProjectId() != null)
                .collect(Collectors.groupingBy(PmTask::getProjectId));
        Map<Long, PmTask> taskMap = allTasks.stream()
                .collect(Collectors.toMap(PmTask::getId, Function.identity()));
        Map<Long, PmTaskStage> stageMap = getStageMap(allTasks.stream()
                .map(PmTask::getStageId)
                .filter(Objects::nonNull)
                .collect(Collectors.toSet()));

        List<PmProjectMember> projectMembers = getProjectMembers(projectIds);
        Map<Long, Set<Long>> memberIdsByProject = new HashMap<>();
        for (PmProjectMember member : projectMembers) {
            if (member.getProjectId() == null || member.getUserId() == null) {
                continue;
            }
            memberIdsByProject
                    .computeIfAbsent(member.getProjectId(), key -> new HashSet<>())
                    .add(member.getUserId());
        }
        for (PmProject project : activeProjects) {
            if (project.getOwnerId() != null) {
                memberIdsByProject
                        .computeIfAbsent(project.getId(), key -> new HashSet<>())
                        .add(project.getOwnerId());
            }
        }

        Set<Long> ownerIds = activeProjects.stream()
                .map(PmProject::getOwnerId)
                .filter(Objects::nonNull)
                .collect(Collectors.toCollection(HashSet::new));
        Map<Long, SysUser> ownerMap = getUserMap(ownerIds);

        List<PmTaskComment> comments = getTaskComments(taskMap.keySet());
        Map<Long, Integer> commentCountByProject = new HashMap<>();
        for (PmTaskComment comment : comments) {
            PmTask task = taskMap.get(comment.getTaskId());
            if (task == null || task.getProjectId() == null) {
                continue;
            }
            commentCountByProject.merge(task.getProjectId(), 1, Integer::sum);
        }

        List<PmTaskLog> logsIn7Days = getTaskLogsSince(taskMap, LocalDate.now().minusDays(6).atStartOfDay());
        Map<Long, Integer> activityCountByProject = new HashMap<>();
        for (PmTaskLog logItem : logsIn7Days) {
            PmTask task = taskMap.get(logItem.getTaskId());
            if (task == null || task.getProjectId() == null) {
                continue;
            }
            activityCountByProject.merge(task.getProjectId(), 1, Integer::sum);
        }

        List<DashboardOverviewProjectVO> projects = buildOverviewProjects(
                activeProjects,
                tasksByProject,
                memberIdsByProject,
                commentCountByProject,
                activityCountByProject,
                ownerMap,
                stageMap,
                now
        );

        Set<Long> uniqueMemberIds = memberIdsByProject.values().stream()
                .flatMap(Set::stream)
                .collect(Collectors.toCollection(HashSet::new));
        List<PmTask> pendingTasks = allTasks.stream()
                .filter(task -> !isTaskDone(task, stageMap))
                .collect(Collectors.toList());

        vo.setSummary(buildOverviewSummary(
                activeProjects,
                allTasks,
                pendingTasks,
                comments.size(),
                logsIn7Days.size(),
                uniqueMemberIds.size(),
                projects,
                stageMap,
                now
        ));
        vo.setPlatformTrend7d(buildTaskTrend(allTasks, stageMap, now));
        vo.setActivityHeat7d(buildActivityHeat(logsIn7Days));
        vo.setPriorityDistribution(buildPriorityDistribution(pendingTasks));
        vo.setHealthDistribution(buildOverviewHealthDistribution(projects));
        vo.setProjects(projects);
        return vo;
    }

    @Override
    public DashboardManagementVO getManagementData(Long projectId, Long memberId, LocalDate startDate, LocalDate endDate, Long userId) {
        LocalDateTime now = LocalDateTime.now();
        LocalDate[] normalizedRange = normalizeDateRange(startDate, endDate);
        LocalDate effectiveStartDate = normalizedRange[0];
        LocalDate effectiveEndDate = normalizedRange[1];
        LocalDateTime rangeStart = effectiveStartDate.atStartOfDay();
        LocalDateTime rangeEndExclusive = effectiveEndDate.plusDays(1).atStartOfDay();

        boolean platformAdmin = sysUserService.isSuperAdmin(userId);
        List<PmProject> optionProjects = getVisibleActiveProjects(userId, platformAdmin);
        List<PmProject> projects = projectId == null
                ? optionProjects
                : optionProjects.stream()
                .filter(project -> projectId.equals(project.getId()))
                .collect(Collectors.toList());
        pmProjectService.fillCalculatedProgress(projects);
        Set<Long> projectIds = projects.stream()
                .map(PmProject::getId)
                .filter(Objects::nonNull)
                .collect(Collectors.toCollection(HashSet::new));
        Map<Long, PmProject> projectMap = projects.stream()
                .filter(project -> project.getId() != null)
                .collect(Collectors.toMap(PmProject::getId, Function.identity(), (left, right) -> left));

        List<PmTask> allProjectTasks = getProjectTasks(projectIds);
        Map<Long, PmTaskStage> stageMap = getStageMap(allProjectTasks.stream()
                .map(PmTask::getStageId)
                .filter(Objects::nonNull)
                .collect(Collectors.toSet()));
        Set<Long> allTaskIds = allProjectTasks.stream()
                .map(PmTask::getId)
                .filter(Objects::nonNull)
                .collect(Collectors.toCollection(HashSet::new));
        List<PmTaskMember> taskExecutors = getTaskExecutors(allTaskIds);
        Map<Long, Set<Long>> executorIdsByTask = buildExecutorIdSetByTask(taskExecutors);

        List<PmTask> filteredTasks = allProjectTasks.stream()
                .filter(task -> memberId == null || executorIdsByTask.getOrDefault(task.getId(), Collections.emptySet()).contains(memberId))
                .filter(task -> matchesTaskRange(task, rangeStart, rangeEndExclusive))
                .collect(Collectors.toList());
        Set<Long> filteredTaskIds = filteredTasks.stream()
                .map(PmTask::getId)
                .filter(Objects::nonNull)
                .collect(Collectors.toCollection(HashSet::new));

        List<PmRecurringPlan> plans = projects.isEmpty()
                ? Collections.emptyList()
                : getManagementRecurringPlans(projectId, projectIds, platformAdmin);
        List<PmRecurringPlanAssignee> planAssignees = getPlanAssignees(plans);
        Map<Long, Set<Long>> assigneeIdsByPlan = buildPlanAssigneeIdSet(planAssignees);
        List<PmRecurringPlan> filteredPlans = plans.stream()
                .filter(plan -> memberId == null || assigneeIdsByPlan.getOrDefault(plan.getId(), Collections.emptySet()).contains(memberId))
                .collect(Collectors.toList());
        Map<Long, PmRecurringPlan> filteredPlanMap = filteredPlans.stream()
                .filter(plan -> plan.getId() != null)
                .collect(Collectors.toMap(PmRecurringPlan::getId, Function.identity(), (left, right) -> left));
        List<PmRecurringPlanOccurrence> filteredOccurrences = getPlanOccurrences(filteredPlanMap.keySet()).stream()
                .filter(occurrence -> matchesOccurrenceRange(occurrence, rangeStart, rangeEndExclusive))
                .collect(Collectors.toList());
        Map<Long, List<PmRecurringPlanOccurrence>> occurrencesByPlan = filteredOccurrences.stream()
                .filter(occurrence -> occurrence.getPlanId() != null)
                .collect(Collectors.groupingBy(PmRecurringPlanOccurrence::getPlanId));

        Set<Long> memberIds = collectManagementMemberIds(projects, taskExecutors, planAssignees);
        Map<Long, SysUser> userMap = getUserMap(memberIds);
        Map<Long, Set<Long>> memberIdsByProject = buildProjectMemberIdMap(projectIds, projects);

        DashboardManagementVO vo = new DashboardManagementVO();
        DashboardManagementVO.FilterVO filter = new DashboardManagementVO.FilterVO();
        filter.setProjectId(projectId);
        filter.setMemberId(memberId);
        filter.setStartDate(effectiveStartDate);
        filter.setEndDate(effectiveEndDate);
        vo.setFilter(filter);
        vo.setProjectOptions(buildProjectOptions(optionProjects));
        vo.setMemberOptions(buildMemberOptions(memberIds, userMap));
        vo.setSummary(buildManagementSummary(
                projects.size(),
                filteredTasks,
                stageMap,
                executorIdsByTask,
                filteredPlans,
                filteredOccurrences,
                now
        ));
        vo.setTaskTrend(buildManagementTaskTrend(filteredTasks, stageMap, effectiveStartDate, effectiveEndDate, now));
        vo.setProjectMetrics(buildManagementProjectMetrics(
                projects,
                filteredTasks,
                stageMap,
                memberIdsByProject,
                filteredPlans,
                occurrencesByPlan,
                projectMap,
                userMap,
                now
        ));
        vo.setMemberWorkloads(buildManagementMemberWorkloads(
                memberIds,
                filteredTasks,
                stageMap,
                executorIdsByTask,
                filteredPlans,
                occurrencesByPlan,
                assigneeIdsByPlan,
                userMap,
                now
        ));
        vo.setRecurringPlans(buildManagementRecurringPlans(filteredPlans, occurrencesByPlan, projectMap, assigneeIdsByPlan, userMap, now));
        return vo;
    }

    private LocalDate[] normalizeDateRange(LocalDate startDate, LocalDate endDate) {
        LocalDate resolvedEnd = endDate == null ? LocalDate.now() : endDate;
        LocalDate resolvedStart = startDate == null ? resolvedEnd.minusDays(29) : startDate;
        if (resolvedStart.isAfter(resolvedEnd)) {
            return new LocalDate[]{resolvedEnd, resolvedStart};
        }
        return new LocalDate[]{resolvedStart, resolvedEnd};
    }

    private List<PmProject> getManagementProjects(Long projectId) {
        LambdaQueryWrapper<PmProject> query = new LambdaQueryWrapper<>();
        query.eq(PmProject::getIsArchived, 0)
                .orderByDesc(PmProject::getUpdatedAt);
        if (projectId != null) {
            query.eq(PmProject::getId, projectId);
        }
        return projectMapper.selectList(query);
    }

    private List<PmTaskMember> getTaskExecutors(Set<Long> taskIds) {
        if (taskIds.isEmpty()) {
            return Collections.emptyList();
        }
        LambdaQueryWrapper<PmTaskMember> query = new LambdaQueryWrapper<>();
        query.in(PmTaskMember::getTaskId, taskIds)
                .eq(PmTaskMember::getRole, TASK_EXECUTOR_ROLE);
        return taskMemberMapper.selectList(query);
    }

    private Map<Long, Set<Long>> buildExecutorIdSetByTask(List<PmTaskMember> members) {
        Map<Long, Set<Long>> result = new HashMap<>();
        for (PmTaskMember member : members) {
            if (member.getTaskId() == null || member.getUserId() == null) {
                continue;
            }
            result.computeIfAbsent(member.getTaskId(), key -> new HashSet<>()).add(member.getUserId());
        }
        return result;
    }

    private boolean matchesTaskRange(PmTask task, LocalDateTime rangeStart, LocalDateTime rangeEndExclusive) {
        return isInRange(task.getCreatedAt(), rangeStart, rangeEndExclusive)
                || isInRange(task.getUpdatedAt(), rangeStart, rangeEndExclusive)
                || isInRange(task.getStartTime(), rangeStart, rangeEndExclusive)
                || isInRange(task.getDueTime(), rangeStart, rangeEndExclusive);
    }

    private boolean isInRange(LocalDateTime value, LocalDateTime rangeStart, LocalDateTime rangeEndExclusive) {
        return value != null && !value.isBefore(rangeStart) && value.isBefore(rangeEndExclusive);
    }

    private List<PmRecurringPlan> getManagementRecurringPlans(Long projectId, Set<Long> projectIds, boolean includeGlobalPlans) {
        LambdaQueryWrapper<PmRecurringPlan> query = new LambdaQueryWrapper<>();
        if (projectId != null) {
            query.eq(PmRecurringPlan::getProjectId, projectId);
        } else if (!projectIds.isEmpty()) {
            if (includeGlobalPlans) {
                query.and(wrapper -> wrapper.in(PmRecurringPlan::getProjectId, projectIds).or().isNull(PmRecurringPlan::getProjectId));
            } else {
                query.in(PmRecurringPlan::getProjectId, projectIds);
            }
        } else if (includeGlobalPlans) {
            query.isNull(PmRecurringPlan::getProjectId);
        } else {
            return Collections.emptyList();
        }
        query.orderByAsc(PmRecurringPlan::getNextRunAt)
                .orderByDesc(PmRecurringPlan::getUpdatedAt);
        return recurringPlanMapper.selectList(query);
    }

    private List<PmRecurringPlanAssignee> getPlanAssignees(List<PmRecurringPlan> plans) {
        Set<Long> planIds = plans.stream()
                .map(PmRecurringPlan::getId)
                .filter(Objects::nonNull)
                .collect(Collectors.toCollection(HashSet::new));
        if (planIds.isEmpty()) {
            return Collections.emptyList();
        }

        LambdaQueryWrapper<PmRecurringPlanAssignee> query = new LambdaQueryWrapper<>();
        query.in(PmRecurringPlanAssignee::getPlanId, planIds)
                .eq(PmRecurringPlanAssignee::getRole, RECURRING_PLAN_ASSIGNEE_ROLE);
        return recurringPlanAssigneeMapper.selectList(query);
    }

    private Map<Long, Set<Long>> buildPlanAssigneeIdSet(List<PmRecurringPlanAssignee> assignees) {
        Map<Long, Set<Long>> result = new HashMap<>();
        for (PmRecurringPlanAssignee assignee : assignees) {
            if (assignee.getPlanId() == null || assignee.getUserId() == null) {
                continue;
            }
            result.computeIfAbsent(assignee.getPlanId(), key -> new HashSet<>()).add(assignee.getUserId());
        }
        return result;
    }

    private List<PmRecurringPlanOccurrence> getPlanOccurrences(Set<Long> planIds) {
        if (planIds.isEmpty()) {
            return Collections.emptyList();
        }

        LambdaQueryWrapper<PmRecurringPlanOccurrence> query = new LambdaQueryWrapper<>();
        query.in(PmRecurringPlanOccurrence::getPlanId, planIds)
                .orderByDesc(PmRecurringPlanOccurrence::getScheduledStartAt);
        return recurringPlanOccurrenceMapper.selectList(query);
    }

    private boolean matchesOccurrenceRange(PmRecurringPlanOccurrence occurrence,
                                           LocalDateTime rangeStart,
                                           LocalDateTime rangeEndExclusive) {
        LocalDateTime anchorTime = occurrence.getDueTime() != null
                ? occurrence.getDueTime()
                : occurrence.getScheduledStartAt();
        return isInRange(anchorTime, rangeStart, rangeEndExclusive);
    }

    private Set<Long> collectManagementMemberIds(List<PmProject> projects,
                                                 List<PmTaskMember> taskExecutors,
                                                 List<PmRecurringPlanAssignee> planAssignees) {
        Set<Long> projectIds = projects.stream()
                .map(PmProject::getId)
                .filter(Objects::nonNull)
                .collect(Collectors.toCollection(HashSet::new));
        Set<Long> userIds = new HashSet<>();
        projects.stream().map(PmProject::getOwnerId).filter(Objects::nonNull).forEach(userIds::add);
        taskExecutors.stream().map(PmTaskMember::getUserId).filter(Objects::nonNull).forEach(userIds::add);
        planAssignees.stream().map(PmRecurringPlanAssignee::getUserId).filter(Objects::nonNull).forEach(userIds::add);
        getProjectMembers(projectIds).stream()
                .map(PmProjectMember::getUserId)
                .filter(Objects::nonNull)
                .forEach(userIds::add);
        return userIds;
    }

    private Map<Long, Set<Long>> buildProjectMemberIdMap(Set<Long> projectIds, List<PmProject> projects) {
        Map<Long, Set<Long>> result = new HashMap<>();
        for (PmProjectMember member : getProjectMembers(projectIds)) {
            if (member.getProjectId() == null || member.getUserId() == null) {
                continue;
            }
            result.computeIfAbsent(member.getProjectId(), key -> new HashSet<>()).add(member.getUserId());
        }
        for (PmProject project : projects) {
            if (project.getId() == null || project.getOwnerId() == null) {
                continue;
            }
            result.computeIfAbsent(project.getId(), key -> new HashSet<>()).add(project.getOwnerId());
        }
        return result;
    }

    private List<DashboardManagementVO.OptionVO> buildProjectOptions(List<PmProject> projects) {
        return projects.stream()
                .map(project -> {
                    DashboardManagementVO.OptionVO option = new DashboardManagementVO.OptionVO();
                    option.setId(project.getId());
                    option.setName(safeText(project.getName(), "未命名项目"));
                    return option;
                })
                .collect(Collectors.toList());
    }

    private List<DashboardManagementVO.OptionVO> buildMemberOptions(Set<Long> memberIds, Map<Long, SysUser> userMap) {
        return memberIds.stream()
                .map(memberId -> {
                    DashboardManagementVO.OptionVO option = new DashboardManagementVO.OptionVO();
                    option.setId(memberId);
                    option.setName(resolveUserDisplayName(userMap.get(memberId), "成员" + memberId));
                    return option;
                })
                .sorted(Comparator.comparing(DashboardManagementVO.OptionVO::getName, Comparator.nullsLast(String::compareTo)))
                .collect(Collectors.toList());
    }

    private DashboardManagementVO.SummaryVO buildManagementSummary(int activeProjectCount,
                                                                   List<PmTask> tasks,
                                                                   Map<Long, PmTaskStage> stageMap,
                                                                   Map<Long, Set<Long>> executorIdsByTask,
                                                                   List<PmRecurringPlan> plans,
                                                                   List<PmRecurringPlanOccurrence> occurrences,
                                                                   LocalDateTime now) {
        int doneCount = 0;
        int overdueCount = 0;
        int dueSoonCount = 0;
        int riskTaskCount = 0;
        Set<Long> memberIds = new HashSet<>();

        for (PmTask task : tasks) {
            memberIds.addAll(executorIdsByTask.getOrDefault(task.getId(), Collections.emptySet()));
            if (isTaskDone(task, stageMap)) {
                doneCount++;
                continue;
            }
            boolean overdue = isTaskOverdue(task, now);
            boolean dueSoon = isTaskDueSoon(task, now);
            if (overdue) {
                overdueCount++;
            }
            if (dueSoon) {
                dueSoonCount++;
            }
            if (overdue || dueSoon || normalizePriority(task.getPriority()) >= 3) {
                riskTaskCount++;
            }
        }

        RecurringStats recurringStats = summarizeOccurrences(occurrences, now);
        DashboardManagementVO.SummaryVO summary = new DashboardManagementVO.SummaryVO();
        summary.setTaskCount(tasks.size());
        summary.setDoneTaskCount(doneCount);
        summary.setPendingTaskCount(Math.max(tasks.size() - doneCount, 0));
        summary.setOverdueTaskCount(overdueCount);
        summary.setDueSoonTaskCount(dueSoonCount);
        summary.setCompletionRate(rate(doneCount, tasks.size()));
        summary.setOverdueRate(rate(overdueCount, tasks.size()));
        summary.setRiskTaskCount(riskTaskCount);
        summary.setMemberCount(memberIds.size());
        summary.setActiveProjectCount(activeProjectCount);
        summary.setRecurringPlanCount(plans.size());
        summary.setRecurringOccurrenceCount(recurringStats.totalCount);
        summary.setRecurringExecutedCount(recurringStats.executedCount);
        summary.setRecurringCompletedCount(recurringStats.completedCount);
        summary.setRecurringExecutionRate(rate(recurringStats.executedCount, recurringStats.totalCount));
        summary.setRecurringCompletionRate(rate(recurringStats.completedCount, recurringStats.totalCount));
        return summary;
    }

    private List<DashboardTaskTrendVO> buildManagementTaskTrend(List<PmTask> tasks,
                                                                Map<Long, PmTaskStage> stageMap,
                                                                LocalDate startDate,
                                                                LocalDate endDate,
                                                                LocalDateTime now) {
        LocalDate chartStartDate = startDate;
        if (chartStartDate.plusDays(44).isBefore(endDate)) {
            chartStartDate = endDate.minusDays(44);
        }
        Map<LocalDate, DashboardTaskTrendVO> trendMap = new LinkedHashMap<>();
        LocalDate cursor = chartStartDate;
        while (!cursor.isAfter(endDate)) {
            DashboardTaskTrendVO item = new DashboardTaskTrendVO();
            item.setDate(cursor.format(DateTimeFormatter.ISO_LOCAL_DATE));
            item.setCreatedCount(0);
            item.setCompletedCount(0);
            item.setOverdueCount(0);
            trendMap.put(cursor, item);
            cursor = cursor.plusDays(1);
        }

        for (PmTask task : tasks) {
            LocalDate createdDate = toDate(task.getCreatedAt());
            if (createdDate != null && trendMap.containsKey(createdDate)) {
                DashboardTaskTrendVO item = trendMap.get(createdDate);
                item.setCreatedCount(item.getCreatedCount() + 1);
            }

            if (isTaskDone(task, stageMap)) {
                LocalDate completedDate = toDate(task.getUpdatedAt());
                if (completedDate != null && trendMap.containsKey(completedDate)) {
                    DashboardTaskTrendVO item = trendMap.get(completedDate);
                    item.setCompletedCount(item.getCompletedCount() + 1);
                }
                continue;
            }

            if (task.getDueTime() != null && task.getDueTime().isBefore(now)) {
                LocalDate dueDate = toDate(task.getDueTime());
                if (dueDate != null && trendMap.containsKey(dueDate)) {
                    DashboardTaskTrendVO item = trendMap.get(dueDate);
                    item.setOverdueCount(item.getOverdueCount() + 1);
                }
            }
        }
        return new ArrayList<>(trendMap.values());
    }

    private List<DashboardManagementVO.ProjectMetricVO> buildManagementProjectMetrics(
            List<PmProject> projects,
            List<PmTask> tasks,
            Map<Long, PmTaskStage> stageMap,
            Map<Long, Set<Long>> memberIdsByProject,
            List<PmRecurringPlan> plans,
            Map<Long, List<PmRecurringPlanOccurrence>> occurrencesByPlan,
            Map<Long, PmProject> projectMap,
            Map<Long, SysUser> userMap,
            LocalDateTime now) {
        Map<Long, List<PmTask>> tasksByProject = tasks.stream()
                .filter(task -> task.getProjectId() != null)
                .collect(Collectors.groupingBy(PmTask::getProjectId));
        Map<Long, List<PmRecurringPlan>> plansByProject = plans.stream()
                .filter(plan -> plan.getProjectId() != null)
                .collect(Collectors.groupingBy(PmRecurringPlan::getProjectId));

        return projects.stream()
                .map(project -> {
                    List<PmTask> projectTasks = tasksByProject.getOrDefault(project.getId(), Collections.emptyList());
                    int doneCount = 0;
                    int overdueCount = 0;
                    int dueSoonCount = 0;
                    int highPriorityRiskCount = 0;
                    LocalDateTime lastActivityAt = project.getUpdatedAt();
                    for (PmTask task : projectTasks) {
                        lastActivityAt = maxDateTime(lastActivityAt, task.getUpdatedAt());
                        if (isTaskDone(task, stageMap)) {
                            doneCount++;
                            continue;
                        }
                        if (isTaskOverdue(task, now)) {
                            overdueCount++;
                        }
                        if (isTaskDueSoon(task, now)) {
                            dueSoonCount++;
                        }
                        if (normalizePriority(task.getPriority()) >= 3 && (isTaskOverdue(task, now) || isTaskDueSoon(task, now))) {
                            highPriorityRiskCount++;
                        }
                    }

                    List<PmRecurringPlan> projectPlans = plansByProject.getOrDefault(project.getId(), Collections.emptyList());
                    RecurringStats recurringStats = summarizePlanOccurrences(projectPlans, occurrencesByPlan, now);
                    int taskCount = projectTasks.size();
                    int completionRate = rate(doneCount, taskCount);
                    int pendingCount = Math.max(taskCount - doneCount, 0);
                    int progress = clamp(safeInt(project.getProgress()), 0, 100);
                    int healthScore = calculateHealthScore(progress, completionRate, overdueCount, pendingCount, 0, taskCount);

                    DashboardManagementVO.ProjectMetricVO item = new DashboardManagementVO.ProjectMetricVO();
                    item.setProjectId(project.getId());
                    item.setProjectName(safeText(project.getName(), "未命名项目"));
                    item.setOwnerName(resolveUserDisplayName(userMap.get(project.getOwnerId()), "项目负责人"));
                    item.setProgress(progress);
                    item.setHealthScore(healthScore);
                    item.setHealthLevel(resolveHealthLevel(healthScore, overdueCount));
                    item.setTaskCount(taskCount);
                    item.setDoneTaskCount(doneCount);
                    item.setPendingTaskCount(pendingCount);
                    item.setOverdueTaskCount(overdueCount);
                    item.setDueSoonTaskCount(dueSoonCount);
                    item.setHighPriorityRiskCount(highPriorityRiskCount);
                    item.setCompletionRate(completionRate);
                    item.setOverdueRate(rate(overdueCount, taskCount));
                    item.setMemberCount(memberIdsByProject.getOrDefault(project.getId(), Collections.emptySet()).size());
                    item.setRecurringPlanCount(projectPlans.size());
                    item.setRecurringExecutionRate(rate(recurringStats.executedCount, recurringStats.totalCount));
                    item.setLastActivityAt(lastActivityAt);
                    return item;
                })
                .sorted(Comparator
                        .comparing(DashboardManagementVO.ProjectMetricVO::getHealthScore, Comparator.nullsLast(Integer::compareTo))
                        .thenComparing(DashboardManagementVO.ProjectMetricVO::getOverdueTaskCount, Comparator.nullsLast(Comparator.reverseOrder())))
                .collect(Collectors.toList());
    }

    private List<DashboardManagementVO.MemberWorkloadVO> buildManagementMemberWorkloads(
            Set<Long> memberIds,
            List<PmTask> tasks,
            Map<Long, PmTaskStage> stageMap,
            Map<Long, Set<Long>> executorIdsByTask,
            List<PmRecurringPlan> plans,
            Map<Long, List<PmRecurringPlanOccurrence>> occurrencesByPlan,
            Map<Long, Set<Long>> assigneeIdsByPlan,
            Map<Long, SysUser> userMap,
            LocalDateTime now) {
        Map<Long, List<PmTask>> tasksByMember = new HashMap<>();
        for (PmTask task : tasks) {
            for (Long userId : executorIdsByTask.getOrDefault(task.getId(), Collections.emptySet())) {
                tasksByMember.computeIfAbsent(userId, key -> new ArrayList<>()).add(task);
            }
        }

        Map<Long, Integer> recurringPendingByMember = new HashMap<>();
        for (PmRecurringPlan plan : plans) {
            List<PmRecurringPlanOccurrence> occurrences = occurrencesByPlan.getOrDefault(plan.getId(), Collections.emptyList());
            int pendingCount = summarizeOccurrences(occurrences, now).pendingCount;
            if (pendingCount <= 0) {
                continue;
            }
            for (Long userId : assigneeIdsByPlan.getOrDefault(plan.getId(), Collections.emptySet())) {
                recurringPendingByMember.merge(userId, pendingCount, Integer::sum);
            }
        }

        return memberIds.stream()
                .map(memberId -> {
                    List<PmTask> memberTasks = tasksByMember.getOrDefault(memberId, Collections.emptyList());
                    int doneCount = 0;
                    int overdueCount = 0;
                    int dueSoonCount = 0;
                    int highPriorityCount = 0;
                    for (PmTask task : memberTasks) {
                        if (isTaskDone(task, stageMap)) {
                            doneCount++;
                            continue;
                        }
                        if (isTaskOverdue(task, now)) {
                            overdueCount++;
                        }
                        if (isTaskDueSoon(task, now)) {
                            dueSoonCount++;
                        }
                        if (normalizePriority(task.getPriority()) >= 3) {
                            highPriorityCount++;
                        }
                    }
                    int pendingCount = Math.max(memberTasks.size() - doneCount, 0);
                    int recurringPendingCount = recurringPendingByMember.getOrDefault(memberId, 0);
                    int workloadScore = pendingCount + dueSoonCount * 2 + overdueCount * 3 + highPriorityCount * 2 + recurringPendingCount;

                    DashboardManagementVO.MemberWorkloadVO item = new DashboardManagementVO.MemberWorkloadVO();
                    item.setMemberId(memberId);
                    item.setMemberName(resolveUserDisplayName(userMap.get(memberId), "成员" + memberId));
                    item.setTaskCount(memberTasks.size());
                    item.setDoneTaskCount(doneCount);
                    item.setPendingTaskCount(pendingCount);
                    item.setOverdueTaskCount(overdueCount);
                    item.setDueSoonTaskCount(dueSoonCount);
                    item.setHighPriorityCount(highPriorityCount);
                    item.setRecurringPendingCount(recurringPendingCount);
                    item.setCompletionRate(rate(doneCount, memberTasks.size()));
                    item.setWorkloadScore(workloadScore);
                    item.setRiskLevel(resolveWorkloadRiskLevel(workloadScore, overdueCount));
                    return item;
                })
                .filter(item -> item.getTaskCount() > 0 || item.getRecurringPendingCount() > 0)
                .sorted(Comparator
                        .comparing(DashboardManagementVO.MemberWorkloadVO::getWorkloadScore, Comparator.nullsLast(Comparator.reverseOrder()))
                        .thenComparing(DashboardManagementVO.MemberWorkloadVO::getOverdueTaskCount, Comparator.nullsLast(Comparator.reverseOrder())))
                .collect(Collectors.toList());
    }

    private List<DashboardManagementVO.RecurringPlanMetricVO> buildManagementRecurringPlans(
            List<PmRecurringPlan> plans,
            Map<Long, List<PmRecurringPlanOccurrence>> occurrencesByPlan,
            Map<Long, PmProject> projectMap,
            Map<Long, Set<Long>> assigneeIdsByPlan,
            Map<Long, SysUser> userMap,
            LocalDateTime now) {
        return plans.stream()
                .map(plan -> {
                    List<PmRecurringPlanOccurrence> occurrences = occurrencesByPlan.getOrDefault(plan.getId(), Collections.emptyList());
                    RecurringStats stats = summarizeOccurrences(occurrences, now);
                    DashboardManagementVO.RecurringPlanMetricVO item = new DashboardManagementVO.RecurringPlanMetricVO();
                    item.setPlanId(plan.getId());
                    item.setTitle(safeText(plan.getTitle(), "未命名周期计划"));
                    item.setProjectId(plan.getProjectId());
                    PmProject project = projectMap.get(plan.getProjectId());
                    item.setProjectName(project == null ? "独立周期计划" : safeText(project.getName(), "未命名项目"));
                    item.setStatus(plan.getStatus());
                    item.setAssigneeNames(resolveAssigneeNames(assigneeIdsByPlan.get(plan.getId()), userMap));
                    item.setNextRunAt(plan.getNextRunAt());
                    item.setOccurrenceCount(stats.totalCount);
                    item.setExecutedCount(stats.executedCount);
                    item.setCompletedCount(stats.completedCount);
                    item.setPendingCount(stats.pendingCount);
                    item.setOverdueCount(stats.overdueCount);
                    item.setExecutionRate(rate(stats.executedCount, stats.totalCount));
                    item.setCompletionRate(rate(stats.completedCount, stats.totalCount));
                    return item;
                })
                .sorted(Comparator
                        .comparing(DashboardManagementVO.RecurringPlanMetricVO::getOverdueCount, Comparator.nullsLast(Comparator.reverseOrder()))
                        .thenComparing(DashboardManagementVO.RecurringPlanMetricVO::getNextRunAt, Comparator.nullsLast(LocalDateTime::compareTo)))
                .collect(Collectors.toList());
    }

    private RecurringStats summarizePlanOccurrences(List<PmRecurringPlan> plans,
                                                    Map<Long, List<PmRecurringPlanOccurrence>> occurrencesByPlan,
                                                    LocalDateTime now) {
        RecurringStats stats = new RecurringStats();
        for (PmRecurringPlan plan : plans) {
            stats.add(summarizeOccurrences(occurrencesByPlan.getOrDefault(plan.getId(), Collections.emptyList()), now));
        }
        return stats;
    }

    private RecurringStats summarizeOccurrences(List<PmRecurringPlanOccurrence> occurrences, LocalDateTime now) {
        RecurringStats stats = new RecurringStats();
        stats.totalCount = occurrences.size();
        for (PmRecurringPlanOccurrence occurrence : occurrences) {
            if (isOccurrenceExecuted(occurrence)) {
                stats.executedCount++;
            }
            if (OCCURRENCE_STATUS_DONE.equals(occurrence.getStatus())) {
                stats.completedCount++;
            }
            if (isOccurrenceOverdue(occurrence, now)) {
                stats.overdueCount++;
            } else if (isOccurrencePending(occurrence)) {
                stats.pendingCount++;
            }
        }
        return stats;
    }

    private boolean isTaskOverdue(PmTask task, LocalDateTime now) {
        return task.getDueTime() != null && task.getDueTime().isBefore(now);
    }

    private boolean isTaskDueSoon(PmTask task, LocalDateTime now) {
        return task.getDueTime() != null && !task.getDueTime().isBefore(now) && !task.getDueTime().isAfter(now.plusHours(48));
    }

    private boolean isOccurrenceExecuted(PmRecurringPlanOccurrence occurrence) {
        String status = occurrence.getStatus();
        return OCCURRENCE_STATUS_DONE.equals(status)
                || OCCURRENCE_STATUS_SKIPPED.equals(status)
                || OCCURRENCE_STATUS_DEFERRED.equals(status)
                || OCCURRENCE_STATUS_CANCELLED.equals(status);
    }

    private boolean isOccurrencePending(PmRecurringPlanOccurrence occurrence) {
        return OCCURRENCE_STATUS_PENDING.equals(occurrence.getStatus()) || OCCURRENCE_STATUS_OVERDUE.equals(occurrence.getStatus());
    }

    private boolean isOccurrenceOverdue(PmRecurringPlanOccurrence occurrence, LocalDateTime now) {
        if (OCCURRENCE_STATUS_OVERDUE.equals(occurrence.getStatus())) {
            return true;
        }
        return OCCURRENCE_STATUS_PENDING.equals(occurrence.getStatus())
                && occurrence.getDueTime() != null
                && occurrence.getDueTime().isBefore(now);
    }

    private int rate(int numerator, int denominator) {
        return denominator <= 0 ? 0 : clamp((int) Math.round(numerator * 100.0 / denominator), 0, 100);
    }

    private String resolveWorkloadRiskLevel(int workloadScore, int overdueCount) {
        if (overdueCount > 0 || workloadScore >= 16) {
            return "high";
        }
        if (workloadScore >= 8) {
            return "attention";
        }
        return "normal";
    }

    private String resolveAssigneeNames(Set<Long> assigneeIds, Map<Long, SysUser> userMap) {
        if (assigneeIds == null || assigneeIds.isEmpty()) {
            return "未分配";
        }
        return assigneeIds.stream()
                .map(userId -> resolveUserDisplayName(userMap.get(userId), "成员" + userId))
                .sorted()
                .collect(Collectors.joining("、"));
    }

    private String safeText(String value, String fallback) {
        return value == null || value.isBlank() ? fallback : value;
    }

    private static class RecurringStats {
        private int totalCount;
        private int executedCount;
        private int completedCount;
        private int pendingCount;
        private int overdueCount;

        private void add(RecurringStats other) {
            totalCount += other.totalCount;
            executedCount += other.executedCount;
            completedCount += other.completedCount;
            pendingCount += other.pendingCount;
            overdueCount += other.overdueCount;
        }
    }

    private List<Long> getMyProjectIds(Long userId) {
        LambdaQueryWrapper<PmProjectMember> query = new LambdaQueryWrapper<>();
        query.eq(PmProjectMember::getUserId, userId);

        List<PmProjectMember> members = projectMemberMapper.selectList(query);
        if (members.isEmpty()) {
            return Collections.emptyList();
        }

        List<Long> projectIds = members.stream()
                .map(PmProjectMember::getProjectId)
                .filter(Objects::nonNull)
                .distinct()
                .collect(Collectors.toList());
        if (projectIds.isEmpty()) {
            return Collections.emptyList();
        }

        List<PmProject> projects = projectMapper.selectBatchIds(projectIds);
        return projects.stream().map(PmProject::getId).collect(Collectors.toList());
    }

    private List<PmProject> getVisibleActiveProjects(Long userId, boolean platformAdmin) {
        if (platformAdmin) {
            return getAllActiveProjects();
        }
        return getActiveProjects(getMyProjectIds(userId));
    }

    private List<PmProject> getAllActiveProjects() {
        LambdaQueryWrapper<PmProject> query = new LambdaQueryWrapper<>();
        query.eq(PmProject::getIsArchived, 0)
                .orderByDesc(PmProject::getUpdatedAt);
        return projectMapper.selectList(query);
    }

    private List<PmProject> getActiveProjects(List<Long> projectIds) {
        if (projectIds.isEmpty()) {
            return Collections.emptyList();
        }

        LambdaQueryWrapper<PmProject> query = new LambdaQueryWrapper<>();
        query.in(PmProject::getId, projectIds)
                .eq(PmProject::getIsArchived, 0)
                .orderByDesc(PmProject::getUpdatedAt);
        return projectMapper.selectList(query);
    }

    private Map<Long, Integer> getProjectRoleTypeMap(Long userId, Set<Long> projectIds) {
        if (projectIds.isEmpty()) {
            return Collections.emptyMap();
        }

        LambdaQueryWrapper<PmProjectMember> query = new LambdaQueryWrapper<>();
        query.eq(PmProjectMember::getUserId, userId)
                .in(PmProjectMember::getProjectId, projectIds);
        return projectMemberMapper.selectList(query).stream()
                .filter(member -> member.getProjectId() != null)
                .collect(Collectors.toMap(PmProjectMember::getProjectId, PmProjectMember::getRoleType, (left, right) -> left));
    }

    private List<PmProjectMember> getProjectMembers(Set<Long> projectIds) {
        if (projectIds.isEmpty()) {
            return Collections.emptyList();
        }

        LambdaQueryWrapper<PmProjectMember> query = new LambdaQueryWrapper<>();
        query.in(PmProjectMember::getProjectId, projectIds);
        return projectMemberMapper.selectList(query);
    }

    private List<PmTask> getProjectTasks(Set<Long> projectIds) {
        if (projectIds.isEmpty()) {
            return Collections.emptyList();
        }

        LambdaQueryWrapper<PmTask> query = new LambdaQueryWrapper<>();
        query.in(PmTask::getProjectId, projectIds)
                .orderByDesc(PmTask::getUpdatedAt);
        return taskMapper.selectList(query);
    }

    private List<PmTaskComment> getTaskComments(Set<Long> taskIds) {
        if (taskIds.isEmpty()) {
            return Collections.emptyList();
        }

        LambdaQueryWrapper<PmTaskComment> query = new LambdaQueryWrapper<>();
        query.in(PmTaskComment::getTaskId, taskIds);
        return commentMapper.selectList(query);
    }

    private Set<Long> getExecutorTaskIds(Long userId) {
        LambdaQueryWrapper<PmTaskMember> query = new LambdaQueryWrapper<>();
        query.eq(PmTaskMember::getUserId, userId)
                .eq(PmTaskMember::getRole, "EXECUTOR");
        return taskMemberMapper.selectList(query).stream()
                .map(PmTaskMember::getTaskId)
                .filter(Objects::nonNull)
                .collect(Collectors.toCollection(HashSet::new));
    }

    private List<PmRecurringPlan> getAssignedRecurringPlans(Long userId) {
        LambdaQueryWrapper<PmRecurringPlanAssignee> assigneeQuery = new LambdaQueryWrapper<>();
        assigneeQuery.eq(PmRecurringPlanAssignee::getUserId, userId)
                .eq(PmRecurringPlanAssignee::getRole, RECURRING_PLAN_ASSIGNEE_ROLE);
        List<Long> planIds = recurringPlanAssigneeMapper.selectList(assigneeQuery).stream()
                .map(PmRecurringPlanAssignee::getPlanId)
                .filter(Objects::nonNull)
                .distinct()
                .collect(Collectors.toList());
        if (planIds.isEmpty()) {
            return Collections.emptyList();
        }

        LambdaQueryWrapper<PmRecurringPlan> planQuery = new LambdaQueryWrapper<>();
        planQuery.in(PmRecurringPlan::getId, planIds)
                .eq(PmRecurringPlan::getStatus, RECURRING_PLAN_STATUS_ACTIVE)
                .isNotNull(PmRecurringPlan::getNextRunAt)
                .orderByAsc(PmRecurringPlan::getNextRunAt);
        return recurringPlanMapper.selectList(planQuery);
    }

    private List<PmTaskLog> getLatestTaskLogs(Map<Long, PmTask> taskMap, int limit) {
        if (taskMap.isEmpty()) {
            return Collections.emptyList();
        }

        LambdaQueryWrapper<PmTaskLog> query = new LambdaQueryWrapper<>();
        query.in(PmTaskLog::getTaskId, taskMap.keySet())
                .orderByDesc(PmTaskLog::getCreatedAt)
                .last("limit " + limit);
        return taskLogMapper.selectList(query);
    }

    private List<PmTaskLog> getTaskLogsSince(Map<Long, PmTask> taskMap, LocalDateTime startTime) {
        if (taskMap.isEmpty()) {
            return Collections.emptyList();
        }

        LambdaQueryWrapper<PmTaskLog> query = new LambdaQueryWrapper<>();
        query.in(PmTaskLog::getTaskId, taskMap.keySet())
                .ge(PmTaskLog::getCreatedAt, startTime)
                .orderByDesc(PmTaskLog::getCreatedAt);
        return taskLogMapper.selectList(query);
    }

    private DashboardStatsVO buildStats(Long userId, int projectCount, List<PmTask> myTasks, Map<Long, PmTaskStage> stageMap) {
        DashboardStatsVO stats = new DashboardStatsVO();
        stats.setProjectCount(projectCount);

        LambdaQueryWrapper<PmTaskComment> commentQuery = new LambdaQueryWrapper<>();
        commentQuery.eq(PmTaskComment::getUserId, userId);
        Long totalComments = commentMapper.selectCount(commentQuery);
        stats.setTotalCommentCount(totalComments == null ? 0 : totalComments.intValue());

        int doneCount = 0;
        for (PmTask task : myTasks) {
            if (isTaskDone(task, stageMap)) {
                doneCount++;
            }
        }

        stats.setDoneTaskCount(doneCount);
        stats.setPendingTaskCount(Math.max(myTasks.size() - doneCount, 0));
        return stats;
    }

    private DashboardOverviewSummaryVO buildOverviewSummary(List<PmProject> activeProjects,
                                                            List<PmTask> allTasks,
                                                            List<PmTask> pendingTasks,
                                                            int commentCount,
                                                            int activityCount7d,
                                                            int memberCount,
                                                            List<DashboardOverviewProjectVO> projects,
                                                            Map<Long, PmTaskStage> stageMap,
                                                            LocalDateTime now) {
        int doneCount = 0;
        int overdueCount = 0;
        int totalProgress = 0;
        int healthyCount = 0;
        int warningCount = 0;
        int riskCount = 0;

        for (PmTask task : allTasks) {
            if (isTaskDone(task, stageMap)) {
                doneCount++;
                continue;
            }
            if (task.getDueTime() != null && task.getDueTime().isBefore(now)) {
                overdueCount++;
            }
        }

        for (DashboardOverviewProjectVO project : projects) {
            totalProgress += safeInt(project.getProgress());
            if ("healthy".equals(project.getHealthLevel())) {
                healthyCount++;
            } else if ("warning".equals(project.getHealthLevel())) {
                warningCount++;
            } else {
                riskCount++;
            }
        }

        DashboardOverviewSummaryVO summary = new DashboardOverviewSummaryVO();
        summary.setProjectCount(activeProjects.size());
        summary.setTaskCount(allTasks.size());
        summary.setDoneTaskCount(doneCount);
        summary.setPendingTaskCount(pendingTasks.size());
        summary.setOverdueTaskCount(overdueCount);
        summary.setCompletionRate(allTasks.isEmpty() ? 0 : clamp((int) Math.round(doneCount * 100.0 / allTasks.size()), 0, 100));
        summary.setMemberCount(memberCount);
        summary.setCommentCount(commentCount);
        summary.setActivityCount7d(activityCount7d);
        summary.setHealthyProjectCount(healthyCount);
        summary.setWarningProjectCount(warningCount);
        summary.setRiskProjectCount(riskCount);
        summary.setAverageProgress(projects.isEmpty() ? 0 : clamp((int) Math.round(totalProgress * 1.0 / projects.size()), 0, 100));
        return summary;
    }

    private List<DashboardTaskVO> buildMyTaskVos(List<PmTask> pendingTasks,
                                                 Map<Long, PmProject> projectMap,
                                                 Map<Long, PmTaskStage> stageMap) {
        return pendingTasks.stream()
                .map(task -> {
                    DashboardTaskVO vo = new DashboardTaskVO();
                    vo.setId(task.getId());
                    vo.setTitle(task.getTitle());
                    vo.setPriority(task.getPriority());
                    vo.setDueTime(task.getDueTime());
                    vo.setProjectId(task.getProjectId());
                    PmProject project = projectMap.get(task.getProjectId());
                    vo.setProjectName(project == null ? "未命名项目" : project.getName());
                    PmTaskStage stage = stageMap.get(task.getStageId());
                    vo.setStageName(stage == null ? "未分组" : stage.getName());
                    vo.setSourceType(TASK_SOURCE_PROJECT);
                    return vo;
                })
                .collect(Collectors.toList());
    }

    private List<DashboardTaskVO> buildRecurringPlanTaskVos(List<PmRecurringPlan> plans) {
        if (plans.isEmpty()) {
            return Collections.emptyList();
        }
        return plans.stream()
                .map(plan -> {
                    DashboardTaskVO vo = new DashboardTaskVO();
                    vo.setId(plan.getId());
                    vo.setTitle(plan.getTitle());
                    vo.setPriority(plan.getPriority());
                    vo.setDueTime(resolveRecurringPlanDueTime(plan));
                    vo.setProjectId(null);
                    vo.setProjectName("周期计划");
                    vo.setStageName("下次执行");
                    vo.setSourceType(TASK_SOURCE_RECURRING_PLAN);
                    return vo;
                })
                .collect(Collectors.toList());
    }

    private LocalDateTime resolveRecurringPlanDueTime(PmRecurringPlan plan) {
        if (plan.getNextRunAt() == null) {
            return null;
        }
        if (plan.getStartTime() == null || plan.getDueTime() == null) {
            return plan.getNextRunAt();
        }
        return plan.getNextRunAt().plus(Duration.between(plan.getStartTime(), plan.getDueTime()));
    }

    private List<DashboardTaskVO> mergeDashboardTasks(List<DashboardTaskVO> projectTasks,
                                                      List<DashboardTaskVO> recurringTasks,
                                                      LocalDateTime now) {
        List<DashboardTaskVO> tasks = new ArrayList<>();
        tasks.addAll(projectTasks);
        tasks.addAll(recurringTasks);
        tasks.sort(Comparator
                .comparing((DashboardTaskVO task) -> getUrgencyBucket(task.getDueTime(), now))
                .thenComparing(DashboardTaskVO::getDueTime, Comparator.nullsLast(LocalDateTime::compareTo))
                .thenComparing(task -> normalizePriority(task.getPriority()), Comparator.reverseOrder())
                .thenComparing(DashboardTaskVO::getId, Comparator.nullsLast(Long::compareTo)));
        return tasks;
    }

    private List<DashboardActivityVO> buildActivityVos(List<PmTaskLog> logs,
                                                       Map<Long, PmTask> taskMap,
                                                       Map<Long, PmProject> projectMap) {
        if (logs.isEmpty()) {
            return Collections.emptyList();
        }

        Set<Long> userIds = logs.stream()
                .map(PmTaskLog::getOperatorId)
                .filter(Objects::nonNull)
                .collect(Collectors.toSet());
        Map<Long, SysUser> userMap = getUserMap(userIds);

        return logs.stream()
                .map(logItem -> {
                    DashboardActivityVO vo = new DashboardActivityVO();
                    vo.setId(logItem.getId());
                    vo.setOperatorId(logItem.getOperatorId());
                    vo.setActionType(logItem.getActionType());
                    vo.setDetail(logItem.getDetail());
                    vo.setTaskId(logItem.getTaskId());
                    vo.setCreatedAt(logItem.getCreatedAt());

                    SysUser user = userMap.get(logItem.getOperatorId());
                    vo.setOperatorName(user == null ? "团队成员" : user.getNickname());
                    vo.setOperatorAvatar(user == null ? null : user.getAvatar());

                    PmTask task = taskMap.get(logItem.getTaskId());
                    if (task != null) {
                        vo.setTaskTitle(task.getTitle());
                        vo.setProjectId(task.getProjectId());
                        PmProject project = projectMap.get(task.getProjectId());
                        vo.setProjectName(project == null ? "未命名项目" : project.getName());
                    } else {
                        vo.setTaskTitle("任务更新");
                        vo.setProjectName("协作空间");
                    }

                    return vo;
                })
                .collect(Collectors.toList());
    }

    private List<DashboardProjectVO> buildProjectVos(Long userId,
                                                     List<PmProject> projects,
                                                     Map<Long, Integer> roleTypeMap) {
        return projects.stream()
                .map(project -> {
                    DashboardProjectVO vo = new DashboardProjectVO();
                    vo.setId(project.getId());
                    vo.setName(project.getName());
                    vo.setDescription(project.getDescription());
                    vo.setRole(resolveProjectRole(userId, project, roleTypeMap.get(project.getId())));
                    return vo;
                })
                .collect(Collectors.toList());
    }

    private List<DashboardOverviewProjectVO> buildOverviewProjects(List<PmProject> projects,
                                                                   Map<Long, List<PmTask>> tasksByProject,
                                                                   Map<Long, Set<Long>> memberIdsByProject,
                                                                   Map<Long, Integer> commentCountByProject,
                                                                   Map<Long, Integer> activityCountByProject,
                                                                   Map<Long, SysUser> ownerMap,
                                                                   Map<Long, PmTaskStage> stageMap,
                                                                   LocalDateTime now) {
        return projects.stream()
                .map(project -> {
                    List<PmTask> tasks = tasksByProject.getOrDefault(project.getId(), Collections.emptyList());
                    int doneCount = 0;
                    int pendingCount = 0;
                    int overdueCount = 0;
                    int highPriorityCount = 0;
                    int mediumPriorityCount = 0;
                    int normalPriorityCount = 0;
                    LocalDateTime lastActivityAt = project.getUpdatedAt();
                    List<PmTask> pendingTasks = new ArrayList<>();

                    for (PmTask task : tasks) {
                        lastActivityAt = maxDateTime(lastActivityAt, task.getUpdatedAt());
                        if (isTaskDone(task, stageMap)) {
                            doneCount++;
                            continue;
                        }

                        pendingCount++;
                        pendingTasks.add(task);
                        Integer priority = normalizePriority(task.getPriority());
                        if (priority == 3) {
                            highPriorityCount++;
                        } else if (priority == 2) {
                            mediumPriorityCount++;
                        } else {
                            normalPriorityCount++;
                        }

                        if (task.getDueTime() != null && task.getDueTime().isBefore(now)) {
                            overdueCount++;
                        }
                    }

                    int progress = clamp(safeInt(project.getProgress()), 0, 100);
                    int taskCount = tasks.size();
                    int completionRate = taskCount == 0 ? progress : clamp((int) Math.round(doneCount * 100.0 / taskCount), 0, 100);
                    int activityCount7d = activityCountByProject.getOrDefault(project.getId(), 0);
                    int healthScore = calculateHealthScore(progress, completionRate, overdueCount, pendingCount, activityCount7d, taskCount);

                    DashboardOverviewProjectVO item = new DashboardOverviewProjectVO();
                    item.setProjectId(project.getId());
                    item.setName(project.getName());
                    item.setDescription(project.getDescription());
                    item.setOwnerName(resolveUserDisplayName(ownerMap.get(project.getOwnerId()), "项目负责人"));
                    item.setProgress(progress);
                    item.setHealthScore(healthScore);
                    item.setHealthLevel(resolveHealthLevel(healthScore, overdueCount));
                    item.setTaskCount(taskCount);
                    item.setDoneCount(doneCount);
                    item.setPendingCount(pendingCount);
                    item.setOverdueCount(overdueCount);
                    item.setCompletionRate(completionRate);
                    item.setMemberCount(memberIdsByProject.getOrDefault(project.getId(), Collections.emptySet()).size());
                    item.setCommentCount(commentCountByProject.getOrDefault(project.getId(), 0));
                    item.setActivityCount7d(activityCount7d);
                    item.setHighPriorityCount(highPriorityCount);
                    item.setMediumPriorityCount(mediumPriorityCount);
                    item.setNormalPriorityCount(normalPriorityCount);
                    item.setLastActivityAt(lastActivityAt);
                    item.setUpdatedAt(project.getUpdatedAt());
                    item.setTrend7d(buildTaskTrend(tasks, stageMap, now));
                    item.setPriorityDistribution(buildPriorityDistribution(pendingTasks));
                    return item;
                })
                .sorted(
                        Comparator.comparing(DashboardOverviewProjectVO::getHealthScore, Comparator.nullsLast(Integer::compareTo))
                                .thenComparing(DashboardOverviewProjectVO::getOverdueCount, Comparator.nullsLast(Comparator.reverseOrder()))
                                .thenComparing(DashboardOverviewProjectVO::getActivityCount7d, Comparator.nullsLast(Comparator.reverseOrder()))
                )
                .collect(Collectors.toList());
    }

    private DashboardInsightVO buildInsight(List<PmTask> myTasks,
                                            Map<Long, PmTaskStage> stageMap,
                                            List<DashboardTaskVO> recurringTasks,
                                            int activeProjectCount,
                                            int activityCount7d,
                                            LocalDateTime now) {
        DashboardInsightVO insight = new DashboardInsightVO();
        int overdueCount = 0;
        int dueSoonCount = 0;
        int doneCount = 0;

        for (PmTask task : myTasks) {
            if (isTaskDone(task, stageMap)) {
                doneCount++;
                continue;
            }

            if (task.getDueTime() == null) {
                continue;
            }

            if (task.getDueTime().isBefore(now)) {
                overdueCount++;
            } else if (!task.getDueTime().isAfter(now.plusHours(24))) {
                dueSoonCount++;
            }
        }

        for (DashboardTaskVO task : recurringTasks) {
            LocalDateTime dueTime = task.getDueTime();
            if (dueTime == null) {
                continue;
            }
            if (dueTime.isBefore(now)) {
                overdueCount++;
            } else if (!dueTime.isAfter(now.plusHours(24))) {
                dueSoonCount++;
            }
        }

        int totalTaskCount = myTasks.size() + recurringTasks.size();
        int completionRate = totalTaskCount == 0 ? 0 : (int) Math.round(doneCount * 100.0 / totalTaskCount);
        insight.setOverdueTaskCount(overdueCount);
        insight.setDueSoonTaskCount(dueSoonCount);
        insight.setCompletionRate(completionRate);
        insight.setActiveProjectCount(activeProjectCount);
        insight.setActivityCount7d(activityCount7d);
        return insight;
    }

    private List<DashboardTaskTrendVO> buildTaskTrend(List<PmTask> myTasks,
                                                      Map<Long, PmTaskStage> stageMap,
                                                      LocalDateTime now) {
        Map<LocalDate, DashboardTaskTrendVO> trendMap = initDailyTrendMap();

        for (PmTask task : myTasks) {
            LocalDate createdDate = toDate(task.getCreatedAt());
            if (createdDate != null && trendMap.containsKey(createdDate)) {
                DashboardTaskTrendVO item = trendMap.get(createdDate);
                item.setCreatedCount(item.getCreatedCount() + 1);
            }

            if (isTaskDone(task, stageMap)) {
                LocalDate completedDate = toDate(task.getUpdatedAt());
                if (completedDate != null && trendMap.containsKey(completedDate)) {
                    DashboardTaskTrendVO item = trendMap.get(completedDate);
                    item.setCompletedCount(item.getCompletedCount() + 1);
                }
                continue;
            }

            if (task.getDueTime() != null && task.getDueTime().isBefore(now)) {
                LocalDate dueDate = toDate(task.getDueTime());
                if (dueDate != null && trendMap.containsKey(dueDate)) {
                    DashboardTaskTrendVO item = trendMap.get(dueDate);
                    item.setOverdueCount(item.getOverdueCount() + 1);
                }
            }
        }

        return new ArrayList<>(trendMap.values());
    }

    private List<DashboardPriorityDistributionVO> buildPriorityDistribution(List<PmTask> pendingTasks) {
        Map<Integer, Integer> distribution = new HashMap<>();
        distribution.put(1, 0);
        distribution.put(2, 0);
        distribution.put(3, 0);

        for (PmTask task : pendingTasks) {
            Integer priority = normalizePriority(task.getPriority());
            distribution.put(priority, distribution.getOrDefault(priority, 0) + 1);
        }

        List<DashboardPriorityDistributionVO> result = new ArrayList<>();
        for (int priority = 1; priority <= 3; priority++) {
            DashboardPriorityDistributionVO item = new DashboardPriorityDistributionVO();
            item.setPriority(priority);
            item.setCount(distribution.getOrDefault(priority, 0));
            result.add(item);
        }
        return result;
    }

    private List<DashboardPriorityDistributionVO> buildDashboardTaskPriorityDistribution(List<DashboardTaskVO> pendingTasks) {
        Map<Integer, Integer> distribution = new HashMap<>();
        distribution.put(1, 0);
        distribution.put(2, 0);
        distribution.put(3, 0);

        for (DashboardTaskVO task : pendingTasks) {
            Integer priority = normalizePriority(task.getPriority());
            distribution.put(priority, distribution.getOrDefault(priority, 0) + 1);
        }

        List<DashboardPriorityDistributionVO> result = new ArrayList<>();
        for (int priority = 1; priority <= 3; priority++) {
            DashboardPriorityDistributionVO item = new DashboardPriorityDistributionVO();
            item.setPriority(priority);
            item.setCount(distribution.getOrDefault(priority, 0));
            result.add(item);
        }
        return result;
    }

    private List<DashboardActivityHeatVO> buildActivityHeat(List<PmTaskLog> logsIn7Days) {
        Map<LocalDate, DashboardActivityHeatVO> heatMap = new LinkedHashMap<>();
        LocalDate startDate = LocalDate.now().minusDays(6);
        for (int index = 0; index < 7; index++) {
            LocalDate date = startDate.plusDays(index);
            DashboardActivityHeatVO item = new DashboardActivityHeatVO();
            item.setDate(date.format(DAY_FORMATTER));
            item.setCount(0);
            heatMap.put(date, item);
        }

        for (PmTaskLog logItem : logsIn7Days) {
            LocalDate date = toDate(logItem.getCreatedAt());
            if (date != null && heatMap.containsKey(date)) {
                DashboardActivityHeatVO item = heatMap.get(date);
                item.setCount(item.getCount() + 1);
            }
        }

        return new ArrayList<>(heatMap.values());
    }

    private List<DashboardOverviewHealthVO> buildOverviewHealthDistribution(List<DashboardOverviewProjectVO> projects) {
        Map<String, Integer> distribution = new LinkedHashMap<>();
        distribution.put("healthy", 0);
        distribution.put("warning", 0);
        distribution.put("risk", 0);

        for (DashboardOverviewProjectVO project : projects) {
            String healthLevel = project.getHealthLevel();
            if (!distribution.containsKey(healthLevel)) {
                healthLevel = "warning";
            }
            distribution.put(healthLevel, distribution.get(healthLevel) + 1);
        }

        List<DashboardOverviewHealthVO> result = new ArrayList<>();
        result.add(buildHealthItem("healthy", "稳定推进", distribution.get("healthy")));
        result.add(buildHealthItem("warning", "需要留意", distribution.get("warning")));
        result.add(buildHealthItem("risk", "重点关注", distribution.get("risk")));
        return result;
    }

    private DashboardOverviewHealthVO buildHealthItem(String status, String label, Integer count) {
        DashboardOverviewHealthVO item = new DashboardOverviewHealthVO();
        item.setStatus(status);
        item.setLabel(label);
        item.setCount(count == null ? 0 : count);
        return item;
    }

    private List<DashboardProjectHealthVO> buildProjectHealth(Long userId,
                                                              List<PmProject> projects,
                                                              Map<Long, Integer> roleTypeMap,
                                                              List<PmTask> projectTasks,
                                                              Map<Long, PmTaskStage> stageMap,
                                                              LocalDateTime now) {
        Map<Long, List<PmTask>> taskMapByProject = projectTasks.stream()
                .collect(Collectors.groupingBy(PmTask::getProjectId));

        return projects.stream()
                .map(project -> {
                    List<PmTask> tasks = taskMapByProject.getOrDefault(project.getId(), Collections.emptyList());
                    int doneCount = 0;
                    int pendingCount = 0;
                    int overdueCount = 0;

                    for (PmTask task : tasks) {
                        if (isTaskDone(task, stageMap)) {
                            doneCount++;
                        } else {
                            pendingCount++;
                            if (task.getDueTime() != null && task.getDueTime().isBefore(now)) {
                                overdueCount++;
                            }
                        }
                    }

                    DashboardProjectHealthVO item = new DashboardProjectHealthVO();
                    item.setProjectId(project.getId());
                    item.setName(project.getName());
                    item.setRole(resolveProjectRole(userId, project, roleTypeMap.get(project.getId())));
                    item.setProgress(project.getProgress() == null ? 0 : project.getProgress());
                    item.setPendingCount(pendingCount);
                    item.setDoneCount(doneCount);
                    item.setOverdueCount(overdueCount);
                    return item;
                })
                .sorted(
                        Comparator.comparing(DashboardProjectHealthVO::getOverdueCount, Comparator.nullsLast(Comparator.reverseOrder()))
                                .thenComparing(DashboardProjectHealthVO::getPendingCount, Comparator.nullsLast(Comparator.reverseOrder()))
                                .thenComparing(DashboardProjectHealthVO::getProgress, Comparator.nullsLast(Integer::compareTo))
                )
                .collect(Collectors.toList());
    }

    private Map<Long, PmTaskStage> getStageMap(Set<Long> stageIds) {
        if (stageIds.isEmpty()) {
            return Collections.emptyMap();
        }
        return taskStageMapper.selectBatchIds(stageIds).stream()
                .collect(Collectors.toMap(PmTaskStage::getId, Function.identity()));
    }

    private Map<Long, SysUser> getUserMap(Set<Long> userIds) {
        if (userIds.isEmpty()) {
            return Collections.emptyMap();
        }
        return userMapper.selectBatchIds(userIds).stream()
                .collect(Collectors.toMap(SysUser::getId, Function.identity()));
    }

    private boolean isTaskDone(PmTask task, Map<Long, PmTaskStage> stageMap) {
        if (task == null) {
            return false;
        }
        if (task.getStatus() != null && task.getStatus() == 1) {
            return true;
        }
        PmTaskStage stage = stageMap.get(task.getStageId());
        return stage != null && isDoneStage(stage.getName());
    }

    private boolean isDoneStage(String stageName) {
        if (stageName == null || stageName.isEmpty()) {
            return false;
        }
        for (String keyword : DONE_STAGE_KEYWORDS) {
            if (stageName.contains(keyword)) {
                return true;
            }
        }
        return false;
    }

    private Comparator<PmTask> buildPendingTaskComparator(LocalDateTime now) {
        return Comparator
                .comparing((PmTask task) -> getUrgencyBucket(task, now))
                .thenComparing(PmTask::getDueTime, Comparator.nullsLast(LocalDateTime::compareTo))
                .thenComparing(task -> normalizePriority(task.getPriority()), Comparator.reverseOrder())
                .thenComparing(PmTask::getUpdatedAt, Comparator.nullsLast(Comparator.reverseOrder()));
    }

    private int getUrgencyBucket(PmTask task, LocalDateTime now) {
        return getUrgencyBucket(task.getDueTime(), now);
    }

    private int getUrgencyBucket(LocalDateTime dueTime, LocalDateTime now) {
        if (dueTime == null) {
            return 2;
        }
        if (dueTime.isBefore(now)) {
            return 0;
        }
        if (!dueTime.isAfter(now.plusHours(24))) {
            return 1;
        }
        return 2;
    }

    private Integer normalizePriority(Integer priority) {
        if (priority == null || priority < 1 || priority > 3) {
            return 1;
        }
        return priority;
    }

    private String resolveProjectRole(Long userId, PmProject project, Integer roleType) {
        if (project != null && project.getOwnerId() != null && project.getOwnerId().equals(userId)) {
            return "owner";
        }
        return ProjectMemberRole.toRoleCode(false, roleType);
    }

    private String resolveUserDisplayName(SysUser user, String fallback) {
        if (user == null) {
            return fallback;
        }
        if (user.getNickname() != null && !user.getNickname().isEmpty()) {
            return user.getNickname();
        }
        if (user.getUsername() != null && !user.getUsername().isEmpty()) {
            return user.getUsername();
        }
        return fallback;
    }

    private int calculateHealthScore(int progress,
                                     int completionRate,
                                     int overdueCount,
                                     int pendingCount,
                                     int activityCount7d,
                                     int taskCount) {
        int overduePenalty = Math.min(overdueCount * 10, 36);
        int pendingPenalty = Math.min(pendingCount * 3, 18);
        int activityBonus = Math.min(activityCount7d * 2, 12);
        int emptyProjectBonus = taskCount == 0 ? 6 : 0;
        int score = (progress + completionRate) / 2 - overduePenalty - pendingPenalty + activityBonus + emptyProjectBonus;
        return clamp(score, 0, 100);
    }

    private String resolveHealthLevel(int healthScore, int overdueCount) {
        if (healthScore >= 72 && overdueCount <= 1) {
            return "healthy";
        }
        if (healthScore >= 45) {
            return "warning";
        }
        return "risk";
    }

    private int safeInt(Integer value) {
        return value == null ? 0 : value;
    }

    private int clamp(int value, int min, int max) {
        return Math.max(min, Math.min(max, value));
    }

    private LocalDateTime maxDateTime(LocalDateTime left, LocalDateTime right) {
        if (left == null) {
            return right;
        }
        if (right == null) {
            return left;
        }
        return left.isAfter(right) ? left : right;
    }

    private Map<LocalDate, DashboardTaskTrendVO> initDailyTrendMap() {
        Map<LocalDate, DashboardTaskTrendVO> map = new LinkedHashMap<>();
        LocalDate startDate = LocalDate.now().minusDays(6);
        for (int index = 0; index < 7; index++) {
            LocalDate date = startDate.plusDays(index);
            DashboardTaskTrendVO item = new DashboardTaskTrendVO();
            item.setDate(date.format(DAY_FORMATTER));
            item.setCreatedCount(0);
            item.setCompletedCount(0);
            item.setOverdueCount(0);
            map.put(date, item);
        }
        return map;
    }

    private LocalDate toDate(LocalDateTime dateTime) {
        return dateTime == null ? null : dateTime.toLocalDate();
    }
}
