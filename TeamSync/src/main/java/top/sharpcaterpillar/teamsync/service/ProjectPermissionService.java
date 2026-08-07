package top.sharpcaterpillar.teamsync.service;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import org.springframework.context.annotation.Lazy;
import org.springframework.stereotype.Service;
import top.sharpcaterpillar.teamsync.common.ProjectMemberRole;
import top.sharpcaterpillar.teamsync.entity.PmProject;
import top.sharpcaterpillar.teamsync.entity.PmProjectMember;
import top.sharpcaterpillar.teamsync.mapper.PmProjectMapper;
import top.sharpcaterpillar.teamsync.mapper.PmProjectMemberMapper;

import java.util.Objects;

/**
 * 项目权限检查服务。
 */
@Service
public class ProjectPermissionService {

    private static final org.slf4j.Logger log = org.slf4j.LoggerFactory.getLogger(ProjectPermissionService.class);

    private final PmProjectMemberMapper projectMemberMapper;
    private final PmProjectMapper projectMapper;
    private final SysUserService sysUserService;

    public ProjectPermissionService(PmProjectMemberMapper projectMemberMapper,
                                    PmProjectMapper projectMapper,
                                    @Lazy SysUserService sysUserService) {
        this.projectMemberMapper = projectMemberMapper;
        this.projectMapper = projectMapper;
        this.sysUserService = sysUserService;
    }

    public boolean isPlatformAdmin(Long userId) {
        return sysUserService.isSuperAdmin(userId);
    }

    public PmProject getProject(Long projectId) {
        if (projectId == null) {
            return null;
        }
        return projectMapper.selectById(projectId);
    }

    public PmProjectMember getProjectMember(Long projectId, Long userId) {
        if (projectId == null || userId == null) {
            return null;
        }
        LambdaQueryWrapper<PmProjectMember> query = new LambdaQueryWrapper<>();
        query.eq(PmProjectMember::getProjectId, projectId)
                .eq(PmProjectMember::getUserId, userId);
        return projectMemberMapper.selectOne(query);
    }

    public Integer getMemberRoleType(Long projectId, Long userId) {
        PmProjectMember member = getProjectMember(projectId, userId);
        return member == null ? null : ProjectMemberRole.normalize(member.getRoleType());
    }

    public boolean isProjectOwner(Long projectId, Long userId) {
        if (projectId == null || userId == null) {
            return false;
        }
        PmProject project = projectMapper.selectById(projectId);
        return project != null && Objects.equals(project.getOwnerId(), userId);
    }

    /**
     * 检查用户是否是项目成员。
     */
    public boolean isMember(Long projectId, Long userId) {
        if (projectId == null || userId == null) {
            return false;
        }

        if (isPlatformAdmin(userId) || isProjectOwner(projectId, userId)) {
            return true;
        }

        return getProjectMember(projectId, userId) != null;
    }

    /**
     * 检查用户是否具备项目管理权限。
     */
    public boolean isAdmin(Long projectId, Long userId) {
        if (projectId == null || userId == null) {
            return false;
        }

        if (isPlatformAdmin(userId) || isProjectOwner(projectId, userId)) {
            return true;
        }

        Integer roleType = getMemberRoleType(projectId, userId);
        return ProjectMemberRole.canManageProject(roleType);
    }

    public boolean isProjectMemberManager(Long projectId, Long userId) {
        return isAdmin(projectId, userId);
    }

    /**
     * 检查项目读取权限。
     */
    public void checkProjectReadPermission(Long projectId, Long userId) {
        ensureProjectExists(projectId);
        if (!isMember(projectId, userId)) {
            deny(projectId, userId, "无权访问该项目");
        }
    }

    /**
     * 检查看板与任务读取权限。
     */
    public void checkTaskReadPermission(Long projectId, Long userId) {
        checkProjectReadPermission(projectId, userId);
    }

    /**
     * 检查任务写入权限。
     */
    public void checkTaskWritePermission(Long projectId, Long userId) {
        PmProject project = ensureProjectExists(projectId);
        if (isPlatformAdmin(userId) || Objects.equals(project.getOwnerId(), userId)) {
            return;
        }

        PmProjectMember member = requireMember(projectId, userId);
        if (!ProjectMemberRole.canManageTasks(member.getRoleType())) {
            deny(projectId, userId, "当前角色仅可查看任务，不能修改任务");
        }
    }

    /**
     * 检查看板列表管理权限。
     */
    public void checkStageManagePermission(Long projectId, Long userId) {
        PmProject project = ensureProjectExists(projectId);
        if (isPlatformAdmin(userId) || Objects.equals(project.getOwnerId(), userId)) {
            return;
        }

        PmProjectMember member = requireMember(projectId, userId);
        if (!ProjectMemberRole.canManageStages(member.getRoleType())) {
            deny(projectId, userId, "当前角色不能管理列表结构");
        }
    }

    /**
     * 检查文件读取权限。
     */
    public void checkFileReadPermission(Long projectId, Long userId) {
        PmProject project = ensureProjectExists(projectId);
        if (isPlatformAdmin(userId) || Objects.equals(project.getOwnerId(), userId)) {
            return;
        }

        PmProjectMember member = requireMember(projectId, userId);
        if (!ProjectMemberRole.canReadFiles(member.getRoleType())) {
            deny(projectId, userId, "当前角色不能访问项目文档");
        }
    }

    /**
     * 检查文件管理权限。
     */
    public void checkFileManagePermission(Long projectId, Long userId) {
        PmProject project = ensureProjectExists(projectId);
        if (isPlatformAdmin(userId) || Objects.equals(project.getOwnerId(), userId)) {
            return;
        }

        PmProjectMember member = requireMember(projectId, userId);
        if (!ProjectMemberRole.canManageFiles(member.getRoleType())) {
            deny(projectId, userId, "当前角色不能修改项目文档");
        }
    }

    /**
     * 检查成员管理权限。
     */
    public void checkMemberManagePermission(Long projectId, Long userId) {
        PmProject project = ensureProjectExists(projectId);
        if (isPlatformAdmin(userId) || Objects.equals(project.getOwnerId(), userId)) {
            return;
        }

        PmProjectMember member = requireMember(projectId, userId);
        if (!ProjectMemberRole.canManageMembers(member.getRoleType())) {
            deny(projectId, userId, "当前角色不能管理项目成员");
        }
    }

    /**
     * 检查项目设置管理权限。
     */
    public void checkProjectManagePermission(Long projectId, Long userId) {
        checkMemberManagePermission(projectId, userId);
    }

    /**
     * 兼容旧调用：项目读取权限。
     */
    public void checkMemberPermission(Long projectId, Long userId) {
        checkProjectReadPermission(projectId, userId);
    }

    /**
     * 兼容旧调用：成员管理权限。
     */
    public void checkAdminPermission(Long projectId, Long userId) {
        checkMemberManagePermission(projectId, userId);
    }

    private PmProject ensureProjectExists(Long projectId) {
        PmProject project = projectMapper.selectById(projectId);
        if (project == null) {
            throw new RuntimeException("项目不存在");
        }
        return project;
    }

    private PmProjectMember requireMember(Long projectId, Long userId) {
        PmProjectMember member = getProjectMember(projectId, userId);
        if (member == null) {
            deny(projectId, userId, "无权访问该项目");
        }
        return member;
    }

    private void deny(Long projectId, Long userId, String message) {
        log.warn("权限拒绝: userId={}, projectId={}, reason={}", userId, projectId, message);
        throw new RuntimeException(message);
    }
}
