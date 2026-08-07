package top.sharpcaterpillar.teamsync.vo;

import lombok.Data;

import java.time.LocalDateTime;

/**
 * 文件节点响应VO
 */
@Data
public class FileNodeVO {

    private Long id;

    private Long projectId;

    private Long parentId;

    /**
     * 节点类型：0-文件夹 1-文件
     */
    private Integer nodeType;

    private String name;

    private String fileUrl;

    private Long fileSize;

    private String extension;

    /**
     * 关联任务ID，项目资料为空
     */
    private Long taskId;

    private Long creatorId;

    /**
     * 创建人昵称
     */
    private String creatorName;

    private LocalDateTime createdAt;

    private LocalDateTime updatedAt;

    /**
     * 格式化后的文件大小（如 1.5 MB）
     */
    private String fileSizeFormatted;
}
