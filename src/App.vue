<template>
  <div id="app">
    <transition name="app" appear>
      <router-view />
    </transition>
  </div>
</template>

<style lang="scss">
#app {
  box-sizing: border-box;
  width: 100%;
  height: 100%;
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  // text-align: center;
  color: #2c3e50;
  overflow: hidden;
}

nav {
  padding: 30px;

  a {
    font-weight: bold;
    color: #2c3e50;

    &.router-link-exact-active {
      color: #42b983;
    }
  }
}
.app-enter-active {
  animation: fadeInDown 2s;
}
.app-leave-active {
  animation: fadeOutDown 2s;
}
@keyframes move {
  0% {
    opacity: 0;
    transform: translateX(-100%);
  }
  60% {
    opacity: 0;
  }
  100% {
    opacity: 1;
    transform: translateX(0);
  }
}
</style>
