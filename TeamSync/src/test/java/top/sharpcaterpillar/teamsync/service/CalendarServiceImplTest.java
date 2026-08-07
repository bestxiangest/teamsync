package top.sharpcaterpillar.teamsync.service;

import com.baomidou.mybatisplus.core.conditions.Wrapper;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import top.sharpcaterpillar.teamsync.dto.CalendarEventQueryRequest;
import top.sharpcaterpillar.teamsync.entity.PmProject;
import top.sharpcaterpillar.teamsync.entity.PmProjectMember;
import top.sharpcaterpillar.teamsync.entity.PmRecurringPlan;
import top.sharpcaterpillar.teamsync.entity.PmTask;
import top.sharpcaterpillar.teamsync.entity.PmTaskMember;
import top.sharpcaterpillar.teamsync.entity.SysUser;
import top.sharpcaterpillar.teamsync.mapper.PmProjectMapper;
import top.sharpcaterpillar.teamsync.mapper.PmProjectMemberMapper;
import top.sharpcaterpillar.teamsync.mapper.PmRecurringPlanAssigneeMapper;
import top.sharpcaterpillar.teamsync.mapper.PmRecurringPlanMapper;
import top.sharpcaterpillar.teamsync.mapper.PmTaskMapper;
import top.sharpcaterpillar.teamsync.mapper.PmTaskMemberMapper;
import top.sharpcaterpillar.teamsync.service.impl.CalendarServiceImpl;
import top.sharpcaterpillar.teamsync.vo.AssigneeVO;
import top.sharpcaterpillar.teamsync.vo.CalendarEventVO;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.verifyNoInteractions;
import static org.mockito.Mockito.when;

class CalendarServiceImplTest {

    private final PmProjectMapper projectMapper = mock(PmProjectMapper.class);
    private final PmProjectMemberMapper projectMemberMapper = mock(PmProjectMemberMapper.class);
    private final PmTaskMapper taskMapper = mock(PmTaskMapper.class);
    private final PmTaskMemberMapper taskMemberMapper = mock(PmTaskMemberMapper.class);
    private final PmRecurringPlanMapper recurringPlanMapper = mock(PmRecurringPlanMapper.class);
    private final PmRecurringPlanAssigneeMapper recurringPlanAssigneeMapper = mock(PmRecurringPlanAssigneeMapper.class);
    private final SysUserService sysUserService = mock(SysUserService.class);
    private final CalendarService calendarService = new CalendarServiceImpl(
            projectMapper,
            projectMemberMapper,
            taskMapper,
            taskMemberMapper,
            recurringPlanMapper,
            recurringPlanAssigneeMapper,
            sysUserService
    );

    private final PmProject project = project(1L, "测试项目", 10L);

    @BeforeEach
    void setUp() {
        when(sysUserService.isSuperAdmin(10L)).thenReturn(true);
        when(projectMapper.selectList(any(Wrapper.class))).thenReturn(List.of(project));
        when(projectMemberMapper.selectList(any(Wrapper.class))).thenReturn(List.of());
        when(taskMapper.selectList(any(Wrapper.class))).thenReturn(List.of());
        when(taskMemberMapper.selectList(any(Wrapper.class))).thenReturn(List.of());
        when(recurringPlanMapper.selectList(any(Wrapper.class))).thenReturn(List.of());
        when(recurringPlanAssigneeMapper.selectList(any(Wrapper.class))).thenReturn(List.of());
    }

