package top.sharpcaterpillar.teamsync.service.impl;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import org.springframework.stereotype.Service;
import top.sharpcaterpillar.teamsync.entity.PmProject;
import top.sharpcaterpillar.teamsync.entity.PmRecurringPlan;
import top.sharpcaterpillar.teamsync.entity.PmRecurringPlanAssignee;
import top.sharpcaterpillar.teamsync.entity.PmTask;
import top.sharpcaterpillar.teamsync.entity.PmTaskMember;
import top.sharpcaterpillar.teamsync.entity.PmTaskStage;
import top.sharpcaterpillar.teamsync.entity.SysUser;
import top.sharpcaterpillar.teamsync.mapper.PmProjectMapper;
import top.sharpcaterpillar.teamsync.mapper.PmRecurringPlanAssigneeMapper;
import top.sharpcaterpillar.teamsync.mapper.PmRecurringPlanMapper;
import top.sharpcaterpillar.teamsync.mapper.PmTaskMapper;
import top.sharpcaterpillar.teamsync.mapper.PmTaskMemberMapper;
import top.sharpcaterpillar.teamsync.mapper.PmTaskStageMapper;
import top.sharpcaterpillar.teamsync.mapper.SysUserMapper;
import top.sharpcaterpillar.teamsync.service.BigScreenService;
import top.sharpcaterpillar.teamsync.service.PmProjectService;
import top.sharpcaterpillar.teamsync.vo.TaskReminderScreenVO;

import java.time.Duration;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.Collection;
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
 * 任务提醒大屏公开聚合服务。
 */
@Service
public class BigScreenServiceImpl implements BigScreenService {

    private static final List<String> DONE_STAGE_KEYWORDS = Arrays.asList("完成", "Done", "done", "DONE", "✅");
    private static final String TASK_EXECUTOR_ROLE = "EXECUTOR";
    private static final String PLAN_STATUS_ACTIVE = "ACTIVE";
    private static final String PLAN_RESPONSIBLE_ROLE = "RESPONSIBLE";
    private static final DateTimeFormatter TIME_FORMATTER = DateTimeFormatter.ofPattern("HH:mm");
    private static final DateTimeFormatter SHORT_DATE_TIME_FORMATTER = DateTimeFormatter.ofPattern("MM/dd HH:mm");
    private static final DateTimeFormatter SHORT_DATE_FORMATTER = DateTimeFormatter.ofPattern("MM/dd");

    private final PmProjectMapper projectMapper;
    private final PmTaskMapper taskMapper;
    private final PmTaskStageMapper taskStageMapper;
    private final PmTaskMemberMapper taskMemberMapper;
    private final PmRecurringPlanMapper recurringPlanMapper;
    private final PmRecurringPlanAssigneeMapper recurringPlanAssigneeMapper;
    private final SysUserMapper userMapper;
    private final PmProjectService projectService;

    public BigScreenServiceImpl(PmProjectMapper projectMapper,
                                PmTaskMapper taskMapper,
                                PmTaskStageMapper taskStageMapper,
                                PmTaskMemberMapper taskMemberMapper,
                                PmRecurringPlanMapper recurringPlanMapper,
                                PmRecurringPlanAssigneeMapper recurringPlanAssigneeMapper,
                                SysUserMapper userMapper,
                                PmProjectService projectService) {
        this.projectMapper = projectMapper;
        this.taskMapper = taskMapper;
        this.taskStageMapper = taskStageMapper;
        this.taskMemberMapper = taskMemberMapper;
        this.recurringPlanMapper = recurringPlanMapper;
        this.recurringPlanAssigneeMapper = recurringPlanAssigneeMapper;
        this.userMapper = userMapper;
        this.projectService = projectService;
    }

    @Override
    public TaskReminderScreenVO getTaskReminderScreenData() {
        LocalDateTime now = LocalDateTime.now();
        LocalDate today = now.toLocalDate();
        LocalDate sevenDaysLater = today.plusDays(6);

        List<PmProject> projects = getActiveProjects();
        projectService.fillCalculatedProgress(projects);
        Map<Long, PmProject> projectMap = projects.stream()
                .filter(project -> project.getId() != null)
                .collect(Collectors.toMap(PmProject::getId, Function.identity(), (left, right) -> left));

        List<PmTask> allTasks = getTasks(projectMap.keySet());
        Map<Long, PmTaskStage> stageMap = getStageMap(allTasks);
        List<PmTask> pendingTasks = allTasks.stream()
                .filter(task -> !isTaskDone(task, stageMap))
                .collect(Collectors.toList());

        List<PmTaskMember> taskMembers = getTaskMembers(allTasks);
        Map<Long, List<Long>> executorIdsByTask = buildExecutorIdsByTask(taskMembers);

        List<PmRecurringPlan> recurringPlans = getActiveRecurringPlans();
        List<PmRecurringPlanAssignee> planAssignees = getPlanAssignees(recurringPlans);
        Map<Long, List<Long>> assigneeIdsByPlan = buildAssigneeIdsByPlan(planAssignees);

        Map<Long, SysUser> userMap = getUserMap(allTasks, taskMembers, recurringPlans, planAssignees);
        Map<Long, List<PmTask>> tasksByProject = pendingTasks.stream()
                .filter(task -> task.getProjectId() != null)
                .collect(Collectors.groupingBy(PmTask::getProjectId));
        List<TaskReminderScreenVO.ProjectRiskItemVO> projectRisks = buildProjectRisks(projects, tasksByProject, now);
        List<TaskReminderScreenVO.RecurringPlanReminderItemVO> recurringPlanVos = buildRecurringPlans(
                recurringPlans,
                assigneeIdsByPlan,
                userMap,
                now
        );
        List<AssigneeAggregate> assigneeAggregates = buildAssigneeAggregates(
                allTasks,
                pendingTasks,
                stageMap,
                executorIdsByTask,
                userMap,
                today,
                now
        );
        List<TaskReminderScreenVO.CollaborationReminderItemVO> collaborationReminders = buildCollaborationReminders(
                projectRisks,
                tasksByProject,
                executorIdsByTask,
                userMap,
                now
        );

        TaskReminderScreenVO vo = new TaskReminderScreenVO();
        vo.setSummaryCards(buildSummaryCards(projects, pendingTasks, recurringPlans, now, today));
        vo.setManagementSnapshotCards(buildManagementSnapshotCards(allTasks, pendingTasks, stageMap, projectRisks, assigneeAggregates, now));
        vo.setUrgentTasks(buildUrgentTasks(pendingTasks, projectMap, executorIdsByTask, userMap, now));
        vo.setTodayTimeline(buildTodayTimeline(pendingTasks, today, now));
        vo.setProjectRisks(projectRisks);
        vo.setRecurringPlans(recurringPlanVos);
        vo.setAssigneeSummaryCards(buildAssigneeSummaryCards(assigneeAggregates, allTasks, stageMap, projects, today));
        vo.setAssigneeWall(buildAssigneeWall(assigneeAggregates));
        vo.setWorkloadRanking(buildWorkloadRanking(assigneeAggregates));
        vo.setCollaborationReminders(collaborationReminders);
        vo.setSevenDaySummaryCards(buildSevenDaySummaryCards(
                pendingTasks,
                recurringPlans,
                projectRisks,
                collaborationReminders,
                now,
                today,
                sevenDaysLater
        ));
        vo.setSevenDayCalendar(buildSevenDayCalendar(pendingTasks, recurringPlans, today, sevenDaysLater));
        vo.setDailyFocus(buildDailyFocus(pendingTasks, recurringPlans, executorIdsByTask, assigneeIdsByPlan, userMap, today, now));
        vo.setMilestoneCards(buildMilestoneCards(projects, tasksByProject, projectRisks));
        return vo;
    }

