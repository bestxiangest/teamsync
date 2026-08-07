package top.sharpcaterpillar.teamsync.controller;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import top.sharpcaterpillar.teamsync.common.Result;
import top.sharpcaterpillar.teamsync.service.BigScreenService;

/**
 * 公司中心显示器大屏公开接口。
 */
@RestController
@RequestMapping("/api/big-screen")
public class BigScreenController {

    private final BigScreenService bigScreenService;

    public BigScreenController(BigScreenService bigScreenService) {
        this.bigScreenService = bigScreenService;
    }

    @GetMapping("/task-reminder")
    public Result getTaskReminderScreenData() {
        return Result.success(bigScreenService.getTaskReminderScreenData());
    }
}
