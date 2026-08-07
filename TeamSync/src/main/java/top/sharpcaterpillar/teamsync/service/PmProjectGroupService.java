package top.sharpcaterpillar.teamsync.service;

import com.baomidou.mybatisplus.extension.service.IService;
import top.sharpcaterpillar.teamsync.entity.PmProjectGroup;

import java.util.List;

/**
 * 项目分组 Service 接口
 */
public interface PmProjectGroupService extends IService<PmProjectGroup> {

    /**
     * 创建分组
     *
     * @param name 分组名称
     * @param userId 创建人ID
     * @return 分组
     */
    PmProjectGroup createGroup(String name, Long userId);

    /**
     * 更新分组
     *
     * @param id 分组ID
     * @param name 分组名称
     * @param userId 操作人ID
     */
    void updateGroup(Long id, String name, Long userId);

    /**
     * 更新分组排序
     *
     * @param id 分组ID
     * @param sort 排序号
     * @param userId 操作人ID
     */
    void updateGroupSort(Long id, Integer sort, Long userId);

    /**
     * 删除分组
     *
     * @param id 分组ID
     * @param userId 操作人ID
     */
    void deleteGroup(Long id, Long userId);

    /**
     * 获取用户的分组列表
     *
     * @return 分组列表
     */
    List<PmProjectGroup> listGroups();

    /**
     * 移动项目
     *
     * @param projectId 项目ID
     * @param targetGroupId 目标分组ID (0代表移出分组)
     * @param userId 操作人ID
     */
    void moveProject(Long projectId, Long targetGroupId, Long userId);
}
