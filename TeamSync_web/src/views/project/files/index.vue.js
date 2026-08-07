/// <reference types="../../../../node_modules/.vue-global-types/vue_3.5_false.d.ts" />
import { ref, reactive, computed, onMounted, watch } from 'vue';
import { useRoute } from 'vue-router';
import { useMediaQuery } from '@vueuse/core';
import { ElMessage, ElMessageBox } from 'element-plus';
import { fetchFileList, createFolder, deleteFileNode, renameFileNode, downloadFile, FILE_NODE_TYPE } from '@/api/file';
import { useUserStore } from '@/store/modules/user';
const { defineProps, defineSlots, defineEmits, defineExpose, defineModel, defineOptions, withDefaults, } = await import('vue');
defineOptions({ name: 'ProjectFiles' });
const route = useRoute();
const userStore = useUserStore();
const isMobile = useMediaQuery('(max-width: 768px)');
// 从路由参数获取 projectId
const projectId = computed(() => {
    const id = route.params.projectId;
    return id ? Number(id) : 0;
});
// 状态
const loading = ref(false);
const fileList = ref([]);
const breadcrumb = ref([]);
const currentParentId = ref(0);
// 当前文件夹名称
const currentFolderName = computed(() => {
    if (breadcrumb.value.length === 0)
        return '根目录';
    // 如果当前是根目录
    if (currentParentId.value === 0)
        return '根目录';
    // 查找当前目录名称
    const current = breadcrumb.value.find((item) => item.id === currentParentId.value);
    return current ? current.name : '未知目录';
});
// 上传配置
const uploadRef = ref();
const uploadAction = computed(() => `/api/files/upload`);
const uploadHeaders = computed(() => ({
    Authorization: `Bearer ${userStore.accessToken}`
}));
const uploadData = computed(() => ({
    projectId: projectId.value,
    parentId: currentParentId.value
}));
// 新建文件夹弹窗
const folderDialogVisible = ref(false);
const folderLoading = ref(false);
const folderFormRef = ref();
const folderForm = reactive({
    name: ''
});
const folderRules = {
    name: [
        { required: true, message: '请输入文件夹名称', trigger: 'blur' },
        { max: 100, message: '文件夹名称不能超过100个字符', trigger: 'blur' }
    ]
};
// 重命名弹窗
const renameDialogVisible = ref(false);
const renameLoading = ref(false);
const renameFormRef = ref();
const renameForm = reactive({
    id: 0,
    name: ''
});
const renameRules = {
    name: [
        { required: true, message: '请输入名称', trigger: 'blur' },
        { max: 255, message: '名称不能超过255个字符', trigger: 'blur' }
    ]
};
/**
 * 获取文件列表
 */
const getFileList = async (parentId = 0) => {
    loading.value = true;
    try {
        const data = await fetchFileList(projectId.value, parentId);
        fileList.value = data?.files || [];
        breadcrumb.value = data?.breadcrumb || [];
        currentParentId.value = parentId;
    }
    catch (error) {
        console.error('获取文件列表失败:', error);
    }
    finally {
        loading.value = false;
    }
};
/**
 * 刷新列表
 */
const refreshList = () => {
    getFileList(currentParentId.value);
};
/**
 * 导航到指定目录
 */
const navigateTo = (parentId) => {
    if (parentId !== currentParentId.value) {
        getFileList(parentId);
    }
};
/**
 * 返回上一级 (移动端)
 */
const handleBack = () => {
    // 找到当前 ID 在面包屑中的索引
    const index = breadcrumb.value.findIndex((item) => item.id === currentParentId.value);
    if (index > 0) {
        // 获取上一级 ID
        const parentId = breadcrumb.value[index - 1].id;
        navigateTo(parentId);
    }
    else if (currentParentId.value !== 0) {
        // 如果面包屑数据异常，尝试直接回根目录
        navigateTo(0);
    }
};
/**
 * 点击文件名
 */
const handleNameClick = (row) => {
    if (row.nodeType === FILE_NODE_TYPE.FOLDER) {
        // 进入文件夹
        getFileList(row.id);
    }
    else {
        // 下载文件
        handleDownload(row);
    }
};
/**
 * 双击行
 */
const handleRowDblClick = (row) => {
    if (row.nodeType === FILE_NODE_TYPE.FOLDER) {
        getFileList(row.id);
    }
};
/**
 * 下载文件
 */
const handleDownload = async (row) => {
    try {
        ElMessage.info('开始下载...');
        await downloadFile(row.id, row.name);
    }
    catch (error) {
        console.error('下载失败:', error);
        ElMessage.error('下载失败');
    }
};
/**
 * 显示新建文件夹弹窗
 */
const showCreateFolderDialog = () => {
    folderDialogVisible.value = true;
};
/**
 * 重置文件夹表单
 */
const resetFolderForm = () => {
    folderForm.name = '';
    folderFormRef.value?.resetFields();
};
/**
 * 创建文件夹
 */
const handleCreateFolder = async () => {
    if (!folderFormRef.value)
        return;
    await folderFormRef.value.validate(async (valid) => {
        if (!valid)
            return;
        folderLoading.value = true;
        try {
            await createFolder({
                projectId: projectId.value,
                parentId: currentParentId.value,
                name: folderForm.name.trim()
            });
            folderDialogVisible.value = false;
            resetFolderForm();
            refreshList();
        }
        catch (error) {
            console.error('创建文件夹失败:', error);
        }
        finally {
            folderLoading.value = false;
        }
    });
};
/**
 * 上传前校验
 */
const beforeUpload = (file) => {
    const maxSize = 100 * 1024 * 1024; // 100MB
    if (file.size > maxSize) {
        ElMessage.warning('文件大小不能超过 100MB');
        return false;
    }
    return true;
};
/**
 * 上传成功
 */
const handleUploadSuccess = (response) => {
    if (response.code === 200) {
        ElMessage.success('上传成功');
        refreshList();
    }
    else {
        ElMessage.error(response.msg || '上传失败');
    }
};
/**
 * 上传失败
 */
const handleUploadError = () => {
    ElMessage.error('上传失败，请重试');
};
/**
 * 显示重命名弹窗
 */
const showRenameDialog = (row) => {
    renameForm.id = row.id;
    renameForm.name = row.name;
    renameDialogVisible.value = true;
};
/**
 * 重置重命名表单
 */
const resetRenameForm = () => {
    renameForm.id = 0;
    renameForm.name = '';
    renameFormRef.value?.resetFields();
};
/**
 * 重命名
 */
const handleRename = async () => {
    if (!renameFormRef.value)
        return;
    await renameFormRef.value.validate(async (valid) => {
        if (!valid)
            return;
        renameLoading.value = true;
        try {
            await renameFileNode(renameForm.id, renameForm.name.trim());
            renameDialogVisible.value = false;
            resetRenameForm();
            refreshList();
        }
        catch (error) {
            console.error('重命名失败:', error);
        }
        finally {
            renameLoading.value = false;
        }
    });
};
/**
 * 处理移动端菜单命令
 */
const handleMobileCommand = (command, item) => {
    switch (command) {
        case 'download':
            handleDownload(item);
            break;
        case 'rename':
            showRenameDialog(item);
            break;
        case 'delete':
            ElMessageBox.confirm(`确定删除${item.nodeType === 0 ? '文件夹' : '文件'}「${item.name}」吗？`, '删除确认', {
                confirmButtonText: '确定',
                cancelButtonText: '取消',
                type: 'warning'
            }).then(() => handleDelete(item));
            break;
    }
};
/**
 * 删除节点
 */
