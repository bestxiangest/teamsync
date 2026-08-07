package top.sharpcaterpillar.teamsync.service.impl;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.extension.service.impl.ServiceImpl;
import lombok.RequiredArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;
import top.sharpcaterpillar.teamsync.dto.FolderCreateRequest;
import top.sharpcaterpillar.teamsync.entity.PmFileNode;
import top.sharpcaterpillar.teamsync.entity.SysUser;
import top.sharpcaterpillar.teamsync.mapper.PmFileNodeMapper;
import top.sharpcaterpillar.teamsync.mapper.SysUserMapper;
import top.sharpcaterpillar.teamsync.service.PmFileNodeService;
import top.sharpcaterpillar.teamsync.vo.BreadcrumbVO;
import top.sharpcaterpillar.teamsync.vo.FileNodeVO;
import com.aliyun.oss.OSS;
import com.aliyun.oss.OSSClientBuilder;

import java.io.IOException;
import java.time.LocalDateTime;
import java.util.*;

/**
 * 项目文档节点 Service 实现
 */
@Service
@RequiredArgsConstructor
public class PmFileNodeServiceImpl extends ServiceImpl<PmFileNodeMapper, PmFileNode> implements PmFileNodeService {

    private static final Logger log = LoggerFactory.getLogger(PmFileNodeServiceImpl.class);

    private final SysUserMapper sysUserMapper;

    @Value("${aliyun.oss.endpoint}")
    private String endpoint;

    @Value("${aliyun.oss.access-key-id}")
    private String accessKeyId;

    @Value("${aliyun.oss.access-key-secret}")
    private String accessKeySecret;

    @Value("${aliyun.oss.bucket-name}")
    private String bucketName;

    @Override
    public List<FileNodeVO> listByParent(Long projectId, Long parentId) {
        LambdaQueryWrapper<PmFileNode> wrapper = new LambdaQueryWrapper<>();
        wrapper.eq(PmFileNode::getProjectId, projectId)
                .eq(PmFileNode::getParentId, parentId != null ? parentId : 0L)
                .isNull(PmFileNode::getTaskId)
                .orderByAsc(PmFileNode::getNodeType)  // 文件夹在前 (0 < 1)
                .orderByAsc(PmFileNode::getName);     // 按名称排序

        List<PmFileNode> nodes = this.list(wrapper);

        // 批量获取创建人信息
        Set<Long> userIds = new HashSet<>();
        nodes.forEach(n -> userIds.add(n.getCreatorId()));
        Map<Long, String> userNameMap = getUserNameMap(userIds);

        // 转换为 VO
        List<FileNodeVO> result = new ArrayList<>();
        for (PmFileNode node : nodes) {
            result.add(convertToVO(node, userNameMap));
        }
        return result;
    }

    @Override
    public List<FileNodeVO> listByTask(Long projectId, Long taskId) {
        LambdaQueryWrapper<PmFileNode> wrapper = new LambdaQueryWrapper<>();
        wrapper.eq(PmFileNode::getProjectId, projectId)
                .eq(PmFileNode::getTaskId, taskId)
                .eq(PmFileNode::getNodeType, PmFileNode.TYPE_FILE)
                .orderByDesc(PmFileNode::getCreatedAt);

        List<PmFileNode> nodes = this.list(wrapper);
        Set<Long> userIds = new HashSet<>();
        nodes.forEach(n -> userIds.add(n.getCreatorId()));
        Map<Long, String> userNameMap = getUserNameMap(userIds);

        List<FileNodeVO> result = new ArrayList<>();
        for (PmFileNode node : nodes) {
            result.add(convertToVO(node, userNameMap));
        }
        return result;
    }

    @Override
    public List<BreadcrumbVO> getBreadcrumb(Long projectId, Long nodeId) {
        LinkedList<BreadcrumbVO> breadcrumb = new LinkedList<>();

        // 根目录
        if (nodeId == null || nodeId == 0) {
            breadcrumb.add(new BreadcrumbVO(0L, "根目录"));
            return breadcrumb;
        }

        // 向上追溯路径
        Long currentId = nodeId;
        while (currentId != null && currentId != 0) {
            PmFileNode node = this.getById(currentId);
            if (node == null || !node.getProjectId().equals(projectId)) {
                break;
            }
            breadcrumb.addFirst(new BreadcrumbVO(node.getId(), node.getName()));
            currentId = node.getParentId();
        }

        // 添加根目录
        breadcrumb.addFirst(new BreadcrumbVO(0L, "根目录"));

        return breadcrumb;
    }