    @Test
    void defaultsToIncompleteStatusesAndExtendsOverdueTasks() {
        LocalDate today = LocalDate.now();
        LocalDateTime fallbackCreatedAt = today.minusDays(3).atTime(9, 0);
        PmTask scheduled = task(
                1L,
                "跨日任务",
                0,
                today.minusDays(1).atTime(8, 0),
                today.plusDays(1).atTime(18, 0),
                today.minusDays(2).atTime(9, 0)
        );
        PmTask overdue = task(
                2L,
                "逾期任务",
                2,
                null,
                today.minusDays(1).atTime(10, 0),
                fallbackCreatedAt
        );
        PmTask completed = task(
                3L,
                "已完成任务",
                1,
                today.minusDays(1).atTime(8, 0),
                today.plusDays(1).atTime(12, 0),
                today.minusDays(2).atTime(9, 0)
        );
        when(taskMapper.selectList(any(Wrapper.class))).thenReturn(List.of(scheduled, overdue, completed));

        CalendarEventQueryRequest request = taskRequest(today.minusDays(2), today.plusDays(2));
        List<CalendarEventVO> events = calendarService.listEvents(request, 10L);

        assertThat(events).extracting(CalendarEventVO::getTitle)
                .containsExactlyInAnyOrder("跨日任务", "逾期任务");
        assertThat(events).filteredOn(CalendarEventVO::getOverdue).singleElement().satisfies(event -> {
            assertThat(event.getStartTime()).isEqualTo(fallbackCreatedAt);
            assertThat(event.getDueTime()).isEqualTo(overdue.getDueTime());
            assertThat(event.getEndTime()).isEqualTo(today.plusDays(3).atStartOfDay().minusNanos(1));
        });
    }

    @Test
    void includesNoDueDateTasksOnlyWhenRequested() {
        LocalDate today = LocalDate.now();
        PmTask noDueDate = task(
                1L,
                "无截止日期任务",
                0,
                null,
                null,
                today.minusDays(1).atTime(9, 0)
        );
        when(taskMapper.selectList(any(Wrapper.class))).thenReturn(List.of(noDueDate));

        CalendarEventQueryRequest hiddenRequest = taskRequest(today, today);
        assertThat(calendarService.listEvents(hiddenRequest, 10L)).isEmpty();

        CalendarEventQueryRequest visibleRequest = taskRequest(today, today);
        visibleRequest.setIncludeNoDueDate(true);
        assertThat(calendarService.listEvents(visibleRequest, 10L)).singleElement().satisfies(event -> {
            assertThat(event.getDueTime()).isNull();
            assertThat(event.getEndTime()).isEqualTo(today.plusDays(1).atStartOfDay().minusNanos(1));
        });
    }

    @Test
    void filtersTasksByExecutorAndSupportsCompletedStatus() {
        LocalDate today = LocalDate.now();
        PmTask assigned = task(
                1L,
                "指定负责人任务",
                1,
                today.minusDays(1).atTime(9, 0),
                today.atTime(18, 0),
                today.minusDays(2).atTime(9, 0)
        );
        PmTask other = task(
                2L,
                "其他负责人任务",
                1,
                today.minusDays(1).atTime(9, 0),
                today.atTime(18, 0),
                today.minusDays(2).atTime(9, 0)
        );
        when(taskMemberMapper.selectList(any(Wrapper.class))).thenReturn(List.of(taskMember(1L, 20L)));
        when(taskMapper.selectList(any(Wrapper.class))).thenReturn(List.of(assigned, other));

        CalendarEventQueryRequest request = taskRequest(today, today);
        request.setAdminView(true);
        request.setAssigneeIds("20");
        request.setStatuses("COMPLETED");

        assertThat(calendarService.listEvents(request, 10L))
                .extracting(CalendarEventVO::getSourceId)
                .containsExactly(1L);
    }

    @Test
    void listsOwnersAndMembersAsAssigneeOptions() {
        PmProjectMember member = new PmProjectMember();
        member.setProjectId(1L);
        member.setUserId(20L);
        when(projectMemberMapper.selectList(any(Wrapper.class))).thenReturn(List.of(member));
        when(sysUserService.listByIds(any())).thenReturn(List.of(
                user(10L, "项目负责人", "owner"),
                user(20L, null, "member")
        ));

        List<AssigneeVO> assignees = calendarService.listAssignees(1L, 10L);

        assertThat(assignees).extracting(AssigneeVO::getUserId).containsExactlyInAnyOrder(10L, 20L);
        assertThat(assignees).filteredOn(item -> item.getUserId().equals(20L)).singleElement()
                .extracting(AssigneeVO::getNickname)
                .isEqualTo("member");
    }

