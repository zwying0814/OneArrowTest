/**
 * 射击游戏相关类型定义
 */

// 分数记录项
export interface ScoreItem {
  id: number;
  score: number;
}

// 靶环配置
export interface RingConfig {
  fill: string;      // 填充颜色
  high: string;      // 高亮颜色
  range: number;     // 环数（分数）
}

// 坐标点
export interface Point {
  x: number;
  y: number;
}

// 射击靶尺寸配置
export interface TargetSize {
  width: number;
  height: number;
}

// 应用配置
export interface AppConfig {
  view: string;
  fill: string;
  editor: {
    editBox: boolean;
    selector: boolean;
  };
  pointer?: {
    longPressTime?: number;
    tapMore?: boolean;
  };
}

// 靶环样式常量
export interface RingStyle {
  strokeWidth: number;
  strokeAlign: string;
  strokeColor: {
    default: string;
    special: string; // 特殊环（如4环）的描边颜色
  };
}

// 射击标记样式
export interface MarkerStyle {
  normal: {
    width: number;
    height: number;
    fill: string;
    strokeColor: string;
  };
  active: {
    fill: string;
    highlightColor: string;
    crosshairColor: string;
  };
}