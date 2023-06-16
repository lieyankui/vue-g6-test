<!--
 * @Author       : heyongkui
 * @Date         : 2023年6月8日09:50:26
 * @Descripttion : g6测试
-->
<template>
  <div class="yok-container" ref="viewCardRef">
    <div class="yok-title">
      <span>节点等级：</span>
      <div class="tag-wrapper">
        <div
          v-for="item in levelTypeArr"
          :key="item.label"
          :style="{ borderColor: item.bdColor, backgroundColor: item.bgColor }"
          class="tag"
        >
          {{ item.label }}
        </div>
      </div>
    </div>
    <div :ref="graphRef" class="yok-content">
      <div class="graph-legend">
        <!-- <span class="graph-legend-item">单位：{{ unitStr }}</span> -->
        <span
          v-show="!isFs"
          class="graph-legend-item icon"
          @click="openFullscreen"
        >
          <a-icon type="fullscreen" title="全屏" />
        </span>
        <span
          v-show="isFs"
          class="graph-legend-item icon"
          @click="closeFullscreen"
        >
          <a-icon type="fullscreen-exit" title="取消全屏" />
        </span>
        <span
          v-show="isFs && currIndex > 0"
          class="graph-legend-item icon"
          @click="restore"
        >
          <a-icon type="eye" title="还原" />
        </span>
        <span
          v-show="isFs && currIndex < maxIndex"
          class="graph-legend-item icon"
          @click="showMore"
        >
          <a-icon type="more" title="显示更多节点" />
        </span>
      </div>
    </div>
  </div>
