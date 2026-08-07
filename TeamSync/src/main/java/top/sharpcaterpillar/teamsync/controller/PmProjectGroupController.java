package top.sharpcaterpillar.teamsync.controller;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.web.bind.annotation.*;
import top.sharpcaterpillar.teamsync.common.Result;
import top.sharpcaterpillar.teamsync.entity.PmProjectGroup;
import top.sharpcaterpillar.teamsync.service.PmProjectGroupService;
import top.sharpcaterpillar.teamsync.utils.UserContext;

import java.util.List;
import java.util.Map;

/**
 * 项目分组 Controller
 */
@RestController
@RequestMapping("/api/project-groups")
public class PmProjectGroupController {

    private static final org.slf4j.Logger log = org.slf4j.LoggerFactory.getLogger(PmProjectGroupController.class);

    private final PmProjectGroupService groupService;

    public PmProjectGroupController(PmProjectGroupService groupService) {
        this.groupService = groupService;
    }

    /**
     * 获取当前用户的分组列表
     * GET /api/project-groups
     *
     * @return 分组列表
     */
    @GetMapping
    public Result listGroups() {
        List<PmProjectGroup> groups = groupService.listGroups();
        return Result.success(groups);
    }

    /**
     * 创建分组
     * POST /api/project-groups
     *
     * @param body 请求体 { "name": "..." }
     * @return 创建的分组
     */
    @PostMapping
    public Result createGroup(@RequestBody Map<String, String> body) {
        Long currentUserId = UserContext.getUserId();
        String name = body.get("name");

        try {
            PmProjectGroup group = groupService.createGroup(name, currentUserId);
            return Result.success(group);
        } catch (Exception e) {
            log.warn("创建分组失败: {}", e.getMessage());
            return Result.error(e.getMessage());
        }
    }

    /**
     * 更新分组
     * PUT /api/project-groups/{id}
     *
     * @param id 分组ID
     * @param body 请求体 { "name": "..." }
     * @return 操作结果
     */
    @PutMapping("/{id}")
    public Result updateGroup(@PathVariable Long id, @RequestBody Map<String, String> body) {
        Long currentUserId = UserContext.getUserId();
        String name = body.get("name");

        try {
            groupService.updateGroup(id, name, currentUserId);
            return Result.success("分组更新成功");
        } catch (Exception e) {
            log.warn("更新分组失败: {}", e.getMessage());
            return Result.error(e.getMessage());
        }
    }

    /**
     * 更新分组排序
     * PUT /api/project-groups/{id}/sort
     *
     * @param id 分组ID
     * @param body 请求体 { "sort": 1 }
     * @return 操作结果
     */
    @PutMapping("/{id}/sort")
    public Result updateGroupSort(@PathVariable Long id, @RequestBody Map<String, Object> body) {
        Long currentUserId = UserContext.getUserId();
        Integer sort = body.get("sort") != null ? Integer.valueOf(body.get("sort").toString()) : 0;

        try {
            groupService.updateGroupSort(id, sort, currentUserId);
            return Result.success("分组排序更新成功");
        } catch (Exception e) {
            log.warn("更新分组排序失败: {}", e.getMessage());
            return Result.error(e.getMessage());
        }
    }

    /**
     * 删除分组
     * DELETE /api/project-groups/{id}
     *
     * @param id 分组ID
     * @return 操作结果
     */
    @DeleteMapping("/{id}")
    public Result deleteGroup(@PathVariable Long id) {
        Long currentUserId = UserContext.getUserId();

        try {
            groupService.deleteGroup(id, currentUserId);
            return Result.success("分组删除成功");
        } catch (Exception e) {
            log.warn("删除分组失败: {}", e.getMessage());
            return Result.error(e.getMessage());
        }
    }
}
