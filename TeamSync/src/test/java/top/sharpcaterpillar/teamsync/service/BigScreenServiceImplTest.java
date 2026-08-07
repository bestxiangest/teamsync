package top.sharpcaterpillar.teamsync.service;

import com.baomidou.mybatisplus.core.conditions.Wrapper;
import org.junit.jupiter.api.Test;
import top.sharpcaterpillar.teamsync.entity.PmProject;
import top.sharpcaterpillar.teamsync.entity.PmRecurringPlan;
import top.sharpcaterpillar.teamsync.entity.PmRecurringPlanAssignee;
import top.sharpcaterpillar.teamsync.entity.PmTask;
import top.sharpcaterpillar.teamsync.entity.PmTaskMember;
import top.sharpcaterpillar.teamsync.entity.SysUser;
import top.sharpcaterpillar.teamsync.mapper.PmProjectMapper;
import top.sharpcaterpillar.teamsync.mapper.PmRecurringPlanAssigneeMapper;
import top.sharpcaterpillar.teamsync.mapper.PmRecurringPlanMapper;
import top.sharpcaterpillar.teamsync.mapper.PmTaskMapper;
import top.sharpcaterpillar.teamsync.mapper.PmTaskMemberMapper;
import top.sharpcaterpillar.teamsync.mapper.PmTaskStageMapper;
import top.sharpcaterpillar.teamsync.mapper.SysUserMapper;
import top.sharpcaterpillar.teamsync.service.impl.BigScreenServiceImpl;
import top.sharpcaterpillar.teamsync.vo.TaskReminderScreenVO;

import java.time.LocalDateTime;
import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.doAnswer;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.when;

class BigScreenServiceImplTest {

    @Test
    void buildsTaskReminderScreenDataFromProjectTasksAndRecurringPlans() {
        PmProjectMapper projectMapper = mock(PmProjectMapper.class);
        PmTaskMapper taskMapper = mock(PmTaskMapper.class);
        PmTaskStageMapper taskStageMapper = mock(PmTaskStageMapper.class);
        PmTaskMemberMapper taskMemberMapper = mock(PmTaskMemberMapper.class);
        PmRecurringPlanMapper recurringPlanMapper = mock(PmRecurringPlanMapper.class);
        PmRecurringPlanAssigneeMapper recurringPlanAssigneeMapper = mock(PmRecurringPlanAssigneeMapper.class);
        SysUserMapper userMapper = mock(SysUserMapper.class);
        PmProjectService projectService = mock(PmProjectService.class);

        LocalDateTime now = LocalDateTime.now();
        PmProject website = project(1L, "官网改版", 68);
        PmProject crm = project(2L, "CRM 二期", 45);
        PmTask overdueTask = task(1L, 1L, "支付接口联调", 3, 2, now.minusHours(2), 10L);
        PmTask dueSoonTask = task(2L, 2L, "首页性能优化", 2, 2, now.plusHours(3), 11L);
        PmTask doneTask = task(3L, 1L, "已完成验收", 1, 1, now.plusHours(4), 10L);
        doneTask.setUpdatedAt(now);
        PmRecurringPlan plan = recurringPlan(1L, "月度服务器巡检", "MONTH", now.plusDays(1), 10L);

        when(projectMapper.selectList(any(Wrapper.class))).thenReturn(List.of(website, crm));
        when(taskMapper.selectList(any(Wrapper.class))).thenReturn(List.of(overdueTask, dueSoonTask, doneTask));
        when(taskStageMapper.selectBatchIds(any())).thenReturn(List.of());
        when(taskMemberMapper.selectList(any(Wrapper.class))).thenReturn(List.of(
                taskMember(1L, 10L),
                taskMember(2L, 11L),
                taskMember(3L, 10L)
        ));
        when(recurringPlanMapper.selectList(any(Wrapper.class))).thenReturn(List.of(plan));
        when(recurringPlanAssigneeMapper.selectList(any(Wrapper.class))).thenReturn(List.of(planAssignee(1L, 10L)));
        when(userMapper.selectBatchIds(any())).thenReturn(List.of(user(10L, "张伟"), user(11L, "李娜")));
        doAnswer(invocation -> null).when(projectService).fillCalculatedProgress(any());

        BigScreenService service = new BigScreenServiceImpl(
                projectMapper,
                taskMapper,
                taskStageMapper,
                taskMemberMapper,
                recurringPlanMapper,
                recurringPlanAssigneeMapper,
                userMapper,
                projectService
        );

        TaskReminderScreenVO data = service.getTaskReminderScreenData();

        assertThat(data.getSummaryCards()).extracting(TaskReminderScreenVO.KpiCardItemVO::label)
                .contains("待处理任务", "已逾期", "周期计划待办");
        assertThat(data.getSummaryCards()).anySatisfy(card -> {
            if ("待处理任务".equals(card.label())) {
                assertThat(card.value()).isEqualTo(2);
            }
        });
        assertThat(data.getSummaryCards()).anySatisfy(card -> {
            if ("已逾期".equals(card.label())) {
                assertThat(card.value()).isEqualTo(1);
            }
        });
        assertThat(data.getUrgentTasks()).extracting(TaskReminderScreenVO.UrgentTaskItemVO::taskName)
                .contains("支付接口联调", "首页性能优化");
        assertThat(data.getRecurringPlans()).singleElement().satisfies(item -> {
            assertThat(item.planName()).isEqualTo("月度服务器巡检");
            assertThat(item.assigneeName()).isEqualTo("张伟");
        });
        assertThat(data.getAssigneeWall()).extracting(TaskReminderScreenVO.AssigneeOverviewItemVO::name)
                .contains("张伟", "李娜");
        assertThat(data.getSevenDayCalendar()).hasSize(7);
    }

    private static PmProject project(Long id, String name, Integer progress) {
        PmProject project = new PmProject();
        project.setId(id);
        project.setName(name);
        project.setProgress(progress);
        project.setIsArchived(0);
        project.setUpdatedAt(LocalDateTime.now());
        return project;
    }

    private static PmTask task(Long id,
                               Long projectId,
                               String title,
                               Integer priority,
                               Integer status,
                               LocalDateTime dueTime,
                               Long creatorId) {
        PmTask task = new PmTask();
        task.setId(id);
        task.setProjectId(projectId);
        task.setTitle(title);
        task.setPriority(priority);
        task.setStatus(status);
        task.setDueTime(dueTime);
        task.setCreatorId(creatorId);
        task.setUpdatedAt(LocalDateTime.now());
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
                                                 String unit,
                                                 LocalDateTime nextRunAt,
                                                 Long creatorId) {
        PmRecurringPlan plan = new PmRecurringPlan();
        plan.setId(id);
        plan.setTitle(title);
        plan.setStatus("ACTIVE");
        plan.setRecurrenceUnit(unit);
        plan.setIntervalCount(1);
        plan.setStartTime(nextRunAt.minusHours(8));
        plan.setDueTime(nextRunAt);
        plan.setNextRunAt(nextRunAt);
        plan.setCreatorId(creatorId);
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
        user.setNickname(nickname);
        user.setUsername("user" + id);
        return user;
    }
}