</template>
<script>
import G6Mixin from "@/mixins/g6";
import { generateNodes } from "@/utils/g6";
import { getFsObj } from "@/utils/fullscreen";
const borderColorArr = ["#FBACA3", "#FFCF8B", "#9DC9F6", "#19BA58"];
const bgColorArr = ["#FFECE8", "#FFF7E8", "#E8F5FF", "#B6E9CA"];
const typeArr = ["高风险", "中风险", "低风险", "安全"];
export default {
  components: {},
  mixins: [G6Mixin],
  data() {
    return {
      isFs: false,
      fs: null,
      levelTypeArr: [],
      allData: [],
      currData: {},
      currIndex: 0,
      limitNum: 7,
      maxIndex: 0,
      limitMaxIndex: 19,
      anchorPointOffset: 0.3,
      unitStr: "万元",
      typeFlag: 3,
      nodeConf: {
        itemWidth: 128,
        itemHeight: 60,
        startRadius: 160,
        radiusIncrement: 120,
        offsetAngle: 15,
        minRadius: 160,
        maxShowNum: 100,
      },
    };
  },
  watch: {},
  mounted() {
    this.fs = getFsObj(this.$refs["viewCardRef"].$el);
    this.initGraph();
    this.initData();
  },
  methods: {
    initData() {
      this.initLevelTypeArr();
      this.currData = {};
      this.allData = this.dataHandler();
      this.maxIndex = this.allData.maxIndex;
      this.renderGraph();
    },
    renderGraph() {
      if (this.typeFlag === 1) {
        const { nodes, edges } = this.createNodes();
        this.currData.nodes = nodes;
        this.currData.edges = edges;
      } else if (this.typeFlag === 2) {
        const { nodes, edges } = this.createNodes2();
        this.currData.nodes = nodes;
        this.currData.edges = edges;
      } else {
        const { nodes, edges } = this.createNodes3();
        this.currData.nodes = nodes;
        this.currData.edges = edges;
      }
      this.graph.clear();
      this.graph.read(this.currData);
    },
    showMore() {
      if (this.currIndex >= this.maxIndex) {
        return;
      }
      this.currIndex += 1;
      this.renderGraph();
    },
    restore() {
      this.currIndex = 0;
      this.renderGraph();
    },
    dataHandler() {
      const limitNum = this.limitNum;
      const level0 = generateNodes("up", 100);
      const level1 = generateNodes("root");
      const level2 = generateNodes("down", 100);
      const level0Index = Math.ceil(level0.length / limitNum) - 1;
      const level2Index = Math.ceil(level2.length / limitNum) - 1;
      let maxIndex = Math.max(level0Index, level2Index);
      maxIndex = Math.min(maxIndex, this.limitMaxIndex);
      return { level0, level1, level2, maxIndex };
    },
    createNodes() {
      const limitNum = this.limitNum;
      let { level0, level1, level2 } = this.allData;
      level0 = level0.slice(0, (this.currIndex + 1) * limitNum);
      level1 = level1 || [];
      level2 = level2.slice(0, (this.currIndex + 1) * limitNum);
      level1[0].x = 0;
      level1[0].y = 0;
      level0 = this.getLayerNodes(level0, true);
      level2 = this.getLayerNodes(level2, false);
      // }
      const edges = this.createEdges({ level0, level1, level2 }).reverse();
      const nodes = level0.concat(level2).concat(level1);
      return { nodes, edges };
    },
    createNodes2() {
      let { level0, level1, level2 } = this.allData;
      level1[0].x = 0;
      level1[0].y = 0;
      level0 = this.getLayerNodes2(level0, true);
      level2 = this.getLayerNodes2(level2, false);
      // }
      const edges = this.createEdges({ level0, level1, level2 }).reverse();
      const nodes = level0.concat(level2).concat(level1);
      return { nodes, edges };
    },
    createNodes3() {
      let { offsetAngle, itemWidth, itemHeight, minRadius } = this.nodeConf;
      let { level0, level1, level2 } = this.allData;
      level0 = level0.slice(0, this.limitNum * (this.currIndex + 1));
      level2 = level2.slice(0, this.limitNum * (this.currIndex + 1));
      const level0Radius = this.getRadiusByTotal(
        level0.length,
        itemWidth,
        0,
        0.7
      );
      const level2Radius = this.getRadiusByTotal(
        level2.length,
        itemWidth,
        0,
        0.7
      );
      let r = Math.max(level0Radius.r, level2Radius.r, minRadius);
      if (level0.length > 20 || level2.length > 20) {
        const originR = r;
        r = 0.8 * originR;
        if (level0.length > 30 || level2.length > 30) {
          r = 0.7 * originR;
        }
      }
      level1[0].x = 0;
      level1[0].y = 0;
      level1[0].r = r;
      offsetAngle = this.getOffsetAngleByRadius(r, itemWidth, 0);
      const rootWidth = itemWidth;
      const rootHeight = itemHeight;
      level0 = this.setNodesPosition2(
        level0,
        r,
        level0Radius.angle,
        true,
        offsetAngle,
        rootWidth,
        rootHeight
      );
      level2 = this.setNodesPosition2(
        level2,
        r,
        level2Radius.angle,
        false,
        offsetAngle,
        rootWidth,
        rootHeight
      );
      const edges = this.createEdges({ level0, level1, level2 }).reverse();
      const nodes = level0.concat(level2).concat(level1);
      return { nodes, edges };
    },
    getLayerNodes(nodes, flag) {
      const {
        offsetAngle,
        itemWidth,
        itemHeight,
        startRadius,
        radiusIncrement,
      } = this.nodeConf;
      nodes = this.setNodesPositionLayer(
        nodes,
        startRadius,
        radiusIncrement,
        itemWidth,
        itemHeight,
        offsetAngle,
        flag
      );
      return nodes;
    },
    getLayerNodes2(nodes, flag) {
      const {
        offsetAngle,
        itemWidth,
        itemHeight,
        startRadius,
        radiusIncrement,
      } = this.nodeConf;
      nodes = this.setNodesPositionLayer2(
        nodes,
        this.currIndex,
        startRadius,
        radiusIncrement,
        itemWidth,
        itemHeight,
        offsetAngle,
        flag
      );
      return nodes;
    },
    createEdges({ level0, level1, level2 }) {
      const { itemWidth, itemHeight } = this.nodeConf;
      const edges = [];
      const anchorPoints = [];
      level0.forEach((item) => {
        level1.forEach((item1) => {
          anchorPoints.push([
            0.5 + item.anchorPoint.x / itemWidth,
            0.5 + item.anchorPoint.y / itemHeight,
          ]);
          edges.push({
            type: `can-running-${item.anchorPoint.pointPosition}`,
            // type: 'can-running',
            source: item.nodeId,
            target: item1.nodeId,
            flag: "up",
            label: this.getLabel(item),
            // targetAnchor: item.targetAnchor || 0,
            targetAnchor: anchorPoints.length - 1 || 0,
            labelCfg: {
              ...this.labelCfg,
              refX: -(item.r * 0.15),
            },
          });
        });
      });
      level1.forEach((item1) => {
        level2.forEach((item2) => {
          anchorPoints.push([
            0.5 + item2.anchorPoint.x / itemWidth,
            0.5 + item2.anchorPoint.y / itemHeight,
          ]);
          edges.push({
            type: `can-running-${item2.anchorPoint.pointPosition}`,
            source: item1.nodeId,
            target: item2.nodeId,
            flag: "down",
            label: this.getLabel(item2),
            sourceAnchor: anchorPoints.length - 1 || 0,
            labelCfg: {
              ...this.labelCfg,
              refX: item2.r * 0.15,
            },
          });
        });
      });
      level1[0].anchorPoints = anchorPoints;
      return edges;
    },
    getLabel(item) {
      return `${item.lineNum}\n${item.lineLabel}`;
    },
    initLevelTypeArr() {
      this.levelTypeArr = typeArr.map((item, index) => {
        return {
          label: item,
          bdColor: borderColorArr[index],
          bgColor: bgColorArr[index],
        };
      });
    },
    resetGraph() {
      this.$nextTick(() => {
        setTimeout(() => {
          if (!this.isFs) {
            this.currIndex = 0;
          }
          this.renderGraph();
        }, 200);
      });
    },
    openFullscreen() {
      if (this.fs) {
        this.fs.request().then(() => {
          this.isFs = true;
          this.resetGraph();
        });
      }
    },
    closeFullscreen() {
      if (this.fs) {
        this.fs.release().then(() => {
          this.isFs = false;
          this.resetGraph();
        });
      }
    },
  },
};
</script>

