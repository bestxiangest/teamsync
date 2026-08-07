package top.sharpcaterpillar.teamsync.service.impl;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.core.conditions.update.LambdaUpdateWrapper;
import com.baomidou.mybatisplus.extension.service.impl.ServiceImpl;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import top.sharpcaterpillar.teamsync.common.ProjectMemberRole;
import top.sharpcaterpillar.teamsync.dto.ProjectCreateRequest;
import top.sharpcaterpillar.teamsync.dto.ProjectUpdateRequest;
import top.sharpcaterpillar.teamsync.entity.PmFileNode;
import top.sharpcaterpillar.teamsync.entity.PmProject;
import top.sharpcaterpillar.teamsync.entity.PmProjectMember;
import top.sharpcaterpillar.teamsync.entity.PmSubTask;
import top.sharpcaterpillar.teamsync.entity.PmTask;
import top.sharpcaterpillar.teamsync.entity.PmTaskStage;
import top.sharpcaterpillar.teamsync.mapper.PmFileNodeMapper;
import top.sharpcaterpillar.teamsync.mapper.PmProjectMapper;
import top.sharpcaterpillar.teamsync.mapper.PmProjectMemberMapper;
import top.sharpcaterpillar.teamsync.mapper.PmSubTaskMapper;
import top.sharpcaterpillar.teamsync.mapper.PmTaskMapper;
import top.sharpcaterpillar.teamsync.mapper.PmTaskStageMapper;
import top.sharpcaterpillar.teamsync.service.PmProjectService;
import top.sharpcaterpillar.teamsync.service.ProjectPermissionService;
import top.sharpcaterpillar.teamsync.service.SysUserService;

import java.time.LocalDateTime;
import java.util.Arrays;
import java.util.Collections;
import java.util.HashMap;
import java.util.HashSet;
import java.util.List;
import java.util.Map;
import java.util.Objects;
import java.util.Set;

/**
 * 项目管理 Service 实现类
 */
@Service
public class PmProjectServiceImpl extends ServiceImpl<PmProjectMapper, PmProject> implements PmProjectService {

    private static final org.slf4j.Logger log = org.slf4j.LoggerFactory.getLogger(PmProjectServiceImpl.class);
    private static final List<String> DONE_STAGE_KEYWORDS = Arrays.asList("完成", "Done", "done", "DONE", "已完成");

    private final PmProjectMemberMapper projectMemberMapper;
    private final PmTaskStageMapper taskStageMapper;
    private final PmTaskMapper taskMapper;
    private final PmSubTaskMapper subTaskMapper;
    private final PmFileNodeMapper fileNodeMapper;
    private final SysUserService sysUserService;
    private final ProjectPermissionService permissionService;

    public PmProjectServiceImpl(PmProjectMemberMapper projectMemberMapper,
                                PmTaskStageMapper taskStageMapper,
                                PmTaskMapper taskMapper,
                                PmSubTaskMapper subTaskMapper,
                                PmFileNodeMapper fileNodeMapper,
                                SysUserService sysUserService,
                                ProjectPermissionService permissionService) {
        this.projectMemberMapper = projectMemberMapper;
        this.taskStageMapper = taskStageMapper;
        this.taskMapper = taskMapper;
        this.subTaskMapper = subTaskMapper;
        this.fileNodeMapper = fileNodeMapper;
        this.sysUserService = sysUserService;
        this.permissionService = permissionService;
    }

    /**
     * 默认看板阶段名称
     */
    private static final List<String> DEFAULT_STAGES = Arrays.asList("待办", "进行中", "已完成");

