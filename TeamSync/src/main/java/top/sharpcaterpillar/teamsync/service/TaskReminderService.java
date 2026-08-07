package top.sharpcaterpillar.teamsync.service;

import top.sharpcaterpillar.teamsync.entity.PmTask;

import java.util.Collection;

public interface TaskReminderService {

    void scanAndSendOverdueTaskReminders();

    void sendTestReminderEmail(Long userId, String email);

    void sendTaskCompletedReminder(PmTask task, Collection<Long> recipientIds, Long actorId);

    boolean isMailChannelReady();
}
