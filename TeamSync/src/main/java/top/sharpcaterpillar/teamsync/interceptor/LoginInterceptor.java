package top.sharpcaterpillar.teamsync.interceptor;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Component;
import org.springframework.util.StringUtils;
import org.springframework.web.servlet.HandlerInterceptor;
import top.sharpcaterpillar.teamsync.utils.JwtUtils;
import top.sharpcaterpillar.teamsync.utils.UserContext;

/**
 * 登录认证拦截器
 */
@Component
public class LoginInterceptor implements HandlerInterceptor {

    private static final Logger log = LoggerFactory.getLogger(LoginInterceptor.class);

    private final JwtUtils jwtUtils;

    public LoginInterceptor(JwtUtils jwtUtils) {
        this.jwtUtils = jwtUtils;
    }

    private static final String AUTHORIZATION_HEADER = "Authorization";
    private static final String BEARER_PREFIX = "Bearer ";

    @Override
    public boolean preHandle(HttpServletRequest request, HttpServletResponse response, Object handler) throws Exception {
        // 获取 Authorization header
        String authHeader = request.getHeader(AUTHORIZATION_HEADER);
        
        if (!StringUtils.hasText(authHeader)) {
            log.warn("请求缺少 Authorization header: {}", request.getRequestURI());
            sendUnauthorizedResponse(response, "未提供认证令牌");
            return false;
        }

        // 提取 Token（移除 Bearer 前缀）
        String token = authHeader;
        if (authHeader.startsWith(BEARER_PREFIX)) {
            token = authHeader.substring(BEARER_PREFIX.length());
        }

        // 校验 Token
        if (!jwtUtils.validateToken(token)) {
            log.warn("Token 无效或已过期: {}", request.getRequestURI());
            sendUnauthorizedResponse(response, "认证令牌无效或已过期");
            return false;
        }

        // 解析用户信息并存入 ThreadLocal
        Long userId = jwtUtils.getUserIdFromToken(token);
        String username = jwtUtils.getUsernameFromToken(token);
        
        if (userId == null) {
            log.warn("无法从 Token 中解析用户信息: {}", request.getRequestURI());
            sendUnauthorizedResponse(response, "认证令牌解析失败");
            return false;
        }

        // 存入 ThreadLocal
        UserContext.setUserId(userId);
        UserContext.setUsername(username);
        
        log.debug("用户认证成功: userId={}, username={}, uri={}", userId, username, request.getRequestURI());
        return true;
    }

    @Override
    public void afterCompletion(HttpServletRequest request, HttpServletResponse response, Object handler, Exception ex) {
        // 清理 ThreadLocal，防止内存泄漏
        UserContext.clear();
    }

    /**
     * 发送 401 未授权响应
     */
    private void sendUnauthorizedResponse(HttpServletResponse response, String message) throws Exception {
        response.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
        response.setContentType("application/json;charset=UTF-8");
        String json = String.format("{\"code\":401,\"msg\":\"%s\",\"data\":null}", message);
        response.getWriter().write(json);
    }

}
