<template>
  <div class="comp-container" :ref="graphRef"></div>
</template>
<script>
import G6Mixins from "@/mixins/g6";
export default {
  name: "g6-test",
  mixins: [G6Mixins],
  data() {
    return {
      graphData: {
        // 点集
        nodes: [
          {
            id: "node1",
            x: 100,
            y: 200,
          },
          {
            id: "node2",
            x: 300,
            y: 200,
          },
        ],
        // 边集
        edges: [
          // 表示一条从 node1 节点连接到 node2 节点的边
          {
            source: "node1",
            target: "node2",
          },
        ],
      },
    };
  },
  mounted() {
    this.init();
  },
  methods: {
    init() {
      this.initGraph();
      this.graph.data(this.graphData);
      this.graph.render();
    },
    getGraphRef() {
      return this.$refs[this.graphRef];
    },
  },
};
</script>
<style lang="scss">
.comp-container {
  width: 100%;
  height: 100%;
  box-sizing: border-box;
  canvas {
    display: block;
  }
}
</style>