    private List<PmProject> getActiveProjects() {
        LambdaQueryWrapper<PmProject> query = new LambdaQueryWrapper<>();
        query.eq(PmProject::getIsArchived, 0).orderByDesc(PmProject::getUpdatedAt);
        return projectMapper.selectList(query);
    }

    private List<PmTask> getTasks(Set<Long> projectIds) {
        if (projectIds.isEmpty()) {
            return Collections.emptyList();
        }
        LambdaQueryWrapper<PmTask> query = new LambdaQueryWrapper<>();
        query.in(PmTask::getProjectId, projectIds)
                .orderByAsc(PmTask::getDueTime)
                .orderByDesc(PmTask::getPriority)
                .orderByDesc(PmTask::getUpdatedAt);
        return taskMapper.selectList(query);
    }

    private Map<Long, PmTaskStage> getStageMap(List<PmTask> tasks) {
        Set<Long> stageIds = tasks.stream()
                .map(PmTask::getStageId)
                .filter(Objects::nonNull)
                .collect(Collectors.toCollection(HashSet::new));
        if (stageIds.isEmpty()) {
            return Collections.emptyMap();
        }
        return taskStageMapper.selectBatchIds(stageIds).stream()
                .collect(Collectors.toMap(PmTaskStage::getId, Function.identity(), (left, right) -> left));
    }

    private List<PmTaskMember> getTaskMembers(List<PmTask> tasks) {
        Set<Long> taskIds = tasks.stream()
                .map(PmTask::getId)
                .filter(Objects::nonNull)
                .collect(Collectors.toCollection(HashSet::new));
        if (taskIds.isEmpty()) {
            return Collections.emptyList();
        }
        LambdaQueryWrapper<PmTaskMember> query = new LambdaQueryWrapper<>();
        query.in(PmTaskMember::getTaskId, taskIds).eq(PmTaskMember::getRole, TASK_EXECUTOR_ROLE);
        return taskMemberMapper.selectList(query);
    }

    private List<PmRecurringPlan> getActiveRecurringPlans() {
        LambdaQueryWrapper<PmRecurringPlan> query = new LambdaQueryWrapper<>();
        query.eq(PmRecurringPlan::getStatus, PLAN_STATUS_ACTIVE)
                .isNotNull(PmRecurringPlan::getNextRunAt)
                .orderByAsc(PmRecurringPlan::getNextRunAt);
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
                .eq(PmRecurringPlanAssignee::getRole, PLAN_RESPONSIBLE_ROLE);
        return recurringPlanAssigneeMapper.selectList(query);
    }

    private Map<Long, List<Long>> buildExecutorIdsByTask(List<PmTaskMember> taskMembers) {
        Map<Long, List<Long>> result = new HashMap<>();
        for (PmTaskMember member : taskMembers) {
            if (member.getTaskId() == null || member.getUserId() == null) {
                continue;
            }
            result.computeIfAbsent(member.getTaskId(), key -> new ArrayList<>()).add(member.getUserId());
        }
        return result;
    }

    private Map<Long, List<Long>> buildAssigneeIdsByPlan(List<PmRecurringPlanAssignee> planAssignees) {
        Map<Long, List<Long>> result = new HashMap<>();
        for (PmRecurringPlanAssignee assignee : planAssignees) {
            if (assignee.getPlanId() == null || assignee.getUserId() == null) {
                continue;
            }
            result.computeIfAbsent(assignee.getPlanId(), key -> new ArrayList<>()).add(assignee.getUserId());
        }
        return result;
    }

    private Map<Long, SysUser> getUserMap(List<PmTask> tasks,
                                          List<PmTaskMember> taskMembers,
                                          List<PmRecurringPlan> plans,
                                          List<PmRecurringPlanAssignee> planAssignees) {
        Set<Long> userIds = new HashSet<>();
        tasks.stream().map(PmTask::getCreatorId).filter(Objects::nonNull).forEach(userIds::add);
        taskMembers.stream().map(PmTaskMember::getUserId).filter(Objects::nonNull).forEach(userIds::add);
        plans.stream().map(PmRecurringPlan::getCreatorId).filter(Objects::nonNull).forEach(userIds::add);
        planAssignees.stream().map(PmRecurringPlanAssignee::getUserId).filter(Objects::nonNull).forEach(userIds::add);
        if (userIds.isEmpty()) {
            return Collections.emptyMap();
        }
        return userMapper.selectBatchIds(userIds).stream()
                .collect(Collectors.toMap(SysUser::getId, Function.identity(), (left, right) -> left));
    }

