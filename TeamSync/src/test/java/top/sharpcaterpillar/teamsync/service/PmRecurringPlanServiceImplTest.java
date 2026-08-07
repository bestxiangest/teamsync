package top.sharpcaterpillar.teamsync.service;

import com.baomidou.mybatisplus.core.conditions.Wrapper;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.Test;
import org.springframework.test.util.ReflectionTestUtils;
import top.sharpcaterpillar.teamsync.dto.RecurringPlanQueryRequest;
import top.sharpcaterpillar.teamsync.dto.RecurringPlanUpdateRequest;
import top.sharpcaterpillar.teamsync.entity.PmRecurringPlan;
import top.sharpcaterpillar.teamsync.entity.PmRecurringPlanAssignee;
import top.sharpcaterpillar.teamsync.entity.SysUser;
import top.sharpcaterpillar.teamsync.mapper.PmRecurringPlanAssigneeMapper;
import top.sharpcaterpillar.teamsync.mapper.PmRecurringPlanMapper;
import top.sharpcaterpillar.teamsync.mapper.PmRecurringPlanOccurrenceMapper;
import top.sharpcaterpillar.teamsync.mapper.PmTaskStageMapper;
import top.sharpcaterpillar.teamsync.mapper.SysUserMapper;
import top.sharpcaterpillar.teamsync.service.impl.PmRecurringPlanServiceImpl;
import top.sharpcaterpillar.teamsync.vo.PageVO;
import top.sharpcaterpillar.teamsync.vo.RecurringPlanVO;

import java.time.LocalDateTime;
import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

class PmRecurringPlanServiceImplTest {

    private static final Long PLAN_ID = 100L;
    private static final Long CREATOR_ID = 10L;
    private static final Long ASSIGNEE_ID = 20L;
    private static final Long ADMIN_ID = 30L;
    private static final Long OUTSIDER_ID = 40L;

    @Test
    void responsibleAssigneeCanSeePlanListCreatedByAnotherUser() {
        TestFixture fixture = newFixture();
        when(fixture.sysUserService.isSuperAdmin(ASSIGNEE_ID)).thenReturn(false);
        when(fixture.assigneeMapper.selectList(any(Wrapper.class)))
                .thenReturn(List.of(planAssignee(PLAN_ID, ASSIGNEE_ID)))
                .thenReturn(List.of(planAssignee(PLAN_ID, ASSIGNEE_ID)));
        when(fixture.userMapper.selectBatchIds(any()))
                .thenReturn(List.of(user(CREATOR_ID, "创建人"), user(ASSIGNEE_ID, "负责人")));
        when(fixture.planMapper.selectPage(any(Page.class), any(Wrapper.class))).thenAnswer(invocation -> {
            Page<PmRecurringPlan> page = invocation.getArgument(0);
            page.setRecords(List.of(plan()));
            page.setTotal(1L);
            return page;
        });

        RecurringPlanQueryRequest request = new RecurringPlanQueryRequest();
        request.setCurrent(1);
        request.setSize(10);

        PageVO<RecurringPlanVO> result = fixture.service.listPlans(request, ASSIGNEE_ID);

        assertThat(result.getRecords()).hasSize(1);
        assertThat(result.getRecords().get(0).getId()).isEqualTo(PLAN_ID);
        assertThat(result.getRecords().get(0).getAssignees()).hasSize(1);
    }

    @Test
    void assigneeCanViewAndUpdatePlanCreatedByAnotherUser() {
        TestFixture fixture = newFixture();
        when(fixture.sysUserService.isSuperAdmin(ASSIGNEE_ID)).thenReturn(false);
        when(fixture.assigneeMapper.selectCount(any(Wrapper.class))).thenReturn(1L);
        when(fixture.assigneeMapper.selectList(any(Wrapper.class)))
                .thenReturn(List.of(planAssignee(PLAN_ID, ASSIGNEE_ID)));
        when(fixture.userMapper.selectBatchIds(any()))
                .thenReturn(List.of(user(CREATOR_ID, "创建人"), user(ASSIGNEE_ID, "负责人")));

        RecurringPlanUpdateRequest request = new RecurringPlanUpdateRequest();
        request.setTitle("负责人更新后的巡检计划");

        RecurringPlanVO result = fixture.service.updatePlan(PLAN_ID, request, ASSIGNEE_ID);

        assertThat(result.getTitle()).isEqualTo("负责人更新后的巡检计划");
        verify(fixture.planMapper).updateById(any(PmRecurringPlan.class));
    }

