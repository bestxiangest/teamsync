package top.sharpcaterpillar.teamsync.service.wecom;

import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.params.ParameterizedTest;
import org.junit.jupiter.params.provider.ValueSource;
import top.sharpcaterpillar.teamsync.entity.SysUser;
import top.sharpcaterpillar.teamsync.mapper.SysUserMapper;
import top.sharpcaterpillar.teamsync.service.wecom.WecomModels.*;
import top.sharpcaterpillar.teamsync.utils.UserContext;

import java.time.LocalDateTime;
import java.util.List;

import static org.assertj.core.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

class WecomPushServiceTest {
    private final WecomPushRepository repository = mock(WecomPushRepository.class);
    private final WecomWebhookSecret secret = mock(WecomWebhookSecret.class);
    private final WecomWebhookClient client = mock(WecomWebhookClient.class);
    private final SysUserMapper users = mock(SysUserMapper.class);
    private final WecomPushService service = new WecomPushService(repository, secret, new WecomReportFormatter(), client, users, true);

    @AfterEach void clearUser() { UserContext.clear(); }

    private Settings configured() {
        Settings settings = new Settings("encrypted", true, List.of("08:00", "17:30"), true, List.of("17:30"), List.of(1L));
        when(repository.settings()).thenReturn(settings);
        when(secret.isReady()).thenReturn(true);
        when(repository.tasks(anyList())).thenReturn(List.of());
        when(repository.projects()).thenReturn(List.of(new ProjectOption(1L, "项目")));
        return settings;
    }

    @ParameterizedTest
    @ValueSource(ints = {2, 3, 4, 5, 6})
    void bothReportsRunOnEveryWeekdayAndDeduplicateEachSlot(int day) {
        configured();
        LocalDateTime now = LocalDateTime.of(2026, 11, day, 17, 30);
        service.schedule(now);
        verify(repository).enqueue(eq("DAILY:" + now.toLocalDate() + "T17:30"), eq(ReportType.DAILY), eq("SCHEDULED"), eq("encrypted"), anyList());
        verify(repository).enqueue(eq("WEEKLY:" + now.toLocalDate() + "T17:30"), eq(ReportType.WEEKLY), eq("SCHEDULED"), eq("encrypted"), anyList());
        clearInvocations(repository);
        when(repository.scheduledExists(anyString())).thenReturn(true);
        service.schedule(now.plusSeconds(15));
        service.schedule(now.plusMinutes(1));
        verify(repository, never()).enqueue(anyString(), any(), anyString(), anyString(), anyList());
    }

    @ParameterizedTest
    @ValueSource(ints = {7, 8})
    void weekendsDoNotReadConfigurationOrEnqueueEitherReport(int day) {
        when(secret.isReady()).thenReturn(true);
        service.schedule(LocalDateTime.of(2026, 11, day, 17, 30));
        verifyNoInteractions(repository, client);
    }

    @Test
    void eachReportUsesItsOwnEnabledFlagAndSelectedTimes() {
        configured();
        service.schedule(LocalDateTime.of(2026, 11, 2, 8, 0));
        verify(repository).enqueue(eq("DAILY:2026-11-02T08:00"), eq(ReportType.DAILY), eq("SCHEDULED"), eq("encrypted"), anyList());
        verify(repository, never()).enqueue(anyString(), eq(ReportType.WEEKLY), anyString(), anyString(), anyList());
        clearInvocations(repository);
        when(repository.settings()).thenReturn(new Settings("encrypted", false, List.of("17:30"),
                true, List.of("17:30"), List.of(1L)));
        service.schedule(LocalDateTime.of(2026, 11, 2, 17, 30));
        verify(repository, never()).enqueue(anyString(), eq(ReportType.DAILY), anyString(), anyString(), anyList());
        verify(repository).enqueue(eq("WEEKLY:2026-11-02T17:30"), eq(ReportType.WEEKLY), eq("SCHEDULED"), eq("encrypted"), anyList());
    }

