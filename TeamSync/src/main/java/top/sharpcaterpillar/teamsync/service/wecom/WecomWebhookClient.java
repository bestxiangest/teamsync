package top.sharpcaterpillar.teamsync.service.wecom;

import com.fasterxml.jackson.databind.JsonNode;
import org.springframework.http.MediaType;
import org.springframework.http.client.JdkClientHttpRequestFactory;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestClient;

import java.net.URI;
import java.net.http.HttpClient;
import java.nio.charset.StandardCharsets;
import java.time.Duration;
import java.util.Map;

/** 只访问企业微信官方 HTTPS 地址；不跟随重定向，也不重试结果未知的发送。 */
@Component
public class WecomWebhookClient {
    private final RestClient client;

    public WecomWebhookClient() {
        HttpClient http = HttpClient.newBuilder().connectTimeout(Duration.ofSeconds(5))
                .followRedirects(HttpClient.Redirect.NEVER).build();
        JdkClientHttpRequestFactory factory = new JdkClientHttpRequestFactory(http);
        factory.setReadTimeout(Duration.ofSeconds(10));
        client = RestClient.builder().requestFactory(factory).build();
    }

    WecomWebhookClient(RestClient client) { this.client = client; }

    public void send(String webhook, String content) {
        URI uri = URI.create(WecomWebhookSecret.validateUrl(webhook));
        if (content.getBytes(StandardCharsets.UTF_8).length > 4096) {
            throw new IllegalArgumentException("推送消息超出 4096 字节限制");
        }
        try {
            JsonNode response = client.post().uri(uri).contentType(MediaType.APPLICATION_JSON)
                    .body(Map.of("msgtype", "markdown_v2", "markdown_v2", Map.of("content", content)))
                    .retrieve().body(JsonNode.class);
            if (response == null || !response.path("errcode").isIntegralNumber()) {
                throw new IllegalStateException("企业微信返回格式异常，请核对群内消息");
            }
            if (response.path("errcode").asInt() != 0) {
                // 不保存远端 errmsg，避免第三方错误文本带回凭证或其他敏感信息。
                throw new IllegalStateException("企业微信拒绝推送，错误码：" + response.path("errcode").asInt());
            }
        } catch (IllegalStateException e) {
            throw e;
        } catch (Exception e) {
            throw new IllegalStateException("企业微信请求失败或超时，请核对网络和群内消息后再手动推送");
        }
    }
}
