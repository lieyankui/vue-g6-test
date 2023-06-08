import Vue from "vue";
import VueRouter from "vue-router";
// import HomeView from "../views/HomeView.vue";

Vue.use(VueRouter);

const routes = [
  // {
  //   path: "/home",
  //   name: "home",
  //   component: HomeView,
  // },
  // {
  //   path: "/about",
  //   name: "about",
  //   // route level code-splitting
  //   // this generates a separate chunk (about.[hash].js) for this route
  //   // which is lazy-loaded when the route is visited.
  //   component: () =>
  //     import(/* webpackChunkName: "about" */ "../views/AboutView.vue"),
  // },
  {
    path: "/g6-test",
    name: "g6-test",
    component: () =>
      import(/* webpackChunkName: "about" */ "../views/g6-test.vue"),
  },
  { path: "/", redirect: "/g6-test" },
  {
    path: "",
    redirect: "g6-test",
  },
];

const router = new VueRouter({
  mode: "history",
  base: process.env.BASE_URL,
  routes,
});

export default router;
