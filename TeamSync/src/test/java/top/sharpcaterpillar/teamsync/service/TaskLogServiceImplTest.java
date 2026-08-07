package top.sharpcaterpillar.teamsync.service;

import org.junit.jupiter.api.Test;
import org.mockito.ArgumentCaptor;
import top.sharpcaterpillar.teamsync.entity.PmTaskLog;
import top.sharpcaterpillar.teamsync.entity.SysUser;
import top.sharpcaterpillar.teamsync.mapper.PmTaskLogMapper;
import top.sharpcaterpillar.teamsync.mapper.SysUserMapper;
import top.sharpcaterpillar.teamsync.service.impl.TaskLogServiceImpl;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

class TaskLogServiceImplTest {

    @Test
    void excludedUserDoesNotWriteTaskLog() {
        TestFixture fixture = newFixture();
        when(fixture.userMapper.selectById(106L)).thenReturn(user(106L, "zzn"));

        fixture.service.logUpdate(200L, 106L, "更新了任务标题");

        verify(fixture.taskLogMapper, never()).insert(any(PmTaskLog.class));
    }

    @Test
    void regularUserStillWritesTaskLog() {
        TestFixture fixture = newFixture();
        when(fixture.userMapper.selectById(10L)).thenReturn(user(10L, "colleague"));

        fixture.service.logUpdate(200L, 10L, "更新了任务标题");

        ArgumentCaptor<PmTaskLog> captor = ArgumentCaptor.forClass(PmTaskLog.class);
        verify(fixture.taskLogMapper).insert(captor.capture());
        assertThat(captor.getValue()).satisfies(taskLog -> {
            assertThat(taskLog.getTaskId()).isEqualTo(200L);
            assertThat(taskLog.getOperatorId()).isEqualTo(10L);
            assertThat(taskLog.getActionType()).isEqualTo(TaskLogService.ACTION_UPDATE);
            assertThat(taskLog.getDetail()).isEqualTo("更新了任务标题");
            assertThat(taskLog.getCreatedAt()).isNotNull();
        });
    }

    private static TestFixture newFixture() {
        PmTaskLogMapper taskLogMapper = mock(PmTaskLogMapper.class);
        SysUserMapper userMapper = mock(SysUserMapper.class);
        TaskLogServiceImpl service = new TaskLogServiceImpl(taskLogMapper, userMapper);
        return new TestFixture(service, taskLogMapper, userMapper);
    }

    private static SysUser user(Long id, String username) {
        SysUser user = new SysUser();
        user.setId(id);
        user.setUsername(username);
        return user;
    }

    private record TestFixture(TaskLogServiceImpl service,
                               PmTaskLogMapper taskLogMapper,
                               SysUserMapper userMapper) {
    }
}
