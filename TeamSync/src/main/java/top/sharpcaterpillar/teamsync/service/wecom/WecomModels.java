package top.sharpcaterpillar.teamsync.service.wecom;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

/** 企业微信推送内部模型及接口数据。 */
public final class WecomModels {
    private WecomModels() { }

    public enum ReportType { DAILY, WEEKLY }

    public record SettingsRequest(String webhookUrl, boolean dailyEnabled, List<String> dailyTimes,
                                  boolean weeklyEnabled, List<String> weeklyTimes, List<Long> projectIds) { }

    public record Settings(String webhookCipher, boolean dailyEnabled, List<String> dailyTimes,
                           boolean weeklyEnabled, List<String> weeklyTimes, List<Long> projectIds) { }

    public record SettingsView(boolean webhookConfigured, boolean encryptionReady, boolean dispatchEnabled,
                               boolean dailyEnabled, List<String> dailyTimes, boolean weeklyEnabled,
                               List<String> weeklyTimes, List<Long> projectIds, String timezone, String weeklyDay) { }

    public record ProjectOption(Long id, String name) { }

    public record TaskRow(Long id, String projectName, String title, String assignees,
                          int priority, int status, LocalDateTime dueTime) { }

    public record TaskDetail(Long id, String projectName, String title, String assignees,
                             int priority, int status, LocalDateTime dueTime, String deadlineHint) { }

    public record Preview(ReportType reportType, LocalDate startDate, LocalDate endDate,
                          long total, long completed, long processing, long notStarted, long overdue,
                          int projectCount, long undated, long periodTotal, long periodCompleted,
                          long periodProcessing, long periodNotStarted,
                          List<TaskDetail> tasks, List<String> messages) { }

    public record Job(Long id, String reportType, String triggerType, String status,
                      int totalParts, int sentParts, String errorMessage, String createdAt, String updatedAt) { }

    public record Delivery(Long id, String webhookCipher, String content) { }
}