    @Override
    @Transactional(rollbackFor = Exception.class)
    public PmProject createProject(ProjectCreateRequest request, Long userId) {
        // 1. 创建项目
        PmProject project = new PmProject();
        project.setName(request.getName());
        project.setDescription(request.getDescription());
        Long gId = request.getGroupId() != null ? request.getGroupId() : 0L;
        project.setGroupId(gId);
        project.setOwnerId(userId);
        // project.setGroupId(gId); // 已移除
        project.setOwnerId(userId);
        project.setIsDeleted(0);
        project.setCreatedAt(LocalDateTime.now());
        project.setUpdatedAt(LocalDateTime.now());
        
        log.info("Creating project: {} by owner: {}", project.getName(), userId);
        this.save(project);

        // 2. 初始化默认看板阶段
        for (int i = 0; i < DEFAULT_STAGES.size(); i++) {
            PmTaskStage stage = new PmTaskStage();
            stage.setProjectId(project.getId());
            stage.setName(DEFAULT_STAGES.get(i));
            stage.setSort(i);
            taskStageMapper.insert(stage);
        }

        // 3. 将创建者添加为项目管理员
        PmProjectMember member = new PmProjectMember();
        member.setProjectId(project.getId());
        member.setUserId(userId);
        member.setCustomGroupId(gId);
        member.setRoleType(ProjectMemberRole.ADMIN);
        member.setCustomGroupId(gId); // 设置个性化分组
        member.setJoinedAt(LocalDateTime.now());
        projectMemberMapper.insert(member);
        
        // 设置返回对象的groupId，以便前端立即使用
        project.setGroupId(gId);

        fillCalculatedProgress(Collections.singletonList(project));
        return project;
    }

    @Override
    public List<PmProject> listProjectsByUserId(Long userId, Boolean archived, Long groupId) {
        // 默认查询活跃项目
        int archivedStatus = (archived != null && archived) ? 1 : 0;
        boolean isAdmin = sysUserService.isSuperAdmin(userId);
        List<PmProject> projects = this.baseMapper.selectProjectsWithGroup(userId, archivedStatus, groupId, isAdmin);
        return fillCalculatedProgress(projects);
    }

    @Override
    public PmProject getProjectWithCalculatedProgress(Long projectId) {
        PmProject project = this.getById(projectId);
        if (project == null) {
            return null;
        }
        fillCalculatedProgress(Collections.singletonList(project));
        return project;
    }

