package top.sharpcaterpillar.teamsync.common;

/**
 * 项目成员角色常量与能力判断。
 */
public final class ProjectMemberRole {

    public static final int MEMBER = 1;
    public static final int ADMIN = 2;
    public static final int PROJECT_GUEST = 3;
    public static final int TASK_GUEST = 4;

    private ProjectMemberRole() {
    }

    public static boolean isValid(Integer roleType) {
        return roleType != null
                && (roleType == MEMBER
                || roleType == ADMIN
                || roleType == PROJECT_GUEST
                || roleType == TASK_GUEST);
    }

    public static int normalize(Integer roleType) {
        return isValid(roleType) ? roleType : MEMBER;
    }

    public static boolean canManageProject(Integer roleType) {
        return normalize(roleType) == ADMIN;
    }

    public static boolean canManageMembers(Integer roleType) {
        return canManageProject(roleType);
    }

    public static boolean canManageStages(Integer roleType) {
        return canManageProject(roleType);
    }

    public static boolean canManageTasks(Integer roleType) {
        int normalized = normalize(roleType);
        return normalized == MEMBER || normalized == ADMIN;
    }

    public static boolean canReadFiles(Integer roleType) {
        return normalize(roleType) != TASK_GUEST;
    }

    public static boolean canManageFiles(Integer roleType) {
        return canManageTasks(roleType);
    }

    public static String toRoleCode(boolean projectOwner, Integer roleType) {
        if (projectOwner) {
            return "owner";
        }
        return switch (normalize(roleType)) {
            case ADMIN -> "admin";
            case PROJECT_GUEST -> "project_guest";
            case TASK_GUEST -> "task_guest";
            default -> "member";
        };
    }

    public static String toRoleLabel(boolean projectOwner, Integer roleType) {
        if (projectOwner) {
            return "项目拥有者";
        }
        return switch (normalize(roleType)) {
            case ADMIN -> "项目管理员";
            case PROJECT_GUEST -> "项目访客";
            case TASK_GUEST -> "任务访客";
            default -> "项目成员";
        };
    }

    public static int sortWeight(boolean projectOwner, Integer roleType) {
        if (projectOwner) {
            return 0;
        }
        return switch (normalize(roleType)) {
            case ADMIN -> 1;
            case MEMBER -> 2;
            case PROJECT_GUEST -> 3;
            case TASK_GUEST -> 4;
            default -> 5;
        };
    }
}
