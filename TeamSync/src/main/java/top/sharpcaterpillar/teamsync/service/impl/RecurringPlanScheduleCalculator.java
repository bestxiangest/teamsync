package top.sharpcaterpillar.teamsync.service.impl;

import java.time.Duration;
import java.time.LocalDateTime;

/**
 * 周期计划下次执行时间计算器。
 */
public final class RecurringPlanScheduleCalculator {

    private RecurringPlanScheduleCalculator() {
    }

    public record OccurrenceWindow(LocalDateTime startAt, LocalDateTime dueAt) {
    }

    public static OccurrenceWindow calculateNextWindow(LocalDateTime startAt,
                                                       LocalDateTime dueAt,
                                                       String recurrenceUnit,
                                                       Integer intervalCount,
                                                       LocalDateTime from) {
        if (startAt == null) {
            throw new IllegalArgumentException("开始时间不能为空");
        }
        if (from == null) {
            from = LocalDateTime.now();
        }
        if (dueAt != null && dueAt.isBefore(startAt)) {
            throw new IllegalArgumentException("截止时间不能早于开始时间");
        }

        int interval = intervalCount == null || intervalCount < 1 ? 1 : intervalCount;
        LocalDateTime nextStart = startAt;
        while (nextStart.isBefore(from)) {
            nextStart = plusInterval(nextStart, recurrenceUnit, interval);
        }

        LocalDateTime nextDue = null;
        if (dueAt != null) {
            Duration duration = Duration.between(startAt, dueAt);
            nextDue = nextStart.plus(duration);
        }
        return new OccurrenceWindow(nextStart, nextDue);
    }

    private static LocalDateTime plusInterval(LocalDateTime value, String recurrenceUnit, int interval) {
        String unit = recurrenceUnit == null ? "" : recurrenceUnit.trim().toUpperCase();
        return switch (unit) {
            case "DAY", "DAILY" -> value.plusDays(interval);
            case "WEEK", "WEEKLY" -> value.plusWeeks(interval);
            case "MONTH", "MONTHLY" -> value.plusMonths(interval);
            case "QUARTER", "QUARTERLY" -> value.plusMonths(3L * interval);
            case "HALF_YEAR", "HALF-YEAR", "SEMI_ANNUAL", "SEMIANNUAL" -> value.plusMonths(6L * interval);
            case "YEAR", "YEARLY", "ANNUAL" -> value.plusYears(interval);
            default -> throw new IllegalArgumentException("不支持的周期单位：" + recurrenceUnit);
        };
    }
}
