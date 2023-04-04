import { createGraph } from "@/utils/g6";
export default {
  data() {
    return {
      graphRef: "graphRef",
      graph: null,
    };
  },
  methods: {
    initGraph(graphOptions = {}) {
      const g6Container = this.getGraphRef();
      this.graph = createGraph({
        container: g6Container,
        width: g6Container.clientWidth,
        height: g6Container.clientHeight,
        ...graphOptions,
      });
    },
    getGraphRef() {
      return this.$refs[this.graphRef];
    },
  },
};
