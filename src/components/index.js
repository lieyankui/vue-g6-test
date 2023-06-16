import MultiRow from "./multi-row/index.vue";
export default {
  install(vue) {
    console.log("注册components中的组件", MultiRow.name);
    vue.component(MultiRow.name, MultiRow);
  },
};
