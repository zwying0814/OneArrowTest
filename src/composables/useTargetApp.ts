import { ref } from 'vue';
import { App, Frame } from 'leafer-ui';
import '@leafer-in/editor';
import '@leafer-in/resize';
import '@leafer-in/viewport';
import { ShotRange } from '../element/ShotRange';
import type { ScoreItem } from '../types';
import { APP_CONFIG, TARGET_SIZE } from '../constants/config';

/**
 * 射击靶应用的组合式函数
 * 负责初始化Leafer应用、创建射击靶和管理分数
 */
export function useTargetApp() {
  // 分数记录数组
  const scoreList = ref<ScoreItem[]>([]);
  
  // 射击靶尺寸配置
  const frameSize = ref(TARGET_SIZE);
  
  // 应用实例引用
  const appInstance = ref<App | null>(null);
  
  // 当前正在拖拽的点的索引（用于高亮显示）
  const currentDraggingIndex = ref<number>(-1);
  
  /**
   * 初始化射击靶应用
   * 创建Leafer应用实例、背景框架和射击靶
   */
  const initializeApp = (): void => {
    // 创建Leafer应用实例
    const app = new App(APP_CONFIG);
    
    // 创建射击靶背景框架
    const frame = new Frame({
      width: frameSize.value.width,
      height: frameSize.value.height,
      draggable: false
    });
    
    // 创建射击靶实例
    const targetRange = new ShotRange(scoreList, currentDraggingIndex);
    const targetGroup = targetRange.getGroup();
    
    // 将射击靶添加到框架中
    frame.add(targetGroup);
    
    // 将框架添加到应用树中
    app.tree.add(frame);
    
    // 保存应用实例引用
    appInstance.value = app;
  };

  /**
   * 销毁当前应用实例
   */
  const destroyApp = (): void => {
    if (appInstance.value) {
      appInstance.value.destroy();
      appInstance.value = null;
    }
  };
  
  /**
   * 清空分数记录
   */
  const clearScores = (): void => {
    scoreList.value = [];
    // 销毁当前画布
    destroyApp();
    // 重新初始化app
    initializeApp();
  };
  
  /**
   * 获取当前分数统计
   * @returns 分数统计信息
   */
  const getScoreStats = () => {
    const scores = scoreList.value.map(item => item.score);
    const total = scores.reduce((sum, score) => sum + score, 0);
    const average = scores.length > 0 ? total / scores.length : 0;
    const maxScore = scores.length > 0 ? Math.max(...scores) : 0;
    const minScore = scores.length > 0 ? Math.min(...scores) : 0;
    
    return {
      total,
      average: Math.round(average * 100) / 100,
      maxScore,
      minScore,
      count: scores.length
    };
  };
  
  return {
    scoreList,
    frameSize,
    appInstance,
    currentDraggingIndex,
    initializeApp,
    clearScores,
    getScoreStats
  };
}