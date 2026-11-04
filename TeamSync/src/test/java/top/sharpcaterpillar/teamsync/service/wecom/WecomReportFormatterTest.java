package top.sharpcaterpillar.teamsync.service.wecom;

import org.junit.jupiter.api.Test;
import top.sharpcaterpillar.teamsync.service.wecom.WecomModels.*;

import java.nio.charset.StandardCharsets;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;

class WecomReportFormatterTest {
    private final WecomReportFormatter formatter = new WecomReportFormatter();
    private final LocalDateTime now = LocalDateTime.of(2026, 11, 6, 12, 0);

    @Test
    void dailySummarizesAllTasksButOnlyListsUnfinishedTasksWithDeadlinesIncludingFuture() {
        Preview result = formatter.format(ReportType.DAILY, List.of(
                task(1, 1, now.minusDays(1)), task(2, 2, now.minusDays(1)),
                task(3, 1, now.plusHours(1)), task(4, 0, now),
                task(5, 2, now.minusHours(1)), task(6, 0, now.toLocalDate().plusDays(1).atStartOfDay()),
                task(7, 0, null)), 3, now);

        assertThat(result.total()).isEqualTo(7);
        assertThat(result.completed()).isEqualTo(2);
        assertThat(result.processing()).isEqualTo(2);
        assertThat(result.notStarted()).isEqualTo(3);
        assertThat(result.overdue()).isEqualTo(2);
        assertThat(result.tasks()).extracting(TaskDetail::id).containsExactly(2L, 5L, 4L, 6L);
        assertThat(result.messages().getFirst()).contains("平台总任务7，已完成2，处理中2，未开始3，已逾期2")
                .contains("所选 3 个未归档项目", "今日到期3：已完成1，处理中1，未开始1", "未完成5", "未完成任务提醒（4项")
                .contains("|序号|项目名称|任务编号及标题|负责人|优先级|任务状态|截止时间|到期提示|")
                .contains("逾期1天", "明日到期")
                .doesNotContain("#7 任务7", "未设置截止日期1", "|未设置|未排期|");
        assertThat(result.periodTotal()).isEqualTo(3);
        assertThat(result.undated()).isEqualTo(1);
    }

    @Test
    void weeklyUsesMondayThroughSundayIncludingFutureWeekendAndEarlierUnfinishedTasks() {
        Preview result = formatter.format(ReportType.WEEKLY, List.of(
                task(1, 0, LocalDateTime.of(2026, 11, 1, 23, 59)),
                task(2, 1, LocalDateTime.of(2026, 11, 1, 23, 59)),
                task(3, 1, LocalDateTime.of(2026, 11, 2, 0, 0)),
                task(4, 0, LocalDateTime.of(2026, 11, 8, 23, 59)),
                task(5, 2, LocalDateTime.of(2026, 11, 9, 0, 0))), 1, now);
        assertThat(result.startDate().toString()).isEqualTo("2026-11-02");
        assertThat(result.endDate().toString()).isEqualTo("2026-11-08");
        assertThat(result.total()).isEqualTo(5);
        assertThat(result.periodTotal()).isEqualTo(2);
        assertThat(result.tasks()).extracting(TaskDetail::id).containsExactly(1L, 4L, 5L);
        assertThat(result.messages().getFirst()).contains("截止时间", "2026-11-08 23:59", "本周到期2：已完成1，处理中0，未开始1");
    }

    @Test
    void splitsUtf8MessagesWithoutDroppingRowsOrBreakingUnicodeAndNeutralizesTableMarkup() {
        List<TaskRow> tasks = new ArrayList<>();
        for (long id = 1; id <= 120; id++) {
            tasks.add(new TaskRow(id, "项目|\n[链接](url)", "中文😀".repeat(100), "成员".repeat(200), 3, 0, now));
        }
        Preview result = formatter.format(ReportType.WEEKLY, tasks, 1, now);
        assertThat(result.messages().size()).isGreaterThan(1);
        for (String message : result.messages()) {
            assertThat(message.getBytes(StandardCharsets.UTF_8).length).isLessThanOrEqualTo(4096);
            assertThat(message).contains("|序号|").doesNotContain("项目|", "[链接]", "\uFFFD");
        }
        String all = String.join("\n", result.messages());
        for (int id = 1; id <= 120; id++) assertThat(all).contains("|" + id + "|项目");
    }

    @Test
    void emptyReportsStillProduceOneSummaryMessage() {
        Preview result = formatter.format(ReportType.DAILY, List.of(), 1, now);
        assertThat(result.total()).isZero();
        assertThat(result.messages()).singleElement().asString().contains("暂无任务");
    }

    @Test
    void noDueTasksTodayDoesNotHidePlatformWorkload() {
        Preview result = formatter.format(ReportType.DAILY, List.of(
                task(1, 1, now.minusDays(30)), task(2, 2, now.plusDays(7)), task(3, 0, null)), 2, now);
        assertThat(result.total()).isEqualTo(3);
        assertThat(result.periodTotal()).isZero();
        assertThat(result.tasks()).extracting(TaskDetail::id).containsExactly(2L);
        assertThat(result.messages().getFirst()).contains("平台总任务3", "今日到期0", "完成率33.3%", "未完成2", "剩余7天")
                .doesNotContain("暂无未完成任务");
    }

    @Test
    void overdueUsesExactTimeAndNeverCountsCompletedOrUndatedTasks() {
        Preview result = formatter.format(ReportType.DAILY, List.of(task(1, 1, now.minusDays(2)),
                task(2, 2, now.minusMinutes(1)), task(3, 0, now), task(4, 0, null)), 1, now);
        assertThat(result.overdue()).isEqualTo(1);
        assertThat(result.tasks()).extracting(TaskDetail::deadlineHint)
                .containsExactly("今日已逾期", "今日到期");
    }

    @Test
    void dailyAndWeeklyDoNotRemindUndatedTasksOrClaimTheyAreCompleted() {
        for (ReportType type : ReportType.values()) {
            Preview result = formatter.format(type, List.of(task(1, 0, null), task(2, 2, null),
                    task(3, 1, now.minusDays(10))), 1, now);
            assertThat(result.total()).isEqualTo(3);
            assertThat(result.completed()).isEqualTo(1);
            assertThat(result.notStarted()).isEqualTo(1);
            assertThat(result.processing()).isEqualTo(1);
            assertThat(result.tasks()).isEmpty();
            assertThat(result.messages()).singleElement().asString()
                    .contains("未完成2", "暂无已设置截止日期的未完成任务")
                    .doesNotContain("#1 任务1", "#2 任务2", "全部任务均已完成", "未排期");
        }
    }

    private TaskRow task(long id, int status, LocalDateTime due) {
        return new TaskRow(id, "项目", "任务" + id, null, 1, status, due);
    }
}
