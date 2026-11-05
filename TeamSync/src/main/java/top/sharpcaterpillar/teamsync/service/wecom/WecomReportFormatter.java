package top.sharpcaterpillar.teamsync.service.wecom;

import org.springframework.stereotype.Component;
import top.sharpcaterpillar.teamsync.service.wecom.WecomModels.*;

import java.nio.charset.StandardCharsets;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.time.temporal.ChronoUnit;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.List;
import java.util.Locale;

/** 汇总所选未归档项目的全部任务，仅提醒已设置截止日期的未完成任务。 */
@Component
public class WecomReportFormatter {
    private static final DateTimeFormatter DATE_TIME = DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm");

    public Preview format(ReportType type, List<TaskRow> candidates, int projectCount, LocalDateTime now) {
        LocalDate start = now.toLocalDate();
        LocalDateTime periodStart = type == ReportType.DAILY ? start.atStartOfDay() : now;
        LocalDateTime periodEnd = type == ReportType.DAILY ? start.plusDays(1).atStartOfDay() : now.plusDays(7);
        long completed = candidates.stream().filter(t -> t.status() == 1).count();
        long processing = candidates.stream().filter(t -> t.status() == 2).count();
        long notStarted = candidates.stream().filter(t -> t.status() == 0).count();
        long overdue = candidates.stream().filter(t -> t.status() != 1 && t.dueTime() != null
                && t.dueTime().isBefore(now)).count();
        long undated = candidates.stream().filter(t -> t.status() != 1 && t.dueTime() == null).count();
        List<TaskRow> periodTasks = candidates.stream().filter(t -> t.dueTime() != null
                && !t.dueTime().isBefore(periodStart) && withinEnd(type, t.dueTime(), periodEnd)).toList();
        long periodCompleted = periodTasks.stream().filter(t -> t.status() == 1).count();
        long periodProcessing = periodTasks.stream().filter(t -> t.status() == 2).count();
        long periodNotStarted = periodTasks.stream().filter(t -> t.status() == 0).count();
        List<TaskDetail> details = candidates.stream().filter(t -> t.status() != 1 && t.dueTime() != null)
                .filter(t -> withinEnd(type, t.dueTime(), periodEnd)
                        && (type == ReportType.DAILY || !t.dueTime().isBefore(periodStart)))
                .sorted(Comparator.comparing(TaskRow::dueTime, Comparator.nullsLast(Comparator.naturalOrder()))
                        .thenComparing(Comparator.comparingInt(TaskRow::priority).reversed()).thenComparing(TaskRow::id))
                .map(t -> new TaskDetail(t.id(), t.projectName(), t.title(), t.assignees(), t.priority(),
                        t.status(), t.dueTime(), deadlineHint(t.dueTime(), now))).toList();
        String title = type == ReportType.DAILY ? "当日任务完成情况" : "未来一周任务提醒";
        String period = type == ReportType.DAILY ? "今日" : "未来7天";
        String detailTitle = type == ReportType.DAILY ? "今日到期及历史逾期未完成任务" : "未来7天到期未完成任务";
        String emptyText = type == ReportType.DAILY ? "暂无今日到期或历史逾期的未完成任务。" : "暂无未来7天内到期的未完成任务。";
        String rate = String.format(Locale.ROOT, "%.1f", candidates.isEmpty() ? 0 : completed * 100.0 / candidates.size());
        String range = type == ReportType.DAILY ? start.toString()
                : now.format(DATE_TIME) + " ～ " + periodEnd.format(DATE_TIME);
        String header = "## " + title + "\n" + range
                + "\n统计时间：" + now.format(DATE_TIME) + "（北京时间）\n"
                + "统计范围：所选 " + projectCount + " 个未归档项目的全部任务\n"
                + "平台总任务" + candidates.size() + "，已完成" + completed + "，处理中" + processing
                + "，未开始" + notStarted + "，已逾期" + overdue + "\n"
                + "完成率" + rate + "%，未完成" + (candidates.size() - completed) + "\n"
                + period + "到期" + periodTasks.size() + "：已完成" + periodCompleted + "，处理中" + periodProcessing
                + "，未开始" + periodNotStarted + "\n\n"
                + "### " + detailTitle + "（" + details.size() + "项）\n";
        String table = "|序号|项目名称|任务标题|负责人|优先级|任务状态|截止时间|到期提示|\n"
                + "|---|---|---|---|---|---|---|---|\n";
        List<String> bodies = new ArrayList<>();
        StringBuilder body = new StringBuilder();
        for (int i = 0; i < details.size(); i++) {
            TaskDetail t = details.get(i);
            String row = "|" + (i + 1) + "|" + cell(t.projectName(), 60) + "|" + cell(t.title(), 200)
                    + "|" + cell(t.assignees(), 150) + "|" + priorityLabel(t.priority()) + "|" + statusLabel(t.status())
                    + "|" + (t.dueTime() == null ? "未设置" : t.dueTime().format(DATE_TIME))
                    + "|" + t.deadlineHint() + "|\n";
            // 为分片编号预留空间；每条消息按 UTF-8 字节数限制，分片不拆开任务行。
            if (bytes(header + table + body + row) > 4000 && !body.isEmpty()) {
                bodies.add(table + body);
                body.setLength(0);
            }
            body.append(row);
        }
        if (!body.isEmpty()) bodies.add(table + body);
        if (bodies.isEmpty()) bodies.add(completed == candidates.size()
                ? "所选项目的全部任务均已完成，暂无未完成任务。\n"
                : emptyText + "\n");
        if (candidates.isEmpty()) bodies.set(0, "所选未归档项目暂无任务。\n");
        List<String> messages = new ArrayList<>();
        for (int i = 0; i < bodies.size(); i++) {
            messages.add(header + "第 " + (i + 1) + " / " + bodies.size() + " 条\n" + bodies.get(i));
        }
        return new Preview(type, start, type == ReportType.DAILY ? start : periodEnd.toLocalDate(), candidates.size(), completed, processing, notStarted,
                overdue, projectCount, undated, periodTasks.size(), periodCompleted, periodProcessing, periodNotStarted,
                details, List.copyOf(messages));
    }

