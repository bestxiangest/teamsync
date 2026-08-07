/// <reference types="vite/client" />

declare module 'nprogress'

declare module 'crypto-js'

declare module 'vue-img-cutter'

declare module 'file-saver'

declare module 'qrcode.vue' {
  export type Level = 'L' | 'M' | 'Q' | 'H'
  export type RenderAs = 'canvas' | 'svg'
  export type GradientType = 'linear' | 'radial'
  export interface ImageSettings {
    src: string
    height: number
    width: number
    excavate: boolean
  }
  export interface QRCodeProps {
    value: string
    size?: number
    level?: Level
    background?: string
    foreground?: string
    renderAs?: RenderAs
  }
  const QrcodeVue: any
  export default QrcodeVue
}

declare module '@/router' {
  export const router: import('vue-router').Router
  export function initRouter(app: import('vue').App): void
  export const HOME_PAGE_PATH: string
}

declare module '@/router/routesAlias' {
  export enum RoutesAlias {
    Layout = '/index/index',
    Login = '/auth/login',
    Dashboard = '/dashboard/console'
  }
}

declare module '@/router/guards/beforeEach' {
  export function getPendingLoading(): boolean
  export function resetPendingLoading(): void
  export function getRouteInitFailed(): boolean
  export function resetRouteInitState(): void
  export function setupBeforeEachGuard(router: import('vue-router').Router): void
  export function resetRouterState(delay?: number): void
}

declare module '@/router/core' {
  export const RouteRegistry: any
  export const ComponentLoader: any
  export const RouteValidator: any
  export const RouteTransformer: any
  export const IframeRouteManager: {
    getInstance(): {
      findByPath(path: string): any
    }
  }
  export const MenuProcessor: any
  export const RoutePermissionValidator: any
}

// 全局变量声明
declare const __APP_VERSION__: string // 版本号
