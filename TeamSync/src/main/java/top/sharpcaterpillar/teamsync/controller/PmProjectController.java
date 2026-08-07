package top.sharpcaterpillar.teamsync.controller;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.web.bind.annotation.*;
import top.sharpcaterpillar.teamsync.common.Result;
import top.sharpcaterpillar.teamsync.dto.ProjectCreateRequest;
import top.sharpcaterpillar.teamsync.dto.ProjectUpdateRequest;
import top.sharpcaterpillar.teamsync.entity.PmProject;
import top.sharpcaterpillar.teamsync.service.PmProjectGroupService;
import top.sharpcaterpillar.teamsync.service.PmProjectService;
import top.sharpcaterpillar.teamsync.service.ProjectPermissionService;
import top.sharpcaterpillar.teamsync.utils.UserContext;

import java.util.List;
import java.util.Map;

/**
 * 项目管理 Controller
 */
@RestController
@RequestMapping("/api/projects")
public class PmProjectController {

    private static final org.slf4j.Logger log = org.slf4j.LoggerFactory.getLogger(PmProjectController.class);

    private final PmProjectService pmProjectService;
    private final PmProjectGroupService pmProjectGroupService;
    private final ProjectPermissionService permissionService;

    public PmProjectController(PmProjectService pmProjectService,
                               PmProjectGroupService pmProjectGroupService,
                               ProjectPermissionService permissionService) {
        this.pmProjectService = pmProjectService;
        this.pmProjectGroupService = pmProjectGroupService;
        this.permissionService = permissionService;
    }

    /**
     * 获取项目列表
     * GET /api/projects
     *
     * @param archived 是否查询归档项目（true: 已归档, false/null: 活跃项目）
     * @param groupId 分组ID (null: 不筛选/全部, 0: 根目录)
     *                注意：如果前端不传groupId，通常意味着获取根目录下的项目+分组，或者获取所有平铺项目。
     *                为了兼容旧逻辑和新逻辑：
     *                - 如果不传 groupId: 保持原逻辑（获取所有项目，不区分层级），前端自行处理？
     *                - 不，前端需要根据层级展示。
     *                - 建议：groupId 参数可选。
     *                - 如果不传，则返回所有。
     *                - 如果传 0，返回根目录下项目。
     *                - 如果传 >0，返回该组项目。
     * @return 用户参与的所有项目
     */
    @GetMapping
    public Result listProjects(@RequestParam(required = false, defaultValue = "false") Boolean archived,
                               @RequestParam(required = false) Long groupId) {
        // 从 ThreadLocal 获取当前登录用户ID
        Long currentUserId = UserContext.getUserId();
        log.info("获取项目列表: userId={}, archived={}, groupId={}", currentUserId, archived, groupId);

        List<PmProject> projects = pmProjectService.listProjectsByUserId(currentUserId, archived, groupId);
        return Result.success(projects);
    }

    /**
     * 移动项目到分组
     * PUT /api/projects/{id}/move
     *
     * @param id 项目ID
     * @param body 请求体 { "targetGroupId": 1 } (0 代表移出到根目录)
     * @return 操作结果
     */
    @PutMapping("/{id}/move")
    public Result moveProject(@PathVariable Long id, @RequestBody Map<String, Long> body) {
        Long currentUserId = UserContext.getUserId();
        Long targetGroupId = body.get("targetGroupId");
        
        try {
            pmProjectGroupService.moveProject(id, targetGroupId, currentUserId);
            return Result.success("移动成功");
        } catch (Exception e) {
            log.warn("移动项目失败: {}", e.getMessage());
            return Result.error(e.getMessage());
        }
    }

