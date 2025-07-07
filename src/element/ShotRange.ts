import { Ellipse, Group, Line, PointerEvent, type IStrokeAlign } from "leafer-ui";
import { ShotMarker } from "./ShotMarker";
import type { Ref } from "vue";
import type { Point, ScoreItem } from "../types";
import {
  RING_CONFIGS,
  RING_STYLE,
  TARGET_CENTER_CONFIG,
  BASE_RING_SIZE,
  Z_INDEX
} from "../constants/config";
import {
  calculateCenterPoint,
  generateElementId,
  calculateRingSize,
  calculateZIndex,
  parseElementId
} from "../utils/helpers";

/**
 * 射击靶类 - 负责创建和管理射击靶的显示和交互
 */
export class ShotRange {
  private readonly group: Group;
  private readonly centerPoint: Point;
  private readonly targetCenter: Group;
  private readonly rings: Ellipse[];
  private readonly scoreList: Ref<ScoreItem[]>;
  private readonly currentDraggingIndex: Ref<number>;
  private dotIndex: number = 0;

  /**
   * 构造函数
   * @param scoreList 分数列表的响应式引用
   * @param currentDraggingIndex 当前拖拽索引的响应式引用
   */
  constructor(scoreList: Ref<ScoreItem[]>, currentDraggingIndex: Ref<number>) {
    this.scoreList = scoreList;
    this.currentDraggingIndex = currentDraggingIndex;
    this.centerPoint = calculateCenterPoint({
      width: 500,
      height: 500
    });

    // 创建靶心和靶环
    this.targetCenter = this.createTargetCenter();
    this.rings = this.createTargetRings();

    // 创建主组合
    this.group = new Group({
      children: [
        ...this.rings,
        this.targetCenter,
      ]
    });

    // 初始化事件监听
    this.initEvents();
  }

  /**
   * 初始化事件监听
   * 处理点击射击靶的事件，创建射击标记
   */
  private initEvents(): void {
    this.group.on(PointerEvent.TAP, (e) => {
      // 获取点击位置
      const clickPoint = e.getPagePoint();

      // 创建射击标记
      const shotMarker = new ShotMarker(
        clickPoint,
        this.group,
        this.scoreList,
        this.currentDraggingIndex,
        ++this.dotIndex
      );

      // 添加到当前组合中
      this.group.add(shotMarker.getGroup());
      
      const hit = this.group.pick({
        x:e.x,
        y:e.y
      }, {
        through: true
      })
      const bgArr = hit.throughPath?.list.filter(x => x.id !== 'dot' && x.id !== '' && x.id !== 'active-bg')

      const hitTarget = bgArr?.pop()

      // 解析分数并添加到分数列表
      const { score } = parseElementId(hitTarget?.id || '');
      this.scoreList.value.push({
        id: this.dotIndex,
        score: score,
      });
    });
  }

  /**
   * 创建靶心（10环中心区域）
   * @returns 靶心组合元素
   */
  private createTargetCenter(): Group {
    return new Group({
      x: this.centerPoint.x,
      y: this.centerPoint.y,
      zIndex: TARGET_CENTER_CONFIG.zIndex,
      fill: 'transparent',
      around: 'center',
      id: TARGET_CENTER_CONFIG.id,
      children: [
        // 靶心圆环
        new Ellipse({
          width: TARGET_CENTER_CONFIG.size,
          height: TARGET_CENTER_CONFIG.size,
          fill: 'transparent',
          around: 'center',
          stroke: {
            type: 'solid',
            color: RING_STYLE.strokeColor.default
          },
          id: TARGET_CENTER_CONFIG.id,
          strokeWidth: RING_STYLE.strokeWidth,
          strokeAlign: RING_STYLE.strokeAlign as IStrokeAlign,
        }),
        // 水平十字线
        new Line({
          width: TARGET_CENTER_CONFIG.crosshairLength,
          strokeWidth: RING_STYLE.strokeWidth,
          stroke: RING_STYLE.strokeColor.default,
          around: 'center',
          id: TARGET_CENTER_CONFIG.id,
        }),
        // 垂直十字线
        new Line({
          width: TARGET_CENTER_CONFIG.crosshairLength,
          rotation: 90,
          strokeWidth: RING_STYLE.strokeWidth,
          stroke: RING_STYLE.strokeColor.default,
          around: 'center',
          id: TARGET_CENTER_CONFIG.id,
        })
      ]
    });
  }

  /**
   * 创建靶环
   * 从内到外创建10个环，每个环代表不同的分数区域
   * @returns 靶环数组
   */
  private createTargetRings(): Ellipse[] {
    return RING_CONFIGS.map((config, index) => {
      const { width, height } = calculateRingSize(index, BASE_RING_SIZE);
      const zIndex = calculateZIndex(Z_INDEX.BASE_RING, index + 1);

      return new Ellipse({
        width,
        height,
        fill: config.fill,
        around: 'center',
        stroke: {
          type: 'solid',
          // 4环使用特殊的白色描边，其他使用默认黑色
          color: config.range === 4 ? RING_STYLE.strokeColor.special : RING_STYLE.strokeColor.default
        },
        strokeWidth: RING_STYLE.strokeWidth,
        strokeAlign: RING_STYLE.strokeAlign as IStrokeAlign,
        x: this.centerPoint.x,
        y: this.centerPoint.y,
        // ID格式：分数-高亮色-填充色，便于后续解析
        id: generateElementId(config.range, config.high, config.fill),
        zIndex
      });
    });
  }

  /**
   * 获取射击靶的组合元素
   * @returns 包含所有靶环和靶心的组合
   */
  public getGroup(): Group {
    return this.group;
  }
}