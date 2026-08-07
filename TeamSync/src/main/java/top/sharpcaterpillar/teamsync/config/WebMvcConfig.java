package top.sharpcaterpillar.teamsync.config;

import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.CorsRegistry;
import org.springframework.web.servlet.config.annotation.InterceptorRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;
import top.sharpcaterpillar.teamsync.interceptor.LoginInterceptor;

/**
 * Web MVC 配置
 */
@Configuration
public class WebMvcConfig implements WebMvcConfigurer {

    private final LoginInterceptor loginInterceptor;

    public WebMvcConfig(LoginInterceptor loginInterceptor) {
        this.loginInterceptor = loginInterceptor;
    }

    @Override
    public void addInterceptors(InterceptorRegistry registry) {
        registry.addInterceptor(loginInterceptor)
                // 拦截所有 /api/** 请求
                .addPathPatterns("/api/**")
                // 排除不需要登录的接口
                .excludePathPatterns(
                        "/api/auth/login",      // 登录
                        "/api/auth/register",   // 注册
                        "/api/big-screen/task-reminder", // 任务提醒大屏公开只读数据
                        "/api/user/info",       // 用户信息（前端框架需要）
                        "/api/v3/system/menus/simple"  // 菜单数据（前端框架需要）
                );
    }

    @Override
    public void addCorsMappings(CorsRegistry registry) {
        registry.addMapping("/**")
                .allowedOriginPatterns("*")  // 使用 allowedOriginPatterns 而不是 allowedOrigins
                .allowedMethods("GET", "POST", "PUT", "DELETE", "OPTIONS")
                .allowedHeaders("*")
                .exposedHeaders("Authorization")
                .allowCredentials(true)
                .maxAge(3600);
    }
}
