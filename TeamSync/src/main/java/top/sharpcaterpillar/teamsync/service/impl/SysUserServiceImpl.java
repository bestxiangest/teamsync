package top.sharpcaterpillar.teamsync.service.impl;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.baomidou.mybatisplus.extension.service.impl.ServiceImpl;
import lombok.RequiredArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.DigestUtils;
import org.springframework.util.StringUtils;
import top.sharpcaterpillar.teamsync.config.TaskReminderMailProperties;
import top.sharpcaterpillar.teamsync.dto.*;
import top.sharpcaterpillar.teamsync.entity.SysUser;
import top.sharpcaterpillar.teamsync.entity.SysUserReminderSetting;
import top.sharpcaterpillar.teamsync.mapper.SysUserMapper;
import top.sharpcaterpillar.teamsync.mapper.SysUserReminderSettingMapper;
import top.sharpcaterpillar.teamsync.service.SysUserService;
import top.sharpcaterpillar.teamsync.service.TaskReminderService;
import top.sharpcaterpillar.teamsync.utils.JwtUtils;
import top.sharpcaterpillar.teamsync.vo.LoginVO;
import top.sharpcaterpillar.teamsync.vo.PageVO;
import top.sharpcaterpillar.teamsync.vo.UserReminderSettingsVO;
import top.sharpcaterpillar.teamsync.vo.UserListVO;

import jakarta.mail.internet.InternetAddress;
import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

/**
 * 用户 Service 实现类
 */
@Service
@RequiredArgsConstructor
public class SysUserServiceImpl extends ServiceImpl<SysUserMapper, SysUser> implements SysUserService {

    private static final Logger log = LoggerFactory.getLogger(SysUserServiceImpl.class);

    private final JwtUtils jwtUtils;

    /**
     * 密码加密盐值
     */
    private static final String SALT = "TeamSync2026";

    private final SysUserReminderSettingMapper reminderSettingMapper;
    private final TaskReminderService taskReminderService;
    private final TaskReminderMailProperties taskReminderMailProperties;