    @Test
    void recurringPlansOnlyProduceExecutionDayEvents() {
        LocalDate today = LocalDate.now();
        PmRecurringPlan plan = new PmRecurringPlan();
        plan.setId(7L);
        plan.setProjectId(1L);
        plan.setTitle("月度巡检");
        plan.setCreatorId(10L);
        plan.setStatus("ACTIVE");
        plan.setIsDeleted(0);
        plan.setStartTime(today.minusMonths(1).atTime(9, 0));
        plan.setDueTime(today.minusMonths(1).atTime(17, 0));
        plan.setNextRunAt(today.atTime(9, 0));
        when(recurringPlanMapper.selectList(any(Wrapper.class))).thenReturn(List.of(plan));

        CalendarEventQueryRequest request = new CalendarEventQueryRequest();
        request.setStartDate(today);
        request.setEndDate(today);

        List<CalendarEventVO> events = calendarService.listEvents(request, 10L);

        assertThat(events).singleElement().satisfies(event -> {
            assertThat(event.getSourceType()).isEqualTo("RECURRING_PLAN_RUN");
            assertThat(event.getTitle()).isEqualTo("执行：月度巡检");
            assertThat(event.getStartTime()).isEqualTo(plan.getNextRunAt());
            assertThat(event.getEndTime()).isEqualTo(plan.getNextRunAt());
        });
    }

    @Test
    void loadsRecurringPlanVisibilityScopeForNonAdmins() {
        LocalDate today = LocalDate.now();
        PmProjectMember membership = new PmProjectMember();
        membership.setProjectId(1L);
        membership.setUserId(20L);
        when(sysUserService.isSuperAdmin(20L)).thenReturn(false);
        when(projectMemberMapper.selectList(any(Wrapper.class))).thenReturn(List.of(membership));
        when(recurringPlanAssigneeMapper.selectList(any(Wrapper.class))).thenReturn(List.of());

        CalendarEventQueryRequest request = new CalendarEventQueryRequest();
        request.setStartDate(today);
        request.setEndDate(today);
        request.setSourceType("RECURRING_PLAN_RUN");
        calendarService.listEvents(request, 20L);

        verify(recurringPlanAssigneeMapper).selectList(any(Wrapper.class));
    }

    @Test
    void defaultsAdministratorsToPersonalTaskScope() {
        LocalDate today = LocalDate.now();
        PmTask ownTask = task(1L, "自己的任务", 0, today.atTime(9, 0), today.atTime(18, 0), today.atStartOfDay());
        PmTask otherTask = task(2L, "其他人的任务", 0, today.atTime(9, 0), today.atTime(18, 0), today.atStartOfDay());
        otherTask.setCreatorId(99L);
        when(taskMapper.selectList(any(Wrapper.class))).thenReturn(List.of(ownTask, otherTask));
        CalendarEventQueryRequest request = taskRequest(today, today);

        List<CalendarEventVO> events = calendarService.listEvents(request, 10L);

        verify(taskMemberMapper).selectList(any(Wrapper.class));
        assertThat(events).extracting(CalendarEventVO::getTitle).containsExactly("自己的任务");
    }

    @Test
    void allowsAdministratorsToExplicitlyEnableGlobalTaskScope() {
        LocalDate today = LocalDate.now();
        PmTask ownTask = task(1L, "自己的任务", 0, today.atTime(9, 0), today.atTime(18, 0), today.atStartOfDay());
        PmTask otherTask = task(2L, "其他人的任务", 0, today.atTime(9, 0), today.atTime(18, 0), today.atStartOfDay());
        otherTask.setCreatorId(99L);
        when(taskMapper.selectList(any(Wrapper.class))).thenReturn(List.of(ownTask, otherTask));
        CalendarEventQueryRequest request = taskRequest(today, today);
        request.setAdminView(true);

        List<CalendarEventVO> events = calendarService.listEvents(request, 10L);

        verifyNoInteractions(taskMemberMapper);
        assertThat(events).extracting(CalendarEventVO::getTitle)
                .containsExactlyInAnyOrder("自己的任务", "其他人的任务");
    }

