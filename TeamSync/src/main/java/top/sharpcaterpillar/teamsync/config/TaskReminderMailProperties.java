package top.sharpcaterpillar.teamsync.config;

import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.stereotype.Component;

/**
 * 任务邮件提醒配置
 */
@Component
@ConfigurationProperties(prefix = "teamsync.mail.reminder")
public class TaskReminderMailProperties {

    private boolean enabled = false;

    private String fromAddress;

    private String fromName = "TeamSync";

    private String frontendBaseUrl;

    public boolean isEnabled() {
        return enabled;
    }

    public void setEnabled(boolean enabled) {
        this.enabled = enabled;
    }

    public String getFromAddress() {
        return fromAddress;
    }

    public void setFromAddress(String fromAddress) {
        this.fromAddress = fromAddress;
    }

    public String getFromName() {
        return fromName;
    }

    public void setFromName(String fromName) {
        this.fromName = fromName;
    }

    public String getFrontendBaseUrl() {
        return frontendBaseUrl;
    }

    public void setFrontendBaseUrl(String frontendBaseUrl) {
        this.frontendBaseUrl = frontendBaseUrl;
    }
}
