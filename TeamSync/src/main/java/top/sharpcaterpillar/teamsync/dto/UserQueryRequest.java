package top.sharpcaterpillar.teamsync.dto;

import lombok.Data;

/**
 * 用户查询请求 DTO
 */
@Data
public class UserQueryRequest {

    /**
     * 当前页码
     */
    private Integer current = 1;

    /**
     * 每页大小
     */
    private Integer size = 20;

    /**
     * 用户名（模糊搜索）
     */
    private String username;

    /**
     * 手机号（模糊搜索）
     */
    private String userPhone;

    /**
     * 邮箱（模糊搜索）
     */
    private String userEmail;

    /**
     * 性别
     */
    private Integer userGender;

    /**
     * 状态
     */
    private String status;
}
