package top.sharpcaterpillar.teamsync.controller;

import lombok.RequiredArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.web.bind.annotation.*;
import top.sharpcaterpillar.teamsync.common.Result;
import top.sharpcaterpillar.teamsync.dto.InviteMemberRequest;
import top.sharpcaterpillar.teamsync.dto.UpdateMemberRoleRequest;
import top.sharpcaterpillar.teamsync.service.PmProjectMemberService;
import top.sharpcaterpillar.teamsync.service.ProjectPermissionService;
import top.sharpcaterpillar.teamsync.utils.UserContext;
import top.sharpcaterpillar.teamsync.vo.MemberVO;

import java.util.List;

/**
 * 项目成员管理 Controller。
 */
@RestController
@RequestMapping("/api/projects/{projectId}/members")
@RequiredArgsConstructor
public class PmProjectMemberController {

    private static final Logger log = LoggerFactory.getLogger(PmProjectMemberController.class);

    private final PmProjectMemberService memberService;
    private final ProjectPermissionService permissionService;

    /**
     * 获取项目成员列表。
     */
    @GetMapping
    public Result getMembers(@PathVariable Long projectId) {
        Long currentUserId = UserContext.getUserId();
        log.info("获取项目成员列表: projectId={}, userId={}", projectId, currentUserId);

        try {
            permissionService.checkProjectReadPermission(projectId, currentUserId);
            List<MemberVO> members = memberService.getProjectMembers(projectId, currentUserId);
            return Result.success(members);
        } catch (RuntimeException e) {
            log.warn("获取成员列表失败: {}", e.getMessage());
            return Result.error(e.getMessage());
        }
    }

    /**
     * 邀请成员加入项目。
     */
    @PostMapping
    public Result inviteMember(@PathVariable Long projectId, @RequestBody InviteMemberRequest request) {
        Long currentUserId = UserContext.getUserId();
        log.info("邀请成员: projectId={}, username={}, invitedBy={}",
                projectId, request.getUsername(), currentUserId);

        try {
            permissionService.checkMemberManagePermission(projectId, currentUserId);
            MemberVO member = memberService.inviteMember(
                    projectId,
                    request.getUsername(),
                    request.getRoleType(),
                    currentUserId
            );
            return Result.success(member);
        } catch (RuntimeException e) {
            log.warn("邀请成员失败: {}", e.getMessage());
            return Result.error(e.getMessage());
        }
    }

    /**
     * 更新成员角色。
     */
    @PutMapping("/{userId}/role")
    public Result updateMemberRole(@PathVariable Long projectId,
                                   @PathVariable Long userId,
                                   @RequestBody UpdateMemberRoleRequest request) {
        Long currentUserId = UserContext.getUserId();
        log.info("更新成员角色: projectId={}, targetUserId={}, roleType={}, operatorId={}",
                projectId, userId, request.getRoleType(), currentUserId);

        try {
            permissionService.checkMemberManagePermission(projectId, currentUserId);
            MemberVO member = memberService.updateMemberRole(projectId, userId, request.getRoleType(), currentUserId);
            return Result.success(member);
        } catch (RuntimeException e) {
            log.warn("更新成员角色失败: {}", e.getMessage());
            return Result.error(e.getMessage());
        }
    }

    /**
     * 移除项目成员。
     */
    @DeleteMapping("/{userId}")
    public Result removeMember(@PathVariable Long projectId, @PathVariable Long userId) {
        Long currentUserId = UserContext.getUserId();
        log.info("移除成员: projectId={}, targetUserId={}, removedBy={}",
                projectId, userId, currentUserId);

        try {
            permissionService.checkMemberManagePermission(projectId, currentUserId);
            if (currentUserId.equals(userId)) {
                return Result.error("不能在这里移除自己，请使用退出项目");
            }

            memberService.removeMember(projectId, userId, currentUserId);
            return Result.success("成员已移除");
        } catch (RuntimeException e) {
            log.warn("移除成员失败: {}", e.getMessage());
            return Result.error(e.getMessage());
        }
    }

    /**
     * 主动退出项目。
     */
    @DeleteMapping("/quit")
    public Result quitProject(@PathVariable Long projectId) {
        Long currentUserId = UserContext.getUserId();
        log.info("主动退出项目: projectId={}, userId={}", projectId, currentUserId);

        try {
            memberService.quitProject(projectId, currentUserId);
            return Result.success("已退出项目");
        } catch (RuntimeException e) {
            log.warn("退出项目失败: {}", e.getMessage());
            return Result.error(e.getMessage());
        }
    }
}