    private List<TaskReminderScreenVO.KpiCardItemVO> buildSummaryCards(List<PmProject> projects,
                                                                        List<PmTask> pendingTasks,
                                                                        List<PmRecurringPlan> recurringPlans,
                                                                        LocalDateTime now,
                                                                        LocalDate today) {
        int todayDueCount = countTasksDueOn(pendingTasks, today);
        int dueSoonCount = (int) pendingTasks.stream()
                .filter(task -> task.getDueTime() != null)
                .filter(task -> !task.getDueTime().isBefore(now) && !task.getDueTime().isAfter(now.plusHours(48)))
                .count();
        int overdueCount = (int) pendingTasks.stream()
                .filter(task -> task.getDueTime() != null && task.getDueTime().isBefore(now))
                .count();

        return List.of(
                kpi("pending", "待处理任务", pendingTasks.size(), "实时统计", "flat", "primary", "task"),
                kpi("today-due", "今日到期", todayDueCount, "今日截止", "flat", "warning", "calendar"),
                kpi("due-soon", "即将到期(48h)", dueSoonCount, "48小时内", "flat", "warning", "clock"),
                kpi("overdue", "已逾期", overdueCount, overdueCount > 0 ? "需重点关注" : "暂无逾期", overdueCount > 0 ? "up" : "flat", "danger", "warning"),
                kpi("recurring", "周期计划待办", recurringPlans.size(), "独立待办", "flat", "purple", "refresh"),
                kpi("projects", "项目总数", projects.size(), "活跃项目", "flat", "success", "folder")
        );
    }

    private List<TaskReminderScreenVO.KpiCardItemVO> buildManagementSnapshotCards(List<PmTask> allTasks,
                                                                                  List<PmTask> pendingTasks,
                                                                                  Map<Long, PmTaskStage> stageMap,
                                                                                  List<TaskReminderScreenVO.ProjectRiskItemVO> projectRisks,
                                                                                  List<AssigneeAggregate> assigneeAggregates,
                                                                                  LocalDateTime now) {
        int doneCount = (int) allTasks.stream().filter(task -> isTaskDone(task, stageMap)).count();
        int overdueCount = (int) pendingTasks.stream()
                .filter(task -> task.getDueTime() != null && task.getDueTime().isBefore(now))
                .count();
        int completionRate = allTasks.isEmpty() ? 0 : (int) Math.round(doneCount * 100.0 / allTasks.size());
        int overdueRate = allTasks.isEmpty() ? 0 : (int) Math.round(overdueCount * 100.0 / allTasks.size());
        int riskProjectCount = (int) projectRisks.stream()
                .filter(project -> "high".equals(project.riskLevel()) || "attention".equals(project.riskLevel()))
                .count();
        int workloadRiskCount = (int) assigneeAggregates.stream()
                .filter(aggregate -> aggregate.overdueCount > 0 || aggregate.todoCount >= 6)
                .count();

        return List.of(
                kpi("completion-rate", "任务完成率", completionRate, "统计全部活跃任务", "flat", "success", "check"),
                kpi("overdue-rate", "任务逾期率", overdueRate, overdueCount + " 项逾期", overdueCount > 0 ? "up" : "flat", "danger", "warning"),
                kpi("risk-projects", "风险项目", riskProjectCount, "高风险与需关注", riskProjectCount > 0 ? "up" : "flat", "warning", "folder"),
                kpi("workload-risk", "负载风险成员", workloadRiskCount, "逾期或待办偏高", workloadRiskCount > 0 ? "up" : "flat", "primary", "team")
        );
    }

    private TaskReminderScreenVO.KpiCardItemVO kpi(String id,
                                                   String label,
                                                   int value,
                                                   String trendText,
                                                   String trendDirection,
                                                   String tone,
                                                   String icon) {
        return new TaskReminderScreenVO.KpiCardItemVO(id, label, value, trendText, trendDirection, tone, icon);
    }

    private List<TaskReminderScreenVO.UrgentTaskItemVO> buildUrgentTasks(List<PmTask> pendingTasks,
                                                                         Map<Long, PmProject> projectMap,
                                                                         Map<Long, List<Long>> executorIdsByTask,
                                                                         Map<Long, SysUser> userMap,
                                                                         LocalDateTime now) {
        return pendingTasks.stream()
                .filter(task -> task.getDueTime() != null || normalizePriority(task.getPriority()) >= 2)
                .sorted(buildTaskUrgencyComparator(now))
                .limit(6)
                .map(task -> new TaskReminderScreenVO.UrgentTaskItemVO(
                        task.getId(),
                        safeText(task.getTitle(), "未命名任务"),
                        resolveProjectName(projectMap.get(task.getProjectId())),
                        resolveTaskAssigneeName(task, executorIdsByTask, userMap),
                        priorityText(task.getPriority()),
                        priorityLevel(task.getPriority()),
                        formatRemainingTime(task.getDueTime(), now),
                        resolveTaskStatus(task.getDueTime(), now)
                ))
                .collect(Collectors.toList());
    }

    private List<TaskReminderScreenVO.TimelineTaskItemVO> buildTodayTimeline(List<PmTask> pendingTasks,
                                                                             LocalDate today,
                                                                             LocalDateTime now) {
        return pendingTasks.stream()
                .filter(task -> task.getDueTime() != null && task.getDueTime().toLocalDate().equals(today))
                .sorted(Comparator.comparing(PmTask::getDueTime))
                .limit(6)
                .map(task -> new TaskReminderScreenVO.TimelineTaskItemVO(
                        task.getId(),
                        task.getDueTime().format(TIME_FORMATTER),
                        safeText(task.getTitle(), "未命名任务"),
                        formatTimelineCountdown(task.getDueTime(), now),
                        resolveTaskStatus(task.getDueTime(), now)
                ))
                .collect(Collectors.toList());
    }

