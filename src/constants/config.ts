/**
 * 射击游戏配置常量
 */

import type { RingConfig, AppConfig, RingStyle, MarkerStyle, TargetSize } from '../types';

// 默认射击靶尺寸
export const DEFAULT_TARGET_SIZE: TargetSize = {
  width: 500,
  height: 500
};

// 射击靶尺寸（别名导出）
export const TARGET_SIZE = DEFAULT_TARGET_SIZE;

// 应用默认配置
export const DEFAULT_APP_CONFIG: AppConfig = {
  view: 'arrow',
  fill: '#f1f3f7',
  editor: {
    editBox: false,
    selector: false,
  },
  pointer: {
    longPressTime: 300,
  }
};

// 应用配置（别名导出）
export const APP_CONFIG = DEFAULT_APP_CONFIG;

// 靶环配置（从内到外，一个一个环绘制，颜色两两相同）
export const RING_CONFIGS: RingConfig[] = [
  { fill: '#fdc700', high: '#fff085', range: 10 }, // 10环 - 金色
  { fill: '#fdc700', high: '#fff085', range: 9 },  // 9环 - 金色
  { fill: '#ff6467', high: '#ffc9c9', range: 8 },  // 8环 - 红色
  { fill: '#ff6467', high: '#ffc9c9', range: 7 },  // 7环 - 红色
  { fill: '#02abe2', high: '#8ec5ff', range: 6 },  // 6环 - 蓝色
  { fill: '#02abe2', high: '#8ec5ff', range: 5 },  // 5环 - 蓝色
  { fill: '#000', high: '#314158', range: 4 },     // 4环 - 黑色
  { fill: '#000', high: '#314158', range: 3 },     // 3环 - 黑色
  { fill: '#fff', high: '#f5f5f4', range: 2 },     // 2环 - 白色
  { fill: '#fff', high: '#f5f5f4', range: 1 }      // 1环 - 白色
];

// 靶环样式配置
export const RING_STYLE: RingStyle = {
  strokeWidth: 0.5,
  strokeAlign: 'inside',
  strokeColor: {
    default: '#000',
    special: '#fff' // 4环使用白色描边
  }
};

// 射击标记样式配置
export const MARKER_STYLE: MarkerStyle = {
  normal: {
    width: 10,
    height: 10,
    fill: 'gray',
    strokeColor: '#fff'
  },
  active: {
    fill: 'green',
    highlightColor: 'rgba(0,255,0,0.5)',
    crosshairColor: '#fff'
  }
};

// 靶心配置
export const TARGET_CENTER_CONFIG = {
  size: 20, // 靶心大小
  crosshairLength: 5, // 十字线长度
  zIndex: 101,
  id: '10'
};

// 基础环大小（每环递增的基础尺寸）
export const BASE_RING_SIZE = 40;

// Z-Index 配置
export const Z_INDEX = {
  BASE_RING: 100,
  TARGET_CENTER: 101,
  MARKER_NORMAL: 998,
  MARKER_ACTIVE: 999,
  MARKER_HIGHLIGHT: 1000
};

// 震动配置
export const VIBRATION_DURATION = 100;