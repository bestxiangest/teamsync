package top.sharpcaterpillar.teamsync.dto;

import lombok.Data;

/**
 * 重命名文件/文件夹请求
 */
@Data
public class FileRenameRequest {

    /**
     * 新名称
     */
    private String name;
}