    @Override
    @Transactional
    public FileNodeVO createFolder(FolderCreateRequest request, Long userId) {
        // 校验名称
        if (request.getName() == null || request.getName().trim().isEmpty()) {
            throw new RuntimeException("文件夹名称不能为空");
        }

        // 检查同级目录下是否有同名文件夹
        LambdaQueryWrapper<PmFileNode> wrapper = new LambdaQueryWrapper<>();
        wrapper.eq(PmFileNode::getProjectId, request.getProjectId())
                .eq(PmFileNode::getParentId, request.getParentId() != null ? request.getParentId() : 0L)
                .eq(PmFileNode::getNodeType, PmFileNode.TYPE_FOLDER)
                .isNull(PmFileNode::getTaskId)
                .eq(PmFileNode::getName, request.getName().trim());
        if (this.count(wrapper) > 0) {
            throw new RuntimeException("同级目录下已存在同名文件夹");
        }

        PmFileNode folder = new PmFileNode();
        folder.setProjectId(request.getProjectId());
        folder.setParentId(request.getParentId() != null ? request.getParentId() : 0L);
        folder.setNodeType(PmFileNode.TYPE_FOLDER);
        folder.setName(request.getName().trim());
        folder.setCreatorId(userId);
        folder.setCreatedAt(LocalDateTime.now());
        folder.setUpdatedAt(LocalDateTime.now());

        this.save(folder);
        log.info("创建文件夹成功: projectId={}, name={}, userId={}", request.getProjectId(), request.getName(), userId);

        return convertToVO(folder, getUserNameMap(Set.of(userId)));
    }

    @Override
    @Transactional
    public FileNodeVO uploadFile(MultipartFile file, Long projectId, Long parentId, Long taskId, Long userId) {
        if (file.isEmpty()) {
            throw new RuntimeException("上传文件不能为空");
        }

        String originalFilename = file.getOriginalFilename();
        if (originalFilename == null || originalFilename.isEmpty()) {
            throw new RuntimeException("文件名不能为空");
        }

        // 提取文件后缀
        String extension = "";
        int dotIndex = originalFilename.lastIndexOf(".");
        if (dotIndex > 0) {
            extension = originalFilename.substring(dotIndex + 1).toLowerCase();
        }

        // 生成存储路径: project/项目ID/UUID.扩展名
        String uuid = UUID.randomUUID().toString().replace("-", "");
        String objectKey = "project/" + projectId + "/" + uuid + (extension.isEmpty() ? "" : "." + extension);

        // 上传到 OSS
        OSS ossClient = new OSSClientBuilder().build(endpoint, accessKeyId, accessKeySecret);
        try {
            ossClient.putObject(bucketName, objectKey, file.getInputStream());
            log.info("上传文件到OSS成功: bucket={}, key={}", bucketName, objectKey);
        } catch (IOException e) {
            log.error("上传文件到OSS失败", e);
            throw new RuntimeException("上传文件失败: " + e.getMessage());
        } finally {
            if (ossClient != null) {
                ossClient.shutdown();
            }
        }

        // 创建数据库记录
        PmFileNode fileNode = new PmFileNode();
        fileNode.setProjectId(projectId);
        fileNode.setParentId(parentId != null ? parentId : 0L);
        fileNode.setNodeType(PmFileNode.TYPE_FILE);
        fileNode.setName(originalFilename);
        fileNode.setFileUrl(objectKey);
        fileNode.setFileSize(file.getSize());
        fileNode.setExtension(extension);
        fileNode.setTaskId(taskId);
        fileNode.setCreatorId(userId);
        fileNode.setCreatedAt(LocalDateTime.now());
        fileNode.setUpdatedAt(LocalDateTime.now());

        this.save(fileNode);
        log.info("上传文件成功: projectId={}, fileName={}, size={}, userId={}",
                projectId, originalFilename, file.getSize(), userId);

        return convertToVO(fileNode, getUserNameMap(Set.of(userId)));
    }

    @Override
    @Transactional
    public void deleteNode(Long nodeId, Long userId) {
        PmFileNode node = this.getById(nodeId);
        if (node == null) {
            throw new RuntimeException("节点不存在");
        }

        if (node.getNodeType() == PmFileNode.TYPE_FOLDER) {
            // 递归删除文件夹内容
            deleteRecursive(node.getProjectId(), nodeId);
        } else {
            // 删除物理文件（可选）
            deletePhysicalFile(node.getFileUrl());
        }

        // 删除当前节点
        this.removeById(nodeId);
        log.info("删除节点成功: nodeId={}, type={}, userId={}", nodeId, node.getNodeType(), userId);
    }

