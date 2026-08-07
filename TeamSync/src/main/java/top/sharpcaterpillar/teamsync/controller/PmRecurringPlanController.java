package top.sharpcaterpillar.teamsync.controller;

import lombok.RequiredArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import top.sharpcaterpillar.teamsync.common.Result;
import top.sharpcaterpillar.teamsync.dto.RecurringPlanCreateRequest;
import top.sharpcaterpillar.teamsync.dto.RecurringPlanOccurrenceActionRequest;
import top.sharpcaterpillar.teamsync.dto.RecurringPlanOccurrenceQueryRequest;
import top.sharpcaterpillar.teamsync.dto.RecurringPlanQueryRequest;
import top.sharpcaterpillar.teamsync.dto.RecurringPlanStatusRequest;
import top.sharpcaterpillar.teamsync.dto.RecurringPlanUpdateRequest;
import top.sharpcaterpillar.teamsync.service.PmRecurringPlanService;
import top.sharpcaterpillar.teamsync.utils.UserContext;

/**
 * 周期计划 Controller。
 */
@RestController
@RequestMapping("/api/recurring-plans")
@RequiredArgsConstructor
public class PmRecurringPlanController {

    private static final Logger log = LoggerFactory.getLogger(PmRecurringPlanController.class);

    private final PmRecurringPlanService recurringPlanService;

    @GetMapping
    public Result listPlans(RecurringPlanQueryRequest request) {
        Long currentUserId = UserContext.getUserId();
        try {
            return Result.success(recurringPlanService.listPlans(request, currentUserId));
        } catch (RuntimeException e) {
            log.warn("查询周期计划失败: {}", e.getMessage());
            return Result.error(e.getMessage());
        }
    }

    @GetMapping("/{id}")
    public Result getPlan(@PathVariable("id") Long id) {
        Long currentUserId = UserContext.getUserId();
        try {
            return Result.success(recurringPlanService.getPlan(id, currentUserId));
        } catch (RuntimeException e) {
            log.warn("获取周期计划失败: id={}, message={}", id, e.getMessage());
            return Result.error(e.getMessage());
        }
    }

    @PostMapping
    public Result createPlan(@RequestBody RecurringPlanCreateRequest request) {
        Long currentUserId = UserContext.getUserId();
        try {
            return Result.success(recurringPlanService.createPlan(request, currentUserId));
        } catch (RuntimeException e) {
            log.warn("创建周期计划失败: {}", e.getMessage());
            return Result.error(e.getMessage());
        }
    }

    @PutMapping("/{id}")
    public Result updatePlan(@PathVariable("id") Long id, @RequestBody RecurringPlanUpdateRequest request) {
        Long currentUserId = UserContext.getUserId();
        try {
            return Result.success(recurringPlanService.updatePlan(id, request, currentUserId));
        } catch (RuntimeException e) {
            log.warn("更新周期计划失败: id={}, message={}", id, e.getMessage());
            return Result.error(e.getMessage());
        }
    }

    @PutMapping("/{id}/status")
    public Result updateStatus(@PathVariable("id") Long id, @RequestBody RecurringPlanStatusRequest request) {
        Long currentUserId = UserContext.getUserId();
        String status = request == null ? null : request.getStatus();
        try {
            return Result.success(recurringPlanService.updateStatus(id, status, currentUserId));
        } catch (RuntimeException e) {
            log.warn("更新周期计划状态失败: id={}, message={}", id, e.getMessage());
            return Result.error(e.getMessage());
        }
    }

    @GetMapping("/{id}/occurrences")
    public Result listOccurrences(@PathVariable("id") Long id, RecurringPlanOccurrenceQueryRequest request) {
        Long currentUserId = UserContext.getUserId();
        try {
            return Result.success(recurringPlanService.listOccurrences(id, request, currentUserId));
        } catch (RuntimeException e) {
            log.warn("查询周期计划执行记录失败: id={}, message={}", id, e.getMessage());
            return Result.error(e.getMessage());
        }
    }

    @PostMapping("/{id}/occurrences/current/complete")
    public Result completeCurrentOccurrence(@PathVariable("id") Long id,
                                            @RequestBody(required = false) RecurringPlanOccurrenceActionRequest request) {
        Long currentUserId = UserContext.getUserId();
        try {
            return Result.success(recurringPlanService.completeCurrentOccurrence(id, request, currentUserId));
        } catch (RuntimeException e) {
            log.warn("完成周期计划本期失败: id={}, message={}", id, e.getMessage());
            return Result.error(e.getMessage());
        }
    }

    @PostMapping("/{id}/occurrences/current/generate-task")
    public Result generateCurrentOccurrenceTask(@PathVariable("id") Long id) {
        Long currentUserId = UserContext.getUserId();
        try {
            return Result.success(recurringPlanService.generateCurrentOccurrenceTask(id, currentUserId));
        } catch (RuntimeException e) {
            log.warn("生成周期计划本期任务失败: id={}, message={}", id, e.getMessage());
            return Result.error(e.getMessage());
        }
    }

    @PostMapping("/{id}/occurrences/current/skip")
    public Result skipCurrentOccurrence(@PathVariable("id") Long id,
                                        @RequestBody(required = false) RecurringPlanOccurrenceActionRequest request) {
        Long currentUserId = UserContext.getUserId();
        try {
            return Result.success(recurringPlanService.skipCurrentOccurrence(id, request, currentUserId));
        } catch (RuntimeException e) {
            log.warn("跳过周期计划本期失败: id={}, message={}", id, e.getMessage());
            return Result.error(e.getMessage());
        }
    }

    @PostMapping("/{id}/occurrences/current/defer")
    public Result deferCurrentOccurrence(@PathVariable("id") Long id,
                                         @RequestBody(required = false) RecurringPlanOccurrenceActionRequest request) {
        Long currentUserId = UserContext.getUserId();
        try {
            return Result.success(recurringPlanService.deferCurrentOccurrence(id, request, currentUserId));
        } catch (RuntimeException e) {
            log.warn("延期周期计划本期失败: id={}, message={}", id, e.getMessage());
            return Result.error(e.getMessage());
        }
    }

    @DeleteMapping("/{id}")
    public Result deletePlan(@PathVariable("id") Long id) {
        Long currentUserId = UserContext.getUserId();
        try {
            recurringPlanService.deletePlan(id, currentUserId);
            return Result.success("周期计划删除成功");
        } catch (RuntimeException e) {
            log.warn("删除周期计划失败: id={}, message={}", id, e.getMessage());
            return Result.error(e.getMessage());
        }
    }
}