    @Test
    void platformAdminCanUpdateAnyRecurringPlan() {
        TestFixture fixture = newFixture();
        when(fixture.sysUserService.isSuperAdmin(ADMIN_ID)).thenReturn(true);
        when(fixture.assigneeMapper.selectList(any(Wrapper.class))).thenReturn(List.of());
        when(fixture.userMapper.selectBatchIds(any())).thenReturn(List.of(user(CREATOR_ID, "创建人")));

        RecurringPlanUpdateRequest request = new RecurringPlanUpdateRequest();
        request.setTitle("管理员更新后的巡检计划");

        RecurringPlanVO result = fixture.service.updatePlan(PLAN_ID, request, ADMIN_ID);

        assertThat(result.getTitle()).isEqualTo("管理员更新后的巡检计划");
        verify(fixture.planMapper).updateById(any(PmRecurringPlan.class));
    }

    @Test
    void activePlanIsNotOverdueBeforeNextDueTime() {
        TestFixture fixture = newFixture();
        LocalDateTime now = LocalDateTime.now();
        PmRecurringPlan plan = plan();
        plan.setNextRunAt(now.minusHours(1));
        plan.setStartTime(now.minusHours(1));
        plan.setDueTime(now.plusHours(3));
        when(fixture.sysUserService.isSuperAdmin(ADMIN_ID)).thenReturn(true);
        when(fixture.planMapper.selectPage(any(Page.class), any(Wrapper.class))).thenAnswer(invocation -> {
            Page<PmRecurringPlan> page = invocation.getArgument(0);
            page.setRecords(List.of(plan));
            page.setTotal(1L);
            return page;
        });
        when(fixture.assigneeMapper.selectList(any(Wrapper.class))).thenReturn(List.of());
        when(fixture.userMapper.selectBatchIds(any())).thenReturn(List.of(user(CREATOR_ID, "创建人")));

        PageVO<RecurringPlanVO> result = fixture.service.listPlans(new RecurringPlanQueryRequest(), ADMIN_ID);

        assertThat(result.getRecords()).singleElement().satisfies(vo -> assertThat(vo.getOverdue()).isFalse());
    }

    @Test
    void activePlanIsOverdueAfterNextDueTime() {
        TestFixture fixture = newFixture();
        LocalDateTime now = LocalDateTime.now();
        PmRecurringPlan plan = plan();
        plan.setNextRunAt(now.minusHours(4));
        plan.setStartTime(now.minusHours(4));
        plan.setDueTime(now.minusHours(1));
        when(fixture.sysUserService.isSuperAdmin(ADMIN_ID)).thenReturn(true);
        when(fixture.planMapper.selectPage(any(Page.class), any(Wrapper.class))).thenAnswer(invocation -> {
            Page<PmRecurringPlan> page = invocation.getArgument(0);
            page.setRecords(List.of(plan));
            page.setTotal(1L);
            return page;
        });
        when(fixture.assigneeMapper.selectList(any(Wrapper.class))).thenReturn(List.of());
        when(fixture.userMapper.selectBatchIds(any())).thenReturn(List.of(user(CREATOR_ID, "创建人")));

        PageVO<RecurringPlanVO> result = fixture.service.listPlans(new RecurringPlanQueryRequest(), ADMIN_ID);

        assertThat(result.getRecords()).singleElement().satisfies(vo -> {
            assertThat(vo.getOverdue()).isTrue();
            assertThat(vo.getOverdueReason()).contains("本期截止时间已早于当前时间");
            assertThat(vo.getCurrentOccurrenceStatus()).isEqualTo("OVERDUE");
            assertThat(vo.getCurrentOccurrenceActionable()).isTrue();
        });
    }

    @Test
    void activePlanWithoutDueTimeIsNotOverdueAfterStartTime() {
        TestFixture fixture = newFixture();
        LocalDateTime now = LocalDateTime.now();
        PmRecurringPlan plan = plan();
        plan.setNextRunAt(now.minusHours(2));
        plan.setStartTime(now.minusHours(2));
        plan.setDueTime(null);
        when(fixture.sysUserService.isSuperAdmin(ADMIN_ID)).thenReturn(true);
        when(fixture.planMapper.selectPage(any(Page.class), any(Wrapper.class))).thenAnswer(invocation -> {
            Page<PmRecurringPlan> page = invocation.getArgument(0);
            page.setRecords(List.of(plan));
            page.setTotal(1L);
            return page;
        });
        when(fixture.assigneeMapper.selectList(any(Wrapper.class))).thenReturn(List.of());
        when(fixture.userMapper.selectBatchIds(any())).thenReturn(List.of(user(CREATOR_ID, "创建人")));

        PageVO<RecurringPlanVO> result = fixture.service.listPlans(new RecurringPlanQueryRequest(), ADMIN_ID);

        assertThat(result.getRecords()).singleElement().satisfies(vo -> {
            assertThat(vo.getOverdue()).isFalse();
            assertThat(vo.getOverdueReason()).isNull();
            assertThat(vo.getNextDueTime()).isNull();
            assertThat(vo.getCurrentOccurrenceStatus()).isEqualTo("PENDING");
            assertThat(vo.getCurrentOccurrenceActionable()).isTrue();
        });
    }

