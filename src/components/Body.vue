<script setup lang='ts'>
import {onMounted, ref} from 'vue';
import {App, Frame} from 'leafer-ui'
import '@leafer-in/editor'
import '@leafer-in/resize'
import '@leafer-in/viewport'
import {ShotRange} from "../element/ShotRange.ts";

const boxRef = ref<HTMLDivElement | null>(null);
const arrowRef = ref<HTMLDivElement | null>(null);
// 记分数组
const scoreList = ref<{
  id: number,
  score: number
}[]>([]);

// 射击靶尺寸
const frameSize = ref({
  width: 500,
  height: 500
})

onMounted(() => {
  const app = new App({
    view: 'arrow',
    fill: '#f1f3f7',
    editor: {
      editBox: false,
      selector: false,
    },
    pointer: {
      // longPressTime: 300,
      // tapMore: true
    }
  })

  // 射击靶背景
  const frame = new Frame({
    width: frameSize.value.width,
    height: frameSize.value.height,
    draggable: false
  })

  // 射击靶
  const targetFrame = new ShotRange(frame, scoreList)
  const group = targetFrame.getGroup()
  frame.add(group)
  app.tree.add(frame)
})
</script>

<template>
  <div id="box" ref="boxRef" class="flex-1 relative">
    <div id="arrow" ref="arrowRef" class="h-[calc(100vh-6rem)]"></div>
    <div class="flex flex-wrap gap-2 absolute bottom-4 left-4">
      <div v-for="(item, index) in scoreList" :key="`${item}-${index}`"
           class="size-10 shadow border font-bold text-2xl rounded-md justify-center items-center flex bg-white">
        {{ item.score }}
      </div>
    </div>
  </div>
</template>