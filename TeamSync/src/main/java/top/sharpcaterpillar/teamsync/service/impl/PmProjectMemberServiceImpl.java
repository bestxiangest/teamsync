package top.sharpcaterpillar.teamsync.service.impl;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.core.conditions.update.LambdaUpdateWrapper;
import com.baomidou.mybatisplus.extension.service.impl.ServiceImpl;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import top.sharpcaterpillar.teamsync.common.ProjectMemberRole;
import top.sharpcaterpillar.teamsync.entity.PmProject;
import top.sharpcaterpillar.teamsync.entity.PmProjectMember;
import top.sharpcaterpillar.teamsync.entity.SysUser;
import top.sharpcaterpillar.teamsync.mapper.PmProjectMapper;
import top.sharpcaterpillar.teamsync.mapper.PmProjectMemberMapper;
import top.sharpcaterpillar.teamsync.mapper.SysUserMapper;
import top.sharpcaterpillar.teamsync.service.PmProjectMemberService;
import top.sharpcaterpillar.teamsync.service.ProjectPermissionService;
import top.sharpcaterpillar.teamsync.service.SysNotificationService;
import top.sharpcaterpillar.teamsync.vo.MemberVO;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Objects;
import java.util.stream.Collectors;

/**
 * 项目成员 Service 实现类。
 */