    private List<TaskReminderScreenVO.ProjectRiskItemVO> buildProjectRisks(List<PmProject> projects,
                                                                           Map<Long, List<PmTask>> tasksByProject,
                                                                           LocalDateTime now) {
        return projects.stream()
                .map(project -> {
                    List<PmTask> tasks = tasksByProject.getOrDefault(project.getId(), Collections.emptyList());
                    int overdueCount = (int) tasks.stream()
                            .filter(task -> task.getDueTime() != null && task.getDueTime().isBefore(now))
                            .count();
                    int progress = clamp(project.getProgress() == null ? 0 : project.getProgress(), 0, 100);
                    String riskLevel = resolveProjectRiskLevel(progress, overdueCount);
                    return new TaskReminderScreenVO.ProjectRiskItemVO(
                            project.getId(),
                            safeText(project.getName(), "未命名项目"),
                            progress,
                            overdueCount,
                            riskLevel,
                            riskText(riskLevel)
                    );
                })
                .sorted(
                        Comparator.comparing(TaskReminderScreenVO.ProjectRiskItemVO::overdueTaskCount, Comparator.reverseOrder())
                                .thenComparing(TaskReminderScreenVO.ProjectRiskItemVO::progress)
                )
                .limit(5)
                .collect(Collectors.toList());
    }

    private List<TaskReminderScreenVO.RecurringPlanReminderItemVO> buildRecurringPlans(List<PmRecurringPlan> plans,
                                                                                       Map<Long, List<Long>> assigneeIdsByPlan,
                                                                                       Map<Long, SysUser> userMap,
                                                                                       LocalDateTime now) {
        return plans.stream()
                .sorted(Comparator.comparing(PmRecurringPlan::getNextRunAt, Comparator.nullsLast(LocalDateTime::compareTo)))
                .limit(5)
                .map(plan -> {
                    LocalDateTime dueTime = calculatePlanDueTime(plan);
                    return new TaskReminderScreenVO.RecurringPlanReminderItemVO(
                            plan.getId(),
                            safeText(plan.getTitle(), "未命名周期计划"),
                            cycleText(plan),
                            formatDateTime(plan.getNextRunAt()),
                            resolvePlanAssigneeName(plan, assigneeIdsByPlan, userMap),
                            formatDateTime(dueTime),
                            resolveTaskStatus(dueTime, now)
                    );
                })
                .collect(Collectors.toList());
    }

    private List<AssigneeAggregate> buildAssigneeAggregates(List<PmTask> allTasks,
                                                            List<PmTask> pendingTasks,
                                                            Map<Long, PmTaskStage> stageMap,
                                                            Map<Long, List<Long>> executorIdsByTask,
                                                            Map<Long, SysUser> userMap,
                                                            LocalDate today,
                                                            LocalDateTime now) {
        Map<Long, AssigneeAggregate> aggregateMap = new LinkedHashMap<>();
        for (PmTask task : allTasks) {
            List<Long> assigneeIds = resolveTaskAssigneeIds(task, executorIdsByTask);
            for (Long userId : assigneeIds) {
                AssigneeAggregate aggregate = aggregateMap.computeIfAbsent(
                        userId,
                        key -> new AssigneeAggregate(userId, resolveUserName(userMap.get(userId), "未分配"))
                );
                aggregate.totalCount++;
                if (isTaskDone(task, stageMap)) {
                    aggregate.doneCount++;
                }
            }
        }

        for (PmTask task : pendingTasks) {
            List<Long> assigneeIds = resolveTaskAssigneeIds(task, executorIdsByTask);
            for (Long userId : assigneeIds) {
                AssigneeAggregate aggregate = aggregateMap.computeIfAbsent(
                        userId,
                        key -> new AssigneeAggregate(userId, resolveUserName(userMap.get(userId), "未分配"))
                );
                aggregate.todoCount++;
                aggregate.pendingTasks.add(task);
                if (task.getDueTime() != null && task.getDueTime().toLocalDate().equals(today)) {
                    aggregate.todayDueCount++;
                }
                if (task.getDueTime() != null && task.getDueTime().isBefore(now)) {
                    aggregate.overdueCount++;
                }
            }
        }

        return aggregateMap.values().stream()
                .filter(aggregate -> aggregate.todoCount > 0)
                .sorted(
                        Comparator.comparing((AssigneeAggregate aggregate) -> aggregate.overdueCount, Comparator.reverseOrder())
                                .thenComparing(aggregate -> aggregate.todoCount, Comparator.reverseOrder())
                                .thenComparing(aggregate -> aggregate.todayDueCount, Comparator.reverseOrder())
                )
                .collect(Collectors.toList());
    }

    private List<TaskReminderScreenVO.KpiCardItemVO> buildAssigneeSummaryCards(List<AssigneeAggregate> aggregates,
                                                                                List<PmTask> allTasks,
                                                                                Map<Long, PmTaskStage> stageMap,
                                                                                List<PmProject> projects,
                                                                                LocalDate today) {
        int highLoadCount = (int) aggregates.stream().filter(aggregate -> aggregate.todoCount >= 6).count();
        int overdueAssigneeCount = (int) aggregates.stream().filter(aggregate -> aggregate.overdueCount > 0).count();
        int doneTodayCount = (int) allTasks.stream()
                .filter(task -> isTaskDone(task, stageMap))
                .filter(task -> task.getUpdatedAt() != null && task.getUpdatedAt().toLocalDate().equals(today))
                .count();

        return List.of(
                kpi("active-members", "今日需处理成员", aggregates.size(), "实时统计", "flat", "primary", "user"),
                kpi("top-load", "负载最高成员", highLoadCount, "待办较多", "flat", "warning", "crown"),
                kpi("overdue-members", "逾期责任人", overdueAssigneeCount, overdueAssigneeCount > 0 ? "需跟进" : "暂无逾期", overdueAssigneeCount > 0 ? "up" : "flat", "danger", "warning"),
                kpi("done-today", "今日完成任务", doneTodayCount, "今日更新", "flat", "success", "check"),
                kpi("collaboration", "协作中项目", projects.size(), "活跃项目", "flat", "purple", "team")
        );
    }

