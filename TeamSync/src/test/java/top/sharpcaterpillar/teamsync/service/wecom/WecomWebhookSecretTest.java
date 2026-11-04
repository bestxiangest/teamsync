package top.sharpcaterpillar.teamsync.service.wecom;

import org.junit.jupiter.api.Test;
import java.util.Base64;
import static org.assertj.core.api.Assertions.*;

class WecomWebhookSecretTest {
    private final String url = "https://qyapi.weixin.qq.com/cgi-bin/webhook/send?key=test-key";
    private final String key = Base64.getEncoder().encodeToString(new byte[32]);

    @Test
    void encryptsWithFreshNonceAndAuthenticatesCiphertext() {
        WecomWebhookSecret secret = new WecomWebhookSecret(key);
        String first = secret.encrypt(url);
        assertThat(first).doesNotContain("test-key").isNotEqualTo(secret.encrypt(url));
        assertThat(secret.decrypt(first)).isEqualTo(url);
        byte[] otherKey = new byte[32]; otherKey[0] = 1;
        WecomWebhookSecret other = new WecomWebhookSecret(Base64.getEncoder().encodeToString(otherKey));
        assertThatThrownBy(() -> other.decrypt(first)).hasMessageContaining("解密失败");
        assertThatThrownBy(() -> secret.decrypt("v1:invalid")).hasMessageContaining("解密失败");
    }

    @Test
    void invalidOrMissingEncryptionKeyDoesNotPreventStartupButBlocksSecretStorage() {
        for (String invalid : new String[] { "", "invalid", Base64.getEncoder().encodeToString(new byte[16]) }) {
            WecomWebhookSecret secret = new WecomWebhookSecret(invalid);
            assertThat(secret.isReady()).isFalse();
            assertThatThrownBy(() -> secret.encrypt(url)).hasMessageContaining("TEAMSYNC_WECOM_ENCRYPTION_KEY");
        }
    }

    @Test
    void rejectsNonOfficialDestinationsCredentialsPortsRedirectsAndExtraQueryParameters() {
        for (String invalid : new String[] {
                "http://qyapi.weixin.qq.com/cgi-bin/webhook/send?key=x",
                "https://127.0.0.1/cgi-bin/webhook/send?key=x",
                "https://qyapi.weixin.qq.com.evil.example/cgi-bin/webhook/send?key=x",
                "https://user@qyapi.weixin.qq.com/cgi-bin/webhook/send?key=x",
                "https://qyapi.weixin.qq.com:443/cgi-bin/webhook/send?key=x",
                url + "&other=x", url + "#fragment", "https://qyapi.weixin.qq.com/other?key=x", url + "%0a" }) {
            assertThatThrownBy(() -> WecomWebhookSecret.validateUrl(invalid)).isInstanceOf(IllegalArgumentException.class)
                    .hasMessageNotContaining("test-key");
        }
    }
}
