package top.sharpcaterpillar.teamsync.service;

import com.baomidou.mybatisplus.extension.service.IService;
import top.sharpcaterpillar.teamsync.entity.PmProjectMember;
import top.sharpcaterpillar.teamsync.vo.MemberVO;

import java.util.List;

/**
 * 项目成员 Service 接口。
 */
public interface PmProjectMemberService extends IService<PmProjectMember> {

    /**
     * 获取项目成员列表。
     *
     * @param projectId     项目ID
     * @param currentUserId 当前用户ID
     * @return 成员列表
     */
    List<MemberVO> getProjectMembers(Long projectId, Long currentUserId);

    /**
     * 邀请成员加入项目。
     *
     * @param projectId  项目ID
     * @param username   用户名
     * @param roleType   目标角色类型，可为空
     * @param operatorId 操作者ID
     * @return 新成员信息
     */
    MemberVO inviteMember(Long projectId, String username, Integer roleType, Long operatorId);

    /**
     * 更新项目成员角色。
     *
     * @param projectId  项目ID
     * @param userId     目标用户ID
     * @param roleType   目标角色类型
     * @param operatorId 操作者ID
     * @return 更新后的成员信息
     */
    MemberVO updateMemberRole(Long projectId, Long userId, Integer roleType, Long operatorId);

    /**
     * 移除项目成员。
     *
     * @param projectId  项目ID
     * @param userId     目标用户ID
     * @param operatorId 操作者ID
     */
    void removeMember(Long projectId, Long userId, Long operatorId);

    /**
     * 主动退出项目。
     *
     * @param projectId 项目ID
     * @param userId    退出用户ID
     */
    void quitProject(Long projectId, Long userId);
}