    private List<TaskReminderScreenVO.AssigneeOverviewItemVO> buildAssigneeWall(List<AssigneeAggregate> aggregates) {
        return aggregates.stream()
                .map(aggregate -> new TaskReminderScreenVO.AssigneeOverviewItemVO(
                        aggregate.userId,
                        aggregate.name,
                        "任务负责人",
                        "协作成员",
                        aggregate.completionRate(),
                        aggregate.todoCount,
                        aggregate.todayDueCount,
                        aggregate.overdueCount,
                        aggregate.pendingTasks.stream()
                                .sorted(buildTaskUrgencyComparator(LocalDateTime.now()))
                                .map(task -> new TaskReminderScreenVO.AssigneeTaskItemVO(
                                        task.getId(),
                                        safeText(task.getTitle(), "未命名任务"),
                                        toAssigneeTaskStatus(task.getDueTime(), LocalDateTime.now())
                                ))
                                .collect(Collectors.toList())
                ))
                .collect(Collectors.toList());
    }

    private List<TaskReminderScreenVO.WorkloadRankingItemVO> buildWorkloadRanking(List<AssigneeAggregate> aggregates) {
        List<TaskReminderScreenVO.WorkloadRankingItemVO> result = new ArrayList<>();
        int rank = 1;
        for (AssigneeAggregate aggregate : aggregates.stream().limit(6).collect(Collectors.toList())) {
            String riskLevel = resolveAssigneeRiskLevel(aggregate);
            result.add(new TaskReminderScreenVO.WorkloadRankingItemVO(
                    rank++,
                    aggregate.name,
                    aggregate.todoCount,
                    aggregate.todayDueCount,
                    aggregate.overdueCount,
                    riskLevel,
                    assigneeRiskText(riskLevel)
            ));
        }
        return result;
    }

    private List<TaskReminderScreenVO.CollaborationReminderItemVO> buildCollaborationReminders(
            List<TaskReminderScreenVO.ProjectRiskItemVO> projectRisks,
            Map<Long, List<PmTask>> tasksByProject,
            Map<Long, List<Long>> executorIdsByTask,
            Map<Long, SysUser> userMap,
            LocalDateTime now) {
        List<TaskReminderScreenVO.CollaborationReminderItemVO> result = new ArrayList<>();
        for (TaskReminderScreenVO.ProjectRiskItemVO project : projectRisks) {
            List<PmTask> tasks = tasksByProject.getOrDefault(project.id(), Collections.emptyList());
            if (tasks.isEmpty()) {
                continue;
            }
            List<PmTask> urgentTasks = tasks.stream()
                    .filter(task -> task.getDueTime() != null && !task.getDueTime().isAfter(now.plusHours(48)))
                    .sorted(buildTaskUrgencyComparator(now))
                    .collect(Collectors.toList());
            if (urgentTasks.isEmpty()) {
                continue;
            }
            PmTask firstTask = urgentTasks.get(0);
            String urgency = "high".equals(project.riskLevel()) ? "high" : ("attention".equals(project.riskLevel()) ? "medium" : "low");
            result.add(new TaskReminderScreenVO.CollaborationReminderItemVO(
                    project.id(),
                    project.projectName(),
                    buildBlockerText(project.overdueTaskCount(), urgentTasks.size(), firstTask),
                    resolveTaskAssigneeName(firstTask, executorIdsByTask, userMap),
                    urgency,
                    urgencyText(urgency)
            ));
        }
        return result.stream().limit(5).collect(Collectors.toList());
    }

    private List<TaskReminderScreenVO.KpiCardItemVO> buildSevenDaySummaryCards(List<PmTask> pendingTasks,
                                                                                List<PmRecurringPlan> plans,
                                                                                List<TaskReminderScreenVO.ProjectRiskItemVO> projectRisks,
                                                                                List<TaskReminderScreenVO.CollaborationReminderItemVO> collaborationReminders,
                                                                                LocalDateTime now,
                                                                                LocalDate today,
                                                                                LocalDate sevenDaysLater) {
        int sevenDayTaskCount = (int) pendingTasks.stream()
                .filter(task -> isDateInRange(toDate(task.getDueTime()), today, sevenDaysLater))
                .count();
        int sevenDayPlanCount = (int) plans.stream()
                .filter(plan -> isDateInRange(toDate(calculatePlanDueTime(plan)), today, sevenDaysLater))
                .count();
        int highRiskProjectCount = (int) projectRisks.stream().filter(project -> "high".equals(project.riskLevel())).count();
        int earlyFinishCount = (int) pendingTasks.stream()
                .filter(task -> task.getDueTime() != null)
                .filter(task -> task.getDueTime().isAfter(now.plusHours(48)))
                .filter(task -> isDateInRange(task.getDueTime().toLocalDate(), today, sevenDaysLater))
                .count();

        return List.of(
                kpi("seven-day-due", "未来7日到期", sevenDayTaskCount + sevenDayPlanCount, "未来一周", "flat", "primary", "calendar"),
                kpi("weekly-recurring", "本周周期计划", sevenDayPlanCount, "独立计划", "flat", "warning", "refresh"),
                kpi("weekly-risk", "本周高风险项目", highRiskProjectCount, highRiskProjectCount > 0 ? "需关注" : "暂无高风险", highRiskProjectCount > 0 ? "up" : "flat", "danger", "warning"),
                kpi("early-finish", "可提前完成事项", earlyFinishCount, "48小时后", "flat", "success", "check"),
                kpi("pending-collaboration", "待确认协作项", collaborationReminders.size(), "跨项目提醒", "flat", "purple", "team")
        );
    }

