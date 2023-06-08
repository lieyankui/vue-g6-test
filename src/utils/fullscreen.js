/**
 * @Author       : heyongkui
 * @Date         : 2023-04-10 11:13:32
 * @Descripttion : 全屏工具文件
 */
import screenfull from "screenfull";

function Fullscreen(el) {
  if (!el || !el.appendChild) {
    return;
  }
  this.$el = el;
  Object.defineProperty(this, "isFullscreen", {
    get: function () {
      return screenfull.isFullscreen;
    },
  });
  Object.defineProperty(this, "isEnabled", {
    get: function () {
      return screenfull.isEnabled;
    },
  });
}
Fullscreen.prototype = {
  request: function () {
    return screenfull.request(this.$el);
  },
  release: function () {
    return screenfull.exit();
  },
  exit: function () {
    return screenfull.exit();
  },
  toggle: function () {
    return screenfull.toggle(this.$el);
  },
  onchange: function (cb) {
    screenfull.onchange(cb);
  },
  onerror: function (cb) {
    screenfull.onerror(cb);
  },
};

export function getFsObj(el) {
  return new Fullscreen(el);
}

export default screenfull;
