package top.sharpcaterpillar.teamsync.service.wecom;

import org.junit.jupiter.api.Test;
import org.springframework.http.HttpMethod;
import org.springframework.http.MediaType;
import org.springframework.test.web.client.MockRestServiceServer;
import org.springframework.web.client.RestClient;

import static org.assertj.core.api.Assertions.*;
import static org.springframework.test.web.client.match.MockRestRequestMatchers.*;
import static org.springframework.test.web.client.response.MockRestResponseCreators.*;

class WecomWebhookClientTest {
    private final String url = "https://qyapi.weixin.qq.com/cgi-bin/webhook/send?key=test-key";

    @Test
    void postsMarkdownV2AndChecksBusinessSuccess() {
        RestClient.Builder builder = RestClient.builder();
        MockRestServiceServer server = MockRestServiceServer.bindTo(builder).build();
        server.expect(requestTo(url)).andExpect(method(HttpMethod.POST))
                .andExpect(content().json("{\"msgtype\":\"markdown_v2\",\"markdown_v2\":{\"content\":\"任务报告\"}}"))
                .andRespond(withSuccess("{\"errcode\":0,\"errmsg\":\"ok\"}", MediaType.APPLICATION_JSON));
        new WecomWebhookClient(builder.build()).send(url, "任务报告");
        server.verify();
    }

    @Test
    void handlesBusinessFailureWithoutExposingRemoteErrorTextOrWebhook() {
        RestClient.Builder builder = RestClient.builder();
        MockRestServiceServer server = MockRestServiceServer.bindTo(builder).build();
        server.expect(requestTo(url)).andRespond(withSuccess("{\"errcode\":93000,\"errmsg\":\"secret test-key\"}", MediaType.APPLICATION_JSON));
        assertThatThrownBy(() -> new WecomWebhookClient(builder.build()).send(url, "报告"))
                .hasMessageContaining("93000").hasMessageNotContaining("test-key");
        server.verify();
    }

    @Test
    void handlesMissingErrcodeAndHttpFailureAsFailure() {
        for (boolean httpError : new boolean[] { false, true }) {
            RestClient.Builder builder = RestClient.builder();
            MockRestServiceServer server = MockRestServiceServer.bindTo(builder).build();
            server.expect(requestTo(url)).andRespond(httpError ? withServerError() : withSuccess("{}", MediaType.APPLICATION_JSON));
            assertThatThrownBy(() -> new WecomWebhookClient(builder.build()).send(url, "报告"))
                    .isInstanceOf(IllegalStateException.class).hasMessageNotContaining("test-key");
            server.verify();
        }
    }
}
