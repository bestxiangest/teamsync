package top.sharpcaterpillar.teamsync.schedule;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;
import top.sharpcaterpillar.teamsync.service.TaskReminderService;

/**
 * 任务提醒定时器
 */
@Component
public class TaskReminderScheduler {

    private static final Logger log = LoggerFactory.getLogger(TaskReminderScheduler.class);

    private final TaskReminderService taskReminderService;

    public TaskReminderScheduler(TaskReminderService taskReminderService) {
        this.taskReminderService = taskReminderService;
    }

    @Scheduled(cron = "${teamsync.mail.reminder.overdue-cron:0 0 * * * *}")
    public void scanOverdueTasks() {
        try {
            taskReminderService.scanAndSendOverdueTaskReminders();
        } catch (Exception e) {
            log.error("逾期任务邮件扫描失败", e);
        }
    }
}
