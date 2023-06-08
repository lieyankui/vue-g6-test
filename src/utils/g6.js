import G6 from "@antv/g6";

const lineDash = [4, 2, 1, 2];

export function createGraph(g6Option) {
  return new G6.Graph(g6Option);
}
export function registerNode(...params) {
  G6.registerNode(...params);
}
// 根据中心点获取起点坐标
export function getStartPoint(centerPoint, width, height) {
  return {
    x: centerPoint.x - parseFloat(width) / 2,
    y: centerPoint.y - parseFloat(height) / 2,
  };
}
// 根据节点宽高获取对角线一半的长度
export function getRectRadius(width, height) {
  return Math.sqrt(
    Math.pow(parseFloat(width) / 2, 2) + Math.pow(parseFloat(height) / 2, 2)
  );
}
// 根据节点宽高获取对角线的长度
export function getRectDiameter(width, height) {
  return 2 * getRectRadius(width, height);
}
// 角度转弧度
export function degToRad(deg) {
  return deg * (Math.PI / 180);
}
// 弧度转角度
export function radToDeg(rad) {
  return rad * (180 / Math.PI);
}
// 获取周围节点应该距离中心点的半径
export function getRadiusByDiameter(diameter, nodeNum) {
  const rad = degToRad(180 / ((nodeNum + 1) * 2));
  return diameter / 2 / Math.sin(rad);
}
export function changeToG6Position({ x, y }) {
  return { x, y: -y };
}
export default G6;

/**
 * format the string
 * @param {string} str The origin string
 * @param {number} maxWidth max width
 * @param {number} fontSize font size
 * @return {string} the processed result
 */
export function fittingString(str, maxWidth, fontSize) {
  let currentWidth = 0;
  let res = str;
  const pattern = new RegExp("[\u4E00-\u9FA5]+"); // distinguish the Chinese charactors and letters
  const rowArr = [];
  let startIndex = 0;
  // 获取字符下标对应的宽度
  for (let i = 0, length = str.length; i < length; i++) {
    const letter = str[i];
    if (pattern.test(letter)) {
      currentWidth += fontSize;
    } else {
      currentWidth += G6.Util.getLetterWidth(letter, fontSize);
    }
    if (i === str.length - 1 && currentWidth <= maxWidth) {
      rowArr.push(str.substring(startIndex));
      break;
    }
    if (currentWidth > maxWidth) {
      const endIndex = i - 1;
      rowArr.push(str.substring(startIndex, endIndex));
      currentWidth = 0;
      startIndex = endIndex;
      i--;
    }
  }
  if (rowArr.length > 2 || (rowArr.length === 2 && rowArr[1].length > 7)) {
    rowArr[1] = rowArr[1].substring(0, rowArr[1].length - 2) + "...";
  }
  res = rowArr.slice(0, 2).join("\n");
  return res;
}

export function lineInit(edge, color) {
  if (!edge || !edge.stopAnimate) {
    return;
  }
  edge.stopAnimate();
  edge.attr("lineDash", null);
  edge.attr("stroke", color);
  edge.attr("lineWidth", 1);
  edge.attr("endArrow", {
    path: G6.Arrow.vee(8, 8),
    fill: color,
  });
}
export function lineAnimate(edge, color) {
  if (!edge || !edge.stopAnimate) {
    return;
  }
  let index = 0;
  edge.animate(
    () => {
      index++;
      if (index > 9) {
        index = 0;
      }
      const res = {
        lineDash,
        lineDashOffset: -index,
        stroke: color,
        lineWidth: 2,
        endArrow: {
          path: G6.Arrow.vee(8, 8),
          fill: color,
        },
      };
      return res;
    },
    {
      repeat: true,
      duration: 3000,
    }
  );
}
export function setEdgeHoverStyle(graph, edge, state, flag, color) {
  graph.updateItem(edge, {
    // 节点上文本的样式
    labelCfg: {
      // autoRotate: false,
      // refX: 15,
      style: {
        // lineHeight: 22,
        background: {
          // fill: "#FFFFFF",
          stroke: color,
          // lineWidth: 2,
          padding: [8, 8, 6, 8],
          // radius: 4,
        },
      },
    },
  });
  graph.setItemState(edge, state, flag);
}

/**
 * 获取外层节点和根节点的连线与根节点的边的交点
 * 参数外层节点坐标和根节点的宽高
 * 返回值为外层节点和根节点的连线与根节点的边的交点坐标和交点方向 vertical 代表竖直方向 horizontal 代表水平方向
 */
export function getIntersectionPoint({ x, y, width, height }) {
  const xf = x / Math.abs(x);
  const yf = y / Math.abs(y);
  if (x === 0) {
    return {
      x: 0,
      y: (yf * height) / 2,
      pointPosition: "vertical",
    };
  }
  if (y === 0) {
    return {
      y: 0,
      x: (xf * width) / 2,
      pointPosition: "horizontal",
    };
  }
  const k = Math.abs(y / x);
  const k2 = Math.abs(height / 2 / (width / 2));
  return {
    x: xf * (k >= k2 ? height / 2 / k : width / 2),
    y: yf * (k >= k2 ? height / 2 : (width / 2) * k),
    pointPosition: k > k2 ? "vertical" : "horizontal",
  };
}

export function getRandomNum(range, start = 0, upFLag = true) {
  return start + upFLag
    ? Math.ceil(Math.random() * range)
    : Math.floor(Math.random() * range);
}
export function generateNodes(type = "up", num = 30) {
  if (type === "root") {
    return [
      {
        id: type,
        nodeId: type,
        nodeFlag: type,
        name: "中心节点",
        tags: "aaa,bbb,cccc,dddd,eee,ffff,gggg,hhh,iiii,jjjjj,kkkk,llll,mmmmm",
        level: getRandomNum(4),
      },
    ];
  }
  const arr = [];
  for (let i = 0; i < num; i++) {
    arr.push({
      id: `${type}-${i}`,
      nodeId: `${type}-${i}`,
      nodeFlag: `${type}-${i}`,
      name: `${type === "up" ? "上游" : "下游"}节点${i}`,
      lineLabel: `${type === "up" ? "上游" : "下游"}节点${i}`,
      lineNum: getRandomNum(100),
      tags: "aaa,bbb,cccc,dddd,eee,ffff,gggg,hhh,iiii,jjjjj,kkkk,llll,mmmmm",
      level: getRandomNum(4),
    });
  }
  return arr;
}