    private boolean withinEnd(ReportType type, LocalDateTime due, LocalDateTime end) {
        return type == ReportType.DAILY ? due.isBefore(end) : !due.isAfter(end);
    }

    private String deadlineHint(LocalDateTime due, LocalDateTime now) {
        if (due == null) return "未排期";
        long days = ChronoUnit.DAYS.between(now.toLocalDate(), due.toLocalDate());
        if (due.isBefore(now)) return days == 0 ? "今日已逾期" : "逾期" + (-days) + "天";
        if (days == 0) return "今日到期";
        if (days == 1) return "明日到期";
        return "剩余" + days + "天";
    }

    private int bytes(String value) { return value.getBytes(StandardCharsets.UTF_8).length; }

    private String cell(String value, int maxPoints) {
        if (value == null || value.isBlank()) return "未分配";
        String clean = value.replaceAll("[\\p{Cntrl}\\p{Zl}\\p{Zp}]", " ").replace('|', '｜')
                .replace('<', '＜').replace('>', '＞').replace('`', '｀').replace('[', '［')
                .replace(']', '］').replace('*', '＊').replace('_', '＿').replace('\\', '＼')
                .replace('!', '！').replace('~', '～');
        return clean.codePointCount(0, clean.length()) <= maxPoints ? clean
                : clean.substring(0, clean.offsetByCodePoints(0, maxPoints)) + "…";
    }

    public static String statusLabel(int status) {
        return switch (status) { case 0 -> "未开始"; case 1 -> "已完成"; case 2 -> "处理中"; default -> "未知"; };
    }

    public static String priorityLabel(int priority) {
        return switch (priority) { case 2 -> "紧急"; case 3 -> "非常紧急"; default -> "普通"; };
    }
}
