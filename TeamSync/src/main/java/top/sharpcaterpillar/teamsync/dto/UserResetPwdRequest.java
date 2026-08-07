package top.sharpcaterpillar.teamsync.dto;

import lombok.Data;

/**
 * 用户重置密码请求 DTO
 */
@Data
public class UserResetPwdRequest {

    /**
     * 用户ID
     */
    private Long id;

    /**
     * 新密码
     */
    private String newPassword;
}
