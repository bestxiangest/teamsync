package top.sharpcaterpillar.teamsync.service;

import com.baomidou.mybatisplus.extension.service.IService;
import top.sharpcaterpillar.teamsync.dto.*;
import top.sharpcaterpillar.teamsync.entity.SysUser;
import top.sharpcaterpillar.teamsync.vo.LoginVO;
import top.sharpcaterpillar.teamsync.vo.PageVO;
import top.sharpcaterpillar.teamsync.vo.UserReminderSettingsVO;
import top.sharpcaterpillar.teamsync.vo.UserListVO;

/**
 * 用户 Service 接口
 */
public interface SysUserService extends IService<SysUser> {

    /**
     * 用户登录
     *
     * @param request 登录请求
     * @return 登录结果（包含Token）
     */
    LoginVO login(LoginRequest request);

    /**
     * 用户注册
     *
     * @param request 注册请求
     * @return 注册的用户
     */
    SysUser register(RegisterRequest request);

    /**
     * 根据用户名查询用户
     *
     * @param username 用户名
     * @return 用户实体
     */
    SysUser getByUsername(String username);

    /**
     * 分页查询用户列表
     *
     * @param request 查询参数
     * @return 分页结果
     */
    PageVO<UserListVO> getUserList(UserQueryRequest request);

    /**
     * 新增用户
     *
     * @param request 新增请求
     * @return 新增的用户
     */
    SysUser addUser(UserAddRequest request);

    /**
     * 更新用户
     *
     * @param request 更新请求
     * @return 是否成功
     */
    boolean updateUser(UserUpdateRequest request);

    /**
     * 删除用户
     *
     * @param id 用户ID
     * @return 是否成功
     */
    boolean deleteUser(Long id);

    /**
     * 重置用户密码
     *
     * @param request 重置密码请求
     * @return 是否成功
     */
    boolean resetPassword(UserResetPwdRequest request);

    /**
     * 检查是否为超级管理员
     * 
     * @param userId 用户ID
     * @return 是否为超级管理员
     */
    boolean isSuperAdmin(Long userId);

    /**
     * 获取当前用户提醒设置
     *
     * @param userId 用户ID
     * @return 提醒设置
     */
    UserReminderSettingsVO getReminderSettings(Long userId);

    /**
     * 更新当前用户提醒设置
     *
     * @param userId 用户ID
     * @param request 设置请求
     * @return 最新设置
     */
    UserReminderSettingsVO updateReminderSettings(Long userId, UserReminderSettingsRequest request);

}
