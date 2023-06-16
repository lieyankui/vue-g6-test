/**
 * @Author       : heyongkui
 * @Date         : 2023-04-10 11:13:32
 * @Descripttion : g6混入文件
 */

import G6, {
  createGraph,
  registerNode,
  fittingString,
  lineAnimate,
  lineInit,
  setEdgeHoverStyle,
  degToRad,
  radToDeg,
  getIntersectionPoint,
} from "@/utils/g6";

const COLOR_CONF = {
  bgColors: {
    1: "#B6E9CA",
    2: "#E8F5FF",
    3: "#FFF7E8",
    4: "#FFECE8",
  },
  bdColors: {
    1: "#19BA58",
    2: "#9DC9F6",
    3: "#FFCF8B",
    4: "#FBACA3",
  },
};
const lineTypeObj = {
  "can-running-cubic": "cubic",
  "can-running-horizontal": "cubic-horizontal",
  "can-running-vertical": "cubic-vertical",
};
const lineColor = "#D9D9D9";
const lineColorHigh = "#5EA8FC";
const lineColorHigh2 = "#4FDD87";
registerEdge();
function registerEdge() {
  for (let key in lineTypeObj) {
    G6.registerEdge(
      key,
      {
        setState(name, value, item) {
          const shape = item.get("keyShape");
          if (name === "running" || name === "hover") {
            if (value) {
              lineAnimate(shape, lineColorHigh);
            } else {
              lineInit(shape, lineColor);
            }
          }
        },
      },
      lineTypeObj[key]
    );
  }
}

