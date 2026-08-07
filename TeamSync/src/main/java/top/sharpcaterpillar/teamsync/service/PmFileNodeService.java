package top.sharpcaterpillar.teamsync.service;

import com.baomidou.mybatisplus.extension.service.IService;
import org.springframework.web.multipart.MultipartFile;
import top.sharpcaterpillar.teamsync.dto.FolderCreateRequest;
import top.sharpcaterpillar.teamsync.entity.PmFileNode;
import top.sharpcaterpillar.teamsync.vo.BreadcrumbVO;
import top.sharpcaterpillar.teamsync.vo.FileNodeVO;

import java.util.List;

/**
 * 项目文档节点 Service 接口
 */
public interface PmFileNodeService extends IService<PmFileNode> {

    /**
     * 获取某层级下的文件/文件夹列表
     *
     * @param projectId 项目ID
     * @param parentId  父节点ID，0表示根目录
     * @return 文件节点列表（文件夹在前，文件在后，按名称排序）
     */
    List<FileNodeVO> listByParent(Long projectId, Long parentId);

    /**
     * 获取任务附件列表
     *
     * @param projectId 项目ID
     * @param taskId    任务ID
     * @return 任务附件列表
     */
    List<FileNodeVO> listByTask(Long projectId, Long taskId);

    /**
     * 获取面包屑导航路径
     *
     * @param projectId 项目ID
     * @param nodeId    当前节点ID
     * @return 从根目录到当前节点的路径
     */
    List<BreadcrumbVO> getBreadcrumb(Long projectId, Long nodeId);

    /**
     * 创建文件夹
     *
     * @param request 创建请求
     * @param userId  创建人ID
     * @return 创建的文件夹
     */
    FileNodeVO createFolder(FolderCreateRequest request, Long userId);

    /**
     * 上传文件
     *
     * @param file      文件
     * @param projectId 项目ID
     * @param parentId  父节点ID
     * @param userId    上传人ID
     * @return 文件节点
     */
    FileNodeVO uploadFile(MultipartFile file, Long projectId, Long parentId, Long taskId, Long userId);

    /**
     * 删除节点
     * 如果是文件夹，递归删除其下所有内容
     *
     * @param nodeId 节点ID
     * @param userId 操作人ID
     */
    void deleteNode(Long nodeId, Long userId);

    /**
     * 重命名节点
     *
     * @param nodeId  节点ID
     * @param newName 新名称
     * @param userId  操作人ID
     * @return 更新后的节点
     */
    FileNodeVO renameNode(Long nodeId, String newName, Long userId);
}
