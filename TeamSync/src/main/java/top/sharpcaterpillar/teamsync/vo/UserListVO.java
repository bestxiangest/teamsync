package top.sharpcaterpillar.teamsync.vo;

import com.fasterxml.jackson.annotation.JsonFormat;
import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.Data;

import java.time.LocalDateTime;

/**
 * 用户列表项 VO
 * 字段名称与前端 UserListItem 类型对齐
 */
@Data
public class UserListVO {

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
     * 头像URL
     */
    private String avatar;

    /**
     * 邮箱 - 前端字段名: userEmail
     */
    @JsonProperty("userEmail")
    private String email;

    /**
     * 手机号 - 前端字段名: userPhone
     */
    @JsonProperty("userPhone")
    private String phone;

    /**
     * 性别 - 前端字段名: userGender
     * 0-未知 1-男 2-女，前端显示为 "男"/"女"
     */
    @JsonProperty("userGender")
    private String gender;

    /**
     * 状态 - 前端期望字符串类型
     * 1-正常/在线 2-离线 3-异常 4-禁用/注销
     */
    private String status;

    /**
     * 是否管理员
     */
    private Boolean isAdmin;

    /**
     * 创建时间 - 前端字段名: createTime
     */
    @JsonProperty("createTime")
    @JsonFormat(pattern = "yyyy-MM-dd HH:mm:ss")
    private LocalDateTime createdAt;
}


