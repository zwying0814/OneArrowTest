import {
  Ellipse,
  Group,
  PointerEvent,
  Line,
  DragEvent
} from "leafer-ui";
import "@leafer-in/find";
import { type Ref, ref, watch } from "vue";
import type { Point, ScoreItem } from "../types";
import { MARKER_STYLE, Z_INDEX, VIBRATION_DURATION } from "../constants/config";
import { parseElementId, triggerVibration } from "../utils/helpers";

/**
 * 射击标记类 - 负责创建和管理射击点的显示和拖拽交互
 */
export class ShotMarker {
  private readonly group: Group;
  private readonly point: Point;
  private readonly targetRanges: Group;
  private readonly scoreList: Ref<ScoreItem[]>;
  private readonly currentDraggingIndex: Ref<number>;
  private readonly markerId: string;
  private readonly markerIndex: number;

  /**
   * 构造函数
   * @param point 射击点坐标
   * @param targetRanges 射击靶组合
   * @param scoreList 分数列表的响应式引用
   * @param currentDraggingIndex 当前拖拽索引的响应式引用
   * @param markerId 标记ID
   */
  constructor(
    point: Point,
    targetRanges: Group,
    scoreList: Ref<ScoreItem[]>,
    currentDraggingIndex: Ref<number>,
    markerId: number
  ) {
    this.point = point;
    this.targetRanges = targetRanges;
    this.scoreList = scoreList;
    this.currentDraggingIndex = currentDraggingIndex;
    this.markerId = markerId.toString();
    this.markerIndex = markerId - 1; // 数组索引从0开始

    // 创建射击标记组合
    this.group = this.createMarkerGroup();

    // 初始化事件监听
    this.initEvents();
  }

  /**
   * 创建射击标记的组合元素
   * @returns 包含普通状态和激活状态的组合
   */
  private createMarkerGroup(): Group {
    return new Group({
      zIndex: Z_INDEX.MARKER_ACTIVE,
      fill: 'transparent',
      data: {
        idx: this.markerId
      },
      children: [
        // 普通状态的射击点
        this.createNormalMarker(),
        // 激活状态的射击点（拖拽时显示）
        this.createActiveMarker()
      ]
    });
  }

  /**
   * 创建普通状态的射击标记
   * @returns 普通状态的椭圆标记
   */
  private createNormalMarker(): Ellipse {
    return new Ellipse({
      width: MARKER_STYLE.normal.width,
      height: MARKER_STYLE.normal.height,
      x: this.point.x - MARKER_STYLE.normal.width / 2,
      y: this.point.y - MARKER_STYLE.normal.height / 2,
      fill: MARKER_STYLE.normal.fill,
      strokeWidth: 0.5,
      strokeAlign: 'inside',
      stroke: {
        type: 'solid',
        color: MARKER_STYLE.normal.strokeColor
      },
      id: 'dot',
      zIndex: Z_INDEX.MARKER_NORMAL
    });
  }

  /**
   * 创建激活状态的射击标记（拖拽时显示）
   * @returns 激活状态的组合元素
   */
  private createActiveMarker(): Group {
    return new Group({
      zIndex: Z_INDEX.MARKER_HIGHLIGHT,
      id: 'active-bg',
      fill: 'transparent',
      visible: false,
      children: [
        // 中心绿色圆点
        new Ellipse({
          width: MARKER_STYLE.normal.width,
          height: MARKER_STYLE.normal.height,
          x: this.point.x - MARKER_STYLE.normal.width / 2,
          y: this.point.y - MARKER_STYLE.normal.height / 2,
          fill: MARKER_STYLE.active.fill,
          strokeWidth: 0.5,
          strokeAlign: 'inside',
          stroke: {
            type: 'solid',
            color: MARKER_STYLE.normal.strokeColor
          },
          zIndex: Z_INDEX.MARKER_NORMAL
        }),
        // 高亮光晕
        new Ellipse({
          width: 18,
          height: 18,
          x: this.point.x - 9,
          y: this.point.y - 9,
          fill: MARKER_STYLE.active.highlightColor,
          zIndex: Z_INDEX.MARKER_NORMAL - 1
        }),
        // 外圈边框
        new Ellipse({
          width: 24,
          height: 24,
          x: this.point.x - 12,
          y: this.point.y - 12,
          fill: 'transparent',
          strokeWidth: 0.5,
          strokeAlign: 'inside',
          stroke: {
            type: 'solid',
            color: MARKER_STYLE.active.crosshairColor
          },
          zIndex: Z_INDEX.MARKER_NORMAL - 2
        }),
        // 水平十字线
        new Line({
          width: 40,
          x: this.point.x - 20,
          y: this.point.y,
          strokeWidth: 0.5,
          stroke: MARKER_STYLE.active.crosshairColor,
          zIndex: Z_INDEX.MARKER_NORMAL - 3
        }),
        // 垂直十字线
        new Line({
          width: 40,
          x: this.point.x,
          y: this.point.y - 20,
          rotation: 90,
          strokeWidth: 0.5,
          stroke: MARKER_STYLE.active.crosshairColor,
          zIndex: Z_INDEX.MARKER_NORMAL - 3
        })
      ]
    });
  }

