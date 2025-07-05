/**
 * 工具函数集合
 */

import type { Point, TargetSize } from '../types';

/**
 * 计算画布中心点坐标
 * @param size 画布尺寸
 * @returns 中心点坐标
 */
export function calculateCenterPoint(size: TargetSize): Point {
  return {
    x: size.width / 2,
    y: size.height / 2
  };
}

/**
 * 解析元素ID，提取分数和颜色信息
 * @param elementId 元素ID（格式："score-highlightColor-fillColor"）
 * @returns 解析后的分数和颜色信息
 */
export function parseElementId(elementId: string): {
  score: number;
  highlightColor: string;
  fillColor: string;
} {
  const parts = elementId.split('-');
  return {
    score: parseInt(parts[0]) || 0,
    highlightColor: parts[1] || '#ff0000',
    fillColor: parts[2] || '#ffffff'
  };
}

/**
 * 生成元素ID
 * @param score 分数
 * @param highlightColor 高亮色
 * @param fillColor 填充色
 * @returns 格式化的ID字符串
 */
export function generateElementId(score: number, highlightColor: string, fillColor: string): string {
  return `${score}-${highlightColor}-${fillColor}`;
}

/**
 * 触发设备震动（如果支持）
 * @param duration 震动时长（毫秒）
 */
export function triggerVibration(duration: number = 100): void {
  if (window?.navigator?.vibrate) {
    window.navigator.vibrate(duration);
  }
}

/**
 * 计算环的尺寸
 * @param index 环的索引（从0开始）
 * @param baseSize 基础尺寸
 * @returns 环的宽高
 */
export function calculateRingSize(index: number, baseSize: number): { width: number; height: number } {
  const size = baseSize * (index + 1);
  return { width: size, height: size };
}

/**
 * 计算Z-Index值
 * @param baseZIndex 基础Z-Index
 * @param offset 偏移量
 * @returns 计算后的Z-Index
 */
export function calculateZIndex(baseZIndex: number, offset: number): number {
  return baseZIndex - offset;
}

/**
 * 防抖函数
 * @param func 要防抖的函数
 * @param wait 等待时间
 * @returns 防抖后的函数
 */
export function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: number;
  return (...args: Parameters<T>) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
}

/**
 * 节流函数
 * @param func 要节流的函数
 * @param limit 时间限制
 * @returns 节流后的函数
 */
export function throttle<T extends (...args: any[]) => any>(
  func: T,
  limit: number
): (...args: Parameters<T>) => void {
  let inThrottle: boolean;
  return (...args: Parameters<T>) => {
    if (!inThrottle) {
      func(...args);
      inThrottle = true;
      setTimeout(() => inThrottle = false, limit);
    }
  };
}