<style lang="scss" scoped>
.yok-container {
  position: relative;
  display: flex;
  flex-direction: column;
  width: 100%;
  height: 100%;

  .page-wrapper {
    margin-top: 8px;
    text-align: right;
  }
  .graph-legend {
    position: absolute;
    right: 0;
    top: 0;
    padding: 4px 16px;
    .graph-legend-item {
      display: inline-block;
      margin-left: 8px;
      &.icon {
        width: 32px;
        height: 32px;
        padding: 6px;
        border: 1px solid #e5e5e5;
        border-radius: 6px;
        background: #ffffff;
        cursor: pointer;
        // box-shadow: ;
        &:hover {
          transform: scale(1.02);
          border-color: skyblue;
        }
      }
    }
  }
  .graph-legend-bottom {
    position: absolute;
    right: 0;
    bottom: 0;
    padding: 4px 16px;
    .graph-legend-item {
      display: inline-block;
      margin-left: 8px;
    }
  }
  .yok-content {
    position: relative;
    height: 0;
    flex: 1;
    overflow: hidden;
    canvas {
      display: block;
      width: 100%;
      height: 100%;
    }
  }
}
.yok-title {
  height: 48px;
  padding: 12px 16px;
  display: flex;
  align-items: center;
  justify-content: flex-end;
  .tag-wrapper {
    .tag {
      display: inline-block;
      height: 24px;
      line-height: 24px;
      padding: 0 8px;
      border-width: 1px;
      border-style: solid;
      border-radius: 4px;
      margin-left: 8px;
    }
  }
}
</style>
