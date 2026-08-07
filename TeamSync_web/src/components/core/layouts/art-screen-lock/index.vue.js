/// <reference types="../../../../../node_modules/.vue-global-types/vue_3.5_false.d.ts" />
import { Lock, Unlock } from '@element-plus/icons-vue';
import { useI18n } from 'vue-i18n';
import CryptoJS from 'crypto-js';
import { useUserStore } from '@/store/modules/user';
import { mittBus } from '@/utils/sys';
const { defineProps, defineSlots, defineEmits, defineExpose, defineModel, defineOptions, withDefaults, } = await import('vue');
// 国际化
const { t } = useI18n();
// 环境变量
const ENCRYPT_KEY = import.meta.env.VITE_LOCK_ENCRYPT_KEY;
// Store
const userStore = useUserStore();
const { info: userInfo, lockPassword, isLock } = storeToRefs(userStore);
// 响应式数据
const visible = ref(false);
const lockInputRef = ref(null);
const unlockInputRef = ref(null);
const showDevToolsWarning = ref(false);
// 表单相关
const formRef = ref();
const unlockFormRef = ref();
const formData = reactive({
    password: ''
});
const unlockForm = reactive({
    password: ''
});
// 表单验证规则
const rules = computed(() => ({
    password: [
        {
            required: true,
            message: t('lockScreen.lock.inputPlaceholder'),
            trigger: 'blur'
        }
    ]
}));
// 检测是否为移动设备
const isMobile = () => {
    return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
};
// 添加禁用控制台的函数
const disableDevTools = () => {
    // 禁用右键菜单
    const handleContextMenu = (e) => {
        if (isLock.value) {
            e.preventDefault();
            e.stopPropagation();
            return false;
        }
    };
    document.addEventListener('contextmenu', handleContextMenu, true);
    // 禁用开发者工具相关快捷键
    const handleKeyDown = (e) => {
        if (!isLock.value)
            return;
        // 禁用 F12
        if (e.key === 'F12') {
            e.preventDefault();
            e.stopPropagation();
            return false;
        }
        // 禁用 Ctrl+Shift+I/J/C/K (开发者工具)
        if (e.ctrlKey && e.shiftKey) {
            const key = e.key.toLowerCase();
            if (['i', 'j', 'c', 'k'].includes(key)) {
                e.preventDefault();
                e.stopPropagation();
                return false;
            }
        }
        // 禁用 Ctrl+U (查看源代码)
        if (e.ctrlKey && e.key.toLowerCase() === 'u') {
            e.preventDefault();
            e.stopPropagation();
            return false;
        }
        // 禁用 Ctrl+S (保存页面)
        if (e.ctrlKey && e.key.toLowerCase() === 's') {
            e.preventDefault();
            e.stopPropagation();
            return false;
        }
        // 禁用 Ctrl+A (全选)
        if (e.ctrlKey && e.key.toLowerCase() === 'a') {
            e.preventDefault();
            e.stopPropagation();
            return false;
        }
        // 禁用 Ctrl+P (打印)
        if (e.ctrlKey && e.key.toLowerCase() === 'p') {
            e.preventDefault();
            e.stopPropagation();
            return false;
        }
        // 禁用 Ctrl+F (查找)
        if (e.ctrlKey && e.key.toLowerCase() === 'f') {
            e.preventDefault();
            e.stopPropagation();
            return false;
        }
        // 禁用 Alt+Tab (切换窗口)
        if (e.altKey && e.key === 'Tab') {
            e.preventDefault();
            e.stopPropagation();
            return false;
        }
        // 禁用 Ctrl+Tab (切换标签页)
        if (e.ctrlKey && e.key === 'Tab') {
            e.preventDefault();
            e.stopPropagation();
            return false;
        }
        // 禁用 Ctrl+W (关闭标签页)
        if (e.ctrlKey && e.key.toLowerCase() === 'w') {
            e.preventDefault();
            e.stopPropagation();
            return false;
        }
        // 禁用 Ctrl+R 和 F5 (刷新页面)
        if ((e.ctrlKey && e.key.toLowerCase() === 'r') || e.key === 'F5') {
            e.preventDefault();
            e.stopPropagation();
            return false;
        }
        // 禁用 Ctrl+Shift+R (强制刷新)
        if (e.ctrlKey && e.shiftKey && e.key.toLowerCase() === 'r') {
            e.preventDefault();
            e.stopPropagation();
            return false;
        }
    };
    document.addEventListener('keydown', handleKeyDown, true);
    // 禁用选择文本
    const handleSelectStart = (e) => {
        if (isLock.value) {
            e.preventDefault();
            return false;
        }
    };
    document.addEventListener('selectstart', handleSelectStart, true);
    // 禁用拖拽
    const handleDragStart = (e) => {
        if (isLock.value) {
            e.preventDefault();
            return false;
        }
    };
    document.addEventListener('dragstart', handleDragStart, true);
    // 监听开发者工具打开状态（仅在桌面端启用）
    let devtools = { open: false };
    const threshold = 160;
    let devToolsInterval = null;
    const checkDevTools = () => {
        if (!isLock.value || isMobile())
            return;
        const isDevToolsOpen = window.outerHeight - window.innerHeight > threshold ||
            window.outerWidth - window.innerWidth > threshold;
        if (isDevToolsOpen && !devtools.open) {
            devtools.open = true;
            showDevToolsWarning.value = true;
        }
        else if (!isDevToolsOpen && devtools.open) {
            devtools.open = false;
            showDevToolsWarning.value = false;
        }
    };
    // 仅在桌面端启用开发者工具检测
    if (!isMobile()) {
        devToolsInterval = setInterval(checkDevTools, 500);
    }
    // 返回清理函数
    return () => {
        document.removeEventListener('contextmenu', handleContextMenu, true);
        document.removeEventListener('keydown', handleKeyDown, true);
        document.removeEventListener('selectstart', handleSelectStart, true);
        document.removeEventListener('dragstart', handleDragStart, true);
        if (devToolsInterval) {
            clearInterval(devToolsInterval);
        }
    };
};
// 工具函数
const verifyPassword = (inputPassword, storedPassword) => {
    try {
        const decryptedPassword = CryptoJS.AES.decrypt(storedPassword, ENCRYPT_KEY).toString(CryptoJS.enc.Utf8);
        return inputPassword === decryptedPassword;
    }
    catch (error) {
        console.error('密码解密失败:', error);
        return false;
    }
};
// 事件处理函数
const handleKeydown = (event) => {
    if (event.altKey && event.key.toLowerCase() === '¬') {
        event.preventDefault();
        visible.value = true;
    }
};
const handleDialogOpen = () => {
    setTimeout(() => {
        lockInputRef.value?.input?.focus();
    }, 100);
};
const handleLock = async () => {
    if (!formRef.value)
        return;
    await formRef.value.validate((valid, fields) => {
        if (valid) {
            const encryptedPassword = CryptoJS.AES.encrypt(formData.password, ENCRYPT_KEY).toString();
            userStore.setLockStatus(true);
            userStore.setLockPassword(encryptedPassword);
            visible.value = false;
            formData.password = '';
        }
        else {
            console.error('表单验证失败:', fields);
        }
    });
};
const handleUnlock = async () => {
    if (!unlockFormRef.value)
        return;
    await unlockFormRef.value.validate((valid, fields) => {
        if (valid) {
            const isValid = verifyPassword(unlockForm.password, lockPassword.value);
            if (isValid) {
                try {
                    userStore.setLockStatus(false);
                    userStore.setLockPassword('');
                    unlockForm.password = '';
                    visible.value = false;
                    showDevToolsWarning.value = false;
                }
                catch (error) {
                    console.error('更新store失败:', error);
                }
            }
            else {
                // 触发抖动动画
                const inputElement = unlockInputRef.value?.$el;
                if (inputElement) {
                    inputElement.classList.add('shake-animation');
                    setTimeout(() => {
                        inputElement.classList.remove('shake-animation');
                    }, 300);
                }
                ElMessage.error(t('lockScreen.pwdError'));
                unlockForm.password = '';
            }
        }
        else {
            console.error('表单验证失败:', fields);
        }
    });
};
const toLogin = () => {
    userStore.logOut();
};
const openLockScreen = () => {
    visible.value = true;
};
// 监听锁屏状态变化
watch(isLock, (newValue) => {
    if (newValue) {
        document.body.style.overflow = 'hidden';
        setTimeout(() => {
            unlockInputRef.value?.input?.focus();
        }, 100);
    }
    else {
        document.body.style.overflow = 'auto';
        showDevToolsWarning.value = false;
    }
});
// 存储清理函数
let cleanupDevTools = null;
// 生命周期钩子
onMounted(() => {
    mittBus.on('openLockScreen', openLockScreen);
    document.addEventListener('keydown', handleKeydown);
    if (isLock.value) {
        visible.value = true;
        setTimeout(() => {
            unlockInputRef.value?.input?.focus();
        }, 100);
    }
    // 初始化禁用开发者工具功能
    cleanupDevTools = disableDevTools();
});
onUnmounted(() => {
    document.removeEventListener('keydown', handleKeydown);
    document.body.style.overflow = 'auto';
    // 清理禁用开发者工具的事件监听器
    if (cleanupDevTools) {
        cleanupDevTools();
        cleanupDevTools = null;
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
    __VLS_styleScopedClasses['unlock-content'];
    // CSS variable injection 
    // CSS variable injection end 
    let __VLS_resolvedLocalAndGlobalComponents;
    __VLS_elementAsFunction(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({ ...{ class: ("layout-lock-screen") }, });
    if (__VLS_ctx.showDevToolsWarning) {
        __VLS_elementAsFunction(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({ ...{ class: ("fixed top-0 left-0 z-[999999] flex-cc w-full h-full text-white bg-gradient-to-br from-[#1e1e1e] to-black animate-fade-in") }, });
        __VLS_elementAsFunction(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({ ...{ class: ("p-5 text-center select-none") }, });
        __VLS_elementAsFunction(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({ ...{ class: ("mb-7.5 text-5xl") }, });
        __VLS_elementAsFunction(__VLS_intrinsicElements.h1, __VLS_intrinsicElements.h1)({ ...{ class: ("m-0 mb-5 text-3xl font-semibold text-danger") }, });
        __VLS_elementAsFunction(__VLS_intrinsicElements.p, __VLS_intrinsicElements.p)({ ...{ class: ("max-w-125 m-0 text-lg leading-relaxed text-white") }, });
        __VLS_elementAsFunction(__VLS_intrinsicElements.br)({});
        __VLS_elementAsFunction(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({ ...{ class: ("mt-7.5 text-sm text-gray-400") }, });
    }
    if (!__VLS_ctx.isLock) {
        __VLS_elementAsFunction(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({});
        const __VLS_0 = __VLS_resolvedLocalAndGlobalComponents.ElDialog;
        /** @type { [typeof __VLS_components.ElDialog, typeof __VLS_components.ElDialog, ] } */
        // @ts-ignore
        const __VLS_1 = __VLS_asFunctionalComponent(__VLS_0, new __VLS_0({ ...{ 'onOpen': {} }, modelValue: ((__VLS_ctx.visible)), width: ((370)), showClose: ((false)), }));
        const __VLS_2 = __VLS_1({ ...{ 'onOpen': {} }, modelValue: ((__VLS_ctx.visible)), width: ((370)), showClose: ((false)), }, ...__VLS_functionalComponentArgsRest(__VLS_1));
        let __VLS_6;
        const __VLS_7 = {
            onOpen: (__VLS_ctx.handleDialogOpen)
        };
        let __VLS_3;
        let __VLS_4;
        __VLS_elementAsFunction(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({ ...{ class: ("flex-c flex-col") }, });
        __VLS_elementAsFunction(__VLS_intrinsicElements.img)({ ...{ class: ("w-16 h-16 rounded-full") }, src: ("@imgs/user/avatar.webp"), alt: ("用户头像"), });
        __VLS_elementAsFunction(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({ ...{ class: ("mt-7.5 mb-3.5 text-base font-medium") }, });
        (__VLS_ctx.userInfo.username);
        const __VLS_8 = __VLS_resolvedLocalAndGlobalComponents.ElForm;
        /** @type { [typeof __VLS_components.ElForm, typeof __VLS_components.ElForm, ] } */
        // @ts-ignore
        const __VLS_9 = __VLS_asFunctionalComponent(__VLS_8, new __VLS_8({ ...{ 'onSubmit': {} }, ref: ("formRef"), model: ((__VLS_ctx.formData)), rules: ((__VLS_ctx.rules)), ...{ class: ("w-[90%]") }, }));
        const __VLS_10 = __VLS_9({ ...{ 'onSubmit': {} }, ref: ("formRef"), model: ((__VLS_ctx.formData)), rules: ((__VLS_ctx.rules)), ...{ class: ("w-[90%]") }, }, ...__VLS_functionalComponentArgsRest(__VLS_9));
        // @ts-ignore navigation for `const formRef = ref()`
        __VLS_ctx.formRef;
        var __VLS_14 = {};
        let __VLS_15;
        const __VLS_16 = {
            onSubmit: (__VLS_ctx.handleLock)
        };
        let __VLS_11;
        let __VLS_12;
        const __VLS_17 = __VLS_resolvedLocalAndGlobalComponents.ElFormItem;
        /** @type { [typeof __VLS_components.ElFormItem, typeof __VLS_components.ElFormItem, ] } */
        // @ts-ignore
        const __VLS_18 = __VLS_asFunctionalComponent(__VLS_17, new __VLS_17({ prop: ("password"), }));
        const __VLS_19 = __VLS_18({ prop: ("password"), }, ...__VLS_functionalComponentArgsRest(__VLS_18));
        const __VLS_23 = __VLS_resolvedLocalAndGlobalComponents.ElInput;
        /** @type { [typeof __VLS_components.ElInput, typeof __VLS_components.ElInput, ] } */
        // @ts-ignore
        const __VLS_24 = __VLS_asFunctionalComponent(__VLS_23, new __VLS_23({ ...{ 'onKeyup': {} }, modelValue: ((__VLS_ctx.formData.password)), type: ("password"), placeholder: ((__VLS_ctx.$t('lockScreen.lock.inputPlaceholder'))), showPassword: ((true)), autocomplete: ("new-password"), ref: ("lockInputRef"), ...{ class: ("w-full mt-9") }, }));
        const __VLS_25 = __VLS_24({ ...{ 'onKeyup': {} }, modelValue: ((__VLS_ctx.formData.password)), type: ("password"), placeholder: ((__VLS_ctx.$t('lockScreen.lock.inputPlaceholder'))), showPassword: ((true)), autocomplete: ("new-password"), ref: ("lockInputRef"), ...{ class: ("w-full mt-9") }, }, ...__VLS_functionalComponentArgsRest(__VLS_24));
        // @ts-ignore navigation for `const lockInputRef = ref()`
        __VLS_ctx.lockInputRef;
        var __VLS_29 = {};
        let __VLS_30;
        const __VLS_31 = {
            onKeyup: (__VLS_ctx.handleLock)
        };
        let __VLS_26;
        let __VLS_27;
        __VLS_elementAsFunction(__VLS_intrinsicElements.template, __VLS_intrinsicElements.template)({});
        {
            const { suffix: __VLS_thisSlot } = __VLS_nonNullable(__VLS_28.slots);
            const __VLS_32 = __VLS_resolvedLocalAndGlobalComponents.ElIcon;
            /** @type { [typeof __VLS_components.ElIcon, typeof __VLS_components.ElIcon, ] } */
            // @ts-ignore
            const __VLS_33 = __VLS_asFunctionalComponent(__VLS_32, new __VLS_32({ ...{ 'onClick': {} }, ...{ class: ("c-p") }, }));
            const __VLS_34 = __VLS_33({ ...{ 'onClick': {} }, ...{ class: ("c-p") }, }, ...__VLS_functionalComponentArgsRest(__VLS_33));
            let __VLS_38;
            const __VLS_39 = {
                onClick: (__VLS_ctx.handleLock)
            };
            let __VLS_35;
            let __VLS_36;
            const __VLS_40 = __VLS_resolvedLocalAndGlobalComponents.Lock;
            /** @type { [typeof __VLS_components.Lock, ] } */
            // @ts-ignore
            const __VLS_41 = __VLS_asFunctionalComponent(__VLS_40, new __VLS_40({}));
            const __VLS_42 = __VLS_41({}, ...__VLS_functionalComponentArgsRest(__VLS_41));
            __VLS_nonNullable(__VLS_37.slots).default;
            var __VLS_37;
        }
        var __VLS_28;
        __VLS_nonNullable(__VLS_22.slots).default;
        var __VLS_22;
        const __VLS_46 = __VLS_resolvedLocalAndGlobalComponents.ElButton;
        /** @type { [typeof __VLS_components.ElButton, typeof __VLS_components.ElButton, ] } */
        // @ts-ignore
        const __VLS_47 = __VLS_asFunctionalComponent(__VLS_46, new __VLS_46({ ...{ 'onClick': {} }, type: ("primary"), ...{ class: ("w-full mt-0.5") }, }));
        const __VLS_48 = __VLS_47({ ...{ 'onClick': {} }, type: ("primary"), ...{ class: ("w-full mt-0.5") }, }, ...__VLS_functionalComponentArgsRest(__VLS_47));
        __VLS_asFunctionalDirective(__VLS_directives.vRipple)(null, { ...__VLS_directiveBindingRestFields, modifiers: {}, }, null, null);
        let __VLS_52;
        const __VLS_53 = {
            onClick: (__VLS_ctx.handleLock)
        };
        let __VLS_49;
        let __VLS_50;
        (__VLS_ctx.$t('lockScreen.lock.btnText'));
        __VLS_nonNullable(__VLS_51.slots).default;
        var __VLS_51;
        __VLS_nonNullable(__VLS_13.slots).default;
        var __VLS_13;
        __VLS_nonNullable(__VLS_5.slots).default;
        var __VLS_5;
    }
    else {
        __VLS_elementAsFunction(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({ ...{ class: ("unlock-content") }, });
        __VLS_elementAsFunction(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({ ...{ class: ("flex-c flex-col w-80") }, });
        __VLS_elementAsFunction(__VLS_intrinsicElements.img)({ ...{ class: ("w-16 h-16 mt-5 rounded-full") }, src: ("@imgs/user/avatar.webp"), alt: ("用户头像"), });
        __VLS_elementAsFunction(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({ ...{ class: ("mt-3 mb-3.5 text-base font-medium") }, });
        (__VLS_ctx.userInfo.username);
        const __VLS_54 = __VLS_resolvedLocalAndGlobalComponents.ElForm;
        /** @type { [typeof __VLS_components.ElForm, typeof __VLS_components.ElForm, ] } */
        // @ts-ignore
        const __VLS_55 = __VLS_asFunctionalComponent(__VLS_54, new __VLS_54({ ...{ 'onSubmit': {} }, ref: ("unlockFormRef"), model: ((__VLS_ctx.unlockForm)), rules: ((__VLS_ctx.rules)), ...{ class: ("w-full !px-2.5") }, }));
        const __VLS_56 = __VLS_55({ ...{ 'onSubmit': {} }, ref: ("unlockFormRef"), model: ((__VLS_ctx.unlockForm)), rules: ((__VLS_ctx.rules)), ...{ class: ("w-full !px-2.5") }, }, ...__VLS_functionalComponentArgsRest(__VLS_55));
        // @ts-ignore navigation for `const unlockFormRef = ref()`
        __VLS_ctx.unlockFormRef;
        var __VLS_60 = {};
        let __VLS_61;
        const __VLS_62 = {
            onSubmit: (__VLS_ctx.handleUnlock)
        };
        let __VLS_57;
        let __VLS_58;
        const __VLS_63 = __VLS_resolvedLocalAndGlobalComponents.ElFormItem;
        /** @type { [typeof __VLS_components.ElFormItem, typeof __VLS_components.ElFormItem, ] } */
        // @ts-ignore
        const __VLS_64 = __VLS_asFunctionalComponent(__VLS_63, new __VLS_63({ prop: ("password"), }));
        const __VLS_65 = __VLS_64({ prop: ("password"), }, ...__VLS_functionalComponentArgsRest(__VLS_64));
        const __VLS_69 = __VLS_resolvedLocalAndGlobalComponents.ElInput;
        /** @type { [typeof __VLS_components.ElInput, typeof __VLS_components.ElInput, ] } */
        // @ts-ignore
        const __VLS_70 = __VLS_asFunctionalComponent(__VLS_69, new __VLS_69({ modelValue: ((__VLS_ctx.unlockForm.password)), type: ("password"), placeholder: ((__VLS_ctx.$t('lockScreen.unlock.inputPlaceholder'))), showPassword: ((true)), autocomplete: ("new-password"), ref: ("unlockInputRef"), ...{ class: ("mt-5") }, }));
        const __VLS_71 = __VLS_70({ modelValue: ((__VLS_ctx.unlockForm.password)), type: ("password"), placeholder: ((__VLS_ctx.$t('lockScreen.unlock.inputPlaceholder'))), showPassword: ((true)), autocomplete: ("new-password"), ref: ("unlockInputRef"), ...{ class: ("mt-5") }, }, ...__VLS_functionalComponentArgsRest(__VLS_70));
        // @ts-ignore navigation for `const unlockInputRef = ref()`
        __VLS_ctx.unlockInputRef;
        var __VLS_75 = {};
        __VLS_elementAsFunction(__VLS_intrinsicElements.template, __VLS_intrinsicElements.template)({});
        {
            const { suffix: __VLS_thisSlot } = __VLS_nonNullable(__VLS_74.slots);
            const __VLS_76 = __VLS_resolvedLocalAndGlobalComponents.ElIcon;
            /** @type { [typeof __VLS_components.ElIcon, typeof __VLS_components.ElIcon, ] } */
            // @ts-ignore
            const __VLS_77 = __VLS_asFunctionalComponent(__VLS_76, new __VLS_76({ ...{ 'onClick': {} }, ...{ class: ("c-p") }, }));
            const __VLS_78 = __VLS_77({ ...{ 'onClick': {} }, ...{ class: ("c-p") }, }, ...__VLS_functionalComponentArgsRest(__VLS_77));
            let __VLS_82;
            const __VLS_83 = {
                onClick: (__VLS_ctx.handleUnlock)
            };
            let __VLS_79;
            let __VLS_80;
            const __VLS_84 = __VLS_resolvedLocalAndGlobalComponents.Unlock;
            /** @type { [typeof __VLS_components.Unlock, ] } */
            // @ts-ignore
            const __VLS_85 = __VLS_asFunctionalComponent(__VLS_84, new __VLS_84({}));
            const __VLS_86 = __VLS_85({}, ...__VLS_functionalComponentArgsRest(__VLS_85));
            __VLS_nonNullable(__VLS_81.slots).default;
            var __VLS_81;
        }
        var __VLS_74;
        __VLS_nonNullable(__VLS_68.slots).default;
        var __VLS_68;
        const __VLS_90 = __VLS_resolvedLocalAndGlobalComponents.ElButton;
        /** @type { [typeof __VLS_components.ElButton, typeof __VLS_components.ElButton, ] } */
        // @ts-ignore
        const __VLS_91 = __VLS_asFunctionalComponent(__VLS_90, new __VLS_90({ ...{ 'onClick': {} }, type: ("primary"), ...{ class: ("w-full mt-2") }, }));
        const __VLS_92 = __VLS_91({ ...{ 'onClick': {} }, type: ("primary"), ...{ class: ("w-full mt-2") }, }, ...__VLS_functionalComponentArgsRest(__VLS_91));
        __VLS_asFunctionalDirective(__VLS_directives.vRipple)(null, { ...__VLS_directiveBindingRestFields, modifiers: {}, }, null, null);
        let __VLS_96;
        const __VLS_97 = {
            onClick: (__VLS_ctx.handleUnlock)
        };
        let __VLS_93;
        let __VLS_94;
        (__VLS_ctx.$t('lockScreen.unlock.btnText'));
        __VLS_nonNullable(__VLS_95.slots).default;
        var __VLS_95;
        __VLS_elementAsFunction(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({ ...{ class: ("w-full text-center") }, });
        const __VLS_98 = __VLS_resolvedLocalAndGlobalComponents.ElButton;
        /** @type { [typeof __VLS_components.ElButton, typeof __VLS_components.ElButton, ] } */
        // @ts-ignore
        const __VLS_99 = __VLS_asFunctionalComponent(__VLS_98, new __VLS_98({ ...{ 'onClick': {} }, text: (true), ...{ class: ("mt-2.5 !text-g-600 hover:!text-theme hover:!bg-transparent") }, }));
        const __VLS_100 = __VLS_99({ ...{ 'onClick': {} }, text: (true), ...{ class: ("mt-2.5 !text-g-600 hover:!text-theme hover:!bg-transparent") }, }, ...__VLS_functionalComponentArgsRest(__VLS_99));
        let __VLS_104;
        const __VLS_105 = {
            onClick: (__VLS_ctx.toLogin)
        };
        let __VLS_101;
        let __VLS_102;
        (__VLS_ctx.$t('lockScreen.unlock.backBtnText'));
        __VLS_nonNullable(__VLS_103.slots).default;
        var __VLS_103;
        __VLS_nonNullable(__VLS_59.slots).default;
        var __VLS_59;
    }
    __VLS_styleScopedClasses['layout-lock-screen'];
    __VLS_styleScopedClasses['fixed'];
    __VLS_styleScopedClasses['top-0'];
    __VLS_styleScopedClasses['left-0'];
    __VLS_styleScopedClasses['z-[999999]'];
    __VLS_styleScopedClasses['flex-cc'];
    __VLS_styleScopedClasses['w-full'];
    __VLS_styleScopedClasses['h-full'];
    __VLS_styleScopedClasses['text-white'];
    __VLS_styleScopedClasses['bg-gradient-to-br'];
    __VLS_styleScopedClasses['from-[#1e1e1e]'];
    __VLS_styleScopedClasses['to-black'];
    __VLS_styleScopedClasses['animate-fade-in'];
    __VLS_styleScopedClasses['p-5'];
    __VLS_styleScopedClasses['text-center'];
    __VLS_styleScopedClasses['select-none'];
    __VLS_styleScopedClasses['mb-7.5'];
    __VLS_styleScopedClasses['text-5xl'];
    __VLS_styleScopedClasses['m-0'];
    __VLS_styleScopedClasses['mb-5'];
    __VLS_styleScopedClasses['text-3xl'];
    __VLS_styleScopedClasses['font-semibold'];
    __VLS_styleScopedClasses['text-danger'];
    __VLS_styleScopedClasses['max-w-125'];
    __VLS_styleScopedClasses['m-0'];
    __VLS_styleScopedClasses['text-lg'];
    __VLS_styleScopedClasses['leading-relaxed'];
    __VLS_styleScopedClasses['text-white'];
    __VLS_styleScopedClasses['mt-7.5'];
    __VLS_styleScopedClasses['text-sm'];
    __VLS_styleScopedClasses['text-gray-400'];
    __VLS_styleScopedClasses['flex-c'];
    __VLS_styleScopedClasses['flex-col'];
    __VLS_styleScopedClasses['w-16'];
    __VLS_styleScopedClasses['h-16'];
    __VLS_styleScopedClasses['rounded-full'];
    __VLS_styleScopedClasses['mt-7.5'];
    __VLS_styleScopedClasses['mb-3.5'];
    __VLS_styleScopedClasses['text-base'];
    __VLS_styleScopedClasses['font-medium'];
    __VLS_styleScopedClasses['w-[90%]'];
    __VLS_styleScopedClasses['w-full'];
    __VLS_styleScopedClasses['mt-9'];
    __VLS_styleScopedClasses['c-p'];
    __VLS_styleScopedClasses['w-full'];
    __VLS_styleScopedClasses['mt-0.5'];
    __VLS_styleScopedClasses['unlock-content'];
    __VLS_styleScopedClasses['flex-c'];
    __VLS_styleScopedClasses['flex-col'];
    __VLS_styleScopedClasses['w-80'];
    __VLS_styleScopedClasses['w-16'];
    __VLS_styleScopedClasses['h-16'];
    __VLS_styleScopedClasses['mt-5'];
    __VLS_styleScopedClasses['rounded-full'];
    __VLS_styleScopedClasses['mt-3'];
    __VLS_styleScopedClasses['mb-3.5'];
    __VLS_styleScopedClasses['text-base'];
    __VLS_styleScopedClasses['font-medium'];
    __VLS_styleScopedClasses['w-full'];
    __VLS_styleScopedClasses['!px-2.5'];
    __VLS_styleScopedClasses['mt-5'];
    __VLS_styleScopedClasses['c-p'];
    __VLS_styleScopedClasses['w-full'];
    __VLS_styleScopedClasses['mt-2'];
    __VLS_styleScopedClasses['w-full'];
    __VLS_styleScopedClasses['text-center'];
    __VLS_styleScopedClasses['mt-2.5'];
    __VLS_styleScopedClasses['!text-g-600'];
    __VLS_styleScopedClasses['hover:!text-theme'];
    __VLS_styleScopedClasses['hover:!bg-transparent'];
    var __VLS_slots;
    var __VLS_inheritedAttrs;
    const __VLS_refs = {
        "formRef": __VLS_14,
        "lockInputRef": __VLS_29,
        "unlockFormRef": __VLS_60,
        "unlockInputRef": __VLS_75,
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
            Lock: Lock,
            Unlock: Unlock,
            userInfo: userInfo,
            isLock: isLock,
            visible: visible,
            lockInputRef: lockInputRef,
            unlockInputRef: unlockInputRef,
            showDevToolsWarning: showDevToolsWarning,
            formRef: formRef,
            unlockFormRef: unlockFormRef,
            formData: formData,
            unlockForm: unlockForm,
            rules: rules,
            handleDialogOpen: handleDialogOpen,
            handleLock: handleLock,
            handleUnlock: handleUnlock,
            toLogin: toLogin,
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