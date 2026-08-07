import { ref, watch, onUnmounted } from 'vue';
import { Client } from '@stomp/stompjs';
import { useUserStore } from '@/store/modules/user';
/**
 * 看板 WebSocket Hook
 *
 * @param projectIdRef 项目ID (响应式引用)
 * @param onMessage 收到消息时的回调
 * @returns 连接状态和手动控制方法
 */
export function useBoardSocket(projectIdRef, onMessage) {
    const userStore = useUserStore();
    const connected = ref(false);
    const client = ref(null);
    const currentProjectId = ref(0);
    /**
     * 获取 WebSocket 地址
     */
    const getWsUrl = () => {
        const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
        const host = import.meta.env.VITE_API_PROXY_URL
            ? new URL(import.meta.env.VITE_API_PROXY_URL).host
            : window.location.host;
        return `${protocol}//${host}/ws`;
    };
    /**
     * 获取当前项目ID
     */
    const getProjectId = () => {
        if (typeof projectIdRef === 'function') {
            return projectIdRef();
        }
        return projectIdRef.value;
    };
    /**
     * 建立 WebSocket 连接
     */
    const connect = (projectId) => {
        if (!projectId || projectId <= 0) {
            console.warn('[BoardSocket] 无效的 projectId，跳过连接:', projectId);
            return;
        }
        // 如果已连接到同一项目，跳过
        if (client.value?.active && currentProjectId.value === projectId) {
            console.log('[BoardSocket] 已连接到项目:', projectId);
            return;
        }
        // 如果已有连接但项目不同，先断开
        if (client.value?.active) {
            console.log('[BoardSocket] 切换项目，断开旧连接');
            client.value.deactivate();
        }
        currentProjectId.value = projectId;
        const wsUrl = getWsUrl();
        console.log('[BoardSocket] 正在连接:', wsUrl, '项目ID:', projectId);
        client.value = new Client({
            brokerURL: wsUrl,
            // 连接时带上 Token（可选）
            connectHeaders: {
                Authorization: `Bearer ${userStore.accessToken || ''}`
            },
            // 调试日志
            debug: (str) => {
                if (import.meta.env.DEV) {
                    console.log('[STOMP]', str);
                }
            },
            // 重连配置
            reconnectDelay: 5000,
            heartbeatIncoming: 4000,
            heartbeatOutgoing: 4000,
            onConnect: () => {
                console.log('[BoardSocket] 连接成功');
                connected.value = true;
                // 订阅项目看板 topic
                const topic = `/topic/board/${projectId}`;
                console.log('[BoardSocket] 订阅:', topic);
                client.value?.subscribe(topic, (message) => {
                    try {
                        const body = JSON.parse(message.body);
                        console.log('[BoardSocket] 收到消息:', body);
                        // 调用回调函数
                        onMessage?.(body);
                    }
                    catch (e) {
                        console.error('[BoardSocket] 消息解析失败:', e);
                    }
                });
            },
            onDisconnect: () => {
                console.log('[BoardSocket] 连接断开');
                connected.value = false;
            },
            onStompError: (frame) => {
                console.error('[BoardSocket] STOMP 错误:', frame.headers['message']);
                console.error('[BoardSocket] 详情:', frame.body);
            },
            onWebSocketError: (event) => {
                console.error('[BoardSocket] WebSocket 错误:', event);
            }
        });
        client.value.activate();
    };
    /**
     * 断开 WebSocket 连接
     */
    const disconnect = () => {
        if (client.value?.active) {
            console.log('[BoardSocket] 正在断开连接...');
            client.value.deactivate();
            client.value = null;
            connected.value = false;
            currentProjectId.value = 0;
        }
    };
    // 监听 projectId 变化，自动连接/重连
    if (typeof projectIdRef === 'function') {
        // 如果是 getter 函数，创建一个 computed-like 的 watch
        watch(projectIdRef, (newId) => {
            if (newId && newId > 0) {
                connect(newId);
            }
        }, { immediate: true });
    }
    else {
        // 如果是 Ref，直接 watch
        watch(projectIdRef, (newId) => {
            if (newId && newId > 0) {
                connect(newId);
            }
        }, { immediate: true });
    }
    // 组件卸载时断开
    onUnmounted(() => {
        disconnect();
    });
    return {
        connected,
        connect: () => connect(getProjectId()),
        disconnect
    };
}
//# sourceMappingURL=useBoardSocket.js.map