@Service
public class PmProjectMemberServiceImpl extends ServiceImpl<PmProjectMemberMapper, PmProjectMember>
        implements PmProjectMemberService {

    private static final org.slf4j.Logger log = org.slf4j.LoggerFactory.getLogger(PmProjectMemberServiceImpl.class);

    private final SysUserMapper userMapper;
    private final PmProjectMapper pmProjectMapper;
    private final ProjectPermissionService permissionService;
    private final SysNotificationService notificationService;

    public PmProjectMemberServiceImpl(SysUserMapper userMapper,
                                      PmProjectMapper pmProjectMapper,
                                      ProjectPermissionService permissionService,
                                      SysNotificationService notificationService) {
        this.userMapper = userMapper;
        this.pmProjectMapper = pmProjectMapper;
        this.permissionService = permissionService;
        this.notificationService = notificationService;
    }

    @Override
    public List<MemberVO> getProjectMembers(Long projectId, Long currentUserId) {
        PmProject project = pmProjectMapper.selectById(projectId);
        if (project == null) {
            throw new RuntimeException("项目不存在");
        }

        LambdaQueryWrapper<PmProjectMember> query = new LambdaQueryWrapper<>();
        query.eq(PmProjectMember::getProjectId, projectId);
        List<PmProjectMember> members = this.list(query);

        members.sort(Comparator
                .comparingInt((PmProjectMember member) ->
                        ProjectMemberRole.sortWeight(isProjectOwner(project, member.getUserId()), member.getRoleType()))
                .thenComparing(PmProjectMember::getJoinedAt, Comparator.nullsLast(LocalDateTime::compareTo)));

        Map<Long, SysUser> userMap = new HashMap<>();
        List<Long> userIds = members.stream()
                .map(PmProjectMember::getUserId)
                .distinct()
                .collect(Collectors.toList());
        if (!userIds.isEmpty()) {
            List<SysUser> users = userMapper.selectBatchIds(userIds);
            userMap = users.stream().collect(Collectors.toMap(SysUser::getId, user -> user));
        }

        List<MemberVO> result = new ArrayList<>();
        for (PmProjectMember member : members) {
            result.add(toMemberVO(project, member, userMap.get(member.getUserId()), currentUserId));
        }
        return result;
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public MemberVO inviteMember(Long projectId, String username, Integer roleType, Long operatorId) {
        if (username == null || username.trim().isEmpty()) {
            throw new RuntimeException("用户名不能为空");
        }

        PmProject project = pmProjectMapper.selectById(projectId);
        if (project == null) {
            throw new RuntimeException("项目不存在");
        }

        LambdaQueryWrapper<SysUser> userQuery = new LambdaQueryWrapper<>();
        userQuery.eq(SysUser::getUsername, username.trim());
        SysUser user = userMapper.selectOne(userQuery);
        if (user == null) {
            throw new RuntimeException("用户 \"" + username + "\" 不存在");
        }

        LambdaQueryWrapper<PmProjectMember> memberQuery = new LambdaQueryWrapper<>();
        memberQuery.eq(PmProjectMember::getProjectId, projectId)
                .eq(PmProjectMember::getUserId, user.getId());
        if (this.getOne(memberQuery) != null) {
            throw new RuntimeException("该用户已经是项目成员");
        }

        int targetRoleType = resolveTargetRoleType(project, operatorId, roleType);

        PmProjectMember member = new PmProjectMember();
        member.setProjectId(projectId);
        member.setUserId(user.getId());
        member.setRoleType(targetRoleType);
        member.setCustomGroupId(project.getGroupId() != null ? project.getGroupId() : 0L);
        member.setJoinedAt(LocalDateTime.now());
        this.save(member);

        log.info("成员邀请成功: projectId={}, userId={}, username={}, roleType={}",
                projectId, user.getId(), username, targetRoleType);
        notificationService.notifyProjectMemberJoined(project, user.getId(), operatorId);

        return toMemberVO(project, member, user, operatorId);
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public MemberVO updateMemberRole(Long projectId, Long userId, Integer roleType, Long operatorId) {
        if (!ProjectMemberRole.isValid(roleType)) {
            throw new RuntimeException("角色类型不合法");
        }

        PmProject project = pmProjectMapper.selectById(projectId);
        if (project == null) {
            throw new RuntimeException("项目不存在");
        }

        PmProjectMember member = getMemberOrThrow(projectId, userId);
        SysUser targetUser = userMapper.selectById(userId);
        if (targetUser == null) {
            throw new RuntimeException("目标用户不存在");
        }

        if (Objects.equals(operatorId, userId)) {
            throw new RuntimeException("不能修改自己的项目角色");
        }

        if (isProjectOwner(project, userId)) {
            throw new RuntimeException("项目拥有者角色不可修改");
        }

        if (!canManageTarget(project, operatorId, member, targetUser)) {
            throw new RuntimeException("您不能调整该成员的角色");
        }

        if (roleType == ProjectMemberRole.ADMIN && !canAssignAdmin(project, operatorId)) {
            throw new RuntimeException("只有项目拥有者或平台管理员可以设置项目管理员");
        }

        LambdaUpdateWrapper<PmProjectMember> updateWrapper = new LambdaUpdateWrapper<>();
        updateWrapper.eq(PmProjectMember::getProjectId, projectId)
                .eq(PmProjectMember::getUserId, userId)
                .set(PmProjectMember::getRoleType, roleType);
        this.update(updateWrapper);
        member.setRoleType(roleType);

        log.info("成员角色更新成功: projectId={}, targetUserId={}, roleType={}, operatorId={}",
                projectId, userId, roleType, operatorId);
        notificationService.notifyProjectMemberRoleUpdated(
                project,
                userId,
                operatorId,
                ProjectMemberRole.toRoleLabel(false, roleType)
        );

        return toMemberVO(project, member, targetUser, operatorId);
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public void removeMember(Long projectId, Long userId, Long operatorId) {
        PmProject project = pmProjectMapper.selectById(projectId);
        if (project == null) {
            throw new RuntimeException("项目不存在");
        }

        if (Objects.equals(operatorId, userId)) {
            throw new RuntimeException("不能在这里移除自己，请使用退出项目");
        }

        if (isProjectOwner(project, userId)) {
            throw new RuntimeException("无法移除项目拥有者");
        }

        PmProjectMember member = getMemberOrThrow(projectId, userId);
        SysUser targetUser = userMapper.selectById(userId);
        if (targetUser == null) {
            throw new RuntimeException("目标用户不存在");
        }

        if (!canManageTarget(project, operatorId, member, targetUser)) {
            throw new RuntimeException("您不能移除此成员");
        }

        LambdaQueryWrapper<PmProjectMember> query = new LambdaQueryWrapper<>();
        query.eq(PmProjectMember::getProjectId, projectId)
                .eq(PmProjectMember::getUserId, userId);
        this.remove(query);
        log.info("成员移除成功: projectId={}, targetUserId={}, operatorId={}", projectId, userId, operatorId);
        notificationService.notifyProjectMemberRemoved(project, userId, operatorId);
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public void quitProject(Long projectId, Long userId) {
        PmProject project = pmProjectMapper.selectById(projectId);
        if (project == null) {
            throw new RuntimeException("项目不存在");
        }

        if (isProjectOwner(project, userId)) {
            throw new RuntimeException("项目拥有者无法退出项目，请先转移项目或删除项目");
        }

        LambdaQueryWrapper<PmProjectMember> query = new LambdaQueryWrapper<>();
        query.eq(PmProjectMember::getProjectId, projectId)
                .eq(PmProjectMember::getUserId, userId);
        if (this.getOne(query) == null) {
            throw new RuntimeException("您不是该项目成员");
        }

        this.remove(query);
        log.info("用户主动退出项目: projectId={}, userId={}", projectId, userId);
        notificationService.notifyProjectMemberQuit(project, project.getOwnerId(), userId);
    }

    private MemberVO toMemberVO(PmProject project, PmProjectMember member, SysUser user, Long operatorId) {
        boolean projectOwner = isProjectOwner(project, member.getUserId());
        boolean platformAdmin = user != null && Boolean.TRUE.equals(user.getIsAdmin());

        MemberVO vo = new MemberVO();
        vo.setUserId(member.getUserId());
        vo.setUsername(user != null ? user.getUsername() : "");
        vo.setNickname(user != null ? user.getNickname() : "");
        vo.setAvatar(user != null ? user.getAvatar() : "");
        vo.setRole(ProjectMemberRole.toRoleCode(projectOwner, member.getRoleType()));
        vo.setRoleType(ProjectMemberRole.normalize(member.getRoleType()));
        vo.setRoleLabel(ProjectMemberRole.toRoleLabel(projectOwner, member.getRoleType()));
        vo.setProjectOwner(projectOwner);
        vo.setPlatformAdmin(platformAdmin);
        vo.setCanEditRole(canManageTarget(project, operatorId, member, platformAdmin));
        vo.setCanRemove(canManageTarget(project, operatorId, member, platformAdmin));
        vo.setJoinedAt(member.getJoinedAt());
        return vo;
    }

    private int resolveTargetRoleType(PmProject project, Long operatorId, Integer roleType) {
        int targetRoleType = ProjectMemberRole.normalize(roleType);
        if (targetRoleType == ProjectMemberRole.ADMIN && !canAssignAdmin(project, operatorId)) {
            throw new RuntimeException("只有项目拥有者或平台管理员可以邀请为项目管理员");
        }
        return targetRoleType;
    }

    private boolean canAssignAdmin(PmProject project, Long operatorId) {
        return permissionService.isPlatformAdmin(operatorId)
                || (project.getOwnerId() != null && project.getOwnerId().equals(operatorId));
    }

    private boolean canManageTarget(PmProject project,
                                    Long operatorId,
                                    PmProjectMember targetMember,
                                    SysUser targetUser) {
        return canManageTarget(project, operatorId, targetMember,
                targetUser != null && Boolean.TRUE.equals(targetUser.getIsAdmin()));
    }

    private boolean canManageTarget(PmProject project,
                                    Long operatorId,
                                    PmProjectMember targetMember,
                                    boolean targetPlatformAdmin) {
        if (operatorId == null || targetMember == null || Objects.equals(operatorId, targetMember.getUserId())) {
            return false;
        }

        if (isProjectOwner(project, targetMember.getUserId())) {
            return false;
        }

        if (permissionService.isPlatformAdmin(operatorId)) {
            return true;
        }

        if (targetPlatformAdmin) {
            return false;
        }

        if (isProjectOwner(project, operatorId)) {
            return true;
        }

        Integer operatorRoleType = permissionService.getMemberRoleType(project.getId(), operatorId);
        if (operatorRoleType == null || ProjectMemberRole.normalize(operatorRoleType) != ProjectMemberRole.ADMIN) {
            return false;
        }

        return ProjectMemberRole.normalize(targetMember.getRoleType()) != ProjectMemberRole.ADMIN;
    }

    private PmProjectMember getMemberOrThrow(Long projectId, Long userId) {
        LambdaQueryWrapper<PmProjectMember> query = new LambdaQueryWrapper<>();
        query.eq(PmProjectMember::getProjectId, projectId)
                .eq(PmProjectMember::getUserId, userId);
        PmProjectMember member = this.getOne(query);
        if (member == null) {
            throw new RuntimeException("该用户不是项目成员");
        }
        return member;
    }

    private boolean isProjectOwner(PmProject project, Long userId) {
        return project.getOwnerId() != null && project.getOwnerId().equals(userId);
    }
}
