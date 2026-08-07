package top.sharpcaterpillar.teamsync.vo;

import lombok.Data;

import java.util.List;

/**
 * 分页结果 VO
 * @param <T> 数据项类型
 */
@Data
public class PageVO<T> {

    /**
     * 数据列表
     */
    private List<T> records;

    /**
     * 总记录数
     */
    private Long total;

    /**
     * 当前页码
     */
    private Integer current;

    /**
     * 每页大小
     */
    private Integer size;

    /**
     * 构建分页结果
     */
    public static <T> PageVO<T> of(List<T> records, Long total, Integer current, Integer size) {
        PageVO<T> pageVO = new PageVO<>();
        pageVO.setRecords(records);
        pageVO.setTotal(total);
        pageVO.setCurrent(current);
        pageVO.setSize(size);
        return pageVO;
    }
}
