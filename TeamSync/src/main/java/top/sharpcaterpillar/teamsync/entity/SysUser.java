package top.sharpcaterpillar.teamsync.entity;

import com.baomidou.mybatisplus.annotation.IdType;
import com.baomidou.mybatisplus.annotation.IdType;
import com.baomidou.mybatisplus.annotation.TableField;
import com.baomidou.mybatisplus.annotation.TableId;
import com.baomidou.mybatisplus.annotation.TableName;
import lombok.Data;

import java.time.LocalDateTime;

/**
 * 用户表
 */
@Data
@TableName("sys_user")
public class SysUser {

    /**
     * 主键ID
     */
    @TableId(type = IdType.AUTO)
    private Long id;

    /**
     * 账号
     */
    private String username;

    /**
     * 加密密码
     */
    private String password;

    /**
     * 昵称/显示名
     */
    private String nickname;

    /**
     * 头像URL
     */
    private String avatar;

    /**
     * 邮箱
     */
    private String email;

    /**
     * 手机号
     */
    private String phone;

    /**
     * 性别：0-未知 1-男 2-女
     */
    private Integer gender;

    /**
     * 状态：1-正常 2-离线 3-异常 4-禁用
     */
    private Integer status;

    /**
     * 是否超级管理员
     */
    @TableField("is_admin")
    private Boolean isAdmin;

    /**
     * 创建时间
     */
    private LocalDateTime createdAt;

    /**
     * 更新时间
     */
    private LocalDateTime updatedAt;

    // 手动添加 Getter/Setter 以确保在 Lombok 失效的环境下也能编译通过
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public String getUsername() { return username; }
    public void setUsername(String username) { this.username = username; }
    public String getPassword() { return password; }
    public void setPassword(String password) { this.password = password; }
    public String getNickname() { return nickname; }
    public void setNickname(String nickname) { this.nickname = nickname; }
    public String getAvatar() { return avatar; }
    public void setAvatar(String avatar) { this.avatar = avatar; }
    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }
    public String getPhone() { return phone; }
    public void setPhone(String phone) { this.phone = phone; }
    public Integer getGender() { return gender; }
    public void setGender(Integer gender) { this.gender = gender; }
    public Integer getStatus() { return status; }
    public void setStatus(Integer status) { this.status = status; }
    public Boolean getIsAdmin() { return isAdmin; }
    public void setIsAdmin(Boolean isAdmin) { this.isAdmin = isAdmin; }
    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
    public LocalDateTime getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(LocalDateTime updatedAt) { this.updatedAt = updatedAt; }
}

