package top.sharpcaterpillar.teamsync.controller;

import lombok.RequiredArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.web.bind.annotation.*;
import top.sharpcaterpillar.teamsync.common.Result;
import top.sharpcaterpillar.teamsync.dto.LoginRequest;
import top.sharpcaterpillar.teamsync.dto.RegisterRequest;
import top.sharpcaterpillar.teamsync.entity.SysUser;
import top.sharpcaterpillar.teamsync.service.SysUserService;
import top.sharpcaterpillar.teamsync.vo.LoginVO;

import java.util.HashMap;
import java.util.Map;

/**
 * 认证 Controller
 */
@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {

    private static final Logger log = LoggerFactory.getLogger(AuthController.class);

    private final SysUserService sysUserService;

    /**
     * 登录
     * POST /api/auth/login
     */
    @PostMapping("/login")
    public Result login(@RequestBody LoginRequest request) {
        log.info("用户登录请求: username={}", request.getUserName());
        try {
            LoginVO loginVO = sysUserService.login(request);
            return Result.success(loginVO);
        } catch (RuntimeException e) {
            log.warn("登录失败: {}", e.getMessage());
            return Result.error(e.getMessage());
        }
    }

    /**
     * 注册
     * POST /api/auth/register
     */
    @PostMapping("/register")
    public Result register(@RequestBody RegisterRequest request) {
        log.info("用户注册请求: username={}", request.getUsername());
        try {
            SysUser user = sysUserService.register(request);
            
            // 构建返回数据（不返回密码）
            Map<String, Object> userData = new HashMap<>();
            userData.put("id", user.getId());
            userData.put("username", user.getUsername());
            userData.put("nickname", user.getNickname());
            
            return Result.success(userData);
        } catch (RuntimeException e) {
            log.warn("注册失败: {}", e.getMessage());
            return Result.error(e.getMessage());
        }
    }

}
