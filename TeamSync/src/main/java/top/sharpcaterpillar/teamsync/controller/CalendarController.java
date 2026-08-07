package top.sharpcaterpillar.teamsync.controller;

import lombok.RequiredArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import top.sharpcaterpillar.teamsync.common.Result;
import top.sharpcaterpillar.teamsync.dto.CalendarEventQueryRequest;
import top.sharpcaterpillar.teamsync.service.CalendarService;
import top.sharpcaterpillar.teamsync.utils.UserContext;

/**
 * 日历视图 Controller。
 */
@RestController
@RequestMapping("/api/calendar")
@RequiredArgsConstructor
public class CalendarController {

    private static final Logger log = LoggerFactory.getLogger(CalendarController.class);

    private final CalendarService calendarService;

    @GetMapping("/events")
    public Result listEvents(CalendarEventQueryRequest request) {
        Long currentUserId = UserContext.getUserId();
        try {
            return Result.success(calendarService.listEvents(request, currentUserId));
        } catch (RuntimeException e) {
            log.warn("查询日历事件失败: userId={}, message={}", currentUserId, e.getMessage());
            return Result.error(e.getMessage());
        }
    }

    @GetMapping("/assignees")
    public Result listAssignees(@RequestParam(value = "projectId", required = false) Long projectId) {
        Long currentUserId = UserContext.getUserId();
        try {
            return Result.success(calendarService.listAssignees(projectId, currentUserId));
        } catch (RuntimeException e) {
            log.warn("查询日历负责人失败: userId={}, message={}", currentUserId, e.getMessage());
            return Result.error(e.getMessage());
        }
    }
}
