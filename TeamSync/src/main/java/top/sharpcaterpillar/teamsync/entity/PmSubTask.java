package top.sharpcaterpillar.teamsync.entity;

import com.baomidou.mybatisplus.annotation.IdType;
import com.baomidou.mybatisplus.annotation.TableId;
import com.baomidou.mybatisplus.annotation.TableName;
import lombok.Data;

import java.time.LocalDateTime;

/**
 * 子任务/检查项表
 */
@Data
@TableName("pm_sub_task")
public class PmSubTask {

    /**
     * 主键ID
     */
    @TableId(type = IdType.AUTO)
    private Long id;

    /**
     * 所属任务ID
     */
    private Long taskId;

    /**
     * 子任务内容
     */
    private String content;

    /**
     * 状态 0:未开始 1:已完成 2:处理中
     */
    private Integer status;

    /**
     * 排序(从上到下)
     */
    private Integer sort;

    /**
     * 截止时间
     */
    private LocalDateTime dueTime;

    /**
     * 创建时间
     */
    private LocalDateTime createdAt;

}
