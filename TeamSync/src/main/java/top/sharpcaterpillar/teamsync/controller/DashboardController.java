package top.sharpcaterpillar.teamsync.controller;

import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import top.sharpcaterpillar.teamsync.common.Result;
import top.sharpcaterpillar.teamsync.service.DashboardService;
import top.sharpcaterpillar.teamsync.utils.UserContext;
import top.sharpcaterpillar.teamsync.vo.DashboardManagementVO;
import top.sharpcaterpillar.teamsync.vo.DashboardOverviewVO;
import top.sharpcaterpillar.teamsync.vo.DashboardVO;

import java.time.LocalDate;

/**
 * 控制台工作台接口。
 */
@RestController
@RequestMapping("/api/dashboard")
public class DashboardController {

    private final DashboardService dashboardService;

    public DashboardController(DashboardService dashboardService) {
        this.dashboardService = dashboardService;
    }

    @GetMapping("/workbench")
    public Result getWorkbenchData() {
        Long userId = UserContext.getUserId();
        DashboardVO data = dashboardService.getWorkbenchData(userId);
        return Result.success(data);
    }

    @GetMapping("/overview")
    public Result getOverviewData() {
        Long userId = UserContext.getUserId();
        DashboardOverviewVO data = dashboardService.getOverviewData(userId);
        return Result.success(data);
    }

    @GetMapping("/management")
    public Result getManagementData(
            @RequestParam(value = "projectId", required = false) Long projectId,
            @RequestParam(value = "memberId", required = false) Long memberId,
            @RequestParam(value = "startDate", required = false)
            @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @RequestParam(value = "endDate", required = false)
            @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate) {
        Long userId = UserContext.getUserId();
        DashboardManagementVO data = dashboardService.getManagementData(projectId, memberId, startDate, endDate, userId);
        return Result.success(data);
    }
}
