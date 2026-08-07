package top.sharpcaterpillar.teamsync.controller;

import lombok.RequiredArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.core.io.InputStreamResource;
import org.springframework.core.io.Resource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import com.aliyun.oss.OSS;
import com.aliyun.oss.OSSClientBuilder;
import com.aliyun.oss.model.OSSObject;
import top.sharpcaterpillar.teamsync.common.Result;
import top.sharpcaterpillar.teamsync.dto.FileRenameRequest;
import top.sharpcaterpillar.teamsync.dto.FolderCreateRequest;
import top.sharpcaterpillar.teamsync.entity.PmFileNode;
import top.sharpcaterpillar.teamsync.entity.PmTask;
import top.sharpcaterpillar.teamsync.service.PmFileNodeService;
import top.sharpcaterpillar.teamsync.service.PmTaskService;
import top.sharpcaterpillar.teamsync.service.ProjectPermissionService;
import top.sharpcaterpillar.teamsync.service.TaskLogService;
import top.sharpcaterpillar.teamsync.utils.UserContext;
import top.sharpcaterpillar.teamsync.vo.BreadcrumbVO;
import top.sharpcaterpillar.teamsync.vo.FileNodeVO;

import java.io.IOException;
import java.io.InputStream;
import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

/**
 * 项目文档管理 Controller
 */
@RestController
@RequestMapping("/api")
@RequiredArgsConstructor
public class PmFileController {

    private static final Logger log = LoggerFactory.getLogger(PmFileController.class);

    private final PmFileNodeService pmFileNodeService;
    private final PmTaskService pmTaskService;
    private final ProjectPermissionService permissionService;
    private final TaskLogService taskLogService;

    @Value("${aliyun.oss.endpoint}")
    private String endpoint;

    @Value("${aliyun.oss.access-key-id}")
    private String accessKeyId;

    @Value("${aliyun.oss.access-key-secret}")
    private String accessKeySecret;

    @Value("${aliyun.oss.bucket-name}")
    private String bucketName;

    /**
     * 获取某层级下的文件列表
     * GET /api/projects/{projectId}/files?parentId=0
     *
     * @param projectId 项目ID
     * @param parentId  父节点ID，默认0表示根目录
     * @return 文件节点列表及面包屑导航
     */
    @GetMapping("/projects/{projectId}/files")
    public Result listFiles(
            @PathVariable("projectId") Long projectId,
            @RequestParam(value = "parentId", defaultValue = "0") Long parentId) {
        Long currentUserId = UserContext.getUserId();
        log.info("获取文件列表: projectId={}, parentId={}, userId={}", projectId, parentId, currentUserId);

        try {
            // 权限检查：必须是项目成员
            permissionService.checkFileReadPermission(projectId, currentUserId);

            List<FileNodeVO> files = pmFileNodeService.listByParent(projectId, parentId);
            List<BreadcrumbVO> breadcrumb = pmFileNodeService.getBreadcrumb(projectId, parentId);

            Map<String, Object> data = new HashMap<>();
            data.put("files", files);
            data.put("breadcrumb", breadcrumb);

            return Result.success(data);
        } catch (RuntimeException e) {
            log.error("获取文件列表失败: {}", e.getMessage());
            return Result.error(e.getMessage());
        }
    }

    /**
     * 获取任务附件列表
     * GET /api/tasks/{taskId}/files
     *
     * @param taskId 任务ID
     * @return 附件列表
     */
    @GetMapping("/tasks/{taskId}/files")
    public Result listTaskFiles(@PathVariable("taskId") Long taskId) {
        Long currentUserId = UserContext.getUserId();
        log.info("获取任务附件列表: taskId={}, userId={}", taskId, currentUserId);

        try {
            PmTask task = getTaskOrThrow(taskId);
            permissionService.checkTaskReadPermission(task.getProjectId(), currentUserId);
            List<FileNodeVO> files = pmFileNodeService.listByTask(task.getProjectId(), taskId);
            return Result.success(files);
        } catch (RuntimeException e) {
            log.error("获取任务附件失败: {}", e.getMessage());
            return Result.error(e.getMessage());
        }
    }

