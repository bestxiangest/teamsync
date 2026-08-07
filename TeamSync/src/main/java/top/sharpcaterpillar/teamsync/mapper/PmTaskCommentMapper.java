package top.sharpcaterpillar.teamsync.mapper;

import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import org.apache.ibatis.annotations.Mapper;
import top.sharpcaterpillar.teamsync.entity.PmTaskComment;

/**
 * 任务评论表 Mapper 接口
 */
@Mapper
public interface PmTaskCommentMapper extends BaseMapper<PmTaskComment> {

}

