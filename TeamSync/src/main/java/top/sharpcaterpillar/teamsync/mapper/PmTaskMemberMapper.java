package top.sharpcaterpillar.teamsync.mapper;

import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import org.apache.ibatis.annotations.Mapper;
import top.sharpcaterpillar.teamsync.entity.PmTaskMember;

/**
 * 任务成员关联表 Mapper 接口
 */
@Mapper
public interface PmTaskMemberMapper extends BaseMapper<PmTaskMember> {

}