const handleDelete = async (row) => {
    try {
        await deleteFileNode(row.id);
        refreshList();
    }
    catch (error) {
        console.error('删除失败:', error);
    }
};
/**
 * 获取文件图标
 */
const getFileIcon = (row) => {
    if (row.nodeType === FILE_NODE_TYPE.FOLDER) {
        return 'ri:folder-fill';
    }
    const ext = row.extension?.toLowerCase() || '';
    const iconMap = {
        // 文档
        pdf: 'ri:file-pdf-line',
        doc: 'ri:file-word-line',
        docx: 'ri:file-word-line',
        xls: 'ri:file-excel-line',
        xlsx: 'ri:file-excel-line',
        ppt: 'ri:file-ppt-line',
        pptx: 'ri:file-ppt-line',
        txt: 'ri:file-text-line',
        md: 'ri:markdown-line',
        // 图片
        jpg: 'ri:image-line',
        jpeg: 'ri:image-line',
        png: 'ri:image-line',
        gif: 'ri-image-line',
        svg: 'ri:image-line',
        webp: 'ri:image-line',
        // 视频
        mp4: 'ri-video-line',
        avi: 'ri-video-line',
        mov: 'ri-video-line',
        // 音频
        mp3: 'ri-music-line',
        wav: 'ri-music-line',
        // 压缩包
        zip: 'ri-file-zip-line',
        rar: 'ri-file-zip-line',
        '7z': 'ri-file-zip-line',
        // 代码
        js: 'ri-javascript-line',
        ts: 'ri-code-line',
        vue: 'ri-vuejs-line',
        java: 'ri-java-line',
        py: 'ri-code-line',
        html: 'ri-html5-line',
        css: 'ri-css3-line',
        json: 'ri-braces-line'
    };
    return iconMap[ext] || 'ri:file-line';
};
/**
 * 格式化日期时间
 */
