<script setup lang='ts'>
import { onMounted, ref, computed } from 'vue';
import { useTargetApp } from '../composables/useTargetApp';

// DOM 元素引用
const boxRef = ref<HTMLDivElement | null>(null);
const arrowRef = ref<HTMLDivElement | null>(null);

// 使用射击靶应用组合式函数
const {
  scoreList,
  currentDraggingIndex,
  initializeApp,
  clearScores,
  getScoreStats
} = useTargetApp();

/**
 * 计算分数统计信息
 */
const scoreStats = computed(() => getScoreStats());

/**
 * 判断某个分数项是否正在被拖拽（用于样式高亮）
 * @param index 分数项索引
 * @returns 是否正在拖拽
 */
const isCurrentlyDragging = (index: number): boolean => {
  return currentDraggingIndex.value === index;
};

/**
 * 清空所有分数记录
 */
const handleClearScores = (): void => {
  clearScores();
  currentDraggingIndex.value = -1;
};

/**
 * 组件挂载时初始化射击靶应用
 */
onMounted(() => {
  initializeApp();
});
</script>

<template>
  <div id="box" ref="boxRef" class="flex-1 relative">
    <!-- 射击靶画布容器 -->
    <div id="arrow" ref="arrowRef" class="h-[calc(100vh-6rem)]"></div>
    
    <!-- 分数显示区域 -->
    <div class="absolute bottom-4 left-4 right-4">
      <!-- 分数统计信息 -->
      <div v-if="scoreList.length > 0" class="mb-4 p-3 bg-white/90 backdrop-blur-sm rounded-lg shadow-lg">
        <div class="flex justify-between items-center text-sm text-gray-600 mb-2">
          <span>总分: <span class="font-bold text-blue-600">{{ scoreStats.total }}</span></span>
          <span>平均: <span class="font-bold text-green-600">{{ scoreStats.average }}</span></span>
          <span>最高: <span class="font-bold text-red-600">{{ scoreStats.maxScore }}</span></span>
          <span>射击次数: <span class="font-bold text-purple-600">{{ scoreStats.count }}</span></span>
        </div>
        
        <!-- 清空按钮 -->
        <button 
          @click="handleClearScores"
          class="w-full py-2 px-4 bg-red-500 hover:bg-red-600 text-white rounded-md transition-colors duration-200 text-sm font-medium"
        >
          清空记录
        </button>
      </div>
      
      <!-- 分数列表 -->
      <div class="flex flex-wrap gap-2">
        <div 
          v-for="(item, index) in scoreList" 
          :key="`${item.id}-${index}`"
          :class="[
            'size-10 shadow border font-bold text-2xl rounded-md justify-center items-center flex transition-all duration-200',
            isCurrentlyDragging(index) 
              ? 'bg-red-500 text-white border-red-600 scale-110 shadow-lg' 
              : 'bg-white text-gray-800 border-gray-200 hover:shadow-md'
          ]"
        >
          {{ item.score }}
        </div>
      </div>
      
      <!-- 空状态提示 -->
      <div v-if="scoreList.length === 0" class="text-center py-8">
        <div class="text-gray-400 text-lg mb-2">🎯</div>
        <p class="text-gray-500 text-sm">点击或拖拽射击靶开始记分</p>
      </div>
    </div>
  </div>
</template>