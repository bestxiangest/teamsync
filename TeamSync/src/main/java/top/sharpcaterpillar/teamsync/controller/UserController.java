package top.sharpcaterpillar.teamsync.controller;

import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.util.StringUtils;
import org.springframework.web.bind.annotation.*;
import top.sharpcaterpillar.teamsync.common.Result;
import top.sharpcaterpillar.teamsync.dto.UserAddRequest;
import top.sharpcaterpillar.teamsync.dto.UserQueryRequest;
import top.sharpcaterpillar.teamsync.dto.UserResetPwdRequest;
import top.sharpcaterpillar.teamsync.dto.ReminderTestEmailRequest;
import top.sharpcaterpillar.teamsync.dto.UserReminderSettingsRequest;
import top.sharpcaterpillar.teamsync.dto.UserUpdateRequest;
import top.sharpcaterpillar.teamsync.entity.SysUser;
import top.sharpcaterpillar.teamsync.service.SysUserService;
import top.sharpcaterpillar.teamsync.service.TaskReminderService;
import top.sharpcaterpillar.teamsync.utils.UserContext;
import top.sharpcaterpillar.teamsync.utils.JwtUtils;
import top.sharpcaterpillar.teamsync.vo.PageVO;
import top.sharpcaterpillar.teamsync.vo.UserInfoVO;
import top.sharpcaterpillar.teamsync.vo.UserReminderSettingsVO;
import top.sharpcaterpillar.teamsync.vo.UserListVO;

import java.util.Arrays;

/**
 * 用户 Controller
 */
@RestController
@RequestMapping("/api/user")
@RequiredArgsConstructor
public class UserController {

    private static final Logger log = LoggerFactory.getLogger(UserController.class);

    private final JwtUtils jwtUtils;
    private final SysUserService sysUserService;
    private final TaskReminderService taskReminderService;

    /**
     * 获取当前用户信息
     * GET /api/user/info
     */
    @GetMapping("/info")
    public Result getUserInfo(HttpServletRequest request) {
        // 从 Header 获取 Token
        String authHeader = request.getHeader("Authorization");

        if (!StringUtils.hasText(authHeader)) {
            // 没有 Token 时返回默认访客信息（兼容前端框架初始化）
            return Result.success(createGuestInfo());
        }

        // 提取 Token
        String token = authHeader;
        if (authHeader.startsWith("Bearer ")) {
            token = authHeader.substring(7);
        }

        // 解析用户ID
        Long userId = jwtUtils.getUserIdFromToken(token);
        if (userId == null) {
            return Result.success(createGuestInfo());
        }

        // 查询用户信息
        SysUser user = sysUserService.getById(userId);
        if (user == null) {
            return Result.success(createGuestInfo());
        }

        // 构建返回数据
        UserInfoVO userInfo = new UserInfoVO();
        userInfo.setUserId(user.getId());
        userInfo.setUsername(user.getUsername());
        userInfo.setNickname(user.getNickname());
        userInfo.setAvatar(user.getAvatar());
        userInfo.setEmail(user.getEmail());
        userInfo.setIsAdmin(Boolean.TRUE.equals(user.getIsAdmin()));
        // 根据 isAdmin 字段设置角色
        if (Boolean.TRUE.equals(user.getIsAdmin())) {
            userInfo.setRoles(Arrays.asList("R_SUPER", "R_ADMIN"));
        } else {
            userInfo.setRoles(Arrays.asList("R_USER"));
        }

        log.debug("获取用户信息成功: userId={}, username={}", user.getId(), user.getUsername());
        return Result.success(userInfo);
    }

    /**
     * 分页查询用户列表
     * GET /api/user/list
     */
    @GetMapping("/list")
    public Result getUserList(UserQueryRequest request) {
        try {
            PageVO<UserListVO> pageVO = sysUserService.getUserList(request);
            return Result.success(pageVO);
        } catch (Exception e) {
            log.error("查询用户列表失败", e);
            return Result.error("查询用户列表失败：" + e.getMessage());
        }
    }

    /**
     * 新增用户
     * POST /api/user/add
     */
    @PostMapping("/add")
    public Result addUser(@RequestBody UserAddRequest request) {
        try {
            SysUser user = sysUserService.addUser(request);
            return Result.success(user.getId());
        } catch (Exception e) {
            log.error("新增用户失败", e);
            return Result.error(e.getMessage());
        }
    }

    /**
     * 更新用户
     * PUT /api/user/update
     */
    @PutMapping("/update")
    public Result updateUser(@RequestBody UserUpdateRequest request) {
        try {
            boolean result = sysUserService.updateUser(request);
            return result ? Result.success() : Result.error("更新失败");
        } catch (Exception e) {
            log.error("更新用户失败", e);
            return Result.error(e.getMessage());
        }
    }

    /**
     * 删除用户
     * DELETE /api/user/delete/{id}
     */
    @DeleteMapping("/delete/{id}")
    public Result deleteUser(@PathVariable Long id) {
        try {
            boolean result = sysUserService.deleteUser(id);
            return result ? Result.success() : Result.error("删除失败");
        } catch (Exception e) {
            log.error("删除用户失败", e);
            return Result.error(e.getMessage());
        }
    }

    /**
     * 重置用户密码
     * PUT /api/user/reset-pwd
     */
    @PutMapping("/reset-pwd")
    public Result resetPassword(@RequestBody UserResetPwdRequest request) {
        try {
            boolean result = sysUserService.resetPassword(request);
            return result ? Result.success() : Result.error("重置密码失败");
        } catch (Exception e) {
            log.error("重置用户密码失败", e);
            return Result.error(e.getMessage());
        }
    }

    /**
     * 创建访客信息
     */
    private UserInfoVO createGuestInfo() {
        UserInfoVO userInfo = new UserInfoVO();
        userInfo.setUserId(0L);
        userInfo.setUsername("guest");
        userInfo.setRoles(Arrays.asList("R_GUEST"));
        userInfo.setEmail("");
        userInfo.setIsAdmin(false);
        userInfo.setAvatar("");
        return userInfo;
    }

    /**
     * 获取当前用户邮件提醒设置
     * GET /api/user/reminder-settings
     */
    @GetMapping("/reminder-settings")
    public Result getReminderSettings() {
        Long currentUserId = UserContext.getUserId();
        UserReminderSettingsVO data = sysUserService.getReminderSettings(currentUserId);
        return Result.success(data);
    }

    /**
     * 更新当前用户邮件提醒设置
     * PUT /api/user/reminder-settings
     */
    @PutMapping("/reminder-settings")
    public Result updateReminderSettings(@RequestBody UserReminderSettingsRequest request) {
        Long currentUserId = UserContext.getUserId();
        UserReminderSettingsVO data = sysUserService.updateReminderSettings(currentUserId, request);
        return Result.success(data);
    }

    /**
     * 发送测试提醒邮件
     * POST /api/user/reminder-settings/test-email
     */
    @PostMapping("/reminder-settings/test-email")
    public Result sendReminderTestEmail(@RequestBody(required = false) ReminderTestEmailRequest request) {
        Long currentUserId = UserContext.getUserId();
        String email = request != null ? request.getEmail() : null;
        taskReminderService.sendTestReminderEmail(currentUserId, email);
        return Result.success();
    }

}