const NODE_WIDTH = 128;
const NODE_HEIGHT = 60;
const PADDING = 8;
registerNode(
  "risk-node",
  {
    drawShape(cfg, group) {
      let nodeWidth = cfg.width || NODE_WIDTH;
      let nodeHeight = cfg.height || NODE_HEIGHT;
      let fontSize = 14;
      let fontSizeSmall = 12;
      const rect = group.addShape("rect", {
        attrs: {
          x: cfg.x || 0,
          y: cfg.y || 0,
          data: cfg,
          padding: PADDING,
          width: nodeWidth,
          height: nodeHeight,
          radius: 8,
          stroke: COLOR_CONF.bdColors[cfg.level + ""],
          fill: COLOR_CONF.bgColors[cfg.level + ""],
          lineWidth: 1,
          type: "main",
        },
        name: "rect-shape",
      });
      const tagNum = cfg.tags?.split(",").filter((item) => !!item).length;
      if (cfg.tags && tagNum) {
        group.addShape("text", {
          attrs: {
            text: `${tagNum}个风险`,
            x: (cfg.x || 0) + nodeWidth / 2,
            y: (cfg.y || 0) + nodeHeight + 3 + fontSizeSmall,
            // fill: '#FFFFFF',
            fill: "#262626",
            lineWidth: 2,
            fontSize: fontSizeSmall,
            textAlign: "center",
            textBaseline: "middle",
            fontWeight: "normal",
            type: "extra",
          },
          name: "sub-text-shape",
        });
      }
      if (cfg.name) {
        group.addShape("text", {
          attrs: {
            text: fittingString(cfg.name, nodeWidth - PADDING * 2, fontSize),
            data: cfg,
            x: (cfg.x || 0) + nodeWidth / 2,
            y: (cfg.y || 0) + nodeHeight / 2,
            fill: "#262626",
            fontSize: fontSize,
            textAlign: "center",
            textBaseline: "middle",
            fontWeight: "normal",
            type: "main",
          },
          name: "text-shape",
        });
      }
      return rect;
    },
  },
  "single-node"
);
const tooltip = new G6.Tooltip({
  className: "g6-tooltip-text-container",
  offsetX: 10,
  offsetY: 10,
  // the types of items that allow the tooltip show up
  // 允许出现 tooltip 的 item 类型
  itemTypes: ["node"],
  // custom the tooltip's content
  // 自定义 tooltip 内容
  getContent: (e) => {
    const name = e.target.attrs.data && e.target.attrs.data.name;
    if (!name) {
      return "";
    }
    const outDiv = document.createElement("div");
    outDiv.style.width = "fit-content";
    const data = e.target.attrs.data;
    let prefixStr = "";
    if (data.nodeFlag.startsWith("up-")) {
      prefixStr = "上游: ";
    }
    if (data.nodeFlag.startsWith("down-")) {
      prefixStr = "下游: ";
    }
    let html = `
            <h4>${data.name}</h4>
        `;
    if (prefixStr) {
      html = `
            <h4>${prefixStr}${data.name}</h4>
            <div style="margin: 0 auto; text-align: left;">
                <div>${data.lineLabel || ""}: ${data.lineNum || ""}</div>
            </div>
        `;
    }
    outDiv.innerHTML = html;
    return outDiv;
  },
  shouldBegin: (e) => {
    return e.target.attrs.type === "main";
  },
});
function getTargetsDomStr(targets) {
  return targets.map((item) => `<span class="tag">${item}</span>`).join("");
}
const clickTooltip = new G6.Tooltip({
  className: "g6-tooltip-container",
  offsetX: 10,
  offsetY: 10,
  // v4.2.1 起支持配置 trigger，click 代表点击后出现 tooltip。默认为 mouseenter
  trigger: "click",
  // 允许出现 tooltip 的 item 类型
  itemTypes: ["node"],
  // 自定义 tooltip 内容
  getContent: (e) => {
    const data = e.target.attrs.data || {};
    console.log("data: ", data);
    const level = data?.level || 1;
    const tags = data?.tags?.split(",") || [];
    const outDiv = document.createElement("div");
    outDiv.style.width = "fit-content";
    outDiv.innerHTML = `
            <div class="g6-tooltip-body">
                <div class="g6-tooltip-title">${data?.name}-等级${level}</div>
                <div class="g6-tooltip-content">
                    ${getTargetsDomStr(tags)}
                </div>
            </div>
        `;
    return outDiv;
  },
});
export default {
  data() {
    return {
      graphRef: "graphRef",
      graph: null,
      labelCfg: {
        style: {
          fontSize: 12,
          lineHeight: 13,
        },
      },
      _onResize: () => {},
    };
  },
  mounted() {
    this._onResize = this.onResize.bind(this);
    window.addEventListener("resize", this._onResize);
  },
  destroyed() {
    window.removeEventListener("resize", this._onResize);
  },
  methods: {
    initGraph(graphOptions = {}) {
      const g6Container = this.getGraphRef();
      this.graph = createGraph({
        container: g6Container,
        width: g6Container.clientWidth,
        height: g6Container.clientHeight,
        fitView: true,
        fitViewPadding: 36,
        plugins: [tooltip, clickTooltip],
        animate: true,
        maxZoom: 2,
        modes: {
          // 支持的 拖拽和缩放
          default: [
            "zoom-canvas",
            {
              type: "drag-canvas",
              direction: "both",
              enableOptimize: true, // 优化，拖拽时会不显示一些内容
            },
          ],
          // edit: ['click-select'],
        },
        labelCfg: {
          /* label's position, options: center, top, bottom, left, right */
          position: "center",
          nodeSep: 30,
          rankSep: 120,
          offset: 12,
        },
        defaultNode: {
          type: "risk-node",
        },
        defaultEdge: {
          // type: 'polyline',
          // cubic、horizontal、cubic-vertical、cubic-horizontal quadratic
          type: "cubic-vertical",
          style: {
            // radius: 80,
            // offset: 50,
            // endArrow: true,
            endArrow: {
              path: G6.Arrow.vee(8, 8),
              fill: "#D9D9D9",
            },
            lineWidth: 1,
            stroke: "#D9D9D9",
          },
          // controlPoints: [{ x: 0, y: 0 }, { x: 50, y: 50 }],
          // curveOffset: [],
          // curvePosition: [[0.5, 0.5], [0.5, 0.5]],
          labelCfg: {
            autoRotate: false,
            refX: 15,
            style: {
              // fill: '#FFF',
              lineHeight: 22,
              background: {
                fill: "#FFFFFF",
                // fill: '#C9411F',
                stroke: "#F0F0F0",
                // stroke: '#FFF',
                lineWidth: 2,
                padding: [8, 8, 6, 8],
                radius: 4,
              },
            },
          },
        },
        nodeStateStyles: {
          highlight: {
            opacity: 1,
            lineWidth: 3,
          },
          dark: {
            opacity: 0.2,
            // fill: "#e6e6e6",
          },
        },
        ...graphOptions,
      });
      this.addEvent();
    },
    addEvent() {
      const graph = this.graph;
      graph.on("node:mouseenter", (ev) => {
        this.nodeHover(ev);
      });
      graph.on("node:mouseleave", (ev) => {
        this.clearAllStats(ev);
      });
      graph.on("edge:mouseenter", (ev) => {
        this.edgeHover(ev.item);
      });
      graph.on("edge:mouseleave", (ev) => {
        this.clearAllStats(ev);
      });
      graph.on("canvas:click", (ev) => {
        this.clearAllStats(ev);
      });
    },
    edgeHover(edge) {
      const flag = edge._cfg.model.flag || "up";
      const node = flag === "up" ? edge.getSource() : edge.getTarget();
      this.nodeHover({ item: node });
    },
    edgeActive(edge) {
      const flag = edge._cfg.model.flag || "up";
      const activeColor = flag === "up" ? lineColorHigh : lineColorHigh2;
      const graph = this.graph;
      edge.toFront();
      setEdgeHoverStyle(graph, edge, "hover", true, activeColor);
    },
    edgeDeactive(edge) {
      const graph = this.graph;
      setEdgeHoverStyle(graph, edge, "hover", false, lineColor);
    },
    clearAllStats() {
      const graph = this.graph;
      graph.setAutoPaint(false);
      graph.getNodes().forEach((node) => {
        graph.clearItemStates(node);
      });
      graph.getEdges().forEach((edge) => {
        this.edgeDeactive(edge);
      });
      graph.paint();
      graph.setAutoPaint(true);
    },
    nodeHover(ev) {
      const item = ev.item;
      const graph = this.graph;
      graph.setAutoPaint(false);
      graph.getNodes().forEach(function (node) {
        graph.clearItemStates(node);
        graph.setItemState(node, "dark", true);
      });
      item.getEdges().forEach((edge) => {
        this.edgeActive(edge);
        const target = edge.getTarget();
        target?.setState("dark", false);
        if (!target.hasState("highlight")) {
          target?.setState("highlight", true);
        }
        const source = edge.getSource();
        source?.setState("dark", false);
        if (!source.hasState("highlight")) {
          source?.setState("highlight", true);
        }
      });
      graph.paint();
      graph.setAutoPaint(true);
    },
    // 循环的给节点设置层级
    setNodesPositionLayer(
      dataNodes,
      startRadius,
      radiusIncrement,
      itemWidth,
      itemHeight,
      offsetAngle,
      flag
    ) {
      let newNodes = [];
      let i = 0;
      let currIndex = 0;
      while (newNodes.length < dataNodes.length) {
        const r = startRadius + radiusIncrement * i;
        const itemNum = this.getItemNumByRadius(
          r,
          itemWidth,
          offsetAngle,
          0.5 + i * 0.03
        );
        const endIndex = currIndex + itemNum;
        const nodeData = dataNodes.slice(currIndex, endIndex);
        const angle = this.getItemAngle(offsetAngle, nodeData.length);
        currIndex = endIndex;
        i++;
        newNodes = newNodes.concat(
          this.setNodesPosition(
            nodeData,
            r,
            angle,
            flag,
            offsetAngle,
            itemWidth,
            itemHeight
          )
        );
      }
      return newNodes;
    },
    setNodesPositionLayer2(
      dataNodes,
      currLayerNum,
      startRadius,
      radiusIncrement,
      itemWidth,
      itemHeight,
      offsetAngle,
      flag
    ) {
      let newNodes = [];
      let i = 0;
      let currIndex = 0;
      while (i <= currLayerNum) {
        const r = startRadius + radiusIncrement * i;
        const itemNum = this.getItemNumByRadius(
          r,
          itemWidth,
          offsetAngle,
          0.5 + i * 0.03
        );
        const endIndex = currIndex + itemNum;
        const nodeData = dataNodes.slice(currIndex, endIndex);
        const angle = this.getItemAngle(offsetAngle, nodeData.length);
        currIndex = endIndex;
        i++;
        newNodes = newNodes.concat(
          this.setNodesPosition(
            nodeData,
            r,
            angle,
            flag,
            offsetAngle,
            itemWidth,
            itemHeight
          )
        );
      }
      return newNodes;
    },
    /**
     * 根据半径和偏移角度求当前半径下所能容纳的节点数（不精确）
     * 上游节点和下游节点各占一半，所以此时的可用总长度为Math.PI*r
     * 可用角度范围为180-2*offsetAngle
     * 加上偏移角度的可用长度为 (180 - 2 * offsetAngle) / 180 * Math.PI * r
     */
    getItemNumByRadius(r = 200, itemWidth = 128, offsetAngle = 35, m = 0.5) {
      const itemNum =
        (Math.PI * r * (180 - 2 * offsetAngle)) / 180 / itemWidth / m;
      return Math.round(itemNum);
    },
    getRadiusByTotal(total, itemWidth, offsetAngle = 15, m = 0.6) {
      const itemAngle = this.getItemAngle(offsetAngle, total);
      const r = Math.ceil((itemWidth * m) / Math.sin(degToRad(itemAngle)));
      return { r, angle: itemAngle };
    },
    getOffsetAngleByRadius(r, itemWidth, offsetX = 8) {
      const sinAngle = (itemWidth / 2 + offsetX) / r;
      return radToDeg(Math.asin(sinAngle));
    },
    getItemAngle(offsetAngle, total) {
      if (total === 1) {
        return 90 - offsetAngle;
      }
      if (total < 5) {
        return (180 - 2 * offsetAngle) / (total + 1);
      }
      return (180 - 2 * offsetAngle) / (total - 1);
    },
    setNodesPosition(
      nodes,
      r,
      angle,
      flag,
      offsetAngle,
      rootWidth = 128,
      rootHeight = 60
    ) {
      if (nodes.length === 1) {
        nodes[0].x = flag ? -r : r;
        nodes[0].y = 0;
        nodes[0].anchorPoint = flag
          ? { x: -rootWidth / 2, y: 0, lineType: "can-running-horizontal" }
          : { x: rootWidth / 2, y: 0, lineType: "can-running-horizontal" };
        return nodes;
      } else if (nodes.length <= 5) {
        offsetAngle = 180 / (nodes.length + 1);
      }
      angle = this.getItemAngle(offsetAngle, nodes.length);
      let startAngle = flag ? 270 - offsetAngle : 270 + offsetAngle;
      nodes = nodes.map((node, index) => {
        let itemAngle = startAngle - index * angle;
        if (!flag) {
          itemAngle = startAngle + index * angle;
        }
        const x = flag
          ? -Math.abs(Math.cos(degToRad(itemAngle)) * r)
          : Math.abs(Math.cos(degToRad(itemAngle)) * r);
        const y = -Math.sin(degToRad(itemAngle)) * r;
        const point = getIntersectionPoint({
          x: Math.round(x),
          y: Math.round(y),
          width: rootWidth,
          height: rootHeight,
        });
        return {
          ...node,
          x: Math.round(x),
          y: Math.round(y),
          r: r,
          anchorPoint: point,
          angle: itemAngle,
        };
      });
      return nodes;
    },
    setNodesPosition2(
      nodes,
      r,
      angle,
      flag,
      offsetAngle,
      rootWidth = 128,
      rootHeight = 60
    ) {
      if (nodes.length === 1) {
        nodes[0].x = flag ? -r : r;
        nodes[0].y = 0;
        nodes[0].anchorPoint = flag
          ? { x: -rootWidth / 2, y: 0, lineType: "can-running-horizontal" }
          : { x: rootWidth / 2, y: 0, lineType: "can-running-horizontal" };
        return nodes;
      } else if (nodes.length <= 5) {
        offsetAngle = 180 / (nodes.length + 1);
      }
      angle = this.getItemAngle(offsetAngle, nodes.length);
      let startAngle = flag ? 270 - offsetAngle : 270 + offsetAngle;
      nodes = nodes.map((node, index) => {
        let itemAngle = startAngle - index * angle;
        let r2 = r;
        if (nodes.length > 10 && index % 2 === 1) {
          r2 = r - 52;
        }
        if (nodes.length > 30) {
          const increment = 45 / r / 1.8;
          const cycleArr = this.getCycleArr(
            Math.floor(nodes.length / 7),
            increment,
            1
          );
          r2 = this.randomOffsetR(r, index, cycleArr);
        }
        if (!flag) {
          itemAngle = startAngle + index * angle;
        }
        const x = flag
          ? -Math.abs(Math.cos(degToRad(itemAngle)) * r2)
          : Math.abs(Math.cos(degToRad(itemAngle)) * r2);
        const y = -Math.sin(degToRad(itemAngle)) * r2;
        const point = getIntersectionPoint({
          x: Math.round(x),
          y: Math.round(y),
          width: rootWidth,
          height: rootHeight,
        });
        return {
          ...node,
          x: Math.round(x),
          y: Math.round(y),
          r: r2,
          anchorPoint: point,
          angle: itemAngle,
        };
      });
      return nodes;
    },
    getCycleArr(length, increment) {
      const arr = [];
      // 递增
      // const startR = 1 - length * increment
      // for (let i = 0; i < length; i++) {
      //     if (type === 1) {
      //         arr.push(startR + i * increment)
      //     }
      // }
      // 先增后减
      const startR = 1 - (length * increment) / 2;
      const middleIndex = Math.floor(length / 2) + 1;
      const max = startR + middleIndex * increment;
      for (let i = 0; i < length; i++) {
        if (i <= middleIndex) {
          arr.push(startR + i * increment);
        } else {
          arr.push(max - (i - middleIndex) * increment);
        }
      }
      return arr;
    },
    randomOffsetR(
      r,
      index,
      cycleArr = [0.92, 0.93, 0.94, 0.95, 0.97, 0.99, 1, 0.98, 0.96, 0.94]
    ) {
      const cycle = cycleArr.length;
      r = r * cycleArr[index % cycle];
      return r * cycleArr[index % cycle];
    },
    getTotalLayerNum(
      total,
      itemWidth,
      offsetAngle,
      startRadius,
      radiusIncrement
    ) {
      // const itemNum = this.getItemNumByRadius(r, itemWidth, offsetAngle, 0.5 + i * 0.03)
      let layerNum = 0;
      let nodeNum = 0;
      while (nodeNum < total) {
        const r = startRadius + radiusIncrement * layerNum;
        nodeNum += this.getItemNumByRadius(
          r,
          itemWidth,
          offsetAngle,
          0.5 + layerNum * 0.03
        );
        layerNum++;
      }
      return layerNum++;
    },
    getTotalByLayerNum(
      layerNum,
      itemWidth,
      offsetAngle,
      startRadius,
      radiusIncrement
    ) {
      let initLayerNum = 0;
      let nodeNum = 0;
      while (nodeNum < layerNum) {
        const r = startRadius + radiusIncrement * initLayerNum;
        nodeNum += this.getItemNumByRadius(
          r,
          itemWidth,
          offsetAngle,
          0.5 + initLayerNum * 0.03
        );
        initLayerNum++;
      }
      return nodeNum;
    },
    onResize() {
      const g6Container = this.getGraphRef();
      if (!g6Container) {
        return;
      }
      this.graph?.changeSize(g6Container.clientWidth, g6Container.clientHeight);
    },
    getGraphRef() {
      return this.$refs[this.graphRef];
    },
  },
};