    private List<TaskReminderScreenVO.CalendarDayItemVO> buildSevenDayCalendar(List<PmTask> pendingTasks,
                                                                                List<PmRecurringPlan> plans,
                                                                                LocalDate today,
                                                                                LocalDate sevenDaysLater) {
        List<TaskReminderScreenVO.CalendarDayItemVO> result = new ArrayList<>();
        long dayId = 1L;
        for (LocalDate date = today; !date.isAfter(sevenDaysLater); date = date.plusDays(1)) {
            List<TaskReminderScreenVO.CalendarTaskChipItemVO> chips = new ArrayList<>();
            for (PmTask task : pendingTasks) {
                if (task.getDueTime() != null && task.getDueTime().toLocalDate().equals(date)) {
                    chips.add(new TaskReminderScreenVO.CalendarTaskChipItemVO(
                            task.getId(),
                            safeText(task.getTitle(), "未命名任务"),
                            "projectTask",
                            resolveTaskStatus(task.getDueTime(), LocalDateTime.now())
                    ));
                }
            }
            for (PmRecurringPlan plan : plans) {
                LocalDateTime dueTime = calculatePlanDueTime(plan);
                if (dueTime != null && dueTime.toLocalDate().equals(date)) {
                    chips.add(new TaskReminderScreenVO.CalendarTaskChipItemVO(
                            plan.getId(),
                            safeText(plan.getTitle(), "未命名周期计划"),
                            "recurringPlan",
                            resolveTaskStatus(dueTime, LocalDateTime.now())
                    ));
                }
            }
            int totalCount = chips.size();
            result.add(new TaskReminderScreenVO.CalendarDayItemVO(
                    dayId++,
                    weekdayText(date),
                    date.format(SHORT_DATE_FORMATTER),
                    chips.stream().limit(6).collect(Collectors.toList()),
                    totalCount
            ));
        }
        return result;
    }

    private List<TaskReminderScreenVO.DailyFocusItemVO> buildDailyFocus(List<PmTask> pendingTasks,
                                                                         List<PmRecurringPlan> plans,
                                                                         Map<Long, List<Long>> executorIdsByTask,
                                                                         Map<Long, List<Long>> assigneeIdsByPlan,
                                                                         Map<Long, SysUser> userMap,
                                                                         LocalDate today,
                                                                         LocalDateTime now) {
        List<TaskReminderScreenVO.DailyFocusItemVO> result = new ArrayList<>();
        for (int index = 0; index < 6; index++) {
            LocalDate date = today.plusDays(index);
            FocusCandidate candidate = pendingTasks.stream()
                    .filter(task -> task.getDueTime() != null && task.getDueTime().toLocalDate().equals(date))
                    .sorted(buildTaskUrgencyComparator(now))
                    .map(task -> FocusCandidate.fromTask(task, resolveTaskAssigneeName(task, executorIdsByTask, userMap), now))
                    .findFirst()
                    .orElseGet(() -> plans.stream()
                            .filter(plan -> {
                                LocalDateTime dueTime = calculatePlanDueTime(plan);
                                return dueTime != null && dueTime.toLocalDate().equals(date);
                            })
                            .findFirst()
                            .map(plan -> FocusCandidate.fromPlan(plan, resolvePlanAssigneeName(plan, assigneeIdsByPlan, userMap), now))
                            .orElse(null));

            if (candidate == null) {
                continue;
            }
            result.add(new TaskReminderScreenVO.DailyFocusItemVO(
                    candidate.id,
                    date.format(SHORT_DATE_FORMATTER) + "（" + weekdayText(date) + "）",
                    candidate.title,
                    candidate.assigneeName,
                    formatRemainingTime(candidate.dueTime, now),
                    candidate.status
            ));
        }
        return result;
    }

    private List<TaskReminderScreenVO.ProjectMilestoneItemVO> buildMilestoneCards(
            List<PmProject> projects,
            Map<Long, List<PmTask>> tasksByProject,
            List<TaskReminderScreenVO.ProjectRiskItemVO> projectRisks) {
        Map<Long, TaskReminderScreenVO.ProjectRiskItemVO> riskMap = projectRisks.stream()
                .collect(Collectors.toMap(TaskReminderScreenVO.ProjectRiskItemVO::id, Function.identity(), (left, right) -> left));
        return projects.stream()
                .filter(project -> tasksByProject.containsKey(project.getId()))
                .sorted(
                        Comparator.comparing((PmProject project) -> riskSortValue(riskMap.get(project.getId())), Comparator.reverseOrder())
                                .thenComparing(project -> safeInt(project.getProgress()))
                )
                .limit(3)
                .map(project -> {
                    List<PmTask> tasks = tasksByProject.getOrDefault(project.getId(), Collections.emptyList());
                    LocalDateTime expectedDate = tasks.stream()
                            .map(PmTask::getDueTime)
                            .filter(Objects::nonNull)
                            .min(LocalDateTime::compareTo)
                            .orElse(project.getUpdatedAt());
                    TaskReminderScreenVO.ProjectRiskItemVO risk = riskMap.get(project.getId());
                    String riskLevel = risk == null ? "normal" : ("high".equals(risk.riskLevel()) ? "high" : ("attention".equals(risk.riskLevel()) ? "medium" : "normal"));
                    return new TaskReminderScreenVO.ProjectMilestoneItemVO(
                            project.getId(),
                            safeText(project.getName(), "未命名项目"),
                            "下一批任务交付",
                            expectedDate == null ? "-" : expectedDate.toLocalDate().format(SHORT_DATE_FORMATTER) + "（" + weekdayText(expectedDate.toLocalDate()) + "）",
                            clamp(safeInt(project.getProgress()), 0, 100),
                            riskLevel,
                            riskText(riskLevel),
                            milestoneTone(riskLevel)
                    );
                })
                .collect(Collectors.toList());
    }

