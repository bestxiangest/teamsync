package top.sharpcaterpillar.teamsync.mapper;

import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import org.apache.ibatis.annotations.Mapper;
import top.sharpcaterpillar.teamsync.entity.PmTaskLog;

/**
 * 任务操作日志表 Mapper 接口
 */
@Mapper
public interface PmTaskLogMapper extends BaseMapper<PmTaskLog> {

}

