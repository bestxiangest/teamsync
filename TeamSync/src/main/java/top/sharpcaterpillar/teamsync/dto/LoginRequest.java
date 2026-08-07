package top.sharpcaterpillar.teamsync.dto;

import lombok.Data;

/**
 * 登录请求 DTO
 */
@Data
public class LoginRequest {

    /**
     * 用户名
     */
    private String userName;

    /**
     * 密码
     */
    private String password;

}

