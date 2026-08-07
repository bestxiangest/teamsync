package top.sharpcaterpillar.teamsync.service;

import com.baomidou.mybatisplus.core.conditions.Wrapper;
import org.junit.jupiter.api.Test;
import org.mockito.ArgumentCaptor;
import org.springframework.test.util.ReflectionTestUtils;
import top.sharpcaterpillar.teamsync.dto.TaskRequest;
import top.sharpcaterpillar.teamsync.entity.PmProject;
import top.sharpcaterpillar.teamsync.entity.PmTask;
import top.sharpcaterpillar.teamsync.entity.PmTaskMember;
import top.sharpcaterpillar.teamsync.mapper.PmProjectMapper;
import top.sharpcaterpillar.teamsync.mapper.PmTaskMapper;
import top.sharpcaterpillar.teamsync.mapper.PmTaskMemberMapper;
import top.sharpcaterpillar.teamsync.mapper.SysUserMapper;
import top.sharpcaterpillar.teamsync.service.impl.PmTaskServiceImpl;

import java.time.LocalDateTime;
import java.util.Collections;
import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

class PmTaskServiceImplTest {

    @Test
    void createTaskRejectsStartTimeEqualToDueTime() {
        SysUserMapper userMapper = mock(SysUserMapper.class);
        PmProjectMapper projectMapper = mock(PmProjectMapper.class);
        PmTaskMapper taskMapper = mock(PmTaskMapper.class);
        PmTaskMemberMapper taskMemberMapper = mock(PmTaskMemberMapper.class);
        TaskLogService taskLogService = mock(TaskLogService.class);
        SysNotificationService notificationService = mock(SysNotificationService.class);
        TaskReminderService taskReminderService = mock(TaskReminderService.class);
        PmTaskServiceImpl service = new PmTaskServiceImpl(
                userMapper,
                projectMapper,
                taskMemberMapper,
                taskLogService,
                notificationService,
                taskReminderService
        );
        ReflectionTestUtils.setField(service, "baseMapper", taskMapper);

        LocalDateTime sameTime = LocalDateTime.of(2026, 8, 6, 10, 0);
        TaskRequest request = new TaskRequest();
        request.setProjectId(200L);
        request.setStageId(300L);
        request.setTitle("时间校验任务");
        request.setStartTime(sameTime);
        request.setDueTime(sameTime);

        assertThatThrownBy(() -> service.createTask(request, 99L))
                .hasMessage("开始时间必须早于截止时间");

        verify(taskMapper, never()).insert(any(PmTask.class));
    }

    @Test
    void updateTaskNotifiesFollowersCreatorAndProjectOwnerWhenCompleted() {
        SysUserMapper userMapper = mock(SysUserMapper.class);
        PmProjectMapper projectMapper = mock(PmProjectMapper.class);
        PmTaskMapper taskMapper = mock(PmTaskMapper.class);
        PmTaskMemberMapper taskMemberMapper = mock(PmTaskMemberMapper.class);
        TaskLogService taskLogService = mock(TaskLogService.class);
        SysNotificationService notificationService = mock(SysNotificationService.class);
        TaskReminderService taskReminderService = mock(TaskReminderService.class);
        PmTaskServiceImpl service = new PmTaskServiceImpl(
                userMapper,
                projectMapper,
                taskMemberMapper,
                taskLogService,
                notificationService,
                taskReminderService
        );
        ReflectionTestUtils.setField(service, "baseMapper", taskMapper);

        PmTask task = task();
        PmProject project = project();
        when(taskMapper.selectById(100L)).thenReturn(task);
        when(taskMapper.updateById(any(PmTask.class))).thenReturn(1);
        when(projectMapper.selectById(200L)).thenReturn(project);
        when(taskMemberMapper.selectList(any(Wrapper.class))).thenReturn(
                Collections.emptyList(),
                List.of(member(20L), member(99L)),
                Collections.emptyList(),
                Collections.emptyList()
        );

        TaskRequest request = new TaskRequest();
        request.setStatus(1);

        service.updateTask(100L, request, 99L);

        @SuppressWarnings("unchecked")
        ArgumentCaptor<List<Long>> recipientCaptor = ArgumentCaptor.forClass(List.class);
        verify(notificationService).notifyTaskCompleted(
                eq(task),
                recipientCaptor.capture(),
                eq(99L),
                any(LocalDateTime.class)
        );
        assertThat(recipientCaptor.getValue()).containsExactly(20L, 10L, 30L);
        verify(taskReminderService).sendTaskCompletedReminder(task, List.of(20L, 10L, 30L), 99L);
    }

    private static PmTask task() {
        PmTask task = new PmTask();
        task.setId(100L);
        task.setProjectId(200L);
        task.setStageId(300L);
        task.setTitle("联调任务");
        task.setPriority(1);
        task.setStatus(0);
        task.setCreatorId(10L);
        task.setSort(1);
        task.setIsDeleted(0);
        task.setCreatedAt(LocalDateTime.of(2026, 6, 7, 9, 0));
        task.setUpdatedAt(LocalDateTime.of(2026, 6, 7, 9, 0));
        return task;
    }

    private static PmProject project() {
        PmProject project = new PmProject();
        project.setId(200L);
        project.setName("项目 A");
        project.setOwnerId(30L);
        return project;
    }

    private static PmTaskMember member(Long userId) {
        PmTaskMember member = new PmTaskMember();
        member.setTaskId(100L);
        member.setUserId(userId);
        member.setRole("FOLLOWER");
        return member;
    }
}
