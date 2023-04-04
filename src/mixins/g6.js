import { createGraph } from "@/utils/g6";
import { debounce } from "lodash";
export default {
  data() {
    return {
      graphRef: "graphRef",
      graph: null,
    };
  },
  mounted() {
    this.initGraph();
    this._onResize = debounce(this.onResize, 300);
    window.addEventListener("resize", () => {
      this._onResize();
    });
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
    onResize() {
      if (!this.graph || !this.graph.get("destroyed")) {
        return;
      }
      const g6Container = this.getGraphRef();
      if (
        !g6Container ||
        !g6Container.clientWidth ||
        !g6Container.clientHeight
      ) {
        return;
      }
      this.graph.changeSize(g6Container.clientWidth, g6Container.clientHeight);
    },
    getGraphRef() {
      return this.$refs[this.graphRef];
    },
  },
};