    private Comparator<PmTask> buildTaskUrgencyComparator(LocalDateTime now) {
        return Comparator
                .comparing((PmTask task) -> urgencyBucket(task.getDueTime(), now))
                .thenComparing(PmTask::getDueTime, Comparator.nullsLast(LocalDateTime::compareTo))
                .thenComparing(task -> normalizePriority(task.getPriority()), Comparator.reverseOrder())
                .thenComparing(PmTask::getUpdatedAt, Comparator.nullsLast(Comparator.reverseOrder()));
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

    private int countTasksDueOn(List<PmTask> tasks, LocalDate date) {
        return (int) tasks.stream()
                .filter(task -> task.getDueTime() != null && task.getDueTime().toLocalDate().equals(date))
                .count();
    }

    private int normalizePriority(Integer priority) {
        if (priority == null || priority < 1 || priority > 3) {
            return 1;
        }
        return priority;
    }

    private String priorityText(Integer priority) {
        int value = normalizePriority(priority);
        if (value == 3) {
            return "P0 紧急";
        }
        if (value == 2) {
            return "P1 高";
        }
        return "P2 中";
    }

    private String priorityLevel(Integer priority) {
        int value = normalizePriority(priority);
        if (value == 3) {
            return "p0";
        }
        if (value == 2) {
            return "p1";
        }
        return "p2";
    }

    private String resolveTaskStatus(LocalDateTime dueTime, LocalDateTime now) {
        if (dueTime == null) {
            return "normal";
        }
        if (dueTime.isBefore(now)) {
            return "overdue";
        }
        if (dueTime.toLocalDate().equals(now.toLocalDate())) {
            return "today";
        }
        if (!dueTime.isAfter(now.plusHours(48))) {
            return "dueSoon";
        }
        return "normal";
    }

    private String toAssigneeTaskStatus(LocalDateTime dueTime, LocalDateTime now) {
        String status = resolveTaskStatus(dueTime, now);
        if ("overdue".equals(status)) {
            return "overdue";
        }
        if ("today".equals(status) || "dueSoon".equals(status)) {
            return "dueToday";
        }
        return "inProgress";
    }

    private int urgencyBucket(LocalDateTime dueTime, LocalDateTime now) {
        if (dueTime == null) {
            return 3;
        }
        if (dueTime.isBefore(now)) {
            return 0;
        }
        if (dueTime.toLocalDate().equals(now.toLocalDate())) {
            return 1;
        }
        if (!dueTime.isAfter(now.plusHours(48))) {
            return 2;
        }
        return 3;
    }

    private String formatRemainingTime(LocalDateTime dueTime, LocalDateTime now) {
        if (dueTime == null) {
            return "-";
        }
        Duration duration = Duration.between(now, dueTime);
        boolean overdue = duration.isNegative();
        Duration abs = duration.abs();
        long days = abs.toDays();
        long hours = abs.toHours() % 24;
        long minutes = abs.toMinutes() % 60;
        String prefix = overdue ? "-" : "";
        if (days > 0) {
            return prefix + days + "天 " + hours + "h";
        }
        return prefix + hours + "h " + minutes + "m";
    }

    private String formatTimelineCountdown(LocalDateTime dueTime, LocalDateTime now) {
        if (dueTime == null) {
            return "未设置截止";
        }
        String remaining = formatRemainingTime(dueTime, now).replace("-", "");
        return dueTime.isBefore(now) ? "逾期 " + remaining.replace(" ", "") : "剩余 " + remaining.replace(" ", "");
    }

    private String formatDateTime(LocalDateTime dateTime) {
        return dateTime == null ? "-" : dateTime.format(SHORT_DATE_TIME_FORMATTER);
    }

    private String resolveProjectName(PmProject project) {
        return project == null ? "未归属项目" : safeText(project.getName(), "未命名项目");
    }

    private String resolveTaskAssigneeName(PmTask task,
                                           Map<Long, List<Long>> executorIdsByTask,
                                           Map<Long, SysUser> userMap) {
        List<Long> userIds = resolveTaskAssigneeIds(task, executorIdsByTask);
        return userIds.stream()
                .map(userMap::get)
                .map(user -> resolveUserName(user, "未分配"))
                .distinct()
                .collect(Collectors.joining(" / "));
    }

    private List<Long> resolveTaskAssigneeIds(PmTask task, Map<Long, List<Long>> executorIdsByTask) {
        if (task == null) {
            return Collections.emptyList();
        }
        List<Long> executorIds = executorIdsByTask.getOrDefault(task.getId(), Collections.emptyList());
        if (!executorIds.isEmpty()) {
            return executorIds;
        }
        return task.getCreatorId() == null ? Collections.emptyList() : List.of(task.getCreatorId());
    }

    private String resolvePlanAssigneeName(PmRecurringPlan plan,
                                           Map<Long, List<Long>> assigneeIdsByPlan,
                                           Map<Long, SysUser> userMap) {
        List<Long> userIds = assigneeIdsByPlan.getOrDefault(plan.getId(), Collections.emptyList());
        if (userIds.isEmpty() && plan.getCreatorId() != null) {
            userIds = List.of(plan.getCreatorId());
        }
        return userIds.stream()
                .map(userMap::get)
                .map(user -> resolveUserName(user, "未分配"))
                .distinct()
                .collect(Collectors.joining(" / "));
    }

    private String resolveUserName(SysUser user, String fallback) {
        if (user == null) {
            return fallback;
        }
        if (hasText(user.getNickname())) {
            return user.getNickname();
        }
        if (hasText(user.getUsername())) {
            return user.getUsername();
        }
        return fallback;
    }

    private LocalDateTime calculatePlanDueTime(PmRecurringPlan plan) {
        if (plan == null) {
            return null;
        }
        if (plan.getNextRunAt() == null) {
            return plan.getDueTime();
        }
        if (plan.getStartTime() == null || plan.getDueTime() == null) {
            return plan.getDueTime() == null ? plan.getNextRunAt() : plan.getDueTime();
        }
        Duration duration = Duration.between(plan.getStartTime(), plan.getDueTime());
        if (duration.isNegative()) {
            return plan.getNextRunAt();
        }
        return plan.getNextRunAt().plus(duration);
    }

    private String cycleText(PmRecurringPlan plan) {
        int interval = plan.getIntervalCount() == null || plan.getIntervalCount() <= 0 ? 1 : plan.getIntervalCount();
        String unit = plan.getRecurrenceUnit();
        String text;
        if ("DAY".equals(unit)) {
            text = "天";
        } else if ("WEEK".equals(unit)) {
            text = "周";
        } else if ("MONTH".equals(unit)) {
            text = "月";
        } else if ("QUARTER".equals(unit)) {
            return interval == 1 ? "每季度" : "每" + interval + "季度";
        } else if ("HALF_YEAR".equals(unit)) {
            return interval == 1 ? "每半年" : "每" + interval + "个半年";
        } else if ("YEAR".equals(unit)) {
            text = "年";
        } else {
            return "周期计划";
        }
        return interval == 1 ? "每" + text : "每" + interval + text;
    }

    private String resolveProjectRiskLevel(int progress, int overdueCount) {
        if (overdueCount >= 3 || (overdueCount > 0 && progress < 55)) {
            return "high";
        }
        if (overdueCount > 0 || progress < 70) {
            return "attention";
        }
        return "normal";
    }

    private String riskText(String riskLevel) {
        if ("high".equals(riskLevel)) {
            return "高风险";
        }
        if ("attention".equals(riskLevel)) {
            return "关注";
        }
        if ("medium".equals(riskLevel)) {
            return "中风险";
        }
        if ("low".equals(riskLevel)) {
            return "低风险";
        }
        return "正常";
    }

    private String resolveAssigneeRiskLevel(AssigneeAggregate aggregate) {
        if (aggregate.overdueCount >= 2 || aggregate.todoCount >= 8) {
            return "high";
        }
        if (aggregate.overdueCount > 0 || aggregate.todoCount >= 6) {
            return "attention";
        }
        if (aggregate.todoCount >= 4) {
            return "medium";
        }
        return "low";
    }

    private String assigneeRiskText(String riskLevel) {
        if ("high".equals(riskLevel)) {
            return "高风险";
        }
        if ("attention".equals(riskLevel)) {
            return "较高风险";
        }
        if ("medium".equals(riskLevel)) {
            return "中风险";
        }
        return "低风险";
    }

    private String urgencyText(String urgency) {
        if ("high".equals(urgency)) {
            return "高";
        }
        if ("medium".equals(urgency)) {
            return "中";
        }
        return "低";
    }

    private String buildBlockerText(int overdueCount, int urgentCount, PmTask firstTask) {
        if (overdueCount > 0) {
            return overdueCount + "项逾期任务待处理";
        }
        if (urgentCount > 1) {
            return urgentCount + "项任务临近截止";
        }
        return safeText(firstTask.getTitle(), "任务待跟进");
    }

    private boolean isDateInRange(LocalDate date, LocalDate start, LocalDate end) {
        return date != null && !date.isBefore(start) && !date.isAfter(end);
    }

    private LocalDate toDate(LocalDateTime dateTime) {
        return dateTime == null ? null : dateTime.toLocalDate();
    }

    private String weekdayText(LocalDate date) {
        String[] weeks = {"周日", "周一", "周二", "周三", "周四", "周五", "周六"};
        return weeks[date.getDayOfWeek().getValue() % 7];
    }

    private int riskSortValue(TaskReminderScreenVO.ProjectRiskItemVO risk) {
        if (risk == null) {
            return 0;
        }
        if ("high".equals(risk.riskLevel())) {
            return 3;
        }
        if ("attention".equals(risk.riskLevel())) {
            return 2;
        }
        return 1;
    }

    private String milestoneTone(String riskLevel) {
        if ("high".equals(riskLevel)) {
            return "warning";
        }
        if ("medium".equals(riskLevel) || "attention".equals(riskLevel)) {
            return "purple";
        }
        return "success";
    }

    private int safeInt(Integer value) {
        return value == null ? 0 : value;
    }

    private int clamp(int value, int min, int max) {
        return Math.max(min, Math.min(max, value));
    }

    private String safeText(String value, String fallback) {
        return hasText(value) ? value : fallback;
    }

    private boolean hasText(String value) {
        return value != null && !value.trim().isEmpty();
    }

    private static final class AssigneeAggregate {
        private final Long userId;
        private final String name;
        private int totalCount;
        private int doneCount;
        private int todoCount;
        private int todayDueCount;
        private int overdueCount;
        private final List<PmTask> pendingTasks = new ArrayList<>();

        private AssigneeAggregate(Long userId, String name) {
            this.userId = userId;
            this.name = name;
        }

        private int completionRate() {
            if (totalCount <= 0) {
                return 0;
            }
            return (int) Math.round(doneCount * 100.0 / totalCount);
        }
    }

    private static final class FocusCandidate {
        private final Long id;
        private final String title;
        private final String assigneeName;
        private final LocalDateTime dueTime;
        private final String status;

        private FocusCandidate(Long id, String title, String assigneeName, LocalDateTime dueTime, String status) {
            this.id = id;
            this.title = title;
            this.assigneeName = assigneeName;
            this.dueTime = dueTime;
            this.status = status;
        }

        private static FocusCandidate fromTask(PmTask task, String assigneeName, LocalDateTime now) {
            LocalDateTime dueTime = task.getDueTime();
            return new FocusCandidate(
                    task.getId(),
                    task.getTitle(),
                    assigneeName,
                    dueTime,
                    dueTime != null && dueTime.isBefore(now) ? "overdue" : "normal"
            );
        }

        private static FocusCandidate fromPlan(PmRecurringPlan plan, String assigneeName, LocalDateTime now) {
            LocalDateTime dueTime = null;
            if (plan.getNextRunAt() != null) {
                if (plan.getStartTime() != null && plan.getDueTime() != null) {
                    Duration duration = Duration.between(plan.getStartTime(), plan.getDueTime());
                    dueTime = duration.isNegative() ? plan.getNextRunAt() : plan.getNextRunAt().plus(duration);
                } else {
                    dueTime = plan.getDueTime() == null ? plan.getNextRunAt() : plan.getDueTime();
                }
            }
            return new FocusCandidate(
                    plan.getId(),
                    plan.getTitle(),
                    assigneeName,
                    dueTime,
                    dueTime != null && dueTime.isBefore(now) ? "overdue" : "normal"
            );
        }
    }
}
