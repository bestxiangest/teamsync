package top.sharpcaterpillar.teamsync.config;

import org.springframework.context.annotation.Configuration;
import org.springframework.messaging.simp.config.MessageBrokerRegistry;
import org.springframework.web.socket.config.annotation.EnableWebSocketMessageBroker;
import org.springframework.web.socket.config.annotation.StompEndpointRegistry;
import org.springframework.web.socket.config.annotation.WebSocketMessageBrokerConfigurer;

/**
 * WebSocket 配置类
 * 使用 STOMP 协议进行消息传递
 */
@Configuration
@EnableWebSocketMessageBroker
public class WebSocketConfig implements WebSocketMessageBrokerConfigurer {

    /**
     * 配置消息代理
     */
    @Override
    public void configureMessageBroker(MessageBrokerRegistry config) {
        // 启用简单的内存消息代理，客户端订阅 /topic 前缀的主题
        config.enableSimpleBroker("/topic");
        // 客户端发送消息的目标前缀（如果需要客户端向服务器发消息）
        config.setApplicationDestinationPrefixes("/app");
    }

    /**
     * 注册 STOMP 端点
     */
    @Override
    public void registerStompEndpoints(StompEndpointRegistry registry) {
        // 注册 WebSocket 端点，客户端通过 /ws 连接
        registry.addEndpoint("/ws")
                .setAllowedOriginPatterns("*");  // 允许跨域
    }

}