    @Test
    void unrelatedUserCannotUpdateRecurringPlan() {
        TestFixture fixture = newFixture();
        when(fixture.sysUserService.isSuperAdmin(OUTSIDER_ID)).thenReturn(false);
        when(fixture.assigneeMapper.selectCount(any(Wrapper.class))).thenReturn(0L);

        RecurringPlanUpdateRequest request = new RecurringPlanUpdateRequest();
        request.setTitle("无关用户更新");

        assertThatThrownBy(() -> fixture.service.updatePlan(PLAN_ID, request, OUTSIDER_ID))
                .isInstanceOf(RuntimeException.class)
                .hasMessageContaining("无权访问该周期计划");
    }

    @Test
    void assigneeCannotDeletePlanCreatedByAnotherUser() {
        TestFixture fixture = newFixture();
        when(fixture.sysUserService.isSuperAdmin(ASSIGNEE_ID)).thenReturn(false);
        when(fixture.assigneeMapper.selectCount(any(Wrapper.class))).thenReturn(1L);

        assertThatThrownBy(() -> fixture.service.deletePlan(PLAN_ID, ASSIGNEE_ID))
                .isInstanceOf(RuntimeException.class)
                .hasMessageContaining("无权删除该周期计划");
    }

    private static TestFixture newFixture() {
        PmRecurringPlanMapper planMapper = mock(PmRecurringPlanMapper.class);
        PmRecurringPlanAssigneeMapper assigneeMapper = mock(PmRecurringPlanAssigneeMapper.class);
        PmRecurringPlanOccurrenceMapper occurrenceMapper = mock(PmRecurringPlanOccurrenceMapper.class);
        PmTaskStageMapper taskStageMapper = mock(PmTaskStageMapper.class);
        SysUserMapper userMapper = mock(SysUserMapper.class);
        SysUserService sysUserService = mock(SysUserService.class);
        PmTaskService pmTaskService = mock(PmTaskService.class);
        ProjectPermissionService permissionService = mock(ProjectPermissionService.class);
        PmRecurringPlanServiceImpl service =
                new PmRecurringPlanServiceImpl(assigneeMapper,
                        occurrenceMapper,
                        taskStageMapper,
                        userMapper,
                        sysUserService,
                        pmTaskService,
                        permissionService,
                        new ObjectMapper());
        ReflectionTestUtils.setField(service, "baseMapper", planMapper);

        when(planMapper.selectById(PLAN_ID)).thenReturn(plan());
        when(planMapper.updateById(any(PmRecurringPlan.class))).thenReturn(1);

        return new TestFixture(service, planMapper, assigneeMapper, occurrenceMapper, userMapper, sysUserService);
    }

    private static PmRecurringPlan plan() {
        LocalDateTime startAt = LocalDateTime.of(2026, 5, 1, 9, 0);
        PmRecurringPlan plan = new PmRecurringPlan();
        plan.setId(PLAN_ID);
        plan.setTitle("月度巡检计划");
        plan.setDescription("服务器巡检");
        plan.setPriority(2);
        plan.setStatus("ACTIVE");
        plan.setRecurrenceUnit("MONTH");
        plan.setIntervalCount(1);
        plan.setStartTime(startAt);
        plan.setDueTime(startAt.plusHours(8));
        plan.setNextRunAt(startAt);
        plan.setTimezone("Asia/Shanghai");
        plan.setReminderEnabled(false);
        plan.setAutoCreateTask(false);
        plan.setGeneratedCount(0);
        plan.setCreatorId(CREATOR_ID);
        plan.setIsDeleted(0);
        plan.setCreatedAt(startAt.minusDays(1));
        plan.setUpdatedAt(startAt.minusDays(1));
        return plan;
    }

    private static PmRecurringPlanAssignee planAssignee(Long planId, Long userId) {
        PmRecurringPlanAssignee assignee = new PmRecurringPlanAssignee();
        assignee.setPlanId(planId);
        assignee.setUserId(userId);
        assignee.setRole("RESPONSIBLE");
        return assignee;
    }

    private static SysUser user(Long id, String nickname) {
        SysUser user = new SysUser();
        user.setId(id);
        user.setUsername("user" + id);
        user.setNickname(nickname);
        return user;
    }

    private record TestFixture(PmRecurringPlanServiceImpl service,
                               PmRecurringPlanMapper planMapper,
                               PmRecurringPlanAssigneeMapper assigneeMapper,
                               PmRecurringPlanOccurrenceMapper occurrenceMapper,
                               SysUserMapper userMapper,
                               SysUserService sysUserService) {
    }
}