const formatDateTime = (dateStr) => {
    if (!dateStr)
        return '-';
    const date = new Date(dateStr);
    return date.toLocaleString('zh-CN', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit'
    });
};
// 监听 projectId 变化（从路由参数）
watch(() => projectId.value, (newId) => {
    if (newId) {
        currentParentId.value = 0;
        getFileList(0);
    }
}, { immediate: true });
// 初始化
onMounted(() => {
    if (projectId.value) {
        getFileList(0);
    }
}); /* PartiallyEnd: #3632/scriptSetup.vue */
const __VLS_fnComponent = (await import('vue')).defineComponent({});
;
let __VLS_functionalComponentProps;
function __VLS_template() {
    const __VLS_ctx = {};
    const __VLS_localComponents = {
        ...{},
        ...{},
        ...__VLS_ctx,
    };
    let __VLS_components;
    const __VLS_localDirectives = {
        ...{},
        ...__VLS_ctx,
    };
    let __VLS_directives;
    let __VLS_styleScopedClasses;
    __VLS_styleScopedClasses['name-text'];
    __VLS_styleScopedClasses['file-icon'];
    __VLS_styleScopedClasses['file-name'];
    // CSS variable injection 
    // CSS variable injection end 
    let __VLS_resolvedLocalAndGlobalComponents;
    __VLS_elementAsFunction(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({ ...{ class: ("file-manager") }, });
    if (!__VLS_ctx.isMobile) {
        __VLS_elementAsFunction(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({ ...{ class: ("pc-view") }, });
        __VLS_elementAsFunction(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({ ...{ class: ("toolbar") }, });
        const __VLS_0 = __VLS_resolvedLocalAndGlobalComponents.ElBreadcrumb;
        /** @type { [typeof __VLS_components.ElBreadcrumb, typeof __VLS_components.ElBreadcrumb, ] } */
        // @ts-ignore
        const __VLS_1 = __VLS_asFunctionalComponent(__VLS_0, new __VLS_0({ separator: ("/"), }));
        const __VLS_2 = __VLS_1({ separator: ("/"), }, ...__VLS_functionalComponentArgsRest(__VLS_1));
        for (const [item] of __VLS_getVForSourceType((__VLS_ctx.breadcrumb))) {
            const __VLS_6 = __VLS_resolvedLocalAndGlobalComponents.ElBreadcrumbItem;
            /** @type { [typeof __VLS_components.ElBreadcrumbItem, typeof __VLS_components.ElBreadcrumbItem, ] } */
            // @ts-ignore
            const __VLS_7 = __VLS_asFunctionalComponent(__VLS_6, new __VLS_6({ ...{ 'onClick': {} }, key: ((item.id)), }));
            const __VLS_8 = __VLS_7({ ...{ 'onClick': {} }, key: ((item.id)), }, ...__VLS_functionalComponentArgsRest(__VLS_7));
            let __VLS_12;
            const __VLS_13 = {
                onClick: (...[$event]) => {
                    if (!((!__VLS_ctx.isMobile)))
                        return;
                    __VLS_ctx.navigateTo(item.id);
                }
            };
            let __VLS_9;
            let __VLS_10;
            __VLS_elementAsFunction(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({ ...{ class: ("breadcrumb-item") }, ...{ class: (({ clickable: item.id !== __VLS_ctx.currentParentId })) }, });
            if (item.id === 0) {
                const __VLS_14 = __VLS_resolvedLocalAndGlobalComponents.ArtSvgIcon;
                /** @type { [typeof __VLS_components.ArtSvgIcon, ] } */
                // @ts-ignore
                const __VLS_15 = __VLS_asFunctionalComponent(__VLS_14, new __VLS_14({ icon: ("ri:home-4-line"), ...{ class: ("mr-1") }, }));
                const __VLS_16 = __VLS_15({ icon: ("ri:home-4-line"), ...{ class: ("mr-1") }, }, ...__VLS_functionalComponentArgsRest(__VLS_15));
            }
            (item.name);
            __VLS_nonNullable(__VLS_11.slots).default;
            var __VLS_11;
        }
        __VLS_nonNullable(__VLS_5.slots).default;
        var __VLS_5;
        __VLS_elementAsFunction(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({ ...{ class: ("actions") }, });
        const __VLS_20 = __VLS_resolvedLocalAndGlobalComponents.ElButton;
        /** @type { [typeof __VLS_components.ElButton, typeof __VLS_components.ElButton, ] } */
        // @ts-ignore
        const __VLS_21 = __VLS_asFunctionalComponent(__VLS_20, new __VLS_20({ ...{ 'onClick': {} }, type: ("primary"), }));
        const __VLS_22 = __VLS_21({ ...{ 'onClick': {} }, type: ("primary"), }, ...__VLS_functionalComponentArgsRest(__VLS_21));
        __VLS_asFunctionalDirective(__VLS_directives.vRipple)(null, { ...__VLS_directiveBindingRestFields, modifiers: {}, }, null, null);
        let __VLS_26;
        const __VLS_27 = {
            onClick: (__VLS_ctx.showCreateFolderDialog)
        };
        let __VLS_23;
        let __VLS_24;
        __VLS_elementAsFunction(__VLS_intrinsicElements.template, __VLS_intrinsicElements.template)({});
        {
            const { icon: __VLS_thisSlot } = __VLS_nonNullable(__VLS_25.slots);
            const __VLS_28 = __VLS_resolvedLocalAndGlobalComponents.ArtSvgIcon;
            /** @type { [typeof __VLS_components.ArtSvgIcon, ] } */
            // @ts-ignore
            const __VLS_29 = __VLS_asFunctionalComponent(__VLS_28, new __VLS_28({ icon: ("ri:folder-add-line"), }));
            const __VLS_30 = __VLS_29({ icon: ("ri:folder-add-line"), }, ...__VLS_functionalComponentArgsRest(__VLS_29));
        }
        var __VLS_25;
        const __VLS_34 = __VLS_resolvedLocalAndGlobalComponents.ElUpload;
        /** @type { [typeof __VLS_components.ElUpload, typeof __VLS_components.ElUpload, ] } */
        // @ts-ignore
        const __VLS_35 = __VLS_asFunctionalComponent(__VLS_34, new __VLS_34({ ref: ("uploadRef"), action: ((__VLS_ctx.uploadAction)), headers: ((__VLS_ctx.uploadHeaders)), data: ((__VLS_ctx.uploadData)), showFileList: ((false)), onSuccess: ((__VLS_ctx.handleUploadSuccess)), onError: ((__VLS_ctx.handleUploadError)), beforeUpload: ((__VLS_ctx.beforeUpload)), multiple: (true), }));
        const __VLS_36 = __VLS_35({ ref: ("uploadRef"), action: ((__VLS_ctx.uploadAction)), headers: ((__VLS_ctx.uploadHeaders)), data: ((__VLS_ctx.uploadData)), showFileList: ((false)), onSuccess: ((__VLS_ctx.handleUploadSuccess)), onError: ((__VLS_ctx.handleUploadError)), beforeUpload: ((__VLS_ctx.beforeUpload)), multiple: (true), }, ...__VLS_functionalComponentArgsRest(__VLS_35));
        // @ts-ignore navigation for `const uploadRef = ref()`
        __VLS_ctx.uploadRef;
        var __VLS_40 = {};
        const __VLS_41 = __VLS_resolvedLocalAndGlobalComponents.ElButton;
        /** @type { [typeof __VLS_components.ElButton, typeof __VLS_components.ElButton, ] } */
        // @ts-ignore
        const __VLS_42 = __VLS_asFunctionalComponent(__VLS_41, new __VLS_41({ type: ("success"), }));
        const __VLS_43 = __VLS_42({ type: ("success"), }, ...__VLS_functionalComponentArgsRest(__VLS_42));
        __VLS_asFunctionalDirective(__VLS_directives.vRipple)(null, { ...__VLS_directiveBindingRestFields, modifiers: {}, }, null, null);
        __VLS_elementAsFunction(__VLS_intrinsicElements.template, __VLS_intrinsicElements.template)({});
        {
            const { icon: __VLS_thisSlot } = __VLS_nonNullable(__VLS_46.slots);
            const __VLS_47 = __VLS_resolvedLocalAndGlobalComponents.ArtSvgIcon;
            /** @type { [typeof __VLS_components.ArtSvgIcon, ] } */
            // @ts-ignore
            const __VLS_48 = __VLS_asFunctionalComponent(__VLS_47, new __VLS_47({ icon: ("ri:upload-cloud-line"), }));
            const __VLS_49 = __VLS_48({ icon: ("ri:upload-cloud-line"), }, ...__VLS_functionalComponentArgsRest(__VLS_48));
        }
        var __VLS_46;
        __VLS_nonNullable(__VLS_39.slots).default;
        var __VLS_39;
        const __VLS_53 = __VLS_resolvedLocalAndGlobalComponents.ElButton;
        /** @type { [typeof __VLS_components.ElButton, typeof __VLS_components.ElButton, ] } */
        // @ts-ignore
        const __VLS_54 = __VLS_asFunctionalComponent(__VLS_53, new __VLS_53({ ...{ 'onClick': {} }, }));
        const __VLS_55 = __VLS_54({ ...{ 'onClick': {} }, }, ...__VLS_functionalComponentArgsRest(__VLS_54));
        __VLS_asFunctionalDirective(__VLS_directives.vRipple)(null, { ...__VLS_directiveBindingRestFields, modifiers: {}, }, null, null);
        let __VLS_59;
        const __VLS_60 = {
            onClick: (__VLS_ctx.refreshList)
        };
        let __VLS_56;
        let __VLS_57;
        __VLS_elementAsFunction(__VLS_intrinsicElements.template, __VLS_intrinsicElements.template)({});
        {
            const { icon: __VLS_thisSlot } = __VLS_nonNullable(__VLS_58.slots);
            const __VLS_61 = __VLS_resolvedLocalAndGlobalComponents.ArtSvgIcon;
            /** @type { [typeof __VLS_components.ArtSvgIcon, ] } */
            // @ts-ignore
            const __VLS_62 = __VLS_asFunctionalComponent(__VLS_61, new __VLS_61({ icon: ("ri:refresh-line"), }));
            const __VLS_63 = __VLS_62({ icon: ("ri:refresh-line"), }, ...__VLS_functionalComponentArgsRest(__VLS_62));
        }
        var __VLS_58;
        const __VLS_67 = __VLS_resolvedLocalAndGlobalComponents.ElTable;
        /** @type { [typeof __VLS_components.ElTable, typeof __VLS_components.ElTable, ] } */
        // @ts-ignore
        const __VLS_68 = __VLS_asFunctionalComponent(__VLS_67, new __VLS_67({ ...{ 'onRowDblclick': {} }, data: ((__VLS_ctx.fileList)), stripe: (true), ...{ style: ({}) }, emptyText: ("暂无文件，点击上方按钮创建文件夹或上传文件"), }));
        const __VLS_69 = __VLS_68({ ...{ 'onRowDblclick': {} }, data: ((__VLS_ctx.fileList)), stripe: (true), ...{ style: ({}) }, emptyText: ("暂无文件，点击上方按钮创建文件夹或上传文件"), }, ...__VLS_functionalComponentArgsRest(__VLS_68));
        __VLS_asFunctionalDirective(__VLS_directives.vLoading)(null, { ...__VLS_directiveBindingRestFields, modifiers: {}, value: (__VLS_ctx.loading) }, null, null);
        let __VLS_73;
        const __VLS_74 = {
            onRowDblclick: (__VLS_ctx.handleRowDblClick)
        };
        let __VLS_70;
        let __VLS_71;
        const __VLS_75 = __VLS_resolvedLocalAndGlobalComponents.ElTableColumn;
        /** @type { [typeof __VLS_components.ElTableColumn, typeof __VLS_components.ElTableColumn, ] } */
        // @ts-ignore
        const __VLS_76 = __VLS_asFunctionalComponent(__VLS_75, new __VLS_75({ prop: ("name"), label: ("名称"), minWidth: ("300"), }));
        const __VLS_77 = __VLS_76({ prop: ("name"), label: ("名称"), minWidth: ("300"), }, ...__VLS_functionalComponentArgsRest(__VLS_76));
        __VLS_elementAsFunction(__VLS_intrinsicElements.template, __VLS_intrinsicElements.template)({});
        {
            const { default: __VLS_thisSlot } = __VLS_nonNullable(__VLS_80.slots);
            const [{ row }] = __VLS_getSlotParams(__VLS_thisSlot);
            __VLS_elementAsFunction(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({ ...{ onClick: (...[$event]) => {
                        if (!((!__VLS_ctx.isMobile)))
                            return;
                        __VLS_ctx.handleNameClick(row);
                    } }, ...{ class: ("file-name") }, });
            const __VLS_81 = __VLS_resolvedLocalAndGlobalComponents.ArtSvgIcon;
            /** @type { [typeof __VLS_components.ArtSvgIcon, ] } */
            // @ts-ignore
            const __VLS_82 = __VLS_asFunctionalComponent(__VLS_81, new __VLS_81({ icon: ((__VLS_ctx.getFileIcon(row))), ...{ class: ("file-icon") }, }));
            const __VLS_83 = __VLS_82({ icon: ((__VLS_ctx.getFileIcon(row))), ...{ class: ("file-icon") }, }, ...__VLS_functionalComponentArgsRest(__VLS_82));
            __VLS_elementAsFunction(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({ ...{ class: ("name-text") }, });
            (row.name);
        }
        var __VLS_80;
        const __VLS_87 = __VLS_resolvedLocalAndGlobalComponents.ElTableColumn;
        /** @type { [typeof __VLS_components.ElTableColumn, typeof __VLS_components.ElTableColumn, ] } */
        // @ts-ignore
        const __VLS_88 = __VLS_asFunctionalComponent(__VLS_87, new __VLS_87({ prop: ("fileSizeFormatted"), label: ("大小"), width: ("120"), }));
        const __VLS_89 = __VLS_88({ prop: ("fileSizeFormatted"), label: ("大小"), width: ("120"), }, ...__VLS_functionalComponentArgsRest(__VLS_88));
        __VLS_elementAsFunction(__VLS_intrinsicElements.template, __VLS_intrinsicElements.template)({});
        {
            const { default: __VLS_thisSlot } = __VLS_nonNullable(__VLS_92.slots);
            const [{ row }] = __VLS_getSlotParams(__VLS_thisSlot);
            (row.nodeType === 1 ? row.fileSizeFormatted : '-');
        }
        var __VLS_92;
        const __VLS_93 = __VLS_resolvedLocalAndGlobalComponents.ElTableColumn;
        /** @type { [typeof __VLS_components.ElTableColumn, ] } */
        // @ts-ignore
        const __VLS_94 = __VLS_asFunctionalComponent(__VLS_93, new __VLS_93({ prop: ("creatorName"), label: ("创建人"), width: ("120"), }));
        const __VLS_95 = __VLS_94({ prop: ("creatorName"), label: ("创建人"), width: ("120"), }, ...__VLS_functionalComponentArgsRest(__VLS_94));
        const __VLS_99 = __VLS_resolvedLocalAndGlobalComponents.ElTableColumn;
        /** @type { [typeof __VLS_components.ElTableColumn, typeof __VLS_components.ElTableColumn, ] } */
        // @ts-ignore
        const __VLS_100 = __VLS_asFunctionalComponent(__VLS_99, new __VLS_99({ prop: ("createdAt"), label: ("创建时间"), width: ("180"), }));
        const __VLS_101 = __VLS_100({ prop: ("createdAt"), label: ("创建时间"), width: ("180"), }, ...__VLS_functionalComponentArgsRest(__VLS_100));
        __VLS_elementAsFunction(__VLS_intrinsicElements.template, __VLS_intrinsicElements.template)({});
        {
            const { default: __VLS_thisSlot } = __VLS_nonNullable(__VLS_104.slots);
            const [{ row }] = __VLS_getSlotParams(__VLS_thisSlot);
            (__VLS_ctx.formatDateTime(row.createdAt));
        }
        var __VLS_104;
        const __VLS_105 = __VLS_resolvedLocalAndGlobalComponents.ElTableColumn;
        /** @type { [typeof __VLS_components.ElTableColumn, typeof __VLS_components.ElTableColumn, ] } */
        // @ts-ignore
        const __VLS_106 = __VLS_asFunctionalComponent(__VLS_105, new __VLS_105({ label: ("操作"), width: ("200"), fixed: ("right"), }));
        const __VLS_107 = __VLS_106({ label: ("操作"), width: ("200"), fixed: ("right"), }, ...__VLS_functionalComponentArgsRest(__VLS_106));
        __VLS_elementAsFunction(__VLS_intrinsicElements.template, __VLS_intrinsicElements.template)({});
        {
            const { default: __VLS_thisSlot } = __VLS_nonNullable(__VLS_110.slots);
            const [{ row }] = __VLS_getSlotParams(__VLS_thisSlot);
            if (row.nodeType === 1) {
                const __VLS_111 = __VLS_resolvedLocalAndGlobalComponents.ElButton;
                /** @type { [typeof __VLS_components.ElButton, typeof __VLS_components.ElButton, ] } */
                // @ts-ignore
                const __VLS_112 = __VLS_asFunctionalComponent(__VLS_111, new __VLS_111({ ...{ 'onClick': {} }, type: ("primary"), link: (true), size: ("small"), }));
                const __VLS_113 = __VLS_112({ ...{ 'onClick': {} }, type: ("primary"), link: (true), size: ("small"), }, ...__VLS_functionalComponentArgsRest(__VLS_112));
                let __VLS_117;
                const __VLS_118 = {
                    onClick: (...[$event]) => {
                        if (!((!__VLS_ctx.isMobile)))
                            return;
                        if (!((row.nodeType === 1)))
                            return;
                        __VLS_ctx.handleDownload(row);
                    }
                };
                let __VLS_114;
                let __VLS_115;
                const __VLS_119 = __VLS_resolvedLocalAndGlobalComponents.ArtSvgIcon;
                /** @type { [typeof __VLS_components.ArtSvgIcon, ] } */
                // @ts-ignore
                const __VLS_120 = __VLS_asFunctionalComponent(__VLS_119, new __VLS_119({ icon: ("ri:download-line"), ...{ class: ("mr-1") }, }));
                const __VLS_121 = __VLS_120({ icon: ("ri:download-line"), ...{ class: ("mr-1") }, }, ...__VLS_functionalComponentArgsRest(__VLS_120));
                __VLS_nonNullable(__VLS_116.slots).default;
                var __VLS_116;
            }
            const __VLS_125 = __VLS_resolvedLocalAndGlobalComponents.ElButton;
            /** @type { [typeof __VLS_components.ElButton, typeof __VLS_components.ElButton, ] } */
            // @ts-ignore
            const __VLS_126 = __VLS_asFunctionalComponent(__VLS_125, new __VLS_125({ ...{ 'onClick': {} }, type: ("warning"), link: (true), size: ("small"), }));
            const __VLS_127 = __VLS_126({ ...{ 'onClick': {} }, type: ("warning"), link: (true), size: ("small"), }, ...__VLS_functionalComponentArgsRest(__VLS_126));
            let __VLS_131;
            const __VLS_132 = {
                onClick: (...[$event]) => {
                    if (!((!__VLS_ctx.isMobile)))
                        return;
                    __VLS_ctx.showRenameDialog(row);
                }
            };
            let __VLS_128;
            let __VLS_129;
            const __VLS_133 = __VLS_resolvedLocalAndGlobalComponents.ArtSvgIcon;
            /** @type { [typeof __VLS_components.ArtSvgIcon, ] } */
            // @ts-ignore
            const __VLS_134 = __VLS_asFunctionalComponent(__VLS_133, new __VLS_133({ icon: ("ri:edit-line"), ...{ class: ("mr-1") }, }));
            const __VLS_135 = __VLS_134({ icon: ("ri:edit-line"), ...{ class: ("mr-1") }, }, ...__VLS_functionalComponentArgsRest(__VLS_134));
            __VLS_nonNullable(__VLS_130.slots).default;
            var __VLS_130;
            const __VLS_139 = __VLS_resolvedLocalAndGlobalComponents.ElPopconfirm;
            /** @type { [typeof __VLS_components.ElPopconfirm, typeof __VLS_components.ElPopconfirm, ] } */
            // @ts-ignore
            const __VLS_140 = __VLS_asFunctionalComponent(__VLS_139, new __VLS_139({ ...{ 'onConfirm': {} }, title: ((`确定删除${row.nodeType === 0 ? '文件夹' : '文件'}「${row.name}」吗？`)), confirmButtonText: ("确定"), cancelButtonText: ("取消"), }));
            const __VLS_141 = __VLS_140({ ...{ 'onConfirm': {} }, title: ((`确定删除${row.nodeType === 0 ? '文件夹' : '文件'}「${row.name}」吗？`)), confirmButtonText: ("确定"), cancelButtonText: ("取消"), }, ...__VLS_functionalComponentArgsRest(__VLS_140));
            let __VLS_145;
            const __VLS_146 = {
                onConfirm: (...[$event]) => {
                    if (!((!__VLS_ctx.isMobile)))
                        return;
                    __VLS_ctx.handleDelete(row);
                }
            };
            let __VLS_142;
            let __VLS_143;
            __VLS_elementAsFunction(__VLS_intrinsicElements.template, __VLS_intrinsicElements.template)({});
            {
                const { reference: __VLS_thisSlot } = __VLS_nonNullable(__VLS_144.slots);
                const __VLS_147 = __VLS_resolvedLocalAndGlobalComponents.ElButton;
                /** @type { [typeof __VLS_components.ElButton, typeof __VLS_components.ElButton, ] } */
                // @ts-ignore
                const __VLS_148 = __VLS_asFunctionalComponent(__VLS_147, new __VLS_147({ type: ("danger"), link: (true), size: ("small"), }));
                const __VLS_149 = __VLS_148({ type: ("danger"), link: (true), size: ("small"), }, ...__VLS_functionalComponentArgsRest(__VLS_148));
                const __VLS_153 = __VLS_resolvedLocalAndGlobalComponents.ArtSvgIcon;
                /** @type { [typeof __VLS_components.ArtSvgIcon, ] } */
                // @ts-ignore
                const __VLS_154 = __VLS_asFunctionalComponent(__VLS_153, new __VLS_153({ icon: ("ri:delete-bin-line"), ...{ class: ("mr-1") }, }));
                const __VLS_155 = __VLS_154({ icon: ("ri:delete-bin-line"), ...{ class: ("mr-1") }, }, ...__VLS_functionalComponentArgsRest(__VLS_154));
                __VLS_nonNullable(__VLS_152.slots).default;
                var __VLS_152;
            }
            var __VLS_144;
        }
        var __VLS_110;
        __VLS_nonNullable(__VLS_72.slots).default;
        var __VLS_72;
    }
    else {
        __VLS_elementAsFunction(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({ ...{ class: ("mobile-view") }, });
        __VLS_elementAsFunction(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({ ...{ class: ("mobile-header") }, });
        __VLS_elementAsFunction(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({ ...{ class: ("header-left") }, });
        if (__VLS_ctx.currentParentId !== 0) {
            __VLS_elementAsFunction(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({ ...{ onClick: (__VLS_ctx.handleBack) }, ...{ class: ("back-btn") }, });
            const __VLS_159 = __VLS_resolvedLocalAndGlobalComponents.ArtSvgIcon;
            /** @type { [typeof __VLS_components.ArtSvgIcon, ] } */
            // @ts-ignore
            const __VLS_160 = __VLS_asFunctionalComponent(__VLS_159, new __VLS_159({ icon: ("ri:arrow-left-s-line"), }));
            const __VLS_161 = __VLS_160({ icon: ("ri:arrow-left-s-line"), }, ...__VLS_functionalComponentArgsRest(__VLS_160));
        }
        __VLS_elementAsFunction(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({ ...{ class: ("current-folder") }, });
        (__VLS_ctx.currentFolderName);
        __VLS_elementAsFunction(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({ ...{ class: ("header-right") }, });
        __VLS_elementAsFunction(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({ ...{ onClick: (__VLS_ctx.showCreateFolderDialog) }, ...{ class: ("action-btn") }, });
        const __VLS_165 = __VLS_resolvedLocalAndGlobalComponents.ArtSvgIcon;
        /** @type { [typeof __VLS_components.ArtSvgIcon, ] } */
        // @ts-ignore
        const __VLS_166 = __VLS_asFunctionalComponent(__VLS_165, new __VLS_165({ icon: ("ri:folder-add-line"), }));
        const __VLS_167 = __VLS_166({ icon: ("ri:folder-add-line"), }, ...__VLS_functionalComponentArgsRest(__VLS_166));
        const __VLS_171 = __VLS_resolvedLocalAndGlobalComponents.ElUpload;
        /** @type { [typeof __VLS_components.ElUpload, typeof __VLS_components.ElUpload, ] } */
        // @ts-ignore
        const __VLS_172 = __VLS_asFunctionalComponent(__VLS_171, new __VLS_171({ ref: ("uploadRef"), action: ((__VLS_ctx.uploadAction)), headers: ((__VLS_ctx.uploadHeaders)), data: ((__VLS_ctx.uploadData)), showFileList: ((false)), onSuccess: ((__VLS_ctx.handleUploadSuccess)), onError: ((__VLS_ctx.handleUploadError)), beforeUpload: ((__VLS_ctx.beforeUpload)), multiple: (true), ...{ class: ("mobile-upload") }, }));
        const __VLS_173 = __VLS_172({ ref: ("uploadRef"), action: ((__VLS_ctx.uploadAction)), headers: ((__VLS_ctx.uploadHeaders)), data: ((__VLS_ctx.uploadData)), showFileList: ((false)), onSuccess: ((__VLS_ctx.handleUploadSuccess)), onError: ((__VLS_ctx.handleUploadError)), beforeUpload: ((__VLS_ctx.beforeUpload)), multiple: (true), ...{ class: ("mobile-upload") }, }, ...__VLS_functionalComponentArgsRest(__VLS_172));
        // @ts-ignore navigation for `const uploadRef = ref()`
        __VLS_ctx.uploadRef;
        var __VLS_177 = {};
        __VLS_elementAsFunction(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({ ...{ class: ("action-btn") }, });
        const __VLS_178 = __VLS_resolvedLocalAndGlobalComponents.ArtSvgIcon;
        /** @type { [typeof __VLS_components.ArtSvgIcon, ] } */
        // @ts-ignore
        const __VLS_179 = __VLS_asFunctionalComponent(__VLS_178, new __VLS_178({ icon: ("ri:upload-cloud-line"), }));
        const __VLS_180 = __VLS_179({ icon: ("ri:upload-cloud-line"), }, ...__VLS_functionalComponentArgsRest(__VLS_179));
        __VLS_nonNullable(__VLS_176.slots).default;
        var __VLS_176;
        __VLS_elementAsFunction(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({ ...{ class: ("mobile-file-list") }, });
        __VLS_asFunctionalDirective(__VLS_directives.vLoading)(null, { ...__VLS_directiveBindingRestFields, modifiers: {}, value: (__VLS_ctx.loading) }, null, null);
        if (__VLS_ctx.fileList.length === 0 && !__VLS_ctx.loading) {
            __VLS_elementAsFunction(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({ ...{ class: ("empty-state") }, });
            const __VLS_184 = __VLS_resolvedLocalAndGlobalComponents.ArtSvgIcon;
            /** @type { [typeof __VLS_components.ArtSvgIcon, ] } */
            // @ts-ignore
            const __VLS_185 = __VLS_asFunctionalComponent(__VLS_184, new __VLS_184({ icon: ("ri:folder-open-line"), ...{ class: ("empty-icon") }, }));
            const __VLS_186 = __VLS_185({ icon: ("ri:folder-open-line"), ...{ class: ("empty-icon") }, }, ...__VLS_functionalComponentArgsRest(__VLS_185));
            __VLS_elementAsFunction(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({});
        }
        for (const [item] of __VLS_getVForSourceType((__VLS_ctx.fileList))) {
            __VLS_elementAsFunction(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({ ...{ onClick: (...[$event]) => {
                        if (!(!((!__VLS_ctx.isMobile))))
                            return;
                        __VLS_ctx.handleNameClick(item);
                    } }, key: ((item.id)), ...{ class: ("mobile-file-item") }, });
            __VLS_elementAsFunction(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({ ...{ class: ("file-icon-wrapper") }, });
            const __VLS_190 = __VLS_resolvedLocalAndGlobalComponents.ArtSvgIcon;
            /** @type { [typeof __VLS_components.ArtSvgIcon, ] } */
            // @ts-ignore
            const __VLS_191 = __VLS_asFunctionalComponent(__VLS_190, new __VLS_190({ icon: ((__VLS_ctx.getFileIcon(item))), ...{ class: ("file-icon") }, }));
            const __VLS_192 = __VLS_191({ icon: ((__VLS_ctx.getFileIcon(item))), ...{ class: ("file-icon") }, }, ...__VLS_functionalComponentArgsRest(__VLS_191));
            __VLS_elementAsFunction(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({ ...{ class: ("file-info") }, });
            __VLS_elementAsFunction(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({ ...{ class: ("file-name") }, });
            (item.name);
            __VLS_elementAsFunction(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({ ...{ class: ("file-meta") }, });
            __VLS_elementAsFunction(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({});
            (__VLS_ctx.formatDateTime(item.createdAt).split(' ')[0]);
            if (item.nodeType === 1) {
                __VLS_elementAsFunction(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({ ...{ class: ("separator") }, });
            }
            if (item.nodeType === 1) {
                __VLS_elementAsFunction(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({});
                (item.fileSizeFormatted);
            }
            __VLS_elementAsFunction(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({ ...{ onClick: () => { } }, ...{ class: ("file-actions") }, });
            const __VLS_196 = __VLS_resolvedLocalAndGlobalComponents.ElDropdown;
            /** @type { [typeof __VLS_components.ElDropdown, typeof __VLS_components.ElDropdown, ] } */
            // @ts-ignore
            const __VLS_197 = __VLS_asFunctionalComponent(__VLS_196, new __VLS_196({ ...{ 'onCommand': {} }, trigger: ("click"), }));
            const __VLS_198 = __VLS_197({ ...{ 'onCommand': {} }, trigger: ("click"), }, ...__VLS_functionalComponentArgsRest(__VLS_197));
            let __VLS_202;
            const __VLS_203 = {
                onCommand: ((cmd) => __VLS_ctx.handleMobileCommand(cmd, item))
            };
            let __VLS_199;
            let __VLS_200;
            __VLS_elementAsFunction(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({ ...{ class: ("more-btn") }, });
            const __VLS_204 = __VLS_resolvedLocalAndGlobalComponents.ArtSvgIcon;
            /** @type { [typeof __VLS_components.ArtSvgIcon, ] } */
            // @ts-ignore
            const __VLS_205 = __VLS_asFunctionalComponent(__VLS_204, new __VLS_204({ icon: ("ri:more-2-fill"), }));
            const __VLS_206 = __VLS_205({ icon: ("ri:more-2-fill"), }, ...__VLS_functionalComponentArgsRest(__VLS_205));
            __VLS_elementAsFunction(__VLS_intrinsicElements.template, __VLS_intrinsicElements.template)({});
            {
                const { dropdown: __VLS_thisSlot } = __VLS_nonNullable(__VLS_201.slots);
                const __VLS_210 = __VLS_resolvedLocalAndGlobalComponents.ElDropdownMenu;
                /** @type { [typeof __VLS_components.ElDropdownMenu, typeof __VLS_components.ElDropdownMenu, ] } */
                // @ts-ignore
                const __VLS_211 = __VLS_asFunctionalComponent(__VLS_210, new __VLS_210({}));
                const __VLS_212 = __VLS_211({}, ...__VLS_functionalComponentArgsRest(__VLS_211));
                if (item.nodeType === 1) {
                    const __VLS_216 = __VLS_resolvedLocalAndGlobalComponents.ElDropdownItem;
                    /** @type { [typeof __VLS_components.ElDropdownItem, typeof __VLS_components.ElDropdownItem, ] } */
                    // @ts-ignore
                    const __VLS_217 = __VLS_asFunctionalComponent(__VLS_216, new __VLS_216({ command: ("download"), }));
                    const __VLS_218 = __VLS_217({ command: ("download"), }, ...__VLS_functionalComponentArgsRest(__VLS_217));
                    const __VLS_222 = __VLS_resolvedLocalAndGlobalComponents.ArtSvgIcon;
                    /** @type { [typeof __VLS_components.ArtSvgIcon, ] } */
                    // @ts-ignore
                    const __VLS_223 = __VLS_asFunctionalComponent(__VLS_222, new __VLS_222({ icon: ("ri:download-line"), ...{ class: ("mr-1") }, }));
                    const __VLS_224 = __VLS_223({ icon: ("ri:download-line"), ...{ class: ("mr-1") }, }, ...__VLS_functionalComponentArgsRest(__VLS_223));
                    __VLS_nonNullable(__VLS_221.slots).default;
                    var __VLS_221;
                }
                const __VLS_228 = __VLS_resolvedLocalAndGlobalComponents.ElDropdownItem;
                /** @type { [typeof __VLS_components.ElDropdownItem, typeof __VLS_components.ElDropdownItem, ] } */
                // @ts-ignore
                const __VLS_229 = __VLS_asFunctionalComponent(__VLS_228, new __VLS_228({ command: ("rename"), }));
                const __VLS_230 = __VLS_229({ command: ("rename"), }, ...__VLS_functionalComponentArgsRest(__VLS_229));
                const __VLS_234 = __VLS_resolvedLocalAndGlobalComponents.ArtSvgIcon;
                /** @type { [typeof __VLS_components.ArtSvgIcon, ] } */
                // @ts-ignore
                const __VLS_235 = __VLS_asFunctionalComponent(__VLS_234, new __VLS_234({ icon: ("ri:edit-line"), ...{ class: ("mr-1") }, }));
                const __VLS_236 = __VLS_235({ icon: ("ri:edit-line"), ...{ class: ("mr-1") }, }, ...__VLS_functionalComponentArgsRest(__VLS_235));
                __VLS_nonNullable(__VLS_233.slots).default;
                var __VLS_233;
                const __VLS_240 = __VLS_resolvedLocalAndGlobalComponents.ElDropdownItem;
                /** @type { [typeof __VLS_components.ElDropdownItem, typeof __VLS_components.ElDropdownItem, ] } */
                // @ts-ignore
                const __VLS_241 = __VLS_asFunctionalComponent(__VLS_240, new __VLS_240({ command: ("delete"), divided: (true), ...{ style: ({}) }, }));
                const __VLS_242 = __VLS_241({ command: ("delete"), divided: (true), ...{ style: ({}) }, }, ...__VLS_functionalComponentArgsRest(__VLS_241));
                const __VLS_246 = __VLS_resolvedLocalAndGlobalComponents.ArtSvgIcon;
                /** @type { [typeof __VLS_components.ArtSvgIcon, ] } */
                // @ts-ignore
                const __VLS_247 = __VLS_asFunctionalComponent(__VLS_246, new __VLS_246({ icon: ("ri:delete-bin-line"), ...{ class: ("mr-1") }, }));
                const __VLS_248 = __VLS_247({ icon: ("ri:delete-bin-line"), ...{ class: ("mr-1") }, }, ...__VLS_functionalComponentArgsRest(__VLS_247));
                __VLS_nonNullable(__VLS_245.slots).default;
                var __VLS_245;
                __VLS_nonNullable(__VLS_215.slots).default;
                var __VLS_215;
            }
            var __VLS_201;
        }
    }
    const __VLS_252 = __VLS_resolvedLocalAndGlobalComponents.ElDialog;
    /** @type { [typeof __VLS_components.ElDialog, typeof __VLS_components.ElDialog, ] } */
    // @ts-ignore
    const __VLS_253 = __VLS_asFunctionalComponent(__VLS_252, new __VLS_252({ ...{ 'onClose': {} }, modelValue: ((__VLS_ctx.folderDialogVisible)), title: ("新建文件夹"), width: ("400px"), closeOnClickModal: ((false)), }));
    const __VLS_254 = __VLS_253({ ...{ 'onClose': {} }, modelValue: ((__VLS_ctx.folderDialogVisible)), title: ("新建文件夹"), width: ("400px"), closeOnClickModal: ((false)), }, ...__VLS_functionalComponentArgsRest(__VLS_253));
    let __VLS_258;
    const __VLS_259 = {
        onClose: (__VLS_ctx.resetFolderForm)
    };
    let __VLS_255;
    let __VLS_256;
    const __VLS_260 = __VLS_resolvedLocalAndGlobalComponents.ElForm;
    /** @type { [typeof __VLS_components.ElForm, typeof __VLS_components.ElForm, ] } */
    // @ts-ignore
    const __VLS_261 = __VLS_asFunctionalComponent(__VLS_260, new __VLS_260({ ref: ("folderFormRef"), model: ((__VLS_ctx.folderForm)), rules: ((__VLS_ctx.folderRules)), labelWidth: ("80px"), }));
    const __VLS_262 = __VLS_261({ ref: ("folderFormRef"), model: ((__VLS_ctx.folderForm)), rules: ((__VLS_ctx.folderRules)), labelWidth: ("80px"), }, ...__VLS_functionalComponentArgsRest(__VLS_261));
    // @ts-ignore navigation for `const folderFormRef = ref()`
    __VLS_ctx.folderFormRef;
    var __VLS_266 = {};
    const __VLS_267 = __VLS_resolvedLocalAndGlobalComponents.ElFormItem;
    /** @type { [typeof __VLS_components.ElFormItem, typeof __VLS_components.ElFormItem, ] } */
    // @ts-ignore
    const __VLS_268 = __VLS_asFunctionalComponent(__VLS_267, new __VLS_267({ label: ("名称"), prop: ("name"), }));
    const __VLS_269 = __VLS_268({ label: ("名称"), prop: ("name"), }, ...__VLS_functionalComponentArgsRest(__VLS_268));
    const __VLS_273 = __VLS_resolvedLocalAndGlobalComponents.ElInput;
    /** @type { [typeof __VLS_components.ElInput, ] } */
    // @ts-ignore
    const __VLS_274 = __VLS_asFunctionalComponent(__VLS_273, new __VLS_273({ ...{ 'onKeyup': {} }, modelValue: ((__VLS_ctx.folderForm.name)), placeholder: ("请输入文件夹名称"), maxlength: ("100"), showWordLimit: (true), }));
    const __VLS_275 = __VLS_274({ ...{ 'onKeyup': {} }, modelValue: ((__VLS_ctx.folderForm.name)), placeholder: ("请输入文件夹名称"), maxlength: ("100"), showWordLimit: (true), }, ...__VLS_functionalComponentArgsRest(__VLS_274));
    let __VLS_279;
    const __VLS_280 = {
        onKeyup: (__VLS_ctx.handleCreateFolder)
    };
    let __VLS_276;
    let __VLS_277;
    var __VLS_278;
    __VLS_nonNullable(__VLS_272.slots).default;
    var __VLS_272;
    __VLS_nonNullable(__VLS_265.slots).default;
    var __VLS_265;
    __VLS_elementAsFunction(__VLS_intrinsicElements.template, __VLS_intrinsicElements.template)({});
    {
        const { footer: __VLS_thisSlot } = __VLS_nonNullable(__VLS_257.slots);
        const __VLS_281 = __VLS_resolvedLocalAndGlobalComponents.ElButton;
        /** @type { [typeof __VLS_components.ElButton, typeof __VLS_components.ElButton, ] } */
        // @ts-ignore
        const __VLS_282 = __VLS_asFunctionalComponent(__VLS_281, new __VLS_281({ ...{ 'onClick': {} }, }));
        const __VLS_283 = __VLS_282({ ...{ 'onClick': {} }, }, ...__VLS_functionalComponentArgsRest(__VLS_282));
        let __VLS_287;
        const __VLS_288 = {
            onClick: (...[$event]) => {
                __VLS_ctx.folderDialogVisible = false;
            }
        };
        let __VLS_284;
        let __VLS_285;
        __VLS_nonNullable(__VLS_286.slots).default;
        var __VLS_286;
        const __VLS_289 = __VLS_resolvedLocalAndGlobalComponents.ElButton;
        /** @type { [typeof __VLS_components.ElButton, typeof __VLS_components.ElButton, ] } */
        // @ts-ignore
        const __VLS_290 = __VLS_asFunctionalComponent(__VLS_289, new __VLS_289({ ...{ 'onClick': {} }, type: ("primary"), loading: ((__VLS_ctx.folderLoading)), }));
        const __VLS_291 = __VLS_290({ ...{ 'onClick': {} }, type: ("primary"), loading: ((__VLS_ctx.folderLoading)), }, ...__VLS_functionalComponentArgsRest(__VLS_290));
        let __VLS_295;
        const __VLS_296 = {
            onClick: (__VLS_ctx.handleCreateFolder)
        };
        let __VLS_292;
        let __VLS_293;
        __VLS_nonNullable(__VLS_294.slots).default;
        var __VLS_294;
    }
    var __VLS_257;
    const __VLS_297 = __VLS_resolvedLocalAndGlobalComponents.ElDialog;
    /** @type { [typeof __VLS_components.ElDialog, typeof __VLS_components.ElDialog, ] } */
    // @ts-ignore
    const __VLS_298 = __VLS_asFunctionalComponent(__VLS_297, new __VLS_297({ ...{ 'onClose': {} }, modelValue: ((__VLS_ctx.renameDialogVisible)), title: ("重命名"), width: ("400px"), closeOnClickModal: ((false)), }));
    const __VLS_299 = __VLS_298({ ...{ 'onClose': {} }, modelValue: ((__VLS_ctx.renameDialogVisible)), title: ("重命名"), width: ("400px"), closeOnClickModal: ((false)), }, ...__VLS_functionalComponentArgsRest(__VLS_298));
    let __VLS_303;
    const __VLS_304 = {
        onClose: (__VLS_ctx.resetRenameForm)
    };
    let __VLS_300;
    let __VLS_301;
    const __VLS_305 = __VLS_resolvedLocalAndGlobalComponents.ElForm;
    /** @type { [typeof __VLS_components.ElForm, typeof __VLS_components.ElForm, ] } */
    // @ts-ignore
    const __VLS_306 = __VLS_asFunctionalComponent(__VLS_305, new __VLS_305({ ref: ("renameFormRef"), model: ((__VLS_ctx.renameForm)), rules: ((__VLS_ctx.renameRules)), labelWidth: ("80px"), }));
    const __VLS_307 = __VLS_306({ ref: ("renameFormRef"), model: ((__VLS_ctx.renameForm)), rules: ((__VLS_ctx.renameRules)), labelWidth: ("80px"), }, ...__VLS_functionalComponentArgsRest(__VLS_306));
    // @ts-ignore navigation for `const renameFormRef = ref()`
    __VLS_ctx.renameFormRef;
    var __VLS_311 = {};
    const __VLS_312 = __VLS_resolvedLocalAndGlobalComponents.ElFormItem;
    /** @type { [typeof __VLS_components.ElFormItem, typeof __VLS_components.ElFormItem, ] } */
    // @ts-ignore
    const __VLS_313 = __VLS_asFunctionalComponent(__VLS_312, new __VLS_312({ label: ("名称"), prop: ("name"), }));
    const __VLS_314 = __VLS_313({ label: ("名称"), prop: ("name"), }, ...__VLS_functionalComponentArgsRest(__VLS_313));
    const __VLS_318 = __VLS_resolvedLocalAndGlobalComponents.ElInput;
    /** @type { [typeof __VLS_components.ElInput, ] } */
    // @ts-ignore
    const __VLS_319 = __VLS_asFunctionalComponent(__VLS_318, new __VLS_318({ ...{ 'onKeyup': {} }, modelValue: ((__VLS_ctx.renameForm.name)), placeholder: ("请输入新名称"), maxlength: ("255"), showWordLimit: (true), }));
    const __VLS_320 = __VLS_319({ ...{ 'onKeyup': {} }, modelValue: ((__VLS_ctx.renameForm.name)), placeholder: ("请输入新名称"), maxlength: ("255"), showWordLimit: (true), }, ...__VLS_functionalComponentArgsRest(__VLS_319));
    let __VLS_324;
    const __VLS_325 = {
        onKeyup: (__VLS_ctx.handleRename)
    };
    let __VLS_321;
    let __VLS_322;
    var __VLS_323;
    __VLS_nonNullable(__VLS_317.slots).default;
    var __VLS_317;
    __VLS_nonNullable(__VLS_310.slots).default;
    var __VLS_310;
    __VLS_elementAsFunction(__VLS_intrinsicElements.template, __VLS_intrinsicElements.template)({});
    {
        const { footer: __VLS_thisSlot } = __VLS_nonNullable(__VLS_302.slots);
        const __VLS_326 = __VLS_resolvedLocalAndGlobalComponents.ElButton;
        /** @type { [typeof __VLS_components.ElButton, typeof __VLS_components.ElButton, ] } */
        // @ts-ignore
        const __VLS_327 = __VLS_asFunctionalComponent(__VLS_326, new __VLS_326({ ...{ 'onClick': {} }, }));
        const __VLS_328 = __VLS_327({ ...{ 'onClick': {} }, }, ...__VLS_functionalComponentArgsRest(__VLS_327));
        let __VLS_332;
        const __VLS_333 = {
            onClick: (...[$event]) => {
                __VLS_ctx.renameDialogVisible = false;
            }
        };
        let __VLS_329;
        let __VLS_330;
        __VLS_nonNullable(__VLS_331.slots).default;
        var __VLS_331;
        const __VLS_334 = __VLS_resolvedLocalAndGlobalComponents.ElButton;
        /** @type { [typeof __VLS_components.ElButton, typeof __VLS_components.ElButton, ] } */
        // @ts-ignore
        const __VLS_335 = __VLS_asFunctionalComponent(__VLS_334, new __VLS_334({ ...{ 'onClick': {} }, type: ("primary"), loading: ((__VLS_ctx.renameLoading)), }));
        const __VLS_336 = __VLS_335({ ...{ 'onClick': {} }, type: ("primary"), loading: ((__VLS_ctx.renameLoading)), }, ...__VLS_functionalComponentArgsRest(__VLS_335));
        let __VLS_340;
        const __VLS_341 = {
            onClick: (__VLS_ctx.handleRename)
        };
        let __VLS_337;
        let __VLS_338;
        __VLS_nonNullable(__VLS_339.slots).default;
        var __VLS_339;
    }
    var __VLS_302;
    __VLS_styleScopedClasses['file-manager'];
    __VLS_styleScopedClasses['pc-view'];
    __VLS_styleScopedClasses['toolbar'];
    __VLS_styleScopedClasses['breadcrumb-item'];
    __VLS_styleScopedClasses['clickable'];
    __VLS_styleScopedClasses['mr-1'];
    __VLS_styleScopedClasses['actions'];
    __VLS_styleScopedClasses['file-name'];
    __VLS_styleScopedClasses['file-icon'];
    __VLS_styleScopedClasses['name-text'];
    __VLS_styleScopedClasses['mr-1'];
    __VLS_styleScopedClasses['mr-1'];
    __VLS_styleScopedClasses['mr-1'];
    __VLS_styleScopedClasses['mobile-view'];
    __VLS_styleScopedClasses['mobile-header'];
    __VLS_styleScopedClasses['header-left'];
    __VLS_styleScopedClasses['back-btn'];
    __VLS_styleScopedClasses['current-folder'];
    __VLS_styleScopedClasses['header-right'];
    __VLS_styleScopedClasses['action-btn'];
    __VLS_styleScopedClasses['mobile-upload'];
    __VLS_styleScopedClasses['action-btn'];
    __VLS_styleScopedClasses['mobile-file-list'];
    __VLS_styleScopedClasses['empty-state'];
    __VLS_styleScopedClasses['empty-icon'];
    __VLS_styleScopedClasses['mobile-file-item'];
    __VLS_styleScopedClasses['file-icon-wrapper'];
    __VLS_styleScopedClasses['file-icon'];
    __VLS_styleScopedClasses['file-info'];
    __VLS_styleScopedClasses['file-name'];
    __VLS_styleScopedClasses['file-meta'];
    __VLS_styleScopedClasses['separator'];
    __VLS_styleScopedClasses['file-actions'];
    __VLS_styleScopedClasses['more-btn'];
    __VLS_styleScopedClasses['mr-1'];
    __VLS_styleScopedClasses['mr-1'];
    __VLS_styleScopedClasses['mr-1'];
    var __VLS_slots;
    var __VLS_inheritedAttrs;
    const __VLS_refs = {
        "uploadRef": __VLS_177,
        "folderFormRef": __VLS_266,
        "renameFormRef": __VLS_311,
    };
    var $refs;
    var $el;
    return {
        attrs: {},
        slots: __VLS_slots,
        refs: $refs,
        rootEl: $el,
    };
}
;
const __VLS_self = (await import('vue')).defineComponent({
    setup() {
        return {
            isMobile: isMobile,
            loading: loading,
            fileList: fileList,
            breadcrumb: breadcrumb,
            currentParentId: currentParentId,
            currentFolderName: currentFolderName,
            uploadRef: uploadRef,
            uploadAction: uploadAction,
            uploadHeaders: uploadHeaders,
            uploadData: uploadData,
            folderDialogVisible: folderDialogVisible,
            folderLoading: folderLoading,
            folderFormRef: folderFormRef,
            folderForm: folderForm,
            folderRules: folderRules,
            renameDialogVisible: renameDialogVisible,
            renameLoading: renameLoading,
            renameFormRef: renameFormRef,
            renameForm: renameForm,
            renameRules: renameRules,
            refreshList: refreshList,
            navigateTo: navigateTo,
            handleBack: handleBack,
            handleNameClick: handleNameClick,
            handleRowDblClick: handleRowDblClick,
            handleDownload: handleDownload,
            showCreateFolderDialog: showCreateFolderDialog,
            resetFolderForm: resetFolderForm,
            handleCreateFolder: handleCreateFolder,
            beforeUpload: beforeUpload,
            handleUploadSuccess: handleUploadSuccess,
            handleUploadError: handleUploadError,
            showRenameDialog: showRenameDialog,
            resetRenameForm: resetRenameForm,
            handleRename: handleRename,
            handleMobileCommand: handleMobileCommand,
            handleDelete: handleDelete,
            getFileIcon: getFileIcon,
            formatDateTime: formatDateTime,
        };
    },
});
export default (await import('vue')).defineComponent({
    setup() {
        return {};
    },
    __typeEl: {},
});
; /* PartiallyEnd: #4569/main.vue */
//# sourceMappingURL=index.vue.js.map