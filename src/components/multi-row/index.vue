<template>
  <div class="multi-row" v-show="!!text">
    <div
      class="multi-row-inner"
      :style="{ maxHeight: `${maxHeight}px` }"
      :title="text"
      :ref="containerRef"
    >
      <span>{{ newText }}</span>
      <div class="multi-row-inner-temp" :ref="tempRef"></div>
    </div>
  </div>
</template>

<script>
import { getStyle, toInt, getResizeObserver } from "./util";
export default {
  name: "MultiRow",
  props: {
    text: {
      type: String,
    },
    row: {
      type: [Number, String],
    },
  },
  data() {
    return {
      containerRef: "containerRef",
      tempRef: "tempRef",
      lineHeight: 0,
      fontSize: 14,
      totalWidth: 0,
      newText: "",
      destroyCb: () => {},
    };
  },
  computed: {
    maxHeight() {
      return this.lineHeight * toInt(this.row);
    },
  },
  watch: {
    row() {
      this.$nextTick(() => {
        this.initData();
      });
    },
    text() {
      this.$nextTick(() => {
        this.initData();
      });
    },
  },
  mounted() {
    this.initData();
    // 添加尺寸改变监听事件
    this.destroyCb = getResizeObserver(this.$refs[this.containerRef], () => {
      this.initData();
    });
  },
  destroyed() {
    this.destroyCb();
  },
  methods: {
    initData() {
      const containerRef = this.$refs[this.containerRef];
      const style = getStyle(containerRef);
      this.lineHeight = toInt(style["lineHeight"]);
      this.fontSize = toInt(style["fontSize"]);
      this.totalWidth = toInt(this.row) * containerRef.clientWidth;
      // 判断需不需要显示省略
      if (this.needEllipsis()) {
        this.getNewText();
      } else {
        this.newText = this.text;
      }
    },
    needEllipsis() {
      const tempRef = this.$refs[this.tempRef];
      tempRef.innerHTML = this.text;
      const { scrollHeight } = tempRef;
      return scrollHeight > this.maxHeight;
    },
    getNewText() {
      const tempRef = this.$refs[this.tempRef];
      /**
       * 如果从0开始递增判断是不是需要省略过于浪费资源
       * 这里假设所有文本都是汉字通过计算取得一个肯定不会超出需要省略字符长度的下标
       */
      let startIndex =
        Math.floor(this.totalWidth / this.fontSize) - toInt(this.row) - 1;
      let flag = true;
      while (flag) {
        tempRef.innerHTML = this.text.slice(0, startIndex) + "...";
        const { scrollHeight } = tempRef;
        if (scrollHeight > this.maxHeight) {
          startIndex--;
          flag = false;
        } else {
          startIndex++;
        }
      }
      this.newText = this.text.slice(0, startIndex) + "...";
    },
  },
};
</script>

<style lang="scss" scoped>
.multi-row {
  position: relative;
  padding: 10px 12px;
  div {
    white-space: pre-wrap;
    word-break: break-all;
  }
  .multi-row-inner {
    position: relative;
    overflow: hidden;
    .multi-row-inner-temp {
      position: absolute;
      left: 0;
      top: 0;
      width: 100%;
      height: 100%;
      user-select: none;
      pointer-events: none;
      z-index: 2;
      visibility: hidden;
    }
  }
}
</style>
