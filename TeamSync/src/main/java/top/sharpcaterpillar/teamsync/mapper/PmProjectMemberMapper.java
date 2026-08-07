package top.sharpcaterpillar.teamsync.mapper;

import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import org.apache.ibatis.annotations.Mapper;
import top.sharpcaterpillar.teamsync.entity.PmProjectMember;

/**
 * 项目成员表 Mapper 接口
 */
@Mapper
public interface PmProjectMemberMapper extends BaseMapper<PmProjectMember> {

}

