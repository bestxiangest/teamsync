package top.sharpcaterpillar.teamsync.utils;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import javax.crypto.SecretKey;
import java.nio.charset.StandardCharsets;
import java.util.Date;

/**
 * JWT 工具类
 */
@Component
public class JwtUtils {

    private static final Logger log = LoggerFactory.getLogger(JwtUtils.class);

    /**
     * JWT 密钥（至少32字符）
     */
    @Value("${jwt.secret:TeamSync2026SecretKeyForJwtToken!}")
    private String secret;

    /**
     * Token 有效期（毫秒），默认24小时
     */
    @Value("${jwt.expiration:86400000}")
    private Long expiration;

    /**
     * 获取签名密钥
     */
    private SecretKey getSigningKey() {
        return Keys.hmacShaKeyFor(secret.getBytes(StandardCharsets.UTF_8));
    }

    /**
     * 生成 JWT Token
     *
     * @param userId   用户ID
     * @param username 用户名
     * @return JWT Token
     */
    public String generateToken(Long userId, String username) {
        Date now = new Date();
        Date expiryDate = new Date(now.getTime() + expiration);

        return Jwts.builder()
                .subject(String.valueOf(userId))
                .claim("username", username)
                .issuedAt(now)
                .expiration(expiryDate)
                .signWith(getSigningKey())
                .compact();
    }

    /**
     * 解析 Token 获取 Claims
     *
     * @param token JWT Token
     * @return Claims 对象，解析失败返回 null
     */
    public Claims getClaimsByToken(String token) {
        try {
            return Jwts.parser()
                    .verifyWith(getSigningKey())
                    .build()
                    .parseSignedClaims(token)
                    .getPayload();
        } catch (Exception e) {
            log.error("JWT Token 解析失败: {}", e.getMessage());
            return null;
        }
    }

    /**
     * 从 Token 中获取用户ID
     *
     * @param token JWT Token
     * @return 用户ID，解析失败返回 null
     */
    public Long getUserIdFromToken(String token) {
        Claims claims = getClaimsByToken(token);
        if (claims != null) {
            return Long.parseLong(claims.getSubject());
        }
        return null;
    }

    /**
     * 从 Token 中获取用户名
     *
     * @param token JWT Token
     * @return 用户名，解析失败返回 null
     */
    public String getUsernameFromToken(String token) {
        Claims claims = getClaimsByToken(token);
        if (claims != null) {
            return claims.get("username", String.class);
        }
        return null;
    }

    /**
     * 校验 Token 是否有效
     *
     * @param token JWT Token
     * @return 是否有效
     */
    public boolean validateToken(String token) {
        return getClaimsByToken(token) != null;
    }

}
