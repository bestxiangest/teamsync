package top.sharpcaterpillar.teamsync.vo;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * 面包屑导航项
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
public class BreadcrumbVO {

    private Long id;

    private String name;
}