  /**
   * 初始化事件监听
   * 处理长按拖拽、颜色高亮等交互逻辑
   */
  private initEvents(): void {
    // 当前高亮的靶环元素ID
    const currentHighlightedElement = ref<string>();

    // 监听高亮元素变化，恢复其他元素颜色
    watch(currentHighlightedElement, (_newElementId, oldElementId) => {

      // 恢复之前高亮元素的原始颜色
      if (oldElementId) {
        this.restoreElementColor(oldElementId);
      }

      // 触发震动反馈
      triggerVibration(VIBRATION_DURATION);
    });

    // 长按开始拖拽
    this.group.on(PointerEvent.LONG_PRESS, (e) => {
      this.startDragging(e);
      // 拖拽过程中的碰撞检测和高亮
      this.group.on(DragEvent.DRAG, (e) => {
        this.handleDragMove(e, currentHighlightedElement);
      });
    });
    // 松开结束拖拽
    this.group.on(PointerEvent.UP, (_e) => {
      this.stopDragging(currentHighlightedElement);
    });
  }

  /**
   * 开始拖拽操作
   * @param e 长按事件
   */
  private startDragging(_e: any): void {
    // 触发震动反馈
    triggerVibration(VIBRATION_DURATION);

    // 启用拖拽
    this.group.draggable = true;

    // 设置当前拖拽的索引，用于UI高亮
    this.currentDraggingIndex.value = this.markerIndex;

    // 显示激活状态的视觉效果
    const activeBackground = this.group.children.find(x => x.id === 'active-bg') as Group;
    if (activeBackground) {
      activeBackground.visible = true;
    }
  }

  /**
   * 处理拖拽移动过程中的逻辑
   * @param e 拖拽事件
   * @param currentHighlightedElement 当前高亮元素的引用
   */
  private handleDragMove(e: any, currentHighlightedElement: Ref<string | undefined>): void {
    // 进行碰撞检测，找到当前位置对应的靶环
    const hit = this.targetRanges.pick({
      x: e.x,
      y: e.y,
    }, {
      through: true
    })
    const bgArr = hit.throughPath?.list.filter(x => x.id !== 'dot'&& x.id !== '' && x.id !== 'active-bg')

    const hitTarget = bgArr?.pop()
    if (hitTarget && hitTarget.id) {
      // 解析靶环信息
      const { score, highlightColor } = parseElementId(hitTarget.id);

      // 设置高亮颜色
      hitTarget.setAttr('fill', highlightColor);

      // 更新分数列表中对应项的分数
      this.updateScore(score);

      // 更新当前高亮的元素
      currentHighlightedElement.value = hitTarget.id;
    }
  }

  /**
   * 停止拖拽操作
   * @param currentHighlightedElement 当前高亮元素的引用
   */
  private stopDragging(currentHighlightedElement: Ref<string | undefined>): void {
    // 禁用拖拽
    this.group.draggable = false;

    // 重置拖拽索引
    this.currentDraggingIndex.value = -1;

    // 隐藏激活状态的视觉效果
    const activeBackground = this.group.children.find(x => x.id === 'active-bg') as Group;
    if (activeBackground) {
      activeBackground.visible = false;
    }

    // 恢复最后高亮元素的颜色
    if (currentHighlightedElement.value) {
      this.restoreElementColor(currentHighlightedElement.value);
      currentHighlightedElement.value = '';
    }
  }

  /**
   * 恢复元素的原始颜色
   * @param elementId 元素ID
   */
  private restoreElementColor(elementId: string): void {
    const elements = this.targetRanges.children.filter(x => x.id === elementId);
    elements.forEach(element => {
      const { fillColor } = parseElementId(element.id || '');
      element.setAttr('fill', fillColor);
    });
  }

  /**
   * 更新分数列表中对应项的分数
   * @param newScore 新分数
   */
  private updateScore(newScore: number): void {
    const scoreIndex = this.scoreList.value.findIndex(item =>
      item.id.toString() === this.markerId
    );

    if (scoreIndex >= 0) {
      this.scoreList.value[scoreIndex].score = newScore;
    }
  }

  // 获取封装的 group，可供外部添加到画布等
  public getGroup(): Group {
    return this.group
  }
}