    /**
     * 创建文件夹
     * POST /api/files/folder
     *
     * @param request 创建请求
     * @return 创建的文件夹
     */
    @PostMapping("/files/folder")
    public Result createFolder(@RequestBody FolderCreateRequest request) {
        Long currentUserId = UserContext.getUserId();
        log.info("创建文件夹: projectId={}, parentId={}, name={}, userId={}",
                request.getProjectId(), request.getParentId(), request.getName(), currentUserId);

        try {
            // 权限检查
            permissionService.checkFileManagePermission(request.getProjectId(), currentUserId);

            FileNodeVO folder = pmFileNodeService.createFolder(request, currentUserId);
            return Result.success(folder);
        } catch (RuntimeException e) {
            log.error("创建文件夹失败: {}", e.getMessage());
            return Result.error(e.getMessage());
        }
    }

    /**
     * 上传文件
     * POST /api/files/upload
     *
     * @param file      文件
     * @param projectId 项目ID
     * @param parentId  父节点ID
     * @return 上传的文件信息
     */
    @PostMapping("/files/upload")
    public Result uploadFile(
            @RequestParam("file") MultipartFile file,
            @RequestParam("projectId") Long projectId,
            @RequestParam(value = "parentId", defaultValue = "0") Long parentId,
            @RequestParam(value = "taskId", required = false) Long taskId) {
        Long currentUserId = UserContext.getUserId();
        log.info("上传文件: projectId={}, parentId={}, taskId={}, fileName={}, size={}, userId={}",
                projectId, parentId, taskId, file.getOriginalFilename(), file.getSize(), currentUserId);

        try {
            if (taskId != null) {
                PmTask task = getTaskOrThrow(taskId);
                if (!task.getProjectId().equals(projectId)) {
                    return Result.error("任务不属于该项目");
                }
                permissionService.checkTaskWritePermission(projectId, currentUserId);
            } else {
                permissionService.checkFileManagePermission(projectId, currentUserId);
            }

            FileNodeVO fileNode = pmFileNodeService.uploadFile(file, projectId, parentId, taskId, currentUserId);
            if (taskId != null) {
                taskLogService.logAttachment(taskId, currentUserId, "上传了附件「" + fileNode.getName() + "」");
            }
            return Result.success(fileNode);
        } catch (RuntimeException e) {
            log.error("上传文件失败: {}", e.getMessage());
            return Result.error(e.getMessage());
        }
    }

    /**
     * 上传任务附件
     * POST /api/tasks/{taskId}/files/upload
     *
     * @param taskId 任务ID
     * @param file   文件
     * @return 上传的文件信息
     */
    @PostMapping("/tasks/{taskId}/files/upload")
    public Result uploadTaskFile(
            @PathVariable("taskId") Long taskId,
            @RequestParam("file") MultipartFile file) {
        Long currentUserId = UserContext.getUserId();
        log.info("上传任务附件: taskId={}, fileName={}, size={}, userId={}",
                taskId, file.getOriginalFilename(), file.getSize(), currentUserId);

        try {
            PmTask task = getTaskOrThrow(taskId);
            permissionService.checkTaskWritePermission(task.getProjectId(), currentUserId);

            FileNodeVO fileNode = pmFileNodeService.uploadFile(file, task.getProjectId(), 0L, taskId, currentUserId);
            taskLogService.logAttachment(taskId, currentUserId, "上传了附件「" + fileNode.getName() + "」");
            return Result.success(fileNode);
        } catch (RuntimeException e) {
            log.error("上传任务附件失败: {}", e.getMessage());
            return Result.error(e.getMessage());
        }
    }

