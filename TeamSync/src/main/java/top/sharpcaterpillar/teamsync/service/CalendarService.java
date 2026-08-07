package top.sharpcaterpillar.teamsync.service;

import top.sharpcaterpillar.teamsync.dto.CalendarEventQueryRequest;
import top.sharpcaterpillar.teamsync.vo.AssigneeVO;
import top.sharpcaterpillar.teamsync.vo.CalendarEventVO;

import java.util.List;

/**
 * 日历视图服务。
 */
public interface CalendarService {

    List<CalendarEventVO> listEvents(CalendarEventQueryRequest request, Long operatorId);

    List<AssigneeVO> listAssignees(Long projectId, Long operatorId);
}
