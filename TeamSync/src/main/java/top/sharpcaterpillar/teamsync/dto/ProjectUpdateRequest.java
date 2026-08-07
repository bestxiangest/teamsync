package top.sharpcaterpillar.teamsync.dto;

import lombok.Data;

/**
 * 项目更新请求 DTO
 */
import com.fasterxml.jackson.annotation.JsonProperty;

public class ProjectUpdateRequest {

    /**
     * 项目名称（可选）
     */
    @JsonProperty("name")
    private String name;

    /**
     * 项目简介（可选）
     */
    @JsonProperty("description")
    private String description;

    /**
     * 项目进度 0-100（可选）
     */
    @JsonProperty("progress")
    private Integer progress;

    /**
     * 分组ID (可选，0表示根目录)
     */
    @JsonProperty("groupId")
    private Long groupId;

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

    public Integer getProgress() {
        return progress;
    }

    public void setProgress(Integer progress) {
        this.progress = progress;
    }

    public Long getGroupId() {
        return groupId;
    }

    public void setGroupId(Long groupId) {
        this.groupId = groupId;
    }
}