    @Override
    @Transactional
    public FileNodeVO renameNode(Long nodeId, String newName, Long userId) {
        if (newName == null || newName.trim().isEmpty()) {
            throw new RuntimeException("名称不能为空");
        }

        PmFileNode node = this.getById(nodeId);
        if (node == null) {
            throw new RuntimeException("节点不存在");
        }

        // 检查同级目录下是否有同名节点
        LambdaQueryWrapper<PmFileNode> wrapper = new LambdaQueryWrapper<>();
        wrapper.eq(PmFileNode::getProjectId, node.getProjectId())
                .eq(PmFileNode::getParentId, node.getParentId())
                .eq(PmFileNode::getNodeType, node.getNodeType())
                .eq(node.getTaskId() != null, PmFileNode::getTaskId, node.getTaskId())
                .isNull(node.getTaskId() == null, PmFileNode::getTaskId)
                .eq(PmFileNode::getName, newName.trim())
                .ne(PmFileNode::getId, nodeId);
        if (this.count(wrapper) > 0) {
            throw new RuntimeException("同级目录下已存在同名" + (node.getNodeType() == 0 ? "文件夹" : "文件"));
        }

        node.setName(newName.trim());
        node.setUpdatedAt(LocalDateTime.now());
        this.updateById(node);
        log.info("重命名节点成功: nodeId={}, newName={}, userId={}", nodeId, newName, userId);

        return convertToVO(node, getUserNameMap(Set.of(node.getCreatorId())));
    }

    // ============ 私有方法 ============

    /**
     * 递归删除文件夹内容
     */
    private void deleteRecursive(Long projectId, Long parentId) {
        LambdaQueryWrapper<PmFileNode> wrapper = new LambdaQueryWrapper<>();
        wrapper.eq(PmFileNode::getProjectId, projectId)
                .eq(PmFileNode::getParentId, parentId);
        List<PmFileNode> children = this.list(wrapper);

        for (PmFileNode child : children) {
            if (child.getNodeType() == PmFileNode.TYPE_FOLDER) {
                // 递归删除子文件夹
                deleteRecursive(projectId, child.getId());
            } else {
                // 删除物理文件
                deletePhysicalFile(child.getFileUrl());
            }
            this.removeById(child.getId());
        }
    }

    /**
     * 删除物理文件
     */
    private void deletePhysicalFile(String fileUrl) {
        if (fileUrl == null || fileUrl.isEmpty()) {
            return;
        }

        OSS ossClient = new OSSClientBuilder().build(endpoint, accessKeyId, accessKeySecret);
        try {
            ossClient.deleteObject(bucketName, fileUrl);
            log.info("OSS删除文件成功: bucket={}, key={}", bucketName, fileUrl);
        } catch (Exception e) {
            log.warn("OSS删除文件失败: {}", fileUrl, e);
        } finally {
            if (ossClient != null) {
                ossClient.shutdown();
            }
        }
    }

    /**
     * 批量获取用户昵称
     */
    private Map<Long, String> getUserNameMap(Set<Long> userIds) {
        Map<Long, String> map = new HashMap<>();
        if (userIds.isEmpty()) {
            return map;
        }
        List<SysUser> users = sysUserMapper.selectBatchIds(userIds);
        for (SysUser user : users) {
            map.put(user.getId(), user.getNickname() != null ? user.getNickname() : user.getUsername());
        }
        return map;
    }

    /**
     * 转换为 VO
     */
    private FileNodeVO convertToVO(PmFileNode node, Map<Long, String> userNameMap) {
        FileNodeVO vo = new FileNodeVO();
        vo.setId(node.getId());
        vo.setProjectId(node.getProjectId());
        vo.setParentId(node.getParentId());
        vo.setNodeType(node.getNodeType());
        vo.setName(node.getName());
        vo.setFileUrl(node.getFileUrl());
        vo.setFileSize(node.getFileSize());
        vo.setExtension(node.getExtension());
        vo.setTaskId(node.getTaskId());
        vo.setCreatorId(node.getCreatorId());
        vo.setCreatorName(userNameMap.getOrDefault(node.getCreatorId(), "未知用户"));
        vo.setCreatedAt(node.getCreatedAt());
        vo.setUpdatedAt(node.getUpdatedAt());
        vo.setFileSizeFormatted(formatFileSize(node.getFileSize()));
        return vo;
    }

    /**
     * 格式化文件大小
     */
    private String formatFileSize(Long size) {
        if (size == null || size <= 0) {
            return "-";
        }
        if (size < 1024) {
            return size + " B";
        } else if (size < 1024 * 1024) {
            return String.format("%.1f KB", size / 1024.0);
        } else if (size < 1024 * 1024 * 1024) {
            return String.format("%.1f MB", size / (1024.0 * 1024));
        } else {
            return String.format("%.2f GB", size / (1024.0 * 1024 * 1024));
        }
    }
}
