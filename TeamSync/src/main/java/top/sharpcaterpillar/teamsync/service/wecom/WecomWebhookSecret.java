package top.sharpcaterpillar.teamsync.service.wecom;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import javax.crypto.Cipher;
import javax.crypto.spec.GCMParameterSpec;
import javax.crypto.spec.SecretKeySpec;
import java.net.URI;
import java.nio.ByteBuffer;
import java.nio.charset.StandardCharsets;
import java.security.SecureRandom;
import java.util.Base64;

/** Webhook 仅在服务端解密使用，不返回客户端或写入日志。 */
@Component
public class WecomWebhookSecret {
    private final byte[] key;
    private final SecureRandom random = new SecureRandom();

    public WecomWebhookSecret(@Value("${teamsync.wecom.encryption-key:}") String configuredKey) {
        byte[] decoded;
        try {
            decoded = Base64.getDecoder().decode(configuredKey);
        } catch (IllegalArgumentException e) {
            decoded = new byte[0];
        }
        key = decoded.length == 32 ? decoded : null;
    }

    public boolean isReady() { return key != null; }

    public static String validateUrl(String value) {
        String url = value == null ? "" : value.trim();
        try {
            URI uri = URI.create(url);
            if ("https".equals(uri.getScheme()) && "qyapi.weixin.qq.com".equals(uri.getHost())
                    && uri.getPort() == -1 && uri.getUserInfo() == null && uri.getFragment() == null
                    && "/cgi-bin/webhook/send".equals(uri.getRawPath()) && uri.getRawQuery() != null
                    && uri.getRawQuery().matches("key=[A-Za-z0-9_-]{1,200}")) {
                return url;
            }
        } catch (IllegalArgumentException ignored) {
            // 对外统一返回校验结果，避免在异常信息中泄露地址。
        }
        throw new IllegalArgumentException("请输入有效的企业微信消息推送 Webhook（https://qyapi.weixin.qq.com/cgi-bin/webhook/send?key=...）");
    }

    public String encrypt(String url) {
        requireKey();
        try {
            byte[] nonce = new byte[12];
            random.nextBytes(nonce);
            Cipher cipher = cipher(Cipher.ENCRYPT_MODE, nonce);
            byte[] encrypted = cipher.doFinal(validateUrl(url).getBytes(StandardCharsets.UTF_8));
            return "v1:" + Base64.getEncoder().encodeToString(
                    ByteBuffer.allocate(nonce.length + encrypted.length).put(nonce).put(encrypted).array());
        } catch (IllegalArgumentException e) {
            throw e;
        } catch (Exception e) {
            throw new IllegalStateException("Webhook 加密失败");
        }
    }

    public String decrypt(String encrypted) {
        requireKey();
        try {
            if (!encrypted.startsWith("v1:")) throw new IllegalArgumentException();
            ByteBuffer buffer = ByteBuffer.wrap(Base64.getDecoder().decode(encrypted.substring(3)));
            byte[] nonce = new byte[12];
            buffer.get(nonce);
            byte[] payload = new byte[buffer.remaining()];
            buffer.get(payload);
            return validateUrl(new String(cipher(Cipher.DECRYPT_MODE, nonce).doFinal(payload), StandardCharsets.UTF_8));
        } catch (Exception e) {
            throw new IllegalStateException("Webhook 解密失败，请确认加密密钥未变更，或重新保存 Webhook");
        }
    }

    private Cipher cipher(int mode, byte[] nonce) throws Exception {
        Cipher cipher = Cipher.getInstance("AES/GCM/NoPadding");
        cipher.init(mode, new SecretKeySpec(key, "AES"), new GCMParameterSpec(128, nonce));
        return cipher;
    }

    private void requireKey() {
        if (!isReady()) throw new IllegalStateException("请先配置 TEAMSYNC_WECOM_ENCRYPTION_KEY（Base64 编码的 32 字节密钥）");
    }
}
