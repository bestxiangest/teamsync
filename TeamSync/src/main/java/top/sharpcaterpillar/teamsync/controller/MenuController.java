package top.sharpcaterpillar.teamsync.controller;

import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;
import top.sharpcaterpillar.teamsync.common.Result;
import top.sharpcaterpillar.teamsync.vo.MenuVO;

import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;

/**
 * 菜单 Controller
 */
@RestController
@RequestMapping("/api/v3/system")
@RequiredArgsConstructor
public class MenuController {

    /**
     * 获取菜单列表（简化版，用于路由）
     * GET /api/v3/system/menus/simple
     */
    @GetMapping("/menus/simple")
    public Result getSimpleMenus() {
        List<MenuVO> menus = buildMenuList();
        return Result.success(menus);
    }

    /**
     * 构建菜单列表
     */
    private List<MenuVO> buildMenuList() {
        List<MenuVO> menus = new ArrayList<>();

        // 1. 仪表盘
        MenuVO dashboard = createMenu("Dashboard", "/dashboard", "/index/index",
                "仪表盘", "ri:pie-chart-line", Arrays.asList("R_SUPER", "R_ADMIN", "R_USER"));
        dashboard.setChildren(Arrays.asList(
                createChildMenu("Console", "console", "/dashboard/console",
                        "工作台", "ri:home-smile-2-line", false)
        ));
        menus.add(dashboard);

        // 2. 项目管理
        MenuVO project = createMenu("Project", "/project", "/index/index",
                "项目管理", "ri:folder-line", Arrays.asList("R_SUPER", "R_ADMIN", "R_USER"));
        
        // 项目列表
        MenuVO projectList = createChildMenu("ProjectList", "list", "/project/list/index",
                "项目列表", "ri:list-check-2", true);

        // 周期计划
        MenuVO recurringPlanList = createChildMenu("RecurringPlanList", "recurring-plan", "/recurring-plan/list/index",
                "周期计划", "ri:repeat-2-line", true);
        
        // 看板页面（隐藏菜单，通过项目列表跳转）
        MenuVO kanbanBoard = createChildMenu("KanbanBoard", "board/:projectId", "/board",
                "项目看板", "ri:dashboard-3-line", false);
        kanbanBoard.getMeta().setHideInMenu(true);
        kanbanBoard.getMeta().setIsHide(true);
        
        project.setChildren(Arrays.asList(projectList, recurringPlanList, kanbanBoard));
        menus.add(project);

        // 3. 周期计划兼容入口（隐藏菜单，支持旧地址直达）
        MenuVO recurringPlanLegacy = createMenu("RecurringPlanLegacy", "/recurring-plan", "/index/index",
                "周期计划", "ri:calendar-schedule-line", Arrays.asList("R_SUPER", "R_ADMIN", "R_USER"));
        recurringPlanLegacy.getMeta().setHideInMenu(true);
        recurringPlanLegacy.getMeta().setIsHide(true);
        MenuVO recurringPlanLegacyList = createChildMenu("RecurringPlanLegacyList", "list", "/recurring-plan/list/index",
                "周期计划", "ri:repeat-2-line", true);
        recurringPlanLegacyList.getMeta().setHideInMenu(true);
        recurringPlanLegacyList.getMeta().setIsHide(true);
        recurringPlanLegacy.setChildren(Arrays.asList(recurringPlanLegacyList));
        menus.add(recurringPlanLegacy);

        return menus;
    }

    /**
     * 创建一级菜单
     */
    private MenuVO createMenu(String name, String path, String component,
                               String title, String icon, List<String> roles) {
        MenuVO menu = new MenuVO();
        menu.setName(name);
        menu.setPath(path);
        menu.setComponent(component);

        MenuVO.MenuMeta meta = new MenuVO.MenuMeta();
        meta.setTitle(title);
        meta.setIcon(icon);
        meta.setRoles(roles);
        menu.setMeta(meta);

        return menu;
    }

    /**
     * 创建子菜单
     */
    private MenuVO createChildMenu(String name, String path, String component,
                                    String title, String icon, boolean keepAlive) {
        MenuVO menu = new MenuVO();
        menu.setName(name);
        menu.setPath(path);
        menu.setComponent(component);

        MenuVO.MenuMeta meta = new MenuVO.MenuMeta();
        meta.setTitle(title);
        meta.setIcon(icon);
        meta.setKeepAlive(keepAlive);
        menu.setMeta(meta);

        return menu;
    }

}
