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
    void dailyListsOnlyTodayAndHistoricalOverdueWhileKeepingPlatformTotals() {
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
        assertThat(result.tasks()).extracting(TaskDetail::id).containsExactly(2L, 5L, 4L);
        assertThat(result.messages().getFirst()).contains("平台总任务7，已完成2，处理中2，未开始3，已逾期2")
                .contains("所选 3 个未归档项目", "今日到期3：已完成1，处理中1，未开始1", "未完成5", "今日到期及历史逾期未完成任务（3项")
                .contains("|序号|项目名称|任务标题|负责人|优先级|任务状态|截止时间|到期提示|")
                .contains("|1|项目|任务2|未分配|普通|处理中|", "逾期1天")
                .doesNotContain("任务编号", "#2 任务2")
                .doesNotContain("|任务6|", "|任务7|", "明日到期", "|未设置|未排期|");
        assertThat(result.periodTotal()).isEqualTo(3);
        assertThat(result.undated()).isEqualTo(1);
    }

    @Test
    void weeklyUsesRollingSevenDaysFromPushTimeAndExcludesEarlierDeadlines() {
        Preview result = formatter.format(ReportType.WEEKLY, List.of(
                task(1, 0, now.minusSeconds(1)), task(2, 2, now), task(3, 1, now.plusDays(1)),
                task(4, 0, now.plusDays(7)), task(5, 2, now.plusDays(7).plusSeconds(1)), task(6, 0, null)), 1, now);
        assertThat(result.startDate().toString()).isEqualTo("2026-11-06");
        assertThat(result.endDate().toString()).isEqualTo("2026-11-13");
        assertThat(result.total()).isEqualTo(6);
        assertThat(result.periodTotal()).isEqualTo(3);
        assertThat(result.tasks()).extracting(TaskDetail::id).containsExactly(2L, 4L);
        assertThat(result.messages().getFirst()).contains("未来一周任务提醒", "2026-11-06 12:00 ～ 2026-11-13 12:00",
                "未来7天到期3：已完成1，处理中1，未开始1", "|1|项目|任务2|", "|2|项目|任务4|")
                .doesNotContain("任务编号", "#2 任务2", "#4 任务4")
                .doesNotContain("|任务1|", "|任务3|", "|任务5|", "|任务6|");
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
        assertThat(result.tasks()).isEmpty();
        assertThat(result.messages().getFirst()).contains("平台总任务3", "今日到期0", "完成率33.3%", "未完成2",
                "暂无今日到期或历史逾期的未完成任务")
                .doesNotContain("|任务2|", "全部任务均已完成");
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
                    .contains("未完成2", type == ReportType.DAILY ? "暂无今日到期或历史逾期的未完成任务" : "暂无未来7天内到期的未完成任务")
                    .doesNotContain("|任务1|", "|任务2|", "全部任务均已完成", "未排期");
        }
    }

    private TaskRow task(long id, int status, LocalDateTime due) {
        return new TaskRow(id, "项目", "任务" + id, null, 1, status, due);
    }
}