    /**
     * 创建新项目
     * POST /api/projects
     *
     * @param request 创建项目请求
     * @return 创建的项目信息
     */
    @PostMapping
    public Result createProject(@RequestBody ProjectCreateRequest request) {
        // 参数校验
        if (request.getName() == null || request.getName().trim().isEmpty()) {
            return Result.error("项目名称不能为空");
        }

        // 从 ThreadLocal 获取当前登录用户ID
        Long currentUserId = UserContext.getUserId();
        log.info("创建项目: name={}, userId={}, groupId={}", request.getName(), currentUserId, request.getGroupId());

        try {
            PmProject project = pmProjectService.createProject(request, currentUserId);
            return Result.success(project);
        } catch (Exception e) {
            log.error("创建项目失败: {}", e.getMessage());
            return Result.error("创建项目失败: " + e.getMessage());
        }
    }

    /**
     * 更新项目信息
     * PUT /api/projects/{id}
     *
     * @param id      项目ID
     * @param request 更新请求
     * @return 更新后的项目信息
     */
    @PutMapping("/{id}")
    public Result updateProject(@PathVariable Long id, @RequestBody ProjectUpdateRequest request) {
        Long currentUserId = UserContext.getUserId();
        log.info("更新项目: id={}, userId={}, request={}", id, currentUserId, request);

        try {
            PmProject project = pmProjectService.updateProject(id, request, currentUserId);
            return Result.success(project);
        } catch (Exception e) {
            log.error("更新项目失败: {}", e.getMessage());
            return Result.error("更新项目失败: " + e.getMessage());
        }
    }

    /**
     * 获取单个项目详情
     * GET /api/projects/{id}
     *
     * @param id 项目ID
     * @return 项目详情
     */
    @GetMapping("/{id}")
    public Result getProject(@PathVariable Long id) {
        Long currentUserId = UserContext.getUserId();
        log.info("获取项目详情: id={}, userId={}", id, currentUserId);

        try {
            permissionService.checkProjectReadPermission(id, currentUserId);
            PmProject project = pmProjectService.getProjectWithCalculatedProgress(id);
            if (project == null) {
                return Result.error("项目不存在");
            }
            return Result.success(project);
        } catch (RuntimeException e) {
            log.warn("获取项目详情失败: {}", e.getMessage());
            return Result.error(e.getMessage());
        }
    }

    /**
     * 删除项目（逻辑删除）
     * DELETE /api/projects/{id}
     *
     * @param id 项目ID
     * @return 操作结果
     */
    @DeleteMapping("/{id}")
    public Result deleteProject(@PathVariable Long id) {
        Long userId = UserContext.getUserId();
        log.info("删除项目: id={}, userId={}", id, userId);

        try {
            pmProjectService.deleteProject(id, userId);
            return Result.success("项目删除成功");
        } catch (Exception e) {
            log.error("删除项目失败: {}", e.getMessage());
            return Result.error("删除项目失败: " + e.getMessage());
        }
    }

    /**
     * 归档项目
     * PUT /api/projects/{id}/archive
     *
     * @param id 项目ID
     * @return 操作结果
     */
    @PutMapping("/{id}/archive")
    public Result archiveProject(@PathVariable Long id) {
        Long currentUserId = UserContext.getUserId();
        log.info("归档项目: id={}, userId={}", id, currentUserId);

        try {
            pmProjectService.archiveProject(id, currentUserId);
            return Result.success("项目已归档");
        } catch (Exception e) {
            log.error("归档项目失败: {}", e.getMessage());
            return Result.error(e.getMessage());
        }
    }

    /**
     * 取消归档项目（还原）
     * PUT /api/projects/{id}/unarchive
     *
     * @param id 项目ID
     * @return 操作结果
     */
    @PutMapping("/{id}/unarchive")
    public Result unarchiveProject(@PathVariable Long id) {
        Long currentUserId = UserContext.getUserId();
        log.info("取消归档项目: id={}, userId={}", id, currentUserId);

        try {
            pmProjectService.unarchiveProject(id, currentUserId);
            return Result.success("项目已还原");
        } catch (Exception e) {
            log.error("取消归档项目失败: {}", e.getMessage());
            return Result.error(e.getMessage());
        }
    }

}
