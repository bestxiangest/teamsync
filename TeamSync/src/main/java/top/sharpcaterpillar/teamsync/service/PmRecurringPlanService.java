package top.sharpcaterpillar.teamsync.service;

import com.baomidou.mybatisplus.extension.service.IService;
import top.sharpcaterpillar.teamsync.dto.RecurringPlanCreateRequest;
import top.sharpcaterpillar.teamsync.dto.RecurringPlanGenerateTaskResponse;
import top.sharpcaterpillar.teamsync.dto.RecurringPlanOccurrenceActionRequest;
import top.sharpcaterpillar.teamsync.dto.RecurringPlanOccurrenceQueryRequest;
import top.sharpcaterpillar.teamsync.dto.RecurringPlanQueryRequest;
import top.sharpcaterpillar.teamsync.dto.RecurringPlanUpdateRequest;
import top.sharpcaterpillar.teamsync.entity.PmRecurringPlan;
import top.sharpcaterpillar.teamsync.vo.PageVO;
import top.sharpcaterpillar.teamsync.vo.RecurringPlanOccurrenceVO;
import top.sharpcaterpillar.teamsync.vo.RecurringPlanVO;

/**
 * 周期计划 Service。
 */
public interface PmRecurringPlanService extends IService<PmRecurringPlan> {

    PageVO<RecurringPlanVO> listPlans(RecurringPlanQueryRequest request, Long operatorId);

    RecurringPlanVO getPlan(Long planId, Long operatorId);

    RecurringPlanVO createPlan(RecurringPlanCreateRequest request, Long creatorId);

    RecurringPlanVO updatePlan(Long planId, RecurringPlanUpdateRequest request, Long operatorId);

    RecurringPlanVO updateStatus(Long planId, String status, Long operatorId);

    PageVO<RecurringPlanOccurrenceVO> listOccurrences(Long planId,
                                                      RecurringPlanOccurrenceQueryRequest request,
                                                      Long operatorId);

    RecurringPlanGenerateTaskResponse generateCurrentOccurrenceTask(Long planId, Long operatorId);

    RecurringPlanVO completeCurrentOccurrence(Long planId,
                                              RecurringPlanOccurrenceActionRequest request,
                                              Long operatorId);

    RecurringPlanVO skipCurrentOccurrence(Long planId,
                                          RecurringPlanOccurrenceActionRequest request,
                                          Long operatorId);

    RecurringPlanVO deferCurrentOccurrence(Long planId,
                                           RecurringPlanOccurrenceActionRequest request,
                                           Long operatorId);

    void deletePlan(Long planId, Long operatorId);
}
