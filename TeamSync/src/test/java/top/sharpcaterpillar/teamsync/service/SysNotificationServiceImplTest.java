package top.sharpcaterpillar.teamsync.service;

import com.baomidou.mybatisplus.core.conditions.Wrapper;
import org.junit.jupiter.api.Test;
import org.mockito.ArgumentCaptor;
import org.springframework.beans.factory.ObjectProvider;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.test.util.ReflectionTestUtils;
import top.sharpcaterpillar.teamsync.dto.NotificationMarkReadRequest;
import top.sharpcaterpillar.teamsync.entity.PmTask;
import top.sharpcaterpillar.teamsync.entity.SysNotification;
import top.sharpcaterpillar.teamsync.mapper.SysNotificationMapper;
import top.sharpcaterpillar.teamsync.service.impl.SysNotificationServiceImpl;
import top.sharpcaterpillar.teamsync.vo.NotificationUnreadCountVO;
import top.sharpcaterpillar.teamsync.vo.NotificationVO;

import java.time.LocalDateTime;
import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyBoolean;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.times;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

class SysNotificationServiceImplTest {

    @Test
    void taskDueNotificationDeduplicatesRecipientsAndWritesDedupeKey() {
        TestFixture fixture = newFixture();
        when(fixture.mapper.selectOne(any(Wrapper.class), anyBoolean())).thenReturn(null);
        when(fixture.mapper.insert(any(SysNotification.class))).thenReturn(1);
        LocalDateTime now = LocalDateTime.of(2026, 6, 7, 10, 0);

        fixture.service.notifyTaskDue(task(), List.of(10L, 10L, 20L), now);

        ArgumentCaptor<SysNotification> captor = ArgumentCaptor.forClass(SysNotification.class);
        verify(fixture.mapper, times(2)).insert(captor.capture());
        List<SysNotification> saved = captor.getAllValues();
        assertThat(saved).extracting(SysNotification::getUserId).containsExactly(10L, 20L);
        assertThat(saved).allSatisfy(notification -> {
            assertThat(notification.getType()).isEqualTo(SysNotificationService.TYPE_TASK_DUE);
            assertThat(notification.getSourceType()).isEqualTo("TASK");
            assertThat(notification.getSourceId()).isEqualTo(100L);
            assertThat(notification.getTargetPath()).isEqualTo("/project/board/200");
            assertThat(notification.getReadFlag()).isFalse();
            assertThat(notification.getDedupeKey()).contains("TASK_DUE:100");
        });
    }

    @Test
    void existingDedupeKeyDoesNotInsertAgain() {
        TestFixture fixture = newFixture();
        when(fixture.mapper.selectOne(any(Wrapper.class), anyBoolean())).thenReturn(existingNotification());

        fixture.service.notifyTaskDue(task(), List.of(10L), LocalDateTime.now());

        verify(fixture.mapper, never()).insert(any(SysNotification.class));
    }

    @Test
    void taskCompletedNotificationUsesOperationWindowAndActor() {
        TestFixture fixture = newFixture();
        when(fixture.mapper.selectOne(any(Wrapper.class), anyBoolean())).thenReturn(null);
        when(fixture.mapper.insert(any(SysNotification.class))).thenReturn(1);
        LocalDateTime completedAt = LocalDateTime.of(2026, 6, 7, 10, 5, 30, 987_000_000);

        fixture.service.notifyTaskCompleted(task(), List.of(10L, 10L, 20L), 99L, completedAt);

        ArgumentCaptor<SysNotification> captor = ArgumentCaptor.forClass(SysNotification.class);
        verify(fixture.mapper, times(2)).insert(captor.capture());
        List<SysNotification> saved = captor.getAllValues();
        assertThat(saved).extracting(SysNotification::getUserId).containsExactly(10L, 20L);
        assertThat(saved).allSatisfy(notification -> {
            assertThat(notification.getType()).isEqualTo(SysNotificationService.TYPE_TASK_COMPLETED);
            assertThat(notification.getTitle()).isEqualTo("任务已完成");
            assertThat(notification.getContent()).contains("接口联调");
            assertThat(notification.getSourceType()).isEqualTo("TASK");
            assertThat(notification.getSourceId()).isEqualTo(100L);
            assertThat(notification.getTargetPath()).isEqualTo("/project/board/200");
            assertThat(notification.getActorId()).isEqualTo(99L);
            assertThat(notification.getDedupeKey()).contains("TASK_COMPLETED:100");
            assertThat(notification.getDedupeKey()).contains("20260607100530987");
        });
    }

    @Test
    void countUnreadUsesCurrentUserScope() {
        TestFixture fixture = newFixture();
        when(fixture.mapper.selectCount(any(Wrapper.class))).thenReturn(3L);

        NotificationUnreadCountVO result = fixture.service.countUnread(10L);

        assertThat(result.getUnreadCount()).isEqualTo(3L);
    }

    @Test
    void markReadUpdatesUnreadOwnNotification() {
        TestFixture fixture = newFixture();
        SysNotification notification = existingNotification();
        notification.setReadFlag(false);
        when(fixture.mapper.selectOne(any(Wrapper.class), anyBoolean())).thenReturn(notification);
        when(fixture.mapper.updateById(any(SysNotification.class))).thenReturn(1);

        NotificationVO result = fixture.service.markRead(1L, 10L);

        assertThat(result.getRead()).isTrue();
        assertThat(result.getReadAt()).isNotNull();
        verify(fixture.mapper).updateById(notification);
    }

    @Test
    void batchMarkReadIgnoresEmptyRequest() {
        TestFixture fixture = newFixture();
        NotificationMarkReadRequest request = new NotificationMarkReadRequest();
        request.setIds(List.of());

        fixture.service.markRead(request, 10L);

        verify(fixture.mapper, never()).update(any(), any(Wrapper.class));
    }

    private static TestFixture newFixture() {
        SysNotificationMapper mapper = mock(SysNotificationMapper.class);
        @SuppressWarnings("unchecked")
        ObjectProvider<SimpMessagingTemplate> provider = mock(ObjectProvider.class);
        when(provider.getIfAvailable()).thenReturn(null);

        SysNotificationServiceImpl service = new SysNotificationServiceImpl(provider);
        ReflectionTestUtils.setField(service, "baseMapper", mapper);
        return new TestFixture(service, mapper);
    }

    private static PmTask task() {
        PmTask task = new PmTask();
        task.setId(100L);
        task.setProjectId(200L);
        task.setTitle("接口联调");
        task.setDueTime(LocalDateTime.of(2026, 6, 8, 18, 0));
        return task;
    }

    private static SysNotification existingNotification() {
        SysNotification notification = new SysNotification();
        notification.setId(1L);
        notification.setUserId(10L);
        notification.setType(SysNotificationService.TYPE_TASK_DUE);
        notification.setTitle("任务即将到期");
        notification.setContent("任务即将到期");
        notification.setSourceType("TASK");
        notification.setSourceId(100L);
        notification.setTargetPath("/project/board/200");
        notification.setDedupeKey("TASK_DUE:100:10:20260608180000");
        notification.setReadFlag(false);
        notification.setCreatedAt(LocalDateTime.of(2026, 6, 7, 10, 0));
        notification.setUpdatedAt(LocalDateTime.of(2026, 6, 7, 10, 0));
        return notification;
    }

    private record TestFixture(SysNotificationServiceImpl service, SysNotificationMapper mapper) {
    }
}
