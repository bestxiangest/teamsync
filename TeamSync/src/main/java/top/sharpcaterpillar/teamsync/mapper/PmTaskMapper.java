package top.sharpcaterpillar.teamsync.mapper;

import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import org.apache.ibatis.annotations.Mapper;
import top.sharpcaterpillar.teamsync.entity.PmTask;

/**
 * 任务表 Mapper 接口
 */
@Mapper
public interface PmTaskMapper extends BaseMapper<PmTask> {

}

