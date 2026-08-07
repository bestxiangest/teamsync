package top.sharpcaterpillar.teamsync.dto;

import lombok.Data;

/**
 * 创建项目请求 DTO
 */
import com.fasterxml.jackson.annotation.JsonProperty;

public class ProjectCreateRequest {

    /**
     * 项目名称
     */
    @JsonProperty("name")
    private String name;

    /**
     * 项目简介
     */
    @JsonProperty("description")
    private String description;

    /**
     * 分组ID (0表示根目录)
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

    public Long getGroupId() {
        return groupId;
    }

    public void setGroupId(Long groupId) {
        this.groupId = groupId;
    }
}

