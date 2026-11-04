package top.sharpcaterpillar.teamsync.schedule;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;
import top.sharpcaterpillar.teamsync.service.wecom.WecomPushService;

import java.time.LocalDateTime;
import java.time.ZoneId;

@Component
public class WecomPushScheduler {
    private static final Logger log = LoggerFactory.getLogger(WecomPushScheduler.class);
    private final WecomPushService service;

    public WecomPushScheduler(WecomPushService service) { this.service = service; }

    @Scheduled(cron = "*/15 * * * * *", zone = "Asia/Shanghai", scheduler = "wecomPushTaskScheduler")
    public void enqueue() {
        try {
            service.schedule(LocalDateTime.now(ZoneId.of("Asia/Shanghai")));
        } catch (Exception e) {
            log.error("企业微信定时任务入队失败，请确认数据库增量脚本与推送配置，异常类型={}", e.getClass().getSimpleName());
        }
    }

    @Scheduled(fixedDelay = 3500, scheduler = "wecomPushTaskScheduler")
    public void dispatch() {
        try {
            service.dispatchOne();
        } catch (Exception e) {
            log.error("企业微信推送队列处理失败，异常类型={}", e.getClass().getSimpleName());
        }
    }
}
