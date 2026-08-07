package top.sharpcaterpillar.teamsync.entity;

import com.baomidou.mybatisplus.annotation.IdType;
import com.baomidou.mybatisplus.annotation.TableId;
import com.baomidou.mybatisplus.annotation.TableLogic;
import com.baomidou.mybatisplus.annotation.TableName;
import lombok.Data;

import java.time.LocalDateTime;

/**
 * 任务表
 */
@TableName("pm_task")
public class PmTask {

    /**
     * 主键ID
     */
    @TableId(type = IdType.AUTO)
    private Long id;

    /**
     * 项目ID（冗余字段，方便查询）
     */
    private Long projectId;

    /**
     * 当前处于哪个阶段列
     */
    private Long stageId;

    /**
     * 任务标题
     */
    private String title;

    /**
     * 任务详情
     */
    private String description;

    /**
     * 优先级 1:普通 2:紧急 3:非常紧急
     */
    private Integer priority;

    /**
     * 任务状态 0:未开始 1:已完成 2:处理中
     */
    private Integer status;

    /**
     * 开始时间
     */
    private LocalDateTime startTime;

    /**
     * 截止时间
     */
    private LocalDateTime dueTime;

    /**
     * 创建人ID
     */
    private Long creatorId;

    /**
     * 在列内的排序(从上到下)
     */
    private Integer sort;

    /**
     * 是否删除 0:正常 1:删除
     */
    @TableLogic
    private Integer isDeleted;

    /**
     * 创建时间
     */
    private LocalDateTime createdAt;

    /**
     * 更新时间
     */
    private LocalDateTime updatedAt;

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public Long getProjectId() {
        return projectId;
    }

    public void setProjectId(Long projectId) {
        this.projectId = projectId;
    }

    public Long getStageId() {
        return stageId;
    }

    public void setStageId(Long stageId) {
        this.stageId = stageId;
    }

    public String getTitle() {
        return title;
    }

    public void setTitle(String title) {
        this.title = title;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public Integer getPriority() {
        return priority;
    }

    public void setPriority(Integer priority) {
        this.priority = priority;
    }

    public Integer getStatus() {
        return status;
    }

    public void setStatus(Integer status) {
        this.status = status;
    }

    public LocalDateTime getStartTime() {
        return startTime;
    }

    public void setStartTime(LocalDateTime startTime) {
        this.startTime = startTime;
    }

    public LocalDateTime getDueTime() {
        return dueTime;
    }

    public void setDueTime(LocalDateTime dueTime) {
        this.dueTime = dueTime;
    }

    public Long getCreatorId() {
        return creatorId;
    }

    public void setCreatorId(Long creatorId) {
        this.creatorId = creatorId;
    }

    public Integer getSort() {
        return sort;
    }

    public void setSort(Integer sort) {
        this.sort = sort;
    }

    public Integer getIsDeleted() {
        return isDeleted;
    }

    public void setIsDeleted(Integer isDeleted) {
        this.isDeleted = isDeleted;
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