    @Test
    void reportUsesAllTasksAcrossSavedActiveProjectsRegardlessOfCurrentUserOrDueDate() {
        configured();
        when(repository.projects()).thenReturn(List.of(new ProjectOption(1L, "选中项目"), new ProjectOption(2L, "未选项目")));
        when(repository.tasks(List.of(1L))).thenReturn(List.of(
                new TaskRow(1L, "选中项目", "未来任务", "其他成员", 2, 2, LocalDateTime.of(2099, 1, 1, 0, 0)),
                new TaskRow(2L, "选中项目", "未排期任务", null, 1, 0, null),
                new TaskRow(3L, "选中项目", "历史已完成", null, 1, 1, LocalDateTime.of(2020, 1, 1, 0, 0))));
        Preview result = service.preview(ReportType.DAILY);
        assertThat(result.total()).isEqualTo(3);
        assertThat(result.projectCount()).isEqualTo(1);
        assertThat(result.tasks()).isEmpty();
        assertThat(result.messages().getFirst()).contains("平台总任务3", "未完成2").doesNotContain("|未排期任务|");
        assertThat(result.undated()).isEqualTo(1);
        verify(repository).tasks(List.of(1L));
    }

    @Test
    void validatesHalfHourTimesArchivedProjectsAndEmptyEnabledConfiguration() {
        configured();
        when(repository.projects()).thenReturn(List.of(new ProjectOption(1L, "项目")));
        assertThatThrownBy(() -> service.save(new SettingsRequest("", true, List.of("08:15"), false, List.of(), List.of(1L))))
                .hasMessageContaining("半小时");
        assertThatThrownBy(() -> service.save(new SettingsRequest("", true, List.of("08:00"), false, List.of(), List.of(9L))))
                .hasMessageContaining("已归档");
        assertThatThrownBy(() -> service.save(new SettingsRequest("", true, List.of(), false, List.of(), List.of(1L))))
                .hasMessageContaining("日报推送时间");
        assertThatThrownBy(() -> service.save(new SettingsRequest("", true, List.of("08:00"), false, List.of(), List.of())))
                .hasMessageContaining("至少选择");
        verify(repository, never()).save(any(), any());
    }

    @Test
    void blankWebhookPreservesEncryptedSecretAndResponseContainsNoSecret() {
        configured();
        when(repository.projects()).thenReturn(List.of(new ProjectOption(1L, "项目")));
        SettingsView view = service.save(new SettingsRequest("", true, List.of("17:30", "08:00", "08:00"), false, List.of(), List.of(1L)));
        verify(repository).save(eq(new Settings("encrypted", true, List.of("08:00", "17:30"), false, List.of(), List.of(1L))), isNull());
        assertThat(view.webhookConfigured()).isTrue();
        assertThat(view.weeklyDay()).isEqualTo("周一至周五");
        assertThat(view.toString()).doesNotContain("encrypted");
    }

    @Test
    void deniesGuestsRegularUsersAndDisabledAdministrators() {
        assertThatThrownBy(service::requireAdmin).hasMessageContaining("管理员");
        UserContext.setUserId(10L);
        SysUser user = new SysUser(); user.setIsAdmin(false);
        when(users.selectById(10L)).thenReturn(user);
        assertThatThrownBy(service::requireAdmin).hasMessageContaining("管理员");
        user.setIsAdmin(true); user.setStatus(4);
        assertThatThrownBy(service::requireAdmin).hasMessageContaining("管理员");
        user.setStatus(1);
        assertThatCode(service::requireAdmin).doesNotThrowAnyException();
    }

    @Test
    void recordsFailedDeliveryWithoutAdvancingProgressOrRetrying() {
        configured();
        when(repository.claim()).thenReturn(new Delivery(7L, "encrypted", "报告"));
        when(secret.decrypt("encrypted")).thenReturn("https://qyapi.weixin.qq.com/cgi-bin/webhook/send?key=test-key");
        doThrow(new IllegalStateException("企业微信拒绝推送，错误码：93000")).when(client).send(anyString(), anyString());
        service.dispatchOne();
        verify(repository).failed(7L, "企业微信拒绝推送，错误码：93000");
        verify(repository, never()).delivered(anyLong());
        verify(client, times(1)).send(anyString(), anyString());
    }

    @Test
    void disabledDispatchDoesNotReadDatabaseOrSend() {
        WecomPushService disabled = new WecomPushService(repository, secret, new WecomReportFormatter(), client, users, false);
        disabled.schedule(LocalDateTime.of(2026, 11, 6, 17, 30));
        disabled.dispatchOne();
        assertThatThrownBy(() -> disabled.manualPush(ReportType.DAILY)).hasMessageContaining("TEAMSYNC_WECOM_ENABLED");
        verifyNoInteractions(repository, client);
    }
}
