/// <reference types="../../../../../node_modules/.vue-global-types/vue_3.5_false.d.ts" />
import '@wangeditor/editor/dist/css/style.css';
import { onBeforeUnmount, onMounted, shallowRef, computed } from 'vue';
import { Editor, Toolbar } from '@wangeditor/editor-for-vue';
import { useUserStore } from '@/store/modules/user';
import EmojiText from '@/utils/ui/emojo';
const { defineProps, defineSlots, defineEmits, defineExpose, defineModel, defineOptions, withDefaults, } = await import('vue');
defineOptions({ name: 'ArtWangEditor' });
const props = withDefaults(defineProps(), {
    height: '500px',
    mode: 'default',
    placeholder: '请输入内容...',
    excludeKeys: () => ['fontFamily']
});
const modelValue = defineModel({ required: true });
// 编辑器实例
const editorRef = shallowRef();
const userStore = useUserStore();
// 常量配置
const DEFAULT_UPLOAD_CONFIG = {
    maxFileSize: 3 * 1024 * 1024, // 3MB
    maxNumberOfFiles: 10,
    fieldName: 'file',
    allowedFileTypes: ['image/*']
};
// 计算属性：上传服务器地址
const uploadServer = computed(() => props.uploadConfig?.server || `${import.meta.env.VITE_API_URL}/api/common/upload/wangeditor`);
// 合并上传配置
const mergedUploadConfig = computed(() => ({
    ...DEFAULT_UPLOAD_CONFIG,
    ...props.uploadConfig
}));
// 工具栏配置
const toolbarConfig = computed(() => {
    const config = {};
    // 完全自定义工具栏
    if (props.toolbarKeys && props.toolbarKeys.length > 0) {
        config.toolbarKeys = props.toolbarKeys;
    }
    // 插入新工具
    if (props.insertKeys) {
        config.insertKeys = props.insertKeys;
    }
    // 排除工具
    if (props.excludeKeys && props.excludeKeys.length > 0) {
        config.excludeKeys = props.excludeKeys;
    }
    return config;
});
// 编辑器配置
const editorConfig = {
    placeholder: props.placeholder,
    MENU_CONF: {
        uploadImage: {
            fieldName: mergedUploadConfig.value.fieldName,
            maxFileSize: mergedUploadConfig.value.maxFileSize,
            maxNumberOfFiles: mergedUploadConfig.value.maxNumberOfFiles,
            allowedFileTypes: mergedUploadConfig.value.allowedFileTypes,
            server: uploadServer.value,
            headers: {
                Authorization: userStore.accessToken
            },
            onSuccess() {
                ElMessage.success(`图片上传成功 ${EmojiText[200]}`);
            },
            onError(file, err, res) {
                console.error('图片上传失败:', err, res);
                ElMessage.error(`图片上传失败 ${EmojiText[500]}`);
            }
        }
    }
};
// 编辑器创建回调
const onCreateEditor = (editor) => {
    editorRef.value = editor;
    // 监听全屏事件
    editor.on('fullScreen', () => {
        console.log('编辑器进入全屏模式');
    });
    // 确保在编辑器创建后应用自定义图标
    applyCustomIcons();
};
// 应用自定义图标（带重试机制）
const applyCustomIcons = () => {
    let retryCount = 0;
    const maxRetries = 10;
    const retryDelay = 100;
    const tryApplyIcons = () => {
        const editor = editorRef.value;
        if (!editor) {
            if (retryCount < maxRetries) {
                retryCount++;
                setTimeout(tryApplyIcons, retryDelay);
            }
            return;
        }
        // 获取当前编辑器的工具栏容器
        const editorContainer = editor.getEditableContainer().closest('.editor-wrapper');
        if (!editorContainer) {
            if (retryCount < maxRetries) {
                retryCount++;
                setTimeout(tryApplyIcons, retryDelay);
            }
            return;
        }
        const toolbar = editorContainer.querySelector('.w-e-toolbar');
        const toolbarButtons = editorContainer.querySelectorAll('.w-e-bar-item button[data-menu-key]');
        if (toolbar && toolbarButtons.length > 0) {
            return;
        }
        // 如果工具栏还没渲染完成，继续重试
        if (retryCount < maxRetries) {
            retryCount++;
            setTimeout(tryApplyIcons, retryDelay);
        }
        else {
            console.warn('工具栏渲染超时，无法应用自定义图标 - 编辑器实例:', editor.id);
        }
    };
    // 使用 requestAnimationFrame 确保在下一帧执行
    requestAnimationFrame(tryApplyIcons);
};
// 暴露编辑器实例和方法
const __VLS_exposed = {
    /** 获取编辑器实例 */
    getEditor: () => editorRef.value,
    /** 设置编辑器内容 */
    setHtml: (html) => editorRef.value?.setHtml(html),
    /** 获取编辑器内容 */
    getHtml: () => editorRef.value?.getHtml(),
    /** 清空编辑器 */
    clear: () => editorRef.value?.clear(),
    /** 聚焦编辑器 */
    focus: () => editorRef.value?.focus()
};
defineExpose({
    /** 获取编辑器实例 */
    getEditor: () => editorRef.value,
    /** 设置编辑器内容 */
    setHtml: (html) => editorRef.value?.setHtml(html),
    /** 获取编辑器内容 */
    getHtml: () => editorRef.value?.getHtml(),
    /** 清空编辑器 */
    clear: () => editorRef.value?.clear(),
    /** 聚焦编辑器 */
    focus: () => editorRef.value?.focus()
});
// 生命周期
onMounted(() => {
    // 图标替换已在 onCreateEditor 中处理
});
onBeforeUnmount(() => {
    const editor = editorRef.value;
    if (editor) {
        editor.destroy();
    }
}); /* PartiallyEnd: #3632/scriptSetup.vue */
const __VLS_withDefaultsArg = (function (t) { return t; })({
    height: '500px',
    mode: 'default',
    placeholder: '请输入内容...',
    excludeKeys: () => ['fontFamily']
});
const __VLS_fnComponent = (await import('vue')).defineComponent({
    __typeEmits: {},
});
;
let __VLS_functionalComponentProps;
const __VLS_defaults = {};
const __VLS_modelEmit = defineEmits();
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
    // CSS variable injection 
    // CSS variable injection end 
    let __VLS_resolvedLocalAndGlobalComponents;
    __VLS_elementAsFunction(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({ ...{ class: ("editor-wrapper") }, });
    const __VLS_0 = __VLS_resolvedLocalAndGlobalComponents.Toolbar;
    /** @type { [typeof __VLS_components.Toolbar, ] } */
    // @ts-ignore
    const __VLS_1 = __VLS_asFunctionalComponent(__VLS_0, new __VLS_0({ ...{ class: ("editor-toolbar") }, editor: ((__VLS_ctx.editorRef)), mode: ((__VLS_ctx.mode)), defaultConfig: ((__VLS_ctx.toolbarConfig)), }));
    const __VLS_2 = __VLS_1({ ...{ class: ("editor-toolbar") }, editor: ((__VLS_ctx.editorRef)), mode: ((__VLS_ctx.mode)), defaultConfig: ((__VLS_ctx.toolbarConfig)), }, ...__VLS_functionalComponentArgsRest(__VLS_1));
    const __VLS_6 = __VLS_resolvedLocalAndGlobalComponents.Editor;
    /** @type { [typeof __VLS_components.Editor, ] } */
    // @ts-ignore
    const __VLS_7 = __VLS_asFunctionalComponent(__VLS_6, new __VLS_6({ ...{ 'onOnCreated': {} }, ...{ style: (({ height: __VLS_ctx.height, overflowY: 'hidden' })) }, modelValue: ((__VLS_ctx.modelValue)), mode: ((__VLS_ctx.mode)), defaultConfig: ((__VLS_ctx.editorConfig)), }));
    const __VLS_8 = __VLS_7({ ...{ 'onOnCreated': {} }, ...{ style: (({ height: __VLS_ctx.height, overflowY: 'hidden' })) }, modelValue: ((__VLS_ctx.modelValue)), mode: ((__VLS_ctx.mode)), defaultConfig: ((__VLS_ctx.editorConfig)), }, ...__VLS_functionalComponentArgsRest(__VLS_7));
    let __VLS_12;
    const __VLS_13 = {
        onOnCreated: (__VLS_ctx.onCreateEditor)
    };
    let __VLS_9;
    let __VLS_10;
    var __VLS_11;
    __VLS_styleScopedClasses['editor-wrapper'];
    __VLS_styleScopedClasses['editor-toolbar'];
    var __VLS_slots;
    var __VLS_inheritedAttrs;
    const __VLS_refs = {};
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
            Editor: Editor,
            Toolbar: Toolbar,
            modelValue: modelValue,
            editorRef: editorRef,
            toolbarConfig: toolbarConfig,
            editorConfig: editorConfig,
            onCreateEditor: onCreateEditor,
        };
    },
    __typeEmits: {},
    __typeProps: {},
    props: {},
});
export default (await import('vue')).defineComponent({
    setup() {
        return {
            ...__VLS_exposed,
        };
    },
    __typeEmits: {},
    __typeProps: {},
    props: {},
    __typeEl: {},
});
; /* PartiallyEnd: #4569/main.vue */
//# sourceMappingURL=index.vue.js.map