    @Override
    public LoginVO login(LoginRequest request) {
        // 1. 参数校验
        if (request.getUserName() == null || request.getUserName().trim().isEmpty()) {
            throw new RuntimeException("用户名不能为空");
        }
        if (request.getPassword() == null || request.getPassword().isEmpty()) {
            throw new RuntimeException("密码不能为空");
        }

        // 2. 查询用户
        SysUser user = getByUsername(request.getUserName().trim());
        if (user == null) {
            throw new RuntimeException("用户名或密码错误");
        }

        // 3. 校验密码
        String encryptedPassword = encryptPassword(request.getPassword());
        if (!encryptedPassword.equals(user.getPassword())) {
            throw new RuntimeException("用户名或密码错误");
        }

        // 4. 生成 Token
        String token = jwtUtils.generateToken(user.getId(), user.getUsername());
        String refreshToken = jwtUtils.generateToken(user.getId(), user.getUsername()); // 简化处理

        // 5. 构建返回结果
        LoginVO loginVO = new LoginVO();
        loginVO.setToken(token);
        loginVO.setRefreshToken(refreshToken);

        log.info("用户登录成功: userId={}, username={}", user.getId(), user.getUsername());
        return loginVO;
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public SysUser register(RegisterRequest request) {
        // 1. 参数校验
        if (request.getUsername() == null || request.getUsername().trim().isEmpty()) {
            throw new RuntimeException("用户名不能为空");
        }
        if (request.getPassword() == null || request.getPassword().isEmpty()) {
            throw new RuntimeException("密码不能为空");
        }
        if (request.getPassword().length() < 6) {
            throw new RuntimeException("密码长度不能少于6位");
        }

        // 2. 检查用户名是否已存在
        SysUser existingUser = getByUsername(request.getUsername().trim());
        if (existingUser != null) {
            throw new RuntimeException("用户名已存在");
        }

        // 3. 创建用户
        SysUser user = new SysUser();
        user.setUsername(request.getUsername().trim());
        user.setPassword(encryptPassword(request.getPassword()));
        user.setNickname(request.getNickname() != null ? request.getNickname().trim() : request.getUsername().trim());
        user.setAvatar(""); // 默认头像
        user.setCreatedAt(LocalDateTime.now());

        this.save(user);

        log.info("用户注册成功: userId={}, username={}", user.getId(), user.getUsername());
        return user;
    }

    @Override
    public SysUser getByUsername(String username) {
        LambdaQueryWrapper<SysUser> query = new LambdaQueryWrapper<>();
        query.eq(SysUser::getUsername, username);
        return this.getOne(query);
    }

    @Override
    public PageVO<UserListVO> getUserList(UserQueryRequest request) {
        // 构建分页对象
        Page<SysUser> page = new Page<>(request.getCurrent(), request.getSize());

        // 构建查询条件
        LambdaQueryWrapper<SysUser> queryWrapper = new LambdaQueryWrapper<>();

        // 用户名模糊搜索
        if (StringUtils.hasText(request.getUsername())) {
            queryWrapper.like(SysUser::getUsername, request.getUsername());
        }

        // 手机号模糊搜索
        if (StringUtils.hasText(request.getUserPhone())) {
            queryWrapper.like(SysUser::getPhone, request.getUserPhone());
        }

        // 邮箱模糊搜索
        if (StringUtils.hasText(request.getUserEmail())) {
            queryWrapper.like(SysUser::getEmail, request.getUserEmail());
        }

        // 性别筛选
        if (request.getUserGender() != null) {
            queryWrapper.eq(SysUser::getGender, request.getUserGender());
        }

        // 状态筛选
        if (StringUtils.hasText(request.getStatus())) {
            queryWrapper.eq(SysUser::getStatus, Integer.parseInt(request.getStatus()));
        }

        // 按创建时间倒序
        queryWrapper.orderByDesc(SysUser::getCreatedAt);

        // 执行分页查询
        Page<SysUser> resultPage = this.page(page, queryWrapper);

        // 转换为 VO
        List<UserListVO> voList = resultPage.getRecords().stream()
                .map(this::convertToUserListVO)
                .collect(Collectors.toList());

        return PageVO.of(voList, resultPage.getTotal(),
                (int) resultPage.getCurrent(), (int) resultPage.getSize());
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public SysUser addUser(UserAddRequest request) {
        // 1. 参数校验
        if (!StringUtils.hasText(request.getUsername())) {
            throw new RuntimeException("用户名不能为空");
        }
        if (!StringUtils.hasText(request.getPassword())) {
            throw new RuntimeException("密码不能为空");
        }
        if (request.getPassword().length() < 6) {
            throw new RuntimeException("密码长度不能少于6位");
        }

        // 2. 检查用户名是否已存在
        SysUser existingUser = getByUsername(request.getUsername().trim());
        if (existingUser != null) {
            throw new RuntimeException("用户名已存在");
        }

        // 3. 创建用户
        SysUser user = new SysUser();
        user.setUsername(request.getUsername().trim());
        user.setPassword(encryptPassword(request.getPassword()));
        user.setNickname(StringUtils.hasText(request.getNickname()) ?
                request.getNickname().trim() : request.getUsername().trim());
        user.setAvatar(request.getAvatar() != null ? request.getAvatar() : "");
        user.setEmail(request.getUserEmail());
        user.setPhone(request.getUserPhone());
        user.setGender(request.getUserGender() != null ? request.getUserGender() : 0);
        user.setStatus(StringUtils.hasText(request.getStatus()) ?
                Integer.parseInt(request.getStatus()) : 1);
        user.setIsAdmin(request.getIsAdmin() != null ? request.getIsAdmin() : false);
        user.setCreatedAt(LocalDateTime.now());
        user.setUpdatedAt(LocalDateTime.now());

        this.save(user);

        log.info("新增用户成功: userId={}, username={}", user.getId(), user.getUsername());
        return user;
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public boolean updateUser(UserUpdateRequest request) {
        // 1. 参数校验
        if (request.getId() == null) {
            throw new RuntimeException("用户ID不能为空");
        }

        // 2. 查询用户是否存在
        SysUser existingUser = this.getById(request.getId());
        if (existingUser == null) {
            throw new RuntimeException("用户不存在");
        }

        // 3. 检查用户名是否重复（如果修改了用户名）
        if (StringUtils.hasText(request.getUsername()) &&
                !request.getUsername().equals(existingUser.getUsername())) {
            SysUser userWithSameName = getByUsername(request.getUsername().trim());
            if (userWithSameName != null) {
                throw new RuntimeException("用户名已存在");
            }
            existingUser.setUsername(request.getUsername().trim());
        }

        // 4. 更新字段
        if (StringUtils.hasText(request.getNickname())) {
            existingUser.setNickname(request.getNickname().trim());
        }
        if (request.getAvatar() != null) {
            existingUser.setAvatar(request.getAvatar());
        }
        if (request.getUserEmail() != null) {
            existingUser.setEmail(request.getUserEmail());
        }
        if (request.getUserPhone() != null) {
            existingUser.setPhone(request.getUserPhone());
        }
        if (request.getUserGender() != null) {
            existingUser.setGender(request.getUserGender());
        }
        if (StringUtils.hasText(request.getStatus())) {
            existingUser.setStatus(Integer.parseInt(request.getStatus()));
        }
        if (request.getIsAdmin() != null) {
            existingUser.setIsAdmin(request.getIsAdmin());
        }
        existingUser.setUpdatedAt(LocalDateTime.now());

        boolean result = this.updateById(existingUser);
        log.info("更新用户成功: userId={}, username={}", existingUser.getId(), existingUser.getUsername());
        return result;
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public boolean deleteUser(Long id) {
        // 1. 参数校验
        if (id == null) {
            throw new RuntimeException("用户ID不能为空");
        }

        // 2. 查询用户是否存在
        SysUser existingUser = this.getById(id);
        if (existingUser == null) {
            throw new RuntimeException("用户不存在");
        }

        // 3. 禁止删除管理员
        if (Boolean.TRUE.equals(existingUser.getIsAdmin())) {
            throw new RuntimeException("不能删除管理员用户");
        }

        boolean result = this.removeById(id);
        log.info("删除用户成功: userId={}", id);
        return result;
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public boolean resetPassword(UserResetPwdRequest request) {
        // 1. 参数校验
        if (request.getId() == null) {
            throw new RuntimeException("用户ID不能为空");
        }
        if (!StringUtils.hasText(request.getNewPassword())) {
            throw new RuntimeException("新密码不能为空");
        }
        if (request.getNewPassword().length() < 6) {
            throw new RuntimeException("密码长度不能少于6位");
        }

        // 2. 查询用户是否存在
        SysUser existingUser = this.getById(request.getId());
        if (existingUser == null) {
            throw new RuntimeException("用户不存在");
        }

        // 3. 更新密码
        existingUser.setPassword(encryptPassword(request.getNewPassword()));
        existingUser.setUpdatedAt(LocalDateTime.now());

        boolean result = this.updateById(existingUser);
        log.info("重置用户密码成功: userId={}", request.getId());
        return result;
    }

    @Override
    public boolean isSuperAdmin(Long userId) {
        if (userId == null) return false;
        SysUser user = this.getById(userId);
        return user != null && Boolean.TRUE.equals(user.getIsAdmin());
    }

    @Override
    public UserReminderSettingsVO getReminderSettings(Long userId) {
        SysUser user = requireUser(userId);
        SysUserReminderSetting setting = reminderSettingMapper.selectById(userId);
        return buildReminderSettingsVO(user, setting);
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public UserReminderSettingsVO updateReminderSettings(Long userId, UserReminderSettingsRequest request) {
        SysUser user = requireUser(userId);
        if (request == null) {
            throw new RuntimeException("提醒设置不能为空");
        }

        String email = request.getEmail() != null ? request.getEmail().trim() : "";
        boolean emailReminderEnabled = Boolean.TRUE.equals(request.getEmailReminderEnabled());
        boolean overdueTaskReminderEnabled = Boolean.TRUE.equals(request.getOverdueTaskReminderEnabled());
        boolean taskCompletedEnabled = Boolean.TRUE.equals(request.getTaskCompletedEnabled());

        if ((overdueTaskReminderEnabled || taskCompletedEnabled) && !emailReminderEnabled) {
            throw new RuntimeException("启用任务邮件提醒前，请先开启邮件提醒总开关");
        }
        if ((emailReminderEnabled || overdueTaskReminderEnabled || taskCompletedEnabled) && !StringUtils.hasText(email)) {
            throw new RuntimeException("启用邮件提醒前，请先填写邮箱地址");
        }
        if (StringUtils.hasText(email)) {
            validateEmail(email);
        }

        user.setEmail(StringUtils.hasText(email) ? email : null);
        user.setUpdatedAt(LocalDateTime.now());
        this.updateById(user);

        SysUserReminderSetting setting = reminderSettingMapper.selectById(userId);
        LocalDateTime now = LocalDateTime.now();
        if (setting == null) {
            setting = new SysUserReminderSetting();
            setting.setUserId(userId);
            setting.setCreatedAt(now);
        }
        setting.setEmailEnabled(emailReminderEnabled);
        setting.setOverdueTaskEnabled(overdueTaskReminderEnabled);
        setting.setTaskCompletedEnabled(taskCompletedEnabled);
        setting.setUpdatedAt(now);

        if (reminderSettingMapper.selectById(userId) == null) {
            reminderSettingMapper.insert(setting);
        } else {
            reminderSettingMapper.updateById(setting);
        }

        return buildReminderSettingsVO(user, setting);
    }

    /**
     * 将实体转换为列表 VO
     */
    private UserListVO convertToUserListVO(SysUser user) {
        UserListVO vo = new UserListVO();
        vo.setId(user.getId());
        vo.setUsername(user.getUsername());
        vo.setNickname(user.getNickname());
        vo.setAvatar(user.getAvatar());
        vo.setEmail(user.getEmail());
        vo.setPhone(user.getPhone());
        // 性别转换：数字转中文
        vo.setGender(convertGender(user.getGender()));
        // 状态转换为字符串
        vo.setStatus(user.getStatus() != null ? String.valueOf(user.getStatus()) : "1");
        vo.setIsAdmin(user.getIsAdmin());
        vo.setCreatedAt(user.getCreatedAt());
        return vo;
    }

    /**
     * 性别数字转中文
     */
    private String convertGender(Integer gender) {
        if (gender == null) {
            return "未知";
        }
        return switch (gender) {
            case 1 -> "男";
            case 2 -> "女";
            default -> "未知";
        };
    }

    /**
     * 密码加密（MD5 + 盐值）
     */
    private String encryptPassword(String password) {
        return DigestUtils.md5DigestAsHex((SALT + password).getBytes());
    }

    private SysUser requireUser(Long userId) {
        if (userId == null) {
            throw new RuntimeException("用户未登录");
        }
        SysUser user = this.getById(userId);
        if (user == null) {
            throw new RuntimeException("用户不存在");
        }
        return user;
    }

    private UserReminderSettingsVO buildReminderSettingsVO(SysUser user, SysUserReminderSetting setting) {
        UserReminderSettingsVO vo = new UserReminderSettingsVO();
        vo.setUserId(user.getId());
        vo.setUsername(user.getUsername());
        vo.setNickname(user.getNickname());
        vo.setAvatar(user.getAvatar());
        vo.setEmail(user.getEmail());
        vo.setIsAdmin(Boolean.TRUE.equals(user.getIsAdmin()));
        vo.setEmailReminderEnabled(setting != null && Boolean.TRUE.equals(setting.getEmailEnabled()));
        vo.setOverdueTaskReminderEnabled(setting != null && Boolean.TRUE.equals(setting.getOverdueTaskEnabled()));
        vo.setTaskCompletedEnabled(setting != null && Boolean.TRUE.equals(setting.getTaskCompletedEnabled()));
        vo.setMailChannelReady(taskReminderService.isMailChannelReady());
        vo.setSchedulerEnabled(taskReminderMailProperties.isEnabled());
        return vo;
    }

    private void validateEmail(String email) {
        try {
            InternetAddress address = new InternetAddress(email);
            address.validate();
        } catch (Exception e) {
            throw new RuntimeException("邮箱格式不正确");
        }
    }

}
