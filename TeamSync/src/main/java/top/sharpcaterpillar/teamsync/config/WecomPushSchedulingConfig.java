package top.sharpcaterpillar.teamsync.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.scheduling.concurrent.ThreadPoolTaskScheduler;

/** 为扫描、发送和现有邮件扫描预留线程，避免出站请求阻塞推送时间点扫描。 */
@Configuration
public class WecomPushSchedulingConfig {
    @Bean
    public ThreadPoolTaskScheduler wecomPushTaskScheduler() {
        ThreadPoolTaskScheduler scheduler = new ThreadPoolTaskScheduler();
        scheduler.setPoolSize(3);
        scheduler.setThreadNamePrefix("teamsync-scheduled-");
        return scheduler;
    }
}
