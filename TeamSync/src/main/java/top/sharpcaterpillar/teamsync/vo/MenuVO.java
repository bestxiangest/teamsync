package top.sharpcaterpillar.teamsync.vo;

import lombok.Data;
import java.util.List;

/**
 * 菜单 VO (用于前端路由)
 */
@Data
public class MenuVO {

    /**
     * 路由名称
     */
    private String name;

    /**
     * 路由路径
     */
    private String path;

    /**
     * 组件路径
     */
    private String component;

    /**
     * 路由元信息
     */
    private MenuMeta meta;

    /**
     * 子路由
     */
    private List<MenuVO> children;

    @Data
    public static class MenuMeta {
        /**
         * 标题
         */
        private String title;

        /**
         * 图标
         */
        private String icon;

        /**
         * 允许的角色
         */
        private List<String> roles;

        /**
         * 是否缓存
         */
        private Boolean keepAlive;

        /**
         * 是否在菜单中隐藏
         */
        private Boolean hideInMenu;

        /**
         * 是否在菜单中隐藏（前端菜单组件使用字段）
         */
        private Boolean isHide;
    }

}