    @Test
    void ignoresForgedAdminViewForNonAdministrators() {
        LocalDate today = LocalDate.now();
        when(sysUserService.isSuperAdmin(20L)).thenReturn(false);
        PmTask ownTask = task(1L, "自己的任务", 0, today.atTime(9, 0), today.atTime(18, 0), today.atStartOfDay());
        ownTask.setCreatorId(20L);
        PmTask otherTask = task(2L, "其他人的任务", 0, today.atTime(9, 0), today.atTime(18, 0), today.atStartOfDay());
        otherTask.setCreatorId(99L);
        when(taskMapper.selectList(any(Wrapper.class))).thenReturn(List.of(ownTask, otherTask));
        CalendarEventQueryRequest request = taskRequest(today, today);
        request.setAdminView(true);

        List<CalendarEventVO> events = calendarService.listEvents(request, 20L);

        verify(taskMemberMapper).selectList(any(Wrapper.class));
        assertThat(events).extracting(CalendarEventVO::getTitle).containsExactly("自己的任务");
    }

    @Test
    void appliesAdminViewScopeToRecurringPlans() {
        LocalDate today = LocalDate.now();
        PmRecurringPlan ownPlan = recurringPlan(1L, "自己的计划", 10L, today.atTime(9, 0));
        PmRecurringPlan otherPlan = recurringPlan(2L, "其他人的计划", 99L, today.atTime(10, 0));
        when(recurringPlanMapper.selectList(any(Wrapper.class))).thenReturn(List.of(ownPlan, otherPlan));

        CalendarEventQueryRequest personalRequest = new CalendarEventQueryRequest();
        personalRequest.setStartDate(today);
        personalRequest.setEndDate(today);
        personalRequest.setSourceType("RECURRING_PLAN_RUN");
        assertThat(calendarService.listEvents(personalRequest, 10L))
                .extracting(CalendarEventVO::getTitle)
                .containsExactly("执行：自己的计划");

        CalendarEventQueryRequest adminRequest = new CalendarEventQueryRequest();
        adminRequest.setStartDate(today);
        adminRequest.setEndDate(today);
        adminRequest.setSourceType("RECURRING_PLAN_RUN");
        adminRequest.setAdminView(true);
        assertThat(calendarService.listEvents(adminRequest, 10L))
                .extracting(CalendarEventVO::getTitle)
                .containsExactlyInAnyOrder("执行：自己的计划", "执行：其他人的计划");
    }

    private static CalendarEventQueryRequest taskRequest(LocalDate startDate, LocalDate endDate) {
        CalendarEventQueryRequest request = new CalendarEventQueryRequest();
        request.setStartDate(startDate);
        request.setEndDate(endDate);
        request.setSourceType("TASK");
        return request;
    }

    private static PmProject project(Long id, String name, Long ownerId) {
        PmProject project = new PmProject();
        project.setId(id);
        project.setName(name);
        project.setOwnerId(ownerId);
        return project;
    }

    private static PmTask task(Long id,
                               String title,
                               Integer status,
                               LocalDateTime startTime,
                               LocalDateTime dueTime,
                               LocalDateTime createdAt) {
        PmTask task = new PmTask();
        task.setId(id);
        task.setProjectId(1L);
        task.setStageId(1L);
        task.setTitle(title);
        task.setPriority(1);
        task.setStatus(status);
        task.setCreatorId(10L);
        task.setStartTime(startTime);
        task.setDueTime(dueTime);
        task.setCreatedAt(createdAt);
        task.setUpdatedAt(createdAt.plusHours(1));
        task.setIsDeleted(0);
        return task;
    }

    private static PmTaskMember taskMember(Long taskId, Long userId) {
        PmTaskMember member = new PmTaskMember();
        member.setTaskId(taskId);
        member.setUserId(userId);
        member.setRole("EXECUTOR");
        return member;
    }

    private static PmRecurringPlan recurringPlan(Long id,
                                                 String title,
                                                 Long creatorId,
                                                 LocalDateTime nextRunAt) {
        PmRecurringPlan plan = new PmRecurringPlan();
        plan.setId(id);
        plan.setProjectId(1L);
        plan.setTitle(title);
        plan.setCreatorId(creatorId);
        plan.setStatus("ACTIVE");
        plan.setStartTime(nextRunAt.minusDays(1));
        plan.setDueTime(nextRunAt.minusDays(1).plusHours(8));
        plan.setNextRunAt(nextRunAt);
        plan.setIsDeleted(0);
        return plan;
    }

    private static SysUser user(Long id, String nickname, String username) {
        SysUser user = new SysUser();
        user.setId(id);
        user.setNickname(nickname);
        user.setUsername(username);
        return user;
    }
}
