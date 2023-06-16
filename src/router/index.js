import Vue from "vue";
import VueRouter from "vue-router";
import _importAsync from "./_import";

Vue.use(VueRouter);

const routes = [
  {
    path: "/g6-test",
    name: "g6-test",
    component: _importAsync("g6-test"),
  },
  {
    path: "/g6-dagre",
    name: "g6-dagre",
    component: _importAsync("g6-test-dagre"),
  },
  {
    path: "/layout",
    name: "layout",
    component: _importAsync("layout/index"),
  },
  { path: "/", redirect: "/g6-test" },
];

const router = new VueRouter({
  mode: "history",
  base: process.env.BASE_URL,
  routes,
});

export default router;
