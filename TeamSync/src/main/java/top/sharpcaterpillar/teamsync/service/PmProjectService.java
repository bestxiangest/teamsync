package top.sharpcaterpillar.teamsync.service;

import com.baomidou.mybatisplus.extension.service.IService;
import top.sharpcaterpillar.teamsync.dto.ProjectCreateRequest;
import top.sharpcaterpillar.teamsync.dto.ProjectUpdateRequest;
import top.sharpcaterpillar.teamsync.entity.PmProject;

import java.util.List;

/**
 * 项目管理 Service 接口
 */
public interface PmProjectService extends IService<PmProject> {

    /**
     * 创建新项目
     * - 保存项目基本信息
     * - 初始化默认看板阶段（待办、进行中、已完成）
     * - 将创建者添加为项目管理员
     *
     * @param request 创建项目请求
     * @param userId  当前用户ID
     * @return 创建的项目
     */
    PmProject createProject(ProjectCreateRequest request, Long userId);

    /**
     * 获取用户参与的所有项目列表
     *
     * @param userId   用户ID
     * @param archived 是否查询归档项目（true: 已归档, false: 活跃项目）
     * @param groupId  分组ID (null表示不筛选, 0表示根目录)
     * @return 项目列表
     */
    List<PmProject> listProjectsByUserId(Long userId, Boolean archived, Long groupId);

    /**
     * 获取带自动计算进度的项目详情
     *
     * @param projectId 项目ID
     * @return 项目详情
     */
    PmProject getProjectWithCalculatedProgress(Long projectId);

    /**
     * 为项目集合填充自动计算后的进度
     *
     * @param projects 项目集合
     * @return 原集合，已写入计算后的进度
     */
    List<PmProject> fillCalculatedProgress(List<PmProject> projects);

    /**
     * 归档项目
     *
     * @param projectId 项目ID
     * @param userId    当前用户ID（用于权限校验）
     */
    void archiveProject(Long projectId, Long userId);

    /**
     * 取消归档项目（还原）
     *
     * @param projectId 项目ID
     * @param userId    当前用户ID（用于权限校验）
     */
    void unarchiveProject(Long projectId, Long userId);

    /**
     * 更新项目信息（部分更新）
     *
     * @param projectId 项目ID
     * @param request   更新请求
     * @param userId    当前用户ID（用于权限校验）
     * @return 更新后的项目
     */
    PmProject updateProject(Long projectId, ProjectUpdateRequest request, Long userId);

    /**
     * 删除项目（逻辑删除及其关联数据）
     *
     * @param projectId 项目ID
     * @param userId    当前用户ID
     */
    void deleteProject(Long projectId, Long userId);

}
