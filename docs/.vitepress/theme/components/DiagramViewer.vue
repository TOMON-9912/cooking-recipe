<script setup lang="ts">
import { computed, ref, watch } from "vue";
import { withBase, useData } from "vitepress";

const props = withDefaults(
  defineProps<{
    src: string;
    title?: string;
    /** SVG の想定幅（px）。これより狭く縮小しない */
    baseWidth?: number;
    /** 初期ズーム（1 = 100%） */
    initialScale?: number;
  }>(),
  {
    title: "diagram",
    baseWidth: 1280,
    initialScale: 1,
  },
);

const { isDark } = useData();

const scale = ref(props.initialScale);
const fullscreen = ref(false);

const MIN_SCALE = 0.6;
const MAX_SCALE = 2.5;
const STEP = 0.1;

const assetUrl = computed(() => withBase(props.src));

const displayWidth = computed(() => Math.round(props.baseWidth * scale.value));

/**
 * ズームを clamp して更新する
 * @param next - 新しい scale
 */
function setScale(next: number): void {
  scale.value = Math.min(MAX_SCALE, Math.max(MIN_SCALE, next));
}

function zoomIn(): void {
  setScale(scale.value + STEP);
}

function zoomOut(): void {
  setScale(scale.value - STEP);
}

function resetZoom(): void {
  setScale(1);
}

/**
 * トラックパッド / Ctrl+ホイールでズーム
 * @param event - wheel
 */
function onWheel(event: WheelEvent): void {
  if (!event.ctrlKey && !event.metaKey) {
    return;
  }
  event.preventDefault();
  const delta = event.deltaY > 0 ? -STEP : STEP;
  setScale(scale.value + delta);
}

function toggleFullscreen(): void {
  fullscreen.value = !fullscreen.value;
}

watch(fullscreen, (open) => {
  if (typeof document === "undefined") {
    return;
  }
  document.body.style.overflow = open ? "hidden" : "";
});
</script>

<template>
  <div
    class="diagram-viewer"
    :class="{ 'diagram-viewer--fullscreen': fullscreen, 'diagram-viewer--dark': isDark }"
  >
    <div class="diagram-toolbar">
      <p class="diagram-hint">
        ドラッグでスクロール。{{ fullscreen ? "" : "拡大表示も使えます。" }}
        <kbd>Ctrl</kbd> + ホイール（Mac は <kbd>⌘</kbd>）でズーム。
      </p>
      <div class="diagram-actions">
        <button type="button" class="diagram-btn" title="縮小" @click="zoomOut">−</button>
        <span class="diagram-scale">{{ Math.round(scale * 100) }}%</span>
        <button type="button" class="diagram-btn" title="拡大" @click="zoomIn">+</button>
        <button type="button" class="diagram-btn diagram-btn--text" @click="resetZoom">
          100%
        </button>
        <button
          type="button"
          class="diagram-btn diagram-btn--text"
          @click="toggleFullscreen"
        >
          {{ fullscreen ? "閉じる" : "全画面" }}
        </button>
        <a
          class="diagram-btn diagram-btn--text diagram-link"
          :href="assetUrl"
          target="_blank"
          rel="noopener noreferrer"
        >
          SVG を開く
        </a>
      </div>
    </div>
    <div class="diagram-scroll" @wheel="onWheel">
      <img
        class="diagram-image"
        :src="assetUrl"
        :alt="title"
        :width="displayWidth"
        loading="lazy"
        decoding="async"
      />
    </div>
  </div>
</template>
