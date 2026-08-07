package top.sharpcaterpillar.teamsync.service.impl;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.core.conditions.update.LambdaUpdateWrapper;
import com.baomidou.mybatisplus.extension.service.impl.ServiceImpl;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import top.sharpcaterpillar.teamsync.entity.PmProject;
import top.sharpcaterpillar.teamsync.entity.PmProjectGroup;
import top.sharpcaterpillar.teamsync.entity.PmProjectMember;
import top.sharpcaterpillar.teamsync.mapper.PmProjectGroupMapper;
import top.sharpcaterpillar.teamsync.mapper.PmProjectMapper;
import top.sharpcaterpillar.teamsync.mapper.PmProjectMemberMapper;
import top.sharpcaterpillar.teamsync.service.PmProjectGroupService;
import top.sharpcaterpillar.teamsync.service.SysUserService;

import java.time.LocalDateTime;
import java.util.List;

/**
 * 项目分组 Service 实现类
 */
@Service
public class PmProjectGroupServiceImpl extends ServiceImpl<PmProjectGroupMapper, PmProjectGroup>
        implements PmProjectGroupService {

    private static final org.slf4j.Logger log = org.slf4j.LoggerFactory.getLogger(PmProjectGroupServiceImpl.class);

    private final PmProjectMapper pmProjectMapper;
    private final PmProjectMemberMapper pmProjectMemberMapper;
    private final SysUserService sysUserService;

    public PmProjectGroupServiceImpl(PmProjectMapper pmProjectMapper,
                                     PmProjectMemberMapper pmProjectMemberMapper,
                                     SysUserService sysUserService) {
        this.pmProjectMapper = pmProjectMapper;
        this.pmProjectMemberMapper = pmProjectMemberMapper;
        this.sysUserService = sysUserService;
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public PmProjectGroup createGroup(String name, Long userId) {
        if (name == null || name.trim().isEmpty()) {
            throw new RuntimeException("分组名称不能为空");
        }

        PmProjectGroup group = new PmProjectGroup();
        group.setName(name.trim());
        group.setOwnerId(userId);
        group.setCreatedAt(LocalDateTime.now());
        group.setSort(0);

        this.save(group);
        log.info("创建项目分组: name={}, ownerId={}", name, userId);
        return group;
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public void updateGroup(Long id, String name, Long userId) {
        PmProjectGroup group = this.getById(id);
        if (group == null) {
            throw new RuntimeException("分组不存在");
        }
        if (!group.getOwnerId().equals(userId) && !sysUserService.isSuperAdmin(userId)) {
            throw new RuntimeException("只有分组创建者或平台管理员可以编辑分组");
        }
        if (name == null || name.trim().isEmpty()) {
            throw new RuntimeException("分组名称不能为空");
        }
        group.setName(name.trim());
        this.updateById(group);
        log.info("更新项目分组: id={}, name={}, operatorId={}", id, name, userId);
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public void updateGroupSort(Long id, Integer sort, Long userId) {
        PmProjectGroup group = this.getById(id);
        if (group == null) {
            throw new RuntimeException("分组不存在");
        }
        if (!group.getOwnerId().equals(userId) && !sysUserService.isSuperAdmin(userId)) {
            throw new RuntimeException("只有分组创建者或平台管理员可以调整分组排序");
        }
        group.setSort(sort != null ? sort : 0);
        this.updateById(group);
        log.info("更新项目分组排序: id={}, sort={}, operatorId={}", id, sort, userId);
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public void deleteGroup(Long id, Long userId) {
        PmProjectGroup group = this.getById(id);
        if (group == null) {
            throw new RuntimeException("分组不存在");
        }

        if (!group.getOwnerId().equals(userId) && !sysUserService.isSuperAdmin(userId)) {
            throw new RuntimeException("只有分组创建者或平台管理员可以删除分组");
        }

        LambdaUpdateWrapper<PmProject> updateProjectWrapper = new LambdaUpdateWrapper<>();
        updateProjectWrapper.eq(PmProject::getGroupId, id)
                .set(PmProject::getGroupId, 0L);
        pmProjectMapper.update(null, updateProjectWrapper);

        LambdaUpdateWrapper<PmProjectMember> updateMemberWrapper = new LambdaUpdateWrapper<>();
        updateMemberWrapper.eq(PmProjectMember::getCustomGroupId, id)
                .set(PmProjectMember::getCustomGroupId, 0L);
        pmProjectMemberMapper.update(null, updateMemberWrapper);

        this.removeById(id);
        log.info("删除项目分组: id={}, operatorId={}", id, userId);
    }

    @Override
    public List<PmProjectGroup> listGroups() {
        LambdaQueryWrapper<PmProjectGroup> query = new LambdaQueryWrapper<>();
        query.orderByAsc(PmProjectGroup::getSort)
             .orderByDesc(PmProjectGroup::getCreatedAt);
        return this.list(query);
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public void moveProject(Long projectId, Long targetGroupId, Long userId) {
        PmProject project = pmProjectMapper.selectById(projectId);
        if (project == null) {
            throw new RuntimeException("项目不存在");
        }

        if (!sysUserService.isSuperAdmin(userId)) {
            LambdaQueryWrapper<PmProjectMember> memberQuery = new LambdaQueryWrapper<>();
            memberQuery.eq(PmProjectMember::getProjectId, projectId)
                    .eq(PmProjectMember::getUserId, userId);
            if (pmProjectMemberMapper.selectCount(memberQuery) == 0) {
                throw new RuntimeException("无权限移动此项目，您不是项目成员");
            }
        }

        if (targetGroupId != null && targetGroupId > 0) {
            PmProjectGroup group = this.getById(targetGroupId);
            if (group == null) {
                throw new RuntimeException("目标分组不存在");
            }
        }

        Long finalTargetGroupId = targetGroupId == null ? 0L : targetGroupId;
        project.setGroupId(finalTargetGroupId);
        pmProjectMapper.updateById(project);

        LambdaUpdateWrapper<PmProjectMember> updateWrapper = new LambdaUpdateWrapper<>();
        updateWrapper.eq(PmProjectMember::getProjectId, projectId)
                .set(PmProjectMember::getCustomGroupId, finalTargetGroupId);
        pmProjectMemberMapper.update(null, updateWrapper);

        log.info("移动项目分组: projectId={}, targetGroupId={}, operatorId={}", projectId, finalTargetGroupId, userId);
    }
}
