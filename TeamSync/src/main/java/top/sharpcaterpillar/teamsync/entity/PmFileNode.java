package top.sharpcaterpillar.teamsync.entity;

import com.baomidou.mybatisplus.annotation.IdType;
import com.baomidou.mybatisplus.annotation.TableId;
import com.baomidou.mybatisplus.annotation.TableLogic;
import com.baomidou.mybatisplus.annotation.TableName;
import lombok.Data;

import java.time.LocalDateTime;

/**
 * 项目文档节点表（文件夹/文件统一管理）
 */
@Data
@TableName("pm_file_node")
public class PmFileNode {

    /**
     * 主键ID
     */
    @TableId(type = IdType.AUTO)
    private Long id;

    /**
     * 所属项目ID
     */
    private Long projectId;

    /**
     * 父节点ID，0表示根目录
     */
    private Long parentId;

    /**
     * 节点类型：0-文件夹 1-文件
     */
    private Integer nodeType;

    /**
     * 文件名或文件夹名
     */
    private String name;

    /**
     * 文件存储路径（仅文件类型有效）
     */
    private String fileUrl;

    /**
     * 文件大小（字节，仅文件类型有效）
     */
    private Long fileSize;

    /**
     * 文件后缀
     */
    private String extension;

    /**
     * 关联任务ID，项目资料为空
     */
    private Long taskId;

    /**
     * 创建人ID
     */
    private Long creatorId;

    /**
     * 是否删除：0-正常 1-已删除
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

    // ============ 常量定义 ============
    public static final int TYPE_FOLDER = 0;
    public static final int TYPE_FILE = 1;
}
