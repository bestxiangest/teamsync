package top.sharpcaterpillar.teamsync.vo;

import lombok.Data;
import java.util.List;

/**
 * 用户信息 VO
 */
@Data
public class UserInfoVO {

    /**
     * 用户ID
     */
    private Long userId;

    /**
     * 用户名
     */
    private String username;

    /**
     * 昵称
     */
    private String nickname;

    /**
     * 邮箱
     */
    private String email;

    /**
     * 用户角色列表
     */
    private List<String> roles;

    /**
     * 是否平台管理员
     */
    private Boolean isAdmin;

    /**
     * 头像
     */
    private String avatar;

}