    @Override
    public List<PmProject> fillCalculatedProgress(List<PmProject> projects) {
        if (projects == null || projects.isEmpty()) {
            return projects;
        }

        Set<Long> projectIds = new HashSet<>();
        for (PmProject project : projects) {
            if (project != null && project.getId() != null) {
                projectIds.add(project.getId());
            }
        }
        if (projectIds.isEmpty()) {
            return projects;
        }

        LambdaQueryWrapper<PmTask> taskQuery = new LambdaQueryWrapper<>();
        taskQuery.in(PmTask::getProjectId, projectIds)
                .orderByDesc(PmTask::getUpdatedAt);
        List<PmTask> tasks = taskMapper.selectList(taskQuery);

        Map<Long, List<PmTask>> tasksByProject = new HashMap<>();
        Set<Long> taskIds = new HashSet<>();
        Set<Long> stageIds = new HashSet<>();
        for (PmTask task : tasks) {
            if (task.getProjectId() != null) {
                tasksByProject.computeIfAbsent(task.getProjectId(), key -> new java.util.ArrayList<>()).add(task);
            }
            if (task.getId() != null) {
                taskIds.add(task.getId());
            }
            if (task.getStageId() != null) {
                stageIds.add(task.getStageId());
            }
        }

        Map<Long, PmTaskStage> stageMap = new HashMap<>();
        if (!stageIds.isEmpty()) {
            for (PmTaskStage stage : taskStageMapper.selectBatchIds(stageIds)) {
                if (stage != null && stage.getId() != null) {
                    stageMap.put(stage.getId(), stage);
                }
            }
        }

        Map<Long, List<PmSubTask>> subTasksByTask = new HashMap<>();
        if (!taskIds.isEmpty()) {
            LambdaQueryWrapper<PmSubTask> subTaskQuery = new LambdaQueryWrapper<>();
            subTaskQuery.in(PmSubTask::getTaskId, taskIds);
            for (PmSubTask subTask : subTaskMapper.selectList(subTaskQuery)) {
                if (subTask.getTaskId() != null) {
                    subTasksByTask.computeIfAbsent(subTask.getTaskId(), key -> new java.util.ArrayList<>()).add(subTask);
                }
            }
        }

        for (PmProject project : projects) {
            if (project == null || project.getId() == null) {
                continue;
            }
            List<PmTask> projectTasks = tasksByProject.getOrDefault(project.getId(), Collections.emptyList());
            project.setProgress(calculateProjectProgress(projectTasks, stageMap, subTasksByTask));
        }
        return projects;
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public void archiveProject(Long projectId, Long userId) {
        // 1. 查询项目是否存在
        PmProject project = this.getById(projectId);
        if (project == null) {
            throw new RuntimeException("项目不存在");
        }

        // 2. 权限校验：只有项目所有者或管理员可以归档
        if (!canManageProject(project, userId)) {
            throw new RuntimeException("无权限归档此项目，仅项目所有者或管理员可操作");
        }

        // 3. 检查是否已归档
        if (project.getIsArchived() != null && project.getIsArchived() == 1) {
            throw new RuntimeException("项目已处于归档状态");
        }

        // 4. 执行归档
        project.setIsArchived(1);
        project.setUpdatedAt(LocalDateTime.now());
        this.updateById(project);
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public void unarchiveProject(Long projectId, Long userId) {
        // 1. 查询项目是否存在
        PmProject project = this.getById(projectId);
        if (project == null) {
            throw new RuntimeException("项目不存在");
        }

        // 2. 权限校验：只有项目所有者或管理员可以取消归档
        if (!canManageProject(project, userId)) {
            throw new RuntimeException("无权限还原此项目，仅项目所有者或管理员可操作");
        }

        // 3. 检查是否已归档
        if (project.getIsArchived() == null || project.getIsArchived() == 0) {
            throw new RuntimeException("项目未处于归档状态");
        }

        // 4. 执行取消归档
        project.setIsArchived(0);
        project.setUpdatedAt(LocalDateTime.now());
        this.updateById(project);
    }

    /**
     * 检查用户是否有权限管理项目（所有者或管理员）
     */
    private boolean canManageProject(PmProject project, Long userId) {
        return permissionService.isAdmin(project.getId(), userId);
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public PmProject updateProject(Long projectId, ProjectUpdateRequest request, Long userId) {
        // 1. 查询项目是否存在
        PmProject project = this.getById(projectId);
        if (project == null) {
            throw new RuntimeException("项目不存在");
        }

        // 2. 权限校验
        permissionService.checkProjectManagePermission(projectId, userId);

        // 3. 部分更新（只更新非空字段）
        if (request.getName() != null && !request.getName().trim().isEmpty()) {
            project.setName(request.getName().trim());
        }
        if (request.getDescription() != null) {
            project.setDescription(request.getDescription());
        }
        if (request.getProgress() != null) {
            // 校验进度范围
            int progress = request.getProgress();
            if (progress < 0) progress = 0;
            if (progress > 100) progress = 100;
            project.setProgress(progress);
        }
        if (request.getGroupId() != null) {
            // 更新当前用户的项目分组设置（如果是管理员且不是成员，则跳过此步或先加入成员）
            LambdaUpdateWrapper<PmProjectMember> updateMember = new LambdaUpdateWrapper<>();
            updateMember.eq(PmProjectMember::getProjectId, projectId)
                        .eq(PmProjectMember::getUserId, userId)
                        .set(PmProjectMember::getCustomGroupId, request.getGroupId());
            projectMemberMapper.update(null, updateMember);
            
            // 设置返回对象的VO字段
            project.setGroupId(request.getGroupId());
        }

        project.setUpdatedAt(LocalDateTime.now());
        this.updateById(project);

        fillCalculatedProgress(Collections.singletonList(project));
        return project;
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public void deleteProject(Long projectId, Long userId) {
        // 1. 查询项目是否存在
        PmProject project = this.getById(projectId);
        if (project == null) {
            throw new RuntimeException("项目不存在");
        }

        // 2. 权限校验：只有项目所有者或超级管理员可以删除项目
        if (!sysUserService.isSuperAdmin(userId) && !project.getOwnerId().equals(userId)) {
            throw new RuntimeException("只有项目所有者可以删除项目");
        }

        // 3. 逻辑删除项目自身
        this.removeById(projectId);

        // 4. 逻辑删除项目下的所有任务
        LambdaUpdateWrapper<PmTask> taskUpdate = new LambdaUpdateWrapper<>();
        taskUpdate.eq(PmTask::getProjectId, projectId)
                  .set(PmTask::getIsDeleted, 1);
        taskMapper.update(null, taskUpdate);

        // 5. 物理删除项目成员关联（因为 PmProjectMember 没有逻辑删除字段）
        LambdaQueryWrapper<PmProjectMember> memberQuery = new LambdaQueryWrapper<>();
        memberQuery.eq(PmProjectMember::getProjectId, projectId);
        projectMemberMapper.delete(memberQuery);

        // 6. 物理删除看板阶段
        LambdaQueryWrapper<PmTaskStage> stageQuery = new LambdaQueryWrapper<>();
        stageQuery.eq(PmTaskStage::getProjectId, projectId);
        taskStageMapper.delete(stageQuery);

        // 7. 逻辑删除项目关联的文件节点
        com.baomidou.mybatisplus.core.conditions.update.UpdateWrapper<PmFileNode> fileUpdate = new com.baomidou.mybatisplus.core.conditions.update.UpdateWrapper<>();
        fileUpdate.eq("project_id", projectId)
                  .set("is_deleted", 1);
        fileNodeMapper.update(null, fileUpdate);

        log.info("Project and its related data (tasks, members, stages, files) deleted: id={}, by user: {}", projectId, userId);
    }

    private int calculateProjectProgress(List<PmTask> tasks,
                                         Map<Long, PmTaskStage> stageMap,
                                         Map<Long, List<PmSubTask>> subTasksByTask) {
        if (tasks == null || tasks.isEmpty()) {
            return 0;
        }

        int totalProgress = 0;
        for (PmTask task : tasks) {
            totalProgress += calculateTaskProgress(task, stageMap, subTasksByTask);
        }
        return Math.max(0, Math.min(100, (int) Math.round(totalProgress * 1.0 / tasks.size())));
    }

    private int calculateTaskProgress(PmTask task,
                                      Map<Long, PmTaskStage> stageMap,
                                      Map<Long, List<PmSubTask>> subTasksByTask) {
        if (task == null) {
            return 0;
        }
        if (isTaskDone(task, stageMap)) {
            return 100;
        }

        List<PmSubTask> subTasks = subTasksByTask.getOrDefault(task.getId(), Collections.emptyList());
        if (!subTasks.isEmpty()) {
            int completed = 0;
            for (PmSubTask subTask : subTasks) {
                if (subTask != null && Objects.equals(subTask.getStatus(), 1)) {
                    completed++;
                }
            }
            return (int) Math.round(completed * 100.0 / subTasks.size());
        }

        return Objects.equals(task.getStatus(), 2) ? 50 : 0;
    }

    private boolean isTaskDone(PmTask task, Map<Long, PmTaskStage> stageMap) {
        if (task == null) {
            return false;
        }
        if (Objects.equals(task.getStatus(), 1)) {
            return true;
        }
        PmTaskStage stage = stageMap.get(task.getStageId());
        return stage != null && isDoneStage(stage.getName());
    }

    private boolean isDoneStage(String stageName) {
        if (stageName == null || stageName.trim().isEmpty()) {
            return false;
        }
        for (String keyword : DONE_STAGE_KEYWORDS) {
            if (stageName.contains(keyword)) {
                return true;
            }
        }
        return false;
    }
}
