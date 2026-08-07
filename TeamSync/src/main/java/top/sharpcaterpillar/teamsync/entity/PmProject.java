package top.sharpcaterpillar.teamsync.entity;

import com.baomidou.mybatisplus.annotation.IdType;
import com.baomidou.mybatisplus.annotation.TableField;
import com.baomidou.mybatisplus.annotation.TableId;
import com.baomidou.mybatisplus.annotation.TableLogic;
import com.baomidou.mybatisplus.annotation.TableName;

import java.time.LocalDateTime;

/**
 * 项目表
 */
@TableName("pm_project")
public class PmProject {

    /**
     * 主键ID
     */
    @TableId(type = IdType.AUTO)
    private Long id;

    /**
     * 项目名称
     */
    @TableField("name")
    private String name;

    /**
     * 项目简介
     */
    @TableField("description")
    private String description;

    /**
     * 项目拥有者ID
     */
    @TableField("owner_id")
    private Long ownerId;

    /**
     * 分组ID（0 表示根目录）
     */
    @TableField("group_id")
    private Long groupId;

    /**
     * 项目进度(0-100)
     */
    @TableField("progress")
    private Integer progress;

    /**
     * 是否删除 0:正常 1:删除
     */
    @TableLogic
    @TableField("is_deleted")
    private Integer isDeleted;

    /**
     * 是否归档 0:活跃 1:已归档
     */
    @TableField("is_archived")
    private Integer isArchived;

    /**
     * 创建时间
     */
    @TableField("created_at")
    private LocalDateTime createdAt;

    /**
     * 更新时间
     */
    @TableField("updated_at")
    private LocalDateTime updatedAt;

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public Long getOwnerId() {
        return ownerId;
    }

    public void setOwnerId(Long ownerId) {
        this.ownerId = ownerId;
    }

    public Long getGroupId() {
        return groupId;
    }

    public void setGroupId(Long groupId) {
        this.groupId = groupId;
    }

    public Integer getProgress() {
        return progress;
    }

    public void setProgress(Integer progress) {
        this.progress = progress;
    }

    public Integer getIsDeleted() {
        return isDeleted;
    }

    public void setIsDeleted(Integer isDeleted) {
        this.isDeleted = isDeleted;
    }

    public Integer getIsArchived() {
        return isArchived;
    }

    public void setIsArchived(Integer isArchived) {
        this.isArchived = isArchived;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }

    public LocalDateTime getUpdatedAt() {
        return updatedAt;
    }

    public void setUpdatedAt(LocalDateTime updatedAt) {
        this.updatedAt = updatedAt;
    }
}
