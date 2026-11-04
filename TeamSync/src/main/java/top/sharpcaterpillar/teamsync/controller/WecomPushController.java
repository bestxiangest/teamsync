package top.sharpcaterpillar.teamsync.controller;

import org.springframework.dao.DataAccessException;
import org.springframework.web.bind.annotation.*;
import top.sharpcaterpillar.teamsync.common.Result;
import top.sharpcaterpillar.teamsync.service.wecom.WecomModels.*;
import top.sharpcaterpillar.teamsync.service.wecom.WecomPushService;

import java.util.function.Supplier;

@RestController
@RequestMapping("/api/system/wecom-push")
public class WecomPushController {
    private final WecomPushService service;

    public WecomPushController(WecomPushService service) { this.service = service; }

    @GetMapping("/settings")
    public Result settings() { return execute(service::settings); }

    @PutMapping("/settings")
    public Result save(@RequestBody SettingsRequest request) { return execute(() -> service.save(request)); }

    @GetMapping("/projects")
    public Result projects() { return execute(service::projects); }

    @GetMapping("/preview/{type}")
    public Result preview(@PathVariable ReportType type) { return execute(() -> service.preview(type)); }

    @PostMapping("/send/{type}")
    public Result send(@PathVariable ReportType type) { return execute(() -> service.manualPush(type)); }

    @GetMapping("/jobs")
    public Result jobs() { return execute(service::jobs); }

    private Result execute(Supplier<?> action) {
        try {
            service.requireAdmin();
            return Result.success(action.get());
        } catch (DataAccessException e) {
            return Result.error("推送数据访问失败，请确认已执行 doc/sql/wecom_push.sql 且数据库连接正常");
        } catch (IllegalArgumentException | IllegalStateException e) {
            return Result.error(e.getMessage());
        } catch (Exception e) {
            return Result.error("企业微信推送操作失败，请查看服务端运行状态");
        }
    }
}
