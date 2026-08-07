package top.sharpcaterpillar.teamsync.service;

import org.junit.jupiter.api.Test;
import top.sharpcaterpillar.teamsync.service.impl.RecurringPlanScheduleCalculator;

import java.time.LocalDateTime;

import static org.junit.jupiter.api.Assertions.assertEquals;

class RecurringPlanScheduleCalculatorTest {

    @Test
    void calculatesNextMonthlyWindowWithSameDuration() {
        LocalDateTime startAt = LocalDateTime.of(2026, 1, 15, 9, 0);
        LocalDateTime dueAt = LocalDateTime.of(2026, 1, 20, 18, 0);
        LocalDateTime from = LocalDateTime.of(2026, 1, 16, 10, 0);

        RecurringPlanScheduleCalculator.OccurrenceWindow window =
                RecurringPlanScheduleCalculator.calculateNextWindow(startAt, dueAt, "MONTH", 1, from);

        assertEquals(LocalDateTime.of(2026, 2, 15, 9, 0), window.startAt());
        assertEquals(LocalDateTime.of(2026, 2, 20, 18, 0), window.dueAt());
    }

    @Test
    void calculatesQuarterAndHalfYearWindows() {
        LocalDateTime startAt = LocalDateTime.of(2026, 1, 10, 8, 30);
        LocalDateTime dueAt = LocalDateTime.of(2026, 1, 12, 18, 30);

        RecurringPlanScheduleCalculator.OccurrenceWindow quarter =
                RecurringPlanScheduleCalculator.calculateNextWindow(
                        startAt,
                        dueAt,
                        "QUARTER",
                        1,
                        LocalDateTime.of(2026, 2, 1, 0, 0)
                );
        RecurringPlanScheduleCalculator.OccurrenceWindow halfYear =
                RecurringPlanScheduleCalculator.calculateNextWindow(
                        startAt,
                        dueAt,
                        "HALF_YEAR",
                        1,
                        LocalDateTime.of(2026, 2, 1, 0, 0)
                );

        assertEquals(LocalDateTime.of(2026, 4, 10, 8, 30), quarter.startAt());
        assertEquals(LocalDateTime.of(2026, 4, 12, 18, 30), quarter.dueAt());
        assertEquals(LocalDateTime.of(2026, 7, 10, 8, 30), halfYear.startAt());
        assertEquals(LocalDateTime.of(2026, 7, 12, 18, 30), halfYear.dueAt());
    }
}