    /**
     * 下载文件
     * GET /api/files/{id}/download
     *
     * @param id 文件节点ID
     * @return 文件流
     */
    @GetMapping("/files/{id}/download")
    public ResponseEntity<Resource> downloadFile(@PathVariable("id") Long id) {
        Long currentUserId = UserContext.getUserId();
        log.info("下载文件: fileId={}, userId={}", id, currentUserId);

        try {
            PmFileNode fileNode = pmFileNodeService.getById(id);
            if (fileNode == null) {
                return ResponseEntity.notFound().build();
            }

            if (fileNode.getTaskId() != null) {
                permissionService.checkTaskReadPermission(fileNode.getProjectId(), currentUserId);
            } else {
                permissionService.checkFileReadPermission(fileNode.getProjectId(), currentUserId);
            }

            if (fileNode.getNodeType() != PmFileNode.TYPE_FILE) {
                return ResponseEntity.badRequest().build();
            }

            OSS ossClient = new OSSClientBuilder().build(endpoint, accessKeyId, accessKeySecret);
            OSSObject ossObject = ossClient.getObject(bucketName, fileNode.getFileUrl());
            InputStream content = ossObject.getObjectContent();

            String encodedFileName = URLEncoder.encode(fileNode.getName(), StandardCharsets.UTF_8)
                    .replace("+", "%20");

            return ResponseEntity.ok()
                    .contentType(MediaType.APPLICATION_OCTET_STREAM)
                    .header(HttpHeaders.CONTENT_DISPOSITION,
                            "attachment; filename*=UTF-8''" + encodedFileName)
                    .body(new InputStreamResource(new OssInputStream(content, ossClient)));

        } catch (Exception e) {
            log.error("下载文件失败: {}", e.getMessage());
            return ResponseEntity.internalServerError().build();
        }
    }

    /**
     * 删除文件/文件夹
     * DELETE /api/files/{id}
     *
     * @param id 节点ID
     * @return 操作结果
     */
    @DeleteMapping("/files/{id}")
    public Result deleteNode(@PathVariable("id") Long id) {
        Long currentUserId = UserContext.getUserId();
        log.info("删除节点: nodeId={}, userId={}", id, currentUserId);

        try {
            PmFileNode node = pmFileNodeService.getById(id);
            if (node == null) {
                return Result.error("节点不存在");
            }

            if (node.getTaskId() != null) {
                permissionService.checkTaskWritePermission(node.getProjectId(), currentUserId);
            } else {
                permissionService.checkFileManagePermission(node.getProjectId(), currentUserId);
            }

            pmFileNodeService.deleteNode(id, currentUserId);
            if (node.getTaskId() != null) {
                taskLogService.logAttachment(node.getTaskId(), currentUserId, "删除了附件「" + node.getName() + "」");
            }
            return Result.success("删除成功");
        } catch (RuntimeException e) {
            log.error("删除节点失败: {}", e.getMessage());
            return Result.error(e.getMessage());
        }
    }

    /**
     * 重命名文件/文件夹
     * PUT /api/files/{id}/rename
     *
     * @param id      节点ID
     * @param request 重命名请求
     * @return 更新后的节点
     */
    @PutMapping("/files/{id}/rename")
    public Result renameNode(@PathVariable("id") Long id, @RequestBody FileRenameRequest request) {
        Long currentUserId = UserContext.getUserId();
        log.info("重命名节点: nodeId={}, newName={}, userId={}", id, request.getName(), currentUserId);

        try {
            PmFileNode node = pmFileNodeService.getById(id);
            if (node == null) {
                return Result.error("节点不存在");
            }

            if (node.getTaskId() != null) {
                permissionService.checkTaskWritePermission(node.getProjectId(), currentUserId);
            } else {
                permissionService.checkFileManagePermission(node.getProjectId(), currentUserId);
            }

            FileNodeVO updatedNode = pmFileNodeService.renameNode(id, request.getName(), currentUserId);
            return Result.success(updatedNode);
        } catch (RuntimeException e) {
            log.error("重命名节点失败: {}", e.getMessage());
            return Result.error(e.getMessage());
        }
    }

    /**
     * 包装 InputStream 以便在关闭流时关闭 OSSClient
     */
    private static class OssInputStream extends java.io.FilterInputStream {
        private final OSS ossClient;

        public OssInputStream(InputStream in, OSS ossClient) {
            super(in);
            this.ossClient = ossClient;
        }

        @Override
        public void close() throws IOException {
            super.close();
            if (ossClient != null) {
                ossClient.shutdown();
            }
        }
    }

    private PmTask getTaskOrThrow(Long taskId) {
        PmTask task = pmTaskService.getById(taskId);
        if (task == null) {
            throw new RuntimeException("任务不存在");
        }
        return task;
    }
}
