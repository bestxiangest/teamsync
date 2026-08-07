package top.sharpcaterpillar.teamsync.dto;

import lombok.Data;

/**
 * 用户更新请求 DTO
 */
@Data
public class UserUpdateRequest {

    /**
     * 用户ID
     */
    private Long id;

    /**
     * 用户名
     */
    private String username;

    /**
     * 昵称
     */
    private String nickname;

    /**
     * 手机号
     */
    private String userPhone;

    /**
     * 邮箱
     */
    private String userEmail;

    /**
     * 性别：0-未知 1-男 2-女
     */
    private Integer userGender;

    /**
     * 状态：1-正常 2-离线 3-异常 4-禁用
     */
    private String status;

    /**
     * 头像URL
     */
    private String avatar;

    /**
     * 是否管理员
     */
    private Boolean isAdmin;
}
