import Vue from "vue";
import Antd from "ant-design-vue";
import "normalize.css/normalize.css";
import "ant-design-vue/dist/antd.css";
import "animate.css/animate.css";
import "@/assets/scss/index.scss";
import echarts from "echarts";
import App from "./App.vue";
import router from "./router";
import store from "./store";
import Comps from "@/components/index";
Vue.use(Comps);
Vue.config.productionTip = false;
Vue.use(Antd);
Vue.prototype.$echarts = echarts;

new Vue({
  router,
  store,
  render: (h) => h(App),
}).$mount("#app");
