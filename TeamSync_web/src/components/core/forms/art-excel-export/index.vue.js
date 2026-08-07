/// <reference types="../../../../../node_modules/.vue-global-types/vue_3.5_false.d.ts" />
import * as XLSX from 'xlsx';
import FileSaver from 'file-saver';
import { ref, computed, nextTick } from 'vue';
import { Loading } from '@element-plus/icons-vue';
import { useThrottleFn } from '@vueuse/core';
const { defineProps, defineSlots, defineEmits, defineExpose, defineModel, defineOptions, withDefaults, } = await import('vue');
defineOptions({ name: 'ArtExcelExport' });
const props = withDefaults(defineProps(), {
    filename: () => `export_${new Date().toISOString().slice(0, 10)}`,
    sheetName: 'Sheet1',
    type: 'primary',
    size: 'default',
    disabled: false,
    buttonText: '导出 Excel',
    loadingText: '导出中...',
    autoIndex: false,
    indexColumnTitle: '序号',
    columns: () => ({}),
    headers: () => ({}),
    maxRows: 100000,
    showSuccessMessage: true,
    showErrorMessage: true,
    workbookOptions: () => ({})
});
const emit = defineEmits();
/** 导出错误类型 */
class ExportError extends Error {
    code;
    details;
    constructor(message, code, details) {
        super(message);
        this.code = code;
        this.details = details;
        this.name = 'ExportError';
    }
}
const isExporting = ref(false);
/** 是否有数据可导出 */
const hasData = computed(() => Array.isArray(props.data) && props.data.length > 0);
/** 验证导出数据 */
const validateData = (data) => {
    if (!Array.isArray(data)) {
        throw new ExportError('数据必须是数组格式', 'INVALID_DATA_TYPE');
    }
    if (data.length === 0) {
        throw new ExportError('没有可导出的数据', 'NO_DATA');
    }
    if (data.length > props.maxRows) {
        throw new ExportError(`数据行数超过限制（${props.maxRows}行）`, 'EXCEED_MAX_ROWS', {
            currentRows: data.length,
            maxRows: props.maxRows
        });
    }
};
/** 格式化单元格值 */
const formatCellValue = (value, key, row, index) => {
    // 使用列配置的格式化函数
    const column = props.columns[key];
    if (column?.formatter) {
        return column.formatter(value, row, index);
    }
    // 处理特殊值
    if (value === null || value === undefined) {
        return '';
    }
    if (value instanceof Date) {
        return value.toLocaleDateString('zh-CN');
    }
    if (typeof value === 'boolean') {
        return value ? '是' : '否';
    }
    return String(value);
};
/** 处理数据 */
const processData = (data) => {
    const processedData = data.map((item, index) => {
        const processedItem = {};
        // 添加序号列
        if (props.autoIndex) {
            processedItem[props.indexColumnTitle] = String(index + 1);
        }
        // 处理数据列
        Object.entries(item).forEach(([key, value]) => {
            // 获取列标题
            let columnTitle = key;
            if (props.columns[key]?.title) {
                columnTitle = props.columns[key].title;
            }
            else if (props.headers[key]) {
                columnTitle = props.headers[key];
            }
            // 格式化值
            processedItem[columnTitle] = formatCellValue(value, key, item, index);
        });
        return processedItem;
    });
    return processedData;
};
/** 计算列宽度 */
const calculateColumnWidths = (data) => {
    if (data.length === 0)
        return [];
    const sampleSize = Math.min(data.length, 100); // 只取前100行计算列宽
    const columns = Object.keys(data[0]);
    return columns.map((column) => {
        // 使用配置的列宽度
        const configWidth = Object.values(props.columns).find((col) => col.title === column)?.width;
        if (configWidth) {
            return { wch: configWidth };
        }
        // 自动计算列宽度
        const maxLength = Math.max(column.length, // 标题长度
        ...data.slice(0, sampleSize).map((row) => String(row[column] || '').length));
        // 限制最小和最大宽度
        const width = Math.min(Math.max(maxLength + 2, 8), 50);
        return { wch: width };
    });
};
/** 导出到 Excel */
const exportToExcel = async (data, filename, sheetName) => {
    try {
        emit('export-progress', 10);
        // 处理数据
        const processedData = processData(data);
        emit('export-progress', 30);
        // 创建工作簿
        const workbook = XLSX.utils.book_new();
        // 设置工作簿属性
        if (props.workbookOptions) {
            workbook.Props = {
                Title: filename,
                Subject: '数据导出',
                Author: props.workbookOptions.creator || 'Art Design Pro',
                Manager: props.workbookOptions.lastModifiedBy || '',
                Company: '系统导出',
                Category: '数据',
                Keywords: 'excel,export,data',
                Comments: '由系统自动生成',
                CreatedDate: props.workbookOptions.created || new Date(),
                ModifiedDate: props.workbookOptions.modified || new Date()
            };
        }
        emit('export-progress', 50);
        // 创建工作表
        const worksheet = XLSX.utils.json_to_sheet(processedData);
        // 设置列宽度
        worksheet['!cols'] = calculateColumnWidths(processedData);
        emit('export-progress', 70);
        // 添加工作表到工作簿
        XLSX.utils.book_append_sheet(workbook, worksheet, sheetName);
        emit('export-progress', 85);
        // 生成 Excel 文件
        const excelBuffer = XLSX.write(workbook, {
            bookType: 'xlsx',
            type: 'array',
            compression: true
        });
        // 创建 Blob 并下载
        const blob = new Blob([excelBuffer], {
            type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
        });
        emit('export-progress', 95);
        // 使用时间戳确保文件名唯一
        const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
        const finalFilename = `${filename}_${timestamp}.xlsx`;
        FileSaver.saveAs(blob, finalFilename);
        emit('export-progress', 100);
        // 等待下载开始
        await nextTick();
        return Promise.resolve();
    }
    catch (error) {
        throw new ExportError(`Excel 导出失败: ${error.message}`, 'EXPORT_FAILED', error);
    }
};
/** 处理导出 */
const handleExport = useThrottleFn(async () => {
    if (isExporting.value)
        return;
    isExporting.value = true;
    try {
        // 验证数据
        validateData(props.data);
        // 触发导出前事件
        emit('before-export', props.data);
        // 执行导出
        await exportToExcel(props.data, props.filename, props.sheetName);
        // 触发成功事件
        emit('export-success', props.filename, props.data.length);
        // 显示成功消息
        if (props.showSuccessMessage) {
            ElMessage.success({
                message: `成功导出 ${props.data.length} 条数据`,
                duration: 3000
            });
        }
    }
    catch (error) {
        const exportError = error instanceof ExportError
            ? error
            : new ExportError(`导出失败: ${error.message}`, 'UNKNOWN_ERROR', error);
        // 触发错误事件
        emit('export-error', exportError);
        // 显示错误消息
        if (props.showErrorMessage) {
            ElMessage.error({
                message: exportError.message,
                duration: 5000
            });
        }
        console.error('Excel 导出错误:', exportError);
    }
    finally {
        isExporting.value = false;
        emit('export-progress', 0);
    }
}, 1000);
// 暴露方法供父组件调用
const __VLS_exposed = {
    exportData: handleExport,
    isExporting: readonly(isExporting),
    hasData
};
defineExpose({
    exportData: handleExport,
    isExporting: readonly(isExporting),
    hasData
}); /* PartiallyEnd: #3632/scriptSetup.vue */
const __VLS_withDefaultsArg = (function (t) { return t; })({
    filename: () => `export_${new Date().toISOString().slice(0, 10)}`,
    sheetName: 'Sheet1',
    type: 'primary',
    size: 'default',
    disabled: false,
    buttonText: '导出 Excel',
    loadingText: '导出中...',
    autoIndex: false,
    indexColumnTitle: '序号',
    columns: () => ({}),
    headers: () => ({}),
    maxRows: 100000,
    showSuccessMessage: true,
    showErrorMessage: true,
    workbookOptions: () => ({})
});
const __VLS_fnComponent = (await import('vue')).defineComponent({
    __typeEmits: {},
});
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
    // CSS variable injection 
    // CSS variable injection end 
    let __VLS_resolvedLocalAndGlobalComponents;
    const __VLS_0 = __VLS_resolvedLocalAndGlobalComponents.ElButton;
    /** @type { [typeof __VLS_components.ElButton, typeof __VLS_components.ElButton, ] } */
    // @ts-ignore
    const __VLS_1 = __VLS_asFunctionalComponent(__VLS_0, new __VLS_0({ ...{ 'onClick': {} }, type: ((__VLS_ctx.type)), size: ((__VLS_ctx.size)), loading: ((__VLS_ctx.isExporting)), disabled: ((__VLS_ctx.disabled || !__VLS_ctx.hasData)), }));
    const __VLS_2 = __VLS_1({ ...{ 'onClick': {} }, type: ((__VLS_ctx.type)), size: ((__VLS_ctx.size)), loading: ((__VLS_ctx.isExporting)), disabled: ((__VLS_ctx.disabled || !__VLS_ctx.hasData)), }, ...__VLS_functionalComponentArgsRest(__VLS_1));
    __VLS_asFunctionalDirective(__VLS_directives.vRipple)(null, { ...__VLS_directiveBindingRestFields, modifiers: {}, }, null, null);
    var __VLS_6 = {};
    let __VLS_7;
    const __VLS_8 = {
        onClick: (__VLS_ctx.handleExport)
    };
    let __VLS_3;
    let __VLS_4;
    __VLS_elementAsFunction(__VLS_intrinsicElements.template, __VLS_intrinsicElements.template)({});
    {
        const { loading: __VLS_thisSlot } = __VLS_nonNullable(__VLS_5.slots);
        const __VLS_9 = __VLS_resolvedLocalAndGlobalComponents.ElIcon;
        /** @type { [typeof __VLS_components.ElIcon, typeof __VLS_components.ElIcon, ] } */
        // @ts-ignore
        const __VLS_10 = __VLS_asFunctionalComponent(__VLS_9, new __VLS_9({ ...{ class: ("is-loading") }, }));
        const __VLS_11 = __VLS_10({ ...{ class: ("is-loading") }, }, ...__VLS_functionalComponentArgsRest(__VLS_10));
        const __VLS_15 = __VLS_resolvedLocalAndGlobalComponents.Loading;
        /** @type { [typeof __VLS_components.Loading, ] } */
        // @ts-ignore
        const __VLS_16 = __VLS_asFunctionalComponent(__VLS_15, new __VLS_15({}));
        const __VLS_17 = __VLS_16({}, ...__VLS_functionalComponentArgsRest(__VLS_16));
        __VLS_nonNullable(__VLS_14.slots).default;
        var __VLS_14;
        (__VLS_ctx.loadingText);
    }
    var __VLS_21 = {};
    (__VLS_ctx.buttonText);
    __VLS_nonNullable(__VLS_5.slots).default;
    var __VLS_5;
    __VLS_styleScopedClasses['is-loading'];
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
            Loading: Loading,
            isExporting: isExporting,
            hasData: hasData,
            handleExport: handleExport,
        };
    },
    __typeEmits: {},
    __typeProps: {},
    props: {},
});
const __VLS_component = (await import('vue')).defineComponent({
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
export default {};
; /* PartiallyEnd: #4569/main.vue */
//# sourceMappingURL=index.vue.js.map