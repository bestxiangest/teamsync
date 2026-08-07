package top.sharpcaterpillar.teamsync.dto;

import lombok.Data;
import java.util.ArrayList;
import java.util.List;

/**
 * 阶段 DTO (用于看板展示)
 */
@Data
public class StageDTO {

    /**
     * 阶段ID
     */
    private Long id;

    /**
     * 所属项目ID
     */
    private Long projectId;

    /**
     * 阶段名称
     */
    private String name;

    /**
     * 排序索引
     */
    private Integer sort;

    /**
     * 该阶段下的任务列表
     */
    private List<TaskDTO> tasks = new ArrayList<>();

}

