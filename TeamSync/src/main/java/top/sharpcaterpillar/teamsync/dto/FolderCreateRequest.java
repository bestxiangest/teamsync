package top.sharpcaterpillar.teamsync.dto;

import lombok.Data;

/**
 * 创建文件夹请求
 */
@Data
public class FolderCreateRequest {

    /**
     * 项目ID
     */
    private Long projectId;

    /**
     * 父文件夹ID，0表示根目录
     */
    private Long parentId;

    /**
     * 文件夹名称
     */
    private String name;
}
