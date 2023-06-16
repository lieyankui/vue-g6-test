import ResizeObserver from "resize-observer-polyfill";

export function getStyle(el, key) {
  const style = window.getComputedStyle
    ? window.getComputedStyle(el, null)
    : el.currentStyle;
  return key ? style[key] : style;
}

export function toInt(num, defaultValue = 0) {
  const intNum = parseInt(num);
  return !isNaN(intNum) ? intNum : defaultValue;
}

export function getResizeObserver(el, fn) {
  if (!el.__ro__) {
    el.__ro__ = new ResizeObserver(() => {
      if (Object.prototype.toString.call(fn) === "[object Function]") {
        fn && fn();
      }
    });
    el.__ro__.observe(el);
  }
  return () => {
    el.__ro__.disconnect();
  };
}
