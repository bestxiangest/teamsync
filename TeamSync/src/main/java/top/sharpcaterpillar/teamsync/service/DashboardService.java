package top.sharpcaterpillar.teamsync.service;

import top.sharpcaterpillar.teamsync.vo.DashboardOverviewVO;
import top.sharpcaterpillar.teamsync.vo.DashboardManagementVO;
import top.sharpcaterpillar.teamsync.vo.DashboardVO;

import java.time.LocalDate;

/**
 * 工作台 Service 接口
 */
public interface DashboardService {

    /**
     * 获取工作台数据
     *
     * @param userId 当前用户ID
     * @return 工作台数据
     */
    DashboardVO getWorkbenchData(Long userId);

    /**
     * 获取全平台项目概览数据
     *
     * @param userId 当前用户ID
     * @return 概览数据
     */
    DashboardOverviewVO getOverviewData(Long userId);

    /**
     * 获取管理统计报表
     *
     * @param projectId 项目ID，可空
     * @param memberId  成员ID，可空
     * @param startDate 开始日期，可空
     * @param endDate   结束日期，可空
     * @param userId    当前用户ID
     * @return 管理统计报表
     */
    DashboardManagementVO getManagementData(Long projectId, Long memberId, LocalDate startDate, LocalDate endDate, Long userId);

}
