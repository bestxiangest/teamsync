package top.sharpcaterpillar.teamsync.mapper;

import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import org.apache.ibatis.annotations.Mapper;
import top.sharpcaterpillar.teamsync.entity.PmRecurringPlanAssignee;

/**
 * 周期计划负责人 Mapper。
 */
@Mapper
public interface PmRecurringPlanAssigneeMapper extends BaseMapper<PmRecurringPlanAssignee> {
}
