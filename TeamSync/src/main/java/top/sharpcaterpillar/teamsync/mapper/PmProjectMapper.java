package top.sharpcaterpillar.teamsync.mapper;

import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import org.apache.ibatis.annotations.Mapper;
import top.sharpcaterpillar.teamsync.entity.PmProject;

import org.apache.ibatis.annotations.Param;
import java.util.List;

/**
 * 项目表 Mapper 接口
 */
@Mapper
public interface PmProjectMapper extends BaseMapper<PmProject> {

    List<PmProject> selectProjectsWithGroup(@Param("userId") Long userId,
                                            @Param("archived") Integer archived,
                                            @Param("groupId") Long groupId,
                                            @Param("isAdmin") boolean isAdmin);

}
