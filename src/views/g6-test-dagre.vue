<!--
 * @Author       : heyongkui
 * @Date         : 2023年6月8日09:50:26
 * @Descripttion : g6测试
-->
<template>
  <div class="yok-container" ref="viewCardRef">
    <div :ref="graphRef" class="yok-content">
      <div class="graph-legend">
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
import G6 from "@/utils/g6";
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
      limitNum: 10,
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
  created() {},
  mounted() {
    this.fs = getFsObj(this.$refs["viewCardRef"].$el);
    const data = this.getData();
    this.initGraph2();
    // this.initData();
    this.graph.read(data);
  },
  methods: {
    initGraph2(graphOptions = {}) {
      const g6Container = this.getGraphRef();
      this.graph = new G6.Graph({
        container: g6Container,
        width: g6Container.clientWidth,
        height: g6Container.clientHeight,
        fitView: true, // 自动适配，将当前画布上的所有内容根据画布大小适配
        fitViewPadding: 36, // 自动适配的内边距配置
        animate: true,
        maxZoom: 2, // 最大缩放比例
        modes: {
          // 支持的 拖拽和缩放
          default: [
            "zoom-canvas", // 支持缩放
            {
              type: "drag-canvas", // 支持拖拽
              direction: "both", // 水平和竖直方向都支持
              // enableOptimize: true // 优化拖拽事件，拖拽时会不显示一些内容
            },
          ],
        },
        layout: {
          type: "dagre", // 布局方式设置为dagre布局
          rankdir: "LR", // 布局的方向，可选，默认为图的中心，LR代表从左往右布局，TB代表从上往下布局
          // align: 'DL', // 节点对齐方式，可选，U：upper（上）；D：down（下）；L：left（左）；R：right（右）。 'UL'：对齐到左上角
          nodesep: 25, // 节点间距（px）。在rankdir 为 'TB' 或 'BT' 时是节点的水平间距；在rankdir 为 'LR' 或 'RL' 时代表节点的竖直方向间距
          ranksep: 90, // 层间距（px）。在rankdir 为 'TB' 或 'BT' 时是竖直方向相邻层间距；在rankdir 为 'LR' 或 'RL' 时代表水平方向相邻层间距 },
          labelCfg: {},
        },
        defaultNode: {
          type: "rect", // 默认节点类型
          width: 128,
          height: 60,
        },
        defaultEdge: {
          // 默认连线配置
          // cubic、horizontal、cubic-vertical、cubic-horizontal quadratic
          type: "cubic-vertical", // 节点之间连线的类型
          style: {
            // endArrow: true,// 显示结束箭头 默认样式
            endArrow: {
              // 显示结束箭头自定义样式
              path: G6.Arrow.vee(8, 8),
              fill: "#D9D9D9",
            },
            lineWidth: 1,
            stroke: "#D9D9D9", // 连线颜色
          },
          labelCfg: {
            // 线上标签配置
            autoRotate: false, // 不旋转 使用贝塞尔曲线是旋转可能会出问题
            refX: 15, // 标签在 x 方向的偏移量
            refY: 0, // 标签在 y 方向的偏移量
            style: {
              lineHeight: 22,
              background: {
                fill: "#FFFFFF", // 背景颜色
                stroke: "#F0F0F0", // 边框颜色
                lineWidth: 2, // 边框宽度
                padding: [8, 8, 6, 8], // 标签内边距
                radius: 4, // 圆角半径
              },
            },
          },
        },
        ...graphOptions,
      });
    },
    initData() {
      this.initLevelTypeArr();
      this.allData = this.dataHandler();
      this.renderGraph();
    },
    renderGraph() {
      const { nodes, edges } = this.createNodes();
      this.currData.nodes = nodes;
      this.currData.edges = edges;
      this.graph.clear();
      this.graph.read(this.currData);
    },
    createNodes() {
      const limitNum = this.limitNum;
      let { level0, level1, level2 } = this.allData;
      level0 = level0.slice(0, (this.currIndex + 1) * limitNum);
      level1 = level1 || [];
      level2 = level2.slice(0, (this.currIndex + 1) * limitNum);
      const edges = this.createEdges({ level0, level1, level2 });
      const nodes = level0.concat(level2).concat(level1);
      return { nodes, edges };
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
    createEdges({ level0, level1, level2 }) {
      // const { itemWidth, itemHeight } = this.nodeConf;
      const edges = [];
      // const anchorPoints = [];
      level0.forEach((item) => {
        level1.forEach((item1) => {
          // anchorPoints.push([
          //   0.5 + item.anchorPoint.x / itemWidth,
          //   0.5 + item.anchorPoint.y / itemHeight,
          // ]);
          edges.push({
            type: `cubic-vertical`,
            source: item.nodeId,
            target: item1.nodeId,
            flag: "up",
            label: this.getLabel(item),
            // targetAnchor: item.targetAnchor || 0,
            // targetAnchor: anchorPoints.length - 1 || 0,
            labelCfg: {
              ...this.labelCfg,
              refX: -(item.r * 0.15),
            },
          });
        });
      });
      level1.forEach((item1) => {
        level2.forEach((item2) => {
          // anchorPoints.push([
          //   0.5 + item2.anchorPoint.x / itemWidth,
          //   0.5 + item2.anchorPoint.y / itemHeight,
          // ]);
          edges.push({
            type: `cubic-vertical`,
            source: item1.nodeId,
            target: item2.nodeId,
            flag: "down",
            label: this.getLabel(item2),
            // sourceAnchor: anchorPoints.length - 1 || 0,
            labelCfg: {
              ...this.labelCfg,
              refX: item2.r * 0.15,
            },
          });
        });
      });
      // level1[0].anchorPoints = anchorPoints;
      return edges;
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
    getLabel(item) {
      return `${item.lineNum}\n${item.lineLabel}`;
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
    getData() {
      return {
        nodes: [
          {
            id: "up-0",
            nodeId: "up-0",
            nodeFlag: "up-0",
            name: "上游节点0aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa",
            lineLabel: "上游节点0",
            lineNum: 97,
            tags: "aaa,bbb,cccc,dddd,eee,ffff,gggg,hhh,iiii,jjjjj,kkkk,llll,mmmmm",
            level: 4,
          },
          {
            id: "up-1",
            nodeId: "up-1",
            nodeFlag: "up-1",
            name: "上游节点1",
            lineLabel: "上游节点1",
            lineNum: 27,
            tags: "aaa,bbb,cccc,dddd,eee,ffff,gggg,hhh,iiii,jjjjj,kkkk,llll,mmmmm",
            level: 4,
          },
          {
            id: "up-2",
            nodeId: "up-2",
            nodeFlag: "up-2",
            name: "上游节点2",
            lineLabel: "上游节点2",
            lineNum: 74,
            tags: "aaa,bbb,cccc,dddd,eee,ffff,gggg,hhh,iiii,jjjjj,kkkk,llll,mmmmm",
            level: 4,
          },
          {
            id: "up-3",
            nodeId: "up-3",
            nodeFlag: "up-3",
            name: "上游节点3",
            lineLabel: "上游节点3",
            lineNum: 55,
            tags: "aaa,bbb,cccc,dddd,eee,ffff,gggg,hhh,iiii,jjjjj,kkkk,llll,mmmmm",
            level: 2,
          },
          {
            id: "up-4",
            nodeId: "up-4",
            nodeFlag: "up-4",
            name: "上游节点4",
            lineLabel: "上游节点4",
            lineNum: 39,
            tags: "aaa,bbb,cccc,dddd,eee,ffff,gggg,hhh,iiii,jjjjj,kkkk,llll,mmmmm",
            level: 2,
          },
          {
            id: "up-5",
            nodeId: "up-5",
            nodeFlag: "up-5",
            name: "上游节点5",
            lineLabel: "上游节点5",
            lineNum: 46,
            tags: "aaa,bbb,cccc,dddd,eee,ffff,gggg,hhh,iiii,jjjjj,kkkk,llll,mmmmm",
            level: 1,
          },
          {
            id: "up-6",
            nodeId: "up-6",
            nodeFlag: "up-6",
            name: "上游节点6",
            lineLabel: "上游节点6",
            lineNum: 48,
            tags: "aaa,bbb,cccc,dddd,eee,ffff,gggg,hhh,iiii,jjjjj,kkkk,llll,mmmmm",
            level: 1,
          },
          {
            id: "up-7",
            nodeId: "up-7",
            nodeFlag: "up-7",
            name: "上游节点7",
            lineLabel: "上游节点7",
            lineNum: 64,
            tags: "aaa,bbb,cccc,dddd,eee,ffff,gggg,hhh,iiii,jjjjj,kkkk,llll,mmmmm",
            level: 1,
          },
          {
            id: "up-8",
            nodeId: "up-8",
            nodeFlag: "up-8",
            name: "上游节点8",
            lineLabel: "上游节点8",
            lineNum: 76,
            tags: "aaa,bbb,cccc,dddd,eee,ffff,gggg,hhh,iiii,jjjjj,kkkk,llll,mmmmm",
            level: 3,
          },
          {
            id: "up-9",
            nodeId: "up-9",
            nodeFlag: "up-9",
            name: "上游节点9",
            lineLabel: "上游节点9",
            lineNum: 58,
            tags: "aaa,bbb,cccc,dddd,eee,ffff,gggg,hhh,iiii,jjjjj,kkkk,llll,mmmmm",
            level: 1,
          },
          {
            id: "down-0",
            nodeId: "down-0",
            nodeFlag: "down-0",
            name: "下游节点0",
            lineLabel: "下游节点0",
            lineNum: 87,
            tags: "aaa,bbb,cccc,dddd,eee,ffff,gggg,hhh,iiii,jjjjj,kkkk,llll,mmmmm",
            level: 1,
          },
          {
            id: "down-1",
            nodeId: "down-1",
            nodeFlag: "down-1",
            name: "下游节点1",
            lineLabel: "下游节点1",
            lineNum: 65,
            tags: "aaa,bbb,cccc,dddd,eee,ffff,gggg,hhh,iiii,jjjjj,kkkk,llll,mmmmm",
            level: 2,
          },
          {
            id: "down-2",
            nodeId: "down-2",
            nodeFlag: "down-2",
            name: "下游节点2",
            lineLabel: "下游节点2",
            lineNum: 42,
            tags: "aaa,bbb,cccc,dddd,eee,ffff,gggg,hhh,iiii,jjjjj,kkkk,llll,mmmmm",
            level: 2,
          },
          {
            id: "down-3",
            nodeId: "down-3",
            nodeFlag: "down-3",
            name: "下游节点3",
            lineLabel: "下游节点3",
            lineNum: 89,
            tags: "aaa,bbb,cccc,dddd,eee,ffff,gggg,hhh,iiii,jjjjj,kkkk,llll,mmmmm",
            level: 3,
          },
          {
            id: "down-4",
            nodeId: "down-4",
            nodeFlag: "down-4",
            name: "下游节点4",
            lineLabel: "下游节点4",
            lineNum: 89,
            tags: "aaa,bbb,cccc,dddd,eee,ffff,gggg,hhh,iiii,jjjjj,kkkk,llll,mmmmm",
            level: 1,
          },
          {
            id: "down-5",
            nodeId: "down-5",
            nodeFlag: "down-5",
            name: "下游节点5",
            lineLabel: "下游节点5",
            lineNum: 39,
            tags: "aaa,bbb,cccc,dddd,eee,ffff,gggg,hhh,iiii,jjjjj,kkkk,llll,mmmmm",
            level: 4,
          },
          {
            id: "down-6",
            nodeId: "down-6",
            nodeFlag: "down-6",
            name: "下游节点6",
            lineLabel: "下游节点6",
            lineNum: 88,
            tags: "aaa,bbb,cccc,dddd,eee,ffff,gggg,hhh,iiii,jjjjj,kkkk,llll,mmmmm",
            level: 4,
          },
          {
            id: "down-7",
            nodeId: "down-7",
            nodeFlag: "down-7",
            name: "下游节点7",
            lineLabel: "下游节点7",
            lineNum: 82,
            tags: "aaa,bbb,cccc,dddd,eee,ffff,gggg,hhh,iiii,jjjjj,kkkk,llll,mmmmm",
            level: 4,
          },
          {
            id: "down-8",
            nodeId: "down-8",
            nodeFlag: "down-8",
            name: "下游节点8",
            lineLabel: "下游节点8",
            lineNum: 53,
            tags: "aaa,bbb,cccc,dddd,eee,ffff,gggg,hhh,iiii,jjjjj,kkkk,llll,mmmmm",
            level: 4,
          },
          {
            id: "down-9",
            nodeId: "down-9",
            nodeFlag: "down-9",
            name: "下游节点9",
            lineLabel: "下游节点9",
            lineNum: 42,
            tags: "aaa,bbb,cccc,dddd,eee,ffff,gggg,hhh,iiii,jjjjj,kkkk,llll,mmmmm",
            level: 2,
          },
          {
            id: "root",
            nodeId: "root",
            nodeFlag: "root",
            name: "中心节点",
            tags: "aaa,bbb,cccc,dddd,eee,ffff,gggg,hhh,iiii,jjjjj,kkkk,llll,mmmmm",
            level: 4,
          },
        ],
        edges: [
          {
            source: "up-0",
            target: "root",
            flag: "up",
            label: "97\n上游节点0",
            labelCfg: {
              style: {
                fontSize: 12,
                lineHeight: 13,
              },
            },
          },
          {
            source: "up-1",
            target: "root",
            flag: "up",
            label: "27\n上游节点1",
            labelCfg: {
              style: {
                fontSize: 12,
                lineHeight: 13,
              },
            },
          },
          {
            source: "up-2",
            target: "root",
            flag: "up",
            label: "74\n上游节点2",
            labelCfg: {
              style: {
                fontSize: 12,
                lineHeight: 13,
              },
            },
          },
          {
            source: "up-3",
            target: "root",
            flag: "up",
            label: "55\n上游节点3",
            labelCfg: {
              style: {
                fontSize: 12,
                lineHeight: 13,
              },
            },
          },
          {
            source: "up-4",
            target: "root",
            flag: "up",
            label: "39\n上游节点4",
            labelCfg: {
              style: {
                fontSize: 12,
                lineHeight: 13,
              },
            },
          },
          {
            source: "up-5",
            target: "root",
            flag: "up",
            label: "46\n上游节点5",
            labelCfg: {
              style: {
                fontSize: 12,
                lineHeight: 13,
              },
            },
          },
          {
            source: "up-6",
            target: "root",
            flag: "up",
            label: "48\n上游节点6",
            labelCfg: {
              style: {
                fontSize: 12,
                lineHeight: 13,
              },
            },
          },
          {
            source: "up-7",
            target: "root",
            flag: "up",
            label: "64\n上游节点7",
            labelCfg: {
              style: {
                fontSize: 12,
                lineHeight: 13,
              },
            },
          },
          {
            source: "up-8",
            target: "root",
            flag: "up",
            label: "76\n上游节点8",
            labelCfg: {
              style: {
                fontSize: 12,
                lineHeight: 13,
              },
            },
          },
          {
            source: "up-9",
            target: "root",
            flag: "up",
            label: "58\n上游节点9",
            labelCfg: {
              style: {
                fontSize: 12,
                lineHeight: 13,
              },
            },
          },
          {
            source: "root",
            target: "down-0",
            flag: "down",
            label: "87\n下游节点0",
            labelCfg: {
              style: {
                fontSize: 12,
                lineHeight: 13,
              },
            },
          },
          {
            source: "root",
            target: "down-1",
            flag: "down",
            label: "65\n下游节点1",
            labelCfg: {
              style: {
                fontSize: 12,
                lineHeight: 13,
              },
            },
          },
          {
            source: "root",
            target: "down-2",
            flag: "down",
            label: "42\n下游节点2",
            labelCfg: {
              style: {
                fontSize: 12,
                lineHeight: 13,
              },
            },
          },
          {
            source: "root",
            target: "down-3",
            flag: "down",
            label: "89\n下游节点3",
            labelCfg: {
              style: {
                fontSize: 12,
                lineHeight: 13,
              },
            },
          },
          {
            source: "root",
            target: "down-4",
            flag: "down",
            label: "89\n下游节点4",
            labelCfg: {
              style: {
                fontSize: 12,
                lineHeight: 13,
              },
            },
          },
          {
            source: "root",
            target: "down-5",
            flag: "down",
            label: "39\n下游节点5",
            labelCfg: {
              style: {
                fontSize: 12,
                lineHeight: 13,
              },
            },
          },
          {
            source: "root",
            target: "down-6",
            flag: "down",
            label: "88\n下游节点6",
            labelCfg: {
              style: {
                fontSize: 12,
                lineHeight: 13,
              },
            },
          },
          {
            source: "root",
            target: "down-7",
            flag: "down",
            label: "82\n下游节点7",
            labelCfg: {
              style: {
                fontSize: 12,
                lineHeight: 13,
              },
            },
          },
          {
            source: "root",
            target: "down-8",
            flag: "down",
            label: "53\n下游节点8",
            labelCfg: {
              style: {
                fontSize: 12,
                lineHeight: 13,
              },
            },
          },
          {
            source: "root",
            target: "down-9",
            flag: "down",
            label: "42\n下游节点9",
            labelCfg: {
              style: {
                fontSize: 12,
                lineHeight: 13,
              },
            },
          },
        ],
      